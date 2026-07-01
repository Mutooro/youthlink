create extension if not exists pgcrypto;

create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique,
  full_name text not null,
  headline text,
  bio text,
  district text,
  city text,
  phone text,
  avatar_url text,
  cv_url text,
  cv_parsed_skills text[] default '{}',
  education jsonb default '[]'::jsonb,
  experience jsonb default '[]'::jsonb,
  skills text[] default '{}',
  languages text[] default '{}',
  availability text check (availability in ('immediately','1_month','3_months','not_looking')),
  looking_for text[] default '{}',
  onboarding_completed boolean default false,
  is_visible boolean default true,
  role text default 'student' check (role in ('student','employer','admin')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists employers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique,
  company_name text not null,
  logo_url text,
  industry text,
  size text check (size in ('1-10','11-50','51-200','200+')),
  description text,
  website text,
  district text,
  city text,
  is_verified boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists listings (
  id uuid primary key default gen_random_uuid(),
  employer_id uuid references employers(id) on delete cascade,
  title text not null,
  description text not null,
  type text check (type in ('internship','fulltime','parttime','contract','volunteer')),
  duration text,
  is_remote boolean default false,
  district text,
  city text,
  salary_min integer,
  salary_max integer,
  currency text default 'UGX',
  skills_required text[] default '{}',
  category text,
  deadline date,
  slots integer default 1,
  is_active boolean default true,
  views integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists programs (
  id uuid primary key default gen_random_uuid(),
  organizer_id uuid references employers(id),
  title text not null,
  description text,
  program_type text check (program_type in ('bootcamp','mentorship','empowerment','scholarship','training')),
  target_group text,
  cost integer default 0,
  has_stipend boolean default false,
  stipend_amount integer,
  duration text,
  start_date date,
  end_date date,
  seats integer,
  district text,
  is_online boolean default false,
  application_url text,
  is_active boolean default true,
  created_at timestamptz default now()
);

create table if not exists applications (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles(id) on delete cascade,
  listing_id uuid references listings(id) on delete cascade,
  cover_letter text,
  cv_url text,
  status text check (status in ('submitted','viewed','shortlisted','rejected','accepted')) default 'submitted',
  applied_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(profile_id, listing_id)
);

create table if not exists program_enrollments (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles(id) on delete cascade,
  program_id uuid references programs(id) on delete cascade,
  status text check (status in ('applied','accepted','rejected','completed')) default 'applied',
  enrolled_at timestamptz default now(),
  unique(profile_id, program_id)
);

create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  type text,
  title text,
  body text,
  is_read boolean default false,
  created_at timestamptz default now()
);

create table if not exists cv_matches (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles(id) on delete cascade,
  listing_id uuid references listings(id) on delete cascade,
  match_score numeric(5,2),
  matched_skills text[] default '{}',
  computed_at timestamptz default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (user_id, full_name, role)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.email), coalesce(new.raw_user_meta_data->>'role', 'student'))
  on conflict (user_id) do nothing;

  if coalesce(new.raw_user_meta_data->>'role','student') = 'employer' then
    insert into public.employers (user_id, company_name)
    values (new.id, 'New Employer')
    on conflict (user_id) do nothing;
  end if;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

alter table profiles enable row level security;
alter table employers enable row level security;
alter table listings enable row level security;
alter table programs enable row level security;
alter table applications enable row level security;
alter table program_enrollments enable row level security;
alter table notifications enable row level security;
alter table cv_matches enable row level security;

create policy if not exists profiles_select on profiles
  for select using (true);

create policy if not exists profiles_update on profiles
  for update using (auth.uid() = user_id);

create policy if not exists profiles_insert on profiles
  for insert with check (auth.uid() = user_id);

create policy if not exists employers_select on employers
  for select using (true);

create policy if not exists employers_update on employers
  for update using (auth.uid() = user_id);

create policy if not exists employers_insert on employers
  for insert with check (auth.uid() = user_id);

create policy if not exists listings_select on listings
  for select using (is_active = true or auth.uid() is not null);

create policy if not exists listings_insert on listings
  for insert with check (exists (
    select 1 from employers e where e.id = employer_id and e.user_id = auth.uid()
  ));

create policy if not exists listings_update on listings
  for update using (exists (
    select 1 from employers e where e.id = employer_id and e.user_id = auth.uid()
  ));

create policy if not exists programs_select on programs
  for select using (true);

create policy if not exists applications_select on applications
  for select using (
    exists (select 1 from profiles p where p.id = profile_id and p.user_id = auth.uid())
    or exists (select 1 from listings l join employers e on e.id = l.employer_id where l.id = listing_id and e.user_id = auth.uid())
  );

create policy if not exists applications_insert on applications
  for insert with check (
    exists (select 1 from profiles p where p.id = profile_id and p.user_id = auth.uid())
  );

create policy if not exists program_enrollments_select on program_enrollments
  for select using (
    exists (select 1 from profiles p where p.id = profile_id and p.user_id = auth.uid())
  );

create policy if not exists program_enrollments_insert on program_enrollments
  for insert with check (
    exists (select 1 from profiles p where p.id = profile_id and p.user_id = auth.uid())
  );

create policy if not exists notifications_select on notifications
  for select using (auth.uid() = user_id);

create policy if not exists notifications_insert on notifications
  for insert with check (auth.uid() = user_id);
