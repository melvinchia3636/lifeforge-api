import { IRouteDocs } from "../interfaces/api_routes_interfaces.js";

export default function parseRouteDocs(raw: string): IRouteDocs {
  const docs: IRouteDocs = {
    summary: "",
    description: "",
    access: "private",
    params: [],
    query: [],
    body: [],
    response: {
      status: 200,
      description: "",
      body: "",
    },
  };

  const docString = raw
    .trim()
    .split("\n")
    .map((e) => e.trim().replace(/^\*\s+/, ""));

  for (let row of docString) {
    const match = /^@(\w+)/.exec(row);
    if (!match) continue;
    const tag = match[1];

    switch (tag) {
      case "summary":
        docs.summary = row.replace(/^@summary\s+/, "");
        break;
      case "description":
        docs.description = row.replace(/^@description\s+/, "");
        break;
      case "protected":
        docs.access = "protected";
        break;
      case "private":
        docs.access = "private";
        break;
      case "public":
        docs.access = "public";
        break;
      case "param":
      case "query":
      case "body":
        {
          const match =
            /@(?<tag>param|query|body) (?<name>\w*?) \((?<options>.*?)\) - (?<description>.+)/.exec(
              row
            )?.groups;

          if (!match) continue;

          const data = {
            name: match.name,
            type: "",
            required: false as boolean | string,
            must_exist: false,
            options: [] as string[],
            description: match.description,
          };

          const options = match.options.split(",").map((e) => e.trim());

          data.type = options.shift() ?? "";

          for (const option of options) {
            if (option.startsWith("required")) {
              data.required = option.replace(/^required/, "").trim() || true;
            }

            if (option === "optional") {
              data.required = false;
            }

            if (option === "must_exist") {
              data.must_exist = true;
            }

            if (option.startsWith("one_of")) {
              data.options = option
                .replace(/^one_of\s+/, "")
                .split("|")
                .map((e) => e.trim());
            }
          }

          if (match.tag === "param") {
            docs.params.push(data);
          }

          if (match.tag === "query") {
            docs.query.push(data);
          }

          if (match.tag === "body") {
            docs.body.push(data);
          }
        }
        break;

      case "response":
        const match =
          /@response (?<status>\d+)(?: \((?<body>.*?)\))? - (?<description>.+)/.exec(
            row
          )?.groups;

        if (!match) continue;

        docs.response.status = parseInt(match.status);
        docs.response.body = match.body ?? "";
        docs.response.description = match.description;

        break;
    }
  }

  return docs;
}
