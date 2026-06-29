import { copyFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const source = resolve("src/data/live-deals.json");
const target = resolve("public/data/live-deals.json");

await mkdir(dirname(target), { recursive: true });
await copyFile(source, target);

console.log(`Copied ${source} to ${target}`);
