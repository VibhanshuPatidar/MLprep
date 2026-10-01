import type { SqlProblem } from '../../types/content'

const problems: SqlProblem[] = [
  {
    id: `top-two-models-per-workspace`,
    title: `Top Two Models Per Workspace`,
    difficulty: `Medium`,
    category: `Window Functions`,
    description: `Each workspace can register many candidate models. Reviewers want the two highest validation AUC models per workspace.

Return \`workspace_id\`, \`model_name\`, \`validation_auc\`, and \`model_rank\`. Use \`ROW_NUMBER\` so exactly two rows are returned per workspace when at least two models exist. Break AUC ties by \`model_name\` ascending.

Order by \`workspace_id\`, \`model_rank\`, then \`model_name\` ascending.`,
    schema: `CREATE TABLE workspace_model_scores (
  score_id INTEGER PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  model_name TEXT NOT NULL,
  validation_auc REAL NOT NULL
);`,
    datasets: [
      `INSERT INTO workspace_model_scores (score_id, workspace_id, model_name, validation_auc) VALUES
  (1, 'ads', 'wide_lr', 0.781),
  (2, 'ads', 'deep_ctr', 0.812),
  (3, 'ads', 'gbdt_ctr', 0.812),
  (4, 'search', 'bm25_mix', 0.735),
  (5, 'search', 'bert_ranker', 0.801),
  (6, 'search', 'linear_ranker', 0.702),
  (7, 'risk', 'xgb_v1', 0.900);`,
      `INSERT INTO workspace_model_scores (score_id, workspace_id, model_name, validation_auc) VALUES
  (10, 'a', 'm1', 0.5),
  (11, 'a', 'm2', 0.6),
  (12, 'b', 'm3', 0.9),
  (13, 'b', 'm4', 0.8),
  (14, 'b', 'm5', 0.8);`,
      `INSERT INTO workspace_model_scores (score_id, workspace_id, model_name, validation_auc) VALUES
  (20, 'solo', 'only_model', 0.7),
  (21, 'tie', 'alpha', 0.8),
  (22, 'tie', 'beta', 0.8),
  (23, 'tie', 'gamma', 0.8);`,
    ],
    orderMatters: true,
    solution: `WITH ranked AS (
  SELECT
    workspace_id,
    model_name,
    validation_auc,
    ROW_NUMBER() OVER (
      PARTITION BY workspace_id
      ORDER BY validation_auc DESC, model_name ASC
    ) AS model_rank
  FROM workspace_model_scores
)
SELECT
  workspace_id,
  model_name,
  validation_auc,
  model_rank
FROM ranked
WHERE model_rank <= 2
ORDER BY workspace_id ASC, model_rank ASC, model_name ASC;`,
    explanation: `\`ROW_NUMBER\` assigns a deterministic position inside each workspace after sorting by AUC and then model name. Filtering the windowed result keeps the top two positions.

Common mistakes are using \`RANK\`, which can return more than two rows when there are ties, or omitting the tie-breaker. An alternative is a correlated subquery that counts better models, but the window function is clearer and usually faster.`,
    hints: [
      `Partition the ranking by workspace.`,
      `Sort AUC descending, then model name ascending.`,
      `Filter the window result in an outer query or CTE.`,
    ],
  },
  {
    id: `benchmark-loss-rankings`,
    title: `Benchmark Loss Rankings`,
    difficulty: `Easy`,
    category: `Window Functions`,
    description: `A benchmark table stores validation loss for submitted models. Lower loss is better, and tied losses should share the same competition rank.

Return \`model_name\`, \`validation_loss\`, and \`loss_rank\` for all models using \`RANK\` over ascending loss.

Order by \`loss_rank\` ascending, then \`model_name\` ascending.`,
    schema: `CREATE TABLE benchmark_results (
  model_name TEXT PRIMARY KEY,
  validation_loss REAL NOT NULL
);`,
    datasets: [
      `INSERT INTO benchmark_results (model_name, validation_loss) VALUES
  ('baseline_lr', 0.420),
  ('tree_boost', 0.350),
  ('deep_tabular', 0.350),
  ('wide_deep', 0.380),
  ('memorizer', 0.500);`,
      `INSERT INTO benchmark_results (model_name, validation_loss) VALUES
  ('a', 1.0),
  ('b', 1.0),
  ('c', 2.0),
  ('d', 3.0);`,
      `INSERT INTO benchmark_results (model_name, validation_loss) VALUES
  ('best', 0.1),
  ('middle', 0.2),
  ('worst', 0.3);`,
    ],
    orderMatters: true,
    solution: `SELECT
  model_name,
  validation_loss,
  RANK() OVER (ORDER BY validation_loss ASC) AS loss_rank
FROM benchmark_results
ORDER BY loss_rank ASC, model_name ASC;`,
    explanation: `\`RANK\` gives tied losses the same rank and leaves gaps after ties, matching competition-style rankings. The final \`ORDER BY\` makes display deterministic.

Common mistakes are ordering loss descending or using \`ROW_NUMBER\`, which would split ties. \`DENSE_RANK\` is an alternative when the next rank after a tie should not skip numbers, but that is not the rule here.`,
    hints: [
      `Lower loss should rank earlier.`,
      `Ties should share the same rank.`,
      `Use \`RANK\`, not \`ROW_NUMBER\`, for competition ranks.`,
    ],
  },
  {
    id: `latency-dense-rank-by-region`,
    title: `Latency Dense Rank By Region`,
    difficulty: `Medium`,
    category: `Window Functions`,
    description: `Serving SREs compare endpoint latency within each region. Equal p95 latency should receive the same tier without gaps.

Return \`region\`, \`endpoint\`, \`p95_ms\`, and \`latency_rank\` using \`DENSE_RANK\` per region ordered by \`p95_ms\` ascending.

Order by \`region\`, \`latency_rank\`, then \`endpoint\` ascending.`,
    schema: `CREATE TABLE endpoint_latency (
  endpoint TEXT NOT NULL,
  region TEXT NOT NULL,
  p95_ms REAL NOT NULL,
  PRIMARY KEY (endpoint, region)
);`,
    datasets: [
      `INSERT INTO endpoint_latency (endpoint, region, p95_ms) VALUES
  ('recommend', 'us-east', 120.0),
  ('search', 'us-east', 95.0),
  ('ads', 'us-east', 95.0),
  ('fraud', 'us-east', 180.0),
  ('recommend', 'eu-west', 150.0),
  ('search', 'eu-west', 140.0),
  ('ads', 'eu-west', 150.0);`,
      `INSERT INTO endpoint_latency (endpoint, region, p95_ms) VALUES
  ('a', 'r1', 10.0),
  ('b', 'r1', 20.0),
  ('c', 'r1', 20.0),
  ('d', 'r1', 30.0),
  ('a', 'r2', 5.0);`,
      `INSERT INTO endpoint_latency (endpoint, region, p95_ms) VALUES
  ('x', 'single', 1.0),
  ('y', 'tie', 2.0),
  ('z', 'tie', 2.0);`,
    ],
    orderMatters: true,
    solution: `SELECT
  region,
  endpoint,
  p95_ms,
  DENSE_RANK() OVER (
    PARTITION BY region
    ORDER BY p95_ms ASC
  ) AS latency_rank
FROM endpoint_latency
ORDER BY region ASC, latency_rank ASC, endpoint ASC;`,
    explanation: `Partitioning by region restarts the ranking for each geography. \`DENSE_RANK\` keeps equal latencies together and does not skip the next rank.

Common mistakes are ranking globally across all regions or using \`RANK\`, which leaves gaps after ties. An alternative is to aggregate endpoints by latency first and join ranks back, but the window function does it directly.`,
    hints: [
      `Each region should have its own rank sequence.`,
      `Lower p95 latency is better.`,
      `Dense ranks do not skip numbers after a tie.`,
    ],
  },
  {
    id: `running-gpu-hours-by-team`,
    title: `Running GPU Hours By Team`,
    difficulty: `Easy`,
    category: `Window Functions`,
    description: `Finance tracks cumulative GPU consumption throughout the month for each team.

Return \`team\`, \`usage_date\`, \`gpu_hours\`, and \`running_gpu_hours\`, the cumulative sum of \`gpu_hours\` for that team ordered by date.

Order by \`team\`, \`usage_date\`, then \`usage_id\` ascending.`,
    schema: `CREATE TABLE daily_gpu_usage (
  usage_id INTEGER PRIMARY KEY,
  team TEXT NOT NULL,
  usage_date TEXT NOT NULL,
  gpu_hours REAL NOT NULL
);`,
    datasets: [
      `INSERT INTO daily_gpu_usage (usage_id, team, usage_date, gpu_hours) VALUES
  (1, 'ads', '2026-09-01', 10.0),
  (2, 'ads', '2026-09-02', 12.5),
  (3, 'search', '2026-09-01', 8.0),
  (4, 'ads', '2026-09-03', 0.0),
  (5, 'search', '2026-09-02', 9.5),
  (6, 'search', '2026-09-02', 1.5);`,
      `INSERT INTO daily_gpu_usage (usage_id, team, usage_date, gpu_hours) VALUES
  (10, 'risk', '2026-10-01', 5.0),
  (11, 'risk', '2026-10-01', 7.0),
  (12, 'risk', '2026-10-02', 3.0),
  (13, 'nlp', '2026-10-01', 4.0);`,
      `INSERT INTO daily_gpu_usage (usage_id, team, usage_date, gpu_hours) VALUES
  (20, 'a', '2026-01-02', 2.0),
  (21, 'a', '2026-01-01', 1.0),
  (22, 'b', '2026-01-01', 10.0);`,
    ],
    orderMatters: true,
    solution: `SELECT
  team,
  usage_date,
  gpu_hours,
  SUM(gpu_hours) OVER (
    PARTITION BY team
    ORDER BY usage_date ASC, usage_id ASC
    ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
  ) AS running_gpu_hours
FROM daily_gpu_usage
ORDER BY team ASC, usage_date ASC, usage_id ASC;`,
    explanation: `A windowed \`SUM\` keeps each original row while adding the cumulative total over earlier rows in the same team. Including \`usage_id\` in the window order handles multiple records on the same date deterministically.

Common mistakes are using \`GROUP BY\`, which collapses the detail rows, or forgetting a tie-breaker inside the window order. An alternative is a self-join summing all earlier rows, but that is more verbose and less efficient.`,
    hints: [
      `A running total keeps the original row grain.`,
      `Partition by team so totals reset.`,
      `Use \`ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW\` for an explicit cumulative frame.`,
    ],
  },
  {
    id: `three-day-moving-average-signups`,
    title: `Three-Day Moving Average Signups`,
    difficulty: `Medium`,
    category: `Window Functions`,
    description: `Growth analysts smooth daily signup counts with a trailing three-row moving average.

Return \`signup_date\`, \`signups\`, and \`moving_avg_3d\`, the average of the current row and up to two prior rows when ordered by \`signup_date\`. Round the average to 2 decimals.

Order by \`signup_date\` ascending.`,
    schema: `CREATE TABLE daily_signups (
  signup_date TEXT PRIMARY KEY,
  signups INTEGER NOT NULL
);`,
    datasets: [
      `INSERT INTO daily_signups (signup_date, signups) VALUES
  ('2026-09-01', 10),
  ('2026-09-02', 20),
  ('2026-09-03', 30),
  ('2026-09-04', 15),
  ('2026-09-05', 25);`,
      `INSERT INTO daily_signups (signup_date, signups) VALUES
  ('2026-10-01', 0),
  ('2026-10-02', 6),
  ('2026-10-03', 6),
  ('2026-10-04', 6);`,
      `INSERT INTO daily_signups (signup_date, signups) VALUES
  ('2026-01-02', 100),
  ('2026-01-03', 50),
  ('2026-01-04', 0);`,
    ],
    orderMatters: true,
    solution: `SELECT
  signup_date,
  signups,
  ROUND(AVG(signups) OVER (
    ORDER BY signup_date ASC
    ROWS BETWEEN 2 PRECEDING AND CURRENT ROW
  ), 2) AS moving_avg_3d
FROM daily_signups
ORDER BY signup_date ASC;`,
    explanation: `The window frame \`2 PRECEDING\` through current row creates a trailing three-row average. At the beginning of the series, SQLite averages the rows that exist.

Common mistakes are using a centered frame or dividing by 3 even when fewer than three rows are available. An alternative is a self-join on dates, but row-based windows are concise for contiguous daily data.`,
    hints: [
      `Use a windowed \`AVG\`, not a grouped average.`,
      `The frame includes the current row.`,
      `Early rows have fewer than three observations.`,
    ],
  },
  {
    id: `day-over-day-dau-change`,
    title: `Day-Over-Day DAU Change`,
    difficulty: `Easy`,
    category: `Window Functions`,
    description: `A product dashboard needs the change in daily active users compared with the previous recorded day.

Return \`activity_date\`, \`dau\`, \`previous_dau\`, and \`dau_delta\`. For the first row, both \`previous_dau\` and \`dau_delta\` should be \`NULL\`.

Order by \`activity_date\` ascending.`,
    schema: `CREATE TABLE daily_activity_counts (
  activity_date TEXT PRIMARY KEY,
  dau INTEGER NOT NULL
);`,
    datasets: [
      `INSERT INTO daily_activity_counts (activity_date, dau) VALUES
  ('2026-09-01', 100),
  ('2026-09-02', 125),
  ('2026-09-03', 120),
  ('2026-09-05', 160);`,
      `INSERT INTO daily_activity_counts (activity_date, dau) VALUES
  ('2026-10-01', 10),
  ('2026-10-02', 10),
  ('2026-10-03', 5);`,
      `INSERT INTO daily_activity_counts (activity_date, dau) VALUES
  ('2026-01-01', 1),
  ('2026-01-10', 4);`,
    ],
    orderMatters: true,
    solution: `WITH lagged AS (
  SELECT
    activity_date,
    dau,
    LAG(dau) OVER (ORDER BY activity_date ASC) AS previous_dau
  FROM daily_activity_counts
)
SELECT
  activity_date,
  dau,
  previous_dau,
  dau - previous_dau AS dau_delta
FROM lagged
ORDER BY activity_date ASC;`,
    explanation: `\`LAG\` reads the previous row's DAU in date order. Subtracting from \`NULL\` on the first row naturally returns \`NULL\` for the delta.

Common mistakes include joining on \`date - 1 day\`, which fails when days are missing, or replacing the first delta with zero when the report asked for \`NULL\`. An alternative self-join can work for complete calendars but is less robust to gaps.`,
    hints: [
      `Use the previous recorded row, not necessarily yesterday's calendar date.`,
      `\`LAG(dau)\` gives the prior value.`,
      `\`NULL\` arithmetic produces \`NULL\` for the first delta.`,
    ],
  },
  {
    id: `minutes-to-next-session`,
    title: `Minutes To Next Session`,
    difficulty: `Medium`,
    category: `Window Functions`,
    description: `Lifecycle analysts study how long users wait before their next session.

Return \`user_id\`, \`session_id\`, \`started_at\`, and \`minutes_to_next_session\`. The gap is measured from the current session start to the next session start for the same user, rounded to 2 decimals. The final session for a user should have \`NULL\` gap.

Order by \`user_id\`, \`started_at\`, then \`session_id\` ascending.`,
    schema: `CREATE TABLE app_sessions (
  session_id INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL,
  started_at TEXT NOT NULL
);`,
    datasets: [
      `INSERT INTO app_sessions (session_id, user_id, started_at) VALUES
  (1, 101, '2026-09-01 09:00:00'),
  (2, 101, '2026-09-01 09:45:00'),
  (3, 101, '2026-09-02 10:00:00'),
  (4, 102, '2026-09-01 08:00:00'),
  (5, 102, '2026-09-01 08:30:30'),
  (6, 103, '2026-09-03 12:00:00');`,
      `INSERT INTO app_sessions (session_id, user_id, started_at) VALUES
  (10, 1, '2026-10-01 00:00:00'),
  (11, 1, '2026-10-01 00:00:00'),
  (12, 1, '2026-10-01 01:00:00'),
  (13, 2, '2026-10-02 00:00:00');`,
      `INSERT INTO app_sessions (session_id, user_id, started_at) VALUES
  (20, 5, '2026-01-01 00:00:00'),
  (21, 5, '2026-01-08 00:00:00'),
  (22, 6, '2026-01-02 12:00:00'),
  (23, 6, '2026-01-02 12:15:00');`,
    ],
    orderMatters: true,
    solution: `WITH ordered AS (
  SELECT
    user_id,
    session_id,
    started_at,
    LEAD(started_at) OVER (
      PARTITION BY user_id
      ORDER BY started_at ASC, session_id ASC
    ) AS next_started_at
  FROM app_sessions
)
SELECT
  user_id,
  session_id,
  started_at,
  ROUND((julianday(next_started_at) - julianday(started_at)) * 24.0 * 60.0, 2) AS minutes_to_next_session
FROM ordered
ORDER BY user_id ASC, started_at ASC, session_id ASC;`,
    explanation: `\`LEAD\` finds the next session start within each user. The \`julianday\` difference is converted from days to minutes and rounded; when there is no next session, the expression remains \`NULL\`.

Common mistakes are computing the next session globally across users or omitting a tie-breaker when two sessions share a timestamp. An alternative is a correlated subquery for the minimum later session, but it is more cumbersome.`,
    hints: [
      `Partition by \`user_id\` so users do not mix.`,
      `Use \`LEAD(started_at)\` to look forward.`,
      `Convert days to minutes with \`* 24 * 60\`.`,
    ],
  },
  {
    id: `login-streaks-at-least-three-days`,
    title: `Login Streaks At Least Three Days`,
    difficulty: `Hard`,
    category: `Window Functions`,
    description: `Engagement analysts define a login streak as consecutive calendar days with at least one login by the same user.

Return \`user_id\`, \`streak_start\`, \`streak_end\`, and \`days_in_streak\` for streaks that last at least 3 days. Multiple logins on the same day count once.

Order by \`user_id\`, \`streak_start\` ascending.`,
    schema: `CREATE TABLE user_logins (
  login_id INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL,
  login_date TEXT NOT NULL
);`,
    datasets: [
      `INSERT INTO user_logins (login_id, user_id, login_date) VALUES
  (1, 1, '2026-09-01'),
  (2, 1, '2026-09-02'),
  (3, 1, '2026-09-02'),
  (4, 1, '2026-09-03'),
  (5, 1, '2026-09-05'),
  (6, 2, '2026-09-01'),
  (7, 2, '2026-09-03'),
  (8, 2, '2026-09-04'),
  (9, 2, '2026-09-05'),
  (10, 3, '2026-09-10');`,
      `INSERT INTO user_logins (login_id, user_id, login_date) VALUES
  (10, 10, '2026-10-01'),
  (11, 10, '2026-10-02'),
  (12, 10, '2026-10-04'),
  (13, 10, '2026-10-05'),
  (14, 10, '2026-10-06'),
  (15, 11, '2026-10-01'),
  (16, 11, '2026-10-02'),
  (17, 11, '2026-10-03');`,
      `INSERT INTO user_logins (login_id, user_id, login_date) VALUES
  (20, 20, '2026-01-01'),
  (21, 20, '2026-01-03'),
  (22, 20, '2026-01-04'),
  (23, 20, '2026-01-05'),
  (24, 20, '2026-01-06'),
  (25, 21, '2026-01-01'),
  (26, 21, '2026-01-01'),
  (27, 21, '2026-01-02'),
  (28, 21, '2026-01-03');`,
    ],
    orderMatters: true,
    solution: `WITH distinct_days AS (
  SELECT DISTINCT user_id, login_date
  FROM user_logins
), numbered AS (
  SELECT
    user_id,
    login_date,
    ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY login_date ASC) AS rn
  FROM distinct_days
), grouped AS (
  SELECT
    user_id,
    login_date,
    date(login_date, '-' || rn || ' day') AS streak_group
  FROM numbered
)
SELECT
  user_id,
  MIN(login_date) AS streak_start,
  MAX(login_date) AS streak_end,
  COUNT(*) AS days_in_streak
FROM grouped
GROUP BY user_id, streak_group
HAVING COUNT(*) >= 3
ORDER BY user_id ASC, streak_start ASC;`,
    explanation: `After deduplicating login days, \`ROW_NUMBER\` creates a sequence per user. For consecutive dates, subtracting the row number in days produces the same grouping key, so each island can be aggregated.

Common mistakes are forgetting to deduplicate same-day logins or using raw row ids instead of ordered dates. An alternative is to use \`LAG\` to mark breaks and a running sum of break flags to form groups.`,
    hints: [
      `Start with distinct user/date pairs.`,
      `Consecutive dates share a stable \`date - row_number\` key.`,
      `Filter streak length with \`HAVING\` after grouping.`,
    ],
  },
  {
    id: `sensor-reading-gaps`,
    title: `Sensor Reading Gaps`,
    difficulty: `Medium`,
    category: `Window Functions`,
    description: `A reliability job looks for missing daily sensor readings. A gap exists when the next recorded date for the same sensor is more than one day after the previous recorded date.

Return \`sensor_id\`, \`previous_reading_date\`, \`reading_date\`, and \`missing_days\` for each detected gap. \`missing_days\` is the number of calendar days between the two readings that have no reading.

Order by \`sensor_id\`, \`reading_date\` ascending.`,
    schema: `CREATE TABLE sensor_daily_readings (
  reading_id INTEGER PRIMARY KEY,
  sensor_id TEXT NOT NULL,
  reading_date TEXT NOT NULL
);`,
    datasets: [
      `INSERT INTO sensor_daily_readings (reading_id, sensor_id, reading_date) VALUES
  (1, 's1', '2026-09-01'),
  (2, 's1', '2026-09-02'),
  (3, 's1', '2026-09-05'),
  (4, 's2', '2026-09-01'),
  (5, 's2', '2026-09-03'),
  (6, 's2', '2026-09-04'),
  (7, 's3', '2026-09-10');`,
      `INSERT INTO sensor_daily_readings (reading_id, sensor_id, reading_date) VALUES
  (10, 'a', '2026-01-01'),
  (11, 'a', '2026-01-01'),
  (12, 'a', '2026-01-02'),
  (13, 'a', '2026-01-04'),
  (14, 'b', '2026-01-05'),
  (15, 'b', '2026-01-08');`,
      `INSERT INTO sensor_daily_readings (reading_id, sensor_id, reading_date) VALUES
  (20, 'x', '2026-02-01'),
  (21, 'x', '2026-02-02'),
  (22, 'x', '2026-02-03'),
  (23, 'y', '2026-02-01'),
  (24, 'y', '2026-02-05');`,
    ],
    orderMatters: true,
    solution: `WITH distinct_readings AS (
  SELECT DISTINCT sensor_id, reading_date
  FROM sensor_daily_readings
), lagged AS (
  SELECT
    sensor_id,
    reading_date,
    LAG(reading_date) OVER (
      PARTITION BY sensor_id
      ORDER BY reading_date ASC
    ) AS previous_reading_date
  FROM distinct_readings
)
SELECT
  sensor_id,
  previous_reading_date,
  reading_date,
  CAST(julianday(reading_date) - julianday(previous_reading_date) - 1 AS INTEGER) AS missing_days
FROM lagged
WHERE previous_reading_date IS NOT NULL
  AND julianday(reading_date) - julianday(previous_reading_date) > 1
ORDER BY sensor_id ASC, reading_date ASC;`,
    explanation: `Deduplicate readings by sensor and date, then use \`LAG\` to compare each date with the prior recorded date for that sensor. If the day difference is greater than one, the days in between are missing.

Common mistakes include counting duplicate readings as zero-day gaps or comparing sensors against each other. An alternative is to generate a full calendar and anti-join missing days, but the lag approach is ideal when only gap summaries are needed.`,
    hints: [
      `Compare each reading to the previous reading for the same sensor.`,
      `Duplicate readings on the same date should not create gaps.`,
      `Subtract one from the date difference to get missing days.`,
    ],
  },
  {
    id: `score-quartiles-with-ntile`,
    title: `Score Quartiles With NTILE`,
    difficulty: `Medium`,
    category: `Window Functions`,
    description: `A recruiting model assigns each candidate a score. Recruiters want four roughly equal score bands, with the highest scores in quartile 1.

Return \`candidate_id\`, \`score\`, and \`score_quartile\` using \`NTILE(4)\` ordered by \`score\` descending and \`candidate_id\` ascending.

Order by \`score_quartile\`, \`score\` descending, then \`candidate_id\` ascending.`,
    schema: `CREATE TABLE candidate_scores (
  candidate_id INTEGER PRIMARY KEY,
  score REAL NOT NULL
);`,
    datasets: [
      `INSERT INTO candidate_scores (candidate_id, score) VALUES
  (1, 98.0),
  (2, 91.0),
  (3, 91.0),
  (4, 88.0),
  (5, 82.0),
  (6, 76.0),
  (7, 70.0),
  (8, 65.0),
  (9, 60.0);`,
      `INSERT INTO candidate_scores (candidate_id, score) VALUES
  (10, 4.0),
  (11, 3.0),
  (12, 2.0),
  (13, 1.0);`,
      `INSERT INTO candidate_scores (candidate_id, score) VALUES
  (20, 10.0),
  (21, 10.0),
  (22, 9.0),
  (23, 8.0),
  (24, 7.0),
  (25, 6.0);`,
    ],
    orderMatters: true,
    solution: `SELECT
  candidate_id,
  score,
  NTILE(4) OVER (ORDER BY score DESC, candidate_id ASC) AS score_quartile
FROM candidate_scores
ORDER BY score_quartile ASC, score DESC, candidate_id ASC;`,
    explanation: `\`NTILE(4)\` assigns ordered rows into four buckets as evenly as possible. Sorting by score descending makes quartile 1 the strongest band, and candidate id resolves ties.

Common mistakes are ordering ascending, which puts low scores in quartile 1, or expecting exact percentiles when the row count is not divisible by four. An alternative is percentile cutoffs computed with ranks, but \`NTILE\` directly matches the requested banding.`,
    hints: [
      `Quartile 1 should contain the highest scores.`,
      `\`NTILE(4)\` needs an \`ORDER BY\` inside \`OVER\`.`,
      `Tie-break with \`candidate_id\` for deterministic buckets.`,
    ],
  },
  {
    id: `second-highest-salary-by-department`,
    title: `Second Highest Salary By Department`,
    difficulty: `Medium`,
    category: `Window Functions`,
    description: `People analytics needs the second-highest distinct salary in each department.

Return \`department\` and \`second_highest_salary\` for departments with at least two distinct salary values. If multiple employees share the second-highest salary, return the salary once.

Order by \`department\` ascending.`,
    schema: `CREATE TABLE employee_salaries (
  employee_id INTEGER PRIMARY KEY,
  department TEXT NOT NULL,
  salary INTEGER NOT NULL
);`,
    datasets: [
      `INSERT INTO employee_salaries (employee_id, department, salary) VALUES
  (1, 'ML', 210000),
  (2, 'ML', 210000),
  (3, 'ML', 190000),
  (4, 'Data', 160000),
  (5, 'Data', 150000),
  (6, 'Data', 150000),
  (7, 'Ops', 120000);`,
      `INSERT INTO employee_salaries (employee_id, department, salary) VALUES
  (10, 'A', 100),
  (11, 'A', 90),
  (12, 'A', 80),
  (13, 'B', 50),
  (14, 'B', 50),
  (15, 'C', 40),
  (16, 'C', 30);`,
      `INSERT INTO employee_salaries (employee_id, department, salary) VALUES
  (20, 'Tie', 300),
  (21, 'Tie', 200),
  (22, 'Tie', 200),
  (23, 'Solo', 100);`,
    ],
    orderMatters: true,
    solution: `WITH ranked AS (
  SELECT
    department,
    salary,
    DENSE_RANK() OVER (
      PARTITION BY department
      ORDER BY salary DESC
    ) AS salary_rank
  FROM employee_salaries
)
SELECT DISTINCT
  department,
  salary AS second_highest_salary
FROM ranked
WHERE salary_rank = 2
ORDER BY department ASC;`,
    explanation: `\`DENSE_RANK\` ranks distinct salary levels within each department, so duplicate top salaries do not push the true second-highest salary to rank 3. \`DISTINCT\` collapses multiple employees with the same second salary.

Common mistakes are using \`ROW_NUMBER\`, which ranks employees rather than salary values, or returning departments with only one salary. An alternative is to select distinct salaries first and then apply \`ROW_NUMBER\` to those salary levels.`,
    hints: [
      `You need the second distinct salary value.`,
      `Duplicate salaries should share the same rank.`,
      `Filter to rank 2 in an outer query.`,
    ],
  },
  {
    id: `median-latency-by-endpoint`,
    title: `Median Latency By Endpoint`,
    difficulty: `Hard`,
    category: `Window Functions`,
    description: `Performance engineers prefer median latency because occasional outliers can distort averages.

Return \`endpoint\` and \`median_latency_ms\` for each endpoint. For an odd number of requests, use the middle latency; for an even number, average the two middle latencies. Round the median to 2 decimals.

Order by \`endpoint\` ascending.`,
    schema: `CREATE TABLE request_latencies (
  request_id INTEGER PRIMARY KEY,
  endpoint TEXT NOT NULL,
  latency_ms REAL NOT NULL
);`,
    datasets: [
      `INSERT INTO request_latencies (request_id, endpoint, latency_ms) VALUES
  (1, 'search', 90.0),
  (2, 'search', 110.0),
  (3, 'search', 100.0),
  (4, 'ads', 40.0),
  (5, 'ads', 60.0),
  (6, 'ads', 1000.0),
  (7, 'ads', 80.0),
  (8, 'recommend', 200.0);`,
      `INSERT INTO request_latencies (request_id, endpoint, latency_ms) VALUES
  (10, 'a', 1.0),
  (11, 'a', 2.0),
  (12, 'b', 5.0),
  (13, 'b', 5.0),
  (14, 'b', 9.0);`,
      `INSERT INTO request_latencies (request_id, endpoint, latency_ms) VALUES
  (20, 'x', 10.0),
  (21, 'x', 30.0),
  (22, 'x', 20.0),
  (23, 'x', 40.0),
  (24, 'y', 7.5);`,
    ],
    orderMatters: true,
    solution: `WITH ordered AS (
  SELECT
    endpoint,
    latency_ms,
    ROW_NUMBER() OVER (
      PARTITION BY endpoint
      ORDER BY latency_ms ASC, request_id ASC
    ) AS rn,
    COUNT(*) OVER (PARTITION BY endpoint) AS cnt
  FROM request_latencies
)
SELECT
  endpoint,
  ROUND(AVG(latency_ms), 2) AS median_latency_ms
FROM ordered
WHERE rn IN ((cnt + 1) / 2, (cnt + 2) / 2)
GROUP BY endpoint
ORDER BY endpoint ASC;`,
    explanation: `The CTE numbers latencies from low to high and records the endpoint count. The two integer positions \`(cnt + 1) / 2\` and \`(cnt + 2) / 2\` select the same middle row for odd counts or the two middle rows for even counts, then \`AVG\` computes the median.

Common mistakes include using average latency instead of median, or forgetting a deterministic tie-breaker in the row numbering. An alternative is to use percent-rank style interpolation, but the requested SQL interview median is the middle-row median.`,
    hints: [
      `Compute row numbers and counts per endpoint.`,
      `Odd counts select one middle row; even counts select two.`,
      `Averaging the selected middle row(s) gives the median.`,
    ],
  },
]

export default problems
