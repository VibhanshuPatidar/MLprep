import type { TheoryTopic } from '../../types/content'

type NoteInput = {
  title: string
  northStar: string
  formulas: string
  core: string
  comparison: string
  worked: string
  interpretation: string
  interview: string
  pitfalls: string
  practice: string
}

const paragraphs = (value: string) => value

const makeNotes = (input: NoteInput) => `
## Why this topic matters

${input.northStar}

ML engineering interviews increasingly test whether you can move beyond model training into trustworthy decision systems. In practice, the hardest parts are often data definitions, experimental validity, feedback loops, monitoring, and operational discipline. A slightly simpler model with reliable data and measurement usually beats an impressive model embedded in a broken process.

### Operating mental model

For applied ML, reason in a lifecycle. Define the prediction time and decision. Build features that are available at that time. Train with validation that mimics deployment. Evaluate against metrics tied to costs. Launch through experiments when possible. Monitor the data, predictions, outcomes, and business process. Retrain only when it improves the full system, not merely because time passed.

${input.formulas}

### Core ideas

${paragraphs(input.core)}

### Comparison table

${input.comparison}

The practical value of a table is that it separates symptoms from root causes. A drift alert, for example, is not automatically a model failure. It could be a logging change, a user mix change, a seasonal pattern, a new product launch, or true concept drift. Strong candidates propose checks that distinguish these cases before retraining or rolling back.

### Worked example

${paragraphs(input.worked)}

Applied examples should always include the unit of analysis and the timing. User-level prediction, session-level prediction, item-level ranking, and request-level scoring have different leakage paths and statistical uncertainty. If the example includes an intervention, clarify whether you are estimating prediction quality, treatment effect, or business impact. Those are related but different questions.

### Intuition

${paragraphs(input.interpretation)}

The useful intuition is that ML systems are measurement systems before they are optimization systems. Features measure state, labels measure outcomes, experiments measure causal impact, and monitoring measures whether the previous measurements still mean what they meant during training. Most production failures are not exotic math failures; they are mismatches between what was measured offline and what is true online.

> **Interview tip:** Use the phrase “available at prediction time” early. It signals that you understand leakage, training-serving skew, and the difference between historical analysis and deployable inference.

> **Common pitfall:** Treating offline model quality as the final goal. The final goal is a reliable decision process, often involving humans, thresholds, product constraints, latency, fairness, and post-launch measurement.

### Interview follow-ups

${paragraphs(input.interview)}

When an interviewer asks an open-ended production question, structure the answer as data, objective, validation, launch, monitoring, and rollback. That order prevents scattered brainstorming. It also surfaces assumptions: how labels arrive, what delay exists, who is affected by mistakes, how the model is served, and how success will be attributed.

### Failure modes and diagnostics

${paragraphs(input.pitfalls)}

Every applied topic needs diagnostics. Data quality issues need freshness, schema, range, null-rate, uniqueness, and distribution checks. Experiment issues need sample-ratio, balance, interference, novelty, and guardrail checks. Production issues need latency, error-rate, drift, calibration, slice, and outcome monitoring. A diagnostic without an owner and threshold is just a dashboard; a diagnostic tied to action becomes operations.

### Practice checklist

${paragraphs(input.practice)}

For final preparation, attach every recommendation to an owner, a threshold, and a rollback or follow-up action. Applied ML answers become credible when they describe who will notice a failure, how quickly it will be noticed, and what happens next. This is also how you distinguish a proof-of-concept from a production system: the production version has contracts, monitoring, decision rules, and a way to recover when assumptions stop holding. In an interview, that operational detail often matters as much as the algorithm choice. Add one sentence about label delay, one about user impact, and one about how the team would learn from the launch.

Before an interview, practice turning a vague product goal into a prediction problem, a causal question, and an operational plan. State what data you need, what can leak, what metric you optimize, what experiment or validation you trust, what you monitor after launch, and what rollback condition you would define. This structure works for fraud, search, recommendations, ads, forecasting, support automation, and risk scoring.
`

const resources = {
  googleMl: { title: 'Google Machine Learning Crash Course', url: 'https://developers.google.com/machine-learning/crash-course', type: 'course' },
  huyenchip: { title: 'Chip Huyen ML Interviews Book', url: 'https://huyenchip.com/ml-interviews-book/', type: 'book' },
  interviews: { title: 'Machine Learning Interviews', url: 'https://github.com/alirezadir/Machine-Learning-Interviews', type: 'repo' },
  cs229: { title: 'Stanford CS229 Notes', url: 'https://cs229.stanford.edu', type: 'course' },
  statquest: { title: 'StatQuest', url: 'https://www.youtube.com/@statquest', type: 'video' },
  esl: { title: 'The Elements of Statistical Learning', url: 'https://hastie.su.domains/ElemStatLearn/', type: 'book' },
}

const topics: TheoryTopic[] = [
  {
    id: 'feature-engineering-data-quality',
    title: 'Feature Engineering & Data Quality',
    category: 'ML in Practice',
    summary: 'Feature engineering converts raw data into deployable signal, while data quality determines whether that signal can be trusted. Interviews emphasize encoding, scaling, leakage, missingness, imbalance, and feature selection with production timing in mind.',
    notes: makeNotes({
      title: 'Feature Engineering & Data Quality',
      northStar: 'Feature engineering is the act of making the right information available to a model in the right form at the right time. Data quality is the discipline that keeps those features and labels faithful after the first notebook succeeds.',
      formulas: `Common transformations and checks:

$$
z=\\frac{x-\\mu_{train}}{\\sigma_{train}}
$$

$$
\\text{target encoding}(c)=\\frac{\\sum_{i:c_i=c} y_i + \\alpha\\bar{y}}{n_c+\\alpha}
$$

$$
\\text{imbalance ratio}=\\frac{N_{majority}}{N_{minority}}
$$`,
      core: 'Encoding turns raw variables into model-consumable representations. One-hot encoding is simple and safe for low-cardinality categoricals, but high-cardinality features may need hashing, embeddings, frequency encoding, or carefully cross-fitted target encoding. Ordinal encoding is appropriate only when order is meaningful or the model can treat codes as categories. Text can be represented by bag-of-words, TF-IDF, embeddings, or task-specific language-model features. Dates become lags, recency, seasonality, holidays, or tenure. Geospatial data can become distances, regions, or learned location embeddings.\n\nScaling matters for distance-based models, regularized linear models, PCA, and gradient optimization. Standardization uses training-set mean and standard deviation; min-max scaling uses a range; robust scaling uses medians and quantiles for outlier resistance. Scaling parameters must be fit on training data only, then reused for validation, test, and production. Missing data deserves a reason, not just an imputer. Missing completely at random differs from missing because a user skipped a field or because an event did not happen. Strategies include missing indicators, simple imputation, model-based imputation, category “unknown,” or using models that handle missingness.\n\nLeakage is the most important feature-engineering failure. It occurs when a feature uses information unavailable at prediction time, derived from the label, computed over future windows, or fitted using validation data. Imbalanced data requires metric and training choices: stratified splits, class weights, resampling inside folds, threshold tuning, top-k evaluation, and careful calibration. Feature selection can be filter-based, wrapper-based, embedded through regularization or tree importance, or driven by ablation. Selection itself must be inside the validation loop to avoid optimistic estimates.',
      comparison: '| Task | Good option | Watch for | Production check |\n|---|---|---|---|\n| Low-cardinality categorical | One-hot encoding | New categories | Unknown bucket rate |\n| High-cardinality categorical | Hashing or cross-fit target encoding | Leakage and collisions | Fold-safe encoding |\n| Numeric scaling | Standard or robust scaler | Fitting on full data | Train-only parameters |\n| Missing data | Indicator plus imputation | Meaning of missingness | Null-rate drift |\n| Imbalanced labels | Weights, sampling, thresholding | Distorted calibration | PR metrics and slice recall |\n| Feature selection | Regularization or ablation | Selection overfit | Nested validation |',
      worked: 'Suppose you build a churn model on subscription data. A tempting feature is “number of support tickets in the next 30 days,” which predicts churn well but is unavailable at prediction time. The deployable version is “number of support tickets in the previous 30 days as of the scoring timestamp.” Another tempting feature is average churn rate by plan type computed over the full dataset. That leaks validation labels unless target encoding is computed inside each training fold or through time-aware historical aggregation.\n\nFor missing data, suppose enterprise customers often leave “company size” blank because the field is optional during sales-assisted onboarding. Missingness itself may signal a segment. Median imputation alone erases that signal; adding a missing indicator preserves it. For imbalance, if churn is 3%, accuracy is weak. Use PR-AUC, recall at a retention-team capacity, calibration by score bucket, and thresholding based on intervention cost. Feature selection should compare offline gains with feature freshness, ownership, latency, and long-term availability.',
      interpretation: 'A feature is a contract between historical data and future serving. The contract specifies meaning, timestamp, entity, aggregation window, default behavior, and freshness. Scaling is not cosmetic; it changes geometry. Encoding is not neutral; it injects assumptions about similarity. Missing values are not always holes; sometimes they are events. Imbalance is not only a training problem; it is a decision problem because positive predictions may be rare and costly. Feature selection is not only about fewer columns; it is about reducing variance, latency, leakage surface, maintenance burden, and monitoring complexity.',
      interview: 'If asked how to engineer features, start from prediction time and entity. Say what raw data sources are available, how you would aggregate only past information, and how you would validate transformations inside folds. For categoricals, compare one-hot, hashing, target encoding, and embeddings. For missing values, ask why they are missing. For imbalance, tie strategy to metric and action budget. If asked feature selection, mention domain knowledge, univariate filters, regularization, permutation importance, ablation, and stability across folds, but warn that importance is not causality.',
      pitfalls: 'Feature pipelines often fail through silent schema changes, unit changes, backfills, duplicate rows, late-arriving data, and inconsistent joins. Leakage can hide in rolling windows that include the prediction day, target encoders fit globally, imputation fitted before splitting, or labels that are proxies for post-treatment outcomes. Resampling before splitting duplicates examples across train and validation. Removing “unimportant” features based on one model can hurt another model or rare slices. High-cardinality IDs can memorize history and fail for new users. Data quality checks need thresholds and owners, not just logs.',
      practice: 'Practice designing features for churn, fraud, delivery ETA, loan default, and search ranking. For each, write the prediction timestamp and list features available before it. Define freshness checks, null-rate checks, range checks, uniqueness checks, and label-delay checks. Explain how to encode categoricals at low and high cardinality. Explain how scaling affects logistic regression, k-means, PCA, and trees differently. Finally, rehearse a leakage story: identify the leaked feature, why validation looked good, and how to rebuild it safely.',
    }),
    flashcards: [
      { q: 'What is the most important timing question for a feature?', a: 'Would this value be available at prediction time in production?' },
      { q: 'When is one-hot encoding appropriate?', a: 'For low-cardinality categorical variables where categories are stable enough.' },
      { q: 'What is target encoding?', a: 'Encoding a category using target statistics, ideally smoothed and computed out-of-fold or historically to avoid leakage.' },
      { q: 'Why is feature scaling needed?', a: 'It affects distance, regularization, PCA, and gradient optimization for many models.' },
      { q: 'Should scaling parameters be fit on validation data?', a: 'No. Fit them on training data only and apply to validation, test, and production.' },
      { q: 'What is data leakage?', a: 'Using information during training or validation that would not be available at prediction time.' },
      { q: 'Why add missing indicators?', a: 'Missingness itself can be predictive when it reflects behavior or process.' },
      { q: 'What is class imbalance?', a: 'A large difference in class frequencies that can make accuracy and training dynamics misleading.' },
      { q: 'Name class-imbalance tactics.', a: 'Use appropriate metrics, stratified splits, class weights, resampling inside folds, and threshold tuning.' },
      { q: 'What is feature selection?', a: 'Choosing a subset of features to improve generalization, interpretability, latency, or maintainability.' },
      { q: 'Why must feature selection be inside cross-validation?', a: 'Selecting features on the full dataset leaks validation information and overstates performance.' },
      { q: 'What is a freshness check?', a: 'A data quality check verifying features are updated within expected time limits.' },
      { q: 'Why are IDs risky features?', a: 'They can memorize historical labels and fail for new or shifted entities.' },
      { q: 'What is a point-in-time join?', a: 'A join that only uses data known before the prediction timestamp.' },
      { q: 'Why monitor null rates?', a: 'Changes in missingness can signal upstream bugs, product changes, or population shift.' },
    ],
    quiz: [
      { q: 'A feature uses events occurring after the prediction timestamp. What is this?', options: ['Leakage', 'Standard scaling', 'Regularization', 'Calibration'], answer: 0, explanation: 'Future information would not be available at inference and corrupts validation.' },
      { q: 'Where should scalers be fit during cross-validation?', options: ['On the full dataset before splitting', 'On each training fold only', 'On the test labels', 'On production logs after scoring'], answer: 1, explanation: 'Fitting transformations on validation data leaks information.' },
      { q: 'Which encoding is most leakage-prone if done globally?', options: ['One-hot encoding of a small fixed list', 'Lowercasing text', 'Target encoding', 'Standardizing by train mean'], answer: 2, explanation: 'Target encoding uses label statistics and must be computed safely.' },
      { q: 'For a 1% positive class, which metric is usually more informative than accuracy?', options: ['Raw row count only', 'Training runtime only', 'Feature cardinality only', 'PR-AUC or recall/precision at an operating point'], answer: 3, explanation: 'Rare positives require metrics focused on positive-class retrieval and decision thresholds.' },
      { q: 'Why add a missing-value indicator?', options: ['Missingness can carry signal', 'It deletes all nulls from source systems', 'It guarantees causality', 'It removes validation needs'], answer: 0, explanation: 'The fact that a value is missing may reflect user or process behavior.' },
      { q: 'Which check catches an upstream pipeline that stopped updating a feature?', options: ['Freshness check', 'AUC only', 'Confusion matrix only', 'Increasing max depth'], answer: 0, explanation: 'Freshness checks verify expected update timing.' },
      { q: 'Why can resampling before splitting be wrong?', options: ['It may duplicate or synthesize information across train and validation', 'It always reduces leakage', 'It removes the minority class', 'It prevents training'], answer: 0, explanation: 'Sampling must be contained within training folds to keep validation honest.' },
      { q: 'What does a point-in-time join enforce?', options: ['Using only data known before the prediction time', 'Joining on target labels only', 'Sorting columns alphabetically', 'Using validation labels for aggregates'], answer: 0, explanation: 'Point-in-time correctness prevents future data from entering features.' },
    ],
    resources: [resources.googleMl, resources.huyenchip, resources.interviews, resources.statquest],
  },
  {
    id: 'experimentation-causal-inference',
    title: 'Experimentation & Causal Inference',
    category: 'ML in Practice',
    summary: 'Experiments estimate the causal impact of product or model changes, not just predictive association. Interview answers should cover A/B tests, CUPED, novelty effects, uplift, interference, and Simpson’s paradox.',
    notes: makeNotes({
      title: 'Experimentation & Causal Inference',
      northStar: 'Causal inference asks what would happen under a different action. In ML products, this matters because better offline predictions do not guarantee that launching a model changes user behavior, revenue, risk, or long-term outcomes in the desired direction.',
      formulas: `Average treatment effect is a potential-outcomes contrast:

$$
ATE=\\mathbb{E}[Y(1)-Y(0)]
$$

A simple difference-in-means estimator is:

$$
\\hat{\\tau}=\\bar{Y}_{treatment}-\\bar{Y}_{control}
$$

CUPED adjusts outcomes using pre-experiment covariates:

$$
Y^{adj}=Y-\\theta(X-\\bar{X}), \\qquad \\theta=\\frac{\\mathrm{Cov}(Y,X)}{\\mathrm{Var}(X)}
$$`,
      core: 'A randomized A/B test assigns units to treatment or control so that, in expectation, groups are comparable. The unit of randomization must match the interference structure: user-level for user experiences, query-level for some search experiments, cluster-level when users affect each other. Primary metrics should be chosen before launch, with guardrails for latency, errors, fairness, retention, or user harm. Sample-ratio mismatch checks whether assignment counts match expectations; failures often indicate logging or eligibility bugs. Balance checks compare pre-treatment covariates, but randomization does not require every covariate to match exactly in finite samples.\n\nCUPED reduces variance by subtracting a pre-experiment covariate correlated with the outcome. It does not fix bias from broken randomization; it improves precision when assumptions hold. Novelty effects occur when users initially react differently because a feature is new; learning effects occur when users or systems adapt over time. Ramp plans, holdouts, and longer follow-up windows help distinguish short-term lift from durable impact.\n\nUplift modeling estimates heterogeneous treatment effects: who benefits from an intervention, not merely who has high baseline risk. A churn model predicts who will churn; an uplift model predicts whose churn probability decreases if contacted. Treating high-risk users can be wasteful if they would churn regardless or stay regardless. Simpson’s paradox occurs when aggregate trends reverse after stratifying by a confounder or segment. In experimentation, pre-specified segmentation and regression adjustment can reveal heterogeneity, but exploratory segment claims need multiple-testing caution.',
      comparison: '| Concept | Answers | Key risk | Diagnostic |\n|---|---|---|---|\n| A/B test | Did treatment cause average change? | Broken randomization | SRM and balance checks |\n| CUPED | Can we reduce variance? | Using post-treatment covariates | Covariate timing check |\n| Novelty effect | Is impact temporary? | Launching too early | Time-sliced effects |\n| Uplift model | Who is persuadable? | Confusing risk with effect | Treatment-control response by segment |\n| Simpson’s paradox | Does aggregation mislead? | Confounding by mix | Stratified metrics |',
      worked: 'Suppose a recommendation model improves offline NDCG and is launched to 10% of users. The A/B test shows click-through up 2% but long-term saves down 1% and latency up 20 ms. A good answer does not declare victory. It asks whether clicks are the primary metric, whether saves are a guardrail, whether latency affects engagement, and whether the effect persists after novelty. It checks sample ratio, exposure logging, user-level randomization, and whether treatment changed item inventory for control users through marketplace interference.\n\nFor CUPED, imagine pre-period weekly spend is highly correlated with experiment-period spend. Adjusting outcomes by pre-period spend can shrink standard errors because high-spend users are high-spend in both groups. The covariate must be measured before treatment; using post-treatment engagement would remove part of the treatment effect and bias the estimate. For uplift, a retention coupon should target users whose probability of staying changes because of the coupon, not simply users with high predicted churn.',
      interpretation: 'Prediction conditions on observed data; causality compares worlds. Randomization creates comparable worlds by design. Confounding breaks observational comparisons when treatment assignment is related to potential outcomes. CUPED is like subtracting predictable baseline variation so the treatment signal is easier to see. Novelty effects remind us that causal effects can be time-dependent. Uplift reminds us that action value depends on treatment response, not baseline risk. Simpson’s paradox reminds us that aggregate metrics are weighted averages, and changing group mix can reverse conclusions.',
      interview: 'If asked to design an A/B test, define unit, population, treatment, control, primary metric, guardrails, duration, sample size or MDE, randomization, logging, and decision rule. If asked why not rely on offline metrics, explain that offline evaluation measures prediction or ranking on historical data, while A/B tests measure causal product impact under changed behavior. If asked about causal inference without randomization, mention assumptions such as unconfoundedness, overlap, and methods like matching, inverse propensity weighting, difference-in-differences, regression discontinuity, or instrumental variables, but be clear that assumptions are not guaranteed.',
      pitfalls: 'Interference violates the assumption that one unit treatment does not affect another unit outcome. Marketplace, social, and ranking systems often have interference. Peeking without sequential methods inflates false positives. Multiple metrics and segments create false discoveries. Novelty can make early lift fade. Logging exposure incorrectly can exclude users who should be counted, creating selection bias. Conditioning on post-treatment variables can block real effects or introduce collider bias. Simpson’s paradox can make an aggregate improvement hide harm to every major segment if traffic mix changes.',
      practice: 'Practice designing experiments for ranking, pricing, onboarding, fraud review, and notification timing. For each, specify randomization unit and possible interference. Compute a simple difference in means and explain confidence intervals. Explain CUPED with a pre-period covariate and give one invalid covariate example. Create an uplift example with four groups: sure things, lost causes, persuadables, and do-not-disturbs. Finally, practice a Simpson’s paradox story where segment weights, not segment performance, drive the aggregate conclusion.',
    }),
    flashcards: [
      { q: 'What does an A/B test estimate?', a: 'The causal effect of a treatment on a metric for the randomized population.' },
      { q: 'What is the average treatment effect?', a: '$\\mathbb{E}[Y(1)-Y(0)]$, the expected difference between treated and untreated potential outcomes.' },
      { q: 'Why randomize?', a: 'Randomization makes treatment assignment independent of potential outcomes in expectation.' },
      { q: 'What is sample ratio mismatch?', a: 'Observed treatment/control counts differ from expected assignment ratios, suggesting experimentation bugs.' },
      { q: 'What is CUPED used for?', a: 'Variance reduction using pre-treatment covariates correlated with the outcome.' },
      { q: 'Can CUPED fix broken randomization?', a: 'No. It improves precision but does not remove bias from invalid assignment.' },
      { q: 'What is a novelty effect?', a: 'A temporary behavior change because users are reacting to something new.' },
      { q: 'What is uplift modeling?', a: 'Modeling heterogeneous treatment effects to target users whose outcomes change because of treatment.' },
      { q: 'How is churn prediction different from uplift?', a: 'Churn prediction estimates baseline risk; uplift estimates change in churn due to an intervention.' },
      { q: 'What is Simpson’s paradox?', a: 'An aggregate trend reverses after stratifying by a relevant group or confounder.' },
      { q: 'What is interference?', a: 'One unit treatment affects another unit outcome, violating independent treatment assumptions.' },
      { q: 'Why define guardrail metrics?', a: 'To catch harms such as latency, errors, fairness issues, or long-term retention drops.' },
      { q: 'What is MDE?', a: 'Minimum detectable effect, the smallest effect an experiment is powered to detect.' },
      { q: 'Why avoid post-treatment covariates in adjustment?', a: 'They may be affected by treatment and can bias or remove part of the causal effect.' },
      { q: 'What is a ramp plan?', a: 'Gradually increasing exposure while monitoring metrics and guardrails before full launch.' },
    ],
    quiz: [
      { q: 'What is the main advantage of random assignment?', options: ['It makes groups comparable in expectation', 'It guarantees every metric improves', 'It removes the need for logging', 'It eliminates novelty effects'], answer: 0, explanation: 'Randomization breaks systematic links between treatment and potential outcomes.' },
      { q: 'CUPED primarily improves what?', options: ['Bias from broken randomization', 'Precision by reducing variance', 'The number of users assigned', 'The definition of treatment'], answer: 1, explanation: 'CUPED subtracts predictable baseline variation when valid pre-treatment covariates exist.' },
      { q: 'Which covariate is invalid for CUPED adjustment?', options: ['Pre-experiment spend', 'Pre-experiment activity', 'Post-treatment clicks caused by the feature', 'Historical tenure'], answer: 2, explanation: 'Post-treatment variables can absorb part of the treatment effect and bias estimates.' },
      { q: 'Uplift modeling estimates what?', options: ['Only the highest-risk users', 'Only prediction latency', 'Only class imbalance', 'Individual or segment-level treatment effect'], answer: 3, explanation: 'Uplift targets heterogeneous response to treatment.' },
      { q: 'What does sample ratio mismatch suggest?', options: ['Assignment or logging may be broken', 'The treatment effect is always positive', 'No control group exists', 'All covariates are balanced'], answer: 0, explanation: 'Unexpected allocation counts often reveal experiment implementation problems.' },
      { q: 'What is interference?', options: ['Treatment of one unit affects another unit outcome', 'A feature is standardized', 'A model uses L2 regularization', 'The p-value is small'], answer: 0, explanation: 'Interference violates independent potential outcomes across units.' },
      { q: 'Why monitor novelty effects?', options: ['Early effects may not persist after users adapt', 'They guarantee long-term retention', 'They remove need for guardrails', 'They are identical to sample size'], answer: 0, explanation: 'Initial curiosity or confusion can produce temporary changes.' },
      { q: 'Simpson’s paradox warns that aggregates can be misleading because of what?', options: ['Changing group mix or confounding', 'Gradient clipping', 'Too many GPUs', 'No labels in training'], answer: 0, explanation: 'Aggregate metrics are weighted by segment composition and can hide segment-level patterns.' },
    ],
    resources: [resources.huyenchip, resources.googleMl, resources.statquest, resources.interviews],
  },
  {
    id: 'mlops-production-ml',
    title: 'MLOps & Production ML',
    category: 'ML in Practice',
    summary: 'Production ML is the discipline of reliably training, serving, monitoring, and improving models after launch. Interviews focus on training-serving skew, drift, monitoring, retraining, registries, and CI/CD adapted for data-dependent systems.',
    notes: makeNotes({
      title: 'MLOps & Production ML',
      northStar: 'MLOps turns a model artifact into a dependable product component. The goal is reproducible training, safe deployment, observable serving, controlled retraining, and clear ownership when data or behavior changes.',
      formulas: `Useful monitoring quantities include:

$$
\\text{skew}(f)=\\mathbb{E}_{train}[f]-\\mathbb{E}_{serve}[f]
$$

Population stability index for binned features:

$$
PSI=\\sum_i (p_i-q_i)\\log\\frac{p_i}{q_i}
$$

A simple calibration error summary:

$$
ECE=\\sum_{b=1}^B \\frac{|B_b|}{n}|acc(B_b)-conf(B_b)|
$$`,
      core: 'Training-serving skew occurs when features or preprocessing differ between offline training and online inference. Causes include different code paths, time-window errors, late data, default values, schema changes, or batch features unavailable online. Feature stores, shared transformation libraries, point-in-time correctness, and online-offline parity tests reduce skew. Model artifacts should include code version, data snapshot, feature definitions, hyperparameters, metrics, dependencies, and approval status. A model registry stores these artifacts and supports promotion from staging to production with traceability.\n\nDrift means the production distribution changes relative to training. Covariate drift changes inputs; label drift changes target distribution; concept drift changes the relationship between inputs and target. Not every drift requires retraining. Some drift reflects a harmless mix shift; some reflects logging bugs; some hurts model quality. Monitoring should cover data quality, feature distributions, prediction distributions, calibration, slice metrics, latency, error rates, and business outcomes. Labels often arrive late, so proxy metrics and delayed outcome dashboards are both needed.\n\nRetraining can be scheduled, triggered by drift or performance degradation, or manually approved for high-risk domains. Retraining pipelines need reproducibility, backfills, validation gates, champion-challenger comparison, rollback plans, and human review when impact is high. CI/CD for ML extends software CI/CD with data tests, feature tests, training pipeline tests, model evaluation gates, bias and safety checks, model-card or documentation updates, and deployment strategies such as shadow mode, canary, blue-green, or gradual ramp. The system should make the safe path easy: no untracked notebook artifacts, no silent schema changes, and no production deploy without metric evidence.',
      comparison: '| Concern | What can go wrong | Guardrail | Example signal |\n|---|---|---|---|\n| Training-serving skew | Offline features differ online | Parity tests | Online null rate spike |\n| Covariate drift | Input mix changes | Distribution monitoring | PSI or KS change |\n| Concept drift | Relationship changes | Outcome monitoring | Calibration worsens |\n| Model registry | Artifact confusion | Versioned promotion | Reproducible metadata |\n| ML CI/CD | Bad model deploys | Evaluation gates | Champion beats challenger |\n| Retraining | Automating bad updates | Approval and rollback | Slice regression check |',
      worked: 'Suppose a loan-risk model performs well offline but approval decisions degrade after launch. Investigation shows an income feature is computed from verified documents in training but from self-reported application text online. That is training-serving skew. The fix is not only retraining; it requires aligning feature definitions, adding online-offline parity tests, backfilling training data using the online definition, and monitoring missingness by channel.\n\nNow suppose a fraud model sees a sudden score distribution shift. Before retraining, check whether an upstream logging deployment changed event names, whether traffic mix changed because of a marketing campaign, whether fraud labels are delayed, and whether business outcomes worsened. If true concept drift is confirmed, compare a retrained challenger on a time-based validation set, calibrate if needed, run shadow scoring, then canary deploy with rollback thresholds. A registry records which data and code produced the challenger so incidents can be audited later.',
      interpretation: 'Production ML is a control system. Training estimates a policy from historical data. Serving applies it under latency and reliability constraints. Monitoring observes whether assumptions still hold. Retraining changes the policy, which can change the data collected next. This feedback loop means that reproducibility and observability are not bureaucracy; they are how teams keep models from silently drifting into harmful behavior. The most mature systems distinguish alerts that require paging, alerts that require investigation, and slow trends that require roadmap work.',
      interview: 'If asked to productionize a model, describe batch versus online serving, feature availability, latency budget, model packaging, registry, deployment strategy, monitoring, and rollback. For skew, emphasize shared code and point-in-time data. For drift, separate input drift from performance drift and mention label delay. For retraining, do not say “retrain daily” by default; choose cadence based on drift speed, label availability, cost, risk, and governance. For CI/CD, include unit tests for transformations, integration tests for pipelines, reproducible training, evaluation gates, security reviews for dependencies, and model documentation.',
      pitfalls: 'A dashboard full of unowned alerts creates fatigue. Retraining on corrupted data can make a model worse faster. Monitoring only aggregate metrics hides slice failures. Monitoring only inputs misses concept drift. Shadow deployments reveal serving behavior but not user impact unless treatment changes are tested. Batch and online features can diverge through timezone handling, late events, or default values. Model registries fail if teams can bypass them. Rollbacks are hard if downstream consumers depend on score distributions, so versioned contracts and communication matter.',
      practice: 'Practice drawing a production ML architecture: data sources, feature pipeline, training job, registry, deployment service, monitoring, labeling loop, and retraining trigger. For each component, state one test. Create a monitoring plan with data quality, drift, prediction, calibration, outcome, latency, and error metrics. Define retraining gates: validation metric improvement, no guardrail regression, calibration acceptable, slices stable, and reproducibility metadata present. In interviews, finish with incident response: detect, triage, rollback or disable, root-cause, backfill if needed, and add a regression test.',
    }),
    flashcards: [
      { q: 'What is training-serving skew?', a: 'A mismatch between how features or preprocessing behave during training and production serving.' },
      { q: 'What is covariate drift?', a: 'The input feature distribution changes between training and production.' },
      { q: 'What is concept drift?', a: 'The relationship between inputs and target changes over time.' },
      { q: 'Does all drift require retraining?', a: 'No. Some drift is harmless or due to logging bugs; first assess impact and root cause.' },
      { q: 'What is a model registry?', a: 'A system that versions model artifacts, metadata, metrics, approvals, and deployment stages.' },
      { q: 'What metadata should a model artifact include?', a: 'Code version, data snapshot, features, hyperparameters, metrics, dependencies, and owner or approval status.' },
      { q: 'What is shadow deployment?', a: 'Running a new model in production without using its predictions for decisions, to observe behavior safely.' },
      { q: 'What is canary deployment?', a: 'Serving a new model to a small traffic fraction before broader rollout.' },
      { q: 'Why are labels often delayed in monitoring?', a: 'True outcomes such as churn, fraud, default, or satisfaction may be known days or months later.' },
      { q: 'What should ML CI/CD test beyond code?', a: 'Data schemas, feature transformations, training reproducibility, evaluation gates, bias/safety checks, and serving parity.' },
      { q: 'What is champion-challenger?', a: 'Comparing a current production model with a candidate model under controlled validation or serving.' },
      { q: 'What is a rollback plan?', a: 'A predefined way to revert to a safer model or disable a feature when guardrails fail.' },
      { q: 'Why monitor prediction distributions?', a: 'Score shifts can reveal data drift, bugs, or behavior changes before labels arrive.' },
      { q: 'Why monitor slice metrics?', a: 'Aggregate metrics can hide failures for important user groups, regions, items, or traffic sources.' },
      { q: 'What is point-in-time correctness?', a: 'Ensuring training data uses only information available at the historical prediction timestamp.' },
    ],
    quiz: [
      { q: 'A feature is computed one way in training and another way online. What is this?', options: ['Training-serving skew', 'AUC improvement', 'Randomization', 'Dropout'], answer: 0, explanation: 'Skew is a mismatch between offline and online feature computation or availability.' },
      { q: 'Which drift changes the input distribution?', options: ['Concept drift only', 'Covariate drift', 'Model registry drift', 'Gradient drift'], answer: 1, explanation: 'Covariate drift concerns $P(X)$ changing.' },
      { q: 'Which drift changes the relationship between X and y?', options: ['Schema drift only', 'Covariate drift only', 'Concept drift', 'Latency only'], answer: 2, explanation: 'Concept drift changes the conditional relationship relevant to prediction.' },
      { q: 'What is a model registry for?', options: ['Deleting validation metrics', 'Replacing all monitoring', 'Serving ads only', 'Versioning artifacts, metadata, stages, and approvals'], answer: 3, explanation: 'Registries provide traceability and controlled promotion.' },
      { q: 'Why use shadow deployment?', options: ['To observe production predictions without affecting users', 'To skip all tests', 'To train without data', 'To hide latency'], answer: 0, explanation: 'Shadow mode lets teams inspect serving behavior safely.' },
      { q: 'What should you do before retraining on a drift alert?', options: ['Check for logging bugs, mix shift, label delay, and metric impact', 'Always retrain immediately', 'Delete the model registry', 'Turn off monitoring'], answer: 0, explanation: 'Drift alerts require triage before automated action.' },
      { q: 'Which is an ML-specific CI/CD gate?', options: ['No validation data ever', 'Evaluation metric and guardrail checks before promotion', 'Manual copy of notebook outputs only', 'Ignoring feature schemas'], answer: 1, explanation: 'ML promotion should require evaluation metrics and guardrails to pass before release.' },
      { q: 'Why are rollback plans important?', options: ['They make model failures recoverable under guardrail breaches', 'They eliminate data quality checks', 'They force daily retraining', 'They prevent all drift'], answer: 0, explanation: 'A rollback limits damage when production behavior is unsafe.' },
    ],
    resources: [resources.huyenchip, resources.googleMl, resources.interviews, resources.cs229],
  },
]

export default topics
