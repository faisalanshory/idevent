import type { IPaymentService } from "./types";
import { MockPaymentService } from "./mock";

export type { IPaymentService, PaymentMethod, CreatePaymentInput, PaymentResult, WebhookValidationResult, PaymentProvider } from "./types";

let _paymentService: IPaymentService | null = null;

export function getPaymentService(): IPaymentService {
  if (_paymentService) return _paymentService;

  const provider = process.env.PAYMENT_PROVIDER?.toUpperCase() || "MOCK";

  switch (provider) {
    case "MOCK":
    default:
      _paymentService = new MockPaymentService();
      return _paymentService;
    // Future: MIDTRANS, XENDIT
  }
}
