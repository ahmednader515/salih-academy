-- عملة عرض الأسعار لكل حساب (EGP | SAR | USD)
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS display_currency TEXT;
