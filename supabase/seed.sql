insert into programs (id, title, description, program_type, target_group, cost, has_stipend, stipend_amount, duration, start_date, district, is_online, application_url, is_active)
values
  ('11111111-1111-1111-1111-111111111111', 'Tech Bootcamp 2026', 'A practical 12-week bootcamp covering frontend, backend, and data skills for young Ugandans.', 'bootcamp', 'youth', 0, true, 150000, '12 weeks', '2026-08-01', 'Kampala', false, 'https://example.com/apply', true),
  ('22222222-2222-2222-2222-222222222222', 'Women in STEM Mentorship', 'A mentorship and employability program for young women building careers in digital skills.', 'mentorship', 'women', 0, false, null, '8 weeks', '2026-07-15', 'Wakiso', true, 'https://example.com/apply', true),
  ('33333333-3333-3333-3333-333333333333', 'Digital Marketing Training', 'Short training program focused on social media marketing, content creation, and analytics.', 'training', 'youth', 50000, false, null, '4 weeks', '2026-09-01', 'Kampala', true, 'https://example.com/apply', true)
on conflict do nothing;

insert into listings (id, title, description, type, duration, district, skills_required, category, is_active)
values
  ('44444444-4444-4444-4444-444444444444', 'Frontend Intern', 'Build user interfaces and improve product experience for a growing startup.', 'internship', '3 months', 'Kampala', ARRAY['React','UI/UX','JavaScript'], 'Technology & ICT', true),
  ('55555555-5555-5555-5555-555555555555', 'Operations Assistant', 'Support field teams and maintain customer records for a social enterprise.', 'fulltime', '6 months', 'Jinja', ARRAY['Communication','Data Entry','Microsoft Office'], 'Operations', true)
on conflict do nothing;
