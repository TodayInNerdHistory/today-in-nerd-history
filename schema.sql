-- USERS: Supabase provides auth.users; we store profile info separately:
create table profiles (
  id uuid primary key references auth.users on delete cascade,
  username text unique not null,
  display_name text,
  avatar_url text,
  bio text,
  role text default 'user',
  created_at timestamptz default now()
);

-- POSTS
create table posts (
  id uuid primary key default uuid_generate_v4(),
  author uuid references profiles(id) on delete cascade,
  content text,
  image_url text,
  video_url text,
  tags text[],
  is_pinned boolean default false,
  is_flagged boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz
);

-- COMMENTS
create table comments (
  id uuid primary key default uuid_generate_v4(),
  post_id uuid references posts(id) on delete cascade,
  author uuid references profiles(id) on delete cascade,
  content text,
  created_at timestamptz default now()
);

-- LIKES (simple)
create table post_likes (
  id uuid primary key default uuid_generate_v4(),
  post_id uuid references posts(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  created_at timestamptz default now(),
  unique(post_id, user_id)
);

-- REPORTS (for moderation)
create table reports (
  id uuid primary key default uuid_generate_v4(),
  item_type text not null,
  item_id uuid not null,
  reporter uuid references profiles(id),
  reason text,
  created_at timestamptz default now(),
  resolved boolean default false
);
