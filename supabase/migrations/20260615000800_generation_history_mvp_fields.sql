alter table public.generation_history
add column if not exists brand_kit_id uuid references public.brand_kits(id) on delete set null,
add column if not exists goal text,
add column if not exists topic text,
add column if not exists tokens_input integer not null default 0,
add column if not exists tokens_output integer not null default 0,
add column if not exists tokens_total integer not null default 0;

update public.generation_history
set tokens_total = tokens
where tokens_total = 0
  and tokens > 0;

alter table public.generation_history
drop constraint if exists generation_history_goal_not_blank,
drop constraint if exists generation_history_topic_not_blank,
drop constraint if exists generation_history_tokens_input_non_negative,
drop constraint if exists generation_history_tokens_output_non_negative,
drop constraint if exists generation_history_tokens_total_non_negative;

alter table public.generation_history
add constraint generation_history_goal_not_blank check (goal is null or length(btrim(goal)) > 0),
add constraint generation_history_topic_not_blank check (topic is null or length(btrim(topic)) > 0),
add constraint generation_history_tokens_input_non_negative check (tokens_input >= 0),
add constraint generation_history_tokens_output_non_negative check (tokens_output >= 0),
add constraint generation_history_tokens_total_non_negative check (tokens_total >= 0);

create index if not exists generation_history_brand_kit_id_idx
on public.generation_history (brand_kit_id);
