create table rsvps (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  attending boolean not null,
  food_choice text,
  drink_choice text,
  dietry_Restrictions text,
  allergies text,
  guest_count int,
  notes text,
  created_at timestamp with time zone default now()
);