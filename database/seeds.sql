-- InterClue Seed Data for Testing & Demonstration

-- Insert Demo User & Admin
INSERT INTO users (id, email, hashed_password, full_name, is_active, is_admin)
VALUES 
(1, 'demo@interclue.ai', '$2b$12$K1jE7K9eM8qYnZzU9vY1ueO/x3I9vF6P5P4sY6X5B6A7Z8C9D0E1F', 'Alex Rivera', TRUE, FALSE),
(2, 'admin@interclue.ai', '$2b$12$K1jE7K9eM8qYnZzU9vY1ueO/x3I9vF6P5P4sY6X5B6A7Z8C9D0E1F', 'InterClue Admin', TRUE, TRUE)
ON CONFLICT (id) DO NOTHING;

-- Insert Profile
INSERT INTO profiles (id, user_id, target_role, experience_level, interview_type_preference, current_streak, longest_streak, weekly_interview_goal)
VALUES 
(1, 1, 'Full Stack Developer', 'Junior', 'Mixed', 4, 7, 5),
(2, 2, 'Product Manager', 'Senior', 'Behavioral', 1, 1, 3)
ON CONFLICT (id) DO NOTHING;

-- Insert Active Pro Subscription for demo user
INSERT INTO subscriptions (id, user_id, plan_tier, status, provider, start_date, end_date)
VALUES 
(1, 1, 'pro_monthly', 'active', 'google_play', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '30 days')
ON CONFLICT (id) DO NOTHING;

-- Insert Sample Completed Interview
INSERT INTO interviews (id, user_id, role, difficulty, duration_minutes, interview_type, status, total_questions, current_question_index, overall_score)
VALUES 
(1, 1, 'Full Stack Developer', 'Junior', 15, 'Mixed', 'completed', 3, 3, 8.4)
ON CONFLICT (id) DO NOTHING;

-- Insert Sample Questions
INSERT INTO questions (id, interview_id, question_order, question_text, category, role, difficulty)
VALUES 
(1, 1, 1, 'Explain how React Virtual DOM diffing reconciles updates to minimize direct DOM writes.', 'Technical', 'Full Stack Developer', 'Junior'),
(2, 1, 2, 'Tell me about a time you resolved a major bug under a tight production deadline.', 'Behavioral', 'Full Stack Developer', 'Junior'),
(3, 1, 3, 'How would you design a rate limiter to protect a public login endpoint?', 'Technical', 'Full Stack Developer', 'Junior')
ON CONFLICT (id) DO NOTHING;

-- Insert Responses
INSERT INTO responses (id, interview_id, question_id, user_id, answer_text, duration_seconds)
VALUES 
(1, 1, 1, 1, 'The Virtual DOM keeps a lightweight JavaScript representation of UI in memory. On state changes, React compares current and new trees using heuristics (O(n) diffing), generating a minimal batch of real DOM mutations.', 48),
(2, 1, 2, 1, 'During our final semester project, our API started failing due to unindexed database queries. I identified the slow queries using EXPLAIN ANALYZE, added composite indexes, and reduced latency by 70%.', 62),
(3, 1, 3, 1, 'I would implement a Token Bucket algorithm stored in Redis with an atomic sliding window to track requests per IP address, returning HTTP 429 when limits are breached.', 55)
ON CONFLICT (id) DO NOTHING;

-- Insert Scores
INSERT INTO scores (id, response_id, interview_id, technical_score, communication_score, confidence_score, clarity_score, overall_score, strengths, weaknesses, suggestions)
VALUES 
(1, 1, 1, 8.8, 8.5, 8.2, 8.5, 8.5, '["Accurate explanation of diffing algorithm", "Clear technical phrasing"]'::jsonb, '["Could mention Fiber architecture"]'::jsonb, '["Mention requestAnimationFrame or concurrent mode"]'::jsonb),
(2, 2, 1, 8.2, 8.8, 8.5, 8.6, 8.5, '["Strong STAR story structure", "Quantified 70% latency reduction"]'::jsonb, '["Brief on team coordination"]'::jsonb, '["Highlight communication with stakeholders"]'::jsonb),
(3, 3, 1, 8.6, 8.2, 8.0, 8.0, 8.2, '["Selected appropriate Token Bucket algorithm", "Redis atomic operations mentioned"]'::jsonb, '["Did not address distributed DDoS clustering"]'::jsonb, '["Mention Cloudflare or AWS WAF reverse proxy layer"]'::jsonb)
ON CONFLICT (id) DO NOTHING;
