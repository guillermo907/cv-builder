import { randomUUID } from "node:crypto";

export type PaymentProviderKey = "MERCADO_PAGO" | "PAYPAL" | "STRIPE_CONNECT_MX";

export type ProviderCheckoutRequest = {
  provider: PaymentProviderKey;
  idempotencyKey: string;
  amountMXN: number;
  description: string;
  payerEmail?: string;
  metadata?: Record<string, unknown>;
};

export type ProviderCheckoutResult = {
  provider: PaymentProviderKey;
  status: "APPROVED" | "PENDING" | "FAILED";
  providerReference: string;
  providerChargeId: string;
  processorFeeAmount: number;
  rawResponse: Record<string, unknown>;
};

function mockApprovedResult(
  provider: PaymentProviderKey,
  amountMXN: number,
  idempotencyKey: string,
): ProviderCheckoutResult {
  const processorFeeAmount = Number((amountMXN * 0.036 + 4).toFixed(2));

  return {
    provider,
    status: "APPROVED",
    providerReference: `${provider}-${idempotencyKey}`,
    providerChargeId: randomUUID(),
    processorFeeAmount,
    rawResponse: {
      mode: "stub",
      approvedAt: new Date().toISOString()
    }
  };
}

async function runMercadoPagoCheckout(
  input: ProviderCheckoutRequest,
): Promise<ProviderCheckoutResult> {
  return mockApprovedResult("MERCADO_PAGO", input.amountMXN, input.idempotencyKey);
}

async function runPayPalCheckout(input: ProviderCheckoutRequest): Promise<ProviderCheckoutResult> {
  return mockApprovedResult("PAYPAL", input.amountMXN, input.idempotencyKey);
}

async function runStripeConnectMxCheckout(
  input: ProviderCheckoutRequest,
): Promise<ProviderCheckoutResult> {
  return mockApprovedResult("STRIPE_CONNECT_MX", input.amountMXN, input.idempotencyKey);
}

export async function executeProviderCheckout(
  input: ProviderCheckoutRequest,
): Promise<ProviderCheckoutResult> {
  switch (input.provider) {
    case "MERCADO_PAGO":
      return runMercadoPagoCheckout(input);
    case "PAYPAL":
      return runPayPalCheckout(input);
    case "STRIPE_CONNECT_MX":
      return runStripeConnectMxCheckout(input);
    default:
      throw new Error(`Unsupported provider: ${String(input.provider)}`);
  }
}
