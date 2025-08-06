-- Create a view to expose total reviews and percentage of correct answers per user
CREATE OR REPLACE VIEW get_performance_stats AS
SELECT
  COUNT(*) AS total_reviews,
  ROUND(AVG((quality >= 3)::INT) * 100, 2) AS correct_percentage
FROM flashcard_reviews;

-- Grant read access to authenticated users
GRANT SELECT ON get_performance_stats TO authenticated;