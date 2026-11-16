import type { PaymentProvider, ProviderName } from "./types";
import { paystack } from "./paystack";

// Add Kora here later: const providers = { paystack, kora };
const providers: Partial<Record<ProviderName, PaymentProvider>> = {
  paystack,
};

export function getActiveProviderName(): ProviderName {
  return process.env.PAYMENT_PROVIDER === "kora" ? "kora" : "paystack";
}

export function getProvider(name: ProviderName): PaymentProvider {
  const provider = providers[name];
  if (!provider) {
    throw new Error(`Payment provider "${name}" is not set up yet`);
  }
  return provider;
}