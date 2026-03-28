import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const currentFile = fileURLToPath(import.meta.url);
const projectRoot = path.resolve(path.dirname(currentFile), '..');
const entityDir = path.join(projectRoot, 'entites');
const outputFile = path.join(projectRoot, 'cloudflare-backend', 'src', 'entitySchemas.generated.js');

const files = fs.readdirSync(entityDir).filter((file) => !file.startsWith('.')).sort();
const registry = {};

for (const file of files) {
  const fullPath = path.join(entityDir, file);
  const raw = fs.readFileSync(fullPath, 'utf8');
  registry[file] = JSON.parse(raw);
}

const output = `export const ENTITY_SCHEMAS = ${JSON.stringify(registry, null, 2)};\n`;
fs.writeFileSync(outputFile, output, 'utf8');

console.log(`Generated ${Object.keys(registry).length} entity schemas at ${outputFile}`);
