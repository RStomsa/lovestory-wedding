export const PAYMENT_CONFIG = {
  bankId: process.env.ADMIN_BANK_ID || 'MB',
  bankAccount: process.env.ADMIN_BANK_ACCOUNT || '0388999999',
  bankName: process.env.ADMIN_BANK_NAME || 'LOVESTORY VIETNAM',
  sepayApiKey: process.env.SEPAY_API_KEY || 'lovestory_sepay_webhook_secret_key_2026',
  prices: {
    ANNUAL_50K: 50000,
    LIFETIME_VIP_200K: 200000,
    DEFAULT_TEMPLATE_VIP: 30000,
  },
};
