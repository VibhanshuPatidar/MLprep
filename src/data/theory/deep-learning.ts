import type { TheoryTopic } from '../../types/content'

const topics: TheoryTopic[] = [
  {
    id: "neural-network-fundamentals",
    title: "Neural Network Fundamentals",
    category: "Deep Learning",
    summary: "Build the mental model that connects a single perceptron, multilayer networks, computational graphs, and backpropagation. Interviewers expect you to reason about gradients, initialization, and why deep networks can fail before they can learn.",
    notes: `
## From perceptron to multilayer networks

A perceptron is a linear score followed by a simple decision rule. For input vector $x \\in \\mathbb{R}^d$, weights $w$, and bias $b$, it computes $z = w^\\top x + b$ and predicts a class from the sign of $z$. That is enough for linearly separable data, but it cannot represent XOR-like interactions because every decision boundary is a hyperplane. The step from a perceptron to a multilayer perceptron is to stack affine maps with nonlinear activations: $h_1 = \\phi(W_1x + b_1)$, $h_2 = \\phi(W_2h_1 + b_2)$, and $\\hat{y}=g(W_3h_2+b_3)$. Without $\\phi$, the whole stack collapses to one affine transformation, so depth adds parameters but not expressiveness.

A useful interview answer starts with the function class rather than the implementation. Hidden units learn intermediate basis functions: edges, conjunctions, thresholds, prototypes, or dense features depending on the data and objective. Depth lets the model reuse earlier features in later compositions, which is why a moderately deep network can represent certain hierarchical functions much more efficiently than a very wide shallow network.

### Computational graphs

Modern frameworks view a model as a directed acyclic graph of operations. Each node stores a value from the forward pass and a local derivative rule for the backward pass. If $u = W x + b$, $h = \\phi(u)$, $s = Vh+c$, and $L=\\ell(s,y)$, then backpropagation is reverse-mode automatic differentiation through the graph. The derivative of a final scalar loss with respect to many parameters is efficient because each edge contribution is reused.

| Object | Forward role | Backward role | Interview wording |
|---|---|---|---|
| Tensor value | Carries activations or parameters | Receives an adjoint $\\bar{x}=\\partial L/\\partial x$ | "the gradient flowing into this node" |
| Operation | Computes a local function | Multiplies by local Jacobian | "chain rule at one node" |
| Parameter | Learned value used in forward pass | Accumulates gradients across examples | "what the optimizer updates" |
| Loss | Scalar objective | Seeds reverse pass with $\\partial L/\\partial L=1$ | "training signal" |

## Backpropagation derivation

For a fully connected layer, use column vectors. Let

$$
z^{(l)} = W^{(l)}a^{(l-1)} + b^{(l)}, \\quad a^{(l)} = \\phi(z^{(l)}).
$$

Define the error signal $\\delta^{(l)} = \\partial L / \\partial z^{(l)}$. For the output layer, compute it directly from the loss. For cross-entropy with softmax, the elegant result is $\\delta^{(L)} = \\hat{p} - y$. For a hidden layer,

$$
\\delta^{(l)} = \\left((W^{(l+1)})^\\top\\delta^{(l+1)}\\right) \\odot \\phi'(z^{(l)}).
$$

The parameter gradients follow from the affine part:

$$
\\frac{\\partial L}{\\partial W^{(l)}} = \\delta^{(l)}(a^{(l-1)})^\\top, \\quad
\\frac{\\partial L}{\\partial b^{(l)}} = \\delta^{(l)}.
$$

For a minibatch, average or sum these outer products over examples depending on the framework convention. The important idea is not memorizing symbols; it is recognizing that every layer receives a gradient, transforms it by its local derivative, and passes a new gradient to the layer below.

### Worked example

Suppose a two-layer network receives two features, has three ReLU hidden units, and outputs two logits. One example has hidden preactivations $z=[2,-1,0.5]$. ReLU derivatives are $[1,0,1]$, so the middle unit is silent in the backward pass for this example. If the upstream gradient from the output layer is $g=[0.4,-0.2,0.7]$, then the gradient at hidden preactivations is $\\delta=g\\odot[1,0,1]=[0.4,0,0.7]$. The weight gradient for the first layer is an outer product of this vector with the input. A single inactive ReLU does not update for this example, but other examples may activate it.

> **Interview tip:** When asked to derive backprop, write the scalar loss, define $\\delta$, show the hidden-layer recurrence, and then state the weight-gradient outer product. This is usually enough to show real understanding.

> **Common pitfall:** Saying "backprop is gradient descent" mixes two steps. Backprop computes gradients; SGD, Adam, or another optimizer uses those gradients to update parameters.

## Initialization and signal propagation

Deep networks fail when activations or gradients shrink to zero or explode. Initialization tries to keep the variance of signals roughly stable from layer to layer. If inputs to a layer have variance $v$ and weights are independent with variance $\\sigma_w^2$, then the preactivation variance scales roughly like $\\text{fan\\_in}\\,\\sigma_w^2 v$. Xavier initialization uses variance near $2/(\\text{fan\\_in}+\\text{fan\\_out})$ and works well for tanh-like activations whose positive and negative outputs are balanced. He initialization uses variance near $2/\\text{fan\\_in}$ and is designed for ReLU-like activations, where about half the units are zero.

| Initialization | Typical activation | Variance target | Why it helps |
|---|---|---|---|
| Small random normal | Historical baseline | Often too small | Breaks symmetry but can shrink signals |
| Xavier / Glorot | tanh, sigmoid-ish hidden layers | $2/(fan_{in}+fan_{out})$ | Balances forward and backward variance |
| He / Kaiming | ReLU family | $2/fan_{in}$ | Compensates for half-rectification |
| Orthogonal | RNNs or very deep linear paths | Preserves norm in linear map | Reduces early directional collapse |

Symmetry breaking is the other reason random initialization matters. If all hidden units in a layer start with identical weights, they receive identical gradients and remain identical. Randomness gives each unit a different role; scaling keeps the randomness numerically useful.

## Vanishing and exploding gradients

The hidden-layer recurrence repeatedly multiplies by weight matrices and activation derivatives. If the average singular values of those Jacobians are below one, gradients vanish; if above one, they explode. Sigmoid and tanh saturate when $|z|$ is large, making $\\phi'(z)$ tiny. ReLU avoids saturation for positive inputs, but dead ReLUs can still stop learning when a unit stays negative for most data.

Practical mitigations include better initialization, residual connections, normalization, gradient clipping, gated recurrent units, and choosing activations with healthier derivatives. Residual connections are especially powerful because they create paths where the derivative includes an identity term: if $y=x+F(x)$, then $\\partial y/\\partial x = I + \\partial F/\\partial x$. Even when $F$ is poorly conditioned, the identity path gives gradients a route through the network.

### How to debug in practice

Look at distributions, not just a scalar loss. Track activation means and variances per layer, gradient norms per layer, the fraction of dead ReLUs, and whether logits are immediately huge. If loss is NaN, check learning rate, mixed-precision scaling, data normalization, and exploding gradients. If loss barely moves, check that gradients are nonzero, labels are aligned, and the final activation matches the loss. A common sanity test is to overfit a tiny batch; failure on ten examples usually means an implementation, data, or optimization bug.

## Interview checklist

A strong answer ties representation, differentiation, and optimization together. The perceptron gives linear separation; MLPs add nonlinear compositions. Backprop is reverse-mode differentiation on a computational graph and is efficient because it reuses intermediate adjoints. Initialization controls signal variance, while vanishing and exploding gradients explain why architecture choices such as ReLU, normalization, residual connections, and clipping matter. In an interview, move fluidly from equations to symptoms: a theory-only answer feels memorized, while a debugging-only answer may miss the mathematical reason.


## Deeper interview reasoning

When an interviewer asks about fundamentals, they often want to see whether you can move between three levels: scalar calculus, tensor shapes, and training behavior. For scalar calculus, show a tiny chain such as $L=(wx-y)^2$. The derivative is $\\partial L/\\partial w = 2(wx-y)x$, which already contains the idea of an upstream error multiplied by a local input. For tensor shapes, verify that $\\delta^{(l)}$ has the same length as the layer output and $\\delta^{(l)}(a^{(l-1)})^\\top$ matches the shape of $W^{(l)}$. Shape checks prevent many backprop mistakes.

A second useful lens is expressivity versus learnability. Universal approximation says a sufficiently wide network can approximate many functions, but it does not say gradient descent will find the representation efficiently, nor that the result will generalize. Depth is useful because it reuses intermediate features, yet depth also increases optimization difficulty. Initialization, normalization, residual connections, and good losses are the engineering answers to that difficulty.

### More worked intuition

Imagine a network predicting house price from area and distance to transit. A first-layer unit might learn a threshold-like feature for "large home," while another learns "close to transit." A second-layer unit can combine them into "large and convenient." Backprop assigns credit by asking how much each hidden feature changed the final error. If the model overpredicts, gradients push the output weights and earlier feature detectors in directions that reduce that overprediction on similar examples.

| Diagnostic | Likely cause | First response |
|---|---|---|
| All gradients zero | Saturation, detached graph, wrong loss | Inspect activations and autograd graph |
| Early NaNs | LR too high, bad normalization, overflow | Lower LR, clip, check input scale |
| Train loss cannot fit tiny batch | Bug in labels, model, loss, or optimizer | Overfit 10 examples and print gradients |
| Only last layer learns | Frozen parameters or broken gradient path | Check requires-grad and gradient norms |

> **Interview tip:** If you forget an equation, derive it from one layer. Preactivation gradient times previous activation gives a weight gradient; transposed weights propagate error backward.

> **Common pitfall:** Treating parameter count as capacity without considering inductive bias. A huge MLP on images ignores locality; a smaller CNN may generalize better because its structure matches the data.


### Final drill: explaining failures end to end

A useful way to close a fundamentals answer is to trace one failed run. Suppose loss is flat. First verify the data and target: labels aligned, features normalized, and the loss appropriate for the output. Then check forward statistics: activations should not all be identical, saturated, or zero. Next check backward statistics: every trainable parameter should receive finite gradients. Finally check the update: the optimizer should actually change parameters by a reasonable norm. This sequence mirrors the computational graph and prevents random guessing.

For classification, also check the final layer convention. Cross-entropy implementations usually expect raw logits, not probabilities already passed through softmax. Passing probabilities can weaken gradients and create numerical issues. For regression, output scale and target scale should be compatible; predicting prices in cents with unnormalized targets can create huge losses and unstable gradients.

In interviews, it is fine to state that deep learning practice is a stack of approximations. Initialization keeps early signals stable, but training soon changes distributions. Backprop gives exact gradients for the implemented computation, but the objective is only a proxy for real-world utility. Optimizers reduce training loss, but validation decides whether the learned function is useful. That balanced view sounds much stronger than claiming a single trick solves deep learning.
`,
    widgets: ["nn-playground"],
    flashcards: [
      { q: "What limitation of a single perceptron motivates multilayer networks?", a: "A perceptron creates one linear decision boundary. Multilayer networks combine affine maps with nonlinear activations, allowing non-linear and hierarchical decision surfaces." },
      { q: "Why is a nonlinearity required between linear layers?", a: "Without a nonlinearity, a stack of affine transformations is still one affine transformation: $W_2(W_1x+b_1)+b_2 = W x + b$." },
      { q: "What does backpropagation compute?", a: "Backpropagation computes gradients of a scalar loss with respect to intermediate activations and parameters using reverse-mode automatic differentiation." },
      { q: "Define the hidden-layer error signal $\\delta^{(l)}$.", a: "$\\delta^{(l)} = \\partial L / \\partial z^{(l)}$, the gradient of the loss with respect to preactivation values in layer $l$." },
      { q: "What is the weight gradient for a dense layer for one example?", a: "If $z^{(l)}=W^{(l)}a^{(l-1)}+b^{(l)}$, then $\\partial L/\\partial W^{(l)} = \\delta^{(l)}(a^{(l-1)})^\\top$." },
      { q: "Why does softmax plus cross-entropy have a simple gradient?", a: "The Jacobian terms simplify so the logit gradient is $\\hat{p}-y$, predicted probability minus one-hot target." },
      { q: "What is a computational graph?", a: "A graph of tensor operations where nodes store forward values and local derivative rules; reverse traversal applies the chain rule." },
      { q: "Why can identical initialization be harmful?", a: "Hidden units that start identical receive identical gradients, so they remain identical and waste capacity." },
      { q: "When is Xavier initialization commonly appropriate?", a: "For tanh or roughly symmetric activations; it uses variance near $2/(fan_{in}+fan_{out})$ to balance signal scale." },
      { q: "When is He initialization commonly appropriate?", a: "For ReLU-family activations; it uses variance near $2/fan_{in}$ to compensate for half the activations being zero." },
      { q: "What causes vanishing gradients?", a: "Repeated multiplication by Jacobians with small singular values or tiny activation derivatives, especially in saturated sigmoid/tanh networks." },
      { q: "What causes exploding gradients?", a: "Repeated multiplication by Jacobians with large singular values, causing gradient norms to grow rapidly through depth or time." },
      { q: "How do residual connections help gradient flow?", a: "For $y=x+F(x)$, the derivative includes an identity path, giving gradients a direct route even if $F$ is poorly conditioned." },
      { q: "What tiny-batch test is useful when debugging a network?", a: "Try to overfit a very small batch. If the model cannot, suspect a data, loss, gradient, or implementation bug." },
      { q: "Backprop vs optimizer: what is the distinction?", a: "Backprop computes gradients; the optimizer uses those gradients to update parameters." },
    ],
    quiz: [
      {
        q: "A stack of linear layers with no activation is equivalent to what?",
        options: ["A kernel machine", "A single affine transformation", "A nearest-neighbor model", "A recurrent network"],
        answer: 1,
        explanation: "Composing affine maps produces another affine map, so depth alone does not add nonlinear expressiveness.",
      },
      {
        q: "In a dense layer, why is the one-example weight gradient an outer product?",
        options: ["Because weights are shared across time", "Because ReLU is piecewise linear", "Because each weight connects one input activation to one output preactivation", "Because softmax normalizes logits"],
        answer: 2,
        explanation: "Each weight derivative is output error times input activation, which forms $\\delta a^\\top$.",
      },
      {
        q: "Which initialization is most associated with ReLU networks?",
        options: ["He / Kaiming", "All zeros", "Large uniform constants", "One-hot initialization"],
        answer: 0,
        explanation: "He initialization accounts for rectification by using variance about $2/fan_{in}$.",
      },
      {
        q: "What is the seed gradient for reverse-mode differentiation of a scalar loss $L$?",
        options: ["$0$", "$\\partial L/\\partial L = 1$", "$W^\\top W$", "The learning rate"],
        answer: 1,
        explanation: "Backprop starts from the scalar output with derivative one with respect to itself.",
      },
      {
        q: "Which symptom most suggests exploding gradients?",
        options: ["Training loss becomes NaN after a few steps", "Validation accuracy is slightly below training accuracy", "Features are sparse", "The dataset is imbalanced"],
        answer: 0,
        explanation: "NaNs or huge parameter updates commonly occur when gradients explode.",
      },
      {
        q: "Why can sigmoid activations make deep networks hard to train?",
        options: ["They are not differentiable anywhere", "They always produce zero output", "They saturate with tiny derivatives for large positive or negative inputs", "They require convolution"],
        answer: 2,
        explanation: "Saturation makes $\\phi^{\\prime}(z)$ close to zero, shrinking backpropagated gradients.",
      },
      {
        q: "What does an autograd computational graph primarily store for backprop?",
        options: ["Only class labels", "Forward values and local derivative relationships", "GPU memory addresses only", "The entire training set"],
        answer: 1,
        explanation: "Backprop needs forward intermediates and operation rules to apply the chain rule.",
      },
      {
        q: "Which statement about backpropagation is correct?",
        options: ["It chooses the learning rate automatically", "It is reverse-mode differentiation applied to a computational graph", "It prevents overfitting by itself", "It requires discrete activations"],
        answer: 1,
        explanation: "Backprop is the gradient-computation algorithm; optimization and regularization are separate choices.",
      },
    ],
    resources: [
      { title: "Dive into Deep Learning", url: "https://d2l.ai/", type: "book" },
      { title: "Karpathy Neural Networks: Zero to Hero", url: "https://karpathy.ai/zero-to-hero.html", type: "course" },
      { title: "Stanford CS231n", url: "https://cs231n.github.io/", type: "course" },
      { title: "Understanding the difficulty of training deep feedforward neural networks", url: "https://proceedings.mlr.press/v9/glorot10a.html", type: "paper" },
      { title: "Delving Deep into Rectifiers", url: "https://arxiv.org/abs/1502.01852", type: "paper" },
    ],
  },
  {
    id: "activations-normalization-regularization",
    title: "Activations, Normalization & Regularization",
    category: "Deep Learning",
    summary: "Activation functions shape gradient flow, normalization controls feature statistics, and regularization constrains what a network can memorize. This topic compares the choices interviewers most often ask about in modern deep learning systems.",
    notes: `
## Why these layers matter

A deep network is not just matrix multiplication. Activations decide which nonlinear features can be represented, normalization changes the scale and conditioning of those features, and regularization changes the set of solutions the optimizer prefers. These choices often determine whether a model trains smoothly, generalizes, and remains stable when moved from a notebook to production. In interviews, a strong answer names the component and explains its effect on optimization and generalization.

Activations are local nonlinear functions. Normalization layers compute statistics across a batch, sequence, or feature dimension and use learned scale and shift parameters. Regularizers inject noise, constraints, or penalties so the model does not rely on brittle memorization. They interact: a high dropout rate can change activation statistics, normalization can reduce sensitivity to initialization, and weight decay can behave differently under Adam versus SGD.

## Activation functions

The classic sigmoid $\\sigma(x)=1/(1+e^{-x})$ maps values to $(0,1)$, which is useful for probabilities but poor as a default hidden activation in deep networks because it saturates. Tanh is zero-centered but still saturates. ReLU, $\\max(0,x)$, became popular because positive inputs have derivative one and computation is cheap. Its weakness is the dead-unit problem: if a unit receives mostly negative preactivations, its gradient is zero.

Modern transformer-like networks often use smooth activations such as GELU and SiLU. SiLU is $x\\sigma(x)$; GELU approximates $x\\Phi(x)$, where $\\Phi$ is the standard normal CDF. These functions preserve small negative information instead of hard-clipping it, which can improve optimization in large models.

| Activation | Formula / idea | Strength | Risk |
|---|---|---|---|
| ReLU | $\\max(0,x)$ | Sparse, cheap, strong gradients for positive inputs | Dead units; nonzero-centered outputs |
| Leaky ReLU | $\\max(\\alpha x,x)$ | Keeps gradient for negative inputs | Extra hyperparameter; less common in LLMs |
| GELU | $x\\Phi(x)$ | Smooth gating used in transformers | Slightly more expensive |
| SiLU / Swish | $x\\sigma(x)$ | Smooth, non-monotonic, strong in efficient nets | Can be slower than ReLU |
| Tanh | Bounded $[-1,1]$ | Useful in gates and normalized outputs | Saturation causes vanishing gradients |

> **Interview tip:** If asked "best activation," avoid a universal answer. Say ReLU is a reliable baseline for many feedforward and CNN models, GELU or SiLU are common in transformers and modern architectures, and the choice depends on stability, speed, and architecture conventions.

## Normalization: BatchNorm, LayerNorm, RMSNorm

Normalization reduces internal scale drift and often improves conditioning. BatchNorm normalizes each feature using statistics across the minibatch and spatial positions, then applies learned $\\gamma$ and $\\beta$:

$$
\\hat{x}_{i,j}=\\frac{x_{i,j}-\\mu_j}{\\sqrt{\\sigma_j^2+\\epsilon}}, \\quad y_{i,j}=\\gamma_j\\hat{x}_{i,j}+\\beta_j.
$$

It works extremely well in convolutional networks because batches contain many examples and pixels. At inference, BatchNorm uses running estimates collected during training. This train/eval distinction is a common source of bugs.

LayerNorm normalizes across features within each example. It does not depend on other examples in the batch, so it is natural for variable-length sequences, autoregressive inference, and transformers. RMSNorm simplifies LayerNorm by normalizing by root mean square without subtracting the mean:

$$
\\text{RMSNorm}(x)=\\frac{x}{\\sqrt{\\frac{1}{d}\\sum_i x_i^2+\\epsilon}}\\odot g.
$$

RMSNorm is popular in LLMs because it is cheaper and often sufficient when mean-centering is not essential.

| Layer | Normalizes over | Common use | Inference behavior |
|---|---|---|---|
| BatchNorm | Batch and sometimes spatial dimensions per channel | CNNs, vision backbones | Uses running statistics |
| LayerNorm | Features within one example/token | Transformers, RNNs | Same calculation in train and eval |
| RMSNorm | Feature RMS within one example/token | Modern LLM blocks | Same calculation, fewer operations |

## Regularization mechanisms

Dropout randomly zeros activations during training. If a hidden activation is kept with probability $p$, inverted dropout scales kept values by $1/p$ so the expected activation remains similar at train and eval time. Dropout can be interpreted as training an ensemble of subnetworks that share weights, but practically it prevents fragile co-adaptations. It is less dominant in very large models trained on huge data, yet still useful for smaller data regimes.

Weight decay penalizes large weights. For SGD with L2 regularization, adding $\\lambda \\|w\\|_2^2/2$ to the loss produces an update term $-\\eta\\lambda w$. For adaptive optimizers, decoupled weight decay is preferred because the penalty should shrink weights directly rather than pass through Adam's per-parameter scaling. That distinction is why AdamW became the default in many transformer recipes.

Other regularizers include data augmentation, early stopping, label smoothing, stochastic depth, mixup, and noise injection. The common thread is to bias learning toward functions that remain stable under plausible perturbations.

### Worked example: dropout expectation

Suppose an activation vector is $a=[2,4]$ and keep probability is $p=0.5$. In inverted dropout, a mask $m$ has entries 0 or 1 and the training activation is $a\\odot m / p$. If both units are kept, the vector becomes $[4,8]$; if one is kept, the surviving value doubles; if none are kept, it is $[0,0]$. Across many masks, the expectation returns $[2,4]$. That is why inference can simply use the raw activations without extra scaling.

> **Common pitfall:** Applying dropout during evaluation corrupts predictions. Forgetting to switch BatchNorm to evaluation mode is similarly dangerous because batch statistics from a single request can shift outputs.

## Interactions and practical decisions

For CNNs, a typical block historically used convolution, BatchNorm, and ReLU. For transformers, a typical block uses LayerNorm or RMSNorm, attention/MLP sublayers, residual connections, and GELU or SiLU-family activations. BatchNorm struggles with very small batches, distributed training with unsynchronized statistics, and autoregressive single-token inference. LayerNorm is stable for sequence models but may not provide the same regularizing effect that noisy batch statistics give CNNs.

When diagnosing overfitting, compare train and validation curves. If train loss keeps dropping while validation loss rises, add or strengthen regularization: more data augmentation, weight decay, dropout, early stopping, or a smaller model. If both losses are high, regularization may be too strong or the model may be underpowered. If training is unstable, first check learning rate, normalization placement, initialization, and activation saturation before adding more regularizers.

## Interview checklist

A polished explanation separates three questions. First, what nonlinear shape does the activation provide, and what derivatives does it create? Second, what statistics does the normalization layer compute, and are they batch-dependent? Third, what behavior is the regularizer discouraging? You should be able to say why ReLU is fast but can die, why GELU/SiLU are smoother, why BatchNorm is common in vision, why LayerNorm/RMSNorm dominate LLMs, why inverted dropout needs no inference scaling, and why AdamW decouples weight decay from adaptive gradient moments.


## Choosing components under constraints

The right activation, normalization, and regularization depend on batch size, architecture, data volume, and deployment. In a small CNN trained from scratch, BatchNorm can speed training and act as mild regularization through noisy batch statistics. In an autoregressive LLM serving one token at a time, batch-dependent statistics would make outputs depend on unrelated requests, so LayerNorm or RMSNorm is safer. In a tabular MLP with limited data, dropout and weight decay may help; in a very large pretrained model, heavy dropout during fine-tuning may erase useful representations.

Activation choice also affects numeric range. ReLU has unbounded positive outputs, so normalization or careful initialization keeps scales manageable. GELU and SiLU are smooth gates; they allow small negative responses and avoid the hard discontinuity at zero, but they are not automatically better for every model. If inference latency is strict, a cheaper activation may be worth a small quality trade-off.

### Regularization as bias design

Regularization is best understood as choosing which functions are plausible before seeing validation data. Weight decay prefers smaller weights. Dropout prefers redundancy rather than dependence on one hidden unit. Data augmentation says labels should be stable under certain transformations. Label smoothing says the model should not assign absolute certainty to one class when annotation noise or class overlap exists. Early stopping says later optimization may fit noise more than signal.

| Situation | Helpful lever | Why |
|---|---|---|
| Tiny dataset, large MLP | Weight decay, dropout, early stopping | Reduces memorization |
| Vision with label-preserving transforms | Augmentation, MixUp, CutMix | Encodes invariances |
| Transformer pretraining | AdamW, LayerNorm/RMSNorm, moderate decay | Stable large-scale optimization |
| Small batch training | LayerNorm/GroupNorm over BatchNorm | Avoids noisy batch statistics |

A subtle point is that regularization can be too strong. If both training and validation loss are poor, increasing dropout may worsen underfitting. If only validation is poor, regularization or more data may help. Interviews often reward this conditional reasoning more than a list of techniques.

> **Interview tip:** For each method, state whether it changes training only, inference only, or both. Dropout is training-time stochasticity; weight decay changes optimization; normalization layers may have different train/eval behavior.

> **Common pitfall:** Adding BatchNorm after every layer without considering sequence length, batch size, or train/eval mode. The wrong normalization can create nondeterministic or request-dependent inference.


### Final drill: comparing two model recipes

Consider two recipes for the same classifier. Recipe A uses ReLU, BatchNorm, strong image augmentation, and moderate weight decay. Recipe B uses GELU, LayerNorm, little augmentation, and high dropout. Neither is automatically superior. Recipe A sounds like a conventional CNN recipe where spatial augmentation encodes invariances and BatchNorm works because batches contain many images. Recipe B sounds closer to a transformer or MLP-style recipe, but high dropout may underfit if data is already large or if the model is pretrained.

This style of comparison is valuable in interviews because it shows you can map components to assumptions. BatchNorm assumes meaningful batch statistics. LayerNorm assumes per-example feature normalization is enough. Dropout assumes co-adaptation is a major risk. Weight decay assumes smaller weights are preferable. Activation choice assumes certain gradient and smoothness properties.

Also remember calibration. Regularization can improve accuracy while hurting or helping probability calibration depending on the setting. Label smoothing often improves overconfidence but can make probabilities underconfident. Dropout at inference can be used deliberately for approximate uncertainty in Monte Carlo dropout, but ordinary deterministic inference should disable it.

A concise closing answer: choose stable activations, normalize along dimensions that are valid at inference, regularize according to the gap between train and validation behavior, and verify with the deployment metric rather than folklore.
`,
    widgets: ["activations"],
    flashcards: [
      { q: "Why are nonlinear activations necessary?", a: "They prevent the network from collapsing into a single affine map and allow it to model nonlinear relationships." },
      { q: "What is the main advantage of ReLU?", a: "For positive inputs, its derivative is one, which helps gradient flow; it is also computationally cheap and creates sparse activations." },
      { q: "What is a dead ReLU?", a: "A ReLU unit that receives negative preactivations for nearly all inputs, producing zero output and zero gradient." },
      { q: "Why are GELU and SiLU popular in modern networks?", a: "They are smooth gating-like activations that preserve some negative information and often optimize well in transformer or efficient architectures." },
      { q: "How does BatchNorm compute normalization statistics?", a: "It normalizes each feature/channel using minibatch statistics, then applies learned scale and shift." },
      { q: "Why can BatchNorm be problematic for small batches?", a: "Batch statistics become noisy or unrepresentative, causing unstable training and train/test mismatch." },
      { q: "How does LayerNorm differ from BatchNorm?", a: "LayerNorm normalizes across features within each example/token, so it does not depend on other batch examples." },
      { q: "What does RMSNorm remove from LayerNorm?", a: "It normalizes by root mean square but does not subtract the mean, reducing computation while preserving scale control." },
      { q: "What is inverted dropout?", a: "During training, kept activations are divided by keep probability $p$, so their expectation matches inference-time activations." },
      { q: "What does weight decay encourage?", a: "Smaller weight norms, which usually biases the model toward smoother or less complex solutions." },
      { q: "Why is AdamW different from L2 regularization inside Adam?", a: "AdamW decouples weight shrinkage from adaptive gradient scaling, making the decay behave more predictably." },
      { q: "What is label smoothing?", a: "A regularizer that replaces hard one-hot labels with slightly softened targets to reduce overconfidence." },
      { q: "When should dropout usually be disabled?", a: "During evaluation and inference; otherwise predictions become randomly corrupted." },
      { q: "Which normalization is common in transformers?", a: "LayerNorm or RMSNorm, because they are independent of batch statistics and work naturally per token." },
      { q: "How do you tell overfitting from underfitting in curves?", a: "Overfitting has low training loss but worse validation loss; underfitting has both losses high." },
    ],
    quiz: [
      {
        q: "Which activation is most likely to produce exactly zero gradient for negative preactivations?",
        options: ["GELU", "ReLU", "SiLU", "Tanh near zero"],
        answer: 1,
        explanation: "ReLU is exactly zero for negative inputs, so its local derivative is also zero there.",
      },
      {
        q: "BatchNorm most directly depends on which training-time quantity?",
        options: ["The vocabulary size", "Minibatch statistics", "The number of optimizer steps only", "Beam width"],
        answer: 1,
        explanation: "BatchNorm computes mean and variance from the current minibatch during training.",
      },
      {
        q: "LayerNorm is especially convenient for autoregressive transformers because it:",
        options: ["Requires labels during inference", "Uses running batch statistics", "Normalizes within each token/example rather than across the batch", "Can only be used with convolutions"],
        answer: 2,
        explanation: "Autoregressive inference may process one token at a time, so batch-independent normalization is useful.",
      },
      {
        q: "In inverted dropout with keep probability $p$, kept activations are scaled by:",
        options: ["$p$", "$1-p$", "$1/p$", "$p^2$"],
        answer: 2,
        explanation: "Scaling by $1/p$ keeps the expected activation unchanged.",
      },
      {
        q: "Why is AdamW preferred over naive L2 regularization with Adam?",
        options: ["It removes the need for gradients", "It decouples weight decay from adaptive moment scaling", "It only works for CNNs", "It makes dropout unnecessary"],
        answer: 1,
        explanation: "Decoupling makes the shrinkage a direct parameter update rather than an Adam-scaled gradient term.",
      },
      {
        q: "RMSNorm differs from LayerNorm mainly by:",
        options: ["Using batch statistics", "Removing the learned scale", "Normalizing by RMS without mean subtraction", "Requiring convolution"],
        answer: 2,
        explanation: "RMSNorm controls scale through root mean square and typically retains a learned scale.",
      },
      {
        q: "Which action is most likely to reduce overfitting?",
        options: ["Increase dropout or data augmentation", "Train with labels shuffled at random", "Disable validation", "Use a much larger learning rate without checking stability"],
        answer: 0,
        explanation: "Dropout and augmentation are common regularization strategies.",
      },
      {
        q: "What is a common BatchNorm deployment bug?",
        options: ["Using too many attention heads", "Leaving the model in training mode so request batches change predictions", "Forgetting to tokenize text", "Using cosine similarity"],
        answer: 1,
        explanation: "Training mode uses current batch statistics, which can make inference unstable.",
      },
    ],
    resources: [
      { title: "Dive into Deep Learning", url: "https://d2l.ai/", type: "book" },
      { title: "Stanford CS231n", url: "https://cs231n.github.io/", type: "course" },
      { title: "Batch Normalization", url: "https://arxiv.org/abs/1502.03167", type: "paper" },
      { title: "Layer Normalization", url: "https://arxiv.org/abs/1607.06450", type: "paper" },
      { title: "Root Mean Square Layer Normalization", url: "https://arxiv.org/abs/1910.07467", type: "paper" },
      { title: "Decoupled Weight Decay Regularization", url: "https://arxiv.org/abs/1711.05101", type: "paper" },
    ],
  },
  {
    id: "optimizers-training-dynamics",
    title: "Optimizers & Training Dynamics",
    category: "Deep Learning",
    summary: "Training dynamics connect gradient estimates, learning-rate schedules, optimizer state, precision, and batch size. This topic prepares you to explain why a model converges, diverges, plateaus, or generalizes differently under common training recipes.",
    notes: `
## Optimization versus learning

Deep learning training is empirical risk minimization with noisy gradients. Given parameters $\\theta$ and minibatch loss $L_B(\\theta)$, the optimizer repeatedly computes $g_t = \\nabla_\\theta L_B(\\theta_t)$ and updates $\\theta_t$. The goal is not simply to minimize training loss as fast as possible; it is to reach a solution that generalizes. Optimizer choice changes the path through parameter space, and the path can influence the final model even when many solutions fit the training data.

Plain stochastic gradient descent updates $\\theta_{t+1}=\\theta_t-\\eta g_t$. Its strengths are simplicity, low memory, and often strong generalization. Its weaknesses are sensitivity to learning rate and slow movement through ravines, where curvature is steep in one direction and shallow in another.

## Momentum, Adam, and AdamW

Momentum keeps an exponential moving average of gradients:

$$
v_t = \\mu v_{t-1} + g_t, \\quad \\theta_{t+1}=\\theta_t-\\eta v_t.
$$

This accelerates consistent directions and damps oscillations. Nesterov momentum evaluates a lookahead gradient, which can be interpreted as correcting the step before fully committing.

Adam tracks first and second moments:

$$
m_t=\\beta_1m_{t-1}+(1-\\beta_1)g_t, \\quad v_t=\\beta_2v_{t-1}+(1-\\beta_2)g_t^2.
$$

After bias correction, Adam updates roughly with $\\hat{m}_t/(\\sqrt{\\hat{v}_t}+\\epsilon)$. Parameters with consistently large gradient magnitudes receive smaller effective steps; parameters with small gradients receive relatively larger ones. This adaptivity makes Adam forgiving and effective for transformers, sparse features, and early experimentation. AdamW adds decoupled weight decay, shrinking weights directly instead of treating decay as part of the adaptive gradient.

| Optimizer | State | Strength | Watch out |
|---|---|---|---|
| SGD | None | Simple, memory-light, good baselines | Needs careful LR; slow in ill-conditioned areas |
| SGD + momentum | Velocity | Faster along consistent directions | Momentum can overshoot if LR is high |
| Adam | First and second moments | Robust defaults, adaptive per parameter | Coupled L2 decay can be unintuitive |
| AdamW | Adam state plus direct decay | Transformer default, cleaner regularization | More memory than SGD |

> **Interview tip:** If asked which optimizer to use, state a default and a reason: AdamW for modern transformer-style models and fast iteration; SGD with momentum remains competitive for many vision settings when tuned carefully.

## Learning-rate schedules

The learning rate is often more important than the optimizer brand. Too high causes divergence or loss spikes; too low wastes compute or lands in sharp, poor regions. Warmup gradually increases the learning rate during early steps, helping when weights, optimizer moments, and normalization statistics are not yet calibrated. After warmup, cosine decay smoothly reduces the rate:

$$
\\eta_t = \\eta_{min} + \\frac{1}{2}(\\eta_{max}-\\eta_{min})\\left(1+\\cos\\left(\\frac{\\pi t}{T}\\right)\\right).
$$

Cosine schedules avoid abrupt drops and are easy to scale with a training budget. Step decay is still common in classic CNN recipes. One-cycle schedules briefly raise and then lower the learning rate, using high rates as a regularizer.

### Gradient clipping

Gradient clipping prevents an update from becoming too large. Global norm clipping rescales gradients when $\\|g\\|_2 > c$:

$$
g \\leftarrow g\\frac{c}{\\max(c,\\|g\\|_2)}.
$$

It is especially useful for recurrent models, transformers during unstable phases, and mixed-precision training. Clipping is not a substitute for a reasonable learning rate; if clipping happens every step, the optimizer is probably being driven too hard.

## Mixed precision

Mixed precision uses lower-precision arithmetic, commonly FP16 or BF16, to increase throughput and reduce memory. The challenge is numeric range. FP16 can underflow small gradients or overflow large activations, so training often uses loss scaling: multiply the loss by a scale before backprop, then unscale gradients before the optimizer step. BF16 has fewer mantissa bits but a wider exponent range, making it more robust for deep learning.

A typical stable recipe keeps master weights or optimizer states in FP32, performs many matrix multiplications in lower precision, applies dynamic loss scaling when needed, and checks for NaNs before stepping. Interviewers may ask why inference can be easier than training: inference has no backward pass and fewer tiny gradient values, so reduced precision is less risky.

## Batch size effects

A minibatch gradient is a noisy estimate of the full gradient. Small batches inject more noise, which can help escape sharp basins and improve generalization, but they underuse hardware. Large batches improve throughput and produce smoother gradients, but they often require learning-rate scaling and warmup. The linear scaling rule suggests increasing $\\eta$ roughly proportionally to batch size over a limited range, while the square-root rule is more conservative.

There is also a distinction between physical batch size and effective batch size. Gradient accumulation can simulate a larger batch by accumulating gradients over several microbatches before stepping. However, BatchNorm and some regularizers still see the physical microbatch, so equivalence is not perfect.

> **Common pitfall:** Comparing batch sizes without holding training tokens, augmentation, learning-rate schedule, and number of optimizer updates constant can lead to wrong conclusions. Batch size changes both gradient noise and the optimization budget.

## Worked debugging examples

If loss explodes in the first hundred steps, reduce learning rate, add or lower warmup peak, inspect data scaling, and enable clipping. If training is stable but validation is poor, tune weight decay, augmentation, dropout, and total training time rather than only changing optimizer. If AdamW trains but SGD does not, the model may need different normalization, learning-rate schedule, or more careful initialization. If mixed precision produces NaNs but FP32 does not, inspect loss scaling, softmax logits, normalization epsilons, and any custom operations.

## Interview checklist

A complete answer describes the update equation, the state held by the optimizer, and the failure mode it addresses. Momentum smooths directions; Adam adapts per parameter using moment estimates; AdamW decouples decay. Warmup protects early training, cosine decay spends large steps early and fine steps late, clipping caps rare gradient spikes, mixed precision trades numeric care for speed, and batch size controls both hardware efficiency and gradient noise. Always connect a recipe to an observed curve rather than presenting it as magic.


## Reading training curves

Optimizer questions often become debugging questions. If training loss descends smoothly but validation loss worsens, the optimizer is doing its job on the training set and the problem is generalization. Consider stronger data augmentation, weight decay, early stopping, or a smaller model. If training loss oscillates or spikes, the step size is too aggressive for the curvature or gradient noise. Lower the peak learning rate, lengthen warmup, or add clipping. If loss decreases very slowly, the learning rate may be too low, gradients may be poorly scaled, or the model may be underparameterized.

Learning-rate range tests are useful because they expose a stable interval. Start with a tiny learning rate, increase it over a short run, and watch where loss begins falling and where it diverges. The final schedule should spend much of training in the productive region and decay before convergence. Warmup is not a ceremonial first phase; it prevents early optimizer moments and activations from being hit by a full-strength step before they are calibrated.

### Interactions that matter

Batch size, learning rate, weight decay, gradient clipping, and precision interact. A larger batch has lower gradient noise and may tolerate a larger learning rate, but it also makes each optimizer step represent more data, so the number of updates per epoch changes. Weight decay that works for one schedule may be too strong for another because parameters experience different numbers and sizes of shrinkage steps. Mixed precision can reveal numerically unstable softmaxes or normalizers that looked fine in FP32.

| Symptom | Likely lever | Explanation |
|---|---|---|
| Divergence after warmup | Lower peak LR or add clipping | Updates are too large after ramp |
| Good train loss, poor validation | Decay, augmentation, dropout | Generalization issue |
| No progress and tiny gradients | Check scale/init/loss | Optimization signal is weak |
| NaNs only in FP16 | Loss scaling or BF16 | Numeric range problem |

A production training run should log more than loss. Track gradient norm, parameter norm, learning rate, loss scale, examples per second, skipped steps, and validation slices. These signals tell you whether the optimizer is healthy before final metrics arrive.

> **Interview tip:** When comparing AdamW and SGD, mention memory. AdamW stores moment vectors, often doubling optimizer-state memory relative to parameters; SGD with momentum is lighter.

> **Common pitfall:** Treating gradient clipping as a way to use any learning rate. If every step clips, the effective optimizer is no longer the one you intended.


### Final drill: selecting a training recipe

For a new transformer, a reasonable starting recipe is AdamW, linear warmup, cosine decay, gradient clipping, mixed precision with BF16 if available, and a batch size chosen to saturate hardware without hurting validation. For a classic image classifier, SGD with momentum or AdamW can both be defended; the choice depends on baseline conventions, tuning budget, and regularization. For a tiny tabular neural net, simpler optimizers and smaller learning rates may be safer than copying a giant-model recipe.

When asked how to tune, change one major variable at a time and keep a baseline. Start with learning rate because it controls whether training works at all. Then tune batch size and weight decay because they affect both optimization and generalization. Tune schedule length with the compute budget. Only after the run is stable should you chase smaller gains from beta values, epsilon, or exotic optimizers.

Distributed training adds another layer. Data parallelism increases effective batch size; gradient synchronization can hide communication cost; gradient accumulation changes update frequency; checkpointing trades compute for memory. These systems choices can alter optimization, so record the effective batch, number of tokens or examples, number of optimizer steps, and schedule in experiment logs.

A strong interview conclusion is: optimizer state defines the update, schedule defines step sizes over time, batch size defines gradient noise and hardware use, precision defines numeric risk, and monitoring tells you which assumption failed.
`,
    widgets: ["lr-schedule"],
    flashcards: [
      { q: "What is the SGD update?", a: "$\\theta_{t+1}=\\theta_t-\\eta g_t$, where $g_t$ is a stochastic gradient from a minibatch." },
      { q: "What does momentum add to SGD?", a: "An exponential moving average of gradients that accelerates consistent directions and reduces oscillation." },
      { q: "What moments does Adam track?", a: "Adam tracks an EMA of gradients (first moment) and squared gradients (second moment)." },
      { q: "Why is Adam called adaptive?", a: "It scales each parameter update by an estimate of recent gradient magnitude, creating parameter-specific effective learning rates." },
      { q: "Why is AdamW often preferred?", a: "It decouples weight decay from Adam's adaptive gradient scaling, making regularization more predictable." },
      { q: "What is learning-rate warmup?", a: "A schedule that gradually increases the learning rate at the beginning of training to avoid unstable early updates." },
      { q: "What is cosine decay?", a: "A smooth schedule that decreases the learning rate following a cosine curve over the training budget." },
      { q: "What does gradient clipping do?", a: "It rescales or caps gradients when they exceed a threshold, preventing excessively large updates." },
      { q: "When is gradient clipping especially useful?", a: "For RNNs, transformers with occasional spikes, unstable early training, and mixed-precision recipes." },
      { q: "What is mixed-precision training?", a: "Using lower precision such as FP16/BF16 for speed and memory while preserving stability with FP32 states or loss scaling." },
      { q: "Why is BF16 often easier than FP16?", a: "BF16 has a wider exponent range, reducing overflow and underflow problems, though it has fewer mantissa bits." },
      { q: "What is effective batch size?", a: "The number of examples contributing to one optimizer update, including gradient accumulation across microbatches." },
      { q: "How does larger batch size affect gradient noise?", a: "It reduces gradient noise, which can improve throughput but may require LR scaling and can affect generalization." },
      { q: "What does it mean if clipping activates every step?", a: "The learning rate, loss scale, or model/data setup is likely too unstable; clipping should handle spikes, not all updates." },
      { q: "Why can optimizer path matter in deep learning?", a: "Nonconvex and overparameterized models have many fitting solutions; the update path influences which solution and generalization behavior is reached." },
    ],
    quiz: [
      {
        q: "Momentum primarily helps SGD by:",
        options: ["Averaging labels", "Accumulating a velocity in consistent gradient directions", "Removing the need for backprop", "Changing classification metrics"],
        answer: 1,
        explanation: "Momentum uses a running velocity to smooth noisy gradients and accelerate persistent directions.",
      },
      {
        q: "Adam uses the second moment estimate mainly to:",
        options: ["Normalize updates by recent squared gradient magnitude", "Compute validation accuracy", "Store training examples", "Apply dropout masks"],
        answer: 0,
        explanation: "The $v_t$ term estimates squared gradients and scales updates.",
      },
      {
        q: "Why is warmup commonly used in large-model training?",
        options: ["To increase vocabulary size", "To avoid unstable large updates before moments and activations settle", "To freeze all layers permanently", "To remove weight decay"],
        answer: 1,
        explanation: "Early training can be fragile; warmup ramps the learning rate gradually.",
      },
      {
        q: "Global norm clipping with threshold $c$ does what when $\\|g\\|_2>c$?",
        options: ["Sets all gradients to zero", "Rescales the gradient vector to have norm near $c$", "Doubles the learning rate", "Changes labels"],
        answer: 1,
        explanation: "The vector direction is preserved while its magnitude is capped.",
      },
      {
        q: "Which precision format usually has wider exponent range than FP16?",
        options: ["INT4", "BF16", "Binary", "UTF-8"],
        answer: 1,
        explanation: "BF16 keeps an exponent range similar to FP32, improving dynamic range.",
      },
      {
        q: "Gradient accumulation is used to:",
        options: ["Simulate a larger effective batch across microbatches", "Avoid computing gradients", "Change the model architecture at inference", "Sort examples by loss only"],
        answer: 0,
        explanation: "Accumulating gradients before stepping increases the number of examples per optimizer update.",
      },
      {
        q: "A cosine LR schedule is best described as:",
        options: ["A hard-coded random seed", "A smooth decay from high to low learning rate", "A normalization layer", "A tokenizer"],
        answer: 1,
        explanation: "Cosine decay gradually lowers the LR across the training budget.",
      },
      {
        q: "If mixed-precision training gives NaNs but FP32 does not, a likely area to inspect is:",
        options: ["Loss scaling and overflow/underflow", "The README title", "Only the test-set labels", "The number of CPU cores listed by the OS"],
        answer: 0,
        explanation: "Reduced precision can overflow/underflow, so loss scaling and numerically sensitive ops matter.",
      },
    ],
    resources: [
      { title: "Dive into Deep Learning", url: "https://d2l.ai/", type: "book" },
      { title: "Adam: A Method for Stochastic Optimization", url: "https://arxiv.org/abs/1412.6980", type: "paper" },
      { title: "Decoupled Weight Decay Regularization", url: "https://arxiv.org/abs/1711.05101", type: "paper" },
      { title: "Cyclical Learning Rates for Training Neural Networks", url: "https://arxiv.org/abs/1506.01186", type: "paper" },
      { title: "Training Deep Nets with Sublinear Memory Cost", url: "https://arxiv.org/abs/1604.06174", type: "paper" },
    ],
  },
  {
    id: "convolutional-networks-computer-vision",
    title: "Convolutional Networks & Computer Vision",
    category: "Deep Learning",
    summary: "Convolutional networks exploit spatial locality and weight sharing, while modern vision also includes residual networks, transformers, detection, segmentation, and augmentation. This topic emphasizes the math and design trade-offs behind practical computer-vision models.",
    notes: `
## Convolution as a learned local operator

Images have structure: neighboring pixels are related, objects can appear at different locations, and low-level patterns such as edges repeat across the field of view. A fully connected layer ignores these facts and uses a different parameter for every pixel-position relationship. A convolutional layer instead learns a small kernel and applies it at every spatial location. For a 2D input $X$ and kernel $K$, one output channel can be written as

$$
Y[i,j] = \\sum_{u=0}^{k_h-1}\\sum_{v=0}^{k_w-1} K[u,v] X[i+u,j+v].
$$

Deep-learning libraries often implement cross-correlation rather than mathematically flipped convolution, but the learned kernel absorbs the distinction. The key properties are locality, weight sharing, and translation equivariance: shifting the input shifts the feature map in a predictable way.

## Channels, stride, padding, and receptive field

Real CNN layers use multiple input and output channels. A kernel for one output channel has shape $C_{in}\\times k_h\\times k_w$, and a layer with $C_{out}$ output channels learns $C_{out}$ such kernels. Padding controls border behavior, stride controls downsampling, and dilation spaces kernel elements apart to expand context without increasing parameter count.

Receptive field is the region of input that can influence a feature. Stacking two $3\\times3$ convolutions gives an effective $5\\times5$ receptive field with fewer parameters and extra nonlinearities compared with one $5\\times5$ layer. In practice, the theoretical receptive field may be larger than the effective receptive field because central paths can dominate gradients.

| Design choice | Effect | Trade-off |
|---|---|---|
| Larger kernel | More local context per layer | More parameters and compute |
| Stride > 1 | Downsamples feature maps | Can lose fine detail |
| Padding | Preserves spatial size | Border values are artificial |
| Dilation | Expands receptive field | Can create gridding artifacts |
| Depthwise separable conv | Reduces compute | May need pointwise mixing for accuracy |

### Pooling and invariance

Pooling summarizes nearby activations. Max pooling keeps the strongest response; average pooling smooths. Pooling and strided convolution make representations less sensitive to small translations, but they also discard precise location information. Classification benefits from invariance, while detection and segmentation need localization, so modern architectures often downsample carefully and preserve multi-scale features.

> **Interview tip:** Use the words equivariance and invariance precisely. Convolution is translation equivariant; pooling and global aggregation move the model toward translation invariance.

## Residual networks

Very deep CNNs became easier to train with residual blocks. A residual block learns $y=x+F(x)$ instead of $y=F(x)$. If the best transformation is close to identity, the block can set $F(x)$ near zero. Gradients also have a direct path through the addition. ResNets made depth a practical scaling dimension for vision and influenced later transformer blocks, which also rely on residual connections.

BatchNorm and ReLU placement matter. Original ResNets used post-activation blocks; later pre-activation variants place normalization and activation before convolutions, improving gradient flow. Bottleneck blocks use $1\\times1$ convolutions to reduce and then restore channel dimensions around a $3\\times3$ convolution, saving compute.

## Vision transformers

Vision Transformers split an image into patches, flatten each patch, project it into a token embedding, add positional information, and apply a transformer encoder. A ViT patch is like a learned, non-overlapping convolution with stride equal to patch size. Self-attention lets any patch interact with any other patch in one layer, which helps global reasoning but has quadratic cost in the number of patches.

CNNs bake in locality and translation bias; ViTs rely more on data, pretraining, and augmentation. Hybrid systems combine convolutional stems, hierarchical attention, or windowed attention to manage cost and improve sample efficiency.

| Model family | Inductive bias | Strength | Weakness |
|---|---|---|---|
| Classic CNN | Locality, weight sharing | Data-efficient, fast feature extraction | Global context needs depth |
| ResNet | CNN bias plus residual depth | Strong supervised baseline | Still grid-local by default |
| ViT | Patch tokens with global attention | Scales well with pretraining | Quadratic attention and weaker locality bias |
| Hybrid | Mixes conv and attention | Balances local and global cues | More design complexity |

## Detection and segmentation overview

Classification assigns one label or distribution to an image. Object detection predicts boxes and classes. Two-stage detectors generate region proposals and classify/refine them; one-stage detectors predict dense boxes directly. Anchor-based methods define candidate boxes of different scales and aspect ratios, while anchor-free methods predict object centers or box distances. Evaluation often uses intersection over union:

$$
IoU = \\frac{\\text{area}(A\\cap B)}{\\text{area}(A\\cup B)}.
$$

Segmentation predicts labels at pixel or mask level. Semantic segmentation assigns a class to each pixel; instance segmentation separates individual objects; panoptic segmentation combines stuff and thing categories. Architectures use encoder-decoder shapes, skip connections, feature pyramids, or mask heads to recover spatial detail lost during downsampling.

## Augmentation and data practice

Image models benefit heavily from augmentation because the label is often stable under transformations. Common augmentations include random crop, horizontal flip, color jitter, blur, RandAugment, MixUp, CutMix, and random erasing. Augmentation should match invariances of the task: horizontal flip is fine for cats but dangerous for text, medical laterality, or traffic signs. Test-time augmentation can improve accuracy but increases inference cost and complexity.

> **Common pitfall:** Treating augmentation as always harmless. If a transformation changes the label or removes the signal, it injects label noise and can degrade performance.

## Worked shape example

An RGB image of size $224\\times224$ passes through a convolution with $64$ filters, kernel $7\\times7$, stride $2$, and padding $3$. The output spatial size is $\\lfloor(224+2\\cdot3-7)/2\\rfloor+1=112$, so the output tensor is $64\\times112\\times112$. A following $3\\times3$ max pool with stride $2$ reduces it to about $64\\times56\\times56$. This early downsampling saves compute, but aggressive downsampling can hurt small-object detection.

## Interview checklist

Be ready to derive output shapes, explain why convolution reduces parameters, distinguish receptive field from feature-map size, and connect architecture to task. For classification, global invariance is helpful. For detection, multi-scale localization matters. For segmentation, high-resolution detail and skip connections are crucial. For modern vision, compare CNN inductive bias with ViT global attention and mention that data scale and augmentation often decide which wins.


## More on spatial reasoning

Computer-vision interviews often include shape arithmetic because it reveals whether you understand the architecture mechanically. For each layer, track height, width, channels, stride, padding, and dilation. The channel count determines parameter size; the spatial size determines activation memory and compute. A $3\\times3$ convolution with $C_{in}$ input channels and $C_{out}$ output channels has $3\\cdot3\\cdot C_{in}\\cdot C_{out}$ weights, plus biases if used. A $1\\times1$ convolution has no spatial context by itself but mixes channels cheaply.

Receptive field grows with depth, but semantic abstraction grows too. Early filters detect edges and color contrasts. Middle layers respond to textures and parts. Later layers combine parts into object-level evidence. This hierarchy is why transfer learning works: a backbone pretrained on large image data often provides useful features for new tasks with limited labels.

### Detection and segmentation details

Detection systems must solve classification and localization together. Non-maximum suppression removes duplicate boxes by keeping high-confidence boxes and suppressing nearby boxes with high IoU overlap. Anchor design affects which object scales are easy to learn; anchor-free methods avoid hand-designed anchor boxes but still need center or boundary targets. Segmentation systems often use encoder-decoder paths because downsampling gives semantics while upsampling restores resolution.

| Problem | Output | Common loss ideas | Key error |
|---|---|---|---|
| Classification | Image label | Cross-entropy | Confusing similar classes |
| Detection | Boxes plus classes | Classification + box regression | Poor localization or duplicates |
| Semantic segmentation | Class per pixel | Pixel cross-entropy, Dice | Blurry boundaries |
| Instance segmentation | Mask per object | Mask loss plus detection loss | Merged instances |

Augmentation should be validated visually. Random crops can accidentally remove the object. Color jitter can break medical or satellite signals. Resize choices can distort aspect ratios. For deployment, train/test preprocessing mismatch is a common source of silent regression.

> **Interview tip:** If asked about CNNs versus ViTs, frame it as inductive bias and data scale: CNNs start with helpful local assumptions; ViTs can learn flexible global relationships when data and compute are sufficient.

> **Common pitfall:** Reporting top-1 accuracy for a detection or segmentation task. Dense prediction needs localization-aware metrics such as mAP, IoU, Dice, or boundary quality.


### Final drill: architecture-to-task mapping

If the task is image classification with limited data, start from a pretrained CNN or ViT backbone and fine-tune. If the task is real-time mobile inference, consider small CNNs, depthwise separable convolutions, quantization, and input-resolution trade-offs. If the task is small-object detection, preserve higher-resolution features, use feature pyramids, and avoid too much early downsampling. If the task is medical segmentation, prioritize calibration, boundary quality, uncertainty, and validation across acquisition sites.

Vision systems also depend on preprocessing. Channel order, mean and variance normalization, resize method, crop policy, and color space must match training. A model trained with center-cropped square images may fail on wide production images if objects appear near edges. A detector trained on high-resolution labels may lose small objects after aggressive resizing.

For ViTs, patch size is an important trade-off. Smaller patches give more tokens and finer detail but increase attention cost. Larger patches reduce cost but can miss small structures. Hierarchical transformers and windowed attention were designed partly to recover CNN-like multi-scale efficiency.

Close your answer by connecting model output to metric. Classification uses top-k or calibration; detection uses mAP across IoU thresholds; segmentation uses IoU/Dice and boundary metrics. The right architecture is the one that preserves information needed by that metric under deployment constraints.
`,
    widgets: ["convolution"],
    flashcards: [
      { q: "What are the three key properties of convolutional layers?", a: "Local connectivity, weight sharing, and translation equivariance." },
      { q: "How do you compute a basic convolution output size?", a: "$\\lfloor (n + 2p - k)/s \\rfloor + 1$ for input size $n$, padding $p$, kernel $k$, and stride $s$." },
      { q: "What is a receptive field?", a: "The region of the input image that can influence a particular activation." },
      { q: "Why stack two $3\\times3$ convolutions instead of one $5\\times5$?", a: "It gives a similar effective receptive field with fewer parameters and an extra nonlinearity." },
      { q: "What is translation equivariance?", a: "If the input shifts, the feature map shifts correspondingly rather than changing arbitrarily." },
      { q: "What does pooling provide?", a: "Local summarization that reduces spatial size and increases tolerance to small translations." },
      { q: "Why are residual connections useful in CNNs?", a: "They provide identity paths for information and gradients, making very deep networks easier to optimize." },
      { q: "What is a bottleneck ResNet block?", a: "A block using $1\\times1$ convolutions to reduce/restore channels around a more expensive spatial convolution." },
      { q: "How does a ViT represent an image?", a: "It splits the image into patches, embeds each patch as a token, adds positional information, and applies transformer layers." },
      { q: "What is a drawback of global self-attention in vision?", a: "Its cost is quadratic in the number of patches/tokens." },
      { q: "What is IoU?", a: "Intersection over union: area of overlap divided by area of union between predicted and target regions." },
      { q: "Semantic vs instance segmentation?", a: "Semantic segmentation labels each pixel by class; instance segmentation separates individual object instances." },
      { q: "What is a feature pyramid used for?", a: "Combining features at multiple scales, especially helpful for detecting objects of different sizes." },
      { q: "Why can augmentation hurt?", a: "If transformations change labels or remove task-relevant signals, they introduce harmful noise." },
      { q: "CNN vs ViT in one sentence?", a: "CNNs encode locality and weight sharing; ViTs use patch tokens and attention for flexible global interactions." },
    ],
    quiz: [
      {
        q: "For input size 32, kernel 3, padding 1, stride 1, what is the output size?",
        options: ["30", "31", "32", "34"],
        answer: 2,
        explanation: "$\\lfloor(32+2-3)/1\\rfloor+1=32$.",
      },
      {
        q: "Convolutional weight sharing means:",
        options: ["The same kernel is applied across spatial locations", "All classes share one label", "The optimizer has no parameters", "The image is converted to text"],
        answer: 0,
        explanation: "A learned filter is reused at many positions.",
      },
      {
        q: "A residual block $y=x+F(x)$ helps optimization partly because:",
        options: ["It removes all nonlinearities", "It creates a direct identity gradient path", "It requires no data", "It computes IoU"],
        answer: 1,
        explanation: "The derivative includes an identity contribution through the skip connection.",
      },
      {
        q: "Which task needs precise spatial localization most?",
        options: ["Image-level classification", "Language modeling", "Semantic segmentation", "Scalar regression on tabular data"],
        answer: 2,
        explanation: "Segmentation predicts dense pixel-level labels.",
      },
      {
        q: "A ViT patch embedding is most analogous to:",
        options: ["A tokenization step over image patches", "A SQL join", "A recurrent hidden state only", "A dropout mask"],
        answer: 0,
        explanation: "Images are split into patches that become tokens for a transformer.",
      },
      {
        q: "What does IoU measure?",
        options: ["Optimizer momentum", "Overlap quality between regions", "Learning-rate warmup", "Batch normalization variance only"],
        answer: 1,
        explanation: "IoU is intersection area divided by union area.",
      },
      {
        q: "Which augmentation might be unsafe for recognizing left vs right medical laterality?",
        options: ["Normalization by channel mean", "Horizontal flip", "Small brightness jitter", "Random crop that preserves anatomy"],
        answer: 1,
        explanation: "Horizontal flipping can change left/right semantics.",
      },
      {
        q: "Depthwise separable convolution primarily reduces:",
        options: ["The number of labels", "Compute and parameters compared with full convolution", "The need for validation", "The image resolution before loading"],
        answer: 1,
        explanation: "It separates spatial filtering per channel from channel mixing.",
      },
    ],
    resources: [
      { title: "Stanford CS231n", url: "https://cs231n.github.io/", type: "course" },
      { title: "Deep Residual Learning for Image Recognition", url: "https://arxiv.org/abs/1512.03385", type: "paper" },
      { title: "An Image is Worth 16x16 Words", url: "https://arxiv.org/abs/2010.11929", type: "paper" },
      { title: "Feature Pyramid Networks for Object Detection", url: "https://arxiv.org/abs/1612.03144", type: "paper" },
      { title: "YOLOv3: An Incremental Improvement", url: "https://arxiv.org/abs/1804.02767", type: "paper" },
      { title: "Dive into Deep Learning", url: "https://d2l.ai/", type: "book" },
    ],
  },
  {
    id: "sequence-models",
    title: "Sequence Models",
    category: "Deep Learning",
    summary: "Sequence models process ordered data where context and time matter. This topic covers RNNs, LSTMs, GRUs, sequence-to-sequence models, and the attention ideas that preceded transformers.",
    notes: `
## Why sequence modeling is different

In sequence problems, the order of observations carries information. A word depends on previous words, a sensor reading depends on history, and a speech frame depends on surrounding audio. A fixed-size feedforward network can consume a window, but it does not naturally share computation across positions or handle variable length. Recurrent neural networks solve this by applying the same transition at each time step.

A simple RNN updates hidden state with

$$
h_t = \\phi(W_x x_t + W_h h_{t-1} + b), \\quad y_t = g(W_yh_t+c).
$$

The hidden state is a learned summary of the prefix. Parameter sharing across time lets the model process sequences of different lengths and learn patterns independent of absolute position.

## Backpropagation through time

Training an RNN unfolds it across time and applies backpropagation through the unrolled graph. The same recurrent matrix appears at every step, so gradients sum contributions from many time positions. The problem is that repeated multiplication by $W_h$ and activation derivatives causes vanishing or exploding gradients. Long-range dependencies become hard because early tokens receive weak or unstable learning signals.

Truncated backpropagation through time limits the number of steps used for gradient computation. It saves memory and can stabilize training, but it also restricts how far credit assignment can directly reach. In practice, tasks with very long dependencies often need gates, attention, memory, or transformer architectures.

> **Common pitfall:** Saying an RNN "remembers everything" is misleading. The hidden state has finite capacity and is trained through difficult long chains of derivatives.

## LSTM and GRU gates

Long Short-Term Memory networks introduce a cell state with additive updates. A common LSTM formulation uses input, forget, and output gates:

$$
f_t=\\sigma(W_f[x_t,h_{t-1}]+b_f), \\quad i_t=\\sigma(W_i[x_t,h_{t-1}]+b_i),
$$

$$
\\tilde{c}_t=\\tanh(W_c[x_t,h_{t-1}]+b_c), \\quad c_t=f_t\\odot c_{t-1}+i_t\\odot\\tilde{c}_t,
$$

$$
o_t=\\sigma(W_o[x_t,h_{t-1}]+b_o), \\quad h_t=o_t\\odot\\tanh(c_t).
$$

The additive cell path helps gradients flow, while gates decide what to keep, write, and expose. A GRU simplifies the design with reset and update gates, merging cell and hidden state. GRUs are often faster and have fewer parameters; LSTMs can be more expressive but heavier.

| Model | State | Main advantage | Main weakness |
|---|---|---|---|
| Vanilla RNN | Hidden state | Simple, parameter sharing over time | Vanishing/exploding gradients |
| LSTM | Hidden plus cell state | Better long-range memory through gates | More parameters and computation |
| GRU | Gated hidden state | Simpler than LSTM, often competitive | Less explicit memory separation |
| Temporal CNN | Windowed convolution over time | Parallel over positions | Fixed receptive field unless deep/dilated |

## Sequence-to-sequence models

Seq2seq models map an input sequence to an output sequence, such as translation, summarization, or speech recognition. The classic encoder-decoder RNN reads the source into hidden states and then decodes target tokens autoregressively. Without attention, the encoder must compress the whole source into one vector, which becomes a bottleneck for long inputs.

Teacher forcing trains the decoder using the true previous token rather than its own sampled prediction. This stabilizes training but creates exposure bias: at inference, the model conditions on its own mistakes. Scheduled sampling was proposed to bridge the gap, though modern architectures often rely on better pretraining, attention, and decoding strategies.

### Attention origins

Attention was introduced to let the decoder look back at encoder states dynamically. At decoder step $t$, compute scores between the decoder state $s_t$ and each encoder state $h_i$, normalize them with softmax, and take a weighted sum:

$$
\\alpha_{t,i}=\\frac{\\exp(score(s_t,h_i))}{\\sum_j \\exp(score(s_t,h_j))}, \\quad c_t=\\sum_i \\alpha_{t,i}h_i.
$$

The context vector $c_t$ changes at each output step. This reduces the fixed-vector bottleneck and creates interpretable alignments between source and target positions. Dot-product, additive, and bilinear scoring functions are common variants. Transformers later removed recurrence and made attention the main mixing mechanism, but the intuition came from seq2seq alignment.

> **Interview tip:** When describing attention before transformers, say it solved the encoder bottleneck by giving each decoder step a soft, learned retrieval over all encoder states.

## Practical sequence issues

Sequences vary in length, so batches use padding and masks. The model should not attend to padding tokens or compute loss on padded positions. Bidirectional RNNs read both left-to-right and right-to-left, improving representation for tasks where the full input is available, such as tagging. They are not valid for causal generation where future tokens must be hidden.

Gradient clipping is common for RNNs because recurrent chains can explode. Packed sequences or masking improve efficiency. For time series, leakage is a major issue: normalization, windowing, and splits must respect time. For text, tokenization controls sequence length and vocabulary trade-offs.

## Worked example: attention in translation

Imagine translating "the red house" into another language. At the step producing the adjective, the decoder may place high attention weight on "red"; at the noun step, it may focus on "house". The context vector is not a hard pointer but a weighted blend. If weights are diffuse, the model is uncertain or combining context; if weights are sharp, it behaves more like alignment. Attention weights are useful diagnostics but not perfect explanations, because downstream nonlinear layers can transform them.

## Interview checklist

For RNNs, know the recurrence and why BPTT causes gradient issues. For LSTMs and GRUs, emphasize gating and additive memory paths. For seq2seq, identify the encoder bottleneck, teacher forcing, and autoregressive decoding. For attention origins, derive the score-softmax-weighted-sum pattern and explain why it made long sequence transduction easier. Finally, mention masks and padding; many production bugs in sequence models are not exotic math but incorrect handling of variable lengths.


## Sequence design decisions

The first question for any sequence task is whether future context is available. Named-entity recognition over a completed sentence can use bidirectional context. Real-time speech recognition, trading alerts, or next-token generation cannot. This determines masking, architecture, and evaluation. A second question is the horizon of dependency. If only a short local pattern matters, temporal convolutions may be simpler than recurrence. If arbitrary distant tokens matter, attention or memory mechanisms become attractive.

Variable length creates implementation details that often become bugs. Padding tokens should not contribute to loss, attention, or pooled representations. Packed sequences save RNN computation but require careful sorting or framework utilities. Hidden state must be reset between independent sequences; otherwise examples leak into each other. In stateful streaming systems, the reset policy becomes part of product behavior.

### Decoding and evaluation

Autoregressive decoders need a search or sampling strategy. Greedy decoding is simple but may miss better sequences. Beam search helps tasks with a clear target, such as translation, but can reduce diversity. Sampling is useful for open-ended generation. Sequence evaluation depends on the task: token accuracy for tagging, BLEU or chrF for translation, word error rate for speech, edit distance for OCR, and business metrics for dialogue.

| Task | Architecture clue | Evaluation clue |
|---|---|---|
| Tagging a known sentence | Bidirectional encoder | Token F1 and span F1 |
| Next event prediction | Causal model | Log loss, recall@k |
| Translation | Encoder-decoder with attention | BLEU, chrF, human quality |
| Streaming sensor alert | Causal RNN/TCN/transformer | Latency and false alarms |

Attention weights in RNN seq2seq models can be visualized as soft alignments, but they are not guaranteed explanations. A model may attend broadly and still produce a correct output, or attend sharply for reasons that later layers transform. Use them as diagnostics, not proof.

> **Interview tip:** Mention teacher forcing and exposure bias together. Then explain that decoding-time behavior must be evaluated because training conditions differ from inference.

> **Common pitfall:** Randomly splitting overlapping sequence windows. If adjacent windows from the same original series appear in train and test, metrics can be inflated by near-duplicates.


### Final drill: choosing between RNNs, CNNs, and attention

A practical comparison starts with dependency length and latency. RNNs process step by step and are natural for streaming, but long-range credit assignment is difficult. Temporal CNNs parallelize across time and can be efficient with dilations, but their receptive field is designed rather than fully content-adaptive. Attention handles variable long-range interactions well, but full attention is expensive for long sequences and requires masking.

For small data, simpler sequence models may beat large transformers because they impose stronger bias and need less pretraining. For huge text corpora, transformers dominate because they parallelize training and scale effectively. For edge devices, a GRU or temporal CNN may be chosen for latency and memory even if a transformer is more accurate offline.

Sequence labels also define the model. Many-to-one tasks, such as sentiment classification, pool or use a final state. Many-to-many aligned tasks, such as tagging, output at each input position. Seq2seq tasks output a different-length sequence. Confusing these problem shapes leads to wrong losses and metrics.

A final interview move is to discuss evaluation under distribution shift. Language changes, sensors drift, and user behavior evolves. Sequence models can silently rely on shortcuts such as timestamp artifacts or speaker identity. Time-aware validation and slice analysis are as important as the recurrence or attention equation.
`,
    flashcards: [
      { q: "What does an RNN hidden state represent?", a: "A learned summary of the sequence prefix processed so far." },
      { q: "Write the basic RNN recurrence.", a: "$h_t=\\phi(W_xx_t+W_hh_{t-1}+b)$." },
      { q: "What is backpropagation through time?", a: "Backpropagation applied to the unrolled recurrent computation graph across sequence steps." },
      { q: "Why do vanilla RNNs struggle with long dependencies?", a: "Gradients repeatedly multiply through recurrent Jacobians, causing vanishing or exploding signals." },
      { q: "What is the LSTM cell state for?", a: "It provides an additive memory path that gates can preserve, update, or expose." },
      { q: "Name the common LSTM gates.", a: "Forget gate, input gate, output gate, plus a candidate cell update." },
      { q: "How does a GRU differ from an LSTM?", a: "A GRU uses fewer gates and merges cell and hidden state, often making it faster and simpler." },
      { q: "What problem did attention solve in early seq2seq models?", a: "It reduced the need to compress the entire source sequence into one fixed vector." },
      { q: "What is teacher forcing?", a: "Training a decoder with the true previous token as input instead of its own previous prediction." },
      { q: "What is exposure bias?", a: "A mismatch where training conditions on true previous tokens but inference conditions on model-generated tokens." },
      { q: "Why are masks needed in padded sequence batches?", a: "They prevent the model or loss from treating padding as real data." },
      { q: "When are bidirectional RNNs inappropriate?", a: "For causal generation or streaming settings where future tokens are unavailable." },
      { q: "What is gradient clipping used for in RNNs?", a: "To prevent exploding gradients through long recurrent chains." },
      { q: "What is the context vector in attention?", a: "A weighted sum of encoder states, with weights determined by a score and softmax." },
      { q: "How did attention influence transformers?", a: "Transformers made attention the primary mechanism for token mixing and removed recurrent sequential processing." },
    ],
    quiz: [
      {
        q: "A vanilla RNN shares which parameters across time?",
        options: ["The recurrent transition weights", "The validation labels", "The optimizer random seed only", "The batch size"],
        answer: 0,
        explanation: "The same input and recurrent weights are applied at each time step.",
      },
      {
        q: "The main training difficulty for long vanilla RNNs is:",
        options: ["Too many output classes only", "Vanishing or exploding gradients through time", "Lack of any nonlinearities in all cases", "Inability to handle vectors"],
        answer: 1,
        explanation: "Repeated Jacobian multiplication over many steps can shrink or blow up gradients.",
      },
      {
        q: "Which gate in an LSTM most directly controls old cell memory retention?",
        options: ["Forget gate", "Output vocabulary gate", "Softmax gate only", "Batch gate"],
        answer: 0,
        explanation: "The forget gate multiplies the previous cell state.",
      },
      {
        q: "A GRU is generally:",
        options: ["A convolution-only image model", "A gated recurrent model with fewer components than an LSTM", "A sorting algorithm", "A metric for detection"],
        answer: 1,
        explanation: "GRUs use update/reset gates and a merged state.",
      },
      {
        q: "In seq2seq without attention, the bottleneck is:",
        options: ["The entire source must be compressed into a fixed representation", "The model cannot produce variable-length output", "There is no loss function", "The input must be an image"],
        answer: 0,
        explanation: "The decoder depends heavily on the final encoder representation.",
      },
      {
        q: "Attention weights over encoder states usually sum to:",
        options: ["$0$", "$1$", "The sequence length squared", "The learning rate"],
        answer: 1,
        explanation: "Softmax normalization produces nonnegative weights summing to one.",
      },
      {
        q: "Teacher forcing uses what decoder input during training?",
        options: ["The true previous target token", "Only random noise", "The future validation label", "No token at all"],
        answer: 0,
        explanation: "Teacher forcing conditions on ground-truth previous outputs.",
      },
      {
        q: "A padding mask is needed to:",
        options: ["Increase model size", "Prevent padded positions from influencing attention or loss", "Replace embeddings", "Turn an RNN into a CNN"],
        answer: 1,
        explanation: "Padding is not real sequence content and should be ignored.",
      },
    ],
    resources: [
      { title: "Dive into Deep Learning", url: "https://d2l.ai/", type: "book" },
      { title: "Stanford CS224n", url: "https://web.stanford.edu/class/cs224n/", type: "course" },
      { title: "Neural Machine Translation by Jointly Learning to Align and Translate", url: "https://arxiv.org/abs/1409.0473", type: "paper" },
      { title: "Long Short-Term Memory", url: "https://www.bioinf.jku.at/publications/older/2604.pdf", type: "paper" },
      { title: "Learning Phrase Representations using RNN Encoder-Decoder", url: "https://arxiv.org/abs/1406.1078", type: "paper" },
    ],
  },
]

export default topics
