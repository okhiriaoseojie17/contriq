export type ProviderName = "kora" | "paystack";

export type InitializeInput = {
  reference: string;
  amountKobo: number;
  email: string;
  name: string;
  callbackUrl: string;
};

export type InitializeResult = {
  checkoutUrl: string;
};

export type VerifyResult = {
  reference: string;
  status: "success" | "failed" | "pending";
  amountKobo: number;
};

export type WebhookEvent = {
  reference: string;
  paid: boolean;
};

export interface PaymentProvider {
  name: ProviderName;
  // Ask the provider for a checkout link for this payment.
  initialize(input: InitializeInput): Promise<InitializeResult>;
  // Ask the provider for the real status of a reference.
  verify(reference: string): Promise<VerifyResult>;
  // Check the webhook really came from the provider (signature).
  verifyWebhookSignature(rawBody: string, signature: string | null): boolean;
  // Turn the provider's webhook JSON into our simple shape.
  parseWebhook(rawBody: string): WebhookEvent | null;
}