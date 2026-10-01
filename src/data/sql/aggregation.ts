import type { SqlProblem } from '../../types/content'

const problems: SqlProblem[] = [
  {
    id: `daily-active-devices`,
    title: `Daily Active Devices`,
    difficulty: `Easy`,
    category: `Aggregation`,
    description: `An IoT platform counts a device as active on a day when it sends at least one heartbeat.

Return \`event_date\` and \`active_devices\`, the number of distinct devices with a \`heartbeat\` event on that date. Ignore other event types.

Order by \`event_date\` ascending.`,
    schema: `CREATE TABLE device_events (
  event_id INTEGER PRIMARY KEY,
  event_date TEXT NOT NULL,
  device_id TEXT NOT NULL,
  event_type TEXT NOT NULL
);`,
    datasets: [
      `INSERT INTO device_events (event_id, event_date, device_id, event_type) VALUES
  (1, '2026-09-28', 'd1', 'heartbeat'),
  (2, '2026-09-28', 'd1', 'heartbeat'),
  (3, '2026-09-28', 'd2', 'heartbeat'),
  (4, '2026-09-28', 'd3', 'error'),
  (5, '2026-09-29', 'd2', 'heartbeat'),
  (6, '2026-09-29', 'd3', 'heartbeat'),
  (7, '2026-09-30', 'd4', 'error'),
  (8, '2026-09-30', 'd4', 'heartbeat');`,
      `INSERT INTO device_events (event_id, event_date, device_id, event_type) VALUES
  (10, '2026-10-01', 'a', 'heartbeat'),
  (11, '2026-10-01', 'b', 'heartbeat'),
  (12, '2026-10-01', 'b', 'heartbeat'),
  (13, '2026-10-02', 'a', 'error'),
  (14, '2026-10-02', 'c', 'heartbeat');`,
      `INSERT INTO device_events (event_id, event_date, device_id, event_type) VALUES
  (20, '2026-10-03', 'z', 'error'),
  (21, '2026-10-04', 'z', 'heartbeat'),
  (22, '2026-10-04', 'y', 'heartbeat'),
  (23, '2026-10-04', 'y', 'heartbeat');`,
    ],
    orderMatters: true,
    solution: `SELECT
  event_date,
  COUNT(DISTINCT device_id) AS active_devices
FROM device_events
WHERE event_type = 'heartbeat'
GROUP BY event_date
ORDER BY event_date ASC;`,
    explanation: `Filter to heartbeat rows first, then count distinct devices per day so repeated pings from the same device do not inflate activity.

Common mistakes include counting all events or grouping by \`device_id\` as well as the date. An alternative is to select distinct \`(event_date, device_id)\` in a CTE and then count rows per date.`,
    hints: [
      `Only heartbeat events count as active.`,
      `A device can send multiple heartbeats on the same day.`,
      `Use \`COUNT(DISTINCT ...)\` after grouping by date.`,
    ],
  },
  {
    id: `teams-with-repeated-run-failures`,
    title: `Teams With Repeated Run Failures`,
    difficulty: `Medium`,
    category: `Aggregation`,
    description: `The ML platform team wants to prioritize teams with multiple failed training runs in a recent incident window.

For runs started on or after \`2026-09-01\`, return \`team\` and \`failed_runs\` for teams with at least two failed runs.

Order by \`failed_runs\` descending, then \`team\` ascending.`,
    schema: `CREATE TABLE training_runs (
  run_id INTEGER PRIMARY KEY,
  team TEXT NOT NULL,
  status TEXT NOT NULL,
  started_at TEXT NOT NULL
);`,
    datasets: [
      `INSERT INTO training_runs (run_id, team, status, started_at) VALUES
  (1, 'ads', 'failed', '2026-09-02'),
  (2, 'ads', 'succeeded', '2026-09-03'),
  (3, 'ads', 'failed', '2026-09-04'),
  (4, 'search', 'failed', '2026-09-01'),
  (5, 'search', 'failed', '2026-08-31'),
  (6, 'risk', 'failed', '2026-09-10'),
  (7, 'risk', 'failed', '2026-09-11'),
  (8, 'risk', 'failed', '2026-09-12'),
  (9, 'nlp', 'succeeded', '2026-09-12');`,
      `INSERT INTO training_runs (run_id, team, status, started_at) VALUES
  (10, 'vision', 'failed', '2026-09-01'),
  (11, 'vision', 'failed', '2026-09-01'),
  (12, 'vision', 'failed', '2026-08-31'),
  (13, 'audio', 'failed', '2026-09-05'),
  (14, 'audio', 'succeeded', '2026-09-06');`,
      `INSERT INTO training_runs (run_id, team, status, started_at) VALUES
  (20, 'platform', 'succeeded', '2026-09-01'),
  (21, 'platform', 'failed', '2026-09-02'),
  (22, 'platform', 'failed', '2026-09-03'),
  (23, 'ops', 'failed', '2026-09-04'),
  (24, 'ops', 'failed', '2026-09-05');`,
    ],
    orderMatters: true,
    solution: `SELECT
  team,
  SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) AS failed_runs
FROM training_runs
WHERE started_at >= '2026-09-01'
GROUP BY team
HAVING failed_runs >= 2
ORDER BY failed_runs DESC, team ASC;`,
    explanation: `The \`WHERE\` clause limits the time window before grouping. Conditional aggregation counts only failed runs, and \`HAVING\` filters grouped teams by that count.

A common mistake is putting \`failed_runs >= 2\` in \`WHERE\`, where aliases and group totals are not available. Another is filtering to failed rows first and then forgetting that teams with only successes should disappear naturally. An equivalent alternative is \`WHERE status = 'failed'\` followed by \`COUNT(*)\`, but conditional aggregation scales better when other status metrics are also needed.`,
    hints: [
      `Filter the date before grouping.`,
      `Use \`HAVING\` for conditions on aggregate values.`,
      `A \`SUM(CASE ...)\` can count just failures.`,
    ],
  },
  {
    id: `unique-submitters-by-plan`,
    title: `Unique Submitters By Plan`,
    difficulty: `Easy`,
    category: `Aggregation`,
    description: `A coding practice product tracks multiple submissions per user. Product analytics needs unique submitters by plan.

Return \`plan\` and \`unique_submitters\`, counting each \`user_id\` once per plan regardless of how many submissions they made.

Order by \`unique_submitters\` descending, then \`plan\` ascending.`,
    schema: `CREATE TABLE job_submissions (
  submission_id INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL,
  plan TEXT NOT NULL,
  submitted_at TEXT NOT NULL
);`,
    datasets: [
      `INSERT INTO job_submissions (submission_id, user_id, plan, submitted_at) VALUES
  (1, 10, 'free', '2026-09-01'),
  (2, 10, 'free', '2026-09-01'),
  (3, 11, 'free', '2026-09-02'),
  (4, 12, 'pro', '2026-09-02'),
  (5, 13, 'pro', '2026-09-03'),
  (6, 13, 'pro', '2026-09-03'),
  (7, 14, 'enterprise', '2026-09-04');`,
      `INSERT INTO job_submissions (submission_id, user_id, plan, submitted_at) VALUES
  (10, 1, 'pro', '2026-10-01'),
  (11, 1, 'enterprise', '2026-10-02'),
  (12, 2, 'enterprise', '2026-10-02'),
  (13, 3, 'free', '2026-10-03');`,
      `INSERT INTO job_submissions (submission_id, user_id, plan, submitted_at) VALUES
  (20, 5, 'free', '2026-10-04'),
  (21, 6, 'free', '2026-10-04'),
  (22, 7, 'pro', '2026-10-04'),
  (23, 8, 'pro', '2026-10-04');`,
    ],
    orderMatters: true,
    solution: `SELECT
  plan,
  COUNT(DISTINCT user_id) AS unique_submitters
FROM job_submissions
GROUP BY plan
ORDER BY unique_submitters DESC, plan ASC;`,
    explanation: `Group by plan and count distinct users, not submission rows. This handles users who retry many times under the same plan.

Common mistakes are using \`COUNT(*)\`, which measures activity volume, or grouping by both plan and user, which changes the output grain. An alternative is a CTE of distinct \`(plan, user_id)\` pairs followed by \`COUNT(*)\` per plan.`,
    hints: [
      `The unit is user, not submission.`,
      `The same user may submit more than once.`,
      `Use the requested tie-breaker after sorting by the count.`,
    ],
  },
  {
    id: `review-pass-rate-by-repo`,
    title: `Review Pass Rate By Repo`,
    difficulty: `Easy`,
    category: `Aggregation`,
    description: `An internal model registry records review decisions before deployments are allowed to ship.

Return \`repo\`, \`total_reviews\`, and \`pass_rate_pct\`, where the percentage is approved reviews divided by all reviews for that repo times 100. Round the percentage to 2 decimals.

Order by \`pass_rate_pct\` descending, then \`repo\` ascending.`,
    schema: `CREATE TABLE model_reviews (
  review_id INTEGER PRIMARY KEY,
  repo TEXT NOT NULL,
  decision TEXT NOT NULL
);`,
    datasets: [
      `INSERT INTO model_reviews (review_id, repo, decision) VALUES
  (1, 'ads-ranker', 'approved'),
  (2, 'ads-ranker', 'rejected'),
  (3, 'ads-ranker', 'approved'),
  (4, 'fraud-score', 'rejected'),
  (5, 'fraud-score', 'rejected'),
  (6, 'search-ml', 'approved'),
  (7, 'search-ml', 'approved');`,
      `INSERT INTO model_reviews (review_id, repo, decision) VALUES
  (10, 'a', 'approved'),
  (11, 'a', 'approved'),
  (12, 'b', 'rejected'),
  (13, 'b', 'approved'),
  (14, 'c', 'rejected');`,
      `INSERT INTO model_reviews (review_id, repo, decision) VALUES
  (20, 'tie-one', 'approved'),
  (21, 'tie-one', 'rejected'),
  (22, 'tie-two', 'approved'),
  (23, 'tie-two', 'rejected'),
  (24, 'perfect', 'approved');`,
    ],
    orderMatters: true,
    solution: `SELECT
  repo,
  COUNT(*) AS total_reviews,
  ROUND(100.0 * SUM(CASE WHEN decision = 'approved' THEN 1 ELSE 0 END) / COUNT(*), 2) AS pass_rate_pct
FROM model_reviews
GROUP BY repo
ORDER BY pass_rate_pct DESC, repo ASC;`,
    explanation: `The numerator is a conditional count of approved rows, while the denominator is all review rows in the repo group. Multiplying by \`100.0\` forces floating-point division before rounding.

Common mistakes are using integer division, forgetting rejected rows in the denominator, or rounding before division. An alternative is \`AVG(CASE WHEN decision = 'approved' THEN 1.0 ELSE 0.0 END) * 100\`.`,
    hints: [
      `Use all reviews as the denominator.`,
      `\`100.0\` helps avoid integer division.`,
      `Round the final percentage to 2 decimals.`,
    ],
  },
  {
    id: `feature-null-rate`,
    title: `Feature Null Rate`,
    difficulty: `Medium`,
    category: `Aggregation`,
    description: `A feature quality monitor stores sampled values in a long table and reports missingness by feature.

Return \`feature_name\`, \`total_rows\`, and \`null_rate_pct\`, the percentage of rows where \`feature_value\` is \`NULL\`. Round the percentage to 2 decimals.

Order by \`null_rate_pct\` descending, then \`feature_name\` ascending.`,
    schema: `CREATE TABLE feature_samples (
  sample_id INTEGER PRIMARY KEY,
  feature_name TEXT NOT NULL,
  feature_value REAL
);`,
    datasets: [
      `INSERT INTO feature_samples (sample_id, feature_name, feature_value) VALUES
  (1, 'age_days', 10.0),
  (2, 'age_days', NULL),
  (3, 'age_days', 12.0),
  (4, 'spend_30d', NULL),
  (5, 'spend_30d', NULL),
  (6, 'spend_30d', 20.0),
  (7, 'click_rate', 0.2),
  (8, 'click_rate', 0.3);`,
      `INSERT INTO feature_samples (sample_id, feature_name, feature_value) VALUES
  (10, 'f1', NULL),
  (11, 'f1', NULL),
  (12, 'f2', 1.0),
  (13, 'f2', NULL),
  (14, 'f3', 0.0);`,
      `INSERT INTO feature_samples (sample_id, feature_name, feature_value) VALUES
  (20, 'tie_a', NULL),
  (21, 'tie_a', 1.0),
  (22, 'tie_b', NULL),
  (23, 'tie_b', 2.0),
  (24, 'clean', 3.0);`,
    ],
    orderMatters: true,
    solution: `SELECT
  feature_name,
  COUNT(*) AS total_rows,
  ROUND(100.0 * SUM(CASE WHEN feature_value IS NULL THEN 1 ELSE 0 END) / COUNT(*), 2) AS null_rate_pct
FROM feature_samples
GROUP BY feature_name
ORDER BY null_rate_pct DESC, feature_name ASC;`,
    explanation: `Conditional aggregation counts missing values inside each feature group. The denominator remains every sampled row for that feature, so the metric is a true null rate.

Common mistakes include \`COUNT(feature_value)\` as the denominator, which ignores nulls, or comparing to \`= NULL\`. An alternative is \`100.0 * (COUNT(*) - COUNT(feature_value)) / COUNT(*)\`, because \`COUNT(column)\` skips nulls.`,
    hints: [
      `\`COUNT(column)\` ignores nulls, but \`COUNT(*)\` does not.`,
      `Use \`IS NULL\` inside the \`CASE\`.`,
      `Round after computing the percentage.`,
    ],
  },
  {
    id: `average-resolution-hours-by-team`,
    title: `Average Resolution Hours By Team`,
    difficulty: `Medium`,
    category: `Aggregation`,
    description: `An operations dashboard tracks how long resolved incidents take to close.

Return \`team\`, \`resolved_tickets\`, and \`avg_resolution_hours\` for tickets with a non-\`NULL\` \`resolved_at\`. Compute hours from \`opened_at\` to \`resolved_at\` and round the average to 2 decimals.

Order by \`avg_resolution_hours\` descending, then \`team\` ascending.`,
    schema: `CREATE TABLE incident_tickets (
  ticket_id INTEGER PRIMARY KEY,
  team TEXT NOT NULL,
  opened_at TEXT NOT NULL,
  resolved_at TEXT
);`,
    datasets: [
      `INSERT INTO incident_tickets (ticket_id, team, opened_at, resolved_at) VALUES
  (1, 'mlops', '2026-09-01 08:00:00', '2026-09-01 12:00:00'),
  (2, 'mlops', '2026-09-02 08:00:00', NULL),
  (3, 'mlops', '2026-09-03 08:00:00', '2026-09-03 20:00:00'),
  (4, 'serving', '2026-09-01 00:00:00', '2026-09-02 00:00:00'),
  (5, 'serving', '2026-09-05 10:00:00', '2026-09-05 16:30:00'),
  (6, 'data', '2026-09-04 09:00:00', NULL);`,
      `INSERT INTO incident_tickets (ticket_id, team, opened_at, resolved_at) VALUES
  (10, 'a', '2026-10-01 00:00:00', '2026-10-01 01:30:00'),
  (11, 'a', '2026-10-01 00:00:00', '2026-10-01 02:30:00'),
  (12, 'b', '2026-10-01 00:00:00', NULL),
  (13, 'c', '2026-10-01 00:00:00', '2026-10-02 12:00:00');`,
      `INSERT INTO incident_tickets (ticket_id, team, opened_at, resolved_at) VALUES
  (20, 'tie_a', '2026-10-01 00:00:00', '2026-10-01 02:00:00'),
  (21, 'tie_b', '2026-10-01 00:00:00', '2026-10-01 02:00:00'),
  (22, 'open_only', '2026-10-01 00:00:00', NULL);`,
    ],
    orderMatters: true,
    solution: `SELECT
  team,
  COUNT(*) AS resolved_tickets,
  ROUND(AVG((julianday(resolved_at) - julianday(opened_at)) * 24.0), 2) AS avg_resolution_hours
FROM incident_tickets
WHERE resolved_at IS NOT NULL
GROUP BY team
ORDER BY avg_resolution_hours DESC, team ASC;`,
    explanation: `\`julianday\` converts timestamps to day numbers; subtracting and multiplying by 24 gives hours. Filtering unresolved tickets before grouping keeps both the count and average on the resolved-ticket grain.

Common mistakes are averaging unresolved rows as zero or forgetting the \`24.0\` conversion. An alternative is to compute each ticket's hours in a CTE and then aggregate that derived column.`,
    hints: [
      `Unresolved tickets should not be counted.`,
      `\`julianday(end) - julianday(start)\` is measured in days.`,
      `Round the average, not each individual ticket duration unless asked.`,
    ],
  },
  {
    id: `weekly-ingest-volume-by-source`,
    title: `Weekly Ingest Volume By Source`,
    difficulty: `Medium`,
    category: `Aggregation`,
    description: `Data platform owners roll ingest counts up by calendar week and source system.

Return \`year_week\`, \`source\`, and \`rows_ingested\`, summing all rows for each source in each SQLite week (\`strftime('%Y-%W', ingested_at)\`).

Order by \`year_week\` ascending, then \`source\` ascending.`,
    schema: `CREATE TABLE ingest_events (
  event_id INTEGER PRIMARY KEY,
  ingested_at TEXT NOT NULL,
  source TEXT NOT NULL,
  rows_ingested INTEGER NOT NULL
);`,
    datasets: [
      `INSERT INTO ingest_events (event_id, ingested_at, source, rows_ingested) VALUES
  (1, '2026-09-28 01:00:00', 'crm', 1000),
  (2, '2026-09-29 01:00:00', 'crm', 1500),
  (3, '2026-09-30 01:00:00', 'billing', 500),
  (4, '2026-10-05 01:00:00', 'crm', 2000),
  (5, '2026-10-05 02:00:00', 'billing', 750),
  (6, '2026-10-06 01:00:00', 'billing', 250);`,
      `INSERT INTO ingest_events (event_id, ingested_at, source, rows_ingested) VALUES
  (10, '2026-01-01 00:00:00', 'a', 10),
  (11, '2026-01-04 00:00:00', 'a', 20),
  (12, '2026-01-05 00:00:00', 'a', 30),
  (13, '2026-01-05 00:00:00', 'b', 40);`,
      `INSERT INTO ingest_events (event_id, ingested_at, source, rows_ingested) VALUES
  (20, '2026-10-12 00:00:00', 'x', 0),
  (21, '2026-10-12 01:00:00', 'x', 5),
  (22, '2026-10-13 00:00:00', 'y', 5);`,
    ],
    orderMatters: true,
    solution: `SELECT
  strftime('%Y-%W', ingested_at) AS year_week,
  source,
  SUM(rows_ingested) AS rows_ingested
FROM ingest_events
GROUP BY year_week, source
ORDER BY year_week ASC, source ASC;`,
    explanation: `The \`strftime\` expression derives the week key before grouping. Grouping by both week and source keeps each source separate within a week.

Common mistakes include grouping only by source or using day-level dates, which does not roll up the week. An alternative is to compute \`year_week\` in a CTE, which can make longer queries easier to read.`,
    hints: [
      `SQLite's \`strftime\` can format timestamps into week buckets.`,
      `Group by both the derived week and the source.`,
      `The metric is a sum, not a count of events.`,
    ],
  },
  {
    id: `completed-revenue-share-by-channel`,
    title: `Completed Revenue Share By Channel`,
    difficulty: `Medium`,
    category: `Aggregation`,
    description: `Finance wants each acquisition channel's share of completed revenue.

Return \`channel\`, \`revenue\`, and \`revenue_share_pct\` for \`completed\` orders only. \`revenue_share_pct\` is the channel revenue divided by total completed revenue times 100, rounded to 2 decimals.

Order by \`revenue\` descending, then \`channel\` ascending.`,
    schema: `CREATE TABLE commerce_orders (
  order_id INTEGER PRIMARY KEY,
  channel TEXT NOT NULL,
  status TEXT NOT NULL,
  amount REAL NOT NULL
);`,
    datasets: [
      `INSERT INTO commerce_orders (order_id, channel, status, amount) VALUES
  (1, 'ads', 'completed', 100.0),
  (2, 'ads', 'refunded', 50.0),
  (3, 'email', 'completed', 200.0),
  (4, 'organic', 'completed', 100.0),
  (5, 'organic', 'completed', 50.0),
  (6, 'partner', 'canceled', 999.0);`,
      `INSERT INTO commerce_orders (order_id, channel, status, amount) VALUES
  (10, 'a', 'completed', 1.0),
  (11, 'b', 'completed', 2.0),
  (12, 'c', 'completed', 3.0),
  (13, 'a', 'canceled', 100.0);`,
      `INSERT INTO commerce_orders (order_id, channel, status, amount) VALUES
  (20, 'tie_a', 'completed', 50.0),
  (21, 'tie_b', 'completed', 50.0),
  (22, 'zero', 'completed', 0.0),
  (23, 'ignore', 'refunded', 500.0);`,
    ],
    orderMatters: true,
    solution: `WITH channel_revenue AS (
  SELECT
    channel,
    SUM(amount) AS revenue
  FROM commerce_orders
  WHERE status = 'completed'
  GROUP BY channel
), total_revenue AS (
  SELECT SUM(revenue) AS total_revenue
  FROM channel_revenue
)
SELECT
  c.channel,
  c.revenue,
  ROUND(100.0 * c.revenue / t.total_revenue, 2) AS revenue_share_pct
FROM channel_revenue AS c
CROSS JOIN total_revenue AS t
ORDER BY c.revenue DESC, c.channel ASC;`,
    explanation: `First aggregate completed revenue by channel, then compute the grand total from those channel totals. A cross join attaches the one-row total to each channel so the ratio can be calculated.

Common mistakes are including refunded/canceled orders in the denominator or using integer division. An alternative is a window sum, \`SUM(SUM(amount)) OVER ()\`, but the two-CTE version is easier to read for interviews.`,
    hints: [
      `Filter to completed orders before any revenue totals.`,
      `The denominator is total completed revenue across all channels.`,
      `Use \`100.0\` and \`ROUND(..., 2)\` for the percentage.`,
    ],
  },
  {
    id: `projects-over-storage-threshold`,
    title: `Projects Over Storage Threshold`,
    difficulty: `Medium`,
    category: `Aggregation`,
    description: `Infra wants projects that have crossed a storage threshold and have enough snapshots to trust the trend.

Return \`project_id\`, \`snapshots\`, and \`max_storage_gb\` for projects with at least two snapshots and a maximum \`storage_gb\` greater than \`100\`.

Order by \`max_storage_gb\` descending, then \`project_id\` ascending.`,
    schema: `CREATE TABLE artifact_snapshots (
  snapshot_id INTEGER PRIMARY KEY,
  project_id TEXT NOT NULL,
  snapshot_date TEXT NOT NULL,
  storage_gb REAL NOT NULL
);`,
    datasets: [
      `INSERT INTO artifact_snapshots (snapshot_id, project_id, snapshot_date, storage_gb) VALUES
  (1, 'ads', '2026-09-01', 80.0),
  (2, 'ads', '2026-09-08', 120.0),
  (3, 'search', '2026-09-01', 101.0),
  (4, 'risk', '2026-09-01', 90.0),
  (5, 'risk', '2026-09-08', 99.0),
  (6, 'vision', '2026-09-01', 150.0),
  (7, 'vision', '2026-09-08', 150.0);`,
      `INSERT INTO artifact_snapshots (snapshot_id, project_id, snapshot_date, storage_gb) VALUES
  (10, 'one_snapshot', '2026-10-01', 200.0),
  (11, 'boundary', '2026-10-01', 100.0),
  (12, 'boundary', '2026-10-02', 100.0),
  (13, 'over', '2026-10-01', 100.0),
  (14, 'over', '2026-10-02', 100.1);`,
      `INSERT INTO artifact_snapshots (snapshot_id, project_id, snapshot_date, storage_gb) VALUES
  (20, 'tie_a', '2026-10-01', 50.0),
  (21, 'tie_a', '2026-10-02', 150.0),
  (22, 'tie_b', '2026-10-01', 60.0),
  (23, 'tie_b', '2026-10-02', 150.0);`,
    ],
    orderMatters: true,
    solution: `SELECT
  project_id,
  COUNT(*) AS snapshots,
  MAX(storage_gb) AS max_storage_gb
FROM artifact_snapshots
GROUP BY project_id
HAVING COUNT(*) >= 2
   AND MAX(storage_gb) > 100
ORDER BY max_storage_gb DESC, project_id ASC;`,
    explanation: `Both conditions depend on grouped values, so they belong in \`HAVING\`. \`COUNT(*)\` measures snapshot count and \`MAX(storage_gb)\` finds the peak observed storage.

Common mistakes are using \`WHERE storage_gb > 100\`, which can hide lower snapshots before counting, or treating exactly 100 as over the threshold. An alternative is a CTE that aggregates per project and then filters the aggregated result in an outer query.`,
    hints: [
      `Snapshot count and maximum storage are aggregate values.`,
      `The threshold is strictly greater than 100.`,
      `Do not filter individual rows before counting snapshots.`,
    ],
  },
  {
    id: `monthly-repeat-active-users`,
    title: `Monthly Repeat Active Users`,
    difficulty: `Hard`,
    category: `Aggregation`,
    description: `Product analytics defines a repeat active user as someone with at least two events in the same calendar month.

Return \`event_month\`, \`active_users\`, \`repeat_users\`, and \`repeat_rate_pct\`. \`active_users\` counts users with at least one event in the month; \`repeat_users\` counts users with at least two events in that month. Round the rate to 2 decimals.

Order by \`event_month\` ascending.`,
    schema: `CREATE TABLE product_events (
  event_id INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL,
  event_at TEXT NOT NULL,
  event_name TEXT NOT NULL
);`,
    datasets: [
      `INSERT INTO product_events (event_id, user_id, event_at, event_name) VALUES
  (1, 1, '2026-09-01 09:00:00', 'open'),
  (2, 1, '2026-09-02 09:00:00', 'search'),
  (3, 2, '2026-09-05 09:00:00', 'open'),
  (4, 3, '2026-09-08 09:00:00', 'open'),
  (5, 3, '2026-09-08 10:00:00', 'click'),
  (6, 1, '2026-10-01 09:00:00', 'open'),
  (7, 2, '2026-10-02 09:00:00', 'open'),
  (8, 2, '2026-10-03 09:00:00', 'click');`,
      `INSERT INTO product_events (event_id, user_id, event_at, event_name) VALUES
  (10, 10, '2026-01-31 23:00:00', 'open'),
  (11, 10, '2026-02-01 00:10:00', 'open'),
  (12, 10, '2026-02-02 00:10:00', 'click'),
  (13, 11, '2026-02-02 00:10:00', 'open');`,
      `INSERT INTO product_events (event_id, user_id, event_at, event_name) VALUES
  (20, 20, '2026-03-01', 'open'),
  (21, 21, '2026-03-01', 'open'),
  (22, 22, '2026-03-01', 'open'),
  (23, 22, '2026-03-02', 'click');`,
    ],
    orderMatters: true,
    solution: `WITH user_months AS (
  SELECT
    strftime('%Y-%m', event_at) AS event_month,
    user_id,
    COUNT(*) AS events_in_month
  FROM product_events
  GROUP BY event_month, user_id
)
SELECT
  event_month,
  COUNT(*) AS active_users,
  SUM(CASE WHEN events_in_month >= 2 THEN 1 ELSE 0 END) AS repeat_users,
  ROUND(100.0 * SUM(CASE WHEN events_in_month >= 2 THEN 1 ELSE 0 END) / COUNT(*), 2) AS repeat_rate_pct
FROM user_months
GROUP BY event_month
ORDER BY event_month ASC;`,
    explanation: `The first CTE moves to the user-month grain and counts events per user in each month. The outer query then counts user-month rows and conditionally counts those with at least two events.

Common mistakes are counting repeat events instead of repeat users, or letting events from different months combine. An alternative is to use \`COUNT(DISTINCT CASE WHEN ... THEN user_id END)\` after a subquery, but the two-step grain change is easier to reason about.`,
    hints: [
      `First decide the correct grain: one row per user per month.`,
      `A repeat user has at least two events in that same month.`,
      `The rate denominator is active users, not total events.`,
    ],
  },
]

export default problems
