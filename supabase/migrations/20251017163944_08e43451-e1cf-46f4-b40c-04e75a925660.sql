-- Add expires_at column to products table
ALTER TABLE products ADD COLUMN expires_at timestamp with time zone;

-- Add comment to explain the column
COMMENT ON COLUMN products.expires_at IS 'Data de expiração da oferta. NULL significa que a oferta nunca expira.';