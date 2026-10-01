import type { TheoryTopic } from '../../types/content'

type NoteInput = {
  title: string
  northStar: string
  formulas: string
  comparison: string
  core: string
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

For ML interviews, the useful version of **${input.title}** is not a list of facts. It is a way to turn an ambiguous modeling choice into a defensible answer: what assumptions are being made, what quantity is being optimized, what can break, and how you would verify the decision with data. Strong candidates state the object being reasoned about, write the minimal formula, connect it to training behavior, and then mention the diagnostic they would inspect in a real system.

### A compact mental model

Start with three questions. First, what is random or unknown? Second, what structure lets us compute or approximate it? Third, what evidence would change our mind? This pattern keeps answers grounded. If you are discussing an estimator, name the population quantity and the sample estimate. If you are discussing a model, name the loss, the parameters, and the data distribution. If you are discussing an algorithm, separate the mathematical objective from the numerical procedure used to solve it.

${input.formulas}

### Core ideas to say out loud

${paragraphs(input.core)}

### Comparison table

${input.comparison}

Tables are especially valuable in interviews because they force you to separate assumptions from consequences. Do not present them as memorized trivia. Use the table to justify a design choice: if the data are sparse, if the model must be interpreted, if the metric is asymmetric, or if the production constraint is latency, the correct option may change.

### Worked example

${paragraphs(input.worked)}

A worked example should be small enough to compute by hand but realistic enough to show judgment. Interviewers usually care less about arithmetic and more about whether you can narrate what each number means. When you compute a statistic or an update, pause to interpret the sign, scale, and failure mode. That is the difference between reciting a formula and using it as an engineering tool.

### Intuition and geometry

${paragraphs(input.interpretation)}

A reliable answer usually has both an algebraic view and a geometric or probabilistic view. Algebra helps you derive; geometry helps you debug. If an update is too large, think about curvature and scaling. If a probability is surprising, think about priors and conditioning. If a projection looks too good, ask what variance it preserved and what label information it may have ignored.

> **Interview tip:** Lead with the simplest correct statement, then add caveats. A concise answer such as “I would optimize the likelihood under this assumption, validate the assumption with residuals or calibration, and use regularization if variance is high” sounds more senior than a long list of disconnected terms.

> **Common pitfall:** Treating formulas as interchangeable slogans. Many ML errors come from using the right-looking equation under the wrong sampling process, metric, or deployment constraint.

### How to answer follow-ups

${paragraphs(input.interview)}

When follow-ups become broad, organize your response by data, objective, optimization, and evaluation. This structure works for mathematical questions and system-design questions. It also gives you a graceful way to admit uncertainty: “Under independent sampling this holds; with time dependence I would change the validation split and uncertainty calculation.”

### Failure modes and diagnostics

${paragraphs(input.pitfalls)}

Do not stop at naming a failure mode. Pair each one with a diagnostic. For example, high variance should lead to learning curves or bootstrap intervals; poor conditioning should lead to feature scaling or singular-value inspection; miscalibration should lead to reliability curves; optimization instability should lead to gradient norms and learning-rate sweeps. Interviewers reward this because it shows you can operate a model, not just train it once.

### Practice checklist

${paragraphs(input.practice)}

For final preparation, connect the topic to one realistic failure story. Name the dataset, the assumption you made, the symptom that revealed the assumption was weak, and the corrective action you took. This habit makes even abstract math sound applied: probability becomes calibration under base-rate shift, linear algebra becomes conditioning in a slow training run, and optimization becomes a learning-rate incident. It also gives you a consistent closing sentence: “I would validate the assumption with this diagnostic before trusting the result.” That closing sentence shows judgment, which is usually what the interviewer is testing after the derivation is complete.

Before an interview, practice explaining this topic at three levels: a nontechnical product explanation, a mathematical derivation, and a production debugging story. If you can move among those levels without changing the underlying assumptions, you understand the concept deeply enough for most ML/AI engineering loops.
`

const sharedResources = {
  cs229: { title: 'Stanford CS229 Notes', url: 'https://cs229.stanford.edu', type: 'course' },
  esl: { title: 'The Elements of Statistical Learning', url: 'https://hastie.su.domains/ElemStatLearn/', type: 'book' },
  statquest: { title: 'StatQuest', url: 'https://www.youtube.com/@statquest', type: 'video' },
  googleMl: { title: 'Google Machine Learning Crash Course', url: 'https://developers.google.com/machine-learning/crash-course', type: 'course' },
  interviews: { title: 'Machine Learning Interviews', url: 'https://github.com/alirezadir/Machine-Learning-Interviews', type: 'repo' },
  huyenchip: { title: 'Chip Huyen ML Interviews Book', url: 'https://huyenchip.com/ml-interviews-book/', type: 'book' },
}

const topics: TheoryTopic[] = [
  {
    id: 'probability-distributions',
    title: 'Probability & Distributions',
    category: 'Math & Statistics',
    summary: 'Probability gives ML engineers a language for uncertainty, estimation, and decision-making. Interview answers should connect Bayes rule, common distributions, moments, asymptotics, and likelihood-based estimation to modeling choices.',
    notes: makeNotes({
      title: 'Probability & Distributions',
      northStar: 'Probability is the accounting system for uncertainty. It lets you describe noisy labels, latent variables, randomized experiments, sampling error, and model predictions with the same vocabulary, then update beliefs when evidence arrives.',
      formulas: `Key formulas:

$$
P(A \\mid B)=\\frac{P(B \\mid A)P(A)}{P(B)}
$$

$$
\\mathbb{E}[X]=\\sum_x xP(X=x), \\qquad \\mathrm{Var}(X)=\\mathbb{E}[X^2]-\\mathbb{E}[X]^2
$$

$$
\\hat{\\theta}_{MLE}=\\arg\\max_{\\theta}\\prod_{i=1}^n p(x_i \\mid \\theta), \\qquad
\\hat{\\theta}_{MAP}=\\arg\\max_{\\theta} p(\\theta)\\prod_{i=1}^n p(x_i \\mid \\theta)
$$`,
      core: 'Bayes rule is the central update: prior belief times likelihood, normalized by evidence. In a classifier, it explains why a rare class can still be unlikely after a positive signal if the base rate is tiny. In a ranking or fraud setting, this base-rate correction is often the difference between an impressive offline feature and a useful production model. Independence assumptions matter because they let joint probabilities factor, but they are modeling assumptions, not facts. Conditional independence is more subtle: features can be dependent marginally and independent after conditioning on a label or latent factor.\n\nCommon distributions are best remembered by the data-generating story. Bernoulli models one yes/no event; Binomial counts successes across fixed independent trials; Categorical chooses one of many classes; Multinomial counts repeated categorical draws; Poisson counts events in a fixed exposure window; Exponential models waiting time under a constant hazard; Gaussian appears in measurement error and asymptotic averages; Beta and Dirichlet are convenient priors for probabilities. Expectation is a long-run average or center of mass. Variance is average squared deviation, so it penalizes large misses and carries squared units. Covariance describes joint movement; correlation rescales covariance into a unitless number. The law of total expectation and law of total variance are interview favorites because they decompose uncertainty into within-group noise and between-group signal.\n\nThe Central Limit Theorem says many sample averages become approximately normal after centering and scaling, even when individual observations are not normal, provided no single observation dominates and regularity conditions are reasonable. It justifies approximate confidence intervals and z-style reasoning, but it does not make raw data normal, rescue tiny samples, or handle severe dependence automatically. Maximum likelihood estimation chooses parameters that make the observed data most probable under the assumed model. Maximum a posteriori estimation adds a prior, so it is equivalent to likelihood plus a regularization term in many models. For example, a Gaussian prior on weights produces an L2 penalty; a Laplace prior produces an L1-like penalty.',
      comparison: '| Concept | Use it for | Assumption to check | Interview warning |\n|---|---|---|---|\n| Bayes rule | Updating beliefs after evidence | Prior and likelihood are meaningful | Base rates can dominate strong signals |\n| Gaussian | Noise, averages, linear models | Symmetry and light tails are plausible | Outliers can break estimates |\n| Poisson | Counts per exposure | Rate is stable in the window | Overdispersion suggests another model |\n| MLE | Data-driven parameter fitting | Model family is acceptable | Can overfit without constraints |\n| MAP | Fitting with prior knowledge | Prior encodes real belief or useful bias | Prior choice affects small data strongly |',
      worked: 'Suppose a disease affects 1% of users and a detector has 95% sensitivity and 90% specificity. The probability of disease given a positive result is not 95%. Bayes rule gives numerator $0.95 \\times 0.01=0.0095$ and denominator $0.0095 + 0.10 \\times 0.99=0.1085$, so the posterior is about 8.8%. The detector is informative because it raised belief from 1% to 8.8%, but most positives are still false positives. In an ML product, the same calculation appears when a model flags rare abuse, churn, or high-value conversion. Precision depends on both model quality and prevalence. If the base rate shifts by country, season, or acquisition channel, a single global threshold can produce uneven user impact.\n\nFor MLE versus MAP, imagine estimating a coin bias from 2 heads in 2 flips. MLE returns $\\hat{p}=1$, which predicts tails as impossible. A Beta prior with pseudo-counts gives a MAP or posterior mean that shrinks the estimate away from the boundary. That shrinkage is not cheating; it encodes the belief that two observations should not overwhelm prior uncertainty. In high-dimensional ML, regularization plays the same role.',
      interpretation: 'Probability mass can be imagined as weight distributed over outcomes. Expectation is the balance point; variance is how spread out the weight is. Conditioning slices the world to cases where some event is known, and Bayes rule asks how that slice changes relative plausibility. Likelihood reverses the usual perspective: parameters are fixed candidates, and we ask which candidate would have made the observed sample least surprising. The log-likelihood turns products into sums, which is why loss functions often average per-example negative log probabilities. MLE is pure fit to data; MAP bends the fit toward a prior. As the sample size grows, a weak prior usually matters less, but with sparse features, rare classes, or cold-start users it can dominate important predictions.',
      interview: 'For a probability question, first define events and base rates. Then write Bayes rule or the relevant expectation. If distributions are involved, state the generative assumption: “I would use Poisson if counts arise independently at a roughly constant rate per exposure; otherwise I would check overdispersion.” For CLT questions, say that averages, not arbitrary variables, become approximately normal, and mention dependence and heavy tails as caveats. For estimation questions, describe the likelihood, why logs are used, and how MAP corresponds to adding prior information or regularization. If asked which estimator is better, answer in terms of bias, variance, sample size, and whether prior information is trustworthy.',
      pitfalls: 'The most common mistake is ignoring the denominator in Bayes rule, which hides base rates. Another is confusing independence with zero correlation; zero correlation only rules out linear association, while independence rules out all association. A third is assuming the CLT applies to small samples or to metrics with strong dependence, such as user sessions from the same household. In distributions, watch for support mismatches: a Gaussian can assign probability to negative values, which is awkward for counts or durations. In likelihood work, underflow is a practical problem, so logs are used; non-identifiability is a modeling problem, so very different parameters may explain the data equally well.',
      practice: 'Be able to derive mean and variance for Bernoulli and Binomial variables, explain why sums of independent Poisson variables are Poisson, and describe how a Beta prior updates after Bernoulli observations. Practice converting product likelihoods into negative log-likelihood losses. For each distribution you mention, attach one ML use case and one diagnostic. For example, use Bernoulli for clicks and check calibration by predicted probability bucket; use Gaussian residuals for linear regression and inspect residual plots; use Poisson for request counts and compare empirical variance to the mean. End answers by saying how the assumption would be validated rather than treating the distribution name as final.',
    }),
    flashcards: [
      { q: 'What does Bayes rule compute?', a: 'It computes a posterior probability by combining a prior with a likelihood and normalizing by the evidence: $P(A\\mid B)=P(B\\mid A)P(A)/P(B)$. ' },
      { q: 'Why do base rates matter in rare-event classification?', a: 'Even a high-sensitivity model can produce many false positives when the positive class is rare, so precision depends on prevalence as well as model quality.' },
      { q: 'What is the difference between expectation and variance?', a: 'Expectation is the probability-weighted average value; variance is the expected squared deviation from that average.' },
      { q: 'What does the Central Limit Theorem say in interview terms?', a: 'Under regularity conditions, sums or averages of many independent-like observations become approximately normal after centering and scaling.' },
      { q: 'Does the CLT imply the original data are normally distributed?', a: 'No. It applies to normalized sums or averages, not necessarily to individual observations.' },
      { q: 'What is MLE?', a: 'Maximum likelihood estimation chooses parameters that maximize the probability density or mass of the observed data under the assumed model.' },
      { q: 'What is MAP estimation?', a: 'Maximum a posteriori estimation maximizes likelihood times prior, so it incorporates prior belief or regularization.' },
      { q: 'How does a Gaussian prior on weights relate to regularization?', a: 'It leads to an L2 penalty in the negative log-posterior objective.' },
      { q: 'When is a Poisson distribution a reasonable model?', a: 'For counts in a fixed exposure interval when events occur independently with a roughly constant rate.' },
      { q: 'What is conditional independence?', a: 'Two variables are conditionally independent given a third if knowing one adds no information about the other after conditioning on the third.' },
      { q: 'Why use log-likelihood?', a: 'Logs turn products into sums, improve numerical stability, and often yield simpler derivatives.' },
      { q: 'What is covariance?', a: 'Covariance measures how two variables vary together; its sign shows direction, but its magnitude depends on units.' },
      { q: 'What is correlation?', a: 'Correlation is covariance normalized by the variables standard deviations, making it unitless and bounded between -1 and 1.' },
      { q: 'What is a conjugate prior?', a: 'A prior that produces a posterior in the same distribution family after observing data, such as Beta with Bernoulli observations.' },
      { q: 'What is a support mismatch?', a: 'Using a distribution that assigns probability to impossible values, such as a Gaussian model for strictly nonnegative counts.' },
    ],
    quiz: [
      { q: 'A disease has prevalence 1%, sensitivity 95%, and false-positive rate 10%. What mainly explains low precision?', options: ['The low base rate', 'The high sensitivity', 'The use of Bayes rule', 'The sample mean'], answer: 0, explanation: 'False positives from the 99% healthy population can outnumber true positives from the 1% diseased population.' },
      { q: 'Which statement about the CLT is most accurate?', options: ['It makes every dataset Gaussian', 'It concerns normalized sums or averages under conditions', 'It removes all dependence', 'It only applies to Bernoulli variables'], answer: 1, explanation: 'The CLT is about the distribution of sums or averages, not the raw observations.' },
      { q: 'MAP differs from MLE because MAP adds what?', options: ['A larger batch size', 'A posterior predictive check', 'A prior over parameters', 'A different feature scale'], answer: 2, explanation: 'MAP maximizes likelihood times prior, so the prior changes the optimum especially with limited data.' },
      { q: 'Which distribution is naturally used for a single binary click event?', options: ['Poisson', 'Gaussian', 'Dirichlet', 'Bernoulli'], answer: 3, explanation: 'A Bernoulli random variable represents one yes/no outcome.' },
      { q: 'Why are log-likelihoods preferred in computation?', options: ['They turn products into sums', 'They remove model assumptions', 'They force probabilities to be equal', 'They make priors unnecessary'], answer: 0, explanation: 'Products of many probabilities can underflow; logs convert them to stable sums.' },
      { q: 'What does zero correlation guarantee?', options: ['Independence in all cases', 'No linear association', 'Equal variance', 'A Gaussian distribution'], answer: 1, explanation: 'Zero correlation rules out linear association only; nonlinear dependence can remain.' },
      { q: 'A Gaussian prior on a linear-model coefficient most closely corresponds to which penalty?', options: ['L1', 'Dropout', 'L2', 'Early stopping'], answer: 2, explanation: 'The negative log of a Gaussian prior is proportional to squared coefficient size.' },
      { q: 'A count variable has empirical variance much larger than its mean. What should you question first?', options: ['The use of a log transform in all cases', 'The definition of expectation', 'Whether labels are binary', 'The Poisson assumption'], answer: 3, explanation: 'A basic Poisson model has equal mean and variance, so overdispersion suggests a richer count model.' },
    ],
    resources: [sharedResources.cs229, sharedResources.esl, sharedResources.statquest, sharedResources.googleMl],
  },
  {
    id: 'statistics-hypothesis-testing',
    title: 'Statistics & Hypothesis Testing',
    category: 'Math & Statistics',
    summary: 'Hypothesis testing and interval estimation help quantify uncertainty in experiments, metrics, and model comparisons. Strong interview responses explain what p-values and confidence intervals do and do not mean, then choose tests based on data type and assumptions.',
    notes: makeNotes({
      title: 'Statistics & Hypothesis Testing',
      northStar: 'Statistics turns finite samples into disciplined claims about populations. In ML practice, it appears when comparing models, launching experiments, validating data shifts, interpreting offline metrics, and deciding whether an observed lift is likely to survive outside the sample.',
      formulas: `Useful reference formulas:

$$
\\bar{x} \\pm z_{1-\\alpha/2}\\frac{s}{\\sqrt{n}}
$$

$$
t=\\frac{\\bar{x}-\\mu_0}{s/\\sqrt{n}}, \\qquad \\chi^2=\\sum_i \\frac{(O_i-E_i)^2}{E_i}
$$

$$
\\text{power}=P(\\text{reject }H_0 \\mid H_1\\text{ is true})
$$`,
      core: 'A hypothesis test starts by specifying a null hypothesis, an alternative hypothesis, a test statistic, and a rejection rule. The p-value is the probability, assuming the null model is true, of observing a statistic at least as extreme as the one measured. It is not the probability that the null is true, and it is not the probability that the result will reproduce. Confidence intervals invert repeated-sampling logic: a 95% procedure produces intervals that contain the true parameter in 95% of repeated samples under its assumptions. For one realized interval, the parameter is fixed and the interval either covers it or not.\n\nThe common tests differ by outcome type, sample size, and what is known. A z-test is appropriate when the sampling distribution is approximately normal and variance is known or the sample is large. A t-test uses an estimated standard error and is common for mean comparisons. Paired tests use within-unit differences, which can greatly reduce variance when the same user, item, or query appears in both conditions. Chi-square tests compare categorical counts to expected counts, such as independence between treatment and conversion category. Regression-based tests generalize these ideas and are often better when covariates, clustering, or repeated measures matter.\n\nPower is the probability of detecting an effect of a specified size when it exists. It increases with sample size, lower noise, larger effect size, and sometimes one-sided tests when the direction is justified before seeing data. Multiple testing matters because trying many metrics, segments, or model variants inflates the chance of at least one false positive. Corrections such as Bonferroni control family-wise error conservatively; Benjamini-Hochberg controls false discovery rate and is often more practical for broad metric scans.',
      comparison: '| Tool | Typical use | Key assumption | What to report |\n|---|---|---|---|\n| p-value | Evidence against a null | Test statistic distribution is valid | Statistic, p-value, effect size |\n| Confidence interval | Range of plausible effects | Sampling procedure matches data | Interval and confidence level |\n| t-test | Mean difference with estimated variance | Independent or paired differences | Mean diff and standard error |\n| Chi-square test | Categorical count association | Expected counts not too small | Degrees of freedom and statistic |\n| Power analysis | Experiment planning | Minimum effect is meaningful | Sample size and detectable effect |',
      worked: 'Imagine an A/B test where control conversion is 10.0% over 50,000 users and treatment conversion is 10.4% over 50,000 users. The absolute lift is 0.4 percentage points, or 4% relative. A two-proportion z-test estimates the standard error from both binomial variances, then compares observed lift to that uncertainty. If the confidence interval is roughly [0.05, 0.75] percentage points, the lift is statistically positive, but the product decision still depends on cost, guardrail metrics, novelty effects, and whether the experiment population matches launch traffic. Statistical significance is not business significance.\n\nFor a paired model comparison, suppose two rankers are evaluated on the same 1,000 queries and the new ranker improves NDCG by an average of 0.006 per query. A paired test on query-level differences is more appropriate than treating the two sets of scores as independent, because hard queries are hard for both models. Pairing removes shared query difficulty from the noise term. If many query segments are explored after the fact, the reported p-values should be labeled exploratory or adjusted for multiplicity.',
      interpretation: 'A test statistic is a signal-to-noise ratio. The numerator is the observed effect; the denominator is the estimated variability under a reference model. Larger samples shrink standard errors, so tiny effects can become statistically significant. That is why effect sizes, intervals, and practical thresholds are necessary. Confidence intervals are often more informative than binary decisions because they reveal uncertainty and possible downside. A wide interval crossing zero says the data are compatible with harm and benefit; a narrow interval around zero says the effect is likely small even if the exact p-value is above 0.05.',
      interview: 'When asked to choose a test, identify the metric type first: mean, proportion, count, rank, or time-to-event. Then identify the unit of randomization and whether observations are independent. For online experiments, user-level metrics need user-level aggregation; event-level rows can exaggerate sample size. For model comparisons, ask whether predictions are made on the same examples; if yes, use paired differences or bootstrap over examples. Always mention assumptions and diagnostics: distribution of residuals, skew, outliers, expected cell counts, sample ratio mismatch, and pre-registered primary metrics. If asked about multiple testing, explain the trade-off between avoiding false discoveries and preserving power.',
      pitfalls: 'A common pitfall is saying “p less than 0.05 means the hypothesis is true.” It does not. Another is peeking at experiments repeatedly without sequential correction, which increases false positives. Segment fishing is similar: if you inspect enough slices, some will look impressive by chance. In ML evaluation, leakage can make test statistics meaningless because the sampling process is corrupted. Heavy-tailed metrics such as revenue per user may require winsorization, bootstrap intervals, permutation tests, or robust estimators. Clustered data, such as many actions per user, require cluster-aware uncertainty; treating actions as independent usually understates variance.',
      practice: 'Practice explaining a p-value in one sentence without using the phrase “probability the null is true.” Be able to compute a simple confidence interval for a mean and describe how it changes with sample size. For t-tests, know the difference between one-sample, two-sample, Welch, and paired settings. For chi-square tests, know why expected counts matter. For power, state the four ingredients: significance level, desired power, variance or baseline rate, and minimum detectable effect. In interview case studies, finish by recommending a decision rule before the experiment runs, not after seeing favorable metrics.',
    }),
    flashcards: [
      { q: 'What is a p-value?', a: 'The probability, under the null hypothesis, of observing a test statistic at least as extreme as the one observed.' },
      { q: 'What is a p-value not?', a: 'It is not the probability that the null hypothesis is true and not the probability the result will replicate.' },
      { q: 'How should a 95% confidence interval be interpreted?', a: 'Across repeated samples, the interval-building procedure covers the true parameter about 95% of the time under its assumptions.' },
      { q: 'When is a paired test useful?', a: 'When the same units appear in both conditions, allowing analysis of within-unit differences and reducing variance.' },
      { q: 'When would you use a chi-square test?', a: 'For categorical count data, such as testing independence between treatment group and outcome category.' },
      { q: 'What is statistical power?', a: 'The probability of rejecting the null when a specified alternative effect is truly present.' },
      { q: 'Name two ways to increase power.', a: 'Increase sample size, reduce noise with better measurement or pairing, target larger effects, or use justified one-sided tests.' },
      { q: 'Why is multiple testing a problem?', a: 'Testing many hypotheses raises the chance that at least one appears significant by random variation.' },
      { q: 'What does Bonferroni control?', a: 'It controls family-wise error rate by using a stricter per-test threshold, often $\\alpha/m$.' },
      { q: 'What does Benjamini-Hochberg control?', a: 'It controls the false discovery rate, the expected proportion of false positives among discoveries.' },
      { q: 'Why report effect size with a p-value?', a: 'Large samples can make tiny unimportant effects statistically significant; effect size shows practical magnitude.' },
      { q: 'What is sample ratio mismatch in A/B tests?', a: 'A mismatch between expected and observed treatment allocation, often indicating logging, bucketing, or eligibility bugs.' },
      { q: 'Why can event-level tests be misleading?', a: 'Events from the same user are correlated, so treating them as independent understates uncertainty.' },
      { q: 'What is a one-sided test?', a: 'A test with an alternative in one direction, appropriate only when the opposite direction would not count as success before seeing data.' },
      { q: 'Why might bootstrap be useful?', a: 'It estimates uncertainty by resampling units and can handle complex metrics where analytic standard errors are awkward.' },
    ],
    quiz: [
      { q: 'A p-value of 0.03 means which statement is correct?', options: ['The null is false with 97% probability', 'The observed result is impossible under the null', 'Under the null, results this extreme or more would occur about 3% of the time', 'The effect is practically important'], answer: 2, explanation: 'The p-value is conditional on the null model and describes extremeness, not posterior truth.' },
      { q: 'Which test design is best when two models are scored on the same queries?', options: ['Paired comparison over query-level differences', 'Independent rows for every score', 'A chi-square test on model names only', 'No uncertainty estimate'], answer: 0, explanation: 'Pairing accounts for shared query difficulty and usually reduces variance.' },
      { q: 'What happens to standard error when sample size increases fourfold, all else equal?', options: ['It quadruples', 'It halves', 'It becomes the p-value', 'It does not change'], answer: 1, explanation: 'Standard error for a mean scales like $1/\\sqrt{n}$, so four times data gives half the standard error.' },
      { q: 'Which method is commonly used to control false discovery rate?', options: ['Welch t-test', 'Bootstrap percentile', 'Bonferroni only', 'Benjamini-Hochberg'], answer: 3, explanation: 'Benjamini-Hochberg is designed to control false discovery rate.' },
      { q: 'What is power?', options: ['Probability of rejecting the null when the alternative is true', 'Probability the null is true', 'A measure of model latency', 'The width of a confidence interval'], answer: 0, explanation: 'Power is sensitivity to a specified real effect.' },
      { q: 'A confidence interval is very wide and crosses zero. What is the best interpretation?', options: ['The treatment definitely has no effect', 'The data are compatible with both positive and negative effects', 'The p-value must be zero', 'The sample size is infinite'], answer: 1, explanation: 'A wide interval reflects high uncertainty and includes effects on both sides of zero.' },
      { q: 'What is a major danger of repeatedly peeking at an experiment and stopping when significant?', options: ['It reduces conversion rate by definition', 'It changes the metric units', 'It inflates the false-positive rate', 'It makes data independent'], answer: 2, explanation: 'Repeated looks without correction create more chances to find random significance.' },
      { q: 'For a categorical contingency table, which test is most standard?', options: ['t-test', 'z-test for means', 'Gradient descent', 'Chi-square test'], answer: 3, explanation: 'Chi-square tests compare observed and expected counts in categories.' },
    ],
    resources: [sharedResources.statquest, sharedResources.googleMl, sharedResources.esl, sharedResources.huyenchip],
  },
  {
    id: 'linear-algebra-for-ml',
    title: 'Linear Algebra for ML',
    category: 'Math & Statistics',
    summary: 'Linear algebra explains how data, parameters, projections, and gradients move through ML models. Interview-ready knowledge focuses on vector spaces, matrix factorizations, norms, basic matrix calculus, and the PCA connection.',
    widgets: ['pca'],
    notes: makeNotes({
      title: 'Linear Algebra for ML',
      northStar: 'Linear algebra is the geometry of machine learning. It describes data matrices, embedding spaces, projections, optimization directions, attention operations, covariance structure, and why scaling or conditioning can make a model easy or painful to train.',
      formulas: `Core formulas:

$$
X \\in \\mathbb{R}^{n \\times d}, \\qquad \\|x\\|_2=\\sqrt{\\sum_{j=1}^d x_j^2}, \\qquad \\|w\\|_1=\\sum_{j=1}^d |w_j|
$$

$$
Av=\\lambda v, \\qquad X=U\\Sigma V^T
$$

$$
\\nabla_w \\frac{1}{2}\\|Xw-y\\|_2^2 = X^T(Xw-y)
$$`,
      core: 'A vector is a point or direction; a matrix is a linear transformation or a table of examples and features depending on context. In ML, $X$ often stores rows as examples and columns as features. Multiplying by $w$ forms predictions as weighted combinations of columns. Matrix multiplication composes transformations, so deep linear layers without nonlinearities collapse into one linear map. Rank measures the number of independent directions a matrix represents. Low rank means redundancy, compression opportunity, or non-identifiability.\n\nEigenvalues and eigenvectors describe directions that a square transformation only stretches or flips. They are natural for covariance matrices, graph matrices, and stability analysis. Singular value decomposition is broader because every matrix has an SVD. It decomposes $X$ into left singular vectors, singular values, and right singular vectors. The singular values reveal energy by direction, numerical rank, conditioning, and the best low-rank approximation under common norms. PCA is SVD applied to centered data or eigendecomposition applied to the covariance matrix; it chooses orthogonal directions of maximum variance, not necessarily maximum predictive power.\n\nNorms measure size and induce different geometry. L2 norm is rotationally symmetric and leads to smooth shrinkage. L1 norm has corners and encourages sparsity when used as a penalty. Matrix norms extend the idea to transformations. Conditioning describes how much outputs or solutions change when inputs are perturbed. A poorly conditioned feature matrix makes regression coefficients unstable and gradient descent slow. Matrix calculus provides compact derivatives: the gradient of squared error is $X^T(Xw-y)$, which says residuals are pushed back through features. Understanding shapes prevents many bugs; every derivative should have the same shape as the parameter it updates.',
      comparison: '| Concept | Geometric meaning | ML use | Risk if misunderstood |\n|---|---|---|---|\n| Rank | Number of independent directions | Redundancy and identifiability | Coefficients can be unstable |\n| Eigenvectors | Directions preserved by a square map | Covariance, PCA, dynamics | Only applies directly to square matrices |\n| SVD | Orthogonal input/output directions plus scales | Compression and conditioning | Large singular values can dominate |\n| L1 norm | Diamond-shaped constraint | Sparse solutions | Not differentiable at zero |\n| L2 norm | Round constraint | Smooth shrinkage and distance | Sensitive to feature scaling |',
      worked: 'Suppose a dataset has two centered features: height in centimeters and height in inches. The columns are almost perfectly collinear, so the data matrix has one large singular value and one near-zero singular value. Linear regression can fit predictions, but individual coefficients are unstable because many combinations of centimeter and inch weights represent the same signal. Ridge regularization stabilizes the solution by preferring smaller L2 norm weights; PCA would reveal that nearly all variance lies along one direction.\n\nFor matrix calculus, take squared-error loss $L(w)=\\frac{1}{2}\\|Xw-y\\|_2^2$. The residual vector is $r=Xw-y$. A small parameter change $dw$ changes predictions by $Xdw$ and loss by $r^T Xdw$, so the gradient is $X^T r$. This derivation is more useful than memorizing because it generalizes: backprop repeatedly moves error signals backward through linear maps using transposes. If the gradient shape is not $d \\times 1$, something is wrong.',
      interpretation: 'The SVD view says every dataset has preferred directions. Right singular vectors are feature-space directions, left singular vectors are example-space patterns, and singular values say how much variation each pair explains. PCA keeps top directions because projecting onto them minimizes squared reconstruction error among orthogonal projections. However, PCA is unsupervised. A low-variance direction can be highly predictive if labels depend on it, and a high-variance direction can be nuisance variation such as lighting or popularity. Norms define what “large” means; feature scaling changes L1 and L2 penalties because the same coefficient magnitude can imply different real-world effect sizes.',
      interview: 'If asked about PCA, start with centering, covariance, eigenvectors, and variance maximization. Then mention SVD as the stable implementation path. If asked about matrix calculus, state shapes first, derive squared-error gradient, and connect transpose multiplication to backprop. For norms, compare L1 sparsity with L2 smooth shrinkage through geometry. If asked why training is slow, mention conditioning: elongated loss contours cause gradients to zigzag, while normalization, whitening, preconditioning, or adaptive optimizers can help. For embeddings, discuss dot products as similarity only when vector norms and normalization are understood.',
      pitfalls: 'A common error is applying eigendecomposition to a non-square data matrix without moving to covariance or SVD. Another is forgetting to center before PCA; otherwise the first component may capture the mean offset. Feature scaling can dominate distance-based models and PCA because large-unit features contribute more variance. Rank deficiency can make normal equations unstable, so directly inverting $X^T X$ is usually worse than using QR, SVD, or regularized solvers. In matrix calculus, silently dropping transposes creates gradients with plausible numbers and wrong shapes. In production embeddings, comparing raw dot products may rank high-norm popular items over genuinely similar items.',
      practice: 'Practice drawing L1 and L2 balls, deriving the least-squares gradient, and explaining PCA in both covariance and SVD language. Given a rectangular matrix, identify the shapes of $U$, $\\Sigma$, and $V^T$. Given a model with unstable coefficients, ask whether columns are collinear or poorly scaled. Given a nearest-neighbor system, ask whether vectors are normalized and which norm is aligned with the product goal. Finally, connect linear algebra to debugging: inspect singular values for conditioning, residual projections for missed structure, and explained-variance curves for dimensionality decisions.',
    }),
    flashcards: [
      { q: 'What does matrix rank measure?', a: 'The number of linearly independent directions represented by the rows or columns of a matrix.' },
      { q: 'What is an eigenvector?', a: 'A nonzero vector whose direction is unchanged by a square matrix transformation: $Av=\\lambda v$.' },
      { q: 'Why is SVD more general than eigendecomposition?', a: 'SVD applies to any rectangular matrix, while eigendecomposition directly applies to square matrices with suitable properties.' },
      { q: 'How does PCA relate to SVD?', a: 'PCA can be computed by applying SVD to centered data; right singular vectors give principal directions.' },
      { q: 'What does PCA maximize?', a: 'Variance of projected data along orthogonal directions, equivalently minimizing squared reconstruction error for a fixed dimension.' },
      { q: 'Why center data before PCA?', a: 'Without centering, components can capture the mean offset rather than directions of variation around the mean.' },
      { q: 'What is the L2 norm?', a: 'Euclidean length, $\\|x\\|_2=\\sqrt{\\sum_j x_j^2}$.' },
      { q: 'Why does L1 regularization encourage sparsity?', a: 'The L1 constraint has corners aligned with axes, so optima often occur where some coefficients are exactly zero.' },
      { q: 'What is conditioning?', a: 'How sensitive a problem or solution is to small input perturbations; poor conditioning makes optimization and inversion unstable.' },
      { q: 'What is the gradient of $\\frac{1}{2}\\|Xw-y\\|_2^2$?', a: '$X^T(Xw-y)$.' },
      { q: 'Why avoid directly inverting $X^T X$?', a: 'It can be numerically unstable, especially when features are collinear or poorly conditioned.' },
      { q: 'What do singular values indicate?', a: 'How much the matrix stretches data along corresponding singular directions.' },
      { q: 'What does low rank suggest?', a: 'Redundancy, compressible structure, or possible non-identifiability.' },
      { q: 'How can feature scaling affect PCA?', a: 'Features with larger numerical variance can dominate principal components even if they are not more meaningful.' },
      { q: 'Why do gradient shapes matter?', a: 'A gradient must match the parameter shape; shape checks catch many matrix calculus mistakes.' },
    ],
    quiz: [
      { q: 'Which factorization exists for any real rectangular matrix?', options: ['SVD', 'Eigendecomposition only', 'Cholesky only', 'LU only for covariance'], answer: 0, explanation: 'SVD decomposes any matrix into singular vectors and singular values.' },
      { q: 'PCA on centered data chooses directions that maximize what?', options: ['Label accuracy directly', 'Projected variance', 'Number of rows', 'L1 penalty'], answer: 1, explanation: 'PCA is unsupervised and maximizes variance, not label accuracy.' },
      { q: 'The gradient of squared error $\\frac{1}{2}\\|Xw-y\\|^2$ is:', options: ['$Xw-y$', '$XX^T-y$', '$X^T(Xw-y)$', '$w^TX-y$'], answer: 2, explanation: 'Residuals are mapped back to parameter space by $X^T$.' },
      { q: 'Which norm is most associated with sparsity when used as a penalty?', options: ['L2', 'Frobenius only', 'Spectral', 'L1'], answer: 3, explanation: 'L1 geometry has axis-aligned corners that encourage exact zeros.' },
      { q: 'Why can collinear features destabilize linear regression coefficients?', options: ['The design matrix is poorly conditioned', 'They always improve rank', 'They remove all variance', 'They make gradients zero for every point'], answer: 0, explanation: 'Near-collinearity creates directions where many coefficient combinations fit similarly.' },
      { q: 'What must be true for a vector to be an eigenvector of $A$?', options: ['It must be a row of the data matrix', 'Applying $A$ only scales it', 'It must have L1 norm zero', 'It must be orthogonal to all data'], answer: 1, explanation: 'An eigenvector keeps its direction under the transformation.' },
      { q: 'What is a risk of using raw dot product for embedding similarity?', options: ['It ignores vector norms only when normalized', 'It cannot be computed efficiently', 'Large-norm items may dominate rankings', 'It is identical to Euclidean distance always'], answer: 2, explanation: 'Dot products combine angle and magnitude, so high-norm popular vectors can rank highly.' },
      { q: 'Which diagnostic helps identify effective dimensionality?', options: ['A confusion matrix only', 'A p-value for every feature', 'Training latency only', 'The singular value spectrum'], answer: 3, explanation: 'The decay of singular values shows how much variation lies in each direction.' },
    ],
    resources: [sharedResources.cs229, sharedResources.esl, sharedResources.statquest, sharedResources.googleMl],
  },
  {
    id: 'optimization',
    title: 'Optimization',
    category: 'Math & Statistics',
    summary: 'Optimization connects objective functions to the algorithms that train ML models. Interview fluency means explaining convexity, gradient methods, adaptive optimizers, schedules, and second-order intuition without confusing the loss with the solver.',
    widgets: ['gradient-descent', 'lr-schedule'],
    notes: makeNotes({
      title: 'Optimization',
      northStar: 'Optimization is the bridge between a modeling goal and actual parameters. The objective says what good means; the optimizer says how the model searches for it under finite data, finite compute, noisy gradients, and imperfect numerical conditions.',
      formulas: `Useful update rules:

$$
\\theta_{t+1}=\\theta_t-\\eta \\nabla_{\\theta} L(\\theta_t)
$$

$$
v_t=\\mu v_{t-1}+\\nabla L(\\theta_t), \\qquad \\theta_{t+1}=\\theta_t-\\eta v_t
$$

$$
\\theta_{t+1}\\approx \\theta_t-H^{-1}\\nabla L(\\theta_t)
$$`,
      core: 'Convexity is valuable because every local minimum is global, and first-order conditions are easier to reason about. Linear regression with squared loss and logistic regression with negative log-likelihood are convex in their parameters, but deep neural networks are generally nonconvex. Nonconvex does not mean hopeless; it means initialization, architecture, normalization, stochasticity, and schedules matter. Smoothness controls how quickly gradients can change. Strong convexity gives curvature in all directions and yields faster convergence guarantees. Constraints and regularization change the geometry of the solution.\n\nGradient descent uses the full gradient over the training set. Stochastic gradient descent estimates the gradient from one example or mini-batch, adding noise that can help escape sharp areas but also makes convergence jittery. Mini-batches balance hardware efficiency and gradient variance. Momentum accumulates a velocity, dampening oscillation in steep directions and speeding progress along consistent directions. Nesterov momentum peeks ahead before computing the correction. Adam keeps exponential moving averages of first and second moments of gradients, giving parameter-wise adaptive step sizes. It often trains deep models quickly, but final generalization can differ from SGD, and weight decay should be implemented carefully as decoupled AdamW in many neural settings.\n\nLearning-rate schedules matter because the best step size changes during training. Warmup prevents early instability when activations, normalization statistics, or adaptive moments are uncalibrated. Step decay and exponential decay reduce the rate after progress slows. Cosine decay gradually anneals and is common in deep learning. Cyclical schedules can help explore and may reveal a good maximum learning rate. Second-order intuition comes from the Hessian: high curvature directions require smaller steps, while flat directions allow larger steps. Newton-style methods rescale gradients by curvature, but exact Hessians are expensive for large models, so approximations, preconditioners, and adaptive optimizers borrow parts of the idea.',
      comparison: '| Method | Strength | Weakness | Interview phrase |\n|---|---|---|---|\n| Batch GD | Stable descent direction | Expensive on large data | Good for convex small problems |\n| SGD | Cheap noisy updates | High variance and tuning needs | Noise can help exploration |\n| Momentum | Faster along consistent slopes | Extra hyperparameter | Velocity smooths zigzags |\n| Adam | Adaptive per-parameter scaling | Can generalize differently | Great default, still tune LR |\n| Newton intuition | Uses curvature | Hessian is expensive | Rescale steps by local shape |',
      worked: 'Consider minimizing an elongated quadratic bowl. Plain gradient descent points steeply across the narrow wall, so it zigzags while making slow progress down the valley. Reducing the learning rate prevents divergence but slows every direction. Momentum averages gradients over time: oscillating components cancel, while consistent downhill components accumulate. A preconditioner or second-order method rescales the axes so the valley looks rounder. This example explains why feature standardization helps linear models and why adaptive optimizers help neural networks with parameters that receive gradients of different scales.\n\nFor a learning-rate schedule, imagine training validation loss drops quickly for five epochs, then plateaus while training loss continues to fall. A lower learning rate can refine the solution rather than bouncing around it. If training diverges in the first few hundred steps, warmup or a smaller peak learning rate may fix it. If validation performance worsens while training improves, the issue may be overfitting, not optimization, and regularization or early stopping is more appropriate than simply changing optimizers.',
      interpretation: 'The gradient is the direction of steepest local increase, so negative gradient is the locally steepest descent under Euclidean geometry. The learning rate chooses how much to trust that local linear approximation. Curvature tells you how quickly the approximation becomes stale. In flat regions, large steps may be safe; in sharp regions, they can overshoot. SGD noise means each update is a biased or unbiased estimate of the population direction depending on sampling and objective details. The noise scale depends on batch size and learning rate, which is why changing batch size often requires changing the schedule. Optimization and generalization are connected but not identical: a lower training loss is useful only if the validation and deployment distributions benefit.',
      interview: 'When asked how to train a model, separate objective, optimizer, and schedule. Say what loss you minimize, what gradients you use, what optimizer is the starting point, and what metrics decide early stopping. For convex objectives, discuss guarantees and conditioning. For deep learning, discuss initialization, normalization, gradient clipping, warmup, weight decay, and validation monitoring. If asked Adam versus SGD, answer with trade-offs: Adam is robust and fast for sparse or noisy gradients; SGD with momentum can generalize strongly in some vision settings; AdamW is standard for transformers. If asked about second-order methods, mention curvature-aware scaling and why exact Hessians are usually too costly.',
      pitfalls: 'Do not call every training failure a local minimum. Many failures are due to learning rate, data bugs, exploding gradients, bad initialization, or distribution mismatch. Do not assume Adam removes the need for feature scaling, schedule tuning, or regularization. Do not conflate L2 regularization with decoupled weight decay in adaptive optimizers; they behave differently because Adam rescales gradients. Very large batches can reduce gradient noise and harm generalization or require schedule changes. A validation plateau may mean optimization saturation, but it may also mean the model lacks capacity, features are weak, labels are noisy, or the metric is insensitive.',
      practice: 'Practice deriving the gradient update for linear regression and logistic regression. Draw contour plots for well-conditioned and ill-conditioned bowls and explain how momentum changes the path. Memorize the qualitative roles of learning rate, batch size, momentum, beta parameters in Adam, weight decay, and gradient clipping. For every optimizer answer, include the monitoring plan: training loss for optimization, validation loss for generalization, gradient norms for stability, and learning-rate sweeps for tuning. If you can explain why warmup, decay, and early stopping solve different problems, your answer will sound practical rather than cookbook-like.',
    }),
    flashcards: [
      { q: 'What does convexity guarantee for local minima?', a: 'In a convex objective, any local minimum is also a global minimum.' },
      { q: 'What is the basic gradient descent update?', a: '$\\theta_{t+1}=\\theta_t-\\eta\\nabla L(\\theta_t)$.' },
      { q: 'Why use mini-batch SGD?', a: 'It balances computational efficiency with a lower-variance gradient estimate than single-example SGD.' },
      { q: 'What does momentum do?', a: 'It accumulates a velocity that smooths noisy gradients, reduces zigzagging, and speeds movement along consistent directions.' },
      { q: 'Why can a learning rate be too high?', a: 'Steps can overshoot useful regions, causing oscillation or divergence.' },
      { q: 'Why can a learning rate be too low?', a: 'Training may converge very slowly or get stuck making negligible progress.' },
      { q: 'What is Adam adapting?', a: 'Adam uses moving averages of gradients and squared gradients to create parameter-wise adaptive step sizes.' },
      { q: 'Why use learning-rate warmup?', a: 'Warmup reduces early instability before model activations, optimizer moments, or normalization statistics are well behaved.' },
      { q: 'What is second-order intuition?', a: 'Use curvature information to rescale gradient steps, taking smaller steps in sharp directions and larger steps in flat directions.' },
      { q: 'Why are exact Newton methods rare for huge neural networks?', a: 'Computing, storing, and inverting the Hessian is usually too expensive.' },
      { q: 'What is gradient clipping for?', a: 'It limits gradient norm or value to reduce exploding update steps.' },
      { q: 'What is the difference between optimization and generalization?', a: 'Optimization reduces training objective; generalization concerns performance on unseen data from the target distribution.' },
      { q: 'What does poor conditioning cause?', a: 'Slow or unstable optimization because different directions require very different step sizes.' },
      { q: 'Why might validation loss worsen while training loss improves?', a: 'The model may be overfitting, or validation distribution/metric may differ from training.' },
      { q: 'What is AdamW?', a: 'An Adam variant with decoupled weight decay, often preferred because regularization is not entangled with adaptive gradient scaling.' },
    ],
    quiz: [
      { q: 'Which objective property ensures any local minimum is global?', options: ['Convexity', 'Dropout', 'Large batch size', 'Momentum'], answer: 0, explanation: 'Convex functions have no bad local minima.' },
      { q: 'What does momentum primarily help with?', options: ['Changing labels', 'Smoothing zigzags and accelerating consistent directions', 'Making the loss nonconvex', 'Removing all regularization'], answer: 1, explanation: 'Momentum accumulates a velocity from recent gradients.' },
      { q: 'Adam uses moving averages of which quantities?', options: ['Labels and predictions', 'Weights and logits', 'Gradients and squared gradients', 'Features and residual signs'], answer: 2, explanation: 'Adam tracks first and second moments of gradients.' },
      { q: 'Why is a Hessian useful conceptually?', options: ['It stores the dataset', 'It replaces validation data', 'It makes labels balanced', 'It describes local curvature'], answer: 3, explanation: 'Curvature explains how step sizes should vary by direction.' },
      { q: 'A model diverges in the first few hundred steps. What is a plausible first fix?', options: ['Lower the peak learning rate or add warmup', 'Increase p-value threshold', 'Remove validation monitoring', 'Use a larger test set only'], answer: 0, explanation: 'Early divergence often indicates unstable update sizes.' },
      { q: 'Which statement best separates loss and optimizer?', options: ['The loss defines the objective; the optimizer searches for parameters', 'They are always the same thing', 'The optimizer defines labels', 'The loss is used only at inference'], answer: 0, explanation: 'The loss defines what is being minimized, while the optimizer is the numerical procedure used to search for parameters.' },
      { q: 'Which schedule is commonly used to gradually anneal a learning rate in deep learning?', options: ['Chi-square schedule', 'Random label schedule', 'Cosine decay', 'Support-vector schedule'], answer: 2, explanation: 'Cosine decay smoothly lowers the learning rate over training.' },
      { q: 'What diagnostic directly checks update stability?', options: ['ROC-AUC only', 'Feature names alphabetically', 'Number of dashboard colors', 'Gradient norms'], answer: 3, explanation: 'Gradient norms help reveal exploding, vanishing, or unstable updates.' },
    ],
    resources: [sharedResources.cs229, sharedResources.googleMl, sharedResources.statquest, sharedResources.huyenchip],
  },
]

export default topics
