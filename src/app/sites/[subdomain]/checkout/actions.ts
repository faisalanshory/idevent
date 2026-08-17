"use server";

import { db } from "@/lib/db";
import { getPaymentService } from "@/lib/payment";
import { nanoid } from "nanoid";

// Generate a readable order ID
function generateOrderId() {
  const date = new Date();
  const year = date.getFullYear();
  const rand = nanoid(6).toUpperCase();
  return `ORD-${year}-${rand}`;
}

interface CreateOrderInput {
  organizerId: string;
  eventId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  items: { ticketTypeId: string; quantity: number; price: number }[];
  promoCode?: string;
  paymentMethod: string;
  totalAmount: number;
}

export async function createOrder(input: CreateOrderInput) {
  try {
    // 1. Find or create customer
    let customer = await db.customer.findFirst({
      where: { organizerId: input.organizerId, email: input.customerEmail.toLowerCase() },
    });
    if (!customer) {
      customer = await db.customer.create({
        data: {
          organizerId: input.organizerId,
          name: input.customerName,
          email: input.customerEmail.toLowerCase(),
          phone: input.customerPhone,
        },
      });
    }

    // 2. Find promo code
    let promoCodeRecord = null;
    let discountAmount = 0;
    if (input.promoCode) {
      promoCodeRecord = await db.promoCode.findFirst({
        where: { organizerId: input.organizerId, code: input.promoCode, isActive: true },
      });
      if (promoCodeRecord) {
        if (promoCodeRecord.discountType === "PERCENTAGE") {
          discountAmount = Math.round(input.totalAmount * promoCodeRecord.discountValue / 100);
        } else {
          discountAmount = promoCodeRecord.discountValue;
        }
      }
    }

    const finalTotal = Math.max(0, input.totalAmount);
    const orderId = generateOrderId();

    // 3. Create order + items in a transaction
    const order = await db.order.create({
      data: {
        id: orderId,
        organizerId: input.organizerId,
        customerId: customer.id,
        eventId: input.eventId,
        totalAmount: finalTotal,
        discountAmount,
        promoCodeId: promoCodeRecord?.id,
        paymentStatus: "PENDING",
        orderStatus: "PENDING",
        paymentProvider: process.env.PAYMENT_PROVIDER || "MOCK",
        orderItems: {
          create: input.items.map(item => ({
            ticketTypeId: item.ticketTypeId,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
    });

    // 4. Create payment via gateway
    const paymentService = getPaymentService();
    const paymentResult = await paymentService.createPayment({
      orderId: order.id,
      amount: finalTotal,
      customerName: input.customerName,
      customerEmail: input.customerEmail,
      customerPhone: input.customerPhone,
      paymentMethod: input.paymentMethod,
      description: `Tiket event — ${order.id}`,
      expiryMinutes: 60,
    });

    // 5. Save payment record
    await db.payment.create({
      data: {
        orderId: order.id,
        provider: paymentService.getProvider(),
        providerTransactionId: paymentResult.providerTransactionId,
        paymentMethod: paymentResult.paymentMethod,
        amount: finalTotal,
        status: "PENDING",
        expiredAt: paymentResult.expiredAt,
        rawResponse: paymentResult.rawResponse,
      },
    });

    // 6. Update order with payment reference
    await db.order.update({
      where: { id: order.id },
      data: { paymentReference: paymentResult.providerTransactionId },
    });

    // 7. Increment promo code usage
    if (promoCodeRecord) {
      await db.promoCode.update({
        where: { id: promoCodeRecord.id },
        data: { usedCount: { increment: 1 } },
      });
    }

    return {
      success: true,
      orderId: order.id,
      paymentMethod: paymentResult.paymentMethod,
      vaNumber: paymentResult.vaNumber,
      qrString: paymentResult.qrString,
      redirectUrl: paymentResult.redirectUrl,
      expiredAt: paymentResult.expiredAt?.toISOString(),
    };
  } catch (e: any) {
    console.error("[createOrder] Error:", e);
    return { success: false, error: "Gagal membuat pesanan. Silakan coba lagi." };
  }
}

export async function validatePromoCode({ code, organizerId, subtotal }: { code: string; organizerId: string; subtotal: number }) {
  try {
    const promo = await db.promoCode.findFirst({
      where: {
        organizerId,
        code: code.toUpperCase(),
        isActive: true,
        OR: [{ validUntil: null }, { validUntil: { gte: new Date() } }],
        OR: [{ validFrom: null }, { validFrom: { lte: new Date() } }],
      },
    });
    if (!promo) return { success: false, error: "Kode promo tidak ditemukan atau sudah tidak berlaku." };
    if (promo.maxUses && promo.usedCount >= promo.maxUses) return { success: false, error: "Kuota promo sudah habis." };

    return {
      success: true,
      discountType: promo.discountType,
      discountValue: promo.discountValue,
    };
  } catch {
    return { success: false, error: "Gagal memvalidasi kode promo." };
  }
}
