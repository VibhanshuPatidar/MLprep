import type { MlCodingProblem } from '../../types/content'

const problems: MlCodingProblem[] = [
  {
    id: 'knn-classifier-numpy',
    title: 'K-Nearest Neighbors Classifier',
    difficulty: 'Easy',
    category: 'Classical ML',
    viz: 'knn',
    description: `Implement a k-nearest neighbors classifier using NumPy.

Signature: knn_predict(X_train, y_train, X_test, k=3) -> np.ndarray.

X_train has shape (n_train, d), X_test has shape (n_test, d), and y_train has shape (n_train,). Use Euclidean distance. For each test row, vote among the k closest training labels; ties must be broken by choosing the smallest label according to NumPy sorting. Return predictions with shape (n_test,).`,
    starter: `import numpy as np

def knn_predict(X_train, y_train, X_test, k=3):
    raise NotImplementedError
`,
    solution: `import numpy as np

def knn_predict(X_train, y_train, X_test, k=3):
    X_train = np.asarray(X_train, dtype=float)
    X_test = np.asarray(X_test, dtype=float)
    y_train = np.asarray(y_train)
    k = int(k)
    diffs = X_test[:, None, :] - X_train[None, :, :]
    dist2 = np.sum(diffs ** 2, axis=2)
    neighbor_idx = np.argsort(dist2, axis=1)[:, :k]
    preds = []
    for row in neighbor_idx:
        labels, counts = np.unique(y_train[row], return_counts=True)
        preds.append(labels[np.argmax(counts)])
    return np.asarray(preds, dtype=y_train.dtype)
`,
    explanation: `KNN is lazy learning: all work happens at prediction time. Broadcasting creates an (n_test, n_train, d) difference tensor, which is reduced to pairwise squared distances; square roots are unnecessary because they preserve ordering.

Voting with np.unique returns sorted labels, so np.argmax over counts naturally picks the smallest label on ties. Complexity is O(n_test times n_train times d) time and O(n_test times n_train) memory. Interviewers probe tie-breaking, vectorized distances, and scaling limits.`,
    hints: [
      'Compute all pairwise squared distances with broadcasting.',
      'argsort each test row and keep the first k indices.',
      'np.unique(..., return_counts=True) gives sorted labels and vote counts.'
    ],
    tests: [
      {
        name: 'simple two clusters',
        code: `X_train = np.array([[0.0, 0.0], [0.0, 1.0], [5.0, 5.0], [6.0, 5.0]])
y_train = np.array([0, 0, 1, 1])
X_test = np.array([[0.2, 0.1], [5.5, 5.1]])
out = knn_predict(X_train, y_train, X_test, k=3)
exp = np.array([0, 1])
assert np.array_equal(out, exp), f"expected {exp}, got {out}"`
      },
      {
        name: 'k equals one nearest point',
        code: `X_train = np.array([[0.0], [10.0], [11.0]])
y_train = np.array([2, 4, 5])
out = knn_predict(X_train, y_train, np.array([[9.6]]), k=1)
assert np.array_equal(out, np.array([4])), f"expected nearest label 4, got {out}"`
      },
      {
        name: 'tie breaks to smallest label',
        code: `X_train = np.array([[0.0], [2.0]])
y_train = np.array([7, 3])
out = knn_predict(X_train, y_train, np.array([[1.0]]), k=2)
assert np.array_equal(out, np.array([3])), f"tie should choose smallest label 3, got {out}"`
      },
      {
        name: 'multiple test shape',
        code: `X_train = np.array([[0.0, 0.0], [1.0, 0.0], [0.0, 3.0]])
y_train = np.array([1, 1, 2])
X_test = np.array([[0.9, 0.1], [0.0, 2.5], [0.2, 0.2]])
out = knn_predict(X_train, y_train, X_test, k=1)
assert out.shape == (3,), f"expected shape (3,), got {out.shape}"
assert np.array_equal(out, np.array([1, 2, 1])), f"wrong predictions {out}"`
      }
    ]
  },
  {
    id: 'kmeans-plus-plus-numpy',
    title: 'K-Means with K-Means++ Initialization',
    difficulty: 'Medium',
    category: 'Classical ML',
    viz: 'kmeans',
    description: `Implement k-means clustering with deterministic k-means++ initialization.

Signature: kmeans(X, k, max_iter=100, seed=0, tol=1e-4) -> (centroids, labels, inertia_history).

X has shape (n_samples, n_features). Use np.random.default_rng(seed).integers(n) for the first centroid. For each next centroid, sample an index with probability proportional to squared distance from the nearest chosen centroid using rng.choice(n, p=probs). In each Lloyd step, assign nearest centroids, update means, keep previous centroid for empty clusters, and append inertia (sum of squared distances) after assignment. Stop when centroid movement is below tol.`,
    starter: `import numpy as np

def kmeans(X, k, max_iter=100, seed=0, tol=1e-4):
    raise NotImplementedError
`,
    solution: `import numpy as np

def _kmeans_plus_plus(X, k, seed):
    rng = np.random.default_rng(seed)
    n = X.shape[0]
    centroids = [X[rng.integers(n)].copy()]
    for _ in range(1, int(k)):
        dist2 = np.min(np.sum((X[:, None, :] - np.asarray(centroids)[None, :, :]) ** 2, axis=2), axis=1)
        total = dist2.sum()
        if total == 0:
            idx = rng.integers(n)
        else:
            idx = rng.choice(n, p=dist2 / total)
        centroids.append(X[idx].copy())
    return np.asarray(centroids, dtype=float)

def kmeans(X, k, max_iter=100, seed=0, tol=1e-4):
    X = np.asarray(X, dtype=float)
    k = int(k)
    centroids = _kmeans_plus_plus(X, k, seed)
    inertia_history = []
    labels = np.zeros(X.shape[0], dtype=int)
    for _ in range(int(max_iter)):
        dist2 = np.sum((X[:, None, :] - centroids[None, :, :]) ** 2, axis=2)
        labels = np.argmin(dist2, axis=1)
        inertia_history.append(float(np.sum(dist2[np.arange(X.shape[0]), labels])))
        new_centroids = centroids.copy()
        for j in range(k):
            mask = labels == j
            if np.any(mask):
                new_centroids[j] = X[mask].mean(axis=0)
        shift = np.linalg.norm(new_centroids - centroids)
        centroids = new_centroids
        if shift <= tol:
            break
    return centroids, labels.astype(int), inertia_history
`,
    explanation: `K-means++ spreads initial centers by sampling points with probability proportional to their current squared distance from the nearest center. Lloyd iterations then alternate nearest-center assignment and centroid recomputation.

Inertia should not increase after completed iterations because each assignment and mean update optimizes one block of variables. Runtime is O(iterations times n times k times d). Interviewers probe deterministic seeding, empty-cluster handling, and convergence criteria.`,
    hints: [
      'Keep squared distances; k-means optimizes squared Euclidean distance.',
      'Use a local default_rng with the exact seed procedure in the prompt.',
      'If a cluster is empty, keep its previous centroid to avoid NaNs.'
    ],
    tests: [
      {
        name: 'finds well separated clusters',
        code: `X = np.array([[0.0, 0.0], [0.1, 0.0], [10.0, 10.0], [10.2, 9.9], [0.0, 0.2], [9.8, 10.1]])
centroids, labels, hist = kmeans(X, 2, max_iter=20, seed=1)
centroids_sorted = centroids[np.argsort(centroids[:, 0])]
exp = np.array([[0.03333333, 0.06666667], [10.0, 10.0]])
assert np.allclose(centroids_sorted, exp, atol=0.2), f"expected centroids near {exp}, got {centroids_sorted}"
assert len(np.unique(labels)) == 2, f"expected two clusters, got labels {labels}"`
      },
      {
        name: 'inertia non-increasing',
        code: `X = np.array([[0.0], [0.2], [5.0], [5.2], [9.0], [9.2]])
centroids, labels, hist = kmeans(X, 3, max_iter=10, seed=4)
diffs = np.diff(hist)
assert np.all(diffs <= 1e-9), f"inertia should not increase, history {hist}"`
      },
      {
        name: 'seed makes output deterministic',
        code: `X = np.array([[0.0], [1.0], [5.0], [6.0], [10.0], [11.0]])
a = kmeans(X, 3, max_iter=5, seed=42)
b = kmeans(X, 3, max_iter=5, seed=42)
assert np.allclose(a[0], b[0]), f"same seed should give same centroids, got {a[0]} and {b[0]}"
assert np.array_equal(a[1], b[1]), f"same seed should give same labels, got {a[1]} and {b[1]}"`
      },
      {
        name: 'handles duplicate points without nan',
        code: `X = np.array([[1.0, 1.0], [1.0, 1.0], [2.0, 2.0]])
centroids, labels, hist = kmeans(X, 2, max_iter=5, seed=0)
assert np.all(np.isfinite(centroids)), f"centroids should be finite, got {centroids}"
assert labels.shape == (3,), f"expected labels shape (3,), got {labels.shape}"`
      },
      {
        name: 'hidden history contains floats',
        hidden: true,
        code: `X = np.array([[0.0], [2.0], [10.0], [12.0]])
centroids, labels, hist = kmeans(X, 2, max_iter=3, seed=2)
assert len(hist) >= 1 and all(isinstance(v, float) for v in hist), f"expected float inertia history, got {hist}"`
      }
    ]
  },
  {
    id: 'gaussian-naive-bayes-numpy',
    title: 'Gaussian Naive Bayes',
    difficulty: 'Medium',
    category: 'Classical ML',
    description: `Implement Gaussian naive Bayes fit and predict.

Signatures: gaussian_nb_fit(X, y, var_smoothing=1e-9) -> dict, and gaussian_nb_predict(model, X) -> np.ndarray.

X has shape (n_samples, n_features). y is a 1D label array. Fit per-class means, variances plus var_smoothing, class priors, and log priors. Prediction should compute class log posterior up to an additive constant assuming independent Gaussian features. Return labels in the original dtype.`,
    starter: `import numpy as np

def gaussian_nb_fit(X, y, var_smoothing=1e-9):
    raise NotImplementedError

def gaussian_nb_predict(model, X):
    raise NotImplementedError
`,
    solution: `import numpy as np

def gaussian_nb_fit(X, y, var_smoothing=1e-9):
    X = np.asarray(X, dtype=float)
    y = np.asarray(y)
    classes = np.unique(y)
    means = []
    variances = []
    priors = []
    for c in classes:
        Xc = X[y == c]
        means.append(Xc.mean(axis=0))
        variances.append(Xc.var(axis=0) + float(var_smoothing))
        priors.append(Xc.shape[0] / X.shape[0])
    priors = np.asarray(priors, dtype=float)
    return {
        "classes": classes,
        "means": np.asarray(means, dtype=float),
        "vars": np.asarray(variances, dtype=float),
        "priors": priors,
        "log_priors": np.log(priors),
    }

def gaussian_nb_predict(model, X):
    X = np.asarray(X, dtype=float)
    means = model["means"]
    vars_ = model["vars"]
    log_priors = model["log_priors"]
    log_likelihood = -0.5 * (np.log(2.0 * np.pi * vars_)[None, :, :] + ((X[:, None, :] - means[None, :, :]) ** 2) / vars_[None, :, :])
    scores = log_priors[None, :] + log_likelihood.sum(axis=2)
    return model["classes"][np.argmax(scores, axis=1)]
`,
    explanation: `Naive Bayes models each feature independently within a class, so log likelihoods add across features. Working in log space avoids multiplying many tiny Gaussian densities.

Fitting is O(nd) and prediction is O(n_test times classes times d). The smoothing term prevents zero variance from causing division by zero. Interviewers probe vectorized broadcasting, priors, and numerical underflow.`,
    hints: [
      'Group rows by each sorted class label.',
      'Use log probabilities and sum over features.',
      'Add var_smoothing to every variance.'
    ],
    tests: [
      {
        name: 'predicts separated gaussian classes',
        code: `X = np.array([[0.0, 0.1], [0.2, -0.1], [4.9, 5.1], [5.2, 4.8]])
y = np.array([0, 0, 1, 1])
model = gaussian_nb_fit(X, y)
out = gaussian_nb_predict(model, np.array([[0.1, 0.0], [5.0, 5.0]]))
exp = np.array([0, 1])
assert np.array_equal(out, exp), f"expected {exp}, got {out}"`
      },
      {
        name: 'model contains expected shapes',
        code: `X = np.array([[1.0], [2.0], [10.0], [11.0], [12.0]])
y = np.array(["a", "a", "b", "b", "b"])
model = gaussian_nb_fit(X, y)
assert model["means"].shape == (2, 1), f"wrong means shape {model['means'].shape}"
assert np.allclose(model["priors"], np.array([0.4, 0.6])), f"wrong priors {model['priors']}"`
      },
      {
        name: 'zero variance is smoothed',
        code: `X = np.array([[1.0], [1.0], [3.0], [3.0]])
y = np.array([0, 0, 1, 1])
model = gaussian_nb_fit(X, y, var_smoothing=1e-3)
assert np.all(model["vars"] >= 1e-3), f"variances should include smoothing, got {model['vars']}"
out = gaussian_nb_predict(model, np.array([[1.0], [3.0]]))
assert np.array_equal(out, np.array([0, 1])), f"expected [0,1], got {out}"`
      },
      {
        name: 'uses priors when likelihoods tie',
        code: `X = np.array([[0.0], [0.0], [0.0], [0.0]])
y = np.array([0, 0, 0, 1])
model = gaussian_nb_fit(X, y, var_smoothing=1.0)
out = gaussian_nb_predict(model, np.array([[0.0]]))
assert np.array_equal(out, np.array([0])), f"higher prior class should win, got {out}"`
      }
    ]
  },
  {
    id: 'decision-tree-best-split-one-feature',
    title: 'Decision Tree Best Split for One Feature',
    difficulty: 'Medium',
    category: 'Classical ML',
    viz: 'decision-tree',
    description: `Find the best binary split for a single numeric feature.

Signature: best_split_one_feature(x, y, criterion='gini') -> dict.

x has shape (n_samples,), y has class labels. Consider thresholds halfway between consecutive sorted unique x values. For each threshold, left is x <= threshold and right is x > threshold. Support criterion 'gini' or 'entropy'. Return a dictionary with threshold, impurity, gain, left_indices, and right_indices. If no split exists, threshold is None and gain is 0.`,
    starter: `import numpy as np

def best_split_one_feature(x, y, criterion="gini"):
    raise NotImplementedError
`,
    solution: `import numpy as np

def _impurity(labels, criterion):
    labels = np.asarray(labels)
    if labels.size == 0:
        return 0.0
    _, counts = np.unique(labels, return_counts=True)
    p = counts / counts.sum()
    if criterion == "gini":
        return float(1.0 - np.sum(p ** 2))
    if criterion == "entropy":
        return float(-np.sum(p * np.log2(p)))
    raise ValueError("criterion must be 'gini' or 'entropy'")

def best_split_one_feature(x, y, criterion="gini"):
    x = np.asarray(x, dtype=float).reshape(-1)
    y = np.asarray(y)
    unique = np.unique(x)
    parent = _impurity(y, criterion)
    if unique.size < 2:
        return {"threshold": None, "impurity": parent, "gain": 0.0, "left_indices": np.array([], dtype=int), "right_indices": np.array([], dtype=int)}
    best = None
    for t in (unique[:-1] + unique[1:]) / 2.0:
        left = np.where(x <= t)[0]
        right = np.where(x > t)[0]
        weighted = (len(left) * _impurity(y[left], criterion) + len(right) * _impurity(y[right], criterion)) / len(y)
        gain = parent - weighted
        if best is None or gain > best["gain"] + 1e-15 or (abs(gain - best["gain"]) <= 1e-15 and t < best["threshold"]):
            best = {"threshold": float(t), "impurity": float(weighted), "gain": float(gain), "left_indices": left.astype(int), "right_indices": right.astype(int)}
    return best
`,
    explanation: `A decision stump evaluates all candidate thresholds between distinct sorted feature values. The split impurity is the weighted average of child impurities, and information gain is parent impurity minus split impurity.

Sorting unique values limits candidates to meaningful boundary changes. Complexity is O(u n log n) here because labels are recomputed for each of u thresholds; an optimized interview follow-up can scan counts in O(n log n). Interviewers probe Gini vs entropy, threshold placement, and tie-breaking.`,
    hints: [
      'Candidate thresholds are midpoints, not raw feature values.',
      'Compute parent impurity once, then subtract weighted child impurity.',
      'Return original sample indices for the chosen split.'
    ],
    tests: [
      {
        name: 'perfect gini split',
        code: `x = np.array([0.0, 1.0, 2.0, 3.0])
y = np.array([0, 0, 1, 1])
out = best_split_one_feature(x, y, criterion="gini")
assert np.allclose(out["threshold"], 1.5), f"expected threshold 1.5, got {out['threshold']}"
assert np.allclose(out["impurity"], 0.0), f"expected pure children, got impurity {out['impurity']}"
assert np.array_equal(out["left_indices"], np.array([0, 1])), f"wrong left indices {out['left_indices']}"`
      },
      {
        name: 'entropy split gain positive',
        code: `x = np.array([1.0, 2.0, 3.0, 4.0, 5.0])
y = np.array([0, 0, 1, 1, 1])
out = best_split_one_feature(x, y, criterion="entropy")
assert out["gain"] > 0.9, f"expected high entropy gain, got {out['gain']}"
assert np.allclose(out["threshold"], 2.5), f"expected threshold 2.5, got {out['threshold']}"`
      },
      {
        name: 'no split for constant feature',
        code: `out = best_split_one_feature(np.array([1.0, 1.0, 1.0]), np.array([0, 1, 1]))
assert out["threshold"] is None, f"expected no threshold, got {out['threshold']}"
assert out["gain"] == 0.0, f"expected zero gain, got {out['gain']}"`
      },
      {
        name: 'tie chooses smaller threshold',
        code: `x = np.array([0.0, 1.0, 2.0, 3.0])
y = np.array([0, 1, 0, 1])
out = best_split_one_feature(x, y)
assert np.allclose(out["threshold"], 0.5), f"equal gains should choose first/smallest threshold, got {out['threshold']}"`
      }
    ]
  },
  {
    id: 'pca-svd-numpy',
    title: 'Principal Component Analysis via SVD',
    difficulty: 'Medium',
    category: 'Classical ML',
    viz: 'pca',
    description: `Implement PCA with centered SVD.

Signature: pca_fit_transform(X, n_components) -> (components, transformed, explained_variance_ratio, mean).

X has shape (n_samples, n_features). Center features, run SVD, return components with shape (n_components, n_features), transformed scores with shape (n_samples, n_components), explained_variance_ratio for selected components, and mean with shape (n_features,). Component signs are arbitrary but must be orthonormal.`,
    starter: `import numpy as np

def pca_fit_transform(X, n_components):
    raise NotImplementedError
`,
    solution: `import numpy as np

def pca_fit_transform(X, n_components):
    X = np.asarray(X, dtype=float)
    mean = X.mean(axis=0)
    Xc = X - mean
    U, S, Vt = np.linalg.svd(Xc, full_matrices=False)
    components = Vt[:int(n_components)]
    transformed = Xc @ components.T
    variances = (S ** 2) / (X.shape[0] - 1)
    total = variances.sum()
    ratio = variances[:int(n_components)] / total if total > 0 else np.zeros(int(n_components))
    return components, transformed, ratio, mean
`,
    explanation: `PCA diagonalizes the covariance of centered data. SVD gives right singular vectors as principal axes, and singular values determine explained variance by $S_i^2/(n-1)$.

Projecting is a matrix multiply with the selected components. Complexity is dominated by SVD. Interviewers probe centering, sign ambiguity, orthonormality, and explained variance normalization.`,
    hints: [
      'Always subtract the feature mean before SVD.',
      'np.linalg.svd returns Vt; rows of Vt are principal axes.',
      'Explained variance ratios divide selected variances by total variance.'
    ],
    tests: [
      {
        name: 'first component on x axis',
        code: `X = np.array([[-2.0, 0.0], [-1.0, 0.0], [1.0, 0.0], [2.0, 0.0]])
components, Z, ratio, mean = pca_fit_transform(X, 1)
assert components.shape == (1, 2), f"wrong component shape {components.shape}"
assert np.allclose(np.abs(components[0]), np.array([1.0, 0.0]), atol=1e-6), f"expected x-axis component, got {components[0]}"
assert np.allclose(ratio, np.array([1.0]), atol=1e-6), f"expected all variance explained, got {ratio}"`
      },
      {
        name: 'components are orthonormal',
        code: `X = np.array([[1.0, 2.0, 3.0], [2.0, 0.0, 1.0], [3.0, 5.0, 2.0], [4.0, 1.0, 0.0]])
components, Z, ratio, mean = pca_fit_transform(X, 2)
I = components @ components.T
assert np.allclose(I, np.eye(2), atol=1e-6), f"components should be orthonormal, got {I}"`
      },
      {
        name: 'transformed data is centered',
        code: `X = np.array([[1.0, 4.0], [2.0, 5.0], [3.0, 6.0]])
components, Z, ratio, mean = pca_fit_transform(X, 1)
assert np.allclose(Z.mean(axis=0), np.zeros(1), atol=1e-9), f"PCA scores should be centered, got {Z.mean(axis=0)}"
assert np.allclose(mean, np.array([2.0, 5.0]), atol=1e-9), f"wrong mean {mean}"`
      },
      {
        name: 'ratio sums below one for truncated PCA',
        code: `X = np.array([[1.0, 0.0], [0.0, 1.0], [-1.0, 0.0], [0.0, -2.0]])
components, Z, ratio, mean = pca_fit_transform(X, 1)
assert 0.0 <= ratio[0] <= 1.0, f"ratio should be a fraction, got {ratio}"
assert ratio.sum() <= 1.0 + 1e-9, f"truncated ratios should not exceed one, got {ratio}"`
      }
    ]
  },
  {
    id: 'linear-svm-hinge-subgradient',
    title: 'Linear SVM with Hinge-Loss Subgradient Descent',
    difficulty: 'Medium',
    category: 'Classical ML',
    description: `Train a linear binary SVM using full-batch subgradient descent.

Signatures: linear_svm_train(X, y, lr=0.1, epochs=1000, C=1.0) -> (w, b, losses), and linear_svm_predict(X, w, b=0.0) -> np.ndarray.

y must contain -1 and +1. Minimize $0.5 ||w||^2 + C \cdot mean(max(0, 1 - y(Xw+b)))$. Return predictions as -1 or +1 using score >= 0 as +1.`,
    starter: `import numpy as np

def linear_svm_train(X, y, lr=0.1, epochs=1000, C=1.0):
    raise NotImplementedError

def linear_svm_predict(X, w, b=0.0):
    raise NotImplementedError
`,
    solution: `import numpy as np

def linear_svm_predict(X, w, b=0.0):
    scores = np.asarray(X, dtype=float) @ np.asarray(w, dtype=float) + float(b)
    return np.where(scores >= 0.0, 1, -1)

def linear_svm_train(X, y, lr=0.1, epochs=1000, C=1.0):
    X = np.asarray(X, dtype=float)
    y = np.asarray(y, dtype=float).reshape(-1)
    n, d = X.shape
    w = np.zeros(d, dtype=float)
    b = 0.0
    losses = []
    for _ in range(int(epochs)):
        scores = X @ w + b
        margins = 1.0 - y * scores
        active = margins > 0.0
        losses.append(float(0.5 * np.sum(w ** 2) + C * np.mean(np.maximum(0.0, margins))))
        if np.any(active):
            grad_w = w - C * (X[active].T @ y[active]) / n
            grad_b = -C * float(np.sum(y[active])) / n
        else:
            grad_w = w
            grad_b = 0.0
        w -= lr * grad_w
        b -= lr * grad_b
    scores = X @ w + b
    margins = 1.0 - y * scores
    losses.append(float(0.5 * np.sum(w ** 2) + C * np.mean(np.maximum(0.0, margins))))
    return w, float(b), losses
`,
    explanation: `Only points with margin less than one contribute hinge-loss gradients. The regularizer always contributes w to the weight gradient, while the bias is not regularized.

Full-batch updates are deterministic and easy to test, though real SVM training often uses stochastic or coordinate methods. Complexity is O(epochs times nd). Interviewers probe subgradients at the hinge, label encoding, and bias regularization.`,
    hints: [
      'Convert labels to -1/+1 and compute margins = 1 - y * score.',
      'Active margin violations add -C y_i x_i / n to the gradient.',
      'Prediction is the sign of the linear score.'
    ],
    tests: [
      {
        name: 'predict helper sign convention',
        code: `X = np.array([[-1.0], [0.0], [2.0]])
w = np.array([1.0])
out = linear_svm_predict(X, w, b=0.0)
exp = np.array([-1, 1, 1])
assert np.array_equal(out, exp), f"expected {exp}, got {out}"`
      },
      {
        name: 'learns separable data',
        code: `X = np.array([[-3.0], [-2.0], [-1.0], [1.0], [2.0], [3.0]])
y = np.array([-1, -1, -1, 1, 1, 1])
w, b, losses = linear_svm_train(X, y, lr=0.05, epochs=1000, C=5.0)
preds = linear_svm_predict(X, w, b)
assert np.array_equal(preds, y), f"expected perfect classification, got {preds}"
assert losses[-1] < losses[0], f"loss should decrease from {losses[0]} to {losses[-1]}"`
      },
      {
        name: 'bias can shift boundary',
        code: `X = np.array([[0.0], [1.0], [2.0], [4.0], [5.0]])
y = np.array([-1, -1, -1, 1, 1])
w, b, losses = linear_svm_train(X, y, lr=0.02, epochs=1500, C=10.0)
assert b < 0, f"expected negative bias for positive threshold, got {b}"
assert np.array_equal(linear_svm_predict(X, w, b), y), "model should classify training data"`
      },
      {
        name: 'returns correct shapes',
        code: `X = np.array([[1.0, 0.0], [-1.0, 0.0]])
y = np.array([1, -1])
w, b, losses = linear_svm_train(X, y, epochs=5)
assert w.shape == (2,), f"expected w shape (2,), got {w.shape}"
assert isinstance(b, float), f"b should be float, got {type(b)}"
assert len(losses) == 6, f"expected epochs+1 losses, got {len(losses)}"`
      }
    ]
  },
  {
    id: 'cosine-similarity-top-k',
    title: 'Cosine Similarity Top-K Retrieval',
    difficulty: 'Easy',
    category: 'Classical ML',
    description: `Implement top-k retrieval by cosine similarity.

Signature: top_k_cosine(query, documents, k=3) -> (indices, scores).

query has shape (d,), documents has shape (n_docs, d). Return indices and cosine scores for the k most similar documents, sorted by descending score; ties are broken by smaller document index. Zero query or document vectors should receive score 0 rather than NaN.`,
    starter: `import numpy as np

def top_k_cosine(query, documents, k=3):
    raise NotImplementedError
`,
    solution: `import numpy as np

def top_k_cosine(query, documents, k=3):
    q = np.asarray(query, dtype=float).reshape(-1)
    D = np.asarray(documents, dtype=float)
    q_norm = np.linalg.norm(q)
    d_norm = np.linalg.norm(D, axis=1)
    denom = q_norm * d_norm
    scores = np.zeros(D.shape[0], dtype=float)
    mask = denom > 0.0
    scores[mask] = (D[mask] @ q) / denom[mask]
    order = np.lexsort((np.arange(D.shape[0]), -scores))
    idx = order[: int(k)]
    return idx.astype(int), scores[idx]
`,
    explanation: `Cosine similarity is the dot product divided by vector norms. Normalizing only through the denominator lets us explicitly guard zero norms and avoid NaNs.

np.lexsort with keys (index, -score) sorts by descending score and then ascending index for deterministic ties. Complexity is O(nd + n log n), or O(nd + n log k) with a heap. Interviewers probe zero vectors, stable ranking, and vectorization.`,
    hints: [
      'Compute all document dot products in one matrix-vector multiply.',
      'Set similarities involving zero vectors to 0.',
      'Use lexsort or another deterministic tie-breaker.'
    ],
    tests: [
      {
        name: 'retrieves nearest directions',
        code: `q = np.array([1.0, 0.0])
D = np.array([[1.0, 0.0], [0.0, 1.0], [2.0, 0.0]])
idx, scores = top_k_cosine(q, D, k=2)
assert np.array_equal(idx, np.array([0, 2])), f"tie on score 1 should keep smaller index first, got {idx}"
assert np.allclose(scores, np.array([1.0, 1.0]), atol=1e-9), f"expected scores 1, got {scores}"`
      },
      {
        name: 'handles negative similarity',
        code: `q = np.array([1.0, 0.0])
D = np.array([[-1.0, 0.0], [0.5, 0.0], [0.0, 1.0]])
idx, scores = top_k_cosine(q, D, k=3)
assert np.array_equal(idx, np.array([1, 2, 0])), f"expected descending cosine order, got {idx}"
assert scores[-1] < 0, f"opposite vector should be negative, got {scores}"`
      },
      {
        name: 'zero vectors score zero',
        code: `q = np.array([0.0, 0.0])
D = np.array([[1.0, 2.0], [0.0, 0.0]])
idx, scores = top_k_cosine(q, D, k=2)
assert np.all(np.isfinite(scores)), f"scores should be finite, got {scores}"
assert np.allclose(scores, np.zeros(2)), f"zero query should yield zero scores, got {scores}"`
      },
      {
        name: 'k truncates output',
        code: `q = np.array([1.0, 1.0])
D = np.eye(4, 2)
idx, scores = top_k_cosine(q, D, k=1)
assert idx.shape == (1,) and scores.shape == (1,), f"expected one result, got {idx.shape}, {scores.shape}"`
      }
    ]
  }
]

export default problems
