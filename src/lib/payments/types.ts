export type ProviderName = "kora";

export type InitializeInput = {
  reference: string;
  amountKobo: number;
  email: string;
  name: string;
  callbackUrl: string;
};

export type VerifyResult = {
  status: "success" | "failed" | "pending";
  amountKobo: number;
};

export interface PaymentProvider {
  name: ProviderName;
  initialize(input: InitializeInput): Promise<{ checkoutUrl: string }>;
  verify(reference: string): Promise<VerifyResult>;
}