import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const PROMPT_PATH = join(process.cwd(), 'app', 'api', 'glados', 'prompt.md');

/** GLaDOS system prompt — edit `prompt.md`; this file only loads it. */
export const SYSTEM_PROMPT = readFileSync(PROMPT_PATH, 'utf8').trimEnd();
