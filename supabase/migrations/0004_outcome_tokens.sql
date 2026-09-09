-- Lets a student answer the outcome question from the email without signing in.
--
-- The alternative was making them sign in to answer, which would have gutted
-- the response rate and left the kill gate measured by whoever could be
-- bothered. The token is a bearer credential, so it is worth being clear about
-- what it grants: it identifies one outcome question and nothing else. The
-- page behind it shows no contact details, no address and no email, only the
-- room a student asked about and four buttons.

alter table outcome_checks
  add column token uuid not null default gen_random_uuid();

create unique index outcome_checks_token on outcome_checks (token);

-- One question per reveal, ever. Without this a job that ran twice, or a
-- failed send that was retried, would ask the same student the same question
-- again, and every extra ask is a reason to ignore the next one.
create unique index outcome_checks_one_per_reveal on outcome_checks (reveal_id);

comment on column outcome_checks.token is
  'Unguessable id used in the emailed answer link. Grants nothing except the ability to answer this one question.';

-- The sweep looks for reveals old enough to ask about.
create index contact_reveals_created on contact_reveals (created_at);
