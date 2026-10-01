import type { MlCodingProblem } from '../../types/content'

const problems: MlCodingProblem[] = [
  {
    id: 'precision-recall-f1-macro-micro',
    title: 'Precision, Recall, and F1 from Scratch',
    difficulty: 'Easy',
    category: 'Evaluation & NLP',
    description: `Compute classification metrics without sklearn.

Signature: classification_metrics(y_true, y_pred, labels=None) -> dict.

y_true and y_pred are 1D arrays. If labels is None, use the sorted union of labels in y_true and y_pred. Return a dictionary with keys labels, per_class, macro_precision, macro_recall, macro_f1, micro_precision, micro_recall, and micro_f1. per_class maps each label to a dict with tp, fp, fn, precision, recall, and f1. If a denominator is zero, use metric value 0.`,
    starter: `import numpy as np

def classification_metrics(y_true, y_pred, labels=None):
    raise NotImplementedError
`,
    solution: `import numpy as np

def _safe_div(a, b):
    return 0.0 if b == 0 else float(a / b)

def classification_metrics(y_true, y_pred, labels=None):
    y_true = np.asarray(y_true)
    y_pred = np.asarray(y_pred)
    if labels is None:
        labels_arr = np.union1d(y_true, y_pred)
    else:
        labels_arr = np.asarray(labels)
    per = {}
    total_tp = total_fp = total_fn = 0
    ps = []
    rs = []
    fs = []
    for lab in labels_arr:
        tp = int(np.sum((y_true == lab) & (y_pred == lab)))
        fp = int(np.sum((y_true != lab) & (y_pred == lab)))
        fn = int(np.sum((y_true == lab) & (y_pred != lab)))
        precision = _safe_div(tp, tp + fp)
        recall = _safe_div(tp, tp + fn)
        f1 = _safe_div(2 * precision * recall, precision + recall)
        per[lab.item() if hasattr(lab, "item") else lab] = {"tp": tp, "fp": fp, "fn": fn, "precision": precision, "recall": recall, "f1": f1}
        total_tp += tp; total_fp += fp; total_fn += fn
        ps.append(precision); rs.append(recall); fs.append(f1)
    micro_p = _safe_div(total_tp, total_tp + total_fp)
    micro_r = _safe_div(total_tp, total_tp + total_fn)
    micro_f = _safe_div(2 * micro_p * micro_r, micro_p + micro_r)
    return {
        "labels": labels_arr,
        "per_class": per,
        "macro_precision": float(np.mean(ps)) if ps else 0.0,
        "macro_recall": float(np.mean(rs)) if rs else 0.0,
        "macro_f1": float(np.mean(fs)) if fs else 0.0,
        "micro_precision": micro_p,
        "micro_recall": micro_r,
        "micro_f1": micro_f,
    }
`,
    explanation: `Per-class metrics treat one label as positive and all other labels as negative. Macro averaging gives each class equal weight, while micro averaging pools true positives, false positives, and false negatives before computing the ratios.

The implementation loops over labels but uses vectorized masks for counts. Complexity is O(classes times n). Interviewers probe zero denominators, macro vs micro distinction, and label ordering.`,
    hints: [
      'For each label, compute one-vs-rest tp, fp, and fn masks.',
      'Macro is the mean of class metrics; micro is computed from summed counts.',
      'Use safe division when there are no predicted or true positives.'
    ],
    tests: [
      {
        name: 'binary metrics',
        code: `y_true = np.array([1, 1, 0, 0])
y_pred = np.array([1, 0, 0, 1])
m = classification_metrics(y_true, y_pred, labels=[0, 1])
assert np.allclose(m["per_class"][1]["precision"], 0.5), f"class 1 precision wrong {m['per_class'][1]}"
assert np.allclose(m["per_class"][1]["recall"], 0.5), f"class 1 recall wrong {m['per_class'][1]}"
assert np.allclose(m["micro_f1"], 0.5), f"micro f1 should equal accuracy 0.5, got {m['micro_f1']}"`
      },
      {
        name: 'macro includes missing predictions',
        code: `y_true = np.array([0, 1, 2])
y_pred = np.array([0, 0, 0])
m = classification_metrics(y_true, y_pred, labels=[0, 1, 2])
assert m["per_class"][1]["precision"] == 0.0 and m["per_class"][1]["recall"] == 0.0, f"missing class metrics should be zero, got {m['per_class'][1]}"
assert m["macro_f1"] < m["micro_f1"], f"macro should penalize missing classes more, got macro {m['macro_f1']} micro {m['micro_f1']}"`
      },
      {
        name: 'infers sorted labels',
        code: `m = classification_metrics(np.array([2, 1]), np.array([1, 3]))
assert np.array_equal(m["labels"], np.array([1, 2, 3])), f"expected sorted union labels, got {m['labels']}"`
      },
      {
        name: 'perfect predictions are one',
        code: `y = np.array([0, 1, 2, 2])
m = classification_metrics(y, y)
assert np.allclose(m["macro_precision"], 1.0) and np.allclose(m["macro_recall"], 1.0) and np.allclose(m["macro_f1"], 1.0), f"perfect metrics should be one, got {m}"`
      }
    ]
  },
  {
    id: 'roc-auc-ranking-mann-whitney',
    title: 'ROC-AUC via Ranking',
    difficulty: 'Medium',
    category: 'Evaluation & NLP',
    viz: 'roc-curve',
    description: `Compute binary ROC-AUC from ranks.

Signature: roc_auc_score(y_true, y_score) -> float.

y_true is 1D with 0/1 labels and y_score is a 1D array of prediction scores where larger means more positive. Use the Mann-Whitney rank formula: AUC = (sum ranks of positives - n_pos(n_pos+1)/2) / (n_pos n_neg). Tied scores must receive average ranks.`,
    starter: `import numpy as np

def roc_auc_score(y_true, y_score):
    raise NotImplementedError
`,
    solution: `import numpy as np

def roc_auc_score(y_true, y_score):
    y_true = np.asarray(y_true).astype(int)
    scores = np.asarray(y_score, dtype=float)
    order = np.argsort(scores)
    sorted_scores = scores[order]
    ranks_sorted = np.empty_like(sorted_scores, dtype=float)
    i = 0
    while i < len(scores):
        j = i + 1
        while j < len(scores) and sorted_scores[j] == sorted_scores[i]:
            j += 1
        avg_rank = (i + 1 + j) / 2.0
        ranks_sorted[i:j] = avg_rank
        i = j
    ranks = np.empty_like(ranks_sorted)
    ranks[order] = ranks_sorted
    pos = y_true == 1
    n_pos = int(pos.sum())
    n_neg = int((~pos).sum())
    if n_pos == 0 or n_neg == 0:
        raise ValueError("AUC requires both positive and negative examples")
    rank_sum = ranks[pos].sum()
    return float((rank_sum - n_pos * (n_pos + 1) / 2.0) / (n_pos * n_neg))
`,
    explanation: `ROC-AUC equals the probability that a randomly chosen positive example has a higher score than a randomly chosen negative example, with ties counting half. Average ranks implement that tie behavior.

The rank formula avoids explicitly constructing the ROC curve. Runtime is O(n log n) for sorting and O(n) memory. Interviewers probe tie handling, label polarity, and degenerate all-one/all-zero inputs.`,
    hints: [
      'Sort scores ascending and assign one-based ranks.',
      'For equal scores, assign the average of their rank interval.',
      'Subtract n_pos(n_pos+1)/2 from positive rank sum.'
    ],
    tests: [
      {
        name: 'perfect ranking',
        code: `auc = roc_auc_score(np.array([0, 0, 1, 1]), np.array([0.1, 0.2, 0.8, 0.9]))
assert np.allclose(auc, 1.0), f"expected AUC 1, got {auc}"`
      },
      {
        name: 'reversed ranking',
        code: `auc = roc_auc_score(np.array([0, 0, 1, 1]), np.array([0.9, 0.8, 0.2, 0.1]))
assert np.allclose(auc, 0.0), f"expected AUC 0, got {auc}"`
      },
      {
        name: 'ties count half',
        code: `auc = roc_auc_score(np.array([0, 1]), np.array([0.5, 0.5]))
assert np.allclose(auc, 0.5), f"tied positive/negative should give 0.5, got {auc}"`
      },
      {
        name: 'mixed example',
        code: `y = np.array([0, 1, 0, 1, 1])
s = np.array([0.3, 0.2, 0.4, 0.8, 0.7])
auc = roc_auc_score(y, s)
exp = 4.0 / 6.0
assert np.allclose(auc, exp, atol=1e-9), f"expected {exp}, got {auc}"`
      },
      {
        name: 'hidden degenerate labels raise',
        hidden: true,
        code: `try:
    roc_auc_score(np.array([1, 1]), np.array([0.1, 0.2]))
    ok = False
except ValueError:
    ok = True
assert ok, "expected ValueError when only one class is present"`
      }
    ]
  },
  {
    id: 'confusion-matrix-numpy',
    title: 'Confusion Matrix from Scratch',
    difficulty: 'Easy',
    category: 'Evaluation & NLP',
    description: `Build a confusion matrix without sklearn.

Signature: confusion_matrix(y_true, y_pred, labels=None) -> (matrix, labels).

Rows correspond to true labels and columns to predicted labels. If labels is None, use the sorted union of y_true and y_pred. Return an integer matrix with shape (n_labels, n_labels) and the labels array used for ordering.`,
    starter: `import numpy as np

def confusion_matrix(y_true, y_pred, labels=None):
    raise NotImplementedError
`,
    solution: `import numpy as np

def confusion_matrix(y_true, y_pred, labels=None):
    y_true = np.asarray(y_true)
    y_pred = np.asarray(y_pred)
    labels_arr = np.union1d(y_true, y_pred) if labels is None else np.asarray(labels)
    lookup = {lab.item() if hasattr(lab, "item") else lab: i for i, lab in enumerate(labels_arr)}
    mat = np.zeros((len(labels_arr), len(labels_arr)), dtype=int)
    for t, p in zip(y_true, y_pred):
        tk = t.item() if hasattr(t, "item") else t
        pk = p.item() if hasattr(p, "item") else p
        if tk in lookup and pk in lookup:
            mat[lookup[tk], lookup[pk]] += 1
    return mat, labels_arr
`,
    explanation: `The confusion matrix is a two-dimensional count table. Explicit label ordering is important because metrics and plots depend on a stable row and column convention.

This loop is O(n) time plus O(classes squared) memory. Interviewers probe row/column meaning, absent labels, and deterministic ordering.`,
    hints: [
      'Create a mapping from label value to matrix index.',
      'Increment matrix[true_index, pred_index] for every pair.',
      'When labels are provided, use that order exactly.'
    ],
    tests: [
      {
        name: 'basic counts',
        code: `mat, labels = confusion_matrix(np.array([0, 0, 1, 1]), np.array([0, 1, 1, 0]), labels=[0, 1])
exp = np.array([[1, 1], [1, 1]])
assert np.array_equal(mat, exp), f"expected {exp}, got {mat}"
assert np.array_equal(labels, np.array([0, 1])), f"wrong labels {labels}"`
      },
      {
        name: 'infers union labels',
        code: `mat, labels = confusion_matrix(np.array([2, 1]), np.array([1, 3]))
assert np.array_equal(labels, np.array([1, 2, 3])), f"expected sorted labels [1,2,3], got {labels}"
assert mat.shape == (3, 3), f"expected 3x3 matrix, got {mat.shape}"`
      },
      {
        name: 'custom label order',
        code: `mat, labels = confusion_matrix(np.array(["cat", "dog", "cat"]), np.array(["dog", "dog", "cat"]), labels=["dog", "cat"])
exp = np.array([[1, 0], [1, 1]])
assert np.array_equal(mat, exp), f"expected rows [dog,cat], got {mat}"`
      },
      {
        name: 'missing label has zero row column',
        code: `mat, labels = confusion_matrix(np.array([0, 0]), np.array([0, 0]), labels=[0, 1])
assert np.array_equal(mat, np.array([[2, 0], [0, 0]])), f"missing label should have zeros, got {mat}"`
      }
    ]
  },
  {
    id: 'ndcg-at-k',
    title: 'NDCG@K for Ranked Results',
    difficulty: 'Easy',
    category: 'Evaluation & NLP',
    description: `Compute normalized discounted cumulative gain at k.

Signature: ndcg_at_k(relevances, k) -> float.

relevances is a 1D array-like of nonnegative relevance grades in predicted rank order. DCG@k is $\sum_{i=1}^k (2^{rel_i}-1) / \log_2(i+1)$. IDCG sorts relevances descending. Return 0 when ideal DCG is 0.`,
    starter: `import numpy as np

def ndcg_at_k(relevances, k):
    raise NotImplementedError
`,
    solution: `import numpy as np

def _dcg(rel):
    rel = np.asarray(rel, dtype=float)
    if rel.size == 0:
        return 0.0
    discounts = np.log2(np.arange(2, rel.size + 2, dtype=float))
    gains = (2.0 ** rel - 1.0) / discounts
    return float(np.sum(gains))

def ndcg_at_k(relevances, k):
    rel = np.asarray(relevances, dtype=float).reshape(-1)[: int(k)]
    ideal = np.sort(np.asarray(relevances, dtype=float).reshape(-1))[::-1][: int(k)]
    idcg = _dcg(ideal)
    if idcg == 0.0:
        return 0.0
    return float(_dcg(rel) / idcg)
`,
    explanation: `NDCG rewards relevant items near the top by discounting lower ranks logarithmically. Normalizing by the ideal ordering makes scores comparable across queries with different relevance distributions.

The implementation is O(n log n) due to sorting for IDCG. Interviewers probe rank indexing, graded gains, cutoff handling, and zero-relevance queries.`,
    hints: [
      'Ranks are one-based in the formula, so discounts start at log2(2).',
      'Use the top k predicted relevances for DCG and sorted top k for IDCG.',
      'If IDCG is zero, return zero instead of dividing by zero.'
    ],
    tests: [
      {
        name: 'perfect ranking gives one',
        code: `score = ndcg_at_k([3, 2, 1], 3)
assert np.allclose(score, 1.0), f"perfect ranking should be 1, got {score}"`
      },
      {
        name: 'bad ranking below one',
        code: `score = ndcg_at_k([0, 1, 3], 3)
assert 0.0 < score < 1.0, f"non-ideal ranking should be between 0 and 1, got {score}"`
      },
      {
        name: 'zero ideal returns zero',
        code: `score = ndcg_at_k([0, 0, 0], 2)
assert score == 0.0, f"all-zero relevance should return 0, got {score}"`
      },
      {
        name: 'high relevance below cutoff affects ideal dcg',
        code: `a = ndcg_at_k([1, 0, 10], 2)
assert 0.0 < a < 1.0, f"large relevant item below cutoff should lower NDCG@2, got {a}"`
      }
    ]
  },
  {
    id: 'tfidf-bm25-scoring',
    title: 'TF-IDF and BM25 Scoring',
    difficulty: 'Medium',
    category: 'Evaluation & NLP',
    description: `Implement simple lexical retrieval scores.

Signatures: tfidf_scores(query, documents) -> np.ndarray, and bm25_scores(query, documents, k1=1.5, b=0.75) -> np.ndarray.

query is a string. documents is a list of strings. Tokenize by lowercasing and splitting on whitespace. For TF-IDF use term frequency times idf with idf = log((N+1)/(df+1)) + 1 and sum over query terms. For BM25 use idf = log((N - df + 0.5)/(df + 0.5) + 1) and standard length normalization.`,
    starter: `import numpy as np

def tfidf_scores(query, documents):
    raise NotImplementedError

def bm25_scores(query, documents, k1=1.5, b=0.75):
    raise NotImplementedError
`,
    solution: `import numpy as np

def _tokens(text):
    return str(text).lower().split()

def _counts(tokens):
    d = {}
    for tok in tokens:
        d[tok] = d.get(tok, 0) + 1
    return d

def tfidf_scores(query, documents):
    docs = [_tokens(d) for d in documents]
    q_terms = _tokens(query)
    N = len(docs)
    scores = np.zeros(N, dtype=float)
    for term in q_terms:
        df = sum(1 for doc in docs if term in doc)
        idf = np.log((N + 1.0) / (df + 1.0)) + 1.0
        for i, doc in enumerate(docs):
            scores[i] += doc.count(term) * idf
    return scores

def bm25_scores(query, documents, k1=1.5, b=0.75):
    docs = [_tokens(d) for d in documents]
    counts = [_counts(doc) for doc in docs]
    q_terms = _tokens(query)
    N = len(docs)
    lengths = np.array([len(doc) for doc in docs], dtype=float)
    avgdl = float(lengths.mean()) if N else 0.0
    scores = np.zeros(N, dtype=float)
    for term in q_terms:
        df = sum(1 for c in counts if term in c)
        idf = np.log((N - df + 0.5) / (df + 0.5) + 1.0)
        for i, c in enumerate(counts):
            tf = c.get(term, 0)
            if tf == 0:
                continue
            denom = tf + k1 * (1.0 - b + b * lengths[i] / avgdl)
            scores[i] += idf * tf * (k1 + 1.0) / denom
    return scores
`,
    explanation: `TF-IDF gives higher weight to query terms that appear frequently in a document and rarely across the corpus. BM25 saturates term frequency and normalizes by document length, often producing better search rankings.

The tokenizer is intentionally simple to keep focus on scoring math. Complexity is O(query terms times documents times document length) in this straightforward implementation. Interviewers probe IDF smoothing, length normalization, and repeated query terms.`,
    hints: [
      'Build token lists or count dictionaries for each document.',
      'Document frequency counts whether a term appears at least once in a document.',
      'BM25 denominator includes document length divided by average document length.'
    ],
    tests: [
      {
        name: 'tfidf ranks matching document highest',
        code: `docs = ["cat sat mat", "dog barked", "cat cat dog"]
scores = tfidf_scores("cat", docs)
assert scores.argmax() == 2, f"doc with two cats should rank highest, got {scores}"
assert scores[1] == 0.0, f"doc without cat should score 0, got {scores}"`
      },
      {
        name: 'bm25 ranks relevant document',
        code: `docs = ["neural networks learn", "trees split features", "neural neural embeddings"]
scores = bm25_scores("neural", docs)
assert scores.argmax() in (0, 2), f"a neural document should rank highest, got {scores}"
assert scores[1] == 0.0, f"nonmatching doc should score zero, got {scores}"`
      },
      {
        name: 'case insensitive tokenization',
        code: `docs = ["Cat", "cat dog"]
scores = tfidf_scores("CAT", docs)
assert np.all(scores > 0), f"case-insensitive query should match both docs, got {scores}"`
      },
      {
        name: 'bm25 finite for repeated terms',
        code: `docs = ["a a a a", "a b"]
scores = bm25_scores("a a", docs)
assert np.all(np.isfinite(scores)), f"BM25 scores should be finite, got {scores}"
assert scores[0] > scores[1], f"more repeated term should score higher here, got {scores}"`
      }
    ]
  },
  {
    id: 'byte-pair-encoding-merge-step',
    title: 'Byte-Pair Encoding Merge Step',
    difficulty: 'Medium',
    category: 'Evaluation & NLP',
    description: `Implement one merge step of byte-pair encoding.

Signature: bpe_merge_step(vocab, pair=None) -> (new_vocab, merged_pair).

vocab is a dict mapping tuples of string symbols to integer frequencies, for example {('l','o','w'): 5}. If pair is None, choose the adjacent symbol pair with the highest total weighted frequency; break ties lexicographically. Merge every non-overlapping occurrence of that pair into the concatenated symbol. Return a new vocab dict and the pair used.`,
    starter: `import numpy as np

def bpe_merge_step(vocab, pair=None):
    raise NotImplementedError
`,
    solution: `import numpy as np

def bpe_merge_step(vocab, pair=None):
    if pair is None:
        counts = {}
        for word, freq in vocab.items():
            symbols = tuple(word)
            for a, b in zip(symbols, symbols[1:]):
                p = (a, b)
                counts[p] = counts.get(p, 0) + int(freq)
        if not counts:
            return dict(vocab), None
        pair = sorted(counts.items(), key=lambda kv: (-kv[1], kv[0]))[0][0]
    pair = tuple(pair)
    merged = pair[0] + pair[1]
    new_vocab = {}
    for word, freq in vocab.items():
        symbols = tuple(word)
        out = []
        i = 0
        while i < len(symbols):
            if i < len(symbols) - 1 and (symbols[i], symbols[i + 1]) == pair:
                out.append(merged)
                i += 2
            else:
                out.append(symbols[i])
                i += 1
        key = tuple(out)
        new_vocab[key] = new_vocab.get(key, 0) + int(freq)
    return new_vocab, pair
`,
    explanation: `BPE repeatedly counts adjacent symbol pairs weighted by word frequency, then merges the most frequent pair. Non-overlapping left-to-right replacement matches common BPE training behavior.

This single step is O(total symbols). Interviewers probe weighted counts, deterministic tie-breaking, and not mutating the original vocabulary.`,
    hints: [
      'Count adjacent pairs across all words, multiplying by the word frequency.',
      'Sort by negative count and then pair tuple for deterministic ties.',
      'When replacing, skip two symbols after a merge.'
    ],
    tests: [
      {
        name: 'chooses most frequent weighted pair',
        code: `vocab = {('l', 'o', 'w'): 5, ('l', 'o', 'w', 'e', 'r'): 2}
new_vocab, pair = bpe_merge_step(vocab)
assert pair == ('l', 'o'), f"expected most frequent pair ('l','o'), got {pair}"
assert ('lo', 'w') in new_vocab, f"expected merged symbol in vocab, got {new_vocab}"`
      },
      {
        name: 'provided pair is used',
        code: `vocab = {('a', 'b', 'a', 'b'): 1}
new_vocab, pair = bpe_merge_step(vocab, pair=('a', 'b'))
assert pair == ('a', 'b'), f"expected provided pair, got {pair}"
assert new_vocab == {('ab', 'ab'): 1}, f"expected non-overlapping merges, got {new_vocab}"`
      },
      {
        name: 'tie breaks lexicographically',
        code: `vocab = {('b', 'c'): 1, ('a', 'd'): 1}
new_vocab, pair = bpe_merge_step(vocab)
assert pair == ('a', 'd'), f"lexicographically smaller pair should win tie, got {pair}"`
      },
      {
        name: 'no pairs returns unchanged copy',
        code: `vocab = {('x',): 3}
new_vocab, pair = bpe_merge_step(vocab)
assert pair is None, f"expected no pair, got {pair}"
assert new_vocab == vocab and new_vocab is not vocab, "should return an unchanged copy"`
      }
    ]
  },
  {
    id: 'beam-search-toy-logprobs',
    title: 'Beam Search over Toy Log-Probabilities',
    difficulty: 'Medium',
    category: 'Evaluation & NLP',
    description: `Implement beam search over a fixed table of next-token log-probabilities.

Signature: beam_search(log_probs, beam_width, start_token=0, end_token=None, max_len=None) -> list.

log_probs has shape (T, V), where row t contains log probabilities for choosing the next token at step t. Start every sequence with start_token, then append one token per step until max_len steps or T rows. Each returned item is (sequence, score), where sequence is a list of token ids and score is the summed log probability. Keep the best beam_width candidates sorted by higher score, then lexicographically smaller sequence. If end_token is reached, keep that sequence finished and do not expand it.`,
    starter: `import numpy as np

def beam_search(log_probs, beam_width, start_token=0, end_token=None, max_len=None):
    raise NotImplementedError
`,
    solution: `import numpy as np

def beam_search(log_probs, beam_width, start_token=0, end_token=None, max_len=None):
    log_probs = np.asarray(log_probs, dtype=float)
    steps = log_probs.shape[0] if max_len is None else min(int(max_len), log_probs.shape[0])
    beams = [([int(start_token)], 0.0, False)]
    width = int(beam_width)
    for t in range(steps):
        candidates = []
        for seq, score, done in beams:
            if done:
                candidates.append((seq, score, True))
                continue
            for tok, lp in enumerate(log_probs[t]):
                new_seq = seq + [int(tok)]
                finished = end_token is not None and int(tok) == int(end_token)
                candidates.append((new_seq, float(score + lp), finished))
        candidates.sort(key=lambda item: (-item[1], item[0]))
        beams = candidates[:width]
    return [(seq, float(score)) for seq, score, done in beams]
`,
    explanation: `Beam search approximates best-first decoding by retaining only the top B partial sequences after each step. Scores add because log probabilities turn products into sums.

Finished sequences stay in the beam but are not expanded, which models EOS handling. Complexity is O(T times beam_width times vocab log candidates). Interviewers probe score accumulation, pruning, tie-breaking, and EOS behavior.`,
    hints: [
      'Store each beam as sequence, cumulative score, and finished flag.',
      'At each step, expand unfinished beams by every vocabulary token.',
      'Sort by negative score and sequence for deterministic ordering.'
    ],
    tests: [
      {
        name: 'greedy path with beam one',
        code: `lp = np.log(np.array([[0.7, 0.3], [0.4, 0.6]]))
out = beam_search(lp, beam_width=1, start_token=9)
seq, score = out[0]
exp_score = np.log(0.7) + np.log(0.6)
assert seq == [9, 0, 1], f"expected greedy sequence [9,0,1], got {seq}"
assert np.allclose(score, exp_score), f"expected score {exp_score}, got {score}"`
      },
      {
        name: 'keeps top two beams',
        code: `lp = np.log(np.array([[0.6, 0.4], [0.5, 0.5]]))
out = beam_search(lp, beam_width=2, start_token=0)
assert len(out) == 2, f"expected two beams, got {out}"
assert out[0][1] >= out[1][1], f"beams should be sorted by score, got {out}"`
      },
      {
        name: 'end token stops expansion',
        code: `lp = np.log(np.array([[0.1, 0.9], [0.99, 0.01], [0.99, 0.01]]))
out = beam_search(lp, beam_width=2, start_token=0, end_token=1)
seqs = [seq for seq, score in out]
assert [0, 1] in seqs, f"finished EOS sequence should remain unexpanded, got {seqs}"`
      },
      {
        name: 'tie breaks lexicographically',
        code: `lp = np.log(np.array([[0.5, 0.5]]))
out = beam_search(lp, beam_width=2, start_token=0)
assert out[0][0] == [0, 0] and out[1][0] == [0, 1], f"tie should sort lexicographically, got {out}"`
      }
    ]
  },
  {
    id: 'perplexity-from-logprobs',
    title: 'Perplexity from Token Log-Probabilities',
    difficulty: 'Easy',
    category: 'Evaluation & NLP',
    description: `Compute perplexity from true-token log probabilities.

Signature: perplexity(log_probs, mask=None) -> float.

log_probs contains natural-log probabilities assigned to the correct token, with any shape. If mask is provided, it is broadcast-compatible and True marks valid tokens. Return exp(-mean(valid log_probs)). If no valid tokens are present, raise ValueError.`,
    starter: `import numpy as np

def perplexity(log_probs, mask=None):
    raise NotImplementedError
`,
    solution: `import numpy as np

def perplexity(log_probs, mask=None):
    lp = np.asarray(log_probs, dtype=float)
    if mask is not None:
        keep = np.asarray(mask, dtype=bool)
        vals = lp[keep]
    else:
        vals = lp.reshape(-1)
    if vals.size == 0:
        raise ValueError("perplexity requires at least one valid token")
    return float(np.exp(-np.mean(vals)))
`,
    explanation: `Perplexity is exponentiated average negative log likelihood. With natural logs, a model assigning probability p to every correct token has perplexity 1/p.

Masking excludes padding tokens before averaging. Complexity is O(n). Interviewers probe log base, padding masks, and interpreting lower perplexity as better.`,
    hints: [
      'Convert log probabilities to an array and flatten valid entries.',
      'Average only over mask True positions.',
      'Use np.exp of the negative mean log probability.'
    ],
    tests: [
      {
        name: 'constant probability',
        code: `lp = np.log(np.array([0.5, 0.5, 0.5]))
out = perplexity(lp)
assert np.allclose(out, 2.0, atol=1e-9), f"probability 0.5 should give perplexity 2, got {out}"`
      },
      {
        name: 'mask ignores padding',
        code: `lp = np.log(np.array([0.25, 0.5, 1e-9]))
mask = np.array([True, True, False])
out = perplexity(lp, mask)
exp = np.exp(-np.mean(np.log([0.25, 0.5])))
assert np.allclose(out, exp, atol=1e-9), f"expected {exp}, got {out}"`
      },
      {
        name: 'higher log probs lower perplexity',
        code: `good = perplexity(np.log(np.array([0.9, 0.8])))
bad = perplexity(np.log(np.array([0.2, 0.1])))
assert good < bad, f"better probabilities should lower perplexity, got good={good}, bad={bad}"`
      },
      {
        name: 'empty mask raises',
        code: `try:
    perplexity(np.log(np.array([0.5, 0.5])), mask=np.array([False, False]))
    ok = False
except ValueError:
    ok = True
assert ok, "expected ValueError for no valid tokens"`
      }
    ]
  }
]

export default problems
