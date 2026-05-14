import { computeEntropy } from "./entropy";

const BATCH_SIZE = 15;
// DedicatedWorkerGlobalScope lives in lib.webworker, not lib.dom.
// Declare it locally so this file type-checks under the project's DOM-only tsconfig.
// At runtime this file runs in an actual worker scope, so the cast is safe.
type DedicatedWorkerGlobalScope = typeof globalThis & {
  onmessage: ((this: DedicatedWorkerGlobalScope, ev: MessageEvent) => unknown) | null;
  postMessage(message: unknown, transfer?: Transferable[]): void;
};
const workerScope = self as unknown as DedicatedWorkerGlobalScope;

workerScope.onmessage = (e: MessageEvent) => {
  if (e.data.type !== "compute") return;

  const words: string[] = e.data.words;
  const batch: [string, number][] = [];

  for (let i = 0; i < words.length; i++) {
    batch.push([words[i], computeEntropy(words[i], words)]);

    if (batch.length >= BATCH_SIZE || i === words.length - 1) {
      workerScope.postMessage({ type: "batch", scores: [...batch] });
      batch.length = 0;
    }
  }

  workerScope.postMessage({ type: "done" });
};
