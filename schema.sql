-- Enable pgvector extension for semantic search
create extension if not exists vector;

-- PRODUCTS TABLE
create table products (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  price decimal(10, 2) not null,
  flash_sale_price decimal(10, 2), -- Nullable, for flash sales
  stock integer default 0,
  image_url text, -- URL to product image
  vector_embedding vector(768), -- Gemini embedding
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- INDEX for semantic search
create index on products using ivfflat (vector_embedding vector_cosine_ops)
with (lists = 100);

-- ORDERS
create table orders (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null, -- Can reference auth.users if needed
  status text default 'pending', -- 'paid', 'shipped', 'delivered'
  total decimal(10, 2) not null,
  tracking_number text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- REVIEWS
create table reviews (
  id uuid default gen_random_uuid() primary key,
  product_id uuid references products(id) on delete cascade,
  content text,
  images text[], -- Array of image URLs
  sentiment_score float,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- COUPONS
create table coupons (
  id uuid default gen_random_uuid() primary key,
  code text unique not null,
  discount_amount decimal(10, 2) not null,
  is_ai_generated boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
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
