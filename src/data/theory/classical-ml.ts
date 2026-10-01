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

Classical ML remains interview-critical because it exposes the trade-offs hidden inside larger systems. Linear models, trees, kernels, clustering, and metrics are small enough to reason about precisely, yet they show the same production questions as deep learning: what signal exists, what inductive bias is being used, how uncertainty is measured, and how the model will fail under shift.

### A practical mental model

For any classical method, answer four questions. What representation of the data does it assume? What objective or splitting criterion is optimized? What hyperparameters control capacity? What diagnostic tells you whether the model is underfitting, overfitting, miscalibrated, or solving the wrong business problem? If you can map a method onto those questions, you can handle most follow-ups without memorizing every variant.

${input.formulas}

### Core ideas

${paragraphs(input.core)}

### Comparison table

${input.comparison}

A table is not just a summary device. In an interview, it lets you choose deliberately. If the dataset is tabular with nonlinear interactions and missing values, a boosted tree may be a better first model than a neural net. If the model must be explainable to operations teams, a regularized logistic regression may beat a marginally more accurate black box. If labels are scarce, a simpler model with stronger bias may generalize better.

### Worked example

${paragraphs(input.worked)}

In worked examples, narrate both the calculation and the decision. A senior answer says what you would do next: tune a hyperparameter, inspect residuals, adjust a threshold, change the validation split, or collect a more informative feature. Classical ML questions often reward this loop because the math is simple enough that interviewers expect operational judgment.

### Intuition

${paragraphs(input.interpretation)}

Most classical algorithms can be understood geometrically. Linear models draw planes, regularization changes the feasible region, trees partition feature space into rectangles, kernels change the feature space where a linear separator is drawn, clustering defines a notion of closeness, and metrics choose which mistakes count. Whenever possible, translate algebra into a picture and then translate the picture back into a production consequence.

> **Interview tip:** When comparing models, avoid saying one is universally better. Say “under these data properties and constraints, I would start with this baseline, measure these diagnostics, and only add complexity if the error pattern justifies it.”

> **Common pitfall:** Optimizing the training objective while ignoring the evaluation metric. A model can reduce log loss but hurt recall at the operating threshold, or improve RMSE while damaging ranking quality.

### Interview follow-ups

${paragraphs(input.interview)}

Good follow-up answers separate modeling, validation, and deployment. Modeling asks what function class is expressive enough. Validation asks whether the estimate of performance is honest. Deployment asks whether the model is stable, explainable, fast, monitored, and aligned with the downstream decision threshold or ranking surface.

### Failure modes and diagnostics

${paragraphs(input.pitfalls)}

The fastest way to sound practical is to pair every failure mode with a diagnostic. Overfitting leads to train-validation gaps and learning curves. Data leakage leads to suspiciously high validation performance and features unavailable at inference. Class imbalance leads to misleading accuracy and unstable minority-class metrics. Poor calibration leads to reliability diagrams. Distribution shift leads to slice metrics and drift monitoring.

### Practice checklist

${paragraphs(input.practice)}

For final preparation, connect the topic to one realistic failure story. Name the dataset, the modeling choice, the validation symptom, and the corrective action. Classical ML interviews reward candidates who can move from an equation to a model card: what assumption was made, how it was tested, how the metric changed, and what production trade-off remained. This habit also prevents overclaiming. Instead of saying a method is best, you can say it is a strong baseline under specific data properties, then describe the evidence that would make you keep it or replace it.

Before an interview, rehearse a two-minute explanation, a derivation, and a debugging story for this topic. The derivation proves you know the math; the debugging story proves you can use it. If your final answer includes assumptions, hyperparameters, diagnostics, and trade-offs, it will usually be strong even if the interviewer asks a variant you have not seen before.
`

const resources = {
  cs229: { title: 'Stanford CS229 Notes', url: 'https://cs229.stanford.edu', type: 'course' },
  esl: { title: 'The Elements of Statistical Learning', url: 'https://hastie.su.domains/ElemStatLearn/', type: 'book' },
  statquest: { title: 'StatQuest', url: 'https://www.youtube.com/@statquest', type: 'video' },
  googleMl: { title: 'Google Machine Learning Crash Course', url: 'https://developers.google.com/machine-learning/crash-course', type: 'course' },
  interviews: { title: 'Machine Learning Interviews', url: 'https://github.com/alirezadir/Machine-Learning-Interviews', type: 'repo' },
  huyenchip: { title: 'Chip Huyen ML Interviews Book', url: 'https://huyenchip.com/ml-interviews-book/', type: 'book' },
}

const topics: TheoryTopic[] = [
  {
    id: 'bias-variance-generalization',
    title: 'Bias–Variance & Generalization',
    category: 'Classical ML',
    summary: 'Generalization is the gap between fitting observed data and performing well on new data. Bias–variance reasoning, cross-validation, and learning curves help diagnose whether to add data, features, regularization, or model capacity.',
    widgets: ['bias-variance'],
    notes: makeNotes({
      title: 'Bias–Variance & Generalization',
      northStar: 'Generalization is the central promise of supervised learning: a model trained on yesterday examples should make useful predictions tomorrow. Bias–variance language explains why a model can fail because it is too simple, too sensitive to noise, or evaluated with an overly optimistic validation design.',
      formulas: `A standard decomposition for squared error is:

$$
\\mathbb{E}\\left[(\\hat{f}(x)-y)^2\\right]=\\text{Bias}(\\hat{f}(x))^2+\\text{Var}(\\hat{f}(x))+\\sigma^2
$$

Cross-validation estimates risk by repeatedly training on folds and evaluating on held-out folds:

$$
\\hat{R}_{CV}=\\frac{1}{K}\\sum_{k=1}^K R_k
$$`,
      core: 'Bias is error from restrictive assumptions. A linear model has high bias when the true relationship is strongly nonlinear and no useful transformations are supplied. Variance is error from sensitivity to the particular training sample. A deep tree has high variance when small data changes produce different splits and predictions. Irreducible noise is the part no model can remove because labels are noisy, features are incomplete, or the target itself is stochastic. The decomposition is exact under squared loss and a fixed point $x$, but the intuition extends broadly: capacity reduces bias and often increases variance; regularization increases bias and often reduces variance.\n\nOverfitting happens when a model captures sample-specific noise or leakage rather than stable signal. Underfitting happens when the model class, features, or optimization are insufficient. Cross-validation estimates generalization by rotating held-out folds, but the split must match deployment. Random folds are wrong for time series forecasting if future data leaks into training. User-level splits are needed when many rows come from the same user. Group splits are needed for products, patients, merchants, or queries that reappear. Nested cross-validation avoids using the same validation signal for both hyperparameter selection and final performance reporting.\n\nLearning curves plot performance versus training size. If training and validation errors are both high and close, the model likely has high bias; add features, capacity, or reduce regularization. If training error is low but validation error is much higher, variance dominates; add data, regularization, ensembling, or simplify. If validation improves steadily with more data, data collection may be high leverage. If curves plateau with a persistent gap, model class and data quality deserve attention.',
      comparison: '| Symptom | Likely cause | What to try | Diagnostic |\n|---|---|---|---|\n| High train and validation error | Bias or weak features | More capacity, better features | Learning curves close together |\n| Low train, high validation error | Variance or leakage in tuning | Regularize, bag, collect data | Large generalization gap |\n| Great validation, poor launch | Split mismatch or shift | Time/group split, monitoring | Slice and drift analysis |\n| Unstable metric across folds | Small data or high variance | Repeated CV, simpler model | Fold-level metric spread |\n| Validation used many times | Selection overfit | Nested CV or test holdout | Performance drops on final holdout |',
      worked: 'Suppose a fraud model has training AUC 0.99 and validation AUC 0.74. A candidate should not simply say “regularize.” First inspect the split. If transactions from the same account appear in both train and validation, even 0.74 may be optimistic. Use account-level and time-based validation. Next inspect learning curves. If validation AUC rises as more accounts are added, more labeled data or weak supervision may help. If training remains near 0.99 with many features, reduce tree depth, increase minimum leaf size, add L2 penalties, or use bagging.\n\nNow suppose a linear baseline has training and validation AUC around 0.61. That is not overfitting; it is likely high bias or weak signal. Candidate actions include nonlinear features, interactions, target-aligned aggregations built only from past data, or a tree-based model. The same validation framework supports both decisions, but the remedies differ. The interview goal is to diagnose before prescribing.',
      interpretation: 'The bias–variance trade-off is like aiming at a target. High bias means shots cluster far from the bullseye; high variance means shots scatter widely; irreducible noise means even perfect aim cannot hit exactly every time. Cross-validation tries to estimate where future shots will land. Learning curves reveal whether the model benefits from more examples or a better hypothesis class. Importantly, generalization is not only mathematical variance. Real production failure often comes from nonstationary data, feedback loops, label delay, training-serving skew, or metrics that miss important slices.',
      interview: 'If asked how to improve a model, start by asking for train, validation, and test metrics, the split strategy, and the metric by slice. Then classify the error pattern as bias, variance, shift, or metric mismatch. For cross-validation, discuss K-fold for i.i.d. data, stratified folds for imbalanced classification, group folds for repeated entities, and time splits for temporal prediction. For hyperparameter tuning, mention that repeated use of validation data can overfit the validation set. If a final number matters, keep a locked test set or use nested CV.',
      pitfalls: 'Accuracy can hide generalization failures under class imbalance. Random splits can leak future information through aggregations, duplicates, or entities. Cross-validation can be expensive and misleading if preprocessing is fit before the split; scalers, encoders, feature selection, and imputation must be learned inside each training fold. Learning curves can be noisy if each point uses a different distribution rather than a nested subset. Another pitfall is treating more data as always sufficient; biased labels or missing causal features may require better measurement, not just volume.',
      practice: 'Practice drawing four learning curves: underfit, overfit, data-limited, and saturated. For each, state one likely cause and one action. Practice designing a split for churn, fraud, search ranking, medical diagnosis, and recommendation. In each case, identify the prediction time, available features, repeated entities, and label delay. Be ready to define leakage precisely: information used during training that would not be available in the same form at inference. Finally, practice explaining why cross-validation estimates performance but does not guarantee deployment success under shift.',
    }),
    flashcards: [
      { q: 'What is bias in the bias–variance trade-off?', a: 'Error from overly restrictive assumptions that make the average learned model miss the true pattern.' },
      { q: 'What is variance in the bias–variance trade-off?', a: 'Error from sensitivity to the particular training sample, causing predictions to fluctuate across samples.' },
      { q: 'What is irreducible noise?', a: 'Error that remains even for the best possible predictor because the target is inherently noisy or features are incomplete.' },
      { q: 'What learning-curve pattern suggests underfitting?', a: 'Training and validation errors are both high and close together.' },
      { q: 'What learning-curve pattern suggests overfitting?', a: 'Training error is low while validation error is substantially worse.' },
      { q: 'Why use cross-validation?', a: 'To estimate generalization by evaluating on held-out folds and reducing dependence on one split.' },
      { q: 'When should you use group cross-validation?', a: 'When multiple rows share an entity such as user, patient, merchant, product, or query.' },
      { q: 'Why are random splits risky for time-dependent data?', a: 'They can train on future patterns and validate on the past, creating temporal leakage.' },
      { q: 'What is nested cross-validation for?', a: 'Separating hyperparameter selection from final performance estimation to reduce validation overfitting.' },
      { q: 'How can regularization affect bias and variance?', a: 'It usually increases bias slightly while reducing variance by limiting model flexibility.' },
      { q: 'What is validation overfitting?', a: 'Choosing models after many validation checks until the validation set no longer gives an honest performance estimate.' },
      { q: 'Why can more data reduce variance?', a: 'Larger samples make learned parameters less sensitive to individual examples.' },
      { q: 'What is a data-limited learning curve?', a: 'A curve where validation performance keeps improving as training size increases.' },
      { q: 'What is leakage?', a: 'Use of information during training or validation that would not be available at prediction time.' },
      { q: 'What should accompany an aggregate metric?', a: 'Slice metrics by important groups, times, or traffic sources to reveal uneven generalization.' },
    ],
    quiz: [
      { q: 'Training and validation errors are both high and similar. What is the likely issue?', options: ['High bias or weak features', 'Pure variance only', 'Perfect generalization', 'Too much test data'], answer: 0, explanation: 'Close high errors usually indicate the model cannot fit the signal well.' },
      { q: 'Which split is best when rows from the same user appear many times?', options: ['Random event split', 'User-level group split', 'Alphabetical feature split', 'Split by target value after training'], answer: 1, explanation: 'A user-level split prevents the same user from leaking across train and validation.' },
      { q: 'What does nested cross-validation help prevent?', options: ['Feature scaling', 'Gradient explosion', 'Overfitting hyperparameters to validation folds', 'Label creation'], answer: 2, explanation: 'Nested CV reserves an outer evaluation loop separate from tuning.' },
      { q: 'A model has low train error and high validation error. Which action is plausible?', options: ['Increase tree depth only', 'Remove all validation data', 'Use future labels', 'Add regularization or collect more data'], answer: 3, explanation: 'The pattern suggests high variance, so regularization and more data can help.' },
      { q: 'What is validation overfitting?', options: ['Adapting choices to the validation set after repeated trials', 'Training on fewer examples', 'Using a locked test once', 'Plotting a learning curve'], answer: 0, explanation: 'Repeated selection based on validation performance can make it optimistic.' },
      { q: 'Which curve suggests more data may help?', options: ['Validation improves as training size grows', 'Training and validation are flat and perfect', 'No labels are used', 'Only test error is plotted'], answer: 0, explanation: 'A validation curve still rising with more data suggests data may improve performance.' },
      { q: 'Which preprocessing rule avoids leakage in cross-validation?', options: ['Fit scalers before creating folds', 'Fit transformations inside each training fold only', 'Use validation targets to impute train data', 'Drop all numeric features'], answer: 1, explanation: 'Preprocessing parameters must be learned only from the training fold.' },
      { q: 'What does irreducible noise represent?', options: ['Only hyperparameter search cost', 'Noise removable by deeper trees always', 'Error no model can eliminate with available information', 'AUC above 1'], answer: 2, explanation: 'Irreducible noise is uncertainty left after the optimal predictor.' },
    ],
    resources: [resources.esl, resources.cs229, resources.googleMl, resources.statquest],
  },
  {
    id: 'linear-logistic-regression',
    title: 'Linear & Logistic Regression',
    category: 'Classical ML',
    summary: 'Linear and logistic regression are foundational baselines with transparent assumptions, derivable losses, and interpretable coefficients. Interviews often ask for assumptions, gradients, regularization, and how to interpret outputs responsibly.',
    widgets: ['logistic-regression'],
    notes: makeNotes({
      title: 'Linear & Logistic Regression',
      northStar: 'Linear and logistic regression are not “too simple”; they are controlled baselines that reveal whether signal is approximately additive, whether features are well-scaled, and whether a probability model is calibrated enough for decisions.',
      formulas: `Linear regression with squared loss:

$$
\\hat{y}=x^T\\beta, \\qquad L(\\beta)=\\frac{1}{2n}\\|X\\beta-y\\|_2^2, \\qquad \\nabla L=\\frac{1}{n}X^T(X\\beta-y)
$$

Logistic regression models class probability:

$$
p(y=1\\mid x)=\\sigma(x^T\\beta)=\\frac{1}{1+e^{-x^T\\beta}}
$$

$$
L(\\beta)=-\\frac{1}{n}\\sum_i \\left[y_i\\log p_i+(1-y_i)\\log(1-p_i)\\right]
$$`,
      core: 'Linear regression assumes the conditional mean is linear in features, errors are independent enough for inference, variance is often treated as constant, and features are not perfectly collinear. For prediction, the key assumption is not that every raw variable is linear, but that the engineered representation makes the mean approximately linear. Squared loss arises naturally from Gaussian noise or from wanting the conditional mean under squared-error risk. The gradient $X^T(X\\beta-y)/n$ says coefficients move in proportion to feature-residual correlation. The normal equation is useful conceptually, but numerical solvers or gradient methods are preferred in large or ill-conditioned settings.\n\nLogistic regression models log-odds as a linear function: $\\log(p/(1-p))=x^T\\beta$. The sigmoid maps any real score to a probability. The cross-entropy loss is the negative Bernoulli log-likelihood, and its gradient is $X^T(p-y)/n$. Coefficients are additive effects on log-odds, not direct additive effects on probability. A one-unit feature increase multiplies odds by $e^{\\beta_j}$ when other features are held fixed. This interpretation depends heavily on feature scaling, collinearity, interactions, and whether the model is correctly specified.\n\nBoth models are convex in their parameters, making them reliable baselines. They support regularization, confidence intervals under assumptions, calibrated probability workflows, and fast inference. Their limitations are also clear: linear decision boundaries unless features create nonlinear structure, sensitivity to outliers for squared loss, multicollinearity, and limited interaction modeling unless interactions are explicitly added.',
      comparison: '| Model | Target | Loss | Output interpretation | Common diagnostic |\n|---|---|---|---|---|\n| Linear regression | Continuous value | Squared error | Conditional mean | Residual plot |\n| Logistic regression | Binary label | Cross-entropy | Probability and log-odds | Calibration curve |\n| Ridge regression | Continuous or logistic variant | Loss plus L2 | Shrunk coefficients | Coefficient stability |\n| Lasso regression | Continuous or logistic variant | Loss plus L1 | Sparse coefficients | Selected feature stability |\n| Robust regression | Continuous value | Less outlier-sensitive | Conditional center | Influence analysis |',
      worked: 'Suppose a house-price model uses size in square feet with coefficient 120 in a linear regression. Holding other features fixed, an additional square foot adds about 120 dollars to the predicted price. If residuals fan out for expensive houses, constant-variance assumptions are weak and a log-price target may fit better. If location is encoded poorly, a linear model may underfit even with many examples.\n\nFor logistic regression, suppose a churn model has coefficient 0.7 for a standardized “support tickets last month” feature. The odds multiplier is $e^{0.7}\\approx 2.01$, so a one-standard-deviation increase roughly doubles churn odds, holding other features fixed. The probability change is not constant: moving from 5% to about 9.6% differs from moving from 50% to about 67%. This is why log-odds interpretation is safer than saying “probability increases by 70%.” If the feature is correlated with account size, the coefficient is conditional on the included covariates, not necessarily causal.',
      interpretation: 'Linear regression projects the target onto the span of the features. Residuals are the part the feature space cannot explain. Logistic regression draws a hyperplane in feature space and converts distance along the normal direction into probability through the sigmoid. Points far from the boundary saturate near 0 or 1, so gradients become small when the model is confident and correct; large gradients occur when confident predictions are wrong. Feature scaling matters because it changes coefficient magnitudes and optimizer behavior. Interactions matter because additive linear terms cannot express “feature A matters only when feature B is high” unless that interaction is provided.',
      interview: 'For assumptions, distinguish prediction assumptions from inference assumptions. A linear model can predict well even when errors are not perfectly Gaussian, but p-values and confidence intervals require stronger conditions. For derivations, start from squared error or Bernoulli likelihood and take gradients. For interpretation, always specify units, scaling, and “holding other features constant.” For classification, discuss threshold selection separately from probability estimation. If asked about imbalanced data, note that logistic loss can learn probabilities, but the operating threshold, class weights, sampling, and calibration must align with the business metric.',
      pitfalls: 'Do not interpret coefficients causally without identification assumptions. Do not compare raw coefficient magnitudes across features with different units. Do not assume logistic regression is calibrated automatically under dataset shift or heavy regularization. Complete separation can make unregularized logistic coefficients diverge. Outliers can dominate squared loss. Multicollinearity can make coefficients unstable even when predictions remain good. Finally, adding target-derived aggregate features without time controls can make a linear baseline look unrealistically strong.',
      practice: 'Practice deriving both gradients from first principles. Given a coefficient, convert it to an odds ratio and explain why probability effects depend on the baseline. Given residual plots, identify nonlinearity, heteroscedasticity, and outliers. Given a business decision, choose a threshold based on expected cost rather than defaulting to 0.5. For features, practice saying how you would encode categoricals, standardize numeric variables, add interactions, and regularize. End by explaining why these models are often the first production baseline: fast, interpretable, debuggable, and surprisingly strong on sparse tabular data.',
    }),
    flashcards: [
      { q: 'What does linear regression model?', a: 'The conditional mean of a continuous target as a linear function of features.' },
      { q: 'What loss is standard for ordinary least squares?', a: 'Squared error, often $\\frac{1}{2n}\\|X\\beta-y\\|_2^2$.' },
      { q: 'What is the gradient of squared-error linear regression?', a: '$\\frac{1}{n}X^T(X\\beta-y)$.' },
      { q: 'What does logistic regression model linearly?', a: 'The log-odds: $\\log(p/(1-p))=x^T\\beta$.' },
      { q: 'What is the sigmoid function?', a: '$\\sigma(z)=1/(1+e^{-z})$, mapping real scores to probabilities.' },
      { q: 'What loss does logistic regression usually minimize?', a: 'Binary cross-entropy, the negative Bernoulli log-likelihood.' },
      { q: 'What is the logistic regression gradient form?', a: '$\\frac{1}{n}X^T(p-y)$, where $p$ is the vector of predicted probabilities.' },
      { q: 'How do you interpret a logistic coefficient?', a: 'A one-unit feature increase changes log-odds by $\\beta_j$ and multiplies odds by $e^{\\beta_j}$, holding other features fixed.' },
      { q: 'Why should coefficients be compared after scaling?', a: 'Raw magnitudes depend on feature units, so unscaled coefficients are not directly comparable.' },
      { q: 'What is multicollinearity?', a: 'Strong linear dependence among features, causing unstable coefficient estimates.' },
      { q: 'Why can squared loss be sensitive to outliers?', a: 'Errors are squared, so large residuals receive disproportionately high weight.' },
      { q: 'What is complete separation?', a: 'A logistic-regression situation where classes are perfectly separable, causing unregularized coefficients to diverge.' },
      { q: 'Why is threshold selection separate from training logistic regression?', a: 'Training estimates probabilities; a threshold converts probabilities to decisions based on costs and metrics.' },
      { q: 'When is a linear model a strong baseline?', a: 'When data are sparse, high-dimensional, tabular, or require fast interpretable inference.' },
      { q: 'Why avoid causal interpretation of coefficients by default?', a: 'Associations can reflect confounding, selection, or measurement, not causal effects.' },
    ],
    quiz: [
      { q: 'In logistic regression, coefficients are additive on which scale?', options: ['Log-odds', 'Raw probability', 'Squared error only', 'Feature count'], answer: 0, explanation: 'Logistic regression is linear in log-odds.' },
      { q: 'Which gradient matches squared-error linear regression?', options: ['$X^T(p-y)$', '$X^T(X\\beta-y)/n$', '$\\beta^T X$', '$y-X$ only'], answer: 1, explanation: 'Residuals from linear predictions are pushed back through $X^T$.' },
      { q: 'A logistic coefficient of 0.7 implies what odds multiplier?', options: ['0.7', '1.7 exactly', '$e^{0.7}$', '$\\log(0.7)$'], answer: 2, explanation: 'Exponentiating a log-odds coefficient gives the multiplicative odds change.' },
      { q: 'Which issue can make unregularized logistic coefficients diverge?', options: ['Standardization', 'Mini-batching', 'AUC evaluation', 'Complete separation'], answer: 3, explanation: 'If classes are perfectly separable, larger coefficients can keep improving likelihood.' },
      { q: 'Why is 0.5 not always the best classification threshold?', options: ['Business costs and class imbalance may make another threshold optimal', 'Logistic regression cannot output probabilities', 'Thresholds only apply to regression', 'AUC requires threshold 0.5'], answer: 0, explanation: 'Decision thresholds should reflect costs, prevalence, and desired trade-offs.' },
      { q: 'What diagnostic is especially useful for linear regression?', options: ['Residual plots', 'Only top-1 accuracy', 'BLEU score', 'K-means inertia'], answer: 0, explanation: 'Residual plots reveal nonlinearity, outliers, and heteroscedasticity.' },
      { q: 'Why can multicollinearity be a problem?', options: ['It makes every target binary', 'It always improves causal identification', 'It destabilizes coefficient estimates', 'It removes the need for validation'], answer: 2, explanation: 'Correlated features make it hard to assign effect to one coefficient.' },
      { q: 'Which statement is safest about regression coefficients?', options: ['They are causal by default', 'They are unaffected by feature units', 'They never change under regularization', 'They are conditional associations unless causal assumptions hold'], answer: 3, explanation: 'Regression coefficients require additional assumptions for causal interpretation.' },
    ],
    resources: [resources.cs229, resources.esl, resources.googleMl, resources.statquest],
  },
  {
    id: 'regularization',
    title: 'Regularization',
    category: 'Classical ML',
    summary: 'Regularization intentionally constrains models to improve generalization, stability, and interpretability. L1, L2, elastic net, early stopping, and dropout use different mechanisms but share the same goal: reduce harmful flexibility.',
    widgets: ['regularization'],
    notes: makeNotes({
      title: 'Regularization',
      northStar: 'Regularization is disciplined preference. It says that among many models fitting the data, choose one that is simpler, smoother, smaller, sparser, more stable, or less dependent on fragile co-adaptations.',
      formulas: `Penalized empirical risk often has the form:

$$
\\min_{\\theta}\\; \\frac{1}{n}\\sum_{i=1}^n \\ell(f_{\\theta}(x_i),y_i)+\\lambda \\Omega(\\theta)
$$

Common penalties:

$$
\\Omega_{L2}(w)=\\|w\\|_2^2, \\qquad \\Omega_{L1}(w)=\\|w\\|_1, \\qquad
\\Omega_{EN}(w)=\\alpha\\|w\\|_1+(1-\\alpha)\\|w\\|_2^2
$$`,
      core: 'L2 regularization penalizes squared weight magnitude. Geometrically, it constrains solutions to a round ball, shrinking correlated coefficients smoothly toward zero but rarely making them exactly zero. It improves conditioning and reduces variance, which is why ridge regression is stable under multicollinearity. L1 regularization penalizes absolute magnitude. Its diamond-shaped constraint has corners on coordinate axes, so optima often land with some coefficients exactly zero. This produces sparse models and implicit feature selection, but selected features can be unstable when predictors are highly correlated. Elastic net combines L1 and L2, often keeping groups of correlated features more gracefully than pure lasso.\n\nRegularization is not only explicit penalties. Early stopping regularizes iterative training because stopping before full convergence prevents the model from fitting later-stage noise. Data augmentation regularizes by enforcing invariances. Dropout randomly masks hidden units during neural training, discouraging brittle co-adaptation and approximating an ensemble-like effect. In tree models, max depth, minimum leaf size, subsampling, learning rate, and number of trees all regulate capacity. In nearest-neighbor methods, larger $k$ smooths predictions. The general pattern is the same: restrict the function class or training trajectory so performance improves on future data.\n\nThe regularization parameter $\\lambda$ is a hyperparameter chosen by validation. Larger $\\lambda$ means stronger preference for simplicity and usually higher bias with lower variance. The best value depends on sample size, feature scaling, noise, collinearity, and metric. Feature standardization is essential for L1 and L2 penalties because penalties operate on coefficient magnitudes; without scaling, units decide which features are cheap to use.',
      comparison: '| Method | Mechanism | Best when | Trade-off |\n|---|---|---|---|\n| L2 ridge | Smoothly shrinks weights | Many correlated small effects | Less sparse |\n| L1 lasso | Creates exact zeros | Sparse true signal | Unstable with correlated features |\n| Elastic net | Mixes L1 and L2 | Correlated sparse groups | Two hyperparameters |\n| Early stopping | Limits training time | Iterative overfit risk | May stop before full optimization |\n| Dropout | Randomly masks units | Neural co-adaptation risk | Can slow training |',
      worked: 'Imagine two nearly duplicate features: “total spend last 30 days” and “total spend last 31 days.” An unregularized linear model may assign a large positive coefficient to one and a large negative coefficient to the other while predictions remain stable. Ridge discourages this by penalizing large squared coefficients, spreading weight across both. Lasso may select one feature and zero the other, which is interpretable but can change across folds. Elastic net can keep both with reduced magnitude, balancing sparsity and grouped stability.\n\nFor neural training, suppose validation loss improves for ten epochs and then worsens while training loss keeps decreasing. Early stopping chooses the checkpoint near best validation loss, acting like a regularizer on the training path. Dropout could also help if hidden units memorize idiosyncratic patterns, but it is not a substitute for correct validation splits or leakage prevention. Regularization reduces overfitting; it does not fix corrupted labels or features unavailable at inference.',
      interpretation: 'Regularization changes the shape of the search space. With L2, round contours meet round constraints, so weights shrink continuously. With L1, contours often touch a corner, producing zeros. From a Bayesian view, L2 resembles a Gaussian prior and L1 resembles a Laplace prior. From an optimization view, regularization can improve conditioning and make solutions less sensitive to sample noise. From a product view, regularization buys stability: fewer wild coefficients, less threshold churn, smoother predictions across retrains, and more reliable behavior on rare slices.',
      interview: 'If asked L1 versus L2, describe both geometry and practical use. Mention that L1 does feature selection, L2 handles correlated features smoothly, and elastic net is a compromise. If asked how to choose strength, say cross-validation or a validation set, with scaling performed inside folds. If asked about deep learning, connect weight decay, dropout, data augmentation, label smoothing, and early stopping as regularizers with different mechanisms. If asked why validation improves while training loss worsens under stronger regularization, explain bias–variance trade-off rather than calling it a bug.',
      pitfalls: 'Do not apply coefficient penalties without scaling features. Do not assume lasso-selected features are causal or stable. Do not tune regularization on the test set. Do not assume more regularization is always safer; too much creates underfitting and poor minority-slice performance. Dropout at inference must be handled correctly, typically by using deterministic scaled activations or framework conventions. Weight decay in adaptive optimizers should often be decoupled. Finally, regularization cannot repair data leakage; it may only make leaked signals look smoother.',
      practice: 'Practice drawing L1 and L2 constraint regions against elliptical loss contours. Explain ridge, lasso, and elastic net in one sentence each, then give a use case. For a validation curve over $\\lambda$, identify under-regularized, optimal, and over-regularized regions. For deep learning, compare early stopping, dropout, weight decay, and data augmentation. In a production story, mention stability across retrains as a reason to regularize even when aggregate validation performance changes only slightly.',
    }),
    flashcards: [
      { q: 'What is the main purpose of regularization?', a: 'To improve generalization by constraining model flexibility or preferring simpler solutions.' },
      { q: 'What does L2 regularization penalize?', a: 'The squared magnitude of weights, typically $\\|w\\|_2^2$.' },
      { q: 'What does L1 regularization encourage?', a: 'Sparse solutions with some coefficients exactly zero.' },
      { q: 'Why does L1 encourage sparsity geometrically?', a: 'Its diamond-shaped constraint has corners on coordinate axes where optima often occur.' },
      { q: 'What is elastic net?', a: 'A combination of L1 and L2 penalties, useful when features are correlated but sparsity is desired.' },
      { q: 'Why scale features before L1 or L2 penalties?', a: 'Penalty strength depends on coefficient magnitude, which depends on feature units.' },
      { q: 'How does early stopping regularize?', a: 'It limits training before the model fits later-stage noise.' },
      { q: 'What does dropout do?', a: 'It randomly masks units during training to reduce co-adaptation and improve robustness.' },
      { q: 'How is L2 related to a Gaussian prior?', a: 'The negative log of a zero-mean Gaussian prior is proportional to squared weight magnitude.' },
      { q: 'How is L1 related to a Laplace prior?', a: 'The negative log of a Laplace prior is proportional to absolute weight magnitude.' },
      { q: 'What happens when regularization is too strong?', a: 'The model underfits, increasing bias and hurting both train and validation performance.' },
      { q: 'Why can lasso feature selection be unstable?', a: 'With correlated predictors, small data changes can swap which feature is selected.' },
      { q: 'Name tree-model regularizers.', a: 'Max depth, minimum samples per leaf, subsampling, learning rate, and number of boosting rounds.' },
      { q: 'What is decoupled weight decay?', a: 'Applying weight decay separately from adaptive gradient scaling, as in AdamW.' },
      { q: 'Can regularization fix leakage?', a: 'No. Leakage corrupts validation; regularization may reduce variance but cannot make leaked features legitimate.' },
    ],
    quiz: [
      { q: 'Which penalty is most associated with exact zero coefficients?', options: ['L1', 'L2', 'No penalty', 'Batch size'], answer: 0, explanation: 'L1 geometry produces sparse optima.' },
      { q: 'Why should features be standardized before penalized linear models?', options: ['To make class labels binary', 'So penalties treat coefficient magnitudes fairly across units', 'To remove the validation set', 'To guarantee causality'], answer: 1, explanation: 'Different feature scales make the same real effect require different coefficient sizes.' },
      { q: 'Elastic net combines which penalties?', options: ['Dropout and early stopping', 'Tree depth and Gini', 'L1 and L2', 'AUC and log loss'], answer: 2, explanation: 'Elastic net mixes absolute and squared coefficient penalties.' },
      { q: 'Early stopping regularizes by doing what?', options: ['Adding future labels', 'Changing the target distribution', 'Removing all bias', 'Stopping training before later overfit'], answer: 3, explanation: 'It selects a checkpoint before the model memorizes noise.' },
      { q: 'Which regularizer is commonly used in neural networks by masking units during training?', options: ['Dropout', 'Chi-square', 'PCA centering', 'Hard voting'], answer: 0, explanation: 'Dropout randomly disables units during training.' },
      { q: 'What is a risk of too much regularization?', options: ['Underfitting', 'Infinite data', 'Guaranteed perfect calibration', 'No validation needed'], answer: 0, explanation: 'Too much regularization makes the model too simple, causing underfit.' },
      { q: 'L2 regularization is especially helpful for which issue?', options: ['Text tokenization only', 'Correlated features and unstable coefficients', 'Removing all outliers automatically', 'Creating labels'], answer: 1, explanation: 'Ridge shrinks correlated coefficients smoothly and improves stability.' },
      { q: 'What should be used to choose regularization strength?', options: ['The test set repeatedly', 'A validation scheme or cross-validation', 'Alphabetical feature order', 'The highest training accuracy only'], answer: 1, explanation: 'Regularization strength is a hyperparameter selected with held-out validation.' },
    ],
    resources: [resources.esl, resources.cs229, resources.googleMl, resources.statquest],
  },
  {
    id: 'tree-based-models',
    title: 'Tree-Based Models',
    category: 'Classical ML',
    summary: 'Tree models partition feature space into simple regions, making them strong for tabular nonlinear interactions. Interviews focus on split criteria, overfitting controls, random forests, gradient boosting, and practical XGBoost/LightGBM details.',
    widgets: ['decision-tree'],
    notes: makeNotes({
      title: 'Tree-Based Models',
      northStar: 'Tree-based models are the workhorses of tabular ML because they capture nonlinear thresholds, feature interactions, missingness patterns, and heterogeneous segments with little preprocessing compared with linear models.',
      formulas: `Common classification impurity criteria:

$$
Gini(S)=1-\\sum_{k=1}^K p_k^2
$$

$$
Entropy(S)=-\\sum_{k=1}^K p_k\\log p_k
$$

Gradient boosting builds an additive model:

$$
F_m(x)=F_{m-1}(x)+\\eta h_m(x)
$$`,
      core: 'A decision tree recursively partitions feature space. At each node, it evaluates candidate splits and chooses the one that most improves purity or reduces loss. For classification, Gini impurity and entropy are common. Both favor child nodes with class distributions more concentrated than the parent. For regression, splits often minimize squared error within leaves. A leaf prediction is usually the class probability, majority class, or average target among training examples in that leaf. Trees naturally handle monotonic thresholds and interactions: a split on age followed by a split on income represents an interaction without explicitly creating an age-income feature.\n\nSingle trees are interpretable but high variance. They can fit jagged boundaries and memorize noise unless constrained by max depth, minimum samples per leaf, pruning, or minimum impurity decrease. Random forests reduce variance by averaging many decorrelated trees trained on bootstrap samples and random feature subsets. Bagging helps because averaging unstable learners cancels sample-specific noise. Feature importance can be computed by impurity decrease or permutation, but impurity importance is biased toward high-cardinality or frequently split features.\n\nGradient boosting builds trees sequentially, each new tree fitting residuals or negative gradients of the loss. Small trees act as weak learners; the ensemble becomes powerful through additive refinement. XGBoost adds regularized objectives, second-order gradient information, shrinkage, column subsampling, row subsampling, missing-value default directions, and efficient sparsity-aware split finding. LightGBM uses histogram-based splits, leaf-wise growth with depth controls, and gradient-based one-side sampling in some configurations, making it fast on large tabular data. Key hyperparameters include number of trees, learning rate, max depth or number of leaves, minimum child weight or leaf data, subsampling, column sampling, and regularization terms.',
      comparison: '| Model | Main idea | Strength | Weakness |\n|---|---|---|---|\n| Single tree | Recursive splits | Interpretable interactions | High variance |\n| Random forest | Average decorrelated trees | Robust low-tuning baseline | Less compact and less extrapolation |\n| Gradient boosting | Sequentially fit residuals | High tabular accuracy | Sensitive to tuning and leakage |\n| XGBoost | Regularized boosted trees | Strong defaults and missing handling | Many hyperparameters |\n| LightGBM | Histogram and leaf-wise growth | Fast on large data | Can overfit without leaf controls |',
      worked: 'Suppose a credit-risk dataset has nonlinear behavior: recent delinquencies matter much more for newer accounts than older accounts. A linear model needs explicit interaction terms; a tree can split first on account age and then on delinquency count within each branch. A single deep tree may memorize rare account patterns, so validation performance can be unstable. A random forest averages many such trees and reduces variance. A boosted tree can start with broad risk rules and then add trees that correct residual patterns in specific segments.\n\nIf training AUC is 0.99 and validation AUC is 0.82 for a boosted model, reduce capacity: lower max depth or number of leaves, increase minimum leaf data, add subsampling, increase regularization, reduce boosting rounds with early stopping, or lower learning rate while tuning rounds. If both train and validation are poor, inspect features, target leakage assumptions, class imbalance, and whether the metric reflects the objective. For tree models, leakage through target-encoded categories or future aggregates is especially dangerous because trees exploit sharp thresholds aggressively.',
      interpretation: 'A tree partitions space into axis-aligned rectangles and assigns simple predictions inside each region. Ensembles combine many partitions, creating flexible piecewise-constant functions. Random forests fight variance by averaging independent-ish views of the data. Boosting fights bias by adding functions that correct current mistakes, but as rounds accumulate it can overfit noise. Learning rate in boosting is shrinkage: smaller steps usually need more trees but can generalize better. Missing-value handling in XGBoost and LightGBM is not magic; it learns default directions from training data, so missingness must be stable and meaningful at inference.',
      interview: 'If asked Gini versus entropy, say both measure node impurity and usually produce similar splits; entropy has information-theoretic roots, while Gini is slightly simpler computationally. If asked random forest versus boosting, say forests train trees independently and average to reduce variance, while boosting trains sequentially to reduce bias and optimize a loss. If asked why boosted trees win tabular competitions, mention nonlinear interactions, mixed feature types, minimal scaling needs, strong regularization controls, and efficient handling of missing values. If asked about interpretability, discuss tree plots for shallow trees, permutation importance, partial dependence, SHAP with caveats, and monotonic constraints.',
      pitfalls: 'Trees do not extrapolate linearly beyond observed feature ranges; predictions are leaf averages. High-cardinality categorical variables can create misleading splits unless encoded carefully. Impurity-based importance can exaggerate continuous or high-cardinality features. Time leakage in rolling aggregates can make boosted trees look excellent offline and fail online. LightGBM leaf-wise growth can overfit small leaves if num leaves and minimum data constraints are loose. Random forests are not always calibrated; probability calibration may be needed. Finally, tree ensembles can be large, so latency and memory must be considered for production scoring.',
      practice: 'Practice computing Gini for a small node and comparing two candidate splits. Explain bootstrap sampling and feature subsampling in random forests. Explain boosting as fitting negative gradients, not merely “many trees.” Memorize the high-leverage hyperparameters for XGBoost and LightGBM. In case studies, start with a regularized linear baseline and a tree ensemble, compare slice metrics, inspect leakage-prone features, calibrate probabilities if decisions need risk estimates, and set early stopping on a validation split that mirrors deployment time.',
    }),
    flashcards: [
      { q: 'What does a decision tree do?', a: 'It recursively partitions feature space and assigns predictions in leaves.' },
      { q: 'What is Gini impurity?', a: '$1-\\sum_k p_k^2$, a measure of class mixing in a node.' },
      { q: 'What is entropy in tree splitting?', a: '$-\\sum_k p_k\\log p_k$, another impurity measure based on information content.' },
      { q: 'How do regression trees usually choose splits?', a: 'By reducing within-leaf squared error or variance.' },
      { q: 'Why do single trees overfit easily?', a: 'They can create many specific partitions that capture noise in the training sample.' },
      { q: 'How does a random forest reduce variance?', a: 'By averaging many decorrelated trees trained with bootstrap samples and feature subsampling.' },
      { q: 'How does gradient boosting train trees?', a: 'Sequentially, with each tree fitting residuals or negative gradients of the current loss.' },
      { q: 'What is shrinkage in boosting?', a: 'Multiplying each new tree contribution by a learning rate.' },
      { q: 'Name XGBoost regularization controls.', a: 'Learning rate, max depth, min child weight, subsampling, column sampling, L1/L2 terms, and early stopping.' },
      { q: 'What is LightGBM known for?', a: 'Histogram-based training and efficient leaf-wise tree growth with controls.' },
      { q: 'Why can impurity importance be biased?', a: 'It can favor high-cardinality or continuous features with more split opportunities.' },
      { q: 'Do tree models need feature scaling?', a: 'Usually no for split-based trees, because thresholds depend on order rather than distance.' },
      { q: 'Why can trees handle interactions naturally?', a: 'Sequential splits condition later rules on earlier branches.' },
      { q: 'What is early stopping in boosting?', a: 'Stopping new trees when validation performance stops improving.' },
      { q: 'Why might tree probabilities need calibration?', a: 'Leaf frequencies or boosted scores can be poorly calibrated even when ranking is strong.' },
    ],
    quiz: [
      { q: 'Which formula is Gini impurity?', options: ['$1-\\sum_k p_k^2$', '$\\sum_i y_i$', '$\\|w\\|_1$', '$e^{-x}$'], answer: 0, explanation: 'Gini impurity is one minus the sum of squared class probabilities.' },
      { q: 'Random forests mainly reduce what?', options: ['Bias by sequential residual fitting', 'Variance by averaging decorrelated trees', 'The need for labels', 'All latency costs'], answer: 1, explanation: 'Bagging and feature randomness decorrelate trees so averaging reduces variance.' },
      { q: 'Gradient boosting trains trees in what manner?', options: ['Independently and in parallel only', 'Without a loss function', 'Sequentially to correct current errors', 'Only with random labels'], answer: 2, explanation: 'Each new learner fits residual or gradient information from the current ensemble.' },
      { q: 'Which is a common LightGBM risk?', options: ['It cannot handle numeric features', 'It only trains linear models', 'It requires feature scaling for every split', 'Leaf-wise growth can overfit without constraints'], answer: 3, explanation: 'Leaf-wise expansion is powerful but needs leaf and depth controls.' },
      { q: 'Which hyperparameter directly limits individual tree complexity?', options: ['Max depth or number of leaves', 'AUC threshold', 'Batch normalization momentum only', 'ROC curve color'], answer: 0, explanation: 'Depth and leaf count control how many partitions a tree can create.' },
      { q: 'Why can target encoding leak?', options: ['It is always unsupervised', 'It may use label information from validation or future rows', 'It reduces feature cardinality', 'It changes strings to numbers'], answer: 1, explanation: 'Encoding categories with target statistics must be done inside training folds and time windows.' },
      { q: 'Which statement about tree extrapolation is true?', options: ['Trees extrapolate linearly beyond training ranges', 'Trees cannot use thresholds', 'Trees usually predict leaf values and extrapolate poorly', 'Trees require Euclidean distance'], answer: 2, explanation: 'Tree predictions are based on learned leaves, not linear trends outside observed ranges.' },
      { q: 'What does learning rate do in boosting?', options: ['Scales each new tree contribution', 'Chooses the target variable', 'Forces all leaves to zero', 'Deletes validation data'], answer: 0, explanation: 'Shrinkage controls how much each tree changes the ensemble.' },
    ],
    resources: [resources.esl, resources.googleMl, resources.statquest, resources.interviews],
  },
  {
    id: 'svms-kernels',
    title: 'SVMs & Kernels',
    category: 'Classical ML',
    summary: 'Support vector machines find large-margin decision boundaries, while kernels allow linear algorithms to act in implicit feature spaces. Interview answers should emphasize margin, hinge loss, support vectors, kernel choice, and scaling limits.',
    notes: makeNotes({
      title: 'SVMs & Kernels',
      northStar: 'SVMs are a clean example of geometric inductive bias: among separating hyperplanes, prefer the one with the largest margin because it is less sensitive to small perturbations in the training data.',
      formulas: `A soft-margin linear SVM can be written as:

$$
\\min_{w,b,\\xi}\\; \\frac{1}{2}\\|w\\|_2^2 + C\\sum_i \\xi_i
$$

subject to:

$$
y_i(w^Tx_i+b)\\ge 1-\\xi_i, \\qquad \\xi_i\\ge 0
$$

Hinge loss form:

$$
\\ell(y,f(x))=\\max(0,1-yf(x))
$$`,
      core: 'A hard-margin SVM assumes data are linearly separable and chooses the hyperplane with maximum margin, where margin is the distance from the boundary to the closest training points. The closest points are support vectors; they define the boundary. The soft-margin SVM allows violations through slack variables and trades margin size against classification errors using parameter $C$. A large $C$ penalizes violations heavily, producing a narrower margin and lower training error risk; a small $C$ allows more violations and wider margin, often improving robustness.\n\nThe hinge loss is zero when a point is correctly classified with margin at least one, and linear when the point is inside the margin or misclassified. Unlike logistic loss, hinge loss does not directly produce calibrated probabilities. SVMs can be strong when feature dimension is high, classes are reasonably separable, and the number of examples is moderate. Linear SVMs are common for sparse text features because the boundary is efficient and scaling can be handled well.\n\nKernels use inner products in an implicit feature space: $K(x,z)=\\phi(x)^T\\phi(z)$. The kernel trick lets algorithms depend on pairwise similarities without explicitly constructing $\\phi(x)$. Common kernels include linear, polynomial, and radial basis function. The RBF kernel creates localized similarity controlled by $\\gamma$; high $\\gamma$ makes influence very local and can overfit, while low $\\gamma$ makes the boundary smoother. Kernel methods scale poorly with very large datasets because they often require storing or operating on the kernel matrix, so approximate kernels or linear models may be preferred in production.',
      comparison: '| Concept | Meaning | Tuning knob | Practical note |\n|---|---|---|---|\n| Margin | Distance to boundary | C controls violations | Larger margin often generalizes better |\n| Support vectors | Points defining boundary | Determined by training | Inference depends on them |\n| Linear kernel | Original feature dot product | C | Good for sparse high-dimensional data |\n| RBF kernel | Local similarity | C and gamma | Powerful but can overfit and scale poorly |\n| Hinge loss | Margin-based loss | C | Not calibrated probability |',
      worked: 'Suppose you classify support tickets using TF-IDF features with 100,000 dimensions and 20,000 labeled examples. A linear SVM is a strong baseline because text is sparse and often nearly linearly separable in high-dimensional space. You would tune $C$, use stratified validation, and evaluate precision-recall because classes may be imbalanced. An RBF kernel would require many pairwise similarities and may be too slow without approximation.\n\nFor a two-dimensional toy problem with concentric circles, a linear SVM underfits because no line separates the classes. An RBF kernel can create a nonlinear boundary by treating nearby points as similar in an implicit high-dimensional space. However, if $\\gamma$ is too high, the boundary wraps around individual points and memorizes noise. If $\\gamma$ is too low, the boundary becomes too smooth. The interview lesson is to connect kernel flexibility to validation behavior, not just name the kernel.',
      interpretation: 'The margin view says confidence is not only correct side of the boundary but distance from it. Points far outside the margin do not affect hinge loss; support vectors near or inside the margin matter most. This makes SVMs robust to many non-boundary points but sensitive to influential support vectors and scaling. Kernels replace explicit coordinates with similarity functions. A valid kernel must correspond to an inner product in some feature space, which is why arbitrary similarity functions are not automatically legal kernels. Feature scaling is crucial for RBF kernels because distance determines similarity.',
      interview: 'If asked SVM versus logistic regression, compare margin classification to probabilistic modeling. Logistic regression optimizes log loss and naturally outputs probabilities; SVM optimizes margin through hinge loss and often needs calibration for probabilities. If asked about $C$, explain the bias–variance trade-off through margin violations. If asked about kernels, define the kernel trick and give one example where nonlinear kernels help and one where scaling makes them impractical. If asked production concerns, mention inference cost with many support vectors, probability calibration, and feature scaling.',
      pitfalls: 'Do not say kernels “avoid all high-dimensional cost.” They avoid explicit features but still require kernel computations. Do not use RBF kernels without scaling features. Do not interpret SVM scores as calibrated probabilities unless calibrated with methods such as Platt scaling or isotonic regression. Do not assume larger $C$ is always better; it can shrink the margin and overfit. For imbalanced classes, class weights or thresholding may be needed. Kernel matrix memory can become the bottleneck long before accuracy is the issue.',
      practice: 'Practice drawing maximum-margin separators and identifying support vectors. Explain hard margin, soft margin, hinge loss, and $C$ in one connected story. Compare linear, polynomial, and RBF kernels. For a text-classification case, argue for a linear SVM; for a small nonlinear toy dataset, argue for RBF. Then state what you would tune, how you would scale features, and how you would calibrate probabilities if decisions require risk estimates.',
    }),
    flashcards: [
      { q: 'What is the SVM margin?', a: 'The distance between the decision boundary and the closest training points.' },
      { q: 'What are support vectors?', a: 'Training points on or inside the margin that determine the SVM boundary.' },
      { q: 'What does the soft-margin parameter C control?', a: 'The trade-off between margin width and penalty for violations or misclassifications.' },
      { q: 'What happens when C is very large?', a: 'Violations are penalized heavily, often reducing training error but increasing overfit risk.' },
      { q: 'What is hinge loss?', a: '$\\max(0,1-yf(x))$, a loss that penalizes points not correctly classified with sufficient margin.' },
      { q: 'Do SVMs output calibrated probabilities by default?', a: 'No. Scores need calibration if probabilities are required.' },
      { q: 'What is the kernel trick?', a: 'Using a kernel function as an implicit inner product in a transformed feature space.' },
      { q: 'Name three common kernels.', a: 'Linear, polynomial, and radial basis function kernels.' },
      { q: 'What does gamma control in an RBF kernel?', a: 'How local each point influence is; higher gamma means narrower local influence.' },
      { q: 'Why scale features before an RBF SVM?', a: 'RBF similarity depends on distances, and unscaled features can dominate distance.' },
      { q: 'When is a linear SVM strong?', a: 'High-dimensional sparse settings such as text classification.' },
      { q: 'Why can kernel SVMs scale poorly?', a: 'They often require storing or computing many pairwise kernel values.' },
      { q: 'How does SVM differ from logistic regression?', a: 'SVM optimizes margin via hinge loss; logistic regression optimizes log likelihood and models probabilities.' },
      { q: 'What is a hard-margin SVM?', a: 'An SVM requiring perfect linear separability with no margin violations.' },
      { q: 'How can SVM handle class imbalance?', a: 'Use class-weighted penalties, threshold adjustment, or resampling with proper validation.' },
    ],
    quiz: [
      { q: 'Which loss is most associated with SVMs?', options: ['Hinge loss', 'Squared reconstruction loss', 'Poisson deviance only', 'Entropy of features'], answer: 0, explanation: 'SVMs use margin-based hinge loss.' },
      { q: 'What does a small C generally allow?', options: ['No margin at all', 'More violations and a wider margin', 'Infinite gamma', 'Automatic calibration'], answer: 1, explanation: 'Smaller C penalizes violations less, usually increasing regularization.' },
      { q: 'The kernel trick relies on kernels acting like what?', options: ['A label encoder', 'A test split', 'Inner products in an implicit feature space', 'A confusion matrix'], answer: 2, explanation: 'A valid kernel corresponds to an inner product after some feature mapping.' },
      { q: 'What is a practical issue for kernel SVMs on huge datasets?', options: ['They cannot classify nonlinear data', 'They require no memory', 'They never need tuning', 'Kernel matrix computation and storage'], answer: 3, explanation: 'Pairwise kernel operations can be expensive at large n.' },
      { q: 'Which model naturally outputs probabilities without extra calibration?', options: ['Logistic regression', 'Hard-margin SVM', 'Nearest centroid only', 'K-means'], answer: 0, explanation: 'Logistic regression directly models probabilities through the sigmoid link.' },
      { q: 'For sparse text classification, which SVM is usually a strong baseline?', options: ['RBF SVM on unscaled dense features', 'Linear SVM', 'Polynomial SVM with huge degree', 'No-margin SVM'], answer: 1, explanation: 'High-dimensional sparse text is often well handled by linear SVMs.' },
      { q: 'What does high RBF gamma tend to do?', options: ['Create very local influence and overfit risk', 'Remove all support vectors', 'Guarantee calibration', 'Make every boundary linear'], answer: 0, explanation: 'High gamma creates a wiggly, localized boundary.' },
      { q: 'Which points define the SVM decision boundary?', options: ['All correctly classified far-away points only', 'Random validation points', 'Support vectors near the margin', 'Only the feature means'], answer: 2, explanation: 'Support vectors are the influential points for the SVM solution.' },
    ],
    resources: [resources.cs229, resources.esl, resources.statquest, resources.interviews],
  },
  {
    id: 'clustering-dimensionality-reduction',
    title: 'Clustering & Dimensionality Reduction',
    category: 'Classical ML',
    summary: 'Unsupervised learning methods discover structure, compress representations, and support exploration. Interviews expect clear distinctions among k-means, GMM/EM, DBSCAN, hierarchical clustering, PCA, t-SNE, UMAP, and nearest-neighbor geometry.',
    widgets: ['kmeans', 'knn'],
    notes: makeNotes({
      title: 'Clustering & Dimensionality Reduction',
      northStar: 'Clustering and dimensionality reduction are exploratory tools, compression tools, and sometimes feature generators. Their outputs are useful only when the distance, density, or variance notion they optimize matches the question being asked.',
      formulas: `K-means minimizes within-cluster squared distance:

$$
\\min_{\\{c_i\\},\\{\\mu_k\\}} \\sum_{i=1}^n \\|x_i-\\mu_{c_i}\\|_2^2
$$

A Gaussian mixture model uses soft assignments:

$$
p(x)=\\sum_{k=1}^K \\pi_k \\mathcal{N}(x\\mid \\mu_k,\\Sigma_k)
$$

PCA projection solves:

$$
\\max_{\\|v\\|_2=1} \\mathrm{Var}(Xv)
$$`,
      core: 'K-means alternates between assigning points to nearest centroids and recomputing centroids. It assumes roughly spherical, similarly sized clusters under Euclidean distance. It is fast and useful for vector quantization, segmentation baselines, and initialization, but sensitive to scaling, outliers, initialization, and the chosen $K$. K-means++ improves initialization by spreading initial centers. Gaussian mixture models soften cluster membership with probabilities and allow elliptical clusters through covariance matrices. EM alternates an expectation step computing responsibilities and a maximization step updating parameters. GMMs can express uncertainty, but they still require choosing $K$ and can be sensitive to local optima.\n\nDBSCAN groups points by density using radius $\\epsilon$ and minimum points. It can find irregularly shaped clusters and mark noise, but struggles when clusters have varying density or high-dimensional distances become less meaningful. Hierarchical clustering builds a tree of merges or splits. Linkage choices matter: single linkage can chain through bridges; complete linkage favors compact clusters; average linkage is a compromise; Ward linkage minimizes variance increases.\n\nDimensionality reduction has different goals. PCA finds orthogonal directions preserving maximum variance and is linear, global, and useful for denoising or compression. t-SNE preserves local neighborhoods for visualization by matching probability distributions over neighbors; it is excellent for 2D plots but distances between far clusters and cluster sizes are not reliably meaningful. UMAP also emphasizes neighbor graphs and often preserves more global structure than t-SNE, but it has hyperparameters and stochasticity. Nearest-neighbor methods depend on distance choice and scaling; the curse of dimensionality can make all points look similarly far, motivating metric learning, normalization, or dimensionality reduction.',
      comparison: '| Method | Optimizes or uses | Strength | Caution |\n|---|---|---|---|\n| K-means | Squared distance to centroids | Fast simple segmentation | Assumes spherical scaled clusters |\n| GMM with EM | Mixture likelihood | Soft assignments and ellipses | Local optima and covariance issues |\n| DBSCAN | Density reachability | Noise detection and arbitrary shapes | Hard in varying density |\n| Hierarchical | Linkage between clusters | Dendrogram exploration | Linkage choice changes result |\n| PCA | Variance preservation | Linear compression | Not label-aware |\n| t-SNE/UMAP | Neighbor preservation | Visualization | Do not overread global distances |',
      worked: 'Suppose you have customer behavior vectors with spend, visits, tenure, and product counts. If spend is measured in dollars and visits in counts, k-means without scaling may cluster mostly by spend. Standardize or choose a distance aligned with business meaning. Try several $K$ values, inspect inertia and silhouette, but also examine cluster profiles for actionability. A cluster is useful only if it supports a decision such as retention messaging, capacity planning, or risk review.\n\nFor high-dimensional embeddings, you might use PCA to reduce noise to 50 dimensions, then UMAP or t-SNE to visualize neighborhoods. If a 2D plot shows separated islands, avoid claiming proof of true classes. Validate with labels if available, nearest-neighbor examples, stability across seeds, and downstream performance. For anomaly exploration, DBSCAN can mark low-density points as noise, but in high dimensions the choice of $\\epsilon$ can be fragile, so distance distributions and domain review are necessary.',
      interpretation: 'Clustering is not classification without labels; it invents groups from a similarity assumption. K-means draws Voronoi cells around centroids. GMMs draw overlapping probability clouds. DBSCAN traces dense connected regions. Hierarchical clustering records a sequence of grouping decisions. PCA rotates axes to capture variance efficiently. t-SNE and UMAP build neighborhood-preserving maps for human inspection. The key interview move is to ask what similarity means for the product. Cosine similarity may beat Euclidean distance for text embeddings; dynamic time warping may matter for time series; learned metrics may matter for recommendations.',
      interview: 'If asked how to choose $K$, mention elbow plots, silhouette, gap statistic, BIC/AIC for GMMs, stability, and business interpretability. If asked EM, explain responsibilities then parameter updates, and note local optima. If asked PCA versus t-SNE, say PCA is linear and variance-preserving while t-SNE is nonlinear and visualization-focused. If asked about DBSCAN, define $\\epsilon$, minPts, core points, border points, and noise. If asked about nearest-neighbor retrieval, discuss normalization, indexing, approximate nearest neighbors, recall-latency trade-offs, and evaluation with labeled pairs or downstream metrics.',
      pitfalls: 'Do not treat cluster ids as ground truth. Do not run distance-based methods on unscaled mixed-unit features without thought. Do not interpret t-SNE cluster area or inter-cluster distance as quantitative truth. Do not choose $K$ only by the prettiest plot. Do not forget randomness and initialization; repeat runs and inspect stability. In high dimensions, Euclidean distances can concentrate, making nearest-neighbor and density methods less reliable. PCA can remove low-variance but label-important directions if used blindly before supervised learning.',
      practice: 'Practice one example for each method: k-means for customer segments, GMM for overlapping user modes, DBSCAN for geospatial hotspots, hierarchical for taxonomy exploration, PCA for compression, t-SNE/UMAP for embedding visualization, and kNN for local similarity. For each, state the distance, scaling, hyperparameters, validation signal, and failure mode. In interviews, emphasize that unsupervised outputs need human or downstream validation because there is no label-defined objective by default.',
    }),
    flashcards: [
      { q: 'What objective does k-means minimize?', a: 'The sum of squared distances from points to their assigned centroids.' },
      { q: 'Why is feature scaling important for k-means?', a: 'Euclidean distance is dominated by features with larger numeric scale.' },
      { q: 'What is k-means++?', a: 'An initialization method that spreads initial centroids to improve convergence and results.' },
      { q: 'What does a GMM provide that k-means does not?', a: 'Soft probabilistic cluster assignments and elliptical cluster shapes through covariances.' },
      { q: 'What are the two steps of EM for GMMs?', a: 'E-step computes responsibilities; M-step updates mixture weights, means, and covariances.' },
      { q: 'What does DBSCAN identify?', a: 'Dense connected clusters and noise points using radius epsilon and minimum points.' },
      { q: 'What is a DBSCAN core point?', a: 'A point with at least minPts points within its epsilon neighborhood.' },
      { q: 'What is hierarchical clustering output?', a: 'A dendrogram showing nested merges or splits of clusters.' },
      { q: 'What does PCA preserve?', a: 'Maximum variance under linear orthogonal projections.' },
      { q: 'Is PCA supervised?', a: 'No. PCA ignores labels and may discard predictive low-variance directions.' },
      { q: 'What is t-SNE best used for?', a: 'Visualization of local neighborhood structure, not quantitative global distances.' },
      { q: 'How does UMAP compare at a high level?', a: 'It builds a neighbor graph and often preserves more global structure than t-SNE, but still needs careful interpretation.' },
      { q: 'What is silhouette score?', a: 'A clustering metric comparing within-cluster cohesion to nearest-cluster separation.' },
      { q: 'Why can high dimensions hurt nearest neighbors?', a: 'Distances can concentrate, making nearest and farthest points less distinguishable.' },
      { q: 'How should unsupervised clusters be validated?', a: 'By stability, human/domain inspection, external labels if available, or downstream task improvement.' },
    ],
    quiz: [
      { q: 'K-means is most aligned with which cluster shape?', options: ['Roughly spherical clusters under Euclidean distance', 'Arbitrary density-connected shapes only', 'Nested trees only', 'No distance metric'], answer: 0, explanation: 'K-means assigns points to nearest centroids, creating spherical-ish Voronoi regions.' },
      { q: 'In a GMM, EM responsibilities are computed in which step?', options: ['M-step', 'E-step', 'Tree-pruning step', 'Calibration step'], answer: 1, explanation: 'The E-step estimates latent component responsibilities.' },
      { q: 'Which method naturally labels some points as noise?', options: ['PCA', 'K-means', 'DBSCAN', 'Linear regression'], answer: 2, explanation: 'DBSCAN can mark points outside dense regions as noise.' },
      { q: 'What is PCA optimizing?', options: ['Class purity directly', 'Cross-entropy', 'Density reachability', 'Variance preserved by linear projection'], answer: 3, explanation: 'PCA selects orthogonal directions of maximum variance.' },
      { q: 'What is a safe interpretation of t-SNE?', options: ['Local neighborhoods can be informative for visualization', 'Cluster area is exact probability mass', 'Far cluster distances are always exact', 'It proves causal groups'], answer: 0, explanation: 't-SNE is mainly a local-neighborhood visualization tool.' },
      { q: 'Which issue affects distance methods in high dimensions?', options: ['Distance concentration', 'Guaranteed perfect clusters', 'No need for scaling', 'Labels become continuous'], answer: 0, explanation: 'As dimensions grow, distances can become less discriminative.' },
      { q: 'Which linkage can suffer from chaining through bridges?', options: ['Complete linkage only', 'Ward linkage only', 'Single linkage', 'No linkage'], answer: 2, explanation: 'Single linkage can merge clusters through thin chains of points.' },
      { q: 'How should K be chosen for clustering?', options: ['Only by the largest possible value', 'Only by alphabetical order', 'Never validate it', 'Use diagnostics plus stability and business usefulness'], answer: 3, explanation: 'Elbow, silhouette, stability, and interpretability all matter.' },
    ],
    resources: [resources.esl, resources.cs229, resources.statquest, resources.googleMl],
  },
  {
    id: 'model-evaluation-metrics',
    title: 'Model Evaluation & Metrics',
    category: 'Classical ML',
    summary: 'Evaluation turns model scores into product decisions. Interviews expect confusion-matrix fluency, precision/recall/F1, ROC-AUC versus PR-AUC, calibration, ranking metrics, regression metrics, and class-imbalance strategies.',
    widgets: ['roc-curve'],
    notes: makeNotes({
      title: 'Model Evaluation & Metrics',
      northStar: 'Metrics define what the model is rewarded for. A technically strong model can be useless if the metric ignores the product decision, the cost of mistakes, the ranking surface, or the slices where users are harmed.',
      formulas: `For binary classification:

$$
Precision=\\frac{TP}{TP+FP}, \\qquad Recall=\\frac{TP}{TP+FN}, \\qquad F1=\\frac{2PR}{P+R}
$$

For regression:

$$
MAE=\\frac{1}{n}\\sum_i |y_i-\\hat{y}_i|, \\qquad RMSE=\\sqrt{\\frac{1}{n}\\sum_i (y_i-\\hat{y}_i)^2}
$$

Discounted cumulative gain:

$$
DCG@k=\\sum_{i=1}^k \\frac{rel_i}{\\log_2(i+1)}
$$`,
      core: 'The confusion matrix counts true positives, false positives, true negatives, and false negatives at a threshold. Accuracy is fine when classes are balanced and costs are symmetric, but it is misleading for rare positives. Precision asks: among predicted positives, how many were correct? Recall asks: among actual positives, how many did we catch? F1 is the harmonic mean, useful when precision and recall both matter but not a substitute for explicit costs. Threshold choice converts scores into actions; changing the threshold moves along the precision-recall trade-off.\n\nROC-AUC measures ranking quality across thresholds by plotting true-positive rate against false-positive rate. It is insensitive to class prevalence in a way that can look overly optimistic for rare positives. PR-AUC focuses on precision and recall, often more informative under severe imbalance. Calibration asks whether predicted probabilities match observed frequencies: among examples scored near 0.8, about 80% should be positive. A model can rank well but be miscalibrated. Calibration methods include Platt scaling, isotonic regression, temperature scaling, and retraining with better probability objectives.\n\nRanking metrics are used when the order of items matters. NDCG discounts relevance by position and normalizes by ideal ranking. MAP averages precision at relevant item positions, emphasizing retrieval quality. MRR focuses on the rank of the first relevant item, useful for question answering or search where the first good result matters. Regression metrics differ too: MAE is robust and interpretable in target units; RMSE penalizes large errors; MAPE can explode near zero; quantile loss is useful for prediction intervals. Class imbalance can be addressed by class weights, resampling, threshold tuning, anomaly framing, stratified validation, and metrics aligned with costs.',
      comparison: '| Metric | Best for | Sensitive to | Caveat |\n|---|---|---|---|\n| Accuracy | Balanced symmetric errors | Threshold | Misleading under imbalance |\n| Precision | Costly false positives | Threshold and prevalence | Can ignore missed positives |\n| Recall | Costly false negatives | Threshold | Can tolerate many false positives |\n| ROC-AUC | Overall ranking | Score ordering | Can look high for rare positives |\n| PR-AUC | Rare positive retrieval | Prevalence | Baseline equals positive rate |\n| Calibration | Probability quality | Dataset shift | Does not ensure ranking |\n| NDCG/MAP/MRR | Ranked lists | Position and relevance labels | Needs query-level evaluation |',
      worked: 'Suppose a fraud detector scores 1,000,000 transactions with a fraud rate of 0.2%. A classifier that predicts “not fraud” always has 99.8% accuracy and zero business value. If investigators can review 1,000 cases per day, precision at top 1,000 may matter more than global accuracy. If missing fraud is extremely costly, recall at an acceptable review volume may be the target. ROC-AUC could be high even while precision at the top operating point is too low, so evaluate the model where it will actually be used.\n\nFor a recommendation model, predicting whether an item is relevant is less important than ranking the best items near the top. NDCG@10 rewards placing highly relevant items early. MAP rewards retrieving all relevant items with high precision. MRR is appropriate when the user needs one correct answer quickly. Evaluation must be query- or user-level; pooling all items can let heavy users dominate and obscure poor performance for smaller segments.',
      interpretation: 'A metric is a compressed value judgment. Precision values reviewer time; recall values coverage; RMSE values avoiding large errors; MAE values typical absolute miss; NDCG values top-of-list relevance; calibration values trustworthy probabilities. No single metric captures everything. A good evaluation suite has a primary metric tied to the decision, guardrail metrics for harms and costs, slice metrics for fairness and robustness, and statistical uncertainty. For imbalanced data, the baseline matters: PR-AUC should be compared to the positive rate, and lift charts or top-k precision often speak product language better than abstract curves.',
      interview: 'If asked which metric to use, ask what decision the model drives and what false positives and false negatives cost. For medical screening, recall may dominate with precision guardrails. For spam blocking, false positives may be very costly. For ranking, use query-level ranking metrics. For probability-based bidding or risk, calibration matters. For regression, choose MAE for typical error, RMSE when large misses are especially bad, and quantile metrics for uncertainty. Always include validation design, confidence intervals or bootstrap over the correct unit, and slice analysis.',
      pitfalls: 'Do not use accuracy for rare events without context. Do not compare PR-AUC across datasets with different prevalence without noting the baseline. Do not tune thresholds on the test set. Do not assume AUC improvement changes the business metric at the operating threshold. Do not evaluate ranking by treating every item independently if queries or users are the unit. Do not ignore calibration when probabilities feed downstream expected-value decisions. For regression, do not use MAPE when true values can be near zero. For imbalance, resampling must be applied only inside training folds.',
      practice: 'Practice building a confusion matrix from counts and deriving precision, recall, specificity, FPR, and F1. Draw ROC and PR curves and explain why PR is often more revealing for rare positives. Compute a tiny DCG and NDCG example by hand. Explain calibration with a reliability table. For each metric, give a product example where it is appropriate and one where it is misleading. In case interviews, propose a primary metric, guardrails, thresholding plan, and slice analysis before discussing model architecture.',
    }),
    flashcards: [
      { q: 'What is precision?', a: '$TP/(TP+FP)$: the fraction of predicted positives that are truly positive.' },
      { q: 'What is recall?', a: '$TP/(TP+FN)$: the fraction of actual positives that are found.' },
      { q: 'What is F1?', a: 'The harmonic mean of precision and recall: $2PR/(P+R)$.' },
      { q: 'Why can accuracy be misleading?', a: 'With imbalanced classes, a majority-class classifier can have high accuracy and no usefulness.' },
      { q: 'What does ROC-AUC measure?', a: 'Threshold-independent ranking quality via true-positive rate versus false-positive rate.' },
      { q: 'When is PR-AUC especially useful?', a: 'Rare positive-class problems where precision among predicted positives matters.' },
      { q: 'What is calibration?', a: 'Agreement between predicted probabilities and observed frequencies.' },
      { q: 'Can a model be well-ranked but poorly calibrated?', a: 'Yes. AUC can be high while probability estimates are systematically too high or low.' },
      { q: 'What is NDCG used for?', a: 'Evaluating ranked lists with position discounts and normalization by the ideal ranking.' },
      { q: 'What is MAP?', a: 'Mean average precision, averaging precision at relevant item positions across queries.' },
      { q: 'What is MRR?', a: 'Mean reciprocal rank, focusing on the position of the first relevant result.' },
      { q: 'When prefer MAE over RMSE?', a: 'When typical absolute error matters and you do not want to heavily penalize large errors.' },
      { q: 'How does RMSE treat outliers?', a: 'It penalizes large errors strongly because errors are squared.' },
      { q: 'Name class-imbalance strategies.', a: 'Use appropriate metrics, class weights, resampling, threshold tuning, stratified splits, and top-k evaluation.' },
      { q: 'Why evaluate metrics by slice?', a: 'Aggregate performance can hide failures for important groups, times, geographies, or traffic sources.' },
    ],
    quiz: [
      { q: 'For rare fraud detection, which metric is often more informative than accuracy?', options: ['Precision-recall behavior', 'Alphabetical label order', 'Training set size only', 'Number of features only'], answer: 0, explanation: 'Precision and recall show performance on the rare positive class.' },
      { q: 'What does calibration measure?', options: ['Whether probabilities match observed frequencies', 'Whether all coefficients are zero', 'Whether features are sorted', 'Whether test labels are hidden'], answer: 0, explanation: 'A calibrated 0.8 score should be positive about 80% of the time.' },
      { q: 'Which metric is position-aware for ranked relevance?', options: ['RMSE', 'Accuracy', 'NDCG', 'Silhouette'], answer: 2, explanation: 'NDCG discounts relevance by rank position and normalizes by ideal order.' },
      { q: 'Which regression metric penalizes large errors most strongly?', options: ['MAE', 'Median absolute error', 'F1', 'RMSE'], answer: 3, explanation: 'RMSE squares errors before averaging, emphasizing large misses.' },
      { q: 'What is the baseline PR-AUC roughly equal to for random ranking?', options: ['Positive class prevalence', 'Always 0.5', 'Number of trees', 'Learning rate'], answer: 0, explanation: 'A random classifier precision equals the positive rate on average.' },
      { q: 'Which metric focuses on the first relevant result?', options: ['MRR', 'RMSE', 'Log-likelihood only', 'Gini impurity'], answer: 0, explanation: 'Mean reciprocal rank is driven by the rank of the first relevant item.' },
      { q: 'Why not tune a threshold on the test set?', options: ['It leaks test information into model selection', 'It improves independence', 'It is required for calibration', 'It removes class imbalance'], answer: 0, explanation: 'The test set should estimate final performance, not guide decisions.' },
      { q: 'A model has high ROC-AUC but poor precision at the review capacity. What matters?', options: ['The operating point or top-k metric', 'Only the file size', 'Only the number of CPUs', 'No metric can help'], answer: 0, explanation: 'Business use often occurs at a specific threshold or review budget.' },
    ],
    resources: [resources.googleMl, resources.esl, resources.statquest, resources.huyenchip],
  },
]

export default topics
