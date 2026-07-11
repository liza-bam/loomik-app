-- Rename consensus column to priority in stakeholders table
ALTER TABLE public.stakeholders RENAME COLUMN consensus TO priority;

-- Rename relations column to sentiment in stakeholder_trends table
ALTER TABLE public.stakeholder_trends RENAME COLUMN relations TO sentiment;