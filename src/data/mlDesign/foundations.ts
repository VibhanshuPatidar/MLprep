import type { DesignDoc } from '../../types/content'

const docs: DesignDoc[] = [
  {
    id: `ml-system-design-interview-framework`,
    title: `ML System Design Interview Framework`,
    category: `Foundations`,
    difficulty: `Medium`,
    summary: `A repeatable interview flow for turning an ambiguous product prompt into a measurable ML system design.`,
    tags: [
      `framework`,
      `requirements`,
      `metrics`,
      `serving`,
      `monitoring`,
    ],
    sections: [
      {
        title: `The Interview Shape`,
        body: `- Start by restating the product goal and the decision the system must make. ML is justified only if the decision benefits from patterns in data rather than deterministic rules.
- Clarify users, request path, freshness needs, latency target, geographic or compliance constraints, and what happens when the model is unavailable.
- Convert the product into an ML task: classify, rank, regress, retrieve, generate, cluster, or detect anomalies. Name the input, prediction, action, and feedback loop.
- Propose a simple non-ML or heuristic baseline before the learned model. Interviewers reward the ability to ship a reliable v1 and measure lift.`,
      },
      {
        title: `Canonical Walkthrough`,
        body: `1. Clarify: who uses it, how often, where latency matters, and which failures are unacceptable.
2. Frame as ML: define the prediction target, training example, label horizon, candidate set, and decision threshold or ranking policy.
3. Metrics: separate offline model metrics, online product metrics, business outcomes, and guardrails such as fairness, abuse, latency, or cost.
4. Data and labels: identify logs, joins, delayed outcomes, bias from previous policies, privacy boundaries, and backfill strategy.
5. Features: split real-time, batch, contextual, user, item, graph, and embedding features; call out point-in-time correctness.
6. Model: baseline first, then production architecture, explaining why extra complexity should improve the chosen metric.
7. Training: sampling, imbalance handling, loss, negative examples, validation split, retraining cadence, and reproducibility.
8. Evaluation: slice analysis, calibration, counterfactual risk, canary checks, and the offline-online gap.
9. Serving: batch versus online, latency budget, caching, fallbacks, capacity estimate, and deployment strategy.
10. Monitoring and iteration: data quality, drift, model performance, business guardrails, alerting, and experiment roadmap.`,
      },
      {
        title: `Metrics Template`,
        body: `| Layer | Examples | Interview use |
| --- | --- | --- |
| Offline | AUC, NDCG, RMSE, log loss, calibration | Fast iteration; does not prove product lift. |
| Online | CTR, conversion, retention, time saved, resolved tickets | Measures user behavior under the real policy. |
| Business | Revenue, loss prevented, delivery cost, support cost | Connects ML to company goals. |
| Guardrail | p95 latency, complaint rate, fairness gap, spam leakage, hallucination rate | Prevents local metric wins from harming the product. |`,
      },
      {
        title: `Common Failure Modes`,
        body: `- Optimizing an easy proxy while the business objective moves in the opposite direction.
- Training-serving skew from missing point-in-time joins, feature code drift, or real-time feature outages.
- Leakage from future labels, post-decision features, duplicate users across splits, or evaluation data chosen after seeing results.
- Ignoring selection bias created by the previous recommender, ranking policy, fraud rules, or human moderation queue.
- Forgetting operational constraints: tail latency, model warmup, incident rollback, privacy retention, and cost per prediction.`,
      },
      {
        title: `Interview Closing`,
        body: `A strong ending summarizes the v1, why the proposed architecture is the minimum viable ML system, how it will be launched safely, and which measurements decide the next iteration. If time remains, discuss one high-leverage extension such as personalization, exploration, richer labels, or a stronger model family.`,
      },
    ],
    diagrams: [
      {
        title: `End-to-end ML design loop`,
        nodes: [
          {
            id: `client`,
            label: `Client`,
            kind: `client`,
            col: 0,
            row: 1,
          },
          {
            id: `api`,
            label: `API`,
            kind: `gateway`,
            col: 1,
            row: 1,
          },
          {
            id: `features`,
            label: `Features`,
            kind: `feature-store`,
            col: 2,
            row: 0,
            detail: `Point-in-time features reused by training and serving.`,
          },
          {
            id: `data`,
            label: `Events`,
            kind: `stream`,
            col: 2,
            row: 2,
          },
          {
            id: `model`,
            label: `Model`,
            kind: `model`,
            col: 3,
            row: 1,
            detail: `Baseline first, then higher-capacity model once metrics justify it.`,
          },
          {
            id: `service`,
            label: `Decision Service`,
            kind: `service`,
            col: 4,
            row: 1,
          },
          {
            id: `monitor`,
            label: `Monitor`,
            kind: `monitor`,
            col: 5,
            row: 0,
            detail: `Tracks data quality, model quality, latency, and business guardrails.`,
          },
          {
            id: `trainer`,
            label: `Trainer`,
            kind: `worker`,
            col: 6,
            row: 2,
          },
          {
            id: `registry`,
            label: `Registry`,
            kind: `storage`,
            col: 7,
            row: 1,
          },
        ],
        edges: [
          {
            from: `client`,
            to: `api`,
            label: `request`,
          },
          {
            from: `api`,
            to: `features`,
            label: `lookup`,
          },
          {
            from: `features`,
            to: `model`,
            label: `vector`,
          },
          {
            from: `model`,
            to: `service`,
            label: `score`,
          },
          {
            from: `service`,
            to: `client`,
            label: `response`,
          },
          {
            from: `service`,
            to: `data`,
            label: `logs`,
            dashed: true,
          },
          {
            from: `data`,
            to: `monitor`,
            label: `quality`,
          },
          {
            from: `data`,
            to: `trainer`,
            label: `labels`,
          },
          {
            from: `trainer`,
            to: `registry`,
            label: `model`,
          },
          {
            from: `registry`,
            to: `model`,
            label: `deploy`,
            dashed: true,
          },
        ],
      },
    ],
    followUps: [
      {
        q: `How do you know ML is needed?`,
        a: `Compare against a rule or heuristic baseline. ML is worth it when historical data predicts the decision better, the pattern changes over time, and the improvement matters enough to justify operational cost.`,
      },
      {
        q: `What should you clarify first?`,
        a: `Clarify the decision, user, latency, freshness, scale, success metric, unacceptable failures, and fallback behavior.`,
      },
      {
        q: `Why separate offline and online metrics?`,
        a: `Offline metrics are cheap and directional; online metrics capture user behavior, feedback loops, latency, and product trade-offs.`,
      },
      {
        q: `Where does leakage usually enter?`,
        a: `Through future events, labels observed after the prediction time, post-treatment features, entity duplicates across splits, and backfills that ignore point-in-time joins.`,
      },
      {
        q: `What is a good model deployment plan?`,
        a: `Shadow or canary first, compare logs to the baseline, ramp through A/B testing, keep rollback and safe defaults, and monitor slices rather than only global averages.`,
      },
      {
        q: `How do you discuss trade-offs under time pressure?`,
        a: `Tie every trade-off to a metric: accuracy versus latency, freshness versus cost, exploration versus user experience, or personalization versus privacy.`,
      },
    ],
    resources: [
      {
        title: `Chip Huyen: Designing Machine Learning Systems`,
        url: `https://huyenchip.com/machine-learning-systems-design/toc.html`,
        type: `book`,
      },
      {
        title: `Machine Learning Systems Design GitHub`,
        url: `https://github.com/chiphuyen/machine-learning-systems-design`,
        type: `repo`,
      },
      {
        title: `Machine Learning Interviews resources`,
        url: `https://github.com/alirezadir/Machine-Learning-Interviews`,
        type: `repo`,
      },
      {
        title: `The ML Test Score`,
        url: `https://research.google/pubs/the-ml-test-score-a-rubric-for-ml-production-readiness-and-technical-debt-reduction/`,
        type: `paper`,
      },
      {
        title: `Hidden Technical Debt in Machine Learning Systems`,
        url: `https://papers.nips.cc/paper_files/paper/2015/hash/86df7dcfd896fcaf2674f757a2463eba-Abstract.html`,
        type: `paper`,
      },
    ],
  },
  {
    id: `metrics-and-evaluation`,
    title: `Metrics & Evaluation`,
    category: `Foundations`,
    difficulty: `Medium`,
    summary: `Choose metrics that match the task, expose ranking and calibration quality, and explain why offline wins may not ship.`,
    tags: [
      `metrics`,
      `evaluation`,
      `calibration`,
      `ranking`,
      `roc`,
    ],
    widgets: [
      `roc-curve`,
    ],
    sections: [
      {
        title: `Metric Families`,
        body: `| Task | Useful metrics | Notes |
| --- | --- | --- |
| Classification | Accuracy, precision, recall, F1, ROC-AUC, PR-AUC, log loss | Use PR-AUC when positives are rare; use cost-weighted metrics when mistakes have asymmetric impact. |
| Ranking | NDCG@K, MAP, MRR, recall@K, hit rate | Use position-aware metrics because users inspect only a prefix. |
| Regression | MAE, RMSE, MAPE, quantile loss, coverage | MAE is robust; RMSE penalizes large errors; quantiles help with uncertainty. |
| Generative | Exact match, groundedness, human preference, toxicity, latency, cost | Automatic scores are proxies; keep an evaluation harness with examples and rubrics. |`,
      },
      {
        title: `Calibration and Thresholds`,
        body: `- A calibrated model means predictions near 0.8 are correct about 80 percent of the time on the relevant slice. Calibration matters for bids, fraud review queues, risk limits, and cost-sensitive decisions.
- Tune thresholds using expected utility, not only F1. For binary classification, choose the threshold where marginal benefit of catching a positive exceeds marginal cost of a false alarm.
- Report threshold-free ranking quality and thresholded operating points. Interviewers often ask what happens if the review team can inspect only 10,000 cases per day.`,
      },
      {
        title: `Offline Evaluation Design`,
        body: `- Split by time for production systems unless the use case is naturally IID. Random splits often leak future popularity, user behavior, or catalog changes.
- Evaluate slices: new users, new items, geography, device, language, high-value customers, protected classes where legally allowed, and tail latency cohorts.
- Build a baseline table with the current production policy, a simple model, the proposed model, and confidence intervals from bootstrap or repeated time windows.
- For ranked lists, include candidate-generation recall so the final ranker is not blamed for missing items it never saw.`,
      },
      {
        title: `Offline to Online Gap`,
        body: `- Logs are produced by yesterday's policy, so they under-represent actions that policy rarely took. This selection bias is severe in recommendation, search, ads, and fraud systems.
- A model can improve AUC but hurt product value if it optimizes a short-term click, produces repetitive items, increases latency, or changes incentives for bad actors.
- Mitigate with randomized buckets, exploration traffic, interleaving, inverse propensity weighting when propensities are known, and cautious A/B ramps.`,
      },
      {
        title: `What to Say in Interviews`,
        body: `Always name one primary metric and at least two guardrails. Then explain why that primary metric is only a proxy. A polished answer says: I will optimize NDCG@20 offline, launch on CTR and long-term retention online, and guardrail hide/report rate, latency, diversity, and revenue per session.`,
      },
    ],
    diagrams: [
      {
        title: `Evaluation loop`,
        nodes: [
          {
            id: `client`,
            label: `Client`,
            kind: `client`,
            col: 0,
            row: 1,
          },
          {
            id: `api`,
            label: `API`,
            kind: `gateway`,
            col: 1,
            row: 1,
          },
          {
            id: `features`,
            label: `Features`,
            kind: `feature-store`,
            col: 2,
            row: 0,
            detail: `Point-in-time features reused by training and serving.`,
          },
          {
            id: `data`,
            label: `Events`,
            kind: `stream`,
            col: 2,
            row: 2,
          },
          {
            id: `model`,
            label: `Model`,
            kind: `model`,
            col: 3,
            row: 1,
            detail: `Baseline first, then higher-capacity model once metrics justify it.`,
          },
          {
            id: `service`,
            label: `Decision Service`,
            kind: `service`,
            col: 4,
            row: 1,
          },
          {
            id: `monitor`,
            label: `Monitor`,
            kind: `monitor`,
            col: 5,
            row: 0,
            detail: `Tracks data quality, model quality, latency, and business guardrails.`,
          },
          {
            id: `trainer`,
            label: `Trainer`,
            kind: `worker`,
            col: 6,
            row: 2,
          },
          {
            id: `registry`,
            label: `Registry`,
            kind: `storage`,
            col: 7,
            row: 1,
          },
        ],
        edges: [
          {
            from: `client`,
            to: `api`,
            label: `request`,
          },
          {
            from: `api`,
            to: `features`,
            label: `lookup`,
          },
          {
            from: `features`,
            to: `model`,
            label: `vector`,
          },
          {
            from: `model`,
            to: `service`,
            label: `score`,
          },
          {
            from: `service`,
            to: `client`,
            label: `response`,
          },
          {
            from: `service`,
            to: `data`,
            label: `logs`,
            dashed: true,
          },
          {
            from: `data`,
            to: `monitor`,
            label: `quality`,
          },
          {
            from: `data`,
            to: `trainer`,
            label: `labels`,
          },
          {
            from: `trainer`,
            to: `registry`,
            label: `model`,
          },
          {
            from: `registry`,
            to: `model`,
            label: `deploy`,
            dashed: true,
          },
        ],
      },
    ],
    followUps: [
      {
        q: `When is ROC-AUC misleading?`,
        a: `When positives are rare or the operating region is narrow. PR-AUC, recall at fixed precision, or cost curves usually communicate rare-event performance better.`,
      },
      {
        q: `Why does calibration matter?`,
        a: `Ranking only needs order, but risk, pricing, bidding, and review capacity need probabilities that correspond to real frequencies.`,
      },
      {
        q: `How do you evaluate a recommender offline?`,
        a: `Use time-based holdout, candidate recall, NDCG or recall@K, diversity and novelty slices, and compare against the current production policy.`,
      },
      {
        q: `What is a guardrail metric?`,
        a: `A metric that should not degrade while the primary metric improves, such as latency, complaint rate, fairness gap, fraud leakage, or cost.`,
      },
      {
        q: `How do you estimate confidence intervals?`,
        a: `Use bootstrap over users or sessions, not individual impressions when observations are correlated. For experiments, use precomputed variance and power analysis.`,
      },
      {
        q: `How do you handle delayed labels?`,
        a: `Report early proxy metrics separately from matured labels and train/evaluate with a label horizon that matches the decision.`,
      },
    ],
    resources: [
      {
        title: `scikit-learn model evaluation guide`,
        url: `https://scikit-learn.org/stable/modules/model_evaluation.html`,
        type: `article`,
      },
      {
        title: `Rules of Machine Learning`,
        url: `https://developers.google.com/machine-learning/guides/rules-of-ml`,
        type: `article`,
      },
      {
        title: `On Calibration of Modern Neural Networks`,
        url: `https://proceedings.mlr.press/v70/guo17a.html`,
        type: `paper`,
      },
      {
        title: `Chip Huyen: Designing Machine Learning Systems`,
        url: `https://huyenchip.com/machine-learning-systems-design/toc.html`,
        type: `book`,
      },
    ],
  },
  {
    id: `experimentation-and-ab-testing`,
    title: `Experimentation & A/B Testing`,
    category: `Foundations`,
    difficulty: `Medium`,
    summary: `Design trustworthy online experiments with power, variance reduction, interference awareness, and launch guardrails.`,
    tags: [
      `ab-testing`,
      `experimentation`,
      `cuped`,
      `interleaving`,
      `power`,
    ],
    widgets: [
      `ab-test`,
    ],
    sections: [
      {
        title: `Why Experiment`,
        body: `- ML systems change behavior and incentives, so offline evaluation cannot fully predict user response.
- A/B tests estimate causal impact by randomizing users, sessions, requests, items, or markets into comparable buckets.
- The unit of randomization should match interference risk. User-level randomization avoids cross-session contamination; marketplace experiments may require geo or cluster randomization.`,
      },
      {
        title: `Power and Sample Size`,
        body: `- Before launch, define the minimum detectable effect, baseline rate, variance, target power, and significance threshold. Small effects on noisy metrics may need weeks of traffic.
- Do not peek repeatedly and stop when the dashboard looks good unless the test uses sequential methods. Peeking inflates false positives.
- Use user-level aggregation for confidence intervals when users generate many correlated events.`,
      },
      {
        title: `Variance Reduction and Ranking Tests`,
        body: `- CUPED subtracts variance explained by pre-experiment behavior, increasing sensitivity without changing the estimand when assumptions hold.
- For search and ranking, interleaving can compare rankers within the same query and often detects preference differences faster than classic A/B tests.
- Novelty effects and learning effects can make early lift unreliable; inspect metric curves over time and keep a holdback when model changes are frequent.`,
      },
      {
        title: `Interference and Bias`,
        body: `- Social feeds, ad auctions, fraud systems, and delivery marketplaces violate independent-user assumptions because one user's treatment changes another user's experience.
- Mitigate with cluster randomization, switchback tests, geo experiments, auction-level isolation, or simulation before live traffic.
- Instrumentation bugs are common. Validate assignment balance, exposure logging, metric definitions, and bot filtering before trusting lift.`,
      },
      {
        title: `Launch Pattern`,
        body: `1. Run offline checks and shadow logging.
2. Canary a tiny traffic slice with strict latency and error guardrails.
3. Run the powered A/B test with a frozen analysis plan.
4. Inspect primary, secondary, and slice metrics.
5. Ramp gradually, keep rollback, and document the decision for future baselines.`,
      },
    ],
    diagrams: [
      {
        title: `Experiment decision loop`,
        nodes: [
          {
            id: `client`,
            label: `Client`,
            kind: `client`,
            col: 0,
            row: 1,
          },
          {
            id: `api`,
            label: `API`,
            kind: `gateway`,
            col: 1,
            row: 1,
          },
          {
            id: `features`,
            label: `Features`,
            kind: `feature-store`,
            col: 2,
            row: 0,
            detail: `Point-in-time features reused by training and serving.`,
          },
          {
            id: `data`,
            label: `Events`,
            kind: `stream`,
            col: 2,
            row: 2,
          },
          {
            id: `model`,
            label: `Model`,
            kind: `model`,
            col: 3,
            row: 1,
            detail: `Baseline first, then higher-capacity model once metrics justify it.`,
          },
          {
            id: `service`,
            label: `Decision Service`,
            kind: `service`,
            col: 4,
            row: 1,
          },
          {
            id: `monitor`,
            label: `Monitor`,
            kind: `monitor`,
            col: 5,
            row: 0,
            detail: `Tracks data quality, model quality, latency, and business guardrails.`,
          },
          {
            id: `trainer`,
            label: `Trainer`,
            kind: `worker`,
            col: 6,
            row: 2,
          },
          {
            id: `registry`,
            label: `Registry`,
            kind: `storage`,
            col: 7,
            row: 1,
          },
        ],
        edges: [
          {
            from: `client`,
            to: `api`,
            label: `request`,
          },
          {
            from: `api`,
            to: `features`,
            label: `lookup`,
          },
          {
            from: `features`,
            to: `model`,
            label: `vector`,
          },
          {
            from: `model`,
            to: `service`,
            label: `score`,
          },
          {
            from: `service`,
            to: `client`,
            label: `response`,
          },
          {
            from: `service`,
            to: `data`,
            label: `logs`,
            dashed: true,
          },
          {
            from: `data`,
            to: `monitor`,
            label: `quality`,
          },
          {
            from: `data`,
            to: `trainer`,
            label: `labels`,
          },
          {
            from: `trainer`,
            to: `registry`,
            label: `model`,
          },
          {
            from: `registry`,
            to: `model`,
            label: `deploy`,
            dashed: true,
          },
        ],
      },
    ],
    followUps: [
      {
        q: `What is the minimum detectable effect?`,
        a: `The smallest lift the experiment is designed to reliably detect. It is chosen from business value and traffic constraints before launch.`,
      },
      {
        q: `When would you use interleaving?`,
        a: `For ranking systems where two rankers can contribute results to the same request and user clicks reveal preference with lower variance.`,
      },
      {
        q: `What is interference?`,
        a: `Treatment for one unit changes outcomes for another unit, such as ad auctions, social networks, or driver allocation in delivery.`,
      },
      {
        q: `Why use CUPED?`,
        a: `It uses pre-experiment covariates to reduce variance, so the same traffic can detect smaller effects if the covariate predicts the metric.`,
      },
      {
        q: `How do you avoid novelty bias?`,
        a: `Run long enough to observe stabilization, compare new and returning users separately, and avoid over-weighting the first few days.`,
      },
      {
        q: `What guardrails should an ML experiment include?`,
        a: `Latency, error rate, data quality, complaints, safety/fairness metrics, and any business metric that the model could accidentally sacrifice.`,
      },
    ],
    resources: [
      {
        title: `Trustworthy Online Controlled Experiments`,
        url: `https://www.cambridge.org/core/books/trustworthy-online-controlled-experiments/26D8046F4B129F7F7F4B6F4A0F94104A`,
        type: `book`,
      },
      {
        title: `Experimenter's Rules of Thumb`,
        url: `https://www.exp-platform.com/Documents/2014%20experimentersRulesOfThumb.pdf`,
        type: `paper`,
      },
      {
        title: `CUPED variance reduction`,
        url: `https://www.exp-platform.com/Documents/2013-02-CUPED-ImprovingSensitivityOfControlledExperiments.pdf`,
        type: `paper`,
      },
      {
        title: `Optimizing Search Engines using Clickthrough Data`,
        url: `https://www.microsoft.com/en-us/research/publication/optimizing-search-engines-using-clickthrough-data/`,
        type: `paper`,
      },
    ],
  },
  {
    id: `feature-stores-and-data-pipelines`,
    title: `Feature Stores & Data Pipelines`,
    category: `Foundations`,
    difficulty: `Medium`,
    summary: `Design reliable batch and streaming feature pipelines with point-in-time correctness and minimal training-serving skew.`,
    tags: [
      `feature-store`,
      `pipelines`,
      `streaming`,
      `point-in-time`,
      `skew`,
    ],
    sections: [
      {
        title: `Feature Store Responsibilities`,
        body: `- A feature store is not just a database. It defines features, computes them reproducibly, serves them online, creates point-in-time training datasets, and tracks lineage.
- Offline storage supports large historical joins; online storage serves low-latency reads keyed by user, item, merchant, device, or query.
- The same feature definition should feed training and serving whenever possible. If code must diverge, add parity tests and drift monitors.`,
      },
      {
        title: `Point-in-Time Correctness`,
        body: `- Every training row has an event time. Features must be computed using information available before that event time, not the latest value in the table.
- Use as-of joins, feature timestamps, entity keys, and late-data policies. Record both event time and processing time so backfills can reproduce production state.
- Leakage is especially easy with aggregates such as thirty-day purchase count, fraud chargebacks, moderation outcomes, or future item popularity.`,
      },
      {
        title: `Batch, Streaming, and Freshness`,
        body: `| Feature type | Example | Serving approach |
| --- | --- | --- |
| Static | user signup country, merchant category | Batch backfill plus online cache. |
| Slow aggregate | 30-day order count, average rating | Daily or hourly materialization. |
| Fast aggregate | clicks in last 5 minutes, card velocity | Streaming job with TTL and exactly-once or idempotent updates. |
| Request context | query text, device, page position | Computed synchronously in the serving path. |`,
      },
      {
        title: `Operational Concerns`,
        body: `- Schema contracts prevent silent type changes. Null-rate, range, freshness, and cardinality monitors catch upstream breaks before model quality drops.
- Backfills should be versioned, deterministic, and resource-controlled. A backfill that rewrites history can invalidate model comparisons.
- Feature ownership matters: teams need deprecation plans, documentation, access controls, privacy classification, and cost visibility.`,
      },
      {
        title: `Interview Answer Pattern`,
        body: `Mention the offline store, online store, transformation jobs, registry, entity keys, feature timestamps, freshness SLOs, and monitoring. Then give a concrete skew example: the model trained with a seven-day purchase count including tomorrow's purchase will look excellent offline and fail online.`,
      },
    ],
    diagrams: [
      {
        title: `Feature pipeline with point-in-time joins`,
        nodes: [
          {
            id: `client`,
            label: `Client`,
            kind: `client`,
            col: 0,
            row: 1,
          },
          {
            id: `api`,
            label: `API`,
            kind: `gateway`,
            col: 1,
            row: 1,
          },
          {
            id: `features`,
            label: `Features`,
            kind: `feature-store`,
            col: 2,
            row: 0,
            detail: `Point-in-time features reused by training and serving.`,
          },
          {
            id: `data`,
            label: `Events`,
            kind: `stream`,
            col: 2,
            row: 2,
          },
          {
            id: `model`,
            label: `Model`,
            kind: `model`,
            col: 3,
            row: 1,
            detail: `Baseline first, then higher-capacity model once metrics justify it.`,
          },
          {
            id: `service`,
            label: `Decision Service`,
            kind: `service`,
            col: 4,
            row: 1,
          },
          {
            id: `monitor`,
            label: `Monitor`,
            kind: `monitor`,
            col: 5,
            row: 0,
            detail: `Tracks data quality, model quality, latency, and business guardrails.`,
          },
          {
            id: `trainer`,
            label: `Trainer`,
            kind: `worker`,
            col: 6,
            row: 2,
          },
          {
            id: `registry`,
            label: `Registry`,
            kind: `storage`,
            col: 7,
            row: 1,
          },
        ],
        edges: [
          {
            from: `client`,
            to: `api`,
            label: `request`,
          },
          {
            from: `api`,
            to: `features`,
            label: `lookup`,
          },
          {
            from: `features`,
            to: `model`,
            label: `vector`,
          },
          {
            from: `model`,
            to: `service`,
            label: `score`,
          },
          {
            from: `service`,
            to: `client`,
            label: `response`,
          },
          {
            from: `service`,
            to: `data`,
            label: `logs`,
            dashed: true,
          },
          {
            from: `data`,
            to: `monitor`,
            label: `quality`,
          },
          {
            from: `data`,
            to: `trainer`,
            label: `labels`,
          },
          {
            from: `trainer`,
            to: `registry`,
            label: `model`,
          },
          {
            from: `registry`,
            to: `model`,
            label: `deploy`,
            dashed: true,
          },
        ],
      },
    ],
    followUps: [
      {
        q: `What is training-serving skew?`,
        a: `The model sees different feature definitions, distributions, or availability during training than during online inference.`,
      },
      {
        q: `How do you prevent point-in-time leakage?`,
        a: `Join features as of the prediction timestamp, store feature timestamps, test with historical cutoffs, and ban post-decision fields.`,
      },
      {
        q: `When do you need streaming features?`,
        a: `When recent behavior materially changes the decision, such as fraud velocity, trending content, ad pacing, or live marketplace state.`,
      },
      {
        q: `What should feature monitoring include?`,
        a: `Freshness, null rate, ranges, cardinality, distribution drift, join coverage, and online/offline parity.`,
      },
      {
        q: `How do you handle late events?`,
        a: `Define allowed lateness, use idempotent updates, recompute offline truth for training, and monitor the gap between event time and processing time.`,
      },
      {
        q: `What is the risk of too many features?`,
        a: `Higher latency, cost, leakage surface, ownership burden, and brittle models that depend on unstable upstream systems.`,
      },
    ],
    resources: [
      {
        title: `Feast feature store documentation`,
        url: `https://docs.feast.dev/`,
        type: `article`,
      },
      {
        title: `Uber Michelangelo`,
        url: `https://www.uber.com/blog/michelangelo-machine-learning-platform/`,
        type: `article`,
      },
      {
        title: `Airbnb Zipline`,
        url: `https://medium.com/airbnb-engineering/zipline-airbnbs-machine-learning-data-management-platform-7b8a27e04708`,
        type: `article`,
      },
      {
        title: `Hopsworks feature store`,
        url: `https://www.hopsworks.ai/dictionary/feature-store`,
        type: `article`,
      },
    ],
  },
  {
    id: `model-serving-and-inference-optimization`,
    title: `Model Serving & Inference Optimization`,
    category: `Foundations`,
    difficulty: `Hard`,
    summary: `Meet latency and cost SLOs with batching, caching, model compression, hardware-aware serving, and safe fallbacks.`,
    tags: [
      `serving`,
      `inference`,
      `latency`,
      `gpu`,
      `optimization`,
    ],
    sections: [
      {
        title: `Serving Modes`,
        body: `| Mode | Use when | Trade-off |
| --- | --- | --- |
| Batch scoring | Predictions can be precomputed, such as daily churn risk or candidate recommendations. | Cheap and stable but stale. |
| Online synchronous | The prediction depends on request context, such as query text or card swipe details. | Fresh but latency-sensitive. |
| Async near-real-time | The user can wait for a notification or background update. | Simpler scaling but not suitable for blocking decisions. |`,
      },
      {
        title: `Latency Budget`,
        body: `- Break p95 latency into network, feature fetch, candidate generation, model inference, post-processing, logging, and serialization. Optimize the largest or most variable segment first.
- Use timeouts and fallbacks per dependency. A model that is accurate only when every feature service is healthy is not production-ready.
- Tail latency matters more than mean latency for user-facing systems because each request often fans out to several services.`,
      },
      {
        title: `Optimization Toolbox`,
        body: `- Batching improves throughput but can add queueing delay; dynamic batching works well when traffic is high and latency SLOs are explicit.
- Caching helps when inputs repeat or predictions are reusable. Cache keys must include model version and freshness-sensitive context.
- Quantization, pruning, distillation, low-rank adapters, and smaller candidate sets reduce cost. Validate quality by slice after compression.
- For GPUs, keep utilization high with concurrent requests, pinned memory, warm models, and avoiding CPU preprocessing bottlenecks.`,
      },
      {
        title: `Deployment Safety`,
        body: `- Model registry, reproducible artifacts, schema checks, canarying, rollback, and shadow comparisons are part of serving design, not afterthoughts.
- Log features, predictions, model version, latency, and decision outcome with privacy-aware sampling. Without logs, debugging regressions is guesswork.
- Support graceful degradation: serve cached results, a smaller model, a rules fallback, or the previous production model during incidents.`,
      },
      {
        title: `Interview Shortcut`,
        body: `State a concrete SLO, for example p95 under 100 ms and p99 under 250 ms. Then allocate the budget, identify the bottleneck, and describe the fallback. This makes the design operational rather than purely algorithmic.`,
      },
    ],
    diagrams: [
      {
        title: `Optimized inference service`,
        nodes: [
          {
            id: `client`,
            label: `Client`,
            kind: `client`,
            col: 0,
            row: 1,
          },
          {
            id: `api`,
            label: `API`,
            kind: `gateway`,
            col: 1,
            row: 1,
          },
          {
            id: `features`,
            label: `Features`,
            kind: `feature-store`,
            col: 2,
            row: 0,
            detail: `Point-in-time features reused by training and serving.`,
          },
          {
            id: `data`,
            label: `Events`,
            kind: `stream`,
            col: 2,
            row: 2,
          },
          {
            id: `model`,
            label: `Model`,
            kind: `model`,
            col: 3,
            row: 1,
            detail: `Baseline first, then higher-capacity model once metrics justify it.`,
          },
          {
            id: `service`,
            label: `Decision Service`,
            kind: `service`,
            col: 4,
            row: 1,
          },
          {
            id: `monitor`,
            label: `Monitor`,
            kind: `monitor`,
            col: 5,
            row: 0,
            detail: `Tracks data quality, model quality, latency, and business guardrails.`,
          },
          {
            id: `trainer`,
            label: `Trainer`,
            kind: `worker`,
            col: 6,
            row: 2,
          },
          {
            id: `registry`,
            label: `Registry`,
            kind: `storage`,
            col: 7,
            row: 1,
          },
        ],
        edges: [
          {
            from: `client`,
            to: `api`,
            label: `request`,
          },
          {
            from: `api`,
            to: `features`,
            label: `lookup`,
          },
          {
            from: `features`,
            to: `model`,
            label: `vector`,
          },
          {
            from: `model`,
            to: `service`,
            label: `score`,
          },
          {
            from: `service`,
            to: `client`,
            label: `response`,
          },
          {
            from: `service`,
            to: `data`,
            label: `logs`,
            dashed: true,
          },
          {
            from: `data`,
            to: `monitor`,
            label: `quality`,
          },
          {
            from: `data`,
            to: `trainer`,
            label: `labels`,
          },
          {
            from: `trainer`,
            to: `registry`,
            label: `model`,
          },
          {
            from: `registry`,
            to: `model`,
            label: `deploy`,
            dashed: true,
          },
        ],
      },
    ],
    followUps: [
      {
        q: `When does batching hurt?`,
        a: `When traffic is low or the batch wait time consumes the latency budget. Use dynamic batching with a maximum delay.`,
      },
      {
        q: `How do you choose between caching and model optimization?`,
        a: `Cache first when repeated inputs or precomputable results dominate; optimize the model when requests are unique or freshness-sensitive.`,
      },
      {
        q: `What should be in prediction logs?`,
        a: `Model version, features or feature hashes, prediction, decision, latency, dependency status, request context, and later label joins when allowed.`,
      },
      {
        q: `How do you use GPUs efficiently?`,
        a: `Batch requests, keep models warm, minimize host-device copies, use mixed precision when validated, and monitor utilization plus queueing delay.`,
      },
      {
        q: `What is distillation?`,
        a: `Training a smaller student model to mimic a larger teacher, often preserving most quality while reducing latency and cost.`,
      },
      {
        q: `What is a safe fallback?`,
        a: `A deterministic rule, cached prediction, previous model, or degraded product path that preserves safety and core functionality during model outages.`,
      },
    ],
    resources: [
      {
        title: `TensorFlow Serving`,
        url: `https://www.usenix.org/conference/osdi16/technical-sessions/presentation/olston`,
        type: `paper`,
      },
      {
        title: `NVIDIA Triton Inference Server`,
        url: `https://github.com/triton-inference-server/server`,
        type: `repo`,
      },
      {
        title: `ONNX Runtime quantization`,
        url: `https://onnxruntime.ai/docs/performance/model-optimizations/quantization.html`,
        type: `article`,
      },
      {
        title: `Distilling the Knowledge in a Neural Network`,
        url: `https://arxiv.org/abs/1503.02531`,
        type: `paper`,
      },
    ],
  },
  {
    id: `monitoring-drift-and-retraining`,
    title: `Monitoring, Drift & Retraining`,
    category: `Foundations`,
    difficulty: `Medium`,
    summary: `Keep ML systems healthy by monitoring data, predictions, labels, business outcomes, and retraining triggers.`,
    tags: [
      `monitoring`,
      `drift`,
      `retraining`,
      `data-quality`,
      `alerts`,
    ],
    sections: [
      {
        title: `What to Monitor`,
        body: `| Layer | Signals |
| --- | --- |
| Data quality | freshness, nulls, schema changes, ranges, cardinality, duplicate events |
| Feature distribution | population stability, embedding norms, top categorical values, join coverage |
| Prediction behavior | score distribution, threshold crossing rate, calibration, confidence, abstention rate |
| Outcome quality | AUC, NDCG, RMSE, precision at review capacity, human rating, loss prevented |
| Operations | latency, error rate, dependency health, cost, GPU utilization, queue depth |`,
      },
      {
        title: `Types of Drift`,
        body: `- Covariate drift: input distribution changes, such as a new device, holiday demand, or fresh fraud pattern.
- Label drift: base rates change, such as a marketing campaign increasing conversions or a new attack increasing chargebacks.
- Concept drift: the relationship between features and label changes, such as users learning to ignore a notification style.
- Policy drift: the system's own actions change what data is observed, common in recommenders and fraud review queues.`,
      },
      {
        title: `Retraining Strategy`,
        body: `- Start with a scheduled cadence that matches label maturity and drift speed. Add trigger-based retraining only after monitors are trustworthy.
- Use rolling windows, time-decayed weights, or replay buffers when recent data is more relevant but old data still helps rare slices.
- Retraining should run through the same validation gates as a new model: data checks, slice metrics, calibration, canary, and rollback plan.`,
      },
      {
        title: `Alerting Without Noise`,
        body: `- Alert on user impact or a small set of high-confidence leading indicators. Dashboards can include many metrics; pages should be rare and actionable.
- Use seasonality-aware thresholds for traffic, demand, and behavior metrics. A weekend pattern should not trigger a drift incident every week.
- Route alerts to owners of the failing layer: data pipeline, feature store, serving platform, model team, or product operator.`,
      },
      {
        title: `Interview Closing`,
        body: `Do not say simply retrain when performance drops. Explain how labels arrive, which monitor detects the problem first, whether the fix is data, features, threshold, model, or product policy, and how the new model is validated before ramping.`,
      },
    ],
    diagrams: [
      {
        title: `Monitoring and retraining loop`,
        nodes: [
          {
            id: `client`,
            label: `Client`,
            kind: `client`,
            col: 0,
            row: 1,
          },
          {
            id: `api`,
            label: `API`,
            kind: `gateway`,
            col: 1,
            row: 1,
          },
          {
            id: `features`,
            label: `Features`,
            kind: `feature-store`,
            col: 2,
            row: 0,
            detail: `Point-in-time features reused by training and serving.`,
          },
          {
            id: `data`,
            label: `Events`,
            kind: `stream`,
            col: 2,
            row: 2,
          },
          {
            id: `model`,
            label: `Model`,
            kind: `model`,
            col: 3,
            row: 1,
            detail: `Baseline first, then higher-capacity model once metrics justify it.`,
          },
          {
            id: `service`,
            label: `Decision Service`,
            kind: `service`,
            col: 4,
            row: 1,
          },
          {
            id: `monitor`,
            label: `Monitor`,
            kind: `monitor`,
            col: 5,
            row: 0,
            detail: `Tracks data quality, model quality, latency, and business guardrails.`,
          },
          {
            id: `trainer`,
            label: `Trainer`,
            kind: `worker`,
            col: 6,
            row: 2,
          },
          {
            id: `registry`,
            label: `Registry`,
            kind: `storage`,
            col: 7,
            row: 1,
          },
        ],
        edges: [
          {
            from: `client`,
            to: `api`,
            label: `request`,
          },
          {
            from: `api`,
            to: `features`,
            label: `lookup`,
          },
          {
            from: `features`,
            to: `model`,
            label: `vector`,
          },
          {
            from: `model`,
            to: `service`,
            label: `score`,
          },
          {
            from: `service`,
            to: `client`,
            label: `response`,
          },
          {
            from: `service`,
            to: `data`,
            label: `logs`,
            dashed: true,
          },
          {
            from: `data`,
            to: `monitor`,
            label: `quality`,
          },
          {
            from: `data`,
            to: `trainer`,
            label: `labels`,
          },
          {
            from: `trainer`,
            to: `registry`,
            label: `model`,
          },
          {
            from: `registry`,
            to: `model`,
            label: `deploy`,
            dashed: true,
          },
        ],
      },
    ],
    followUps: [
      {
        q: `What if labels arrive after 30 days?`,
        a: `Use proxy monitors for early warning, but judge model quality on matured labels. Keep separate dashboards for early and mature metrics.`,
      },
      {
        q: `How do you detect drift in embeddings?`,
        a: `Monitor norm, nearest-neighbor distribution, cluster membership, retrieval recall on probes, and downstream quality slices.`,
      },
      {
        q: `Should every drift alert retrain the model?`,
        a: `No. Drift may come from a broken pipeline, product launch, seasonality, or abuse. Diagnose before retraining.`,
      },
      {
        q: `What is concept drift?`,
        a: `The mapping from features to label changes, so the old decision boundary is no longer valid even if input ranges look normal.`,
      },
      {
        q: `How do you choose a retraining window?`,
        a: `Balance recency against coverage of rare events and seasonality. Validate multiple windows on time-based holdouts.`,
      },
      {
        q: `What is shadow evaluation?`,
        a: `Run a candidate model on production traffic without affecting decisions, then compare predictions, latency, and later labels against the current model.`,
      },
    ],
    resources: [
      {
        title: `Hidden Technical Debt in Machine Learning Systems`,
        url: `https://papers.nips.cc/paper_files/paper/2015/hash/86df7dcfd896fcaf2674f757a2463eba-Abstract.html`,
        type: `paper`,
      },
      {
        title: `The ML Test Score`,
        url: `https://research.google/pubs/the-ml-test-score-a-rubric-for-ml-production-readiness-and-technical-debt-reduction/`,
        type: `paper`,
      },
      {
        title: `Evidently AI monitoring guide`,
        url: `https://docs.evidentlyai.com/`,
        type: `article`,
      },
      {
        title: `TFX model analysis`,
        url: `https://www.tensorflow.org/tfx/model_analysis/get_started`,
        type: `article`,
      },
    ],
  },
  {
    id: `embeddings-and-vector-search`,
    title: `Embeddings & Vector Search`,
    category: `Foundations`,
    difficulty: `Hard`,
    summary: `Design embedding retrieval systems with two-tower models, ANN indexes, metadata filters, and recall-latency trade-offs.`,
    tags: [
      `embeddings`,
      `vector-search`,
      `ann`,
      `hnsw`,
      `two-tower`,
    ],
    sections: [
      {
        title: `Core Idea`,
        body: `- Embeddings map users, queries, items, documents, or images into a vector space where useful neighbors are close under cosine, dot product, or Euclidean distance.
- Two-tower models encode the query/user and item/document separately, enabling item vectors to be precomputed and searched quickly.
- Vector search is usually candidate generation, not the final ranking step. A reranker can use richer features and cross-attention on a smaller candidate set.`,
      },
      {
        title: `ANN Index Choices`,
        body: `| Index | Good for | Trade-off |
| --- | --- | --- |
| HNSW | high recall, dynamic-ish collections | Memory heavy; tune efSearch and graph degree. |
| IVF | large collections with clustering | Needs training and probe tuning; recall depends on cluster assignment. |
| PQ/IVF-PQ | memory-constrained billion-scale search | Compression reduces memory but can lower recall. |
| Brute force | small or GPU-batched collections | Simple and exact but expensive at scale. |`,
      },
      {
        title: `Quality and Latency`,
        body: `- Measure recall@K against an exact search sample. Then measure end-to-end task metrics after reranking because approximate recall is only an intermediate signal.
- Tune vector dimension, quantization, number of probes, HNSW efSearch, metadata filters, and shard fanout to meet p95 latency.
- Metadata filters can destroy ANN efficiency if applied after search. Design partitioning or filtered indexes for common constraints such as language, region, availability, and policy state.`,
      },
      {
        title: `Training Embeddings`,
        body: `- Use contrastive, triplet, sampled softmax, or in-batch negative losses. Hard negatives improve discrimination but can encode popularity or policy bias.
- Refresh item vectors when content changes and user/query vectors when behavior changes. Large catalogs need incremental indexing and index versioning.
- Evaluate by slices: head and tail items, new content, short queries, multilingual text, sparse users, and safety-sensitive categories.`,
      },
      {
        title: `Interview Pitfalls`,
        body: `- Forgetting that ANN recall is not product relevance.
- Building one global index when compliance, tenancy, or availability requires isolation.
- Ignoring deletes and freshness; stale vectors can surface removed, sold-out, or policy-violating items.
- Using a black-box embedding model without monitoring drift, norm collapse, or nearest-neighbor quality.`,
      },
    ],
    diagrams: [
      {
        title: `Embedding retrieval pipeline`,
        nodes: [
          {
            id: `items`,
            label: `Items`,
            kind: `storage`,
            col: 0,
            row: 0,
          },
          {
            id: `encoder`,
            label: `Encoder`,
            kind: `model`,
            col: 1,
            row: 1,
            detail: `Produces dense vectors for items and queries.`,
          },
          {
            id: `indexer`,
            label: `Indexer`,
            kind: `worker`,
            col: 2,
            row: 1,
          },
          {
            id: `ann`,
            label: `ANN Index`,
            kind: `search`,
            col: 3,
            row: 1,
            detail: `HNSW, IVF, or PQ index tuned for recall, latency, and memory.`,
          },
          {
            id: `query`,
            label: `Query`,
            kind: `client`,
            col: 4,
            row: 0,
          },
          {
            id: `service`,
            label: `Search API`,
            kind: `service`,
            col: 5,
            row: 1,
          },
          {
            id: `ranker`,
            label: `Reranker`,
            kind: `model`,
            col: 6,
            row: 1,
          },
          {
            id: `metrics`,
            label: `Recall/Latency`,
            kind: `monitor`,
            col: 7,
            row: 0,
          },
        ],
        edges: [
          {
            from: `items`,
            to: `encoder`,
            label: `content`,
          },
          {
            from: `encoder`,
            to: `indexer`,
            label: `vectors`,
          },
          {
            from: `indexer`,
            to: `ann`,
            label: `build`,
          },
          {
            from: `query`,
            to: `service`,
            label: `request`,
          },
          {
            from: `service`,
            to: `ann`,
            label: `lookup`,
          },
          {
            from: `ann`,
            to: `ranker`,
            label: `cands`,
          },
          {
            from: `ranker`,
            to: `metrics`,
            label: `log`,
          },
        ],
      },
    ],
    followUps: [
      {
        q: `Why use a two-tower model?`,
        a: `It lets item vectors be precomputed, so retrieval becomes nearest-neighbor search instead of scoring every item online.`,
      },
      {
        q: `What is HNSW's main trade-off?`,
        a: `High recall and low latency at the cost of memory, build time, and tuning graph/search parameters.`,
      },
      {
        q: `How do you evaluate an ANN index?`,
        a: `Compare recall@K against exact search on a representative sample and track p50/p95 latency, memory, build time, and downstream ranker quality.`,
      },
      {
        q: `How do you handle freshness?`,
        a: `Maintain incremental vector updates, tombstones for deletes, index versioning, and fallbacks to lexical or metadata search during lag.`,
      },
      {
        q: `Why add a reranker?`,
        a: `The retriever optimizes fast coarse recall; the reranker uses richer features and interactions to improve precision on a small candidate set.`,
      },
      {
        q: `What are hard negatives?`,
        a: `Incorrect items that look similar to positives. They make embeddings more discriminative but must be sampled carefully to avoid false negatives.`,
      },
    ],
    resources: [
      {
        title: `Efficient and robust approximate nearest neighbor search using HNSW`,
        url: `https://arxiv.org/abs/1603.09320`,
        type: `paper`,
      },
      {
        title: `FAISS: A library for efficient similarity search`,
        url: `https://arxiv.org/abs/1702.08734`,
        type: `paper`,
      },
      {
        title: `ANN Benchmarks`,
        url: `https://ann-benchmarks.com/`,
        type: `article`,
      },
      {
        title: `Deep Neural Networks for YouTube Recommendations`,
        url: `https://research.google/pubs/deep-neural-networks-for-youtube-recommendations/`,
        type: `paper`,
      },
    ],
  },
  {
    id: `llm-systems-rag-fine-tuning-and-evaluation`,
    title: `LLM Systems: RAG, Fine-tuning & Evaluation`,
    category: `Foundations`,
    difficulty: `Hard`,
    summary: `Design LLM applications with retrieval, reranking, guardrails, eval harnesses, fine-tuning decisions, and cost controls.`,
    tags: [
      `llm`,
      `rag`,
      `fine-tuning`,
      `evaluation`,
      `guardrails`,
    ],
    sections: [
      {
        title: `RAG First Principles`,
        body: `- Retrieval augmented generation is useful when the model needs private, fresh, or citation-worthy knowledge that should not be memorized in weights.
- A strong RAG system starts with document ingestion, chunking, metadata, embeddings, indexing, query rewriting, retrieval, reranking, prompt assembly, generation, and attribution.
- Chunking is a product decision: small chunks improve precise recall; larger chunks preserve context. Overlap helps continuity but increases cost and duplicate evidence.`,
      },
      {
        title: `Fine-tuning vs Retrieval`,
        body: `| Need | Prefer |
| --- | --- |
| Fresh facts, permissions, citations | RAG with metadata filters and source links. |
| Style, format, domain language, tool usage | Fine-tuning or instruction tuning. |
| Lower latency or cost for repetitive tasks | Distillation or smaller fine-tuned model. |
| Strict correctness in workflows | Tools, validators, constrained decoding, and human review. |`,
      },
      {
        title: `Evaluation Harness`,
        body: `- Maintain a versioned set of prompts, expected behaviors, source documents, adversarial cases, and production traces. Evaluate retrieval and generation separately.
- Retrieval metrics include context recall, hit rate, MRR, and filter correctness. Generation metrics include groundedness, helpfulness, refusal quality, toxicity, and format adherence.
- LLM-as-judge can scale review but needs calibration with human labels, rubric examples, and bias checks. Keep high-risk cases in human evaluation loops.`,
      },
      {
        title: `Guardrails and Cost`,
        body: `- Use policy filters, prompt injection defenses, source allowlists, PII redaction, rate limits, and tool permission checks. Guardrails should fail closed for sensitive actions.
- Track cost per successful task, token budgets, cache hit rate, retrieval depth, model mix, and retries. Cheaper models can route easy tasks while hard tasks escalate.
- Latency budget often splits across retrieval, reranking, generation, and post-checks. Streaming improves perceived latency but does not reduce total compute.`,
      },
      {
        title: `Common Pitfalls`,
        body: `- Adding fine-tuning when retrieval quality is the bottleneck.
- Evaluating only answer text while ignoring whether the cited source actually supports it.
- Letting the model see documents the user is not authorized to access.
- Ignoring data freshness, deletion requests, and prompt injection inside retrieved content.`,
      },
    ],
    diagrams: [
      {
        title: `RAG serving and evaluation path`,
        nodes: [
          {
            id: `user`,
            label: `User`,
            kind: `client`,
            col: 0,
            row: 1,
          },
          {
            id: `api`,
            label: `API`,
            kind: `gateway`,
            col: 1,
            row: 1,
          },
          {
            id: `retriever`,
            label: `Retriever`,
            kind: `search`,
            col: 2,
            row: 1,
            detail: `Fetches candidate chunks using lexical, vector, or hybrid search.`,
          },
          {
            id: `vector`,
            label: `Vector Index`,
            kind: `search`,
            col: 3,
            row: 0,
            detail: `ANN index with metadata filters and freshness strategy.`,
          },
          {
            id: `rerank`,
            label: `Reranker`,
            kind: `model`,
            col: 4,
            row: 1,
          },
          {
            id: `llm`,
            label: `LLM`,
            kind: `model`,
            col: 5,
            row: 1,
            detail: `Generates grounded answers within a cost and latency budget.`,
          },
          {
            id: `guard`,
            label: `Guardrails`,
            kind: `service`,
            col: 6,
            row: 1,
          },
          {
            id: `eval`,
            label: `Eval Logs`,
            kind: `monitor`,
            col: 7,
            row: 0,
            detail: `Stores prompts, retrieved context, verdicts, and human feedback.`,
          },
        ],
        edges: [
          {
            from: `user`,
            to: `api`,
            label: `query`,
          },
          {
            from: `api`,
            to: `retriever`,
            label: `embed`,
          },
          {
            from: `retriever`,
            to: `vector`,
            label: `ANN`,
          },
          {
            from: `vector`,
            to: `rerank`,
            label: `top K`,
          },
          {
            from: `rerank`,
            to: `llm`,
            label: `context`,
          },
          {
            from: `llm`,
            to: `guard`,
            label: `draft`,
          },
          {
            from: `guard`,
            to: `user`,
            label: `answer`,
          },
          {
            from: `guard`,
            to: `eval`,
            label: `trace`,
            dashed: true,
          },
        ],
      },
    ],
    followUps: [
      {
        q: `When should you fine-tune instead of using RAG?`,
        a: `When the model must learn style, structured outputs, domain phrasing, or task procedure. Use RAG for changing facts and access-controlled knowledge.`,
      },
      {
        q: `How do you evaluate retrieval?`,
        a: `Use labeled queries with relevant documents, measure hit rate, MRR, context recall, filter correctness, freshness, and latency.`,
      },
      {
        q: `How do you reduce hallucinations?`,
        a: `Improve retrieval, require citations, constrain answers to provided context, add verification checks, route uncertainty to refusal or human review, and monitor groundedness.`,
      },
      {
        q: `What is prompt injection in RAG?`,
        a: `Retrieved text contains instructions that try to override the system or user intent. Treat retrieved content as data, not authority.`,
      },
      {
        q: `How do you control LLM cost?`,
        a: `Cache, shorten prompts, reduce retrieval depth, use smaller models for easy cases, batch offline jobs, and monitor cost per resolved task.`,
      },
      {
        q: `What should be logged?`,
        a: `Prompt template version, retrieved document ids, model version, token counts, tool calls, latency, safety decisions, answer, and feedback while respecting privacy.`,
      },
    ],
    resources: [
      {
        title: `Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks`,
        url: `https://arxiv.org/abs/2005.11401`,
        type: `paper`,
      },
      {
        title: `OpenAI Evals`,
        url: `https://github.com/openai/evals`,
        type: `repo`,
      },
      {
        title: `HELM benchmark`,
        url: `https://crfm.stanford.edu/helm/latest/`,
        type: `article`,
      },
      {
        title: `Chip Huyen: LLM Powered Applications`,
        url: `https://huyenchip.com/2023/04/11/llm-engineering.html`,
        type: `article`,
      },
    ],
  },
]

export default docs
