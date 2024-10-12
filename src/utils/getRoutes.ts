import fs from "fs";
import {
  Route,
  RouteDocs,
  Routes,
} from "../interfaces/api_routes_interfaces.js";

function getRoutesFromFile(content: string) {
  return content
    .match(
      /(?:(?:\/\*\*(?<docstring>(?:.|\s)*?)\*\/\s+)|)router\.(?<method>get|post|put|delete|patch)\((?:\n|\s)*?['"](?<path>.+)['"]/g
    )
    ?.map((e) => {
      const match =
        /(?:(?:\/\*\*(?<docstring>(?:.|\s)*?)\*\/\s+)|)router\.(?<method>get|post|put|delete|patch)\((?:\n|\s)*?['"](?<path>.+)['"]/.exec(
          e
        );

      if (!match) return { method: "", path: "", docs: null };

      const res: Route = {
        method: match.groups?.method ?? "",
        path: match.groups?.path ?? "",
        docs: null,
      };

      if (match.groups?.docstring) {
        const docs: RouteDocs = {
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

        const docString = match.groups.docstring
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
                  /@(?<tag>param|query|body) (?<name>\w+) \((?<options>.*?)\) - (?<description>.+)/.exec(
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
                    data.required =
                      option.replace(/^required/, "").trim() || true;
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
              console.log(row);
              const match = /@response (?<status>\d+)/.exec(row)?.groups;

              if (!match) continue;

              docs.response.status = parseInt(match.status);

              break;

            case "returns": {
              const match =
                /@returns \{(?<body>.+)\} - (?<description>.+)/.exec(
                  row
                )?.groups;

              if (!match) continue;

              docs.response.body = match.body;
              docs.response.description = match.description;
            }
          }
        }

        res.docs = docs;
      }

      return res;
    });
}

function getImportStatements(content: string) {
  return Object.fromEntries(
    content
      .match(
        /(?:(import (.+?) from ['"]\.\/routes\/(.+?)['"]))|(?:const (.+?) = lazyLoad\(\(\) => import\(['"]\.\/routes\/(.+?)['"]\)\))/g
      )
      ?.map((e) => {
        const match =
          /(?:import (?<name1>.+?) from ['"]\.\/routes\/(?<path1>.+?)['"])|(?:const (?<name2>.+?) = lazyLoad\(\(\) => import\(['"]\.\/routes\/(?<path2>.+?)['"]\)\))/.exec(
            e
          )?.groups;

        if (!match) return [];

        return [
          match.name1 ?? match.name2,
          (match.path1 ?? match.path2)
            .replace(/\.js$/, "")
            .replace(/\/index$/, ""),
        ];
      }) ?? []
  );
}

function getUseRoutes(content: string, dir: string) {
  const children = Object.fromEntries(
    fs.readdirSync(`${dir}/routes`).map((child) => {
      if (fs.lstatSync(`${dir}/routes/${child}`).isDirectory()) {
        return [child, getRoutes(`${dir}/routes/${child}`)];
      }

      const childrenFileContent = fs.readFileSync(
        `${dir}/routes/${child}`,
        "utf8"
      );
      const childrenMatches = getRoutesFromFile(childrenFileContent);
      return [child.replace(/\.ts$/, ""), childrenMatches];
    })
  );

  const importStatements = getImportStatements(content);

  return content
    .match(/router\.use\((?:\n|\s)*?['"](.+)['"],(?:\n|\s)+(.*?)(?:\n|\s)*?\)/g)
    ?.map((e) => {
      const match =
        /router\.use\((?:\n|\s)*?['"](.+)['"],(?:\n|\s)+(.*?)(?:\n|\s)*?\)/.exec(
          e
        );

      if (!match) return { path: "", children: [] };

      return {
        path: match[1],
        children: children[importStatements[match[2]]],
      };
    });
}

function getRoutes(dir: string, file = "index.ts") {
  let routes: Routes = {
    topLevel: [],
    use: [],
  };

  const indexFileContent = fs.readFileSync(`${dir}/${file}`, "utf8");

  const topLevelRoutesMatches = getRoutesFromFile(indexFileContent);

  if (topLevelRoutesMatches) {
    routes.topLevel.push(...topLevelRoutesMatches);
  }

  if (!fs.existsSync(`${dir}/routes`)) return routes;

  const useRoutesMatches = getUseRoutes(indexFileContent, dir);

  if (useRoutesMatches) {
    routes.use.push(...useRoutesMatches);
  }

  return routes;
}

function flattenRoutes(routes: Routes) {
  return [
    ...routes.topLevel,
    ...routes.use.flatMap((e): Route[] =>
      e.children
        ? Array.isArray(e.children)
          ? e.children.map((c) => ({
              ...c,
              path: `${e.path}/${c.path}`.replace(/\/\//g, "/"),
            }))
          : flattenRoutes(e.children).map((c) => ({
              ...c,
              path: `${e.path}/${c.path}`.replace(/\/\//g, "/"),
            }))
        : []
    ),
  ].map((e) => ({
    path: e.path.replace(/\/$/g, ""),
    method: e.method.toUpperCase(),
    docs: e.docs,
  }));
}

export { getRoutes, flattenRoutes };
