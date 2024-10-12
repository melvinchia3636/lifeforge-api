interface RouteDocs {
  summary: string;
  description: string;
  access: "public" | "protected" | "private";
  params: {
    name: string;
    type: string;
    required: boolean | string;
    options?: string[];
    must_exist?: boolean;
    description: string;
  }[];
  query: {
    name: string;
    type: string;
    required: boolean | string;
    options?: string[];
    description: string;
  }[];
  body: {
    name: string;
    type: string;
    required: boolean | string;
    options?: string[];
    description: string;
  }[];
  response: {
    status: number;
    description: string;
    body: string;
  };
}

interface Route {
  method: string;
  path: string;
  description?: string;
  docs: RouteDocs | null;
}

interface Routes {
  topLevel: Route[];
  use: {
    path: string;
    children: Routes | Route[];
  }[];
}

export { Route, RouteDocs, Routes };
