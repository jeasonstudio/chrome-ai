import { PolyfillChromeAI } from './session';

const ai = new PolyfillChromeAI(globalThis.__polyfill_ai_options__);
globalThis.ai = globalThis.ai || ai;
globalThis.model = globalThis.model || ai;
