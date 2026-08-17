// Payment abstraction types
export type PaymentProvider = "MOCK" | "MIDTRANS" | "XENDIT";

export type PaymentMethodCategory = "qris" | "virtual_account" | "ewallet" | "card";

export interface PaymentMethod {
  id: string;         // e.g. "bca_va", "gopay", "qris"
  name: string;       // e.g. "BCA Virtual Account"
  category: PaymentMethodCategory;
  iconUrl?: string;
}

export interface CreatePaymentInput {
  orderId: string;
  amount: number;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  paymentMethod: string;  // e.g. "qris", "bca_va", "gopay"
  description?: string;
  expiryMinutes?: number;
}

export interface PaymentResult {
  providerTransactionId: string;
  paymentMethod: string;
  status: "PENDING" | "PAID" | "FAILED" | "EXPIRED";
  paidAt?: Date;
  expiredAt?: Date;
  redirectUrl?: string;    // for hosted payment pages
  vaNumber?: string;       // for virtual accounts
  qrString?: string;       // for QRIS
  rawResponse: string;     // JSON string
}

export interface WebhookValidationResult {
  isValid: boolean;
  orderId?: string;
  status?: "PAID" | "FAILED" | "EXPIRED";
  paidAt?: Date;
}

export interface IPaymentService {
  getProvider(): PaymentProvider;
  getAvailablePaymentMethods(): PaymentMethod[];
  createPayment(input: CreatePaymentInput): Promise<PaymentResult>;
  getPaymentStatus(providerTransactionId: string): Promise<PaymentResult>;
  validateWebhook(payload: any, headers: Record<string, string>): WebhookValidationResult;
}
