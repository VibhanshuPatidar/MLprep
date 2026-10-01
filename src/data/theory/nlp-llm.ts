import type { TheoryTopic } from '../../types/content'

const topics: TheoryTopic[] = [
  {
    id: "transformers-attention",
    title: "Transformers & Attention",
    category: "NLP & LLMs",
    summary: "Transformers replace recurrence with attention-driven token mixing and position-aware feedforward blocks. Interviews often focus on scaled dot-product attention, multi-head design, positional encodings, complexity, and KV caching.",
    notes: `
## Why attention changed sequence modeling

Before transformers, sequence models usually processed tokens one step at a time with recurrence or used convolutions with limited receptive fields. Attention changed the default mental model: each token can retrieve information from every other allowed token in a single layer. This makes long-range interactions easier to optimize and parallelizes training across sequence positions. A transformer block combines attention, a position-wise feedforward network, residual connections, and normalization.

The core operation starts with token representations $X \\in \\mathbb{R}^{n\\times d}$. Learned projections produce queries, keys, and values:

$$
Q=XW_Q, \\quad K=XW_K, \\quad V=XW_V.
$$

A query asks what this token wants, a key advertises what each token contains, and a value is the information to mix if a key is selected.

## Scaled dot-product attention

The attention scores are dot products between queries and keys. For one head,

$$
\\text{Attention}(Q,K,V)=\\text{softmax}\\left(\\frac{QK^\\top}{\\sqrt{d_k}} + M\\right)V.
$$

The mask $M$ is $0$ for allowed positions and a large negative number for disallowed positions. In causal language modeling, a token cannot attend to future tokens. The scale $\\sqrt{d_k}$ matters because if query and key components have unit variance, their dot product has variance roughly $d_k$. Without scaling, logits grow with dimension, softmax becomes too peaky, and gradients become less useful.

### Derivation intuition

For token $i$, attention computes weights

$$
\\alpha_{ij}=\\frac{\\exp(q_i\\cdot k_j/\\sqrt{d_k})}{\\sum_{r}\\exp(q_i\\cdot k_r/\\sqrt{d_k})}, \\quad o_i=\\sum_j \\alpha_{ij}v_j.
$$

This is differentiable content-based retrieval. The model learns the retrieval space rather than relying on exact symbols. In a syntactic example, a verb token's query may assign high weight to a subject token's key; in code, a variable use may attend to its definition.

> **Interview tip:** Explain the scale by variance. Dot products grow with dimension, so dividing by $\\sqrt{d_k}$ keeps softmax logits in a trainable range.

## Multi-head attention

One attention head gives one retrieval pattern. Multi-head attention runs several heads in parallel with different projections, concatenates the outputs, and applies an output projection. Heads can specialize: locality, delimiter matching, coreference, induction-like copying, or broad semantic context. Not every head is interpretable, and many heads can be redundant, but the design gives the model multiple learned subspaces.

| Component | Shape idea | Purpose |
|---|---|---|
| Query | $n\\times d_k$ | What each token seeks |
| Key | $n\\times d_k$ | What each token offers for matching |
| Value | $n\\times d_v$ | Information to aggregate |
| Head | Attention output | One retrieval view |
| Output projection | Concatenated heads to model width | Mixes head outputs |

## Positional information and RoPE

Attention alone is permutation equivariant: if tokens are shuffled and no positions are provided, the model cannot know order. Original transformers added sinusoidal positional encodings to token embeddings. Learned absolute position embeddings are also common. Relative position methods let attention depend on distance between tokens, which often generalizes better to different lengths.

Rotary positional embeddings, or RoPE, rotate query and key vectors by an angle determined by token position. The dot product between a rotated query and key then depends on relative position. At a high level, pairs of dimensions are transformed with sine and cosine functions:

$$
\\begin{bmatrix}x_{2i}'\\\\x_{2i+1}'\\end{bmatrix}=
\\begin{bmatrix}\\cos\\theta_p & -\\sin\\theta_p\\\\ \\sin\\theta_p & \\cos\\theta_p\\end{bmatrix}
\\begin{bmatrix}x_{2i}\\\\x_{2i+1}\\end{bmatrix}.
$$

RoPE is popular in LLMs because it supports relative-position behavior and works naturally with cached keys and queries.

## Complexity and KV cache

Full attention over $n$ tokens costs $O(n^2d)$ time and $O(n^2)$ attention memory per layer during training because every token pair can interact. This quadratic cost is the main barrier to very long context. Sparse, local, linear, and recurrent attention variants trade exact all-pairs interaction for efficiency.

During autoregressive inference, the model generates one token at a time. Recomputing keys and values for all previous tokens at every step would be wasteful. A KV cache stores past keys and values for each layer. At step $t$, the model computes the new token's query, key, and value, appends the new key/value to the cache, and attends from the new query to cached keys/values. This changes per-token generation from recomputing the whole prefix to using stored prefix representations, though memory grows with batch size, layers, heads, head dimension, and context length.

> **Common pitfall:** KV caching speeds autoregressive decoding but does not remove the need to attend over the prefix. Long contexts can still be memory-bandwidth bound.

## Encoder, decoder, and causal masks

Encoder transformers, such as BERT-style models, use bidirectional attention over an observed sequence and are natural for classification, tagging, and retrieval embeddings. Decoder-only transformers use causal self-attention and predict the next token, which matches open-ended generation. Encoder-decoder transformers use an encoder for the source and a decoder that attends causally to previous target tokens plus cross-attends to source states.

## Worked example

Consider the sentence "the trophy would not fit in the suitcase because it was too large." The token "it" needs context to resolve whether the trophy or suitcase was large. A self-attention head can assign weight from "it" to both candidate nouns and surrounding adjectives. Later feedforward layers transform the mixed vector. The model is not executing a symbolic grammar rule; it is learning soft retrieval patterns that are useful for predicting tokens or labels.

## Interview checklist

Be ready to write the attention equation, explain the $\\sqrt{d_k}$ scale, describe masks, compare absolute and relative position encodings, and state the quadratic cost. For serving, mention KV caches and why they trade memory for speed. For architecture, distinguish encoder, decoder, and encoder-decoder attention patterns. A concise but strong answer connects attention to differentiable retrieval under learned projections.


## Implementation details that interviewers like

Attention equations are compact, but implementation details matter. Masks must be applied before softmax, not after, so disallowed positions receive near-zero probability after normalization. Softmax should be numerically stable by subtracting the maximum logit. Dropout may be applied to attention weights or residual branches during training. In multi-head attention, tensors are often reshaped from batch, sequence, model width into batch, heads, sequence, head dimension; many bugs are silent shape transpositions.

Pre-norm and post-norm transformer blocks differ in where normalization is placed relative to sublayers. Pre-norm blocks, where normalized input enters attention or MLP and the residual adds back to the original stream, are often easier to train at great depth because gradients can flow along the residual stream. Post-norm was used in the original transformer but can be less stable without careful warmup.

### Attention is powerful but not free

The quadratic cost is not only arithmetic. Storing or reading attention probabilities can dominate memory traffic. Long-context models therefore use a mix of engineering and modeling ideas: FlashAttention kernels, grouped-query attention, sliding-window attention, recurrence-like memory, retrieval, or chunking. Each method changes the trade-off between exact context mixing, latency, and memory.

| Detail | Why it matters | Failure mode |
|---|---|---|
| Mask before softmax | Removes illegal positions from distribution | Future leakage or padding attention |
| Stable softmax | Avoids overflow | NaNs with large logits |
| Positional scheme | Gives order information | Poor length generalization |
| KV cache layout | Determines serving speed | Memory fragmentation |

For RoPE, the important interview point is relative geometry. Rotating both query and key by position makes their dot product depend on position difference. Extrapolating beyond trained lengths is still delicate because frequencies, scaling, and training distribution matter.

> **Interview tip:** If asked why transformers parallelize better than RNNs, say training-time token representations in a layer can be computed together because attention reads the previous layer's states, not the current time step's newly computed state.

> **Common pitfall:** Thinking attention alone replaces all computation. The feedforward network often holds most parameters and applies a learned nonlinear transformation independently at each position.


### Final drill: walking through one transformer block

Given token embeddings, add or apply positional information, normalize depending on block style, project to Q, K, and V, compute masked scaled attention, combine heads, apply an output projection, and add the residual. Then normalize again or continue depending on pre-norm versus post-norm, apply the feedforward network, and add another residual. This repeated block alternates token mixing through attention with per-token nonlinear transformation through the MLP.

The feedforward network is position-wise: the same MLP is applied to each token independently. Therefore attention is where tokens exchange information, while the MLP expands and transforms each token's representation. In many transformers, the MLP hidden dimension is several times the model width, so it contains a large fraction of parameters.

For long context, ask whether the model truly needs every token to attend to every other token. Some tasks need exact retrieval from far back; others can use summaries, retrieval indexes, sliding windows, or chunked processing. KV caching helps generation but not training memory in the same way because training usually computes all positions and stores activations for backprop.

A polished closing answer states: attention is learned soft retrieval; multi-head attention gives multiple retrieval subspaces; positions break permutation symmetry; masks enforce allowed information flow; and systems optimizations make the elegant equation usable at scale.
`,
    widgets: ["attention", "positional-encoding"],
    flashcards: [
      { q: "What are queries, keys, and values?", a: "Learned projections of token representations: queries seek information, keys are matched against queries, and values are mixed into outputs." },
      { q: "Write scaled dot-product attention.", a: "$\\text{softmax}(QK^\\top/\\sqrt{d_k}+M)V$." },
      { q: "Why divide by $\\sqrt{d_k}$?", a: "Dot-product variance grows with key dimension; scaling keeps logits from becoming too large and softmax too saturated." },
      { q: "What does a causal mask do?", a: "It prevents a token from attending to future positions during autoregressive training or decoding." },
      { q: "Why use multi-head attention?", a: "Multiple heads allow different learned retrieval patterns and representation subspaces in parallel." },
      { q: "Why do transformers need positional information?", a: "Self-attention without positions is permutation equivariant and cannot distinguish token order." },
      { q: "What is RoPE?", a: "Rotary positional embedding rotates query/key dimensions by position so dot products encode relative position information." },
      { q: "What is the time complexity of full self-attention?", a: "Roughly $O(n^2d)$ for sequence length $n$ and width $d$." },
      { q: "What is a KV cache?", a: "Stored past keys and values for each layer used to speed autoregressive decoding." },
      { q: "Does KV cache eliminate attention over previous tokens?", a: "No. It avoids recomputing past K/V projections but the new query still attends over cached positions." },
      { q: "Encoder vs decoder transformer?", a: "Encoders use bidirectional attention over known input; decoders use causal attention for next-token generation." },
      { q: "What is cross-attention?", a: "Decoder queries attend to keys/values from encoder outputs, common in encoder-decoder models." },
      { q: "Why is attention called differentiable retrieval?", a: "Softmax weights select and blend values based on learned query-key similarity, all differentiably." },
      { q: "What does the attention mask contain numerically?", a: "Allowed positions get zero; disallowed positions get a large negative logit before softmax." },
      { q: "What is a common long-context bottleneck?", a: "Quadratic attention compute and KV-cache memory bandwidth/capacity." },
    ],
    quiz: [
      {
        q: "The attention weights for a query are computed by applying softmax to:",
        options: ["Values only", "Scaled query-key scores plus mask", "Token IDs directly", "The optimizer state"],
        answer: 1,
        explanation: "Attention logits come from $QK^\\top/\\sqrt{d_k}$ plus any mask.",
      },
      {
        q: "The purpose of the $\\sqrt{d_k}$ denominator is to:",
        options: ["Increase vocabulary size", "Control dot-product scale as dimension grows", "Remove the value vectors", "Make attention recurrent"],
        answer: 1,
        explanation: "Scaling prevents large dimensions from producing overly sharp softmax distributions.",
      },
      {
        q: "In causal language modeling, a token may attend to:",
        options: ["Only future tokens", "Previous tokens and itself", "Only padding tokens", "No tokens"],
        answer: 1,
        explanation: "The causal mask blocks future positions.",
      },
      {
        q: "Full self-attention over sequence length $n$ has pairwise interaction cost closest to:",
        options: ["$O(n)$", "$O(\\log n)$", "$O(n^2)$", "$O(1)$"],
        answer: 2,
        explanation: "Every token can interact with every other token.",
      },
      {
        q: "KV caching during decoding stores:",
        options: ["Past keys and values per layer", "Only final text strings", "Training labels", "Optimizer momentum"],
        answer: 0,
        explanation: "The cache holds projected keys and values for previous tokens.",
      },
      {
        q: "RoPE is best described as:",
        options: ["A dropout schedule", "A rotation-based positional method for queries and keys", "A tokenization algorithm", "A database index"],
        answer: 1,
        explanation: "RoPE applies position-dependent rotations so attention scores reflect relative positions.",
      },
      {
        q: "An encoder-only transformer is most naturally used for:",
        options: ["Bidirectional input understanding tasks", "Strict next-token generation only", "Image pooling only", "Gradient clipping"],
        answer: 0,
        explanation: "Encoders can attend bidirectionally over the full input.",
      },
      {
        q: "Multi-head attention helps because heads can:",
        options: ["Use separate learned projections and attend to different patterns", "Eliminate the feedforward network entirely", "Avoid all matrix multiplication", "Guarantee factual correctness"],
        answer: 0,
        explanation: "Different heads operate in different subspaces with separate projections.",
      },
    ],
    resources: [
      { title: "Attention Is All You Need", url: "https://arxiv.org/abs/1706.03762", type: "paper" },
      { title: "The Illustrated Transformer", url: "https://jalammar.github.io/illustrated-transformer/", type: "article" },
      { title: "Stanford CS224n", url: "https://web.stanford.edu/class/cs224n/", type: "course" },
      { title: "RoFormer: Enhanced Transformer with Rotary Position Embedding", url: "https://arxiv.org/abs/2104.09864", type: "paper" },
      { title: "Hugging Face NLP Course", url: "https://huggingface.co/learn", type: "course" },
    ],
  },
  {
    id: "tokenization-embeddings",
    title: "Tokenization & Embeddings",
    category: "NLP & LLMs",
    summary: "Tokenization converts text into model units, while embeddings turn those units into vectors that can carry lexical, syntactic, and semantic information. This topic links subword algorithms, classic word vectors, contextual embeddings, and contrastive sentence representations.",
    notes: `
## Text is not naturally numeric

Language models consume sequences of token IDs, not raw characters or words. Tokenization defines the units, and embeddings define the initial vector representation of those units. The choice affects vocabulary size, sequence length, handling of rare words, multilingual behavior, latency, and even safety filters. A bad tokenizer can split important domain strings awkwardly; a good embedding model can make semantically related inputs close in vector space.

Word-level tokenization is simple but brittle. It struggles with rare words, misspellings, morphology, and open vocabularies. Character-level tokenization has a tiny vocabulary and no out-of-vocabulary issue, but sequences become long and the model must learn larger compositions. Subword tokenization is the compromise used by most modern NLP systems.

## BPE, WordPiece, and SentencePiece

Byte Pair Encoding starts with small units, often bytes or characters, and repeatedly merges frequent adjacent pairs. The learned merges create common words as single tokens while leaving rare words decomposable. WordPiece is similar in spirit but chooses merges based on a likelihood objective used in early neural language models. SentencePiece treats tokenization as a model over raw Unicode text and can avoid relying on whitespace pre-tokenization, which is useful for multilingual settings.

| Method | Core idea | Strength | Watch out |
|---|---|---|---|
| BPE | Greedily merge frequent pairs | Simple, common in GPT-style tokenizers | Frequency merges may not match morphology |
| WordPiece | Select subwords by likelihood gain | Strong for BERT-style models | Often uses pre-tokenization conventions |
| SentencePiece | Learns from raw text with model prefix markers | Language-agnostic and robust to whitespace | Token strings can look less intuitive |
| Byte-level BPE | Base vocabulary is bytes | No unknown Unicode bytes | Can produce longer sequences for some text |

Subword tokenization improves open-vocabulary handling, but it introduces quirks. The same word may tokenize differently with leading whitespace. Numbers, code, emojis, and non-English scripts may require many tokens. In applications, token count matters for cost and context length, so tokenization is not just preprocessing; it is a product constraint.

> **Common pitfall:** Assuming one token equals one word. In LLM systems, token counts can differ dramatically across languages, domains, and formatting.

## Static word embeddings

Word2vec and GloVe learn one vector per word type. Word2vec's skip-gram objective predicts context words from a center word, often with negative sampling. A simplified negative-sampling objective for center word $w$ and context $c$ is

$$
\\log \\sigma(v_c^\\top v_w) + \\sum_{k=1}^{K}\\mathbb{E}_{n_k}\\left[\\log \\sigma(-v_{n_k}^\\top v_w)\\right].
$$

GloVe factorizes global co-occurrence statistics, learning vectors whose dot products relate to log co-occurrence ratios. Static embeddings capture useful semantic regularities, but each word type has one vector. The word "bank" has the same embedding in "river bank" and "bank loan," which limits context sensitivity.

## Contextual embeddings

Contextual models such as ELMo, BERT, and transformer encoders produce a different vector for a token depending on surrounding text. The representation of "bank" changes with context. This is a major reason transformer encoders improved search, classification, tagging, and question answering. Contextual embeddings are usually taken from a specific layer or pooled from token vectors. Lower layers often encode surface and syntactic patterns; higher layers are more task-specific, though this is a tendency rather than a law.

For retrieval, sentence embeddings compress a sentence, paragraph, or query into one vector. Mean pooling over token embeddings is a baseline; special classification tokens or trained pooling heads are common. The objective matters more than the pooling trick. Models trained only for masked language modeling may produce poor sentence similarity vectors unless adapted.

## Contrastive learning for sentence embeddings

Contrastive learning trains representations by pulling positive pairs together and pushing negatives apart. A common loss for query $q$, positive document $d^+$, and negatives $d_j$ is

$$
L=-\\log\\frac{\\exp(sim(q,d^+)/\\tau)}{\\sum_j \\exp(sim(q,d_j)/\\tau)}.
$$

The temperature $\\tau$ controls sharpness. Positive pairs may come from duplicate questions, query-click logs, entailment pairs, augmented views, or instruction datasets. Negatives can be random, in-batch, hard mined, or generated. Hard negatives are valuable because they teach fine distinctions, but false negatives can damage learning.

> **Interview tip:** For embeddings, always ask: "What objective made these distances meaningful?" Vector closeness is only as good as the training signal.

## Worked example: tokenizer trade-off

Suppose a medical app sees "hypercholesterolemia". A word-level tokenizer may mark it unknown. A character tokenizer handles it but creates a long sequence. A subword tokenizer might split it into "hyper", "cholesterol", and suffix pieces, preserving useful morphology while staying compact. For code, a tokenizer that splits snake_case, punctuation, and indentation sensibly can be the difference between efficient context use and waste.

## Practical embedding evaluation

For classification embeddings, evaluate downstream accuracy and calibration. For retrieval embeddings, evaluate recall@k, mean reciprocal rank, nDCG, and robustness to paraphrase or negation. Inspect nearest neighbors to catch shortcuts. A sentence embedding model that clusters by topic may fail when the task requires exact constraints such as date, quantity, or jurisdiction.

## Interview checklist

Be ready to compare BPE, WordPiece, and SentencePiece, explain why subwords balance vocabulary and sequence length, and distinguish static from contextual embeddings. For sentence embeddings, discuss pooling and contrastive objectives. For production, mention token budget, multilingual fairness, domain adaptation, and whether the similarity objective matches the product metric. Good answers treat tokenization and embeddings as modeling choices, not mechanical preprocessing.


## Tokenization in production systems

Tokenizers become part of the model contract. Changing the tokenizer usually invalidates learned embeddings because token IDs and segmentation change. This is why production systems version tokenizers alongside model checkpoints. The tokenizer also affects safety and evaluation: a filter that checks words after naive whitespace splitting may miss harmful content represented through subwords, homoglyphs, or unusual spacing.

For multilingual systems, token fairness matters. A tokenizer trained mostly on English may represent other languages with many more tokens per sentence, increasing cost and reducing effective context. Byte-level tokenizers avoid unknowns but may still be inefficient. Domain-specific systems, such as code, law, or medicine, may benefit from tokenizers or vocabularies that preserve frequent technical units.

### Embedding geometry and use cases

Embeddings are not universally meaningful vectors; their geometry reflects the training objective. A next-token model embedding matrix is optimized to help predict tokens in context, not necessarily to make sentence cosine similarity match human semantic similarity. Retrieval embeddings need contrastive or ranking supervision. Classification embeddings need features separable for the target labels. This is why evaluating embeddings with the actual downstream task matters.

| Use case | Good training signal | Common failure |
|---|---|---|
| Semantic search | Query-document positives and hard negatives | Topic match without exact constraint |
| Clustering | Paraphrase or similarity supervision | Clusters by length or style |
| Classification | Labeled task examples | Poor calibration under domain shift |
| Deduplication | Duplicate/non-duplicate pairs | Missing near duplicates with different wording |

Hard-negative mining is especially important in retrieval. If negatives are random, the model learns easy topical separation. If negatives are plausible but wrong, it learns the fine distinctions users care about. The danger is false negatives: two passages may both answer the query even if logs mark only one as clicked.

> **Interview tip:** Ask whether the embedding model is symmetric. Query-document retrieval may need different encoders or prompts for queries and documents; sentence similarity often expects symmetric comparison.

> **Common pitfall:** Averaging token embeddings from an arbitrary LLM and assuming the result is a strong sentence embedding. Pooling without a matching objective can underperform much smaller specialized models.


### Final drill: debugging embedding search

If semantic search returns bad results, inspect each stage. Tokenization may split domain terms poorly. The query encoder may not match the document encoder. Embeddings may be normalized inconsistently. The ANN index may use an approximate setting with low recall. The training negatives may be too easy. The query may require filters, dates, permissions, or exact identifiers that dense similarity alone ignores.

A common production solution is hybrid retrieval. Dense vectors handle paraphrase; sparse terms handle exact words, IDs, and rare names; metadata filters enforce constraints; a reranker handles subtle relevance. Embeddings are powerful, but they are not databases. If a user asks for policy version 3.2, exact version matching may be mandatory.

For tokenizers, debugging often starts by printing token IDs and pieces. Unexpectedly long tokenization for a language or domain reveals cost and context problems. A prompt that fits in English may overflow in another language. Code snippets can explode into punctuation-heavy tokens. Tables may tokenize inefficiently if serialized poorly.

A strong interview close is: tokenization defines the sequence the model actually sees, embeddings define the geometry it starts or retrieves with, and objectives define whether distances mean what the application needs.


### Edge cases to mention

Numbers, code, and names are tokenization stress tests. A model may split a long invoice number into many pieces and still fail to compare it exactly. Source code contains indentation, brackets, and rare identifiers whose segmentation affects completion quality. Names from underrepresented languages may be fragmented more than common English names, creating both cost and quality issues. These examples show why tokenization can become a fairness and reliability concern.

For embeddings, exact-match constraints often need symbolic help. If the query asks for "policy AB-17," a vector search result about a similar policy may be semantically close but wrong. Production retrieval commonly combines vectors with filters, keyword search, and reranking because no single geometry captures every constraint. State this in interviews to avoid sounding like embeddings are magic.
`,
    flashcards: [
      { q: "Why use subword tokenization?", a: "It balances vocabulary size and sequence length while handling rare or unseen words by decomposing them into pieces." },
      { q: "What is BPE?", a: "A tokenization method that repeatedly merges frequent adjacent units to build a subword vocabulary." },
      { q: "How is WordPiece different from basic BPE?", a: "It selects subwords using a likelihood-based criterion rather than only raw pair frequency." },
      { q: "What is SentencePiece known for?", a: "Learning tokenization directly from raw text, often without whitespace-dependent pre-tokenization." },
      { q: "Why can byte-level tokenizers avoid unknown tokens?", a: "Any text can be represented as bytes, so arbitrary Unicode can be decomposed into known byte units." },
      { q: "What is a static word embedding?", a: "One learned vector per word type, independent of sentence context." },
      { q: "What is the skip-gram idea in word2vec?", a: "Predict surrounding context words from a center word representation." },
      { q: "What does GloVe use as training signal?", a: "Global word co-occurrence statistics, often related to log co-occurrence ratios." },
      { q: "Why are contextual embeddings powerful?", a: "The same token can receive different vectors depending on surrounding text." },
      { q: "What is a sentence embedding?", a: "A fixed-size vector representing a sentence or passage for similarity, retrieval, clustering, or classification." },
      { q: "What is contrastive learning?", a: "Training that pulls positive pairs together and pushes negative pairs apart in embedding space." },
      { q: "What does temperature do in contrastive loss?", a: "It controls how sharply similarities are weighted in the softmax." },
      { q: "What are hard negatives?", a: "Negative examples that are similar to the query but not correct, useful for learning fine distinctions." },
      { q: "Why inspect nearest neighbors?", a: "They reveal whether embeddings capture intended semantics or spurious shortcuts." },
      { q: "Why does tokenization affect product cost?", a: "LLM pricing and context limits are often token-based, so longer tokenization increases cost and reduces usable context." },
    ],
    quiz: [
      {
        q: "Subword tokenization mainly helps with:",
        options: ["Open vocabulary and rare-word handling", "Eliminating all model parameters", "Replacing attention", "Computing gradients without loss"],
        answer: 0,
        explanation: "Rare words can be decomposed into known subword units.",
      },
      {
        q: "BPE builds a vocabulary by:",
        options: ["Merging frequent adjacent units", "Sorting labels alphabetically", "Running gradient clipping", "Averaging validation metrics"],
        answer: 0,
        explanation: "BPE repeatedly merges frequent pairs.",
      },
      {
        q: "A static embedding limitation is that:",
        options: ["It cannot be stored as a vector", "Each word type has one vector regardless of context", "It requires a GPU at inference always", "It only works on images"],
        answer: 1,
        explanation: "Polysemous words share one representation in static embeddings.",
      },
      {
        q: "Contextual embeddings differ because they:",
        options: ["Depend on surrounding tokens", "Are always one-hot", "Cannot be fine-tuned", "Ignore syntax"],
        answer: 0,
        explanation: "Transformer encoders produce token vectors conditioned on context.",
      },
      {
        q: "Contrastive sentence embedding training usually:",
        options: ["Pulls positives together and pushes negatives apart", "Deletes all hard examples", "Uses no objective", "Requires exact word overlap only"],
        answer: 0,
        explanation: "The loss compares positive and negative similarities.",
      },
      {
        q: "In contrastive loss, a false negative is dangerous because it:",
        options: ["Is actually related but trained as dissimilar", "Has too many pixels", "Makes token IDs disappear", "Increases batch size automatically"],
        answer: 0,
        explanation: "Treating a valid match as negative teaches the wrong geometry.",
      },
      {
        q: "SentencePiece is especially useful because it can:",
        options: ["Train directly on raw text without relying on whitespace rules", "Only tokenize English words", "Replace embeddings with labels", "Guarantee factual answers"],
        answer: 0,
        explanation: "SentencePiece supports raw-text, language-agnostic tokenization.",
      },
      {
        q: "For retrieval embeddings, a relevant metric is:",
        options: ["Recall@k", "BLEU only for every task", "GPU temperature only", "Number of optimizer parameters only"],
        answer: 0,
        explanation: "Recall@k measures whether relevant items appear in top results.",
      },
    ],
    resources: [
      { title: "Neural Machine Translation of Rare Words with Subword Units", url: "https://arxiv.org/abs/1508.07909", type: "paper" },
      { title: "Efficient Estimation of Word Representations in Vector Space", url: "https://arxiv.org/abs/1301.3781", type: "paper" },
      { title: "GloVe: Global Vectors for Word Representation", url: "https://nlp.stanford.edu/projects/glove/", type: "article" },
      { title: "BERT: Pre-training of Deep Bidirectional Transformers", url: "https://arxiv.org/abs/1810.04805", type: "paper" },
      { title: "Hugging Face NLP Course", url: "https://huggingface.co/learn", type: "course" },
      { title: "Stanford CS224n", url: "https://web.stanford.edu/class/cs224n/", type: "course" },
    ],
  },
  {
    id: "large-language-models-pretraining-scaling",
    title: "Large Language Models: Pretraining & Scaling",
    category: "NLP & LLMs",
    summary: "LLMs are usually decoder-only transformers trained on next-token prediction at large scale. This topic covers objectives, scaling laws, Chinchilla-style compute optimality, mixture-of-experts, and decoding controls.",
    notes: `
## Decoder-only pretraining

Most modern general-purpose LLMs are decoder-only transformers trained with a causal language modeling objective. Given tokens $x_1,\\ldots,x_T$, the model estimates

$$
p(x_1,\\ldots,x_T)=\\prod_{t=1}^{T}p(x_t\\mid x_{<t}).
$$

Training minimizes average negative log likelihood:

$$
L=-\\frac{1}{T}\\sum_{t=1}^{T}\\log p_\\theta(x_t\\mid x_{<t}).
$$

This objective is simple, scalable, and self-supervised: the next token in raw text supplies the label. It teaches grammar, facts, code patterns, reasoning traces, and many tasks implicitly because text contains demonstrations and explanations. However, next-token prediction is not the same as truthfulness, helpfulness, or calibrated uncertainty; later alignment and evaluation steps are needed.

## Data mixture and objectives

Pretraining quality depends heavily on the data mixture. Web pages, books, code, math, academic text, conversations, and multilingual corpora teach different skills. Deduplication reduces memorization and benchmark contamination. Filtering removes low-quality or unsafe data but can also remove minority dialects or domain-specific language. Curriculum and sampling weights influence what the model learns relative to token budget.

Decoder-only LMs predict the next token. Encoder models often use masked language modeling, and encoder-decoder models can use denoising or span corruption. The decoder-only objective aligns naturally with generation and in-context learning, which is why GPT-style architectures dominate chat assistants.

> **Common pitfall:** Equating low pretraining loss with a finished assistant. Pretraining predicts text; instruction following and safety require additional data, tuning, and system design.

## Scaling laws and Chinchilla

Empirical scaling laws relate loss to model size, data size, and compute. Earlier recipes often trained very large models on too few tokens. Chinchilla-style results argued that for a fixed compute budget, many models were undertrained; better performance comes from balancing parameters and training tokens. A rough lesson is: do not only scale parameters; scale high-quality data too.

A simplified view is that compute is proportional to parameters times tokens, $C \\propto N D$. If $N$ grows while $D$ is too small, the model has capacity but not enough practice. If $D$ grows while $N$ is tiny, the model may underfit. Real training also depends on architecture, optimizer, sequence length, data quality, and hardware efficiency.

| Scaling axis | Benefit | Limitation |
|---|---|---|
| More parameters | More capacity and richer representations | Higher memory and inference cost |
| More tokens | Better coverage and less undertraining | Data quality becomes bottleneck |
| More context | More input evidence and long tasks | Quadratic attention or cache memory |
| Better data | Higher signal per token | Filtering can introduce bias |
| More compute | Enables all of the above | Expensive and operationally complex |

## Mixture of Experts

Mixture-of-Experts models increase parameter count without activating all parameters for every token. A router chooses a small number of expert feedforward networks per token. If there are $E$ experts and top-2 routing, each token uses only two experts while the model stores many more parameters. This can improve quality per unit of compute, but routing introduces load balancing, communication, and stability challenges.

A router often computes probabilities $p_e=\\text{softmax}(W_rx)_e$ and selects top experts. Auxiliary losses encourage balanced expert usage so the system does not overload a few experts. MoE inference can be fast in FLOPs but difficult in distributed systems because tokens must be routed across devices.

## Decoding strategies

Pretraining gives a distribution over next tokens. Decoding chooses how to sample from it. Greedy decoding picks the highest-probability token each step. Beam search keeps several high-scoring partial sequences and is useful in constrained transduction, but it can produce dull text for open-ended generation. Sampling introduces diversity.

Temperature rescales logits before softmax:

$$
p_i=\\frac{\\exp(z_i/\\tau)}{\\sum_j \\exp(z_j/\\tau)}.
$$

Lower $\\tau$ sharpens the distribution; higher $\\tau$ flattens it. Top-k sampling restricts choices to the k most likely tokens. Top-p, or nucleus sampling, keeps the smallest set whose cumulative probability exceeds $p$. These controls trade determinism, creativity, and risk.

> **Interview tip:** Separate the model distribution from the decoding algorithm. The same LLM can behave deterministic, creative, repetitive, or risky depending on decoding settings.

## Worked decoding example

Suppose the next-token distribution after a prompt has probabilities: "Paris" 0.55, "London" 0.18, "Berlin" 0.10, "city" 0.05, and many small alternatives. Greedy always chooses "Paris". Top-k with $k=3$ samples only among Paris, London, and Berlin. Top-p with $p=0.8$ includes tokens until cumulative probability crosses 0.8, likely the first three or four tokens. Temperature below one makes Paris even more dominant; temperature above one gives alternatives more chance.

## Evaluation during scaling

Pretraining runs track loss, throughput, gradient stability, and data-quality slices. But downstream evaluations are needed: language understanding, math, code, long-context retrieval, safety, bias, and contamination checks. Scaling can improve many capabilities smoothly, yet specific behaviors may emerge abruptly or depend on prompting. Good teams build evaluation suites before training finishes so they can compare checkpoints and catch regressions.

## Interview checklist

A strong answer states the causal objective, explains why it scales, and notes its mismatch with assistant behavior. Discuss Chinchilla as compute-optimal balancing of parameters and tokens, not a magic constant. Explain MoE as sparse activation of many experts with routing trade-offs. For inference, define greedy, beam, top-k, top-p, and temperature. Finally, mention that data quality and evaluation are first-class scaling variables.


## What scaling changes and what it does not

Scaling improves many capabilities because larger models trained on more data can represent more patterns and compress more useful structure. But scaling does not automatically solve objective mismatch. A model can know a fact and still choose an unhelpful answer format. It can generate plausible reasoning that is not faithful to its internal computation. It can memorize rare strings. It can be sensitive to prompt wording. Scaling is a powerful ingredient, not a product guarantee.

Training large models is also a data-engineering project. Deduplication, document quality scoring, language balancing, code filtering, personally identifiable information handling, and benchmark decontamination all influence final behavior. Compute-optimal training on poor data is still poor training. Good teams evaluate data mixtures with small proxy models and ablations before spending a large compute budget.

### Decoding as behavior control

Decoding settings should match the application. For deterministic extraction, low temperature or constrained decoding may be best. For brainstorming, moderate sampling can improve diversity. For factual QA, retrieval and citation constraints may matter more than temperature. Beam search is attractive when there is a target sequence with a clear likelihood objective, but for chat it can amplify generic high-probability phrasing.

| Application | Decoding tendency | Extra control |
|---|---|---|
| JSON extraction | Low temperature or constrained decoding | Schema validation |
| Creative writing | Sampling with temperature/top-p | Safety and style filters |
| Code completion | Low/moderate temperature | Tests and static analysis |
| Customer support | Conservative sampling | Retrieval and escalation |

MoE adds another scaling axis but also operational complexity. Expert parallelism can make training communication-heavy. Routing imbalance wastes capacity. Expert specialization can be useful but hard to interpret. Serving must place experts so routing does not create unacceptable latency.

> **Interview tip:** Mention that loss improvements can be smooth while product metrics are not. A small perplexity gain may or may not matter for a specific workflow.

> **Common pitfall:** Reporting only average benchmark scores. Scaling decisions should inspect slices: language, domain, safety category, context length, and task type.


### Final drill: planning a pretraining run

A serious pretraining plan starts with the target capability and budget. Choose model size, token budget, context length, tokenizer, data mixture, and evaluation suite together. Decide checkpoint intervals and early-stop criteria before training. Track not only aggregate validation loss but also losses by data source, language, and domain. A model can improve overall while regressing on code or minority-language slices.

Infrastructure choices affect the model you can train. Sequence length changes attention cost. Activation checkpointing saves memory but adds compute. Data loading must keep accelerators fed. Fault tolerance matters because long runs will experience hardware failures. Reproducibility includes seeds, data versioning, tokenizer versioning, and exact optimizer schedule.

Scaling laws are guides, not substitutes for measurement. A smaller pilot can estimate data quality and loss trends, but emergent product behavior still needs downstream evaluation. After pretraining, instruction tuning, safety tuning, retrieval, and serving constraints shape the deployed assistant.

For decoding, include stop conditions, repetition penalties if used, maximum tokens, and safety filters. The same pretrained model can appear concise or rambling depending on these settings, so model comparisons should fix decoding parameters.


### Edge cases to mention

Scaling discussions should include contamination and memorization. If benchmark items, solutions, or near duplicates appear in training, measured capability is inflated. If private or copyrighted data is memorized, deployment risk increases. Deduplication, data audits, canary strings, and held-out contamination checks are therefore part of responsible scaling.

Another edge case is context length. Training with longer context does not guarantee the model uses distant evidence reliably. Long-context evaluations should test retrieval from different positions, distractors, multi-hop synthesis, and answer abstention. A model can accept a long prompt but still behave as if only the recent or salient part matters.


One final practical point is to document assumptions. Interviewers like candidates who name the hidden contract: what data is available, what latency is acceptable, what metric matters, and what failure is most costly. Stating those assumptions makes the modeling answer concrete and shows readiness for production trade-offs.
`,
    widgets: ["softmax-temperature"],
    flashcards: [
      { q: "What objective trains most decoder-only LLMs?", a: "Causal next-token prediction: maximize $p(x_t\\mid x_{<t})$ over text sequences." },
      { q: "Why is next-token prediction scalable?", a: "Raw text supplies labels automatically, allowing training on massive corpora without manual annotation." },
      { q: "Why is pretraining not enough for a chat assistant?", a: "It learns to predict text, not necessarily to follow instructions, be truthful, refuse unsafe requests, or match preferences." },
      { q: "What do scaling laws relate?", a: "Model loss or performance to parameters, data tokens, and compute." },
      { q: "What is the Chinchilla lesson?", a: "For fixed compute, balance model size with enough training tokens; many older large models were undertrained." },
      { q: "Why does data quality matter at scale?", a: "More tokens help only if they contain useful signal; low-quality or duplicated data can waste compute and increase memorization." },
      { q: "What is an MoE model?", a: "A model with many expert subnetworks where only a small subset is activated for each token." },
      { q: "What does the MoE router do?", a: "It selects which expert or experts process each token, often using learned softmax scores." },
      { q: "What is greedy decoding?", a: "Selecting the highest-probability next token at every step." },
      { q: "What is beam search?", a: "Keeping multiple high-scoring partial sequences and expanding them to find a high-likelihood output." },
      { q: "What does temperature control?", a: "The sharpness of the next-token distribution before sampling." },
      { q: "What is top-k sampling?", a: "Sampling only from the k highest-probability next tokens." },
      { q: "What is top-p sampling?", a: "Sampling from the smallest token set whose cumulative probability exceeds a threshold $p$." },
      { q: "Why can beam search be poor for open-ended chat?", a: "It often favors safe, generic, high-probability continuations and reduces diversity." },
      { q: "Why check benchmark contamination?", a: "A model may appear capable if evaluation examples or close copies were present in training data." },
    ],
    quiz: [
      {
        q: "The causal LM objective factorizes sequence probability as:",
        options: ["$\\prod_t p(x_t\\mid x_{<t})$", "$\\sum_t x_t$ only", "$p(x_1)$ only", "$\\max_t x_t$"],
        answer: 0,
        explanation: "Decoder-only LMs predict each token from prior tokens.",
      },
      {
        q: "Chinchilla-style scaling suggests:",
        options: ["Train larger models on fewer tokens always", "Balance parameters and data tokens for compute efficiency", "Use no validation data", "Remove tokenization"],
        answer: 1,
        explanation: "Compute-optimal training requires enough data for the chosen parameter count.",
      },
      {
        q: "In an MoE transformer, each token usually activates:",
        options: ["All experts always", "A small selected subset of experts", "No feedforward network", "Only the tokenizer"],
        answer: 1,
        explanation: "Sparse routing chooses top experts per token.",
      },
      {
        q: "Temperature greater than 1 generally makes sampling:",
        options: ["More deterministic", "More random/diverse", "Impossible", "Equivalent to beam search"],
        answer: 1,
        explanation: "Higher temperature flattens the probability distribution.",
      },
      {
        q: "Top-p sampling keeps:",
        options: ["A fixed number of tokens regardless of probability", "The smallest set with cumulative probability above p", "Only tokens with even IDs", "Only future tokens"],
        answer: 1,
        explanation: "Nucleus sampling adapts set size to distribution shape.",
      },
      {
        q: "Greedy decoding can fail because it:",
        options: ["Never chooses anything", "Can get stuck in locally likely but globally poor or repetitive continuations", "Requires labels during inference", "Uses no logits"],
        answer: 1,
        explanation: "Greedy optimizes one step at a time with no diversity.",
      },
      {
        q: "A key reason to deduplicate pretraining data is to:",
        options: ["Reduce memorization and contamination", "Make all tokens the same", "Disable evaluation", "Increase loss intentionally"],
        answer: 0,
        explanation: "Duplicates can waste compute and leak benchmark examples.",
      },
      {
        q: "The model distribution and decoding algorithm are:",
        options: ["The same thing", "Separate: logits define probabilities, decoding chooses actions from them", "Only used during training", "Unrelated to text generation"],
        answer: 1,
        explanation: "One model can be decoded many ways.",
      },
    ],
    resources: [
      { title: "Language Models are Few-Shot Learners", url: "https://arxiv.org/abs/2005.14165", type: "paper" },
      { title: "Training Compute-Optimal Large Language Models", url: "https://arxiv.org/abs/2203.15556", type: "paper" },
      { title: "Switch Transformers", url: "https://arxiv.org/abs/2101.03961", type: "paper" },
      { title: "Attention Is All You Need", url: "https://arxiv.org/abs/1706.03762", type: "paper" },
      { title: "Hugging Face NLP Course", url: "https://huggingface.co/learn", type: "course" },
    ],
  },
  {
    id: "fine-tuning-alignment",
    title: "Fine-tuning & Alignment",
    category: "NLP & LLMs",
    summary: "Fine-tuning adapts a pretrained model to tasks, domains, and human preferences. This topic covers supervised instruction tuning, parameter-efficient methods such as LoRA and QLoRA, RLHF, DPO, and forgetting risks.",
    notes: `
## From pretrained model to useful assistant

A pretrained language model can continue text, but a product assistant must follow instructions, format answers, use domain knowledge, and avoid harmful behavior. Fine-tuning changes the model or attached parameters using task-specific data. Alignment is the broader process of making outputs match human intentions, policy, and preferences. In practice, teams combine prompt design, supervised fine-tuning, preference optimization, retrieval, guardrails, and evaluation.

Supervised fine-tuning, or SFT, trains on input-output examples. For instruction tuning, examples look like prompts paired with helpful responses. The loss is still usually token-level cross-entropy on the desired response, but the data distribution teaches the model to answer rather than merely continue.

## Full fine-tuning and PEFT

Full fine-tuning updates all model weights. It is flexible but expensive and can overfit or forget. Parameter-efficient fine-tuning updates a small number of parameters while freezing most of the base model. This reduces memory, enables multiple task adapters, and lowers operational risk.

LoRA inserts low-rank update matrices into selected linear layers. Instead of updating a full weight matrix $W$, it learns

$$
W' = W + \\frac{\\alpha}{r}BA,
$$

where $A \\in \\mathbb{R}^{r\\times d}$, $B \\in \\mathbb{R}^{k\\times r}$, and $r$ is small. QLoRA combines quantized base weights with LoRA adapters, allowing fine-tuning of large models on smaller hardware by storing the frozen base in low precision while training adapter parameters.

| Method | What changes | Strength | Risk |
|---|---|---|---|
| Full fine-tuning | All weights | Maximum flexibility | Costly; forgetting; deployment complexity |
| LoRA | Low-rank adapters | Cheap, modular, strong quality | Rank/target-layer choices matter |
| QLoRA | Quantized base plus LoRA | Fits larger models on limited memory | Quantization and optimizer details matter |
| Prompt tuning | Learned prompt vectors | Very parameter-light | Less expressive for hard shifts |

> **Interview tip:** PEFT is not only about saving GPU memory. It also makes it easier to store, swap, audit, and roll back task-specific behavior.

## RLHF

Reinforcement Learning from Human Feedback usually has three stages. First, train or choose an SFT model. Second, collect human preferences between model outputs and train a reward model to predict preferred responses. Third, optimize the policy to maximize reward while staying close to the SFT model, often with a KL penalty:

$$
\\max_\\theta \\; \\mathbb{E}[r_\\phi(y,x)] - \\beta D_{KL}(\\pi_\\theta(\\cdot\\mid x)\\|\\pi_{ref}(\\cdot\\mid x)).
$$

The KL term matters because a reward model is imperfect. Without a constraint, the policy can exploit reward-model bugs and produce unnatural text. PPO has historically been used, though many systems now use simpler preference-optimization methods.

## DPO and preference optimization

Direct Preference Optimization uses preference pairs without training a separate reward model in the same way as RLHF. It optimizes the policy so chosen responses become more likely than rejected responses relative to a reference model. A simplified DPO loss is

$$
-\\log \\sigma\\left(\\beta\\left[\\log\\frac{\\pi_\\theta(y_w\\mid x)}{\\pi_{ref}(y_w\\mid x)}-\\log\\frac{\\pi_\\theta(y_l\\mid x)}{\\pi_{ref}(y_l\\mid x)}\\right]\\right).
$$

DPO is attractive because it is stable and easier to implement than online RL, but it still depends on preference data quality. Preferences can encode style, safety, factuality, refusal behavior, or hidden biases.

## Catastrophic forgetting and domain adaptation

Fine-tuning on narrow data can erase general capabilities. This is catastrophic forgetting. Mitigations include small learning rates, early stopping, mixing general data, freezing most layers, PEFT, replay, and careful evaluation. Domain tuning should improve target performance without breaking broad instruction following, safety, or calibration.

Data quality is more important than volume. A thousand excellent demonstrations can outperform many noisy ones. For instruction tuning, include negative cases, formatting requirements, tool-use examples, and refusal examples if they matter to the product. For code or medical domains, ensure licenses, privacy, and evaluation standards are appropriate.

> **Common pitfall:** Treating alignment as one training job. Alignment is an iterative system process: collect data, tune, evaluate, red-team, update policy, and monitor after deployment.

## Worked example: support assistant

A company wants an LLM to answer internal support questions. SFT teaches response format and domain tone using curated tickets. LoRA adapters reduce cost and make rollback easy. Preference tuning ranks answers that cite internal policy higher than vague answers. Retrieval supplies up-to-date documents so the model does not memorize changing policy. Evaluation checks helpfulness, citation accuracy, refusal behavior, and regressions on general tasks.

## Interview checklist

Define SFT as supervised learning on demonstrations. Explain LoRA with the low-rank update equation and QLoRA as quantized-base adapter tuning. Describe RLHF stages and why KL regularization prevents reward hacking. Explain DPO as direct optimization on preference pairs relative to a reference. Mention catastrophic forgetting, data curation, and evaluation. A strong answer also says when not to fine-tune: if the problem is freshness or private knowledge, RAG may be safer than changing weights.


## Data curation for tuning

Fine-tuning quality is usually data-limited before it is algorithm-limited. Demonstrations should represent the target users, input messiness, refusal boundaries, and output formats. If examples are overly polished, the model may fail on real prompts. If examples contain hidden contradictions, the model learns inconsistent behavior. For domain assistants, include questions that should be answered, questions that should be escalated, and questions that should be refused.

Preference data needs the same care. A chosen response should be better for a stated reason, not merely longer. Rubrics reduce annotator drift: factuality, completeness, citation quality, tone, safety, and concision can be scored separately. Without rubrics, preference optimization can teach superficial style such as excessive confidence or verbosity.

### Operating adapters and aligned models

Adapters introduce lifecycle questions. Which base checkpoint are they compatible with? Which data produced them? Can two adapters be merged? How are they evaluated before release? Can they be disabled quickly after a regression? These questions matter in enterprise systems where many teams want custom behavior but the platform must preserve safety and reliability.

| Risk | Mitigation | Evaluation |
|---|---|---|
| Forgetting general skills | PEFT, low LR, mixed data | Regression suite |
| Style over-optimization | Better rubrics, length controls | Blind preference tests |
| Unsafe compliance | Refusal examples and policy data | Red-team prompts |
| Domain hallucination | RAG plus citation checks | Faithfulness metrics |

Alignment also interacts with prompts and tools. A tuned model may follow instructions well, but a system prompt, retrieval context, or tool schema can still steer behavior. Conversely, a strong prompt cannot reliably compensate for a model never trained to follow instructions in that domain.

> **Interview tip:** If asked how to choose between SFT, DPO, and RLHF, answer in terms of available data and complexity: demonstrations for SFT, preference pairs for DPO, and reward-model/online optimization when you can support the extra machinery.

> **Common pitfall:** Fine-tuning to add changing facts. If the knowledge changes weekly, update a retriever or database; do not repeatedly bake volatile data into weights unless there is a clear reason.


### Final drill: evaluation before release

Before releasing a tuned model, build a regression suite. Include base capabilities that should not degrade, domain tasks that should improve, safety prompts, formatting tests, tool-use tests if relevant, and adversarial prompts. Compare against the base model, the previous tuned model, and a prompt-only baseline. If the tuned model wins only because responses are longer, adjust rubrics and length controls.

For LoRA or QLoRA, evaluate merged and unmerged serving paths if both are possible. Quantization can interact with adapters. Also check multi-turn behavior: a model may answer single-turn examples well but lose instructions across turns. If the product requires citations, evaluate citation faithfulness rather than just answer plausibility.

Human review remains important for alignment because many qualities are contextual. However, human review should be sampled and structured, not anecdotal. Use clear rubrics, blinded comparisons, and disagreement analysis. LLM judges can triage at scale, but keep a human-labeled set to detect judge drift.

A concise interview close: SFT teaches demonstrations, PEFT makes adaptation efficient, RLHF/DPO optimize preferences, and evaluation plus monitoring determine whether the adaptation is safe and useful in deployment.


### Edge cases to mention

Fine-tuning can change style more easily than knowledge. If examples repeatedly answer with a certain format, the model learns that format quickly; if examples require deep new domain expertise, the model may imitate vocabulary without becoming reliable. For regulated domains, this means tuning should be paired with retrieval, citations, expert review, and conservative refusal behavior.

Multi-adapter systems need conflict handling. A legal adapter and a sales adapter may prefer different tone, detail, or refusal boundaries. Routing prompts to adapters, composing adapters, or selecting a base model plus retrieval policy becomes a product decision. Keep evaluation per adapter and across combined workflows so a local improvement does not create global inconsistency.


One final practical point is to document assumptions. Interviewers like candidates who name the hidden contract: what data is available, what latency is acceptable, what metric matters, and what failure is most costly. Stating those assumptions makes the modeling answer concrete and shows readiness for production trade-offs.


For a final interview sentence, tie the method back to risk: the best solution is the one that improves the target behavior while making its assumptions, monitoring plan, and rollback path explicit.`,
    flashcards: [
      { q: "What is supervised fine-tuning?", a: "Training a pretrained model on prompt-response demonstrations using token-level supervised loss." },
      { q: "What is instruction tuning?", a: "SFT on diverse instructions so the model learns to follow user requests rather than merely continue text." },
      { q: "What is PEFT?", a: "Parameter-efficient fine-tuning: adapting a model by training a small number of parameters while freezing most base weights." },
      { q: "What is LoRA?", a: "A method that adds trainable low-rank updates to selected weight matrices while keeping original weights frozen." },
      { q: "Write the LoRA update form.", a: "$W\\prime = W + (\\u0007lpha/r)BA$, where $r$ is the low rank." },
      { q: "What is QLoRA?", a: "Fine-tuning LoRA adapters while storing the frozen base model in quantized form to save memory." },
      { q: "What is RLHF?", a: "A pipeline that uses human preferences to train a reward model and optimize the language model toward preferred outputs." },
      { q: "Why use a KL penalty in RLHF?", a: "To keep the optimized policy close to a reference model and reduce reward hacking or unnatural drift." },
      { q: "What is DPO?", a: "Direct Preference Optimization, a preference-training method that increases likelihood of chosen responses over rejected ones relative to a reference." },
      { q: "What is catastrophic forgetting?", a: "Loss of general capabilities or prior knowledge after fine-tuning on narrow data." },
      { q: "How can forgetting be mitigated?", a: "Use PEFT, small learning rates, early stopping, mixed data, replay, and regression evaluations." },
      { q: "When is RAG preferable to fine-tuning?", a: "When knowledge changes often, must be cited, or should remain outside model weights." },
      { q: "What matters most for SFT data?", a: "High-quality, representative demonstrations with correct format, reasoning level, and safety behavior." },
      { q: "What is reward hacking?", a: "The model exploits flaws in a reward model to get high reward without truly satisfying human intent." },
      { q: "Why keep adapters modular?", a: "They can be swapped, versioned, audited, or rolled back without duplicating the full model." },
    ],
    quiz: [
      {
        q: "SFT primarily trains on:",
        options: ["Prompt-response demonstrations", "Only unlabeled raw text with no prompts", "GPU logs", "Database indexes"],
        answer: 0,
        explanation: "Supervised fine-tuning uses desired outputs as labels.",
      },
      {
        q: "LoRA reduces trainable parameters by:",
        options: ["Learning low-rank updates to selected matrices", "Deleting attention layers", "Using no gradients", "Changing every token into one character"],
        answer: 0,
        explanation: "LoRA freezes the base and learns low-rank adapter matrices.",
      },
      {
        q: "QLoRA is useful because it:",
        options: ["Stores the frozen base model in quantized form while training adapters", "Requires no data", "Can only train word2vec", "Removes all evaluation"],
        answer: 0,
        explanation: "Quantization reduces memory footprint for fine-tuning.",
      },
      {
        q: "In RLHF, the reward model is trained from:",
        options: ["Human or AI preference comparisons", "Only random numbers", "Image pixels exclusively", "Optimizer names"],
        answer: 0,
        explanation: "Preference data teaches the reward model which outputs are better.",
      },
      {
        q: "The KL term in RLHF helps prevent:",
        options: ["Policy drifting too far from a reference", "Tokenization from happening", "Any use of GPUs", "Evaluation metrics"],
        answer: 0,
        explanation: "It constrains optimization against reward-model exploitation.",
      },
      {
        q: "DPO directly uses:",
        options: ["Preference pairs of chosen and rejected responses", "Only convolution kernels", "No reference model concept", "SQL schemas"],
        answer: 0,
        explanation: "DPO optimizes chosen-vs-rejected likelihood ratios.",
      },
      {
        q: "Catastrophic forgetting means:",
        options: ["The model loses previous capabilities after narrow tuning", "The tokenizer splits words", "The context window gets longer", "Beam search keeps beams"],
        answer: 0,
        explanation: "Fine-tuning can overwrite general behavior.",
      },
      {
        q: "If a product needs up-to-date private policy answers, the first tool to consider is often:",
        options: ["Retrieval augmentation", "Random temperature increases", "Removing all safety data", "Only greedy decoding"],
        answer: 0,
        explanation: "RAG can access current documents without baking them into weights.",
      },
    ],
    resources: [
      { title: "LoRA: Low-Rank Adaptation of Large Language Models", url: "https://arxiv.org/abs/2106.09685", type: "paper" },
      { title: "QLoRA: Efficient Finetuning of Quantized LLMs", url: "https://arxiv.org/abs/2305.14314", type: "paper" },
      { title: "Training language models to follow instructions with human feedback", url: "https://arxiv.org/abs/2203.02155", type: "paper" },
      { title: "Direct Preference Optimization", url: "https://arxiv.org/abs/2305.18290", type: "paper" },
      { title: "Hugging Face NLP Course", url: "https://huggingface.co/learn", type: "course" },
    ],
  },
  {
    id: "rag-agents-llm-evaluation",
    title: "RAG, Agents & LLM Evaluation",
    category: "NLP & LLMs",
    summary: "RAG systems ground generation in retrieved evidence, while agentic systems let models call tools and plan multi-step work. This topic covers retrieval pipelines, hallucination controls, evaluation metrics, LLM-as-judge, guardrails, and tool use.",
    notes: `
## Why RAG exists

Retrieval-Augmented Generation connects an LLM to external knowledge at inference time. Instead of expecting model weights to memorize every fact, the system retrieves relevant documents and includes them in the prompt. This improves freshness, citation, access control, and debuggability. It is not magic: if retrieval fails, chunking loses context, or the generator ignores evidence, the answer can still be wrong.

A typical RAG pipeline ingests documents, cleans and chunks them, embeds chunks, stores vectors and metadata, retrieves candidates for a query, optionally reranks them, builds a grounded prompt, generates an answer, and logs evidence for evaluation. Every stage is an optimization surface.

## Chunking and retrieval

Chunking controls the unit of retrieval. Small chunks improve precise matching but may omit necessary context. Large chunks preserve context but dilute embeddings and waste prompt budget. Overlap helps when answers straddle boundaries. Structure-aware chunking uses headings, tables, code blocks, or document sections instead of fixed character counts.

Dense retrieval uses embedding similarity, often cosine similarity:

$$
\\cos(q,d)=\\frac{q\\cdot d}{\\|q\\|\\|d\\|}.
$$

Sparse retrieval such as BM25 uses lexical matching and is strong for exact terms, IDs, and rare names. Hybrid retrieval combines dense semantic recall with sparse precision. Metadata filters enforce tenant, time, permission, language, or product constraints.

| Stage | Common metric | Failure mode |
|---|---|---|
| Indexing | Coverage, freshness | Missing or stale documents |
| Retrieval | Recall@k, MRR | Correct chunk not retrieved |
| Reranking | nDCG, precision@k | Good chunk ranked too low |
| Generation | Faithfulness, answer accuracy | Hallucination or unsupported claim |
| System | Latency, cost, refusal quality | Too slow or unsafe |

## Reranking and grounding

A reranker scores query-document pairs more carefully than the first-stage retriever. Cross-encoders can read query and chunk jointly, improving precision at the cost of latency. The generator should be instructed to answer from evidence, cite sources, and say when evidence is insufficient. Grounding can be improved with quote extraction, answer sentence attribution, constrained generation, and post-generation verification.

> **Common pitfall:** Measuring only final answer quality hides retrieval problems. Track whether the needed evidence was retrieved before judging the generator.

## Hallucination and guardrails

Hallucination is not one phenomenon. The model may invent a fact, use stale knowledge, combine incompatible sources, overgeneralize, or answer despite missing evidence. RAG reduces hallucination when evidence is relevant and the prompt enforces faithfulness. It can increase confusion when retrieved chunks are noisy or contradictory.

Guardrails include input validation, output schema checks, policy classifiers, citation requirements, tool permissioning, prompt-injection defenses, and human review for high-risk actions. Guardrails should be layered because no single classifier or prompt instruction is reliable against all inputs.

## LLM evaluation

Evaluation should match the product. For RAG, measure retrieval recall, context precision, answer faithfulness, citation accuracy, latency, and cost. For chat, measure helpfulness, instruction following, safety, refusal calibration, tone, and task success. For extraction, use exact match, F1, schema validity, and human review on ambiguous cases.

LLM-as-judge can scale qualitative evaluation by asking a strong model to grade outputs with a rubric. It is useful but can be biased by verbosity, position, model family, and prompt wording. Calibrate judges against human labels, blind them to system identity, randomize answer order, and keep gold test sets for critical decisions.

> **Interview tip:** Present evaluation as a funnel: retrieval quality first, then grounded generation quality, then end-to-end user outcome. This helps isolate where a RAG system fails.

## Tool use and agents

An agentic LLM system lets the model call tools, observe results, and decide next steps. Tools can include search, calculators, databases, code execution, calendars, or ticket systems. Agents are useful when tasks require stateful multi-step workflows, but they add risk: loops, tool misuse, prompt injection, hidden side effects, and hard-to-reproduce traces.

A robust agent defines available tools, schemas, permissions, budgets, memory scope, and stopping conditions. The system should log tool calls and observations. For high-impact actions, use confirmation or human approval. Planning can be explicit, but overly long hidden plans may waste tokens; many production systems use small loops with strict budgets.

## Worked example: enterprise policy bot

A user asks whether a contractor can access a dataset. The RAG system should filter documents by tenant and policy version, retrieve access-control policy chunks, rerank for the exact contractor and dataset terms, and answer with citations. If evidence is missing or contradictory, the correct behavior is not a confident guess; it is an uncertainty response or escalation. An agent version might open an access ticket, but only after checking permissions and obtaining confirmation.

## Interview checklist

For RAG, explain ingestion, chunking, embeddings, vector search, hybrid retrieval, reranking, prompt assembly, and grounded generation. For evaluation, separate retrieval metrics from answer metrics and mention LLM-as-judge calibration. For agents, discuss tool schemas, permissions, loops, logging, and guardrails. Strong answers emphasize that RAG and agents are systems: the LLM is one component, not the entire product.


## Diagnosing RAG failures

When a RAG answer is wrong, split the failure. Was the document in the corpus? Was it chunked with enough context? Did the retriever return it? Did the reranker promote it? Did the prompt include it? Did the generator use it faithfully? This decomposition turns a vague hallucination complaint into measurable engineering work. A dashboard should show retrieved chunk IDs, scores, citations, answer text, latency, and user feedback.

Chunk quality often determines retrieval quality. Tables may need special serialization. PDFs may contain headers, footers, and reading-order errors. Code repositories need symbol-aware chunking. Legal documents need section hierarchy. Blind fixed-size chunking is a baseline, not an endpoint.

### Evaluation sets and judges

A good RAG eval set contains queries, expected answer criteria, and gold supporting documents. Some questions should be unanswerable from the corpus to test refusal. Some should require combining multiple chunks. Some should contain tempting distractors. This prevents a system from looking good only on easy fact lookups.

| Eval item | What it tests | Example failure |
|---|---|---|
| Answerable fact | Basic retrieval and grounding | Missed exact policy |
| Multi-hop question | Context combination | Retrieves only one piece |
| Unanswerable query | Refusal calibration | Hallucinates confidently |
| Adversarial context | Prompt-injection defense | Follows malicious chunk |

For agents, evaluation should include trace quality, not just final answer. Did the model call the right tool? Were arguments valid? Did it stop after success? Did it avoid side effects? Replaying traces is essential for debugging because agent failures may be nondeterministic.

> **Interview tip:** Say that citations are not enough. A citation can point to a retrieved document while the answer still makes an unsupported claim, so faithfulness checking must compare claim to evidence.

> **Common pitfall:** Giving the model unrestricted tools and hoping prompting will enforce policy. Tool permissions and sandboxing should be enforced outside the model.


### Final drill: production hardening

A production RAG system needs access control at retrieval time, not only after generation. If the retriever can fetch documents the user is not allowed to see, the prompt may leak them. Metadata filters, tenant isolation, audit logs, and encryption boundaries are therefore part of the ML design. Freshness also matters: document ingestion should expose version time, source, and deletion handling.

Prompt injection defenses should assume retrieved text may be hostile. The system can separate instructions from evidence, quote evidence rather than execute it, strip active content, and restrict tool calls. A chunk saying "ignore previous instructions" should be treated as data, not policy. For agents, tool outputs should also be untrusted unless the tool is trusted and schema-validated.

Evaluation should include cost and latency. Reranking every chunk with a large cross-encoder may improve quality but miss product SLAs. Caching, query rewriting, smaller rerankers, and staged retrieval are common compromises. User feedback loops should distinguish bad retrieval, bad synthesis, missing corpus, and policy refusal disagreement.

A strong closing answer: RAG quality is bounded by corpus quality, retrieval recall, prompt grounding, and evaluation discipline; agents add action and state, so they require stricter permissions and trace monitoring.


### Edge cases to mention

RAG can fail when the correct answer is absent. In that case the desired behavior is calibrated abstention, not the closest plausible answer. Include unanswerable questions in evaluation so the model learns and is measured on saying "not enough evidence". Also test conflicting evidence: policy documents may disagree because one is outdated. The system should prefer the authoritative or latest source, not average them.

For agents, idempotency matters. Retrying a read-only search is safe; retrying a payment, email, or ticket creation may duplicate side effects. Tool design should mark operations as read or write, require confirmations for high-impact writes, and log unique operation IDs. These details are often what separate a demo agent from a deployable one.


One final practical point is to document assumptions. Interviewers like candidates who name the hidden contract: what data is available, what latency is acceptable, what metric matters, and what failure is most costly. Stating those assumptions makes the modeling answer concrete and shows readiness for production trade-offs.


For a final interview sentence, tie the method back to risk: the best solution is the one that improves the target behavior while making its assumptions, monitoring plan, and rollback path explicit.

When time is short, summarize the trade-off plainly: optimize the measurable bottleneck, keep humans or validators in the loop for high-risk outputs, and test the exact deployment path rather than a simplified demo.`,
    flashcards: [
      { q: "What is RAG?", a: "Retrieval-Augmented Generation: retrieving external evidence and conditioning the LLM answer on that evidence." },
      { q: "Why use RAG instead of only fine-tuning?", a: "RAG handles fresh, private, cited, or access-controlled knowledge without changing model weights." },
      { q: "What is chunking?", a: "Splitting documents into retrieval units that balance context preservation and precise matching." },
      { q: "Why use chunk overlap?", a: "It reduces boundary failures when an answer spans two chunks." },
      { q: "Dense vs sparse retrieval?", a: "Dense retrieval uses embedding similarity; sparse retrieval uses lexical term matching such as BM25." },
      { q: "Why hybrid retrieval?", a: "It combines semantic recall with exact-match strength for names, IDs, and rare terms." },
      { q: "What does a reranker do?", a: "It reorders retrieved candidates using a more precise query-document scoring model." },
      { q: "What is hallucination in RAG?", a: "An answer claim that is unsupported, contradicted, stale, or fabricated relative to available evidence." },
      { q: "Name two RAG retrieval metrics.", a: "Recall@k and MRR; nDCG is also common when rankings matter." },
      { q: "What is faithfulness?", a: "Whether generated claims are supported by the provided context." },
      { q: "What is LLM-as-judge?", a: "Using an LLM to grade outputs against a rubric, often for scalable qualitative evaluation." },
      { q: "Why calibrate LLM judges?", a: "They can be biased by style, verbosity, position, or model familiarity." },
      { q: "What is an agent tool schema?", a: "A structured definition of a callable tool, its arguments, permissions, and expected outputs." },
      { q: "Why are guardrails layered?", a: "Prompts, classifiers, schemas, and permissions each fail differently; layers reduce combined risk." },
      { q: "What is prompt injection in RAG?", a: "Malicious retrieved or user text tries to override system instructions or misuse tools." },
    ],
    quiz: [
      {
        q: "The first-stage retriever in RAG should be evaluated with:",
        options: ["Recall@k for relevant evidence", "Only GPU fan speed", "The number of hidden layers", "Temperature"],
        answer: 0,
        explanation: "If evidence is not retrieved, generation cannot be grounded.",
      },
      {
        q: "A main chunking trade-off is:",
        options: ["Precision versus context completeness", "Labels versus weights only", "FP16 versus BF16 only", "Beam width versus optimizer"],
        answer: 0,
        explanation: "Small chunks are precise; large chunks preserve context but may dilute matching.",
      },
      {
        q: "Hybrid retrieval combines:",
        options: ["Dense semantic and sparse lexical signals", "Only two dropout masks", "Two random prompts", "Training and validation labels"],
        answer: 0,
        explanation: "Hybrid search uses both embedding and term-based strengths.",
      },
      {
        q: "A reranker usually improves:",
        options: ["Candidate ordering after initial retrieval", "Tokenizer vocabulary size only", "GPU installation", "The number of documents ingested by magic"],
        answer: 0,
        explanation: "Rerankers score query-document pairs more precisely.",
      },
      {
        q: "Faithfulness measures whether:",
        options: ["Answer claims are supported by context", "The model uses a high temperature", "The UI is colorful", "The batch size is large"],
        answer: 0,
        explanation: "Grounded answers should be traceable to evidence.",
      },
      {
        q: "LLM-as-judge should be:",
        options: ["Calibrated against human labels and rubrics", "Trusted blindly for every decision", "Used without prompts", "Limited to sorting tokens alphabetically"],
        answer: 0,
        explanation: "Judges can be biased, so calibration and controls matter.",
      },
      {
        q: "An agent is most appropriate when:",
        options: ["A task requires multi-step tool use under constraints", "A static FAQ answer is enough", "No logging is possible", "The model must avoid all external actions"],
        answer: 0,
        explanation: "Agents coordinate tool calls and observations for workflows.",
      },
      {
        q: "A guardrail for tool-using agents is:",
        options: ["Permission checks and action budgets", "Unlimited recursive tool calls", "Ignoring tool outputs", "Removing all schemas"],
        answer: 0,
        explanation: "Permissions, budgets, and schemas reduce unsafe behavior.",
      },
    ],
    resources: [
      { title: "Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks", url: "https://arxiv.org/abs/2005.11401", type: "paper" },
      { title: "RAGAS: Automated Evaluation of Retrieval Augmented Generation", url: "https://arxiv.org/abs/2309.15217", type: "paper" },
      { title: "Hugging Face NLP Course", url: "https://huggingface.co/learn", type: "course" },
      { title: "BEIR: A Heterogeneous Benchmark for Zero-shot Evaluation of Information Retrieval Models", url: "https://arxiv.org/abs/2104.08663", type: "paper" },
      { title: "Toolformer", url: "https://arxiv.org/abs/2302.04761", type: "paper" },
    ],
  },
  {
    id: "llm-inference-optimization",
    title: "LLM Inference Optimization",
    category: "NLP & LLMs",
    summary: "LLM serving is dominated by memory movement, KV cache growth, batching, and attention kernels. This topic covers quantization, cache management, paged attention, speculative decoding, batching, and FlashAttention.",
    notes: `
## Why inference optimization is different from training

Training processes large batches with full sequences and backward passes. Autoregressive inference often generates one token at a time, where each new token depends on all previous tokens. The workload alternates between prefill, which processes the prompt, and decode, which produces tokens incrementally. Prefill is compute-heavy and parallel over prompt tokens; decode is often memory-bandwidth-bound because it reads model weights and KV cache for each generated token.

The serving goal is not only low latency. Systems balance time-to-first-token, tokens per second, throughput under many users, cost per token, memory capacity, quality, and isolation across tenants.

## Quantization

Quantization stores weights or activations in fewer bits, such as INT8, INT4, or FP8. Weight-only quantization reduces memory bandwidth and model footprint while leaving activations in higher precision. Activation quantization can further speed computation but is harder because activation ranges vary by input. Calibration estimates scales so real values can be mapped to integers:

$$
x \\approx s(q-z),
$$

where $q$ is an integer code, $s$ is a scale, and $z$ is a zero point. Group-wise quantization uses separate scales for groups of channels, improving accuracy at modest overhead.

Quantization trades quality for efficiency. LLMs can be surprisingly robust to weight quantization, but outlier channels, small models, math tasks, and long-context behavior can suffer. Always evaluate the target workload, not just perplexity.

> **Common pitfall:** Assuming "4-bit" means all memory is quartered. KV cache, activations, optimizer state during fine-tuning, metadata, and fragmentation can dominate in different settings.

## KV cache and paged attention

A transformer decoder stores keys and values for every generated prefix token in every layer. KV cache memory grows as

$$
O(B \\cdot L \\cdot H \\cdot T \\cdot d_h),
$$

where $B$ is batch size, $L$ layers, $H$ heads, $T$ context length, and $d_h$ head dimension. Multi-query attention and grouped-query attention reduce cache size by sharing key/value heads across query heads.

Paged attention treats KV cache like virtual memory pages. Instead of requiring each request's cache to be one contiguous block, it stores fixed-size blocks and maps logical token positions to physical blocks. This reduces fragmentation and enables efficient batching of requests with different lengths. It is a systems idea applied to attention memory.

## FlashAttention

Standard attention can materialize the $n\\times n$ attention matrix, which is expensive in high-bandwidth memory. FlashAttention computes exact attention using tiling, streaming softmax statistics, and recomputation strategies to reduce memory reads and writes. It does not change the mathematical result; it changes how the result is computed on the GPU.

The key trick is IO awareness. GPUs have fast on-chip SRAM and slower high-bandwidth memory. By processing blocks of Q, K, and V and maintaining numerically stable softmax summaries, FlashAttention avoids storing the full attention matrix. It is most helpful for long sequences and training/prefill workloads where attention matrices are large.

> **Interview tip:** Describe FlashAttention as an exact attention kernel optimized for memory IO, not as an approximate sparse-attention algorithm.

## Batching and scheduling

Serving systems batch requests to improve hardware utilization. Static batching waits to collect requests, which increases throughput but hurts latency. Dynamic batching groups requests that arrive close together. Continuous batching can add and remove sequences from a running decode batch at token boundaries, keeping GPUs busy even when requests have different lengths.

There are two latency metrics to separate. Time-to-first-token measures prompt processing and queueing. Inter-token latency measures decode speed after generation begins. A system may have fast prefill but slow decode, or high throughput but poor tail latency under load.

## Speculative decoding

Speculative decoding uses a small draft model to propose several tokens, then a larger target model verifies them. If the target model accepts the draft tokens, multiple tokens are produced with fewer target forward passes. If it rejects, the algorithm falls back while preserving the target distribution under the correct acceptance rule.

The speedup depends on draft quality, target cost, acceptance rate, and implementation overhead. It works best when the draft model is much cheaper and usually predicts what the target would sample. It is less useful when outputs are highly uncertain or the draft model is poorly matched.

## Worked serving diagnosis

Suppose a chat service has acceptable quality but high cost and slow responses for long prompts. First separate prefill and decode metrics. If prefill dominates, optimize prompt length, FlashAttention kernels, and prompt caching. If decode dominates, inspect KV-cache memory bandwidth, quantization, batching, and GQA/MQA architecture. If memory fragmentation causes low batch sizes, paged attention or better cache allocation may help. If tail latency spikes, scheduling and admission control may matter more than model math.

## Interview checklist

A complete inference answer covers model compression, attention kernels, cache memory, and scheduling. Quantization reduces model memory but must be evaluated for quality. KV cache trades memory for avoiding recomputation. Paged attention manages cache fragmentation. FlashAttention reduces attention IO exactly. Speculative decoding trades a draft model for fewer target passes. Batching improves throughput but can hurt latency, so always specify which serving metric you are optimizing.


## Capacity planning mental model

LLM inference capacity is constrained by model weights, KV cache, activation workspace, and scheduler efficiency. A small batch may underuse compute, while a large batch may exceed KV memory or hurt latency. Long prompts stress prefill and attention kernels. Long generations stress decode and cache bandwidth. The best optimization depends on which resource is saturated.

A rough memory budget starts with parameter memory: parameters times bytes per parameter. Quantization reduces this part. Then add KV cache: layers times tokens times key/value heads times head dimension times bytes. For long-context chat, KV cache can dominate even if weights are quantized. Finally add temporary buffers, fragmentation, and framework overhead.

### Optimization choices by bottleneck

If weights dominate memory, use quantization, smaller models, distillation, or tensor parallelism. If KV cache dominates, use shorter contexts, eviction, summarization, MQA/GQA, paged attention, or lower-precision cache. If prefill is slow, use FlashAttention, prompt caching, shorter prompts, or better batching. If decode is slow, improve continuous batching, speculative decoding, or choose a model architecture with cheaper KV access.

| Bottleneck | Symptom | Candidate fix |
|---|---|---|
| Weight bandwidth | Low decode throughput | Quantization, batching |
| KV memory | Few concurrent long requests | Paged cache, GQA, context limits |
| Prefill compute | Slow first token for long prompts | FlashAttention, prompt caching |
| Scheduler | Poor tail latency | Admission control, priority queues |

Speculative decoding is most attractive when user-visible latency matters and a cheap draft model has high agreement with the target. It is less attractive if the target model is already small, the draft is inaccurate, or batching overhead dominates.

> **Interview tip:** Always name the metric: time-to-first-token, inter-token latency, throughput, cost per million tokens, or tail latency. Optimizing one can hurt another.

> **Common pitfall:** Benchmarking with fixed-length synthetic prompts only. Real traffic has variable prompt lengths, generation lengths, cancellation, retries, and tenant priorities.


### Final drill: quality versus speed

Many inference optimizations can change quality if applied carelessly. Weight quantization may hurt rare-token probabilities or math reasoning. KV-cache quantization may affect long-context attention. Aggressive context truncation can remove needed evidence. Speculative decoding should preserve the target distribution when implemented correctly, but approximate variants or different sampling settings can change outputs. Always run quality evaluations after performance changes.

Serving also has product-level behaviors. Streaming improves perceived latency even if total generation time is unchanged. Caching system prompts can reduce repeated prefill cost. Prompt compaction can cut tokens but may remove nuance. Admission control can protect tail latency for premium or urgent requests. These are systems choices as much as model choices.

For capacity, benchmark with realistic traffic: prompt length distribution, output length distribution, concurrent users, cancellation, retries, and tool calls. Report p50, p95, and p99 latency, not only averages. Measure tokens per second per accelerator and cost per successful request.

A concise interview close: identify the bottleneck, choose an optimization targeted at that bottleneck, verify quality, and measure the serving metric that the product actually cares about.


### Edge cases to mention

Multi-tenant serving adds fairness and isolation concerns. One user's very long request can consume KV cache and slow everyone else unless the scheduler enforces limits. Rate limits, maximum context, maximum generation length, and priority queues are part of inference optimization. They are not merely business rules; they protect latency and availability.

Hardware details also matter. An optimization that helps on one GPU generation may not help on another because memory bandwidth, tensor-core support, and kernel implementations differ. Benchmark the actual deployment stack, including framework version and quantization kernels. For CPU or edge inference, batching and memory layout constraints can be completely different from data-center GPU serving.


One final practical point is to document assumptions. Interviewers like candidates who name the hidden contract: what data is available, what latency is acceptable, what metric matters, and what failure is most costly. Stating those assumptions makes the modeling answer concrete and shows readiness for production trade-offs.


For a final interview sentence, tie the method back to risk: the best solution is the one that improves the target behavior while making its assumptions, monitoring plan, and rollback path explicit.`,
    flashcards: [
      { q: "What is prefill in LLM serving?", a: "Processing the prompt tokens to initialize hidden states and KV cache before generation." },
      { q: "What is decode?", a: "Autoregressively generating new tokens, usually one step at a time using the KV cache." },
      { q: "Why is decode often memory-bandwidth-bound?", a: "Each token step reads model weights and KV cache while doing relatively little batch-parallel compute." },
      { q: "What is quantization?", a: "Representing weights or activations with lower-precision formats to reduce memory and improve speed." },
      { q: "What is weight-only quantization?", a: "Only model weights are stored in lower precision while activations may remain higher precision." },
      { q: "What is a quantization scale?", a: "A factor mapping integer codes back to approximate real values." },
      { q: "What is KV cache memory proportional to?", a: "Batch size, layers, KV heads, context length, and head dimension." },
      { q: "How do MQA/GQA reduce cache memory?", a: "They share key/value heads across multiple query heads." },
      { q: "What is paged attention?", a: "A KV-cache management method using fixed-size blocks/pages to reduce fragmentation and support dynamic batching." },
      { q: "What is FlashAttention?", a: "An exact attention algorithm/kernel that reduces high-bandwidth-memory IO using tiling and streaming softmax." },
      { q: "Is FlashAttention approximate?", a: "No. It computes exact attention more efficiently; it is not sparse approximation." },
      { q: "What is continuous batching?", a: "A serving strategy that adds/removes requests at token boundaries to keep accelerators utilized." },
      { q: "What is time-to-first-token?", a: "Latency until the first generated token appears, including queueing and prefill." },
      { q: "What is speculative decoding?", a: "A draft model proposes tokens and a target model verifies them to reduce target forward passes." },
      { q: "When can speculative decoding fail to speed up much?", a: "When draft acceptance is low or overhead outweighs saved target computation." },
    ],
    quiz: [
      {
        q: "In autoregressive serving, the KV cache stores:",
        options: ["Past keys and values per layer", "Only tokenizer merge rules", "Training gradients", "Human ratings"],
        answer: 0,
        explanation: "Cached K/V tensors let future steps attend to prior tokens without recomputing projections.",
      },
      {
        q: "Weight quantization primarily reduces:",
        options: ["Model memory footprint and bandwidth", "The need for prompts", "All hallucinations", "Sequence length"],
        answer: 0,
        explanation: "Lower-precision weights use less memory and can be faster to load/compute.",
      },
      {
        q: "Paged attention addresses:",
        options: ["KV-cache fragmentation and allocation for variable-length requests", "Tokenizer training only", "Reward modeling", "Label smoothing"],
        answer: 0,
        explanation: "It maps logical cache blocks to physical pages.",
      },
      {
        q: "FlashAttention is best described as:",
        options: ["Exact attention with IO-aware tiling", "Approximate random token dropping", "A dataset filter", "A preference loss"],
        answer: 0,
        explanation: "It computes the same attention result while reducing memory traffic.",
      },
      {
        q: "Continuous batching improves:",
        options: ["GPU utilization under variable request arrivals", "The grammar of the tokenizer", "The number of model parameters only", "Human preference collection"],
        answer: 0,
        explanation: "Requests can join or leave batches at decode boundaries.",
      },
      {
        q: "Speculative decoding uses:",
        options: ["A cheaper draft model and a target verifier model", "Only beam search with no model", "A larger tokenizer vocabulary to skip attention", "Manual labels at inference"],
        answer: 0,
        explanation: "Draft tokens are accepted or rejected by the target model.",
      },
      {
        q: "Time-to-first-token is most affected by:",
        options: ["Queueing and prompt prefill", "Only the final generated word", "Optimizer state size in training", "Validation labels"],
        answer: 0,
        explanation: "TTFT includes waiting and processing the input prompt.",
      },
      {
        q: "Multi-query or grouped-query attention reduces:",
        options: ["KV cache size by sharing K/V heads", "All parameter count to zero", "The need for softmax", "Network latency outside the server"],
        answer: 0,
        explanation: "Sharing K/V heads lowers cached tensor volume.",
      },
    ],
    resources: [
      { title: "FlashAttention", url: "https://arxiv.org/abs/2205.14135", type: "paper" },
      { title: "vLLM: Easy, Fast, and Cheap LLM Serving with PagedAttention", url: "https://arxiv.org/abs/2309.06180", type: "paper" },
      { title: "Fast Inference from Transformers via Speculative Decoding", url: "https://arxiv.org/abs/2211.17192", type: "paper" },
      { title: "GPTQ: Accurate Post-Training Quantization for Generative Pre-trained Transformers", url: "https://arxiv.org/abs/2210.17323", type: "paper" },
      { title: "Efficient Memory Management for Large Language Model Serving with PagedAttention", url: "https://arxiv.org/abs/2309.06180", type: "paper" },
    ],
  },
]

export default topics
