-- Add has_interest field to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS has_interest BOOLEAN DEFAULT false;

-- Remove installment_info field (optional - pode manter por compatibilidade)
-- ALTER TABLE products DROP COLUMN IF EXISTS installment_info;

-- Update existing records to have has_interest as false by default
UPDATE products SET has_interest = false WHERE has_interest IS NULL;
