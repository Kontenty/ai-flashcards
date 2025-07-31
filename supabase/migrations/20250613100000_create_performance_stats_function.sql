create or replace function get_performance_stats(p_user_id uuid)
returns table (
  "totalReviewed" integer,
  "correctPercent" float
) as $$
begin
  return query
  select
    count(*)::integer as "totalReviewed",
    (count(*) filter (where outcome = 'correct'))::float * 100 / count(*)::float as "correctPercent"
  from
    public.reviews
  where
    user_id = p_user_id;
end;
$$ language plpgsql;
