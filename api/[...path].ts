import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const serverModule = require("../dist/server.cjs") as {
  default: import("express").Express;
};

export default serverModule.default;
