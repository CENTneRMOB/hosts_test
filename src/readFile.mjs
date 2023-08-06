import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const filename = fileURLToPath(import.meta.url);

const getPath = (fileName) => path.join(fileName);

export default async function (filepath) {
  return readFile(getPath(filepath), 'utf-8');
};
