import type { TheoryTopic } from '../../types/content'

const topics: TheoryTopic[] = [
  {
    id: "recommender-systems",
    title: "Recommender Systems",
    category: "Applied ML",
    summary: "Recommendation systems combine retrieval, ranking, feedback loops, and product objectives. Interviews expect you to connect collaborative filtering, matrix factorization, two-tower retrieval, ranking models, cold start, and multi-objective trade-offs.",
    notes: `
## Recommendation as a staged decision system

A recommender system chooses items for a user under limited attention. The ML problem is not just predicting ratings; it is deciding what to retrieve, rank, diversify, explain, and measure. Large systems often use a funnel. Candidate generation retrieves hundreds or thousands of plausible items from millions. Ranking scores those candidates with richer features. Re-ranking applies business rules, diversity, freshness, safety, and exploration. The final list is evaluated by user outcomes and long-term product health.

The feedback is biased because users only interact with items they were shown. A click is not pure preference; it is affected by position, thumbnail, novelty, and intent. Good interview answers mention this bias early, because offline metrics can look excellent while the online product gets worse.

## Collaborative filtering

Collaborative filtering uses patterns of user-item interactions. If two users liked similar items in the past, they may like similar items in the future. If two items are liked by similar users, they may be substitutes or complements. The interaction matrix $R$ has users as rows and items as columns; entries may be ratings, clicks, purchases, watch time, or implicit positives.

Memory-based collaborative filtering compares users or items directly. Model-based approaches learn latent factors. Sparsity is the central challenge: most users interact with a tiny fraction of items. Implicit feedback adds another challenge because missing does not mean negative; it may mean unseen.

## Matrix factorization

Matrix factorization represents each user $u$ and item $i$ with latent vectors $p_u$ and $q_i$. A basic score is

$$
\\hat{r}_{ui}=\\mu+b_u+b_i+p_u^\\top q_i.
$$

The biases capture global, user, and item tendencies; the dot product captures matching interests. For explicit ratings, optimize squared error on observed ratings with regularization. For implicit data, use pairwise losses such as Bayesian Personalized Ranking:

$$
L=-\\sum_{(u,i,j)}\\log \\sigma(p_u^\\top q_i - p_u^\\top q_j)+\\lambda\\|\\Theta\\|_2^2,
$$

where item $i$ is observed positive and item $j$ is sampled as a negative. Negative sampling strategy strongly affects what the model learns.

| Approach | Uses | Strength | Weakness |
|---|---|---|---|
| User-user CF | Similar users | Simple explanation | Sparse and expensive at scale |
| Item-item CF | Similar items | Stable, explainable | Weak personalization for new tastes |
| Matrix factorization | Latent user/item vectors | Compact and scalable | Cold-start without features |
| Factorization machines | Sparse feature interactions | Uses side features | Feature engineering and serving complexity |

> **Interview tip:** For implicit recommenders, say "unobserved is not necessarily negative." Then describe negative sampling or confidence-weighted objectives.

## Two-tower retrieval

Modern large-scale retrieval often uses a two-tower model. One tower embeds the user or query context; another embeds items. Scores are dot products or cosine similarities, enabling approximate nearest-neighbor search. The model is trained with sampled softmax or contrastive losses so the clicked or consumed item scores above negatives:

$$
P(i\\mid u)=\\frac{\\exp(e_u^\\top e_i/\\tau)}{\\sum_j \\exp(e_u^\\top e_j/\\tau)}.
$$

Two-tower systems are fast because item embeddings can be precomputed and indexed. They are less expressive than cross-feature rankers because user-item interactions happen mostly through a dot product. Therefore they are usually candidate generators, not final rankers.

## Ranking models

Ranking models score a smaller candidate set with rich features: user history, item metadata, context, price, freshness, creator quality, predicted click-through rate, predicted watch time, and safety scores. Gradient-boosted trees, wide-and-deep models, DeepFM, and transformer rankers are common depending on scale and modality. Ranking losses can be pointwise, pairwise, or listwise. Evaluation uses AUC, log loss, NDCG, MAP, recall, calibration, and online A/B tests.

Position bias must be handled. If top-ranked items get more clicks because they are visible, a model can learn to reinforce previous ranking rather than true preference. Counterfactual evaluation, randomized buckets, inverse propensity weighting, and exploration traffic help estimate causal effects.

## Cold start and multi-objective trade-offs

Cold start occurs for new users, new items, or new markets with little interaction data. Side features help: content embeddings, metadata, demographics when appropriate, onboarding surveys, popularity priors, and contextual signals. Exploration deliberately shows uncertain items to learn. A bandit framing balances exploitation and exploration.

Real recommenders optimize multiple objectives: clicks, dwell time, purchases, retention, creator ecosystem health, diversity, freshness, fairness, revenue, and safety. Combining them requires calibration and product judgment. A weighted sum is common but can hide conflicts; constraints or Pareto analysis can make trade-offs explicit.

> **Common pitfall:** Optimizing click-through rate alone can promote clickbait, repetition, or short-term engagement at the expense of satisfaction and trust.

## Worked example

For a video app, retrieval might use a two-tower model to find 1,000 videos similar to the user's recent watches. A ranker predicts watch time and satisfaction survey probability. Re-ranking removes already-seen videos, enforces creator diversity, downranks policy-risk content, and reserves slots for exploration. Offline NDCG is useful, but the decision should be validated with A/B tests measuring retention, complaints, and long-term engagement, not only immediate clicks.

## Interview checklist

Structure answers as a funnel: retrieval, ranking, re-ranking, evaluation, and feedback loops. Explain collaborative filtering and matrix factorization with the dot-product equation. Describe two-tower retrieval and approximate nearest-neighbor indexing. Discuss cold start with side information and exploration. Finish with multi-objective metrics and bias: missing-not-negative, position bias, selection bias, and long-term effects.


## Feedback loops and exploration

Recommendation systems shape the data they later learn from. If the system mostly shows popular items, popular items get more interactions, which makes them appear even better. New creators or niche items may never receive enough exposure to prove relevance. This feedback loop is why exploration is not optional in many products. Exploration can be random, uncertainty-based, bandit-driven, or reserved in small traffic slices, but it must be measured carefully to avoid harming users.

Counterfactual thinking is important. The observed click probability is conditioned on exposure: $P(click\\mid shown, position, user, item)$. To estimate what would happen under a different ranking, you need randomized data, propensity scores, or strong assumptions. Offline replay without accounting for exposure can favor models similar to the old policy.

### Features and serving constraints

Retrieval features must be available at high scale and low latency. Item embeddings can be refreshed hourly or daily; user embeddings may update after each session; context features such as device and time are computed online. Rankers can use more features, but every feature adds training-serving skew risk. If a feature is computed differently offline and online, the model may fail despite strong validation metrics.

| Layer | Latency budget | Feature style | Evaluation focus |
|---|---|---|---|
| Retrieval | Very tight | Embeddings and coarse filters | Recall and coverage |
| Ranking | Moderate | Rich user-item-context features | Calibration and NDCG |
| Re-ranking | Tight but rule-aware | Diversity, policy, freshness | Product constraints |
| Exploration | Controlled slice | Uncertainty and novelty | Learning value and guardrails |

Cold start can be framed as uncertainty. A new item should not be permanently buried because it lacks interactions; it needs calibrated exposure. A new user may start with popularity, geography, onboarding interests, or session behavior until enough personal signal accumulates.

> **Interview tip:** Distinguish candidate-generation recall from final-ranking precision. A ranker cannot recover an item that retrieval never returned.

> **Common pitfall:** Training on post-ranking logs and assuming labels are unbiased. The previous recommender decided what users could click.


### Final drill: offline-to-online gap

The offline-to-online gap is central in recommendation. Offline labels come from the old system's exposures, while online performance depends on what the new system chooses to expose. A model can improve offline NDCG by imitating the old ranker and still fail to discover better items. This is why randomized exploration buckets and interleaving experiments are valuable.

Calibration matters because ranking scores often feed business rules. If a model score is interpreted as click probability, it should be calibrated across user groups, item categories, and positions. Poor calibration can break multi-objective blending because one objective's score dominates another's for numerical rather than product reasons.

Diversity and novelty should be intentional. Showing ten nearly identical items may maximize immediate predicted click probability but reduce user satisfaction. Diversity can be enforced by submodular re-ranking, category caps, embedding-distance penalties, or business rules. The right method depends on whether diversity is a hard constraint or a soft objective.

A strong interview close: recommenders are feedback systems. Model relevance, exposure bias, exploration, calibration, constraints, and long-term metrics all matter; a dot product alone is not the product.


### Edge cases to mention

Recommenders often need policy constraints that are not learned from clicks. A marketplace may need seller fairness, inventory constraints, regional rules, or safety filters. These constraints may be applied before retrieval, during ranking, or after ranking. If they are applied only after ranking, the model may waste capacity scoring items that can never be shown.

Delayed feedback is another complication. A purchase, cancellation, or user churn event may occur days after exposure. Training only on immediate clicks biases toward short-term reactions. Mature systems maintain labels at multiple horizons and decide which horizon matches the product goal. This is why retention and satisfaction metrics often sit beside CTR.


One final practical point is to document assumptions. Interviewers like candidates who name the hidden contract: what data is available, what latency is acceptable, what metric matters, and what failure is most costly. Stating those assumptions makes the modeling answer concrete and shows readiness for production trade-offs.
`,
    flashcards: [
      { q: "What is collaborative filtering?", a: "Using patterns of user-item interactions to recommend items based on similar users or similar items." },
      { q: "Why is the user-item matrix sparse?", a: "Most users interact with only a tiny fraction of all items." },
      { q: "What is matrix factorization?", a: "Learning latent vectors for users and items so their dot product predicts preference." },
      { q: "Write a common matrix factorization score.", a: "$\\hat{r}_{ui}=\\mu+b_u+b_i+p_u^\\top q_i$." },
      { q: "In implicit feedback, why is missing not negative?", a: "A user may not have seen the item, so lack of interaction does not prove dislike." },
      { q: "What is BPR?", a: "Bayesian Personalized Ranking, a pairwise loss that scores observed positives above sampled negatives." },
      { q: "What is a two-tower recommender?", a: "Separate user/query and item towers produce embeddings scored by dot product or cosine similarity." },
      { q: "Why are two-tower models useful for retrieval?", a: "Item embeddings can be precomputed and searched efficiently with approximate nearest-neighbor indexes." },
      { q: "Why use a separate ranker after retrieval?", a: "The ranker can use richer cross features and more expensive models on a smaller candidate set." },
      { q: "What is cold start?", a: "Difficulty recommending for new users, items, or domains with little interaction history." },
      { q: "How can item cold start be mitigated?", a: "Use metadata, content embeddings, creator features, popularity priors, and exploration." },
      { q: "What is position bias?", a: "Items shown higher receive more interactions because of placement, not necessarily true preference." },
      { q: "Name a ranking metric.", a: "NDCG, MAP, AUC, log loss, recall@k, and calibration are common." },
      { q: "What is multi-objective recommendation?", a: "Optimizing several goals such as relevance, diversity, retention, revenue, fairness, and safety." },
      { q: "Why are A/B tests important?", a: "Offline metrics are biased proxies; online tests measure real user and business outcomes." },
    ],
    quiz: [
      {
        q: "Matrix factorization primarily learns:",
        options: ["Latent user and item vectors", "Only hand-written rules", "Convolution kernels for images", "SQL schemas"],
        answer: 0,
        explanation: "The dot product of user and item vectors estimates preference.",
      },
      {
        q: "For implicit feedback, unobserved items are:",
        options: ["Always true negatives", "Not necessarily negative because they may be unseen", "Always positives", "Ignored by all losses"],
        answer: 1,
        explanation: "Missing interactions are ambiguous.",
      },
      {
        q: "A two-tower model is especially useful for:",
        options: ["Large-scale candidate retrieval", "Pixel-level segmentation only", "Computing database backups", "Replacing evaluation"],
        answer: 0,
        explanation: "Precomputed item embeddings enable efficient nearest-neighbor retrieval.",
      },
      {
        q: "Position bias means:",
        options: ["Higher-ranked items get interactions partly because they are visible", "The model has too many parameters", "Users have no preferences", "All rankings are random"],
        answer: 0,
        explanation: "Observed clicks are influenced by exposure position.",
      },
      {
        q: "Cold start for a new item can be helped by:",
        options: ["Content and metadata features", "Deleting all user history", "Assuming it is disliked", "Using future labels"],
        answer: 0,
        explanation: "Side information gives signal before interactions accumulate.",
      },
      {
        q: "A pairwise ranking loss trains the model to:",
        options: ["Score preferred items above less preferred items", "Predict only global mean", "Normalize images", "Tokenize text"],
        answer: 0,
        explanation: "Pairwise losses compare item pairs for a user.",
      },
      {
        q: "Optimizing only CTR can be harmful because it may:",
        options: ["Favor clickbait or short-term engagement", "Increase feature quality automatically", "Remove all bias", "Guarantee satisfaction"],
        answer: 0,
        explanation: "CTR can conflict with long-term satisfaction and trust.",
      },
      {
        q: "The final validation for a recommender change is usually:",
        options: ["Online experiment with product metrics", "Only a single training loss value", "The number of item IDs", "Manual sorting by title"],
        answer: 0,
        explanation: "A/B tests estimate real-world impact.",
      },
    ],
    resources: [
      { title: "Recommender Systems Handbook", url: "https://link.springer.com/book/10.1007/978-1-0716-2197-4", type: "book" },
      { title: "Matrix Factorization Techniques for Recommender Systems", url: "https://datajobs.com/data-science-repo/Recommender-Systems-[Netflix].pdf", type: "paper" },
      { title: "TensorFlow Recommenders", url: "https://www.tensorflow.org/recommenders", type: "article" },
      { title: "Deep Neural Networks for YouTube Recommendations", url: "https://research.google/pubs/deep-neural-networks-for-youtube-recommendations/", type: "paper" },
      { title: "BPR: Bayesian Personalized Ranking from Implicit Feedback", url: "https://arxiv.org/abs/1205.2618", type: "paper" },
    ],
  },
  {
    id: "generative-models",
    title: "Generative Models",
    category: "Applied ML",
    summary: "Generative models learn to sample from data-like distributions. This topic compares VAEs, GANs, and diffusion models through their objectives, sampling behavior, strengths, and failure modes.",
    notes: `
## What generative modeling tries to learn

A generative model learns a distribution that can produce new examples resembling the training data. In images, it may generate faces or product photos; in molecules, candidate structures; in audio, waveforms; in representation learning, latent factors. Different families make different trade-offs between likelihood, sample quality, diversity, controllability, and sampling speed.

A useful framing is to introduce latent variables. Let $z$ be a hidden code sampled from a simple prior such as $p(z)=\\mathcal{N}(0,I)$. A generator maps $z$ to data space. The challenge is training that mapping so generated samples match the true data distribution $p_{data}(x)$.

## Variational Autoencoders

A VAE has an encoder $q_\\phi(z\\mid x)$, a decoder $p_\\theta(x\\mid z)$, and a prior $p(z)$. Directly maximizing $\\log p_\\theta(x)$ is hard because it requires integrating over latent variables. VAEs optimize the evidence lower bound:

$$
\\log p_\\theta(x) \\ge \\mathbb{E}_{q_\\phi(z\\mid x)}[\\log p_\\theta(x\\mid z)] - D_{KL}(q_\\phi(z\\mid x)\\|p(z)).
$$

The first term encourages reconstruction; the KL term keeps latent codes close to the prior so sampling works. The reparameterization trick writes $z=\\mu_\\phi(x)+\\sigma_\\phi(x)\\odot\\epsilon$, with $\\epsilon\\sim\\mathcal{N}(0,I)$, allowing gradients to flow through stochastic sampling.

VAEs provide a structured latent space and likelihood-style objective, but samples can be blurry when the decoder likelihood is simple. They are useful for representation learning, anomaly detection, and controlled generation where latent interpolation matters.

## GANs

A Generative Adversarial Network trains a generator $G(z)$ and discriminator $D(x)$ in a minimax game:

$$
\\min_G \\max_D \\; \\mathbb{E}_{x\\sim p_{data}}[\\log D(x)] + \\mathbb{E}_{z\\sim p(z)}[\\log(1-D(G(z)))].
$$

The discriminator learns to distinguish real from fake; the generator learns to fool it. GANs can produce sharp samples because the discriminator supplies a learned perceptual training signal rather than a pixelwise reconstruction loss. However, training is unstable. Mode collapse occurs when the generator produces limited varieties that fool the discriminator but miss parts of the data distribution.

| Family | Training signal | Strength | Weakness |
|---|---|---|---|
| VAE | Likelihood lower bound | Latent structure, stable objective | Blurry samples with simple decoders |
| GAN | Adversarial discriminator | Sharp realistic samples | Instability and mode collapse |
| Diffusion | Denoising score/noise prediction | High diversity and quality | Many sampling steps unless accelerated |
| Autoregressive | Exact sequence likelihood | Strong likelihood and conditioning | Sequential sampling can be slow |

> **Interview tip:** For GANs, mention both players. The discriminator is not the final product, but its gradients define the generator's learning signal.

## Diffusion models

Diffusion models define a forward process that gradually adds noise to data and a learned reverse process that removes noise. In a common formulation,

$$
q(x_t\\mid x_{t-1})=\\mathcal{N}(\\sqrt{1-\\beta_t}x_{t-1}, \\beta_t I).
$$

After many steps, $x_T$ is nearly Gaussian noise. The model learns to predict noise, denoised data, or a score at each timestep. A simplified training objective is

$$
\\mathbb{E}_{x_0,\\epsilon,t}\\left[\\|\\epsilon-\\epsilon_\\theta(x_t,t)\\|_2^2\\right].
$$

Sampling starts from noise and repeatedly applies the learned denoiser. Classifier-free guidance trains conditional and unconditional behavior, then combines them at sampling time to trade diversity for prompt adherence. Diffusion models dominate many image-generation settings because they balance quality, diversity, and stable training, though sampling can be expensive.

## Conditioning and evaluation

Generative models can be unconditional or conditional. Conditions include class labels, text prompts, images, masks, layouts, or physical constraints. Conditioning can be injected through concatenation, cross-attention, adaptive normalization, or guidance. Evaluation is difficult because there is no single right output. Metrics include log likelihood, FID, Inception Score, precision/recall for distributions, CLIP score for text-image alignment, human preference, and downstream utility.

> **Common pitfall:** Judging generative models only by a few cherry-picked samples. Diversity, failure cases, prompt adherence, and memorization must be evaluated systematically.

## Worked comparison

If you need a compact latent representation for anomaly detection, a VAE is attractive because it gives an encoder and reconstruction signal. If you need extremely sharp images and can tolerate training difficulty, a GAN may be appropriate. If you need high-quality text-conditioned image generation with robust training, diffusion is often the default. If you need exact likelihood over discrete sequences, an autoregressive model is natural.

## Interview checklist

Define the distribution-learning goal, then compare objectives. VAEs maximize an ELBO with reconstruction and KL terms and use reparameterization. GANs play a minimax game and can suffer mode collapse. Diffusion models learn iterative denoising from a noising process and sample from noise. Discuss conditioning, sample quality versus diversity, likelihood availability, sampling speed, and evaluation. Strong answers avoid claiming one family is universally best; they map the model to constraints.


## Likelihood, realism, and coverage

Generative model families optimize different proxies for the same dream: matching the data distribution. Likelihood-based models reward assigning probability to observed data, but high likelihood does not always mean perceptually best samples. Adversarial models can produce realistic samples but may ignore rare modes. Diffusion models often cover modes well and train stably, but iterative sampling costs latency. An interview answer should connect the objective to the visible behavior.

Latent spaces are useful when they are smooth. In a VAE, interpolating between two latent codes often changes generated samples gradually because the KL term regularizes the space. GAN latent spaces can also have semantic directions, but they are learned implicitly. Diffusion models may use latent diffusion, where denoising happens in a compressed autoencoder latent space to reduce compute.

### Conditioning, control, and safety

Conditional generation introduces a second requirement: samples must be realistic and match the condition. Text-to-image systems can create beautiful images that ignore counts, spatial relations, or negation. Guidance improves adherence but can reduce diversity or create artifacts. In high-stakes domains, generated candidates should be validated by downstream constraints, simulators, or human review.

| Concern | VAE lens | GAN lens | Diffusion lens |
|---|---|---|---|
| Diversity | Prior coverage matters | Mode collapse risk | Usually strong coverage |
| Sharpness | Decoder likelihood can blur | Often sharp | High with good denoisers |
| Training stability | Usually stable | Delicate game | Stable supervised denoising |
| Sampling speed | Fast decoder | Fast generator | Often many steps |

Memorization checks matter. Nearest-neighbor analysis, train/test similarity, watermarking, and privacy review can reveal whether outputs are too close to training data. For synthetic data generation, utility and privacy must both be measured.

> **Interview tip:** For diffusion, explain both processes: fixed noising during training and learned denoising during generation. Many weak answers mention only "remove noise" without the training objective.

> **Common pitfall:** Comparing GANs and diffusion only by image quality. Consider training stability, mode coverage, conditioning, inference speed, and evaluation cost.


### Final drill: choosing and evaluating a family

If an interviewer asks which generative model to use, start with output type and constraints. For small continuous data with a meaningful latent representation, a VAE may be ideal. For fast image synthesis where training complexity is acceptable, a GAN may fit. For high-quality conditional image generation, diffusion is often strong. For text, autoregressive transformers are natural because text is discrete and ordered.

Evaluation should include both automatic and human checks. FID can reward visual realism but miss prompt faithfulness. CLIP score can be gamed by images that match text superficially. Likelihood can favor overly smooth distributions. Human preference can be expensive and subjective. A good evaluation combines several metrics with targeted failure-case review.

Safety and ownership concerns are practical. Generated media can contain memorized training content, stereotypes, or unsafe instructions. Watermarking, provenance, filters, and dataset governance may be required depending on application. Synthetic data should be tested for privacy leakage and for whether it actually improves downstream models.

A concise close: VAEs trade sharpness for structured likelihood learning, GANs trade stability for sharp adversarial samples, and diffusion trades sampling speed for stable high-quality denoising.


### Edge cases to mention

Conditioning can be compositional. A prompt may ask for a red cube left of a blue sphere, not just an object category. Many generative models struggle with counting, spatial relations, and negation because those constraints require structured consistency. Evaluation should include such compositional prompts, not only aesthetically pleasing examples.

For scientific generation, validity constraints are central. A molecule must obey chemistry rules; a protein must fold; a design must meet physics constraints. In those domains, a generative model is usually paired with validators, simulators, or optimization loops. The best sample is not the prettiest one but the one that satisfies downstream constraints.


One final practical point is to document assumptions. Interviewers like candidates who name the hidden contract: what data is available, what latency is acceptable, what metric matters, and what failure is most costly. Stating those assumptions makes the modeling answer concrete and shows readiness for production trade-offs.


For a final interview sentence, tie the method back to risk: the best solution is the one that improves the target behavior while making its assumptions, monitoring plan, and rollback path explicit.

When time is short, summarize the trade-off plainly: optimize the measurable bottleneck, keep humans or validators in the loop for high-risk outputs, and test the exact deployment path rather than a simplified demo.`,
    flashcards: [
      { q: "What is a generative model?", a: "A model that learns to sample new data-like examples from an estimated data distribution." },
      { q: "What is a latent variable?", a: "A hidden code $z$ that captures factors used to generate or explain observed data." },
      { q: "What are the main parts of a VAE?", a: "An encoder $q_\\phi(z\\mid x)$, decoder $p_\\theta(x\\mid z)$, and prior $p(z)$." },
      { q: "What does the VAE ELBO contain?", a: "A reconstruction likelihood term and a KL term that keeps the approximate posterior near the prior." },
      { q: "What is the reparameterization trick?", a: "Writing stochastic samples as a differentiable transformation of parameters and noise, e.g. $z=\\mu+\\sigma\\odot\\epsilon$." },
      { q: "Why can VAE samples look blurry?", a: "Simple likelihoods and reconstruction losses often average plausible outputs." },
      { q: "What are the two networks in a GAN?", a: "A generator that produces samples and a discriminator that distinguishes real from fake." },
      { q: "What is mode collapse?", a: "A GAN failure where the generator covers only a limited subset of the data distribution." },
      { q: "Why can GAN samples be sharp?", a: "The discriminator provides a learned signal about realism rather than only pixelwise reconstruction." },
      { q: "What is the diffusion forward process?", a: "A fixed process that gradually adds noise to data over timesteps." },
      { q: "What does a diffusion model learn?", a: "A reverse denoising process, often by predicting the added noise at each timestep." },
      { q: "Why are diffusion models slower to sample?", a: "They often require many iterative denoising steps, though samplers can accelerate this." },
      { q: "What is classifier-free guidance?", a: "A sampling technique combining conditional and unconditional predictions to strengthen condition adherence." },
      { q: "Name a generative evaluation metric.", a: "FID, likelihood, precision/recall, CLIP score, human preference, or downstream task utility." },
      { q: "Why is memorization a concern?", a: "A generator may reproduce training examples rather than learning a broad distribution." },
    ],
    quiz: [
      {
        q: "The VAE objective is based on:",
        options: ["An evidence lower bound with reconstruction and KL terms", "Only a discriminator game", "Sorting generated samples", "Beam search"],
        answer: 0,
        explanation: "VAEs optimize an ELBO because exact marginal likelihood is hard.",
      },
      {
        q: "The reparameterization trick is used to:",
        options: ["Backpropagate through stochastic latent sampling", "Remove the decoder", "Tokenize text", "Compute IoU"],
        answer: 0,
        explanation: "It expresses random sampling as deterministic parameters plus external noise.",
      },
      {
        q: "In a GAN, the discriminator tries to:",
        options: ["Distinguish real data from generated samples", "Encode text into tokens", "Schedule learning rates", "Predict future timesteps only"],
        answer: 0,
        explanation: "The discriminator supplies adversarial feedback.",
      },
      {
        q: "Mode collapse means:",
        options: ["The generator produces limited varieties and misses modes", "The model uses too many GPUs", "The loss is exactly zero for all data", "The tokenizer has no vocabulary"],
        answer: 0,
        explanation: "GANs can fool the discriminator with insufficient diversity.",
      },
      {
        q: "A diffusion model forward process:",
        options: ["Gradually adds noise to data", "Greedily decodes tokens", "Ranks recommendations", "Computes graph centrality only"],
        answer: 0,
        explanation: "The reverse model learns to denoise.",
      },
      {
        q: "Classifier-free guidance trades:",
        options: ["Diversity for condition adherence as guidance increases", "Memory for labels only", "Batch size for tokenization", "Ratings for users"],
        answer: 0,
        explanation: "Higher guidance often follows prompts more strongly but can reduce diversity or create artifacts.",
      },
      {
        q: "Which family usually provides a useful encoder by design?",
        options: ["VAE", "Vanilla GAN generator only", "Pure diffusion sampler only", "BM25"],
        answer: 0,
        explanation: "A VAE includes an encoder mapping data to latent distributions.",
      },
      {
        q: "Why are cherry-picked samples insufficient evaluation?",
        options: ["They hide diversity, failures, and memorization", "They prove exact likelihood", "They replace all metrics", "They are always random negatives"],
        answer: 0,
        explanation: "Generative evaluation must examine distribution-level behavior.",
      },
    ],
    resources: [
      { title: "Auto-Encoding Variational Bayes", url: "https://arxiv.org/abs/1312.6114", type: "paper" },
      { title: "Generative Adversarial Nets", url: "https://arxiv.org/abs/1406.2661", type: "paper" },
      { title: "Denoising Diffusion Probabilistic Models", url: "https://arxiv.org/abs/2006.11239", type: "paper" },
      { title: "The Annotated Diffusion Model", url: "https://huggingface.co/blog/annotated-diffusion", type: "article" },
      { title: "Dive into Deep Learning", url: "https://d2l.ai/", type: "book" },
    ],
  },
  {
    id: "graph-time-series-ml",
    title: "Graph & Time-Series ML",
    category: "Applied ML",
    summary: "Graphs and time series add structure that ordinary iid tabular assumptions ignore. This topic covers GNN message passing, forecasting fundamentals, and the leakage traps that often decide real-world performance.",
    notes: `
## Structured data beyond iid rows

Graphs and time series both violate the simplest iid assumption. In a graph, examples are connected: a node's label may depend on neighbors, edges, and topology. In a time series, examples are ordered: future values depend on past values, seasonality, events, and nonstationarity. Applied ML interviews often test whether you respect this structure during modeling and validation.

Graph tasks include node classification, link prediction, graph classification, recommendation, fraud detection, traffic modeling, and molecular property prediction. Time-series tasks include demand forecasting, anomaly detection, capacity planning, risk prediction, and sensor monitoring.

## Graph neural networks

A graph has nodes $V$, edges $E$, node features $h_v$, and optionally edge features. Message-passing GNNs update node representations by aggregating neighbor information:

$$
m_v^{(k)} = \\text{AGG}^{(k)}\\left(\\{\\psi^{(k)}(h_v^{(k)},h_u^{(k)},e_{uv}) : u\\in \\mathcal{N}(v)\\}\\right),
$$

$$
h_v^{(k+1)} = \\phi^{(k)}(h_v^{(k)}, m_v^{(k)}).
$$

Aggregation must be permutation-invariant because neighbor order is arbitrary. Sum, mean, max, and attention-weighted sums are common. After $K$ layers, a node representation contains information from up to $K$ hops, though oversmoothing can make node embeddings too similar.

| GNN idea | Purpose | Risk |
|---|---|---|
| Mean aggregation | Stable neighbor summary | May blur important high-degree signals |
| Sum aggregation | Counts multiplicity | Sensitive to degree scale |
| Attention aggregation | Learns neighbor importance | More compute; attention not always explanation |
| Residual connections | Preserve earlier features | Adds design complexity |
| Sampling neighbors | Scale to large graphs | Sampling variance and missing context |

> **Interview tip:** Always state the task and split. Node classification on one fixed graph, link prediction over future edges, and graph classification over many molecules need different validation strategies.

## GNN pitfalls

Graphs are full of leakage traps. If train and test nodes are connected, message passing may transmit label-correlated features from test regions into training or vice versa depending on setup. In link prediction, random edge splits can be too easy if future information remains in node features or reciprocal edges. In recommendation graphs, timestamps matter: using edges from the future to build embeddings for the past creates inflated offline metrics.

Scalability is also hard. Full-neighborhood message passing on billion-edge graphs is impossible without sampling, clustering, caching, or mini-batch methods. Heterogeneous graphs add node and edge types; temporal graphs add time-dependent edges; both require careful schema design.

## Time-series forecasting basics

A time series is an ordered set $y_t$ observed over time, often with covariates $x_t$. Forecasting asks for future values $y_{t+1:t+H}$ given history. Components include trend, seasonality, cycles, holidays, interventions, and noise. Classical methods such as exponential smoothing and ARIMA remain strong baselines. Machine-learning methods add lag features, rolling statistics, calendar features, and external regressors. Deep models use temporal convolutions, RNNs, transformers, or sequence-to-sequence architectures.

A simple autoregressive model is

$$
y_t = c + \\sum_{i=1}^{p}\\phi_i y_{t-i} + \\epsilon_t.
$$

Forecasting can be recursive, direct, or multi-output. Recursive forecasting predicts one step, feeds the prediction back, and repeats; errors can compound. Direct forecasting trains separate models for horizons. Multi-output models predict the full horizon jointly.

## Validation and leakage in time series

Random train/test splits are usually invalid for forecasting because they train on future patterns and test on past-like points. Use chronological splits, rolling-origin evaluation, or backtesting windows. Feature engineering must be computed as of the prediction time. A rolling mean for day $t$ must not include $y_t$ if predicting $y_t$, and normalization statistics should be fit on training windows only.

| Leakage source | Example | Fix |
|---|---|---|
| Random split | Future rows in training | Chronological split |
| Target leakage | Rolling feature includes current target | Shift before rolling |
| Global normalization | Mean uses full dataset including future | Fit scaler on training window |
| Late-arriving covariates | Feature unavailable at prediction time | Enforce as-of joins |
| Entity leakage | Same customer future appears in train | Group/time-aware split |

> **Common pitfall:** High offline accuracy with random splits on time series often measures leakage, not forecasting skill.

## Metrics and uncertainty

Forecast metrics depend on business cost. MAE is robust and interpretable. RMSE penalizes large errors. MAPE is scale-free but fails near zero. SMAPE, WAPE, pinball loss, and coverage metrics are useful in different contexts. Probabilistic forecasts provide quantiles or intervals, which matter for staffing, inventory, and risk. Calibration asks whether predicted 90 percent intervals contain the true value about 90 percent of the time.

For graphs, metrics include node classification accuracy/F1, link prediction ROC-AUC or average precision, ranking metrics for recommendations, and graph-level regression error. Negative sampling must match deployment; random non-edges can make link prediction look easier than recommending plausible missing edges.

## Worked example

A fraud model uses a transaction graph and daily features. If you build graph edges using all transactions through December and train a model to predict fraud in September, the September representation can include future October-to-December behavior. The model appears powerful but cannot be deployed in September. The fix is an as-of graph snapshot for each training time, chronological evaluation, and features computed only from information available then.

## Interview checklist

For GNNs, write the message-passing pattern, mention permutation-invariant aggregation, and discuss oversmoothing, neighbor sampling, heterogeneous schemas, and graph leakage. For time series, identify horizon, granularity, covariates, baselines, and validation scheme. Stress leakage: chronological splits, shifted rolling features, as-of joins, and training-only normalization. Strong applied answers are less about fancy architectures and more about respecting graph and time structure.


## Baselines before complex models

For graph and time-series tasks, simple baselines are especially revealing. In graphs, compare against degree, popularity, label propagation, common-neighbor scores, and non-graph feature models. In forecasting, compare against last value, seasonal naive, moving average, exponential smoothing, and a simple gradient-boosted model with lag features. If a GNN or transformer cannot beat these, the added complexity is not justified.

The data split should match deployment. For a node classifier on a static citation graph, a transductive split may be acceptable if all nodes are known and only labels are hidden. For fraud detection over time, transductive access to future edges is leakage. For time series across stores, you may need both temporal splits and entity holdouts to test new-store generalization.

### Feature availability and drift

Time-series features have an availability timestamp that may differ from the event timestamp. Weather forecasts, invoices, returns, and fraud labels can arrive late. A feature store should support point-in-time correctness so training rows only see data available at that time. Drift is also expected: seasonality changes, products launch, graph communities evolve, and sensors degrade.

| Question | Graph version | Time-series version |
|---|---|---|
| What is the prediction unit? | Node, edge, subgraph, whole graph | Timestamp, window, horizon |
| What context is allowed? | Which neighbors and edge times? | Which past covariates? |
| How is leakage avoided? | Edge/time-aware splits | Chronological as-of features |
| What baseline is strong? | Degree or common neighbors | Seasonal naive |

Uncertainty is valuable. In forecasting, quantiles support inventory buffers and staffing plans. In graphs, calibrated link probabilities support risk thresholds and review queues. Accuracy alone may not match business cost.

> **Interview tip:** Say "as of prediction time" repeatedly. It signals that you understand deployment reality, not just model architecture.

> **Common pitfall:** Building graph embeddings once on the full graph and then using them in a historical train/test split. Those embeddings may already contain future edges.


### Final drill: deployment questions

For graph ML, ask how often the graph changes and how embeddings update. A static embedding job may be fine for a citation graph, but a fraud graph changes every minute. Incremental updates, streaming features, and stale-neighbor handling become part of the model. For time series, ask when predictions are made, when covariates arrive, and how forecasts are consumed. A forecast delivered after the staffing decision is useless even if accurate.

Monitoring should respect structure. For graphs, watch degree distribution, new-node rate, edge-type mix, and component structure. For forecasts, watch residuals by horizon, season, region, and item; monitor interval coverage if probabilistic. Drift may appear first in one slice before aggregate metrics move.

Causal interpretation requires caution. A GNN may exploit homophily, not causal influence. A time-series model may use a covariate that is correlated with demand but unavailable under intervention. If decisions change the future, such as promotions affecting demand, forecasting becomes part of a control loop.

A strong interview close: respect topology for graphs, respect chronology for time series, build leakage-proof validation, and compare against simple baselines before deploying complex neural architectures.


### Edge cases to mention

Graphs can be heterophilous: connected nodes may have different labels rather than similar labels. In that case, naive neighbor averaging can hurt because it washes away the signal. Architectures or features that handle edge types, signed relationships, or structural roles may be needed. Do not assume every graph benefits from homophily-based smoothing.

Time series can have intermittent demand, where many periods are zero and occasional spikes matter. Standard MAPE can fail, and naive neural models may predict smooth averages. Croston-style baselines, count models, quantile forecasts, or hierarchical reconciliation may be more appropriate. Matching the metric to the business cost is more important than using the newest architecture.


One final practical point is to document assumptions. Interviewers like candidates who name the hidden contract: what data is available, what latency is acceptable, what metric matters, and what failure is most costly. Stating those assumptions makes the modeling answer concrete and shows readiness for production trade-offs.
`,
    flashcards: [
      { q: "What is message passing in a GNN?", a: "Nodes update representations by aggregating transformed information from their neighbors." },
      { q: "Why must GNN aggregation be permutation-invariant?", a: "Neighbor order in a graph is arbitrary, so output should not depend on ordering." },
      { q: "Name common GNN aggregators.", a: "Sum, mean, max, and attention-weighted aggregation." },
      { q: "What is oversmoothing?", a: "After many GNN layers, node representations become too similar and lose discriminative information." },
      { q: "Why is graph splitting important?", a: "Edges connect examples, so naive splits can leak information between train and test." },
      { q: "What is link prediction?", a: "Predicting whether an edge should exist or will form between nodes." },
      { q: "What is an autoregressive time-series model?", a: "A model that predicts current or future values from past values of the same series." },
      { q: "What is forecasting horizon?", a: "How far into the future predictions are required, e.g. next hour or next 30 days." },
      { q: "Why are random splits bad for forecasting?", a: "They allow future information to influence training and overestimate deployment performance." },
      { q: "What is rolling-origin evaluation?", a: "Backtesting with multiple chronological train/test cutoffs that mimic repeated forecasting." },
      { q: "What is target leakage in rolling features?", a: "Using the value being predicted, or future values, inside a feature calculation." },
      { q: "Why fit scalers only on training windows?", a: "Global normalization can leak future distribution information into training." },
      { q: "Name time-series error metrics.", a: "MAE, RMSE, MAPE, SMAPE, WAPE, pinball loss, and coverage." },
      { q: "What are as-of joins?", a: "Feature joins that include only information available at the prediction timestamp." },
      { q: "Why keep classical forecasting baselines?", a: "They are strong, interpretable, and reveal whether complex models add real value." },
    ],
    quiz: [
      {
        q: "In a message-passing GNN, a node representation after $K$ layers can include information from:",
        options: ["Up to K-hop neighborhoods", "Only future timestamps", "Only labels", "No neighbors"],
        answer: 0,
        explanation: "Each layer aggregates one hop farther.",
      },
      {
        q: "A valid graph aggregator should be:",
        options: ["Permutation-invariant over neighbors", "Dependent on arbitrary input order", "A random train/test split", "A tokenizer"],
        answer: 0,
        explanation: "Graph neighbors do not have a canonical order.",
      },
      {
        q: "Oversmoothing means:",
        options: ["Node embeddings become too similar after many layers", "Forecasts use too many holidays", "The optimizer is AdamW", "The dataset is too small for tokenization"],
        answer: 0,
        explanation: "Repeated aggregation can blur node distinctions.",
      },
      {
        q: "For time-series forecasting, the safest validation is usually:",
        options: ["Chronological backtesting", "Random row shuffling", "Training on the test future", "No holdout set"],
        answer: 0,
        explanation: "Evaluation should mimic future prediction from past data.",
      },
      {
        q: "A rolling mean feature for predicting day $t$ should:",
        options: ["Use only data before day $t$", "Use day $t$ and future days", "Use test labels", "Ignore timestamps"],
        answer: 0,
        explanation: "Features must be available at prediction time.",
      },
      {
        q: "MAPE can be problematic when:",
        options: ["True values are near zero", "There are too many graph nodes only", "The model uses ReLU", "The data has labels"],
        answer: 0,
        explanation: "Percentage errors explode or become undefined near zero.",
      },
      {
        q: "In link prediction, easy random negatives can:",
        options: ["Inflate offline metrics compared with realistic candidates", "Guarantee deployment success", "Remove all leakage", "Make graph edges disappear"],
        answer: 0,
        explanation: "Random non-edges may be too obvious.",
      },
      {
        q: "An as-of join enforces that:",
        options: ["Only information available at prediction time is used", "All future covariates are included", "Rows are shuffled randomly", "Node order becomes meaningful"],
        answer: 0,
        explanation: "As-of joins prevent temporal leakage.",
      },
    ],
    resources: [
      { title: "A Comprehensive Survey on Graph Neural Networks", url: "https://arxiv.org/abs/1901.00596", type: "paper" },
      { title: "Semi-Supervised Classification with Graph Convolutional Networks", url: "https://arxiv.org/abs/1609.02907", type: "paper" },
      { title: "Forecasting: Principles and Practice", url: "https://otexts.com/fpp3/", type: "book" },
      { title: "Darts Time Series Library", url: "https://unit8co.github.io/darts/", type: "repo" },
      { title: "Dive into Deep Learning", url: "https://d2l.ai/", type: "book" },
    ],
  },
]

export default topics
