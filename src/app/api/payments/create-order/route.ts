import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import prisma from '@/lib/prisma';
import { PAYMENT_CONFIG } from '@/lib/payments/config';
import { generateVietQRUrl } from '@/lib/utils';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Vui lòng đăng nhập để tiến hành nâng cấp gói hoặc mua template' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { type, targetItemId } = body;

    let amount = 0;
    let codePrefix = 'LS';

    if (type === 'PLAN_LIFETIME_VIP_200K') {
      amount = PAYMENT_CONFIG.prices.LIFETIME_VIP_200K;
      codePrefix = 'LS200';
    } else if (type === 'PLAN_ANNUAL_50K') {
      amount = PAYMENT_CONFIG.prices.ANNUAL_50K;
      codePrefix = 'LS50';
    } else if (type === 'SINGLE_TEMPLATE_VIP') {
      if (!targetItemId) {
        return NextResponse.json({ error: 'Thiếu thông tin template cần mua' }, { status: 400 });
      }
      const tpl = await prisma.template.findUnique({
        where: { id: targetItemId },
      });
      amount = tpl?.price || PAYMENT_CONFIG.prices.DEFAULT_TEMPLATE_VIP;
      codePrefix = 'LSTP';
    } else {
      return NextResponse.json({ error: 'Loại gói không hợp lệ' }, { status: 400 });
    }

    // Generate unique transfer code (without spaces or special chars for Vietnamese banks)
    const randomSuffix = crypto.randomBytes(2).toString('hex').toUpperCase(); // 4 chars
    const orderCode = `${codePrefix}_${randomSuffix}`;

    // Create order in DB
    const order = await prisma.order.create({
      data: {
        userId: user.id,
        code: orderCode,
        type,
        targetItemId: targetItemId || null,
        amount,
        status: 'PENDING',
        paymentMethod: 'VIETQR_SEPAY',
      },
    });

    // Generate VietQR URL
    const qrUrl = generateVietQRUrl(
      PAYMENT_CONFIG.bankId,
      PAYMENT_CONFIG.bankAccount,
      PAYMENT_CONFIG.bankName,
      orderCode,
      amount
    );

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        code: order.code,
        amount: order.amount,
        type: order.type,
        targetItemId: order.targetItemId,
        status: order.status,
        qrUrl,
        bankInfo: {
          bankId: PAYMENT_CONFIG.bankId,
          bankAccount: PAYMENT_CONFIG.bankAccount,
          bankName: PAYMENT_CONFIG.bankName,
          transferContent: orderCode,
        },
      },
    });
  } catch (error) {
    console.error('Create order error:', error);
    return NextResponse.json({ error: 'Không thể tạo đơn hàng thanh toán' }, { status: 500 });
  }
}
