import type { SqlProblem } from '../../types/content'

const problems: SqlProblem[] = [
  {
    id: `daily-monthly-active-stickiness`,
    title: `Daily Monthly Active Stickiness`,
    difficulty: `Medium`,
    category: `Product & ML Analytics`,
    description: `A product manager measures stickiness as daily active users divided by monthly active users for the same calendar month.

Return \`activity_date\`, \`dau\`, \`mau\`, and \`stickiness_pct\`. \`dau\` is distinct users active on that date; \`mau\` is distinct users active in that date's \`YYYY-MM\` month. Round stickiness to 2 decimals.

Order by \`activity_date\` ascending.`,
    schema: `CREATE TABLE app_events (
  event_id INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL,
  event_at TEXT NOT NULL,
  event_name TEXT NOT NULL
);`,
    datasets: [
      `INSERT INTO app_events (event_id, user_id, event_at, event_name) VALUES
  (1, 1, '2026-09-01 08:00:00', 'open'),
  (2, 1, '2026-09-01 09:00:00', 'click'),
  (3, 2, '2026-09-01 10:00:00', 'open'),
  (4, 2, '2026-09-02 08:00:00', 'open'),
  (5, 3, '2026-09-02 09:00:00', 'open'),
  (6, 4, '2026-09-30 09:00:00', 'open'),
  (7, 1, '2026-10-01 08:00:00', 'open'),
  (8, 5, '2026-10-01 09:00:00', 'open');`,
      `INSERT INTO app_events (event_id, user_id, event_at, event_name) VALUES
  (10, 10, '2026-01-31 23:00:00', 'open'),
  (11, 10, '2026-02-01 00:01:00', 'open'),
  (12, 11, '2026-02-01 00:02:00', 'open'),
  (13, 11, '2026-02-02 00:02:00', 'click');`,
      `INSERT INTO app_events (event_id, user_id, event_at, event_name) VALUES
  (20, 1, '2026-03-01', 'open'),
  (21, 2, '2026-03-01', 'open'),
  (22, 3, '2026-03-02', 'open'),
  (23, 3, '2026-03-02', 'click'),
  (24, 4, '2026-03-03', 'open');`,
    ],
    orderMatters: true,
    solution: `WITH daily AS (
  SELECT
    date(event_at) AS activity_date,
    strftime('%Y-%m', event_at) AS activity_month,
    COUNT(DISTINCT user_id) AS dau
  FROM app_events
  GROUP BY activity_date, activity_month
), monthly AS (
  SELECT
    strftime('%Y-%m', event_at) AS activity_month,
    COUNT(DISTINCT user_id) AS mau
  FROM app_events
  GROUP BY activity_month
)
SELECT
  d.activity_date,
  d.dau,
  m.mau,
  ROUND(100.0 * d.dau / m.mau, 2) AS stickiness_pct
FROM daily AS d
JOIN monthly AS m
  ON m.activity_month = d.activity_month
ORDER BY d.activity_date ASC;`,
    explanation: `Compute daily and monthly active user counts at their natural grains, then join each day to its month. Using \`COUNT(DISTINCT user_id)\` prevents multiple events from inflating activity.

Common mistakes are using total events instead of users or using a rolling 30-day MAU when the prompt asks for calendar month. An alternative is to compute both counts with window functions over pre-deduplicated user-day and user-month sets.`,
    hints: [
      `Use \`date(event_at)\` for DAU and \`strftime('%Y-%m', event_at)\` for MAU.`,
      `Both metrics count distinct users.`,
      `Join daily rows to the monthly total for the same month.`,
    ],
  },
  {
    id: `weekly-signup-retention-cohorts`,
    title: `Weekly Signup Retention Cohorts`,
    difficulty: `Hard`,
    category: `Product & ML Analytics`,
    description: `Growth analytics groups users by signup week and asks whether they returned during days 7 through 13 after signup.

Return \`cohort_week\`, \`users_in_cohort\`, \`retained_week_1\`, and \`retention_pct\`. A user is retained if they have at least one session where \`session_date - signup_date\` is between 7 and 13 days inclusive. Round the percentage to 2 decimals.

Order by \`cohort_week\` ascending.`,
    schema: `CREATE TABLE signup_users (
  user_id INTEGER PRIMARY KEY,
  signup_date TEXT NOT NULL
);

CREATE TABLE user_sessions (
  session_id INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL,
  session_date TEXT NOT NULL
);`,
    datasets: [
      `INSERT INTO signup_users (user_id, signup_date) VALUES
  (1, '2026-09-01'),
  (2, '2026-09-02'),
  (3, '2026-09-03'),
  (4, '2026-09-08'),
  (5, '2026-09-09');
INSERT INTO user_sessions (session_id, user_id, session_date) VALUES
  (100, 1, '2026-09-08'),
  (101, 1, '2026-09-20'),
  (102, 2, '2026-09-09'),
  (103, 3, '2026-09-07'),
  (104, 4, '2026-09-16'),
  (105, 5, '2026-09-30');`,
      `INSERT INTO signup_users (user_id, signup_date) VALUES
  (10, '2026-01-01'),
  (11, '2026-01-04'),
  (12, '2026-01-05'),
  (13, '2026-01-05');
INSERT INTO user_sessions (session_id, user_id, session_date) VALUES
  (200, 10, '2026-01-14'),
  (201, 11, '2026-01-18'),
  (202, 12, '2026-01-11'),
  (203, 13, '2026-01-12'),
  (204, 13, '2026-01-12');`,
      `INSERT INTO signup_users (user_id, signup_date) VALUES
  (20, '2026-02-02'),
  (21, '2026-02-03'),
  (22, '2026-02-10');
INSERT INTO user_sessions (session_id, user_id, session_date) VALUES
  (300, 20, '2026-02-09'),
  (301, 21, '2026-02-17'),
  (302, 22, '2026-02-18');`,
    ],
    orderMatters: true,
    solution: `SELECT
  strftime('%Y-%W', u.signup_date) AS cohort_week,
  COUNT(DISTINCT u.user_id) AS users_in_cohort,
  COUNT(DISTINCT CASE
    WHEN julianday(s.session_date) - julianday(u.signup_date) BETWEEN 7 AND 13
    THEN u.user_id
  END) AS retained_week_1,
  ROUND(
    100.0 * COUNT(DISTINCT CASE
      WHEN julianday(s.session_date) - julianday(u.signup_date) BETWEEN 7 AND 13
      THEN u.user_id
    END) / COUNT(DISTINCT u.user_id),
    2
  ) AS retention_pct
FROM signup_users AS u
LEFT JOIN user_sessions AS s
  ON s.user_id = u.user_id
GROUP BY cohort_week
ORDER BY cohort_week ASC;`,
    explanation: `The left join keeps every signup even if the user never returned. Conditional distinct counts mark users with at least one session in the day-7-through-day-13 window and avoid double-counting repeated sessions.

Common mistakes are using session week instead of signup cohort week or counting sessions rather than retained users. An alternative is to precompute one retained flag per user in a CTE and then aggregate by cohort.`,
    hints: [
      `Cohorts are based on \`signup_date\`, not session date.`,
      `Use a left join so users without sessions stay in the denominator.`,
      `Count distinct retained users to handle multiple qualifying sessions.`,
    ],
  },
  {
    id: `signup-funnel-conversion`,
    title: `Signup Funnel Conversion`,
    difficulty: `Medium`,
    category: `Product & ML Analytics`,
    description: `A self-serve analytics product tracks the onboarding funnel from signup to running a first query.

For the funnel steps \`signup\`, \`verify_email\`, \`create_project\`, and \`run_query\`, return \`step_name\`, \`users_reached\`, and \`conversion_from_signup_pct\`. The conversion denominator is the number of distinct users with a \`signup\` event. Round percentages to 2 decimals.

Order by the funnel step order listed above.`,
    schema: `CREATE TABLE funnel_events (
  event_id INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL,
  event_name TEXT NOT NULL,
  event_at TEXT NOT NULL
);`,
    datasets: [
      `INSERT INTO funnel_events (event_id, user_id, event_name, event_at) VALUES
  (1, 1, 'signup', '2026-09-01'),
  (2, 1, 'verify_email', '2026-09-01'),
  (3, 1, 'create_project', '2026-09-02'),
  (4, 1, 'run_query', '2026-09-02'),
  (5, 2, 'signup', '2026-09-01'),
  (6, 2, 'verify_email', '2026-09-03'),
  (7, 3, 'signup', '2026-09-02'),
  (8, 3, 'signup', '2026-09-02'),
  (9, 4, 'verify_email', '2026-09-04'),
  (10, 5, 'signup', '2026-09-05'),
  (11, 5, 'create_project', '2026-09-06');`,
      `INSERT INTO funnel_events (event_id, user_id, event_name, event_at) VALUES
  (10, 10, 'signup', '2026-10-01'),
  (11, 10, 'verify_email', '2026-10-01'),
  (12, 11, 'signup', '2026-10-01'),
  (13, 11, 'run_query', '2026-10-02'),
  (14, 12, 'signup', '2026-10-02'),
  (15, 12, 'create_project', '2026-10-02');`,
      `INSERT INTO funnel_events (event_id, user_id, event_name, event_at) VALUES
  (20, 20, 'signup', '2026-01-01'),
  (21, 20, 'verify_email', '2026-01-01'),
  (22, 20, 'verify_email', '2026-01-02'),
  (23, 21, 'signup', '2026-01-01'),
  (24, 21, 'create_project', '2026-01-03'),
  (25, 22, 'signup', '2026-01-04');`,
    ],
    orderMatters: true,
    solution: `WITH steps(step_order, step_name) AS (
  SELECT 1, 'signup'
  UNION ALL SELECT 2, 'verify_email'
  UNION ALL SELECT 3, 'create_project'
  UNION ALL SELECT 4, 'run_query'
), signup_total AS (
  SELECT COUNT(DISTINCT user_id) AS signup_users
  FROM funnel_events
  WHERE event_name = 'signup'
)
SELECT
  s.step_name,
  COUNT(DISTINCT e.user_id) AS users_reached,
  ROUND(100.0 * COUNT(DISTINCT e.user_id) / st.signup_users, 2) AS conversion_from_signup_pct
FROM steps AS s
LEFT JOIN funnel_events AS e
  ON e.event_name = s.step_name
CROSS JOIN signup_total AS st
GROUP BY s.step_order, s.step_name, st.signup_users
ORDER BY s.step_order ASC;`,
    explanation: `The step CTE fixes the funnel order and ensures steps with zero events can still appear. Each step counts distinct users with that event, divided by distinct signup users.

Common mistakes are counting event rows, which double-counts repeated signups, or using each previous step as the denominator when the prompt asks for conversion from signup. An alternative is to pivot user-level step flags first and then sum each flag.`,
    hints: [
      `Create a small step table so output order is stable.`,
      `The denominator is distinct signup users for every step.`,
      `Use distinct user counts because events can repeat.`,
    ],
  },
  {
    id: `pricing-ab-test-metrics`,
    title: `Pricing A/B Test Metrics`,
    difficulty: `Medium`,
    category: `Product & ML Analytics`,
    description: `An experiment analyst evaluates variants in the \`pricing_page\` test.

Return \`variant\`, \`assigned_users\`, \`converters\`, \`conversion_rate_pct\`, and \`revenue_per_assigned\`. A converter is an assigned user with at least one conversion at or after their assignment time. Sum all post-assignment conversion revenue for \`revenue_per_assigned\`, and round both rate and revenue per assigned to 2 decimals.

Order by \`variant\` ascending.`,
    schema: `CREATE TABLE experiment_assignments (
  assignment_id INTEGER PRIMARY KEY,
  experiment_name TEXT NOT NULL,
  user_id INTEGER NOT NULL,
  variant TEXT NOT NULL,
  assigned_at TEXT NOT NULL
);

CREATE TABLE conversion_events (
  conversion_id INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL,
  converted_at TEXT NOT NULL,
  revenue REAL NOT NULL
);`,
    datasets: [
      `INSERT INTO experiment_assignments (assignment_id, experiment_name, user_id, variant, assigned_at) VALUES
  (1, 'pricing_page', 1, 'control', '2026-09-01 09:00:00'),
  (2, 'pricing_page', 2, 'control', '2026-09-01 09:05:00'),
  (3, 'pricing_page', 3, 'treatment', '2026-09-01 09:10:00'),
  (4, 'pricing_page', 4, 'treatment', '2026-09-01 09:15:00'),
  (5, 'search_layout', 5, 'control', '2026-09-01 09:20:00');
INSERT INTO conversion_events (conversion_id, user_id, converted_at, revenue) VALUES
  (100, 1, '2026-09-01 08:00:00', 99.0),
  (101, 1, '2026-09-01 10:00:00', 120.0),
  (102, 3, '2026-09-02 10:00:00', 200.0),
  (103, 3, '2026-09-03 10:00:00', 50.0),
  (104, 5, '2026-09-02 10:00:00', 500.0);`,
      `INSERT INTO experiment_assignments (assignment_id, experiment_name, user_id, variant, assigned_at) VALUES
  (10, 'pricing_page', 10, 'A', '2026-10-01'),
  (11, 'pricing_page', 11, 'A', '2026-10-01'),
  (12, 'pricing_page', 12, 'B', '2026-10-01'),
  (13, 'pricing_page', 13, 'B', '2026-10-01');
INSERT INTO conversion_events (conversion_id, user_id, converted_at, revenue) VALUES
  (200, 10, '2026-10-02', 10.0),
  (201, 11, '2026-09-30', 100.0),
  (202, 12, '2026-10-01', 20.0);`,
      `INSERT INTO experiment_assignments (assignment_id, experiment_name, user_id, variant, assigned_at) VALUES
  (20, 'pricing_page', 20, 'control', '2026-01-01'),
  (21, 'pricing_page', 21, 'treatment', '2026-01-01'),
  (22, 'pricing_page', 22, 'treatment', '2026-01-01');
INSERT INTO conversion_events (conversion_id, user_id, converted_at, revenue) VALUES
  (300, 21, '2026-01-02', 30.0),
  (301, 22, '2026-01-03', 70.0);`,
    ],
    orderMatters: true,
    solution: `SELECT
  a.variant,
  COUNT(DISTINCT a.user_id) AS assigned_users,
  COUNT(DISTINCT CASE WHEN c.conversion_id IS NOT NULL THEN a.user_id END) AS converters,
  ROUND(100.0 * COUNT(DISTINCT CASE WHEN c.conversion_id IS NOT NULL THEN a.user_id END) / COUNT(DISTINCT a.user_id), 2) AS conversion_rate_pct,
  ROUND(SUM(COALESCE(c.revenue, 0.0)) / COUNT(DISTINCT a.user_id), 2) AS revenue_per_assigned
FROM experiment_assignments AS a
LEFT JOIN conversion_events AS c
  ON c.user_id = a.user_id
 AND c.converted_at >= a.assigned_at
WHERE a.experiment_name = 'pricing_page'
GROUP BY a.variant
ORDER BY a.variant ASC;`,
    explanation: `Filter to the target experiment, left join conversions that occurred after assignment, and aggregate by variant. Distinct user counts avoid double-counting converters with multiple purchases, while revenue intentionally sums all post-assignment conversion revenue.

Common mistakes include counting pre-assignment conversions or dividing revenue by converters instead of assigned users. An alternative is to collapse conversions to user-level metrics first, then aggregate those user metrics by variant.`,
    hints: [
      `The conversion timestamp must be at or after assignment.`,
      `Count converters as distinct users.`,
      `Revenue per assigned divides by all assigned users, not only converters.`,
    ],
  },
  {
    id: `ad-click-through-rate`,
    title: `Ad Click-Through Rate`,
    difficulty: `Easy`,
    category: `Product & ML Analytics`,
    description: `Ads analytics computes click-through rate for every ad with at least one impression.

Return \`ad_id\`, \`impressions\`, \`clicks\`, and \`ctr_pct\`. CTR is clicks divided by impressions times 100, rounded to 2 decimals. Ignore ads that only have click rows and no impressions.

Order by \`ctr_pct\` descending, then \`ad_id\` ascending.`,
    schema: `CREATE TABLE ad_events (
  event_id INTEGER PRIMARY KEY,
  ad_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  event_at TEXT NOT NULL
);`,
    datasets: [
      `INSERT INTO ad_events (event_id, ad_id, event_type, event_at) VALUES
  (1, 'ad_a', 'impression', '2026-09-01'),
  (2, 'ad_a', 'impression', '2026-09-01'),
  (3, 'ad_a', 'click', '2026-09-01'),
  (4, 'ad_b', 'impression', '2026-09-01'),
  (5, 'ad_b', 'impression', '2026-09-02'),
  (6, 'ad_c', 'click', '2026-09-02'),
  (7, 'ad_d', 'impression', '2026-09-03'),
  (8, 'ad_d', 'click', '2026-09-03'),
  (9, 'ad_d', 'click', '2026-09-03');`,
      `INSERT INTO ad_events (event_id, ad_id, event_type, event_at) VALUES
  (10, 'x', 'impression', '2026-10-01'),
  (11, 'x', 'click', '2026-10-01'),
  (12, 'y', 'impression', '2026-10-01'),
  (13, 'y', 'impression', '2026-10-01'),
  (14, 'z', 'click', '2026-10-01');`,
      `INSERT INTO ad_events (event_id, ad_id, event_type, event_at) VALUES
  (20, 'tie_a', 'impression', '2026-01-01'),
  (21, 'tie_a', 'click', '2026-01-01'),
  (22, 'tie_b', 'impression', '2026-01-01'),
  (23, 'tie_b', 'click', '2026-01-01'),
  (24, 'zero', 'impression', '2026-01-01');`,
    ],
    orderMatters: true,
    solution: `SELECT
  ad_id,
  SUM(CASE WHEN event_type = 'impression' THEN 1 ELSE 0 END) AS impressions,
  SUM(CASE WHEN event_type = 'click' THEN 1 ELSE 0 END) AS clicks,
  ROUND(
    100.0 * SUM(CASE WHEN event_type = 'click' THEN 1 ELSE 0 END) /
    SUM(CASE WHEN event_type = 'impression' THEN 1 ELSE 0 END),
    2
  ) AS ctr_pct
FROM ad_events
GROUP BY ad_id
HAVING impressions > 0
ORDER BY ctr_pct DESC, ad_id ASC;`,
    explanation: `Conditional aggregation counts impressions and clicks in the same grouped query. The \`HAVING\` clause removes ads with no impressions so the CTR denominator is valid.

Common mistakes are dividing by all ad events or filtering to impressions in \`WHERE\`, which would remove clicks before counting them. An alternative is to aggregate impressions and clicks in separate CTEs and join them.`,
    hints: [
      `Do not filter out clicks before aggregating.`,
      `CTR denominator is impressions only.`,
      `Use \`HAVING\` to require at least one impression.`,
    ],
  },
  {
    id: `transactions-over-three-x-user-average`,
    title: `Transactions Over Three Times User Average`,
    difficulty: `Medium`,
    category: `Product & ML Analytics`,
    description: `A fraud heuristic flags transactions that are unusually large for the same user.

Return \`transaction_id\`, \`user_id\`, \`amount\`, and \`user_avg_amount\` for transactions where \`amount\` is greater than three times that user's average transaction amount across all their transactions. Round \`user_avg_amount\` to 2 decimals.

Order by \`user_id\`, \`amount\` descending, then \`transaction_id\` ascending.`,
    schema: `CREATE TABLE payment_transactions (
  transaction_id INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL,
  amount REAL NOT NULL,
  transaction_at TEXT NOT NULL
);`,
    datasets: [
      `INSERT INTO payment_transactions (transaction_id, user_id, amount, transaction_at) VALUES
  (1, 1, 20.0, '2026-09-01'),
  (2, 1, 22.0, '2026-09-02'),
  (3, 1, 400.0, '2026-09-03'),
  (4, 2, 50.0, '2026-09-01'),
  (5, 2, 60.0, '2026-09-02'),
  (6, 2, 70.0, '2026-09-03'),
  (7, 3, 5.0, '2026-09-01'),
  (8, 3, 100.0, '2026-09-02'),
  (9, 1, 18.0, '2026-09-04');`,
      `INSERT INTO payment_transactions (transaction_id, user_id, amount, transaction_at) VALUES
  (10, 10, 10.0, '2026-10-01'),
  (11, 10, 10.0, '2026-10-02'),
  (12, 10, 100.0, '2026-10-03'),
  (15, 10, 10.0, '2026-10-04'),
  (13, 11, 99.0, '2026-10-01'),
  (14, 11, 1.0, '2026-10-02');`,
      `INSERT INTO payment_transactions (transaction_id, user_id, amount, transaction_at) VALUES
  (20, 20, 1.0, '2026-01-01'),
  (21, 20, 1.0, '2026-01-02'),
  (22, 20, 20.0, '2026-01-03'),
  (24, 20, 1.0, '2026-01-04'),
  (23, 21, 100.0, '2026-01-01');`,
    ],
    orderMatters: true,
    solution: `WITH scored AS (
  SELECT
    transaction_id,
    user_id,
    amount,
    AVG(amount) OVER (PARTITION BY user_id) AS user_avg_amount_raw
  FROM payment_transactions
)
SELECT
  transaction_id,
  user_id,
  amount,
  ROUND(user_avg_amount_raw, 2) AS user_avg_amount
FROM scored
WHERE amount > 3.0 * user_avg_amount_raw
ORDER BY user_id ASC, amount DESC, transaction_id ASC;`,
    explanation: `A windowed average adds each user's average to every transaction without collapsing rows. The anomaly filter compares the raw amount to three times that average, while the displayed average is rounded.

Common mistakes are averaging across all users or comparing to a rounded threshold, which can change edge cases. An alternative is to compute per-user averages in a grouped CTE and join them back to transactions.`,
    hints: [
      `Keep transaction-level rows while adding a user-level average.`,
      `Partition the average by \`user_id\`.`,
      `Round only the output average, not the comparison value.`,
    ],
  },
  {
    id: `also-bought-after-course`,
    title: `Also Bought After Course`,
    difficulty: `Medium`,
    category: `Product & ML Analytics`,
    description: `A recommendation widget is seeded with users who purchased \`model_monitoring_course\` and needs other items those same users bought.

Return \`item_id\` and \`buyer_count\`, the number of distinct anchor buyers who also bought that item. Exclude the anchor item itself.

Order by \`buyer_count\` descending, then \`item_id\` ascending.`,
    schema: `CREATE TABLE purchases (
  purchase_id INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL,
  item_id TEXT NOT NULL,
  purchased_at TEXT NOT NULL
);`,
    datasets: [
      `INSERT INTO purchases (purchase_id, user_id, item_id, purchased_at) VALUES
  (1, 1, 'model_monitoring_course', '2026-09-01'),
  (2, 1, 'feature_store_book', '2026-09-02'),
  (3, 1, 'sql_practice_pack', '2026-09-03'),
  (4, 2, 'model_monitoring_course', '2026-09-01'),
  (5, 2, 'sql_practice_pack', '2026-09-04'),
  (6, 2, 'sql_practice_pack', '2026-09-05'),
  (7, 3, 'feature_store_book', '2026-09-02'),
  (8, 4, 'model_monitoring_course', '2026-09-06'),
  (9, 4, 'vector_search_lab', '2026-09-07');`,
      `INSERT INTO purchases (purchase_id, user_id, item_id, purchased_at) VALUES
  (10, 10, 'model_monitoring_course', '2026-10-01'),
  (11, 10, 'a', '2026-10-02'),
  (12, 11, 'model_monitoring_course', '2026-10-01'),
  (13, 11, 'a', '2026-10-02'),
  (14, 11, 'b', '2026-10-03'),
  (15, 12, 'b', '2026-10-03');`,
      `INSERT INTO purchases (purchase_id, user_id, item_id, purchased_at) VALUES
  (20, 20, 'model_monitoring_course', '2026-01-01'),
  (21, 20, 'model_monitoring_course', '2026-01-02'),
  (22, 21, 'other', '2026-01-03'),
  (23, 22, 'model_monitoring_course', '2026-01-04'),
  (24, 22, 'other', '2026-01-05');`,
    ],
    orderMatters: true,
    solution: `WITH anchor_buyers AS (
  SELECT DISTINCT user_id
  FROM purchases
  WHERE item_id = 'model_monitoring_course'
)
SELECT
  p.item_id,
  COUNT(DISTINCT p.user_id) AS buyer_count
FROM purchases AS p
JOIN anchor_buyers AS a
  ON a.user_id = p.user_id
WHERE p.item_id <> 'model_monitoring_course'
GROUP BY p.item_id
ORDER BY buyer_count DESC, p.item_id ASC;`,
    explanation: `First identify the distinct buyers of the anchor item. Joining their purchases back to the table reveals other items, and counting distinct users prevents duplicate purchases from inflating co-occurrence.

Common mistakes are counting purchases instead of buyers or including the anchor item in the recommendations. An alternative is a self-join from anchor purchase rows to other purchase rows by user, followed by \`COUNT(DISTINCT user_id)\`.`,
    hints: [
      `Build the anchor buyer set first.`,
      `Exclude the anchor item from recommendations.`,
      `A user buying the same item twice should count once.`,
    ],
  },
  {
    id: `binary-classification-metrics`,
    title: `Binary Classification Metrics`,
    difficulty: `Medium`,
    category: `Product & ML Analytics`,
    description: `An ML evaluator stores one row per prediction for a binary classifier where \`1\` is the positive class.

Return a single row with \`accuracy_pct\`, \`precision_pct\`, and \`recall_pct\`, each rounded to 2 decimals. Precision should be \`NULL\` when there are no predicted positives, and recall should be \`NULL\` when there are no actual positives.`,
    schema: `CREATE TABLE model_predictions (
  prediction_id INTEGER PRIMARY KEY,
  actual_label INTEGER NOT NULL,
  predicted_label INTEGER NOT NULL
);`,
    datasets: [
      `INSERT INTO model_predictions (prediction_id, actual_label, predicted_label) VALUES
  (1, 1, 1),
  (2, 1, 0),
  (3, 0, 1),
  (4, 0, 0),
  (5, 1, 1),
  (6, 0, 0);`,
      `INSERT INTO model_predictions (prediction_id, actual_label, predicted_label) VALUES
  (10, 0, 0),
  (11, 0, 0),
  (12, 0, 0);`,
      `INSERT INTO model_predictions (prediction_id, actual_label, predicted_label) VALUES
  (20, 1, 1),
  (21, 1, 1),
  (22, 0, 1),
  (23, 0, 1);`,
    ],
    orderMatters: false,
    solution: `WITH confusion AS (
  SELECT
    SUM(CASE WHEN actual_label = predicted_label THEN 1 ELSE 0 END) AS correct,
    SUM(CASE WHEN predicted_label = 1 AND actual_label = 1 THEN 1 ELSE 0 END) AS true_positive,
    SUM(CASE WHEN predicted_label = 1 AND actual_label = 0 THEN 1 ELSE 0 END) AS false_positive,
    SUM(CASE WHEN predicted_label = 0 AND actual_label = 1 THEN 1 ELSE 0 END) AS false_negative,
    COUNT(*) AS total_rows
  FROM model_predictions
)
SELECT
  ROUND(100.0 * correct / total_rows, 2) AS accuracy_pct,
  CASE
    WHEN true_positive + false_positive = 0 THEN NULL
    ELSE ROUND(100.0 * true_positive / (true_positive + false_positive), 2)
  END AS precision_pct,
  CASE
    WHEN true_positive + false_negative = 0 THEN NULL
    ELSE ROUND(100.0 * true_positive / (true_positive + false_negative), 2)
  END AS recall_pct
FROM confusion;`,
    explanation: `The CTE computes the confusion-matrix counts in one pass. Accuracy uses all rows, precision uses predicted positives, and recall uses actual positives; \`CASE\` avoids dividing by zero.

Common mistakes are swapping precision and recall denominators or treating class \`0\` as the positive class. An alternative is to materialize the confusion matrix by \`(actual_label, predicted_label)\` and then pivot the four cells.`,
    hints: [
      `Write down TP, FP, FN, and total before calculating metrics.`,
      `Precision denominator is predicted positives.`,
      `Recall denominator is actual positives.`,
    ],
  },
  {
    id: `rolling-seven-day-user-spend`,
    title: `Rolling Seven-Day User Spend`,
    difficulty: `Hard`,
    category: `Product & ML Analytics`,
    description: `A feature engineering job creates a point-in-time spend feature for each payment.

For every payment, return \`payment_id\`, \`user_id\`, \`payment_date\`, \`amount\`, and \`rolling_7d_spend\`, the sum of that user's payments from the current \`payment_date\` back through the prior 6 calendar days, inclusive. Round the rolling sum to 2 decimals.

Order by \`user_id\`, \`payment_date\`, then \`payment_id\` ascending.`,
    schema: `CREATE TABLE user_payments (
  payment_id INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL,
  payment_date TEXT NOT NULL,
  amount REAL NOT NULL
);`,
    datasets: [
      `INSERT INTO user_payments (payment_id, user_id, payment_date, amount) VALUES
  (1, 1, '2026-09-01', 10.0),
  (2, 1, '2026-09-03', 20.0),
  (3, 1, '2026-09-07', 30.0),
  (4, 1, '2026-09-08', 40.0),
  (5, 2, '2026-09-02', 5.0),
  (6, 2, '2026-09-08', 15.0),
  (7, 2, '2026-09-09', 25.0);`,
      `INSERT INTO user_payments (payment_id, user_id, payment_date, amount) VALUES
  (10, 10, '2026-01-01', 100.0),
  (11, 10, '2026-01-07', 50.0),
  (12, 10, '2026-01-08', 25.0),
  (13, 10, '2026-01-08', 5.0),
  (14, 11, '2026-01-08', 7.0);`,
      `INSERT INTO user_payments (payment_id, user_id, payment_date, amount) VALUES
  (20, 20, '2026-02-01', 1.0),
  (21, 20, '2026-02-10', 2.0),
  (22, 20, '2026-02-16', 3.0),
  (23, 21, '2026-02-16', 4.0);`,
    ],
    orderMatters: true,
    solution: `SELECT
  p.payment_id,
  p.user_id,
  p.payment_date,
  p.amount,
  ROUND(SUM(prior.amount), 2) AS rolling_7d_spend
FROM user_payments AS p
JOIN user_payments AS prior
  ON prior.user_id = p.user_id
 AND prior.payment_date BETWEEN date(p.payment_date, '-6 day') AND p.payment_date
GROUP BY p.payment_id, p.user_id, p.payment_date, p.amount
ORDER BY p.user_id ASC, p.payment_date ASC, p.payment_id ASC;`,
    explanation: `For each payment row, join to the same user's payments whose dates fall in the inclusive seven-day lookback window and sum those amounts. The grouping returns one feature row per payment.

Common mistakes are using a global rolling window across users or excluding the current payment date. An alternative is a window \`RANGE\` over \`julianday(payment_date)\`, but the self-join is explicit and handles multiple payments on the same date predictably.`,
    hints: [
      `The window is per user.`,
      `Seven days inclusive means current date plus the previous six days.`,
      `Group back to one row per payment after joining prior payments.`,
    ],
  },
  {
    id: `point-in-time-plan-join`,
    title: `Point-In-Time Plan Join`,
    difficulty: `Hard`,
    category: `Product & ML Analytics`,
    description: `A training set needs the user's subscription plan as of the label timestamp without leaking future changes.

Return \`label_id\`, \`user_id\`, \`label_at\`, \`label\`, and \`plan_at_label\`. For each label, choose the plan history row for the same user with the greatest \`effective_at\` that is less than or equal to \`label_at\`. If no prior plan exists, \`plan_at_label\` should be \`NULL\`.

Order by \`label_id\` ascending.`,
    schema: `CREATE TABLE churn_labels (
  label_id INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL,
  label_at TEXT NOT NULL,
  label INTEGER NOT NULL
);

CREATE TABLE user_plan_history (
  history_id INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL,
  plan TEXT NOT NULL,
  effective_at TEXT NOT NULL
);`,
    datasets: [
      `INSERT INTO churn_labels (label_id, user_id, label_at, label) VALUES
  (1, 1, '2026-09-10 00:00:00', 0),
  (2, 1, '2026-09-20 00:00:00', 1),
  (3, 2, '2026-09-15 00:00:00', 0),
  (4, 3, '2026-09-12 00:00:00', 1);
INSERT INTO user_plan_history (history_id, user_id, plan, effective_at) VALUES
  (100, 1, 'free', '2026-09-01 00:00:00'),
  (101, 1, 'pro', '2026-09-15 00:00:00'),
  (102, 2, 'enterprise', '2026-09-16 00:00:00'),
  (103, 3, 'free', '2026-08-01 00:00:00'),
  (104, 3, 'pro', '2026-10-01 00:00:00');`,
      `INSERT INTO churn_labels (label_id, user_id, label_at, label) VALUES
  (10, 10, '2026-01-01 00:00:00', 0),
  (11, 10, '2026-01-02 00:00:00', 1),
  (12, 11, '2026-01-03 00:00:00', 0);
INSERT INTO user_plan_history (history_id, user_id, plan, effective_at) VALUES
  (200, 10, 'free', '2026-01-01 00:00:00'),
  (201, 10, 'pro', '2026-01-02 00:00:00'),
  (202, 11, 'pro', '2026-01-04 00:00:00');`,
      `INSERT INTO churn_labels (label_id, user_id, label_at, label) VALUES
  (20, 20, '2026-02-10', 1),
  (21, 20, '2026-02-20', 0),
  (22, 21, '2026-02-15', 1);
INSERT INTO user_plan_history (history_id, user_id, plan, effective_at) VALUES
  (300, 20, 'free', '2026-02-01'),
  (301, 20, 'team', '2026-02-15'),
  (302, 21, 'enterprise', '2026-02-14');`,
    ],
    orderMatters: true,
    solution: `WITH candidates AS (
  SELECT
    l.label_id,
    l.user_id,
    l.label_at,
    l.label,
    h.plan,
    ROW_NUMBER() OVER (
      PARTITION BY l.label_id
      ORDER BY h.effective_at DESC, h.history_id DESC
    ) AS rn
  FROM churn_labels AS l
  LEFT JOIN user_plan_history AS h
    ON h.user_id = l.user_id
   AND h.effective_at <= l.label_at
)
SELECT
  label_id,
  user_id,
  label_at,
  label,
  plan AS plan_at_label
FROM candidates
WHERE rn = 1
ORDER BY label_id ASC;`,
    explanation: `The join only allows history rows effective at or before the label time, preventing future leakage. \`ROW_NUMBER\` then chooses the latest eligible history row per label; labels with no eligible history still produce one null-extended row.

Common mistakes include joining to the user's current plan or using history rows after the label timestamp. An alternative is a correlated subquery selecting \`MAX(effective_at)\` per label and joining back to the history table.`,
    hints: [
      `The time predicate must be \`effective_at <= label_at\`.`,
      `Rank candidate history rows newest-first per label.`,
      `Use a left join so labels without prior history remain in the output.`,
    ],
  },
  {
    id: `deduplicate-latest-user-profile`,
    title: `Deduplicate Latest User Profile`,
    difficulty: `Medium`,
    category: `Product & ML Analytics`,
    description: `A CDC feed may contain multiple profile records per user. Downstream features should keep the latest version only.

Return \`user_id\`, \`email\`, \`city\`, and \`updated_at\` for the latest profile record per user. If two records have the same \`updated_at\`, keep the one with the larger \`profile_event_id\`.

Order by \`user_id\` ascending.`,
    schema: `CREATE TABLE user_profile_events (
  profile_event_id INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL,
  email TEXT NOT NULL,
  city TEXT,
  updated_at TEXT NOT NULL
);`,
    datasets: [
      `INSERT INTO user_profile_events (profile_event_id, user_id, email, city, updated_at) VALUES
  (1, 1, 'ana@old.test', 'Austin', '2026-09-01 10:00:00'),
  (2, 1, 'ana@new.test', 'Boston', '2026-09-05 10:00:00'),
  (3, 2, 'ben@test.test', 'Chicago', '2026-09-03 09:00:00'),
  (4, 2, 'ben@test.test', 'Denver', '2026-09-03 09:00:00'),
  (5, 3, 'cy@test.test', NULL, '2026-09-04 12:00:00');`,
      `INSERT INTO user_profile_events (profile_event_id, user_id, email, city, updated_at) VALUES
  (10, 10, 'x1@test.test', 'NYC', '2026-01-01'),
  (11, 10, 'x2@test.test', 'NYC', '2026-01-02'),
  (12, 11, 'y@test.test', NULL, '2026-01-03'),
  (13, 11, 'y2@test.test', 'LA', '2026-01-03');`,
      `INSERT INTO user_profile_events (profile_event_id, user_id, email, city, updated_at) VALUES
  (20, 20, 'solo@test.test', 'Paris', '2026-02-01'),
  (21, 21, 'a@test.test', 'Rome', '2026-02-01'),
  (22, 21, 'b@test.test', 'Milan', '2026-02-05'),
  (23, 21, 'c@test.test', 'Turin', '2026-02-05');`,
    ],
    orderMatters: true,
    solution: `WITH ranked AS (
  SELECT
    user_id,
    email,
    city,
    updated_at,
    ROW_NUMBER() OVER (
      PARTITION BY user_id
      ORDER BY updated_at DESC, profile_event_id DESC
    ) AS rn
  FROM user_profile_events
)
SELECT
  user_id,
  email,
  city,
  updated_at
FROM ranked
WHERE rn = 1
ORDER BY user_id ASC;`,
    explanation: `\`ROW_NUMBER\` ranks each user's profile events newest-first, with the event id as a deterministic tie-breaker. Keeping \`rn = 1\` deduplicates the feed at the requested user grain.

Common mistakes are grouping by user and taking \`MAX(updated_at)\` without bringing along the matching email/city, or ignoring tied timestamps. An alternative is to join profile events to a subquery of max timestamps, but it needs an additional tie-breaker to be deterministic.`,
    hints: [
      `Rank records inside each user group.`,
      `Sort by \`updated_at\` descending and then event id descending.`,
      `Filter to the first ranked record in an outer query.`,
    ],
  },
]

export default problems
