-- Enable pgvector extension for semantic search
create extension if not exists vector;

-- PROFILES (User Management)
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  full_name text,
  avatar_url text,
  role text default 'user', -- 'admin' or 'user'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- PRODUCTS (Storefront)
create table products (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  category text,
  price decimal(10, 2) not null,
  stock integer default 0,
  image_url text,

  -- AI Fields
  embedding vector(768), -- Gemini embedding dimension
  ai_generated_tags text[], -- Auto-generated tags

  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Index for Semantic Search
create index on products using ivfflat (embedding vector_cosine_ops)
with (lists = 100);

-- ORDERS (Transactions)
create table orders (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  status text default 'pending', -- 'pending', 'paid', 'shipped', 'cancelled'
  total decimal(10, 2) not null,

  -- Checkout Details
  address text,
  payment_method text,

  -- Verification
  slip_url text, -- Bank transfer slip
  slip_verified boolean default false,

  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ORDER ITEMS (Line Items)
create table order_items (
  id uuid default gen_random_uuid() primary key,
  order_id uuid references orders(id) on delete cascade not null,
  product_id uuid references products(id) not null,
  quantity integer not null,
  price_at_purchase decimal(10, 2) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- REVIEWS (Feedback)
create table reviews (
  id uuid default gen_random_uuid() primary key,
  product_id uuid references products(id) on delete cascade not null,
  user_id uuid references profiles(id) not null,
  rating integer check (rating >= 1 and rating <= 5),
  comment text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- SYSTEM LOGS (AI Diagnostics & Health)
create table system_logs (
  id uuid default gen_random_uuid() primary key,
  event_type text not null, -- 'error', 'info', 'ai_fix'
  message text,
  stack_trace text,
  ai_suggested_fix text, -- Gemini's suggestion
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ROW LEVEL SECURITY (RLS)
alter table profiles enable row level security;
alter table products enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table reviews enable row level security;
alter table system_logs enable row level security;

-- POLICIES

-- Profiles:
-- Public read (for reviews/avatars), Users update own, Admin all
create policy "Public profiles are viewable by everyone" on profiles for select using (true);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);

-- Products:
-- Public read, Admin all
create policy "Public products are viewable by everyone" on products for select using (true);
create policy "Admin can insert products" on products for insert with check (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);
create policy "Admin can update products" on products for update using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);
create policy "Admin can delete products" on products for delete using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- Orders:
-- Users read own, Admin read all, Users insert own
create policy "Users can view own orders" on orders for select using (auth.uid() = user_id);
create policy "Admin can view all orders" on orders for select using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);
create policy "Users can insert orders" on orders for insert with check (auth.uid() = user_id);
create policy "Admin can update orders" on orders for update using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- Order Items:
-- Inherit from orders (simplified for SQL) - Usually check order ownership
create policy "Users can view own order items" on order_items for select using (
  exists (select 1 from orders where orders.id = order_items.order_id and orders.user_id = auth.uid())
);
create policy "Users can insert order items" on order_items for insert with check (
  exists (select 1 from orders where orders.id = order_id and orders.user_id = auth.uid())
);

-- Reviews:
-- Public read, Users insert/update own
create policy "Reviews are viewable by everyone" on reviews for select using (true);
create policy "Authenticated users can insert reviews" on reviews for insert with check (auth.role() = 'authenticated');
create policy "Users can update own reviews" on reviews for update using (auth.uid() = user_id);

-- System Logs:
-- Admin read/insert (Server actions often use service role key which bypasses RLS, but for client admin dashboard:)
create policy "Admin can view system logs" on system_logs for select using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- FUNCTIONS

-- Search Products by vector similarity
create or replace function search_products (
  query_embedding vector(768),
  match_threshold float,
  match_count int
)
returns table (
  id uuid,
  name text,
  description text,
  price decimal,
  image_url text,
  similarity float
)
language sql stable
as $$
  select
    products.id,
    products.name,
    products.description,
    products.price,
    products.image_url,
    1 - (products.embedding <=> query_embedding) as similarity
  from products
  where 1 - (products.embedding <=> query_embedding) > match_threshold
  order by products.embedding <=> query_embedding
  limit match_count;
$$;
