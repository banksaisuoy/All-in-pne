-- Enable pgvector extension for semantic search
create extension if not exists vector;

-- PRODUCTS TABLE (Updated for NeuroEmperor)
create table products (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  price decimal(10, 2) not null,
  flash_sale_price decimal(10, 2),
  stock integer default 0,
  image_url text,
  vector_embedding vector(768),

  -- NeuroEmperor Fields
  cost_price decimal(10, 2), -- For margin calculation
  competitor_url text, -- URL to scrape
  competitor_price decimal(10, 2), -- Last checked price
  auto_pricing_enabled boolean default false, -- AI pricing permission

  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index on products using ivfflat (vector_embedding vector_cosine_ops) with (lists = 100);

-- SEARCH LOGS (Zero-result tracking)
create table search_logs (
  id uuid default gen_random_uuid() primary key,
  query text not null,
  user_id uuid, -- Nullable for guests
  results_count integer not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- BLACKLISTS (Shadow Ban System)
create table blacklists (
  id uuid default gen_random_uuid() primary key,
  ip_address text,
  user_id uuid,
  reason text,
  shadow_banned boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ORDERS
create table orders (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null,
  status text default 'pending',
  total decimal(10, 2) not null,
  tracking_number text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- REVIEWS
create table reviews (
  id uuid default gen_random_uuid() primary key,
  product_id uuid references products(id) on delete cascade,
  content text,
  images text[],
  sentiment_score float,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- COUPONS (Updated)
create table coupons (
  id uuid default gen_random_uuid() primary key,
  code text unique not null,
  discount_amount decimal(10, 2) not null,
  is_ai_generated boolean default false,

  -- NeuroEmperor Fields
  is_hidden boolean default false, -- True for secret AI codes
  generated_for_user uuid, -- Locked to specific user

  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ROW LEVEL SECURITY (RLS)
alter table products enable row level security;
alter table search_logs enable row level security;
alter table blacklists enable row level security;
alter table orders enable row level security;
alter table reviews enable row level security;
alter table coupons enable row level security;

-- Policies (Simplified for prototype)
-- Products: Read public, Write admin
create policy "Public Read Products" on products for select using (true);
create policy "Admin Write Products" on products for all using (true); -- In real app, check role

-- Search Logs: Insert public, Read admin
create policy "Public Insert Search" on search_logs for insert with check (true);

-- Blacklists: Admin only
create policy "Admin All Blacklists" on blacklists for all using (true);

-- RPC FUNCTIONS

-- Voice Commander Executor
-- This allows the AI to update fields dynamically.
-- WARNING: In production, input validation is critical.
create or replace function execute_ai_update(
  table_name text,
  update_field text,
  update_value_expression text, -- e.g., "price * 0.9"
  filter_condition text -- e.g., "color = 'red'"
) returns void as $$
begin
  execute format('update %I set %I = %s where %s', table_name, update_field, update_value_expression, filter_condition);
end;
$$ language plpgsql security definer;

-- Search Products (Original)
create or replace function search_products (
  query_embedding vector(768),
  match_threshold float,
  match_count int
)
returns table (
  id uuid,
  title text,
  description text,
  price decimal,
  image_url text,
  similarity float
)
language sql stable
as $$
  select
    products.id,
    products.title,
    products.description,
    products.price,
    products.image_url,
    1 - (products.vector_embedding <=> query_embedding) as similarity
  from products
  where 1 - (products.vector_embedding <=> query_embedding) > match_threshold
  order by products.vector_embedding <=> query_embedding
  limit match_count;
$$;
