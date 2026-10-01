import type { SqlProblem } from '../../types/content'

const problems: SqlProblem[] = [
  {
    id: `active-enterprise-sensors`,
    title: `Active Enterprise Sensors`,
    difficulty: `Easy`,
    category: `Select & Filter`,
    description: `The observability team only wants sensors that are both paid for and recently reporting.

Return one row per sensor with columns \`sensor_id\`, \`team\`, and \`last_seen_at\` for enabled enterprise sensors in \`us-east\` or \`us-west\` whose \`last_seen_at\` is on or after \`2026-09-01\`. Sensors with a missing \`last_seen_at\` are not considered active.

Order by \`last_seen_at\` descending, then \`sensor_id\` ascending.`,
    schema: `CREATE TABLE model_sensors (
  sensor_id INTEGER PRIMARY KEY,
  team TEXT NOT NULL,
  plan TEXT NOT NULL,
  is_enabled INTEGER NOT NULL,
  last_seen_at TEXT,
  region TEXT NOT NULL
);`,
    datasets: [
      `INSERT INTO model_sensors (sensor_id, team, plan, is_enabled, last_seen_at, region) VALUES
  (1, 'ranking', 'enterprise', 1, '2026-09-28 08:00:00', 'us-east'),
  (2, 'ads', 'free', 1, '2026-09-29 09:15:00', 'us-west'),
  (3, 'search', 'enterprise', 0, '2026-09-27 10:00:00', 'us-east'),
  (4, 'fraud', 'enterprise', 1, NULL, 'us-west'),
  (5, 'mlops', 'enterprise', 1, '2026-08-31 23:59:00', 'us-east'),
  (6, 'vision', 'enterprise', 1, '2026-09-15 12:30:00', 'eu-central'),
  (7, 'platform', 'enterprise', 1, '2026-09-28 08:00:00', 'us-west'),
  (8, 'pricing', 'enterprise', 1, '2026-09-04 18:45:00', 'us-east');`,
      `INSERT INTO model_sensors (sensor_id, team, plan, is_enabled, last_seen_at, region) VALUES
  (10, 'growth', 'enterprise', 1, '2026-09-01 00:00:00', 'us-east'),
  (11, 'growth', 'enterprise', 1, '2026-09-01 00:00:00', 'us-west'),
  (12, 'ops', 'enterprise', 1, '2026-08-30 00:00:00', 'us-west'),
  (13, 'risk', 'enterprise', 1, NULL, 'us-east'),
  (14, 'risk', 'team', 1, '2026-09-10 00:00:00', 'us-east');`,
      `INSERT INTO model_sensors (sensor_id, team, plan, is_enabled, last_seen_at, region) VALUES
  (21, 'audio', 'enterprise', 1, '2026-10-01 07:00:00', 'us-west'),
  (22, 'audio', 'enterprise', 1, '2026-10-01 07:00:00', 'us-east'),
  (23, 'nlp', 'enterprise', 0, '2026-10-01 07:00:00', 'us-east'),
  (24, 'nlp', 'enterprise', 1, '2026-10-02 07:00:00', 'ap-south');`,
    ],
    orderMatters: true,
    solution: `SELECT
  sensor_id,
  team,
  last_seen_at
FROM model_sensors
WHERE plan = 'enterprise'
  AND is_enabled = 1
  AND region IN ('us-east', 'us-west')
  AND last_seen_at IS NOT NULL
  AND last_seen_at >= '2026-09-01'
ORDER BY last_seen_at DESC, sensor_id ASC;`,
    explanation: `Use plain predicates for each business rule and explicitly remove missing timestamps before comparing dates. ISO timestamps sort correctly as text in SQLite, so the string comparison is deterministic here.

Common mistakes are accidentally keeping disabled sensors, forgetting that \`NULL >= ...\` is not true, or ordering only by timestamp when two sensors have the same value. An alternative is to wrap \`last_seen_at\` in \`datetime(...)\`, but it is not required for consistently formatted ISO strings.`,
    hints: [
      `Treat \`is_enabled\` as a 0/1 flag.`,
      `Rows with \`NULL\` timestamps should fail the active check.`,
      `Add \`sensor_id\` as a tie-breaker in the \`ORDER BY\`.`,
    ],
  },
  {
    id: `incomplete-labeling-batches`,
    title: `Incomplete Labeling Batches`,
    difficulty: `Easy`,
    category: `Select & Filter`,
    description: `A labeling queue stores one row per batch. A batch still needs attention when it has work in it and neither approval nor rejection has been recorded.

Return \`batch_id\`, \`dataset_name\`, and \`item_count\` for batches where \`item_count\` is greater than zero and both \`approved_at\` and \`rejected_at\` are \`NULL\`.

Order by \`dataset_name\` ascending, then \`batch_id\` ascending.`,
    schema: `CREATE TABLE label_batches (
  batch_id INTEGER PRIMARY KEY,
  dataset_name TEXT NOT NULL,
  reviewer_id INTEGER,
  approved_at TEXT,
  rejected_at TEXT,
  item_count INTEGER NOT NULL
);`,
    datasets: [
      `INSERT INTO label_batches (batch_id, dataset_name, reviewer_id, approved_at, rejected_at, item_count) VALUES
  (101, 'intent_eval', 44, NULL, NULL, 120),
  (102, 'intent_eval', 44, '2026-09-20', NULL, 80),
  (103, 'vision_holdout', NULL, NULL, NULL, 0),
  (104, 'toxicity_audit', 51, NULL, '2026-09-19', 30),
  (105, 'vision_holdout', NULL, NULL, NULL, 60),
  (106, 'entity_linking', 52, NULL, NULL, 15);`,
      `INSERT INTO label_batches (batch_id, dataset_name, reviewer_id, approved_at, rejected_at, item_count) VALUES
  (201, 'speech_eval', NULL, NULL, NULL, 1),
  (202, 'speech_eval', 70, NULL, NULL, 1),
  (203, 'speech_eval', 71, '2026-09-30', NULL, 1),
  (204, 'tabular_eval', 72, NULL, '2026-09-30', 1);`,
      `INSERT INTO label_batches (batch_id, dataset_name, reviewer_id, approved_at, rejected_at, item_count) VALUES
  (301, 'ranking_eval', 80, '2026-09-01', NULL, 50),
  (302, 'ranking_eval', 81, NULL, '2026-09-02', 50),
  (303, 'ranking_eval', NULL, NULL, NULL, 25),
  (304, 'ranking_eval', NULL, NULL, NULL, 0);`,
    ],
    orderMatters: true,
    solution: `SELECT
  batch_id,
  dataset_name,
  item_count
FROM label_batches
WHERE item_count > 0
  AND approved_at IS NULL
  AND rejected_at IS NULL
ORDER BY dataset_name ASC, batch_id ASC;`,
    explanation: `The query uses \`IS NULL\` for both terminal timestamp columns because equality comparisons do not work with \`NULL\`. The positive item count check removes empty placeholders from the work queue.

A common mistake is writing \`approved_at = NULL\`, which never returns true. Another is treating a missing reviewer as incomplete; the definition depends only on approval, rejection, and item count. An equivalent alternative is \`COALESCE(approved_at, rejected_at) IS NULL\` plus the item count filter.`,
    hints: [
      `Use \`IS NULL\`, not \`= NULL\`.`,
      `Empty batches should not be returned even if both timestamps are missing.`,
      `The reviewer field is not part of the incomplete definition.`,
    ],
  },
  {
    id: `deployment-risk-buckets`,
    title: `Deployment Risk Buckets`,
    difficulty: `Easy`,
    category: `Select & Filter`,
    description: `Platform reviewers want a readable risk label for each deployment before triage.

Return \`deployment_id\`, \`model_name\`, and \`risk_bucket\`. The bucket is \`unknown\` when \`error_rate\` is \`NULL\`, \`red\` when it is at least \`0.10\`, \`yellow\` when it is at least \`0.05\` but below \`0.10\`, and \`green\` otherwise.

Order by \`deployment_id\` ascending.`,
    schema: `CREATE TABLE deployments (
  deployment_id INTEGER PRIMARY KEY,
  model_name TEXT NOT NULL,
  environment TEXT NOT NULL,
  error_rate REAL
);`,
    datasets: [
      `INSERT INTO deployments (deployment_id, model_name, environment, error_rate) VALUES
  (1, 'ranker_v4', 'prod', 0.021),
  (2, 'ranker_v5', 'staging', 0.051),
  (3, 'fraud_xgb', 'prod', 0.140),
  (4, 'intent_bert', 'qa', NULL),
  (5, 'pricing_lr', 'sandbox', 0.099),
  (6, 'vision_clip', 'prod', 0.000);`,
      `INSERT INTO deployments (deployment_id, model_name, environment, error_rate) VALUES
  (10, 'edge_case_low', 'prod', 0.050),
  (11, 'edge_case_high', 'prod', 0.100),
  (12, 'missing_metric', 'prod', NULL),
  (13, 'healthy', 'dev', 0.049);`,
      `INSERT INTO deployments (deployment_id, model_name, environment, error_rate) VALUES
  (20, 'all_green_a', 'prod', 0.001),
  (21, 'all_green_b', 'staging', 0.020),
  (22, 'all_green_c', 'qa', 0.049);`,
    ],
    orderMatters: true,
    solution: `SELECT
  deployment_id,
  model_name,
  CASE
    WHEN error_rate IS NULL THEN 'unknown'
    WHEN error_rate >= 0.10 THEN 'red'
    WHEN error_rate >= 0.05 THEN 'yellow'
    ELSE 'green'
  END AS risk_bucket
FROM deployments
ORDER BY deployment_id ASC;`,
    explanation: `A searched \`CASE\` expression checks the most specific states in order. \`NULL\` must be handled first because numeric comparisons with \`NULL\` do not evaluate to true.

Common mistakes are putting the \`0.05\` branch before the \`0.10\` branch or letting missing metrics fall into \`green\`. An alternative is to materialize threshold labels in a small lookup table, but the inline \`CASE\` is clearer for fixed interview thresholds.`,
    hints: [
      `A \`CASE WHEN\` can create a derived text column.`,
      `Check \`NULL\` before numeric comparisons.`,
      `Put the red threshold before the yellow threshold.`,
    ],
  },
  {
    id: `recent-large-feature-jobs`,
    title: `Recent Large Feature Jobs`,
    difficulty: `Easy`,
    category: `Select & Filter`,
    description: `A feature store dashboard highlights successful jobs that wrote a substantial amount of data during the current review window.

Return \`job_id\`, \`owner\`, and \`rows_written\` for jobs with \`status = 'succeeded'\`, at least \`100000\` rows written, and \`finished_at\` on or after \`2026-09-24\`.

Order by \`rows_written\` descending, then \`job_id\` ascending.`,
    schema: `CREATE TABLE feature_jobs (
  job_id INTEGER PRIMARY KEY,
  owner TEXT NOT NULL,
  status TEXT NOT NULL,
  rows_written INTEGER,
  finished_at TEXT
);`,
    datasets: [
      `INSERT INTO feature_jobs (job_id, owner, status, rows_written, finished_at) VALUES
  (1, 'maya', 'succeeded', 150000, '2026-09-24 02:00:00'),
  (2, 'nora', 'failed', 900000, '2026-09-25 02:00:00'),
  (3, 'li', 'succeeded', 99999, '2026-09-26 02:00:00'),
  (4, 'omar', 'succeeded', 220000, '2026-09-23 23:59:00'),
  (5, 'maya', 'succeeded', 220000, '2026-09-29 04:30:00'),
  (6, 'zoe', 'succeeded', NULL, '2026-09-29 05:00:00'),
  (7, 'li', 'succeeded', 100000, '2026-09-24 00:00:00');`,
      `INSERT INTO feature_jobs (job_id, owner, status, rows_written, finished_at) VALUES
  (11, 'ari', 'succeeded', 100000, '2026-09-24 00:00:00'),
  (12, 'ari', 'succeeded', 100000, '2026-09-24 00:00:01'),
  (13, 'bea', 'queued', 500000, NULL),
  (14, 'cam', 'succeeded', 100001, NULL);`,
      `INSERT INTO feature_jobs (job_id, owner, status, rows_written, finished_at) VALUES
  (21, 'dev', 'failed', 1000000, '2026-09-30'),
  (22, 'dev', 'succeeded', 1000000, '2026-10-01'),
  (23, 'ops', 'succeeded', 1000000, '2026-10-01');`,
    ],
    orderMatters: true,
    solution: `SELECT
  job_id,
  owner,
  rows_written
FROM feature_jobs
WHERE status = 'succeeded'
  AND rows_written >= 100000
  AND finished_at >= '2026-09-24'
ORDER BY rows_written DESC, job_id ASC;`,
    explanation: `The filter applies all three dashboard rules directly. \`rows_written >= 100000\` automatically excludes \`NULL\` row counts, and the ISO timestamp text compares safely against the fixed cutoff.

A common mistake is using \`>\` instead of \`>=\`, which drops boundary jobs. Another is sorting by owner and hiding the requested volume ranking. An alternative is to cast \`finished_at\` with \`date(finished_at)\`, but doing so would change how boundary times are interpreted.`,
    hints: [
      `The cutoff is inclusive.`,
      `A \`NULL\` row count should not satisfy the minimum.`,
      `Break row-count ties by \`job_id\`.`,
    ],
  },
  {
    id: `paid-users-with-profiles`,
    title: `Paid Users With Profiles`,
    difficulty: `Easy`,
    category: `Joins`,
    description: `Marketing wants contactable paid users whose profile has a known country.

Return \`user_id\`, \`email\`, and \`country\` for users on the \`pro\` or \`enterprise\` plan that have a matching profile row with a non-\`NULL\` \`country\`.

Order by \`country\` ascending, then \`email\` ascending, then \`user_id\` ascending.`,
    schema: `CREATE TABLE app_users (
  user_id INTEGER PRIMARY KEY,
  email TEXT NOT NULL,
  plan TEXT NOT NULL
);

CREATE TABLE user_profiles (
  user_id INTEGER PRIMARY KEY,
  country TEXT,
  job_title TEXT
);`,
    datasets: [
      `INSERT INTO app_users (user_id, email, plan) VALUES
  (1, 'ana@example.com', 'free'),
  (2, 'ben@example.com', 'pro'),
  (3, 'cy@example.com', 'enterprise'),
  (4, 'dia@example.com', 'pro'),
  (5, 'eli@example.com', 'enterprise');
INSERT INTO user_profiles (user_id, country, job_title) VALUES
  (1, 'US', 'analyst'),
  (2, 'CA', 'ml engineer'),
  (3, NULL, 'data scientist'),
  (4, 'US', 'manager'),
  (6, 'GB', 'contractor');`,
      `INSERT INTO app_users (user_id, email, plan) VALUES
  (10, 'ivy@example.com', 'pro'),
  (11, 'jay@example.com', 'enterprise'),
  (12, 'kay@example.com', 'free');
INSERT INTO user_profiles (user_id, country, job_title) VALUES
  (10, 'IN', 'engineer'),
  (11, 'IN', 'lead'),
  (12, 'IN', 'student');`,
      `INSERT INTO app_users (user_id, email, plan) VALUES
  (20, 'lex@example.com', 'pro'),
  (21, 'mia@example.com', 'enterprise'),
  (22, 'noa@example.com', 'pro');
INSERT INTO user_profiles (user_id, country, job_title) VALUES
  (20, NULL, 'architect'),
  (21, 'DE', 'scientist');`,
    ],
    orderMatters: true,
    solution: `SELECT
  u.user_id,
  u.email,
  p.country
FROM app_users AS u
JOIN user_profiles AS p
  ON p.user_id = u.user_id
WHERE u.plan IN ('pro', 'enterprise')
  AND p.country IS NOT NULL
ORDER BY p.country ASC, u.email ASC, u.user_id ASC;`,
    explanation: `An inner join is appropriate because the report requires a matching profile row. The plan filter is applied to the user table and the known-country filter is applied to the profile table.

Common mistakes include using a left join and then forgetting to remove missing profiles, or allowing free users because their profile is complete. An alternative is a semi-join with \`WHERE EXISTS\`, but the inner join is simpler because the country must be selected.`,
    hints: [
      `Start from users, then join profiles on \`user_id\`.`,
      `Only \`pro\` and \`enterprise\` plans qualify.`,
      `A matched profile with \`NULL\` country is still incomplete.`,
    ],
  },
  {
    id: `unassigned-critical-alerts`,
    title: `Unassigned Critical Alerts`,
    difficulty: `Medium`,
    category: `Joins`,
    description: `Incident response needs severe alerts that have not yet been attached to an incident.

Return \`alert_id\`, \`service\`, and \`severity\` for open alerts with severity \`critical\` or \`high\` that have no row in \`alert_incidents\`.

Order with \`critical\` alerts first, then \`high\`, and break ties by \`alert_id\` ascending.`,
    schema: `CREATE TABLE alerts (
  alert_id INTEGER PRIMARY KEY,
  service TEXT NOT NULL,
  severity TEXT NOT NULL,
  status TEXT NOT NULL
);

CREATE TABLE alert_incidents (
  alert_id INTEGER NOT NULL,
  incident_id INTEGER NOT NULL
);`,
    datasets: [
      `INSERT INTO alerts (alert_id, service, severity, status) VALUES
  (1, 'feature-store', 'critical', 'open'),
  (2, 'api', 'high', 'open'),
  (3, 'training', 'medium', 'open'),
  (4, 'serving', 'critical', 'closed'),
  (5, 'billing', 'high', 'open'),
  (6, 'search', 'critical', 'open');
INSERT INTO alert_incidents (alert_id, incident_id) VALUES
  (2, 9001),
  (6, 9002),
  (99, 9003);`,
      `INSERT INTO alerts (alert_id, service, severity, status) VALUES
  (10, 'a', 'high', 'open'),
  (11, 'b', 'critical', 'open'),
  (12, 'c', 'critical', 'open'),
  (13, 'd', 'high', 'closed');
INSERT INTO alert_incidents (alert_id, incident_id) VALUES
  (10, 1);`,
      `INSERT INTO alerts (alert_id, service, severity, status) VALUES
  (20, 'x', 'critical', 'open'),
  (21, 'y', 'high', 'open'),
  (22, 'z', 'low', 'open');
INSERT INTO alert_incidents (alert_id, incident_id) VALUES
  (20, 2),
  (21, 3);`,
    ],
    orderMatters: true,
    solution: `SELECT
  a.alert_id,
  a.service,
  a.severity
FROM alerts AS a
LEFT JOIN alert_incidents AS ai
  ON ai.alert_id = a.alert_id
WHERE a.status = 'open'
  AND a.severity IN ('critical', 'high')
  AND ai.alert_id IS NULL
ORDER BY
  CASE a.severity WHEN 'critical' THEN 0 ELSE 1 END,
  a.alert_id ASC;`,
    explanation: `This is a left anti-join: keep every qualifying alert from the left table, join possible incident rows, and then keep only the rows where the join found nothing.

Common mistakes are putting the \`ai.alert_id IS NULL\` predicate in the \`ON\` clause or using an inner join, both of which change the anti-join. An alternative is \`WHERE NOT EXISTS (SELECT 1 FROM alert_incidents ... )\`, which is often clearer when duplicate incident rows are possible.`,
    hints: [
      `A left join keeps alerts even when no incident matches.`,
      `After the join, missing incident matches appear as \`NULL\` on the right side.`,
      `Use a \`CASE\` expression for the custom severity order.`,
    ],
  },
  {
    id: `dormant-customers-without-orders`,
    title: `Dormant Customers Without Orders`,
    difficulty: `Medium`,
    category: `Joins`,
    description: `A lifecycle campaign targets older customers who have never completed an order.

Return \`customer_id\` and \`customer_name\` for customers created before \`2026-09-01\` who do not have any order with \`status = 'completed'\`. Canceled and refunded orders should not disqualify a customer.

Order by \`customer_id\` ascending.`,
    schema: `CREATE TABLE customers (
  customer_id INTEGER PRIMARY KEY,
  customer_name TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE orders (
  order_id INTEGER PRIMARY KEY,
  customer_id INTEGER NOT NULL,
  status TEXT NOT NULL,
  amount REAL NOT NULL
);`,
    datasets: [
      `INSERT INTO customers (customer_id, customer_name, created_at) VALUES
  (1, 'Acorn Labs', '2026-08-15'),
  (2, 'Beacon AI', '2026-08-20'),
  (3, 'Cedar Data', '2026-09-10'),
  (4, 'Delta ML', '2026-07-01'),
  (5, 'Ember Ops', '2026-06-30');
INSERT INTO orders (order_id, customer_id, status, amount) VALUES
  (100, 1, 'completed', 200.0),
  (101, 2, 'canceled', 50.0),
  (102, 2, 'refunded', 75.0),
  (103, 3, 'completed', 150.0),
  (104, 5, 'canceled', 30.0);`,
      `INSERT INTO customers (customer_id, customer_name, created_at) VALUES
  (10, 'Fjord', '2026-08-31'),
  (11, 'Grove', '2026-09-01'),
  (12, 'Harbor', '2026-08-01');
INSERT INTO orders (order_id, customer_id, status, amount) VALUES
  (200, 10, 'completed', 10.0),
  (201, 12, 'refunded', 20.0);`,
      `INSERT INTO customers (customer_id, customer_name, created_at) VALUES
  (20, 'Ion', '2026-01-01'),
  (21, 'Juno', '2026-02-01');
INSERT INTO orders (order_id, customer_id, status, amount) VALUES
  (300, 20, 'completed', 30.0),
  (301, 20, 'completed', 40.0),
  (302, 21, 'canceled', 50.0);`,
    ],
    orderMatters: true,
    solution: `SELECT
  c.customer_id,
  c.customer_name
FROM customers AS c
LEFT JOIN orders AS o
  ON o.customer_id = c.customer_id
 AND o.status = 'completed'
WHERE c.created_at < '2026-09-01'
  AND o.order_id IS NULL
ORDER BY c.customer_id ASC;`,
    explanation: `Place the completed-order condition inside the join so only completed orders can match. Customers with no such match have \`NULL\` on the order side and are the target audience.

A common mistake is joining all orders and then filtering \`o.status <> 'completed'\`, which keeps customers who have both completed and canceled orders. An alternative is \`NOT EXISTS\`, which avoids duplicate join rows and is also a strong choice.`,
    hints: [
      `Only completed orders should count as a match.`,
      `The created date cutoff is strict: before \`2026-09-01\`.`,
      `A customer with only canceled orders should be returned.`,
    ],
  },
  {
    id: `employee-manager-directory`,
    title: `Employee Manager Directory`,
    difficulty: `Easy`,
    category: `Joins`,
    description: `People analytics needs a simple directory of employees and their direct manager names.

Return \`employee_name\` and \`manager_name\` for employees whose \`manager_id\` points to another row in the same table. Top-level employees with no manager should be excluded.

Order by \`manager_name\` ascending, then \`employee_name\` ascending.`,
    schema: `CREATE TABLE employees (
  employee_id INTEGER PRIMARY KEY,
  employee_name TEXT NOT NULL,
  manager_id INTEGER,
  department TEXT NOT NULL
);`,
    datasets: [
      `INSERT INTO employees (employee_id, employee_name, manager_id, department) VALUES
  (1, 'Riya', NULL, 'ML'),
  (2, 'Sam', 1, 'ML'),
  (3, 'Tess', 1, 'ML'),
  (4, 'Uma', 2, 'Data'),
  (5, 'Vic', NULL, 'Data'),
  (6, 'Wen', 5, 'Data');`,
      `INSERT INTO employees (employee_id, employee_name, manager_id, department) VALUES
  (10, 'Ava', NULL, 'Ops'),
  (11, 'Bo', 10, 'Ops'),
  (12, 'Cy', 10, 'Ops'),
  (13, 'Dee', 99, 'Ops');`,
      `INSERT INTO employees (employee_id, employee_name, manager_id, department) VALUES
  (20, 'Eli', NULL, 'Research'),
  (21, 'Fay', 20, 'Research'),
  (22, 'Gia', 21, 'Research'),
  (23, 'Hal', 21, 'Research');`,
    ],
    orderMatters: true,
    solution: `SELECT
  e.employee_name,
  m.employee_name AS manager_name
FROM employees AS e
JOIN employees AS m
  ON m.employee_id = e.manager_id
ORDER BY m.employee_name ASC, e.employee_name ASC;`,
    explanation: `A self-join treats the table as two roles: \`e\` for employee and \`m\` for manager. The inner join naturally removes top-level employees and invalid manager references.

Common mistakes are joining on department instead of \`manager_id\`, or using the wrong alias in the select list. An alternative left self-join would include top-level employees, but that does not match this report.`,
    hints: [
      `Use the employee table twice with two aliases.`,
      `Match \`e.manager_id\` to \`m.employee_id\`.`,
      `Select names from the correct aliases.`,
    ],
  },
  {
    id: `same-day-device-swaps`,
    title: `Same-Day Device Swaps`,
    difficulty: `Medium`,
    category: `Joins`,
    description: `Security analysts flag users who authenticate from more than one device on the same calendar day.

Return unique pairs with columns \`user_id\`, \`event_date\`, \`first_device\`, and \`second_device\`. Each pair should show the lexicographically smaller device as \`first_device\`, and duplicate event rows must not duplicate pairs.

Order by \`user_id\`, \`event_date\`, \`first_device\`, then \`second_device\` ascending.`,
    schema: `CREATE TABLE login_events (
  event_id INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL,
  device_id TEXT NOT NULL,
  event_time TEXT NOT NULL
);`,
    datasets: [
      `INSERT INTO login_events (event_id, user_id, device_id, event_time) VALUES
  (1, 101, 'phone', '2026-09-28 08:00:00'),
  (2, 101, 'laptop', '2026-09-28 09:00:00'),
  (3, 101, 'phone', '2026-09-28 10:00:00'),
  (4, 102, 'tablet', '2026-09-28 11:00:00'),
  (5, 102, 'tablet', '2026-09-29 11:00:00'),
  (6, 103, 'desktop', '2026-09-29 07:00:00'),
  (7, 103, 'phone', '2026-09-29 08:00:00'),
  (8, 103, 'tablet', '2026-09-29 09:00:00');`,
      `INSERT INTO login_events (event_id, user_id, device_id, event_time) VALUES
  (10, 201, 'a', '2026-09-01 00:01:00'),
  (11, 201, 'b', '2026-09-01 00:02:00'),
  (12, 201, 'b', '2026-09-01 00:03:00'),
  (13, 201, 'a', '2026-09-02 00:01:00'),
  (14, 202, 'c', '2026-09-01 00:01:00');`,
      `INSERT INTO login_events (event_id, user_id, device_id, event_time) VALUES
  (20, 301, 'mobile', '2026-10-01 23:59:00'),
  (21, 301, 'web', '2026-10-02 00:01:00'),
  (22, 302, 'mobile', '2026-10-02 00:01:00'),
  (23, 302, 'web', '2026-10-02 00:02:00');`,
    ],
    orderMatters: true,
    solution: `SELECT DISTINCT
  a.user_id,
  date(a.event_time) AS event_date,
  a.device_id AS first_device,
  b.device_id AS second_device
FROM login_events AS a
JOIN login_events AS b
  ON b.user_id = a.user_id
 AND date(b.event_time) = date(a.event_time)
 AND a.device_id < b.device_id
ORDER BY a.user_id ASC, event_date ASC, first_device ASC, second_device ASC;`,
    explanation: `The self-join pairs events for the same user and calendar date. Requiring \`a.device_id < b.device_id\` both removes same-device matches and chooses a stable ordering for the pair; \`DISTINCT\` removes repeated logins from the same devices.

Common mistakes are comparing full timestamps instead of dates or returning both \`(phone, laptop)\` and \`(laptop, phone)\`. An alternative is to first select distinct \`(user_id, date, device_id)\` in a CTE and then self-join that smaller set.`,
    hints: [
      `Convert the timestamp to a date before matching.`,
      `Use an inequality between device ids to avoid mirrored pairs.`,
      `Repeated logins from the same devices should collapse to one pair.`,
    ],
  },
  {
    id: `launched-experiments-without-exposures`,
    title: `Launched Experiments Without Exposures`,
    difficulty: `Medium`,
    category: `Joins`,
    description: `Experiment owners need to find active tests that launched but have not actually exposed any users since launch.

Return \`experiment_id\`, \`experiment_name\`, and \`launch_at\` for experiments with \`status = 'active'\` and no exposure whose \`exposed_at\` is on or after that experiment's \`launch_at\`.

Order by \`launch_at\` ascending, then \`experiment_id\` ascending.`,
    schema: `CREATE TABLE experiments (
  experiment_id INTEGER PRIMARY KEY,
  experiment_name TEXT NOT NULL,
  status TEXT NOT NULL,
  launch_at TEXT NOT NULL
);

CREATE TABLE exposure_events (
  exposure_id INTEGER PRIMARY KEY,
  experiment_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  exposed_at TEXT NOT NULL
);`,
    datasets: [
      `INSERT INTO experiments (experiment_id, experiment_name, status, launch_at) VALUES
  (1, 'search_ranker', 'active', '2026-09-01 00:00:00'),
  (2, 'checkout_copy', 'active', '2026-09-05 00:00:00'),
  (3, 'feed_cards', 'paused', '2026-09-01 00:00:00'),
  (4, 'email_subjects', 'active', '2026-09-10 00:00:00');
INSERT INTO exposure_events (exposure_id, experiment_id, user_id, exposed_at) VALUES
  (100, 1, 10, '2026-09-01 10:00:00'),
  (101, 2, 11, '2026-09-04 23:00:00'),
  (102, 3, 12, '2026-09-02 10:00:00'),
  (103, 99, 13, '2026-09-02 10:00:00');`,
      `INSERT INTO experiments (experiment_id, experiment_name, status, launch_at) VALUES
  (10, 'model_banner', 'active', '2026-10-01 00:00:00'),
  (11, 'model_banner_v2', 'active', '2026-10-01 00:00:00'),
  (12, 'archived_test', 'ended', '2026-09-01 00:00:00');
INSERT INTO exposure_events (exposure_id, experiment_id, user_id, exposed_at) VALUES
  (200, 10, 1, '2026-10-01 00:00:00'),
  (201, 11, 2, '2026-09-30 23:59:59');`,
      `INSERT INTO experiments (experiment_id, experiment_name, status, launch_at) VALUES
  (20, 'no_events_a', 'active', '2026-08-01 00:00:00'),
  (21, 'no_events_b', 'active', '2026-08-02 00:00:00');
INSERT INTO exposure_events (exposure_id, experiment_id, user_id, exposed_at) VALUES
  (300, 20, 1, '2026-07-31 23:00:00');`,
    ],
    orderMatters: true,
    solution: `SELECT
  e.experiment_id,
  e.experiment_name,
  e.launch_at
FROM experiments AS e
LEFT JOIN exposure_events AS x
  ON x.experiment_id = e.experiment_id
 AND x.exposed_at >= e.launch_at
WHERE e.status = 'active'
  AND x.exposure_id IS NULL
ORDER BY e.launch_at ASC, e.experiment_id ASC;`,
    explanation: `The key is to anti-join only exposures that happened on or after launch. Pre-launch test events are joined out by the \`ON\` predicate and therefore do not count.

Common mistakes are checking for no exposure ever, which incorrectly disqualifies experiments with only pre-launch QA data, or putting the timestamp condition in \`WHERE\`. \`NOT EXISTS\` with the same timestamp predicate is an equivalent alternative.`,
    hints: [
      `The exposure timestamp condition belongs with the join match.`,
      `Only active experiments should be considered.`,
      `Pre-launch exposure rows should not count.`,
    ],
  },
  {
    id: `open-tickets-assignee-labels`,
    title: `Open Tickets Assignee Labels`,
    difficulty: `Easy`,
    category: `Joins`,
    description: `Support leaders want open tickets with a human-readable assignee label, even when the ticket is not assigned yet.

Return \`ticket_id\`, \`priority\`, and \`assignee_name\` for open tickets. Use the literal \`Unassigned\` when \`assignee_id\` is \`NULL\` or does not match an agent row.

Order by priority with \`urgent\` first, then \`normal\`, then \`low\`, and break ties by \`ticket_id\` ascending.`,
    schema: `CREATE TABLE support_tickets (
  ticket_id INTEGER PRIMARY KEY,
  priority TEXT NOT NULL,
  status TEXT NOT NULL,
  assignee_id INTEGER
);

CREATE TABLE agents (
  agent_id INTEGER PRIMARY KEY,
  agent_name TEXT NOT NULL
);`,
    datasets: [
      `INSERT INTO support_tickets (ticket_id, priority, status, assignee_id) VALUES
  (1, 'urgent', 'open', 10),
  (2, 'normal', 'open', NULL),
  (3, 'low', 'closed', 11),
  (4, 'urgent', 'open', 99),
  (5, 'low', 'open', 11);
INSERT INTO agents (agent_id, agent_name) VALUES
  (10, 'Priya'),
  (11, 'Marco');`,
      `INSERT INTO support_tickets (ticket_id, priority, status, assignee_id) VALUES
  (10, 'normal', 'open', 20),
  (11, 'urgent', 'open', 20),
  (12, 'low', 'open', NULL),
  (13, 'urgent', 'closed', NULL);
INSERT INTO agents (agent_id, agent_name) VALUES
  (20, 'Nia');`,
      `INSERT INTO support_tickets (ticket_id, priority, status, assignee_id) VALUES
  (20, 'low', 'open', 100),
  (21, 'normal', 'open', 101);
INSERT INTO agents (agent_id, agent_name) VALUES
  (101, 'Oren');`,
    ],
    orderMatters: true,
    solution: `SELECT
  t.ticket_id,
  t.priority,
  COALESCE(a.agent_name, 'Unassigned') AS assignee_name
FROM support_tickets AS t
LEFT JOIN agents AS a
  ON a.agent_id = t.assignee_id
WHERE t.status = 'open'
ORDER BY
  CASE t.priority
    WHEN 'urgent' THEN 0
    WHEN 'normal' THEN 1
    ELSE 2
  END,
  t.ticket_id ASC;`,
    explanation: `A left join preserves open tickets with missing or stale assignee ids. \`COALESCE\` turns the missing joined agent name into the requested label.

Common mistakes are using an inner join, which drops unassigned tickets, or only checking \`assignee_id IS NULL\` and missing invalid ids. An alternative is a \`CASE WHEN a.agent_name IS NULL THEN ...\` expression instead of \`COALESCE\`.`,
    hints: [
      `Use a left join because the agent row may be absent.`,
      `\`COALESCE\` is useful for display defaults.`,
      `A custom priority sort needs a \`CASE\` expression.`,
    ],
  },
  {
    id: `models-sharing-datasets`,
    title: `Models Sharing Datasets`,
    difficulty: `Medium`,
    category: `Joins`,
    description: `ML governance wants to see pairs of models trained on the same dataset by different owners.

Return unique pairs with columns \`dataset_id\`, \`first_model\`, and \`second_model\`. Only include pairs where the owners differ, and list the lexicographically smaller model name first.

Order by \`dataset_id\`, \`first_model\`, then \`second_model\` ascending.`,
    schema: `CREATE TABLE model_training_runs (
  run_id INTEGER PRIMARY KEY,
  model_name TEXT NOT NULL,
  owner_team TEXT NOT NULL,
  dataset_id TEXT NOT NULL
);`,
    datasets: [
      `INSERT INTO model_training_runs (run_id, model_name, owner_team, dataset_id) VALUES
  (1, 'ranker_a', 'search', 'ds1'),
  (2, 'ranker_b', 'search', 'ds1'),
  (3, 'ads_ctr', 'ads', 'ds1'),
  (4, 'fraud_score', 'risk', 'ds2'),
  (5, 'chargeback_net', 'risk', 'ds2'),
  (6, 'support_router', 'ops', 'ds3'),
  (7, 'intent_model', 'nlp', 'ds3');`,
      `INSERT INTO model_training_runs (run_id, model_name, owner_team, dataset_id) VALUES
  (10, 'alpha', 'a', 'shared'),
  (11, 'beta', 'b', 'shared'),
  (12, 'gamma', 'c', 'shared'),
  (13, 'alpha', 'a', 'shared');`,
      `INSERT INTO model_training_runs (run_id, model_name, owner_team, dataset_id) VALUES
  (20, 'solo', 'a', 'one'),
  (21, 'same_owner_1', 'x', 'two'),
  (22, 'same_owner_2', 'x', 'two'),
  (23, 'other_owner', 'y', 'two');`,
    ],
    orderMatters: true,
    solution: `SELECT DISTINCT
  a.dataset_id,
  a.model_name AS first_model,
  b.model_name AS second_model
FROM model_training_runs AS a
JOIN model_training_runs AS b
  ON b.dataset_id = a.dataset_id
 AND a.model_name < b.model_name
 AND a.owner_team <> b.owner_team
ORDER BY a.dataset_id ASC, first_model ASC, second_model ASC;`,
    explanation: `The self-join compares runs within the same dataset. The model-name inequality chooses one orientation for each pair, while the owner inequality enforces the governance rule; \`DISTINCT\` removes duplicate training runs.

Common mistakes are comparing \`run_id\` instead of model name, which can return mirrored model pairs, or forgetting that same-owner models should be excluded. An alternative is to deduplicate \`(dataset_id, model_name, owner_team)\` in a CTE before joining.`,
    hints: [
      `Join the table to itself on \`dataset_id\`.`,
      `Use \`<\` between model names to keep one order.`,
      `Duplicate runs should not create duplicate pairs.`,
    ],
  },
]

export default problems
