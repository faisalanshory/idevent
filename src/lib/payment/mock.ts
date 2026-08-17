import type { IPaymentService, PaymentMethod, CreatePaymentInput, PaymentResult, WebhookValidationResult } from "./types";

// Mock payment service for development/testing
// No external API calls required
export class MockPaymentService implements IPaymentService {
  getProvider() {
    return "MOCK" as const;
  }

  getAvailablePaymentMethods(): PaymentMethod[] {
    return [
      { id: "qris", name: "QRIS", category: "qris" },
      { id: "bca_va", name: "BCA Virtual Account", category: "virtual_account" },
      { id: "bni_va", name: "BNI Virtual Account", category: "virtual_account" },
      { id: "bri_va", name: "BRI Virtual Account", category: "virtual_account" },
      { id: "mandiri_va", name: "Mandiri Virtual Account", category: "virtual_account" },
      { id: "gopay", name: "GoPay", category: "ewallet" },
      { id: "ovo", name: "OVO", category: "ewallet" },
      { id: "dana", name: "DANA", category: "ewallet" },
      { id: "shopeepay", name: "ShopeePay", category: "ewallet" },
    ];
  }

  async createPayment(input: CreatePaymentInput): Promise<PaymentResult> {
    // Simulate slight delay like a real API
    await new Promise(r => setTimeout(r, 300));

    const mockTxId = `MOCK-${input.orderId}-${Date.now()}`;
    const expiredAt = new Date(Date.now() + (input.expiryMinutes || 60) * 60 * 1000);

    const result: PaymentResult = {
      providerTransactionId: mockTxId,
      paymentMethod: input.paymentMethod,
      status: "PENDING",
      expiredAt,
      rawResponse: JSON.stringify({
        mock: true,
        orderId: input.orderId,
        amount: input.amount,
        method: input.paymentMethod,
        txId: mockTxId,
      }),
    };

    // Populate method-specific fields
    if (input.paymentMethod === "qris") {
      result.qrString = `00020101021226630014ID.CO.MOCK.WWW011893600914${mockTxId}0215ID2026${input.orderId}5204599953033605${String(Math.round(input.amount)).padStart(12, '0')}6304ABCD`;
    } else if (input.paymentMethod.endsWith("_va")) {
      const bankCode = input.paymentMethod.replace("_va", "").toUpperCase();
      result.vaNumber = `${bankCode}${String(Math.floor(Math.random() * 9000000000) + 1000000000)}`;
    } else if (["gopay", "ovo", "dana", "shopeepay"].includes(input.paymentMethod)) {
      result.redirectUrl = `https://mock-payment.idevent.dev/pay/${mockTxId}`;
    }

    return result;
  }

  async getPaymentStatus(providerTransactionId: string): Promise<PaymentResult> {
    return {
      providerTransactionId,
      paymentMethod: "qris",
      status: "PENDING",
      rawResponse: JSON.stringify({ mock: true, status: "PENDING" }),
    };
  }

  // Mock webhook always succeeds — real services call our webhook endpoint
  validateWebhook(payload: any, _headers: Record<string, string>): WebhookValidationResult {
    if (!payload?.order_id || !payload?.transaction_status) {
      return { isValid: false };
    }
    const isPaid = payload.transaction_status === "settlement" || payload.transaction_status === "capture";
    return {
      isValid: true,
      orderId: payload.order_id,
      status: isPaid ? "PAID" : payload.transaction_status === "expire" ? "EXPIRED" : "FAILED",
      paidAt: isPaid ? new Date() : undefined,
    };
  }
}
