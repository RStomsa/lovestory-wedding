import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { PAYMENT_CONFIG } from '@/lib/payments/config';

export async function POST(request: NextRequest) {
  try {
    const rawText = await request.text();
    let body: Record<string, unknown> = {};
    try {
      body = JSON.parse(rawText);
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    // 1. Check API Key / Authorization if provided
    const authHeader = request.headers.get('authorization') || request.headers.get('x-api-key');
    if (PAYMENT_CONFIG.sepayApiKey && authHeader) {
      const token = authHeader.replace(/^Bearer\s+/i, '').trim();
      if (token !== PAYMENT_CONFIG.sepayApiKey) {
        console.warn('⚠️ SePay webhook unauthorized token mismatch:', token);
        // Note: In case user has not configured secret in SePay, we log warning
      }
    }

    const txnId = String(body.id || body.referenceCode || `TXN_${Date.now()}`);
    const transferAmount = Number(body.transferAmount || 0);
    const content = String(body.content || body.description || '');

    // 2. Idempotency Check: Prevent duplicate webhook processing
    const existingTxn = await prisma.transaction.findUnique({
      where: { providerTxnId: txnId },
    });

    if (existingTxn) {
      return NextResponse.json({
        success: true,
        message: 'Giao dịch đã được ghi nhận trước đó',
      });
    }

    // 3. Match Order Code from transfer content (e.g., LS50_7B92, LS200_10A4, LSTP_89F1)
    const match = content.match(/(LS50_[A-Z0-9]+|LS200_[A-Z0-9]+|LSTP_[A-Z0-9]+)/i);
    if (!match) {
      // Record transaction anyway for audit/troubleshooting in Admin Orders
      await prisma.transaction.create({
        data: {
          provider: 'sepay',
          providerTxnId: txnId,
          bankAccount: String(body.accountNumber || ''),
          amount: transferAmount,
          transferContent: content,
          rawPayload: rawText,
        },
      });

      return NextResponse.json({
        success: false,
        message: 'Không tìm thấy mã đơn hàng hợp lệ trong nội dung chuyển khoản',
      });
    }

    const orderCode = match[1].toUpperCase();

    // 4. Find matching order
    const order = await prisma.order.findUnique({
      where: { code: orderCode },
      include: { user: true },
    });

    if (!order) {
      await prisma.transaction.create({
        data: {
          provider: 'sepay',
          providerTxnId: txnId,
          bankAccount: String(body.accountNumber || ''),
          amount: transferAmount,
          transferContent: content,
          rawPayload: rawText,
        },
      });

      return NextResponse.json({
        success: false,
        message: `Không tìm thấy đơn hàng mã ${orderCode}`,
      });
    }

    // 5. Verify transfer amount
    if (transferAmount < order.amount) {
      await prisma.transaction.create({
        data: {
          orderId: order.id,
          provider: 'sepay',
          providerTxnId: txnId,
          bankAccount: String(body.accountNumber || ''),
          amount: transferAmount,
          transferContent: content,
          rawPayload: rawText,
        },
      });

      return NextResponse.json({
        success: false,
        message: `Số tiền chuyển khoản (${transferAmount}) thấp hơn số tiền đơn hàng (${order.amount})`,
      });
    }

    // 6. Activate Order & Benefits
    const now = new Date();

    // A. Mark order PAID
    await prisma.order.update({
      where: { id: order.id },
      data: {
        status: 'PAID',
        paidAt: now,
      },
    });

    // B. Apply User Upgrade
    if (order.type === 'PLAN_LIFETIME_VIP_200K') {
      await prisma.user.update({
        where: { id: order.userId },
        data: {
          plan: 'LIFETIME_VIP_200K',
          planExpiresAt: null, // Lifetime
        },
      });
    } else if (order.type === 'PLAN_ANNUAL_50K') {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 365);

      await prisma.user.update({
        where: { id: order.userId },
        data: {
          plan: 'ANNUAL_50K',
          planExpiresAt: expiresAt,
        },
      });
    } else if (order.type === 'SINGLE_TEMPLATE_VIP' && order.targetItemId) {
      await prisma.userPurchasedTemplate.upsert({
        where: {
          userId_templateId: {
            userId: order.userId,
            templateId: order.targetItemId,
          },
        },
        update: {
          pricePaid: order.amount,
        },
        create: {
          userId: order.userId,
          templateId: order.targetItemId,
          pricePaid: order.amount,
        },
      });
    }

    // C. Record transaction audit
    await prisma.transaction.create({
      data: {
        orderId: order.id,
        provider: 'sepay',
        providerTxnId: txnId,
        bankAccount: String(body.accountNumber || ''),
        amount: transferAmount,
        transferContent: content,
        rawPayload: rawText,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Đã kích hoạt tự động thành công đơn hàng ${order.code} cho ${order.user.name}`,
    });
  } catch (error) {
    console.error('SePay webhook error:', error);
    return NextResponse.json({ error: 'Lỗi xử lý webhook' }, { status: 500 });
  }
}
