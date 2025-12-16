-- Migration: add rate_per_day to guides
-- Add a decimal column to store guide rate per day
ALTER TABLE guides
ADD COLUMN rate_per_day DECIMAL(10,2) NOT NULL DEFAULT 0.00;

-- Optional: backfill existing seed data using sensible defaults if needed
-- UPDATE guides SET rate_per_day = 0.00 WHERE rate_per_day IS NULL;
