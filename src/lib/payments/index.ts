import { kora } from "./kora";
import type { PaymentProvider, ProviderName } from "./types";

export function getActiveProviderName(): ProviderName {
  return "kora";
}

export function getProvider(name: ProviderName): PaymentProvider {
  if (name === "kora") return kora;
  throw new Error(`Unknown payment provider: ${name}`);
}