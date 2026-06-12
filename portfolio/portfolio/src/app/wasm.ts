// ─────────────────────────────────────────────────────────────
//  portfolio.wasm  —  compiled from WebAssembly Text (WAT)
//  which mirrors C-style logic (like water_scheduler.c).
//  Functions: months_experience · skill_score · hash2 · clamp · grade_stars
// ─────────────────────────────────────────────────────────────

const WASM_B64 = "AGFzbQEAAAABGwRgAn9/AX9gAX8Bf2ADf39/AX9gBH9/f38BfwMGBQMAAAIBBQMBAAEHSgYGbWVtb3J5AgARbW9udGhzX2V4cGVyaWVuY2UAAAtza2lsbF9zY29yZQABBWhhc2gyAAIFY2xhbXAAAwtncmFkZV9zdGFycwAECrsBBRAAIAIgAGtBDGwgAyABa2oLGgEBfyAAQbHz3fF5bCABakEocCECIAJBPGoLMAEBf0GFKiECIAJBBXQgAmogAGohAiACQQV0IAJqIAFqIQIgAkH/////B3FB6AJwCxwAIAEgACAAIAFIGyACIAEgACAAIAFIGyACSBsLPwEBf0EAIQEgAEGEB04EQEEFIQELIABBhAdIIABBoAZOcQRAQQQhAQsgAEGgBkggAEG8BU5xBEBBAyEBCyABCw==";

function b64ToBytes(b64: string): Uint8Array {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

export interface WasmExports {
  months_experience: (sy: number, sm: number, cy: number, cm: number) => number;
  skill_score:       (seed: number, base: number) => number;
  hash2:             (x: number, y: number) => number;
  clamp:             (v: number, lo: number, hi: number) => number;
  grade_stars:       (scoreTimes10: number) => number;
  memory:            WebAssembly.Memory;
}

let _exports: WasmExports | null = null;

export async function loadWasm(): Promise<WasmExports> {
  if (_exports) return _exports;
  const bytes = b64ToBytes(WASM_B64);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result: any = await WebAssembly.instantiate(bytes.buffer, {});
  _exports = result.instance.exports as unknown as WasmExports;
  return _exports;
}
