import { register } from "node:module";
import { pathToFileURL } from "node:url";

register(new URL("./ts-bare-specifiers.hooks.mjs", import.meta.url), pathToFileURL("./"));
