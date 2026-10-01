import type { MlCodingProblem } from '../../types/content'

const problems: MlCodingProblem[] = [
  {
    id: 'stable-softmax',
    title: 'Numerically Stable Softmax',
    difficulty: 'Easy',
    category: 'Fundamentals',
    viz: 'softmax-temperature',
    description: `Implement softmax from scratch with NumPy.

Signature: softmax_stable(logits, axis=-1, temperature=1.0) -> np.ndarray.

logits is any NumPy array. Normalize along axis and return an array with the same shape. Temperature is a positive scalar and probabilities are $\exp(z_i / T) / \sum_j \exp(z_j / T)$. The implementation must stay finite for very large or very negative logits. Results are checked with atol 1e-6.`,
    starter: `import numpy as np

def softmax_stable(logits, axis=-1, temperature=1.0):
    raise NotImplementedError
`,
    solution: `import numpy as np

def softmax_stable(logits, axis=-1, temperature=1.0):
    x = np.asarray(logits, dtype=float)
    if temperature <= 0:
        raise ValueError("temperature must be positive")
    z = x / float(temperature)
    z = z - np.max(z, axis=axis, keepdims=True)
    exp_z = np.exp(z)
    return exp_z / np.sum(exp_z, axis=axis, keepdims=True)
`,
    explanation: `Subtracting the maximum logit leaves softmax unchanged because numerator and denominator are scaled by the same constant. The vectorized computation is $p_i = \exp(z_i - m) / \sum_j \exp(z_j - m)$ along the requested axis.

This avoids overflow when logits are around 1000 and underflow is harmless because extremely small probabilities become zero. Complexity is O(n) over all elements and memory is O(n) for the exponentials. Interviewers usually probe axis handling, temperature semantics, and why subtracting the max is mathematically valid.`,
    hints: [
      'Softmax is invariant to adding or subtracting the same constant on the normalized axis.',
      'Use keepdims=True so broadcasting works for any input rank.',
      'Temperature divides logits before the max subtraction.'
    ],
    tests: [
      {
        name: 'rows sum to one',
        code: `x = np.array([[1.0, 2.0, 3.0], [1.0, 1.0, 1.0]])
out = softmax_stable(x, axis=1)
assert out.shape == x.shape, f"expected shape {x.shape}, got {out.shape}"
assert np.allclose(out.sum(axis=1), np.ones(2), atol=1e-6), f"row sums should be 1, got {out.sum(axis=1)}"
assert np.all(out > 0), f"softmax probabilities should be positive, got {out}"`
      },
      {
        name: 'large logits remain finite',
        code: `x = np.array([1000.0, 1001.0, 1002.0])
out = softmax_stable(x)
exp = np.exp(np.array([-2.0, -1.0, 0.0])); exp = exp / exp.sum()
assert np.all(np.isfinite(out)), f"expected finite probabilities, got {out}"
assert np.allclose(out, exp, atol=1e-6), f"expected {exp}, got {out}"`
      },
      {
        name: 'axis zero normalization',
        code: `x = np.array([[1.0, 3.0], [2.0, 4.0], [3.0, 5.0]])
out = softmax_stable(x, axis=0)
assert np.allclose(out.sum(axis=0), np.ones(2), atol=1e-6), f"column sums should be 1, got {out.sum(axis=0)}"`
      },
      {
        name: 'temperature changes sharpness',
        code: `x = np.array([0.0, 1.0, 2.0])
cold = softmax_stable(x, temperature=0.5)
hot = softmax_stable(x, temperature=2.0)
assert cold.argmax() == hot.argmax() == 2, f"argmax should be preserved, got {cold}, {hot}"
assert cold.max() > hot.max(), f"lower temperature should be sharper, got cold={cold}, hot={hot}"`
      },
      {
        name: 'hidden negative large logits',
        hidden: true,
        code: `x = np.array([-1000.0, -1000.0])
out = softmax_stable(x)
exp = np.array([0.5, 0.5])
assert np.allclose(out, exp, atol=1e-6), f"expected {exp}, got {out}"`
      }
    ]
  },
  {
    id: 'stable-sigmoid-bce',
    title: 'Stable Sigmoid and Binary Cross-Entropy',
    difficulty: 'Easy',
    category: 'Fundamentals',
    description: `Implement sigmoid and binary cross-entropy from logits.

Signatures: sigmoid(x) -> np.ndarray or scalar-compatible ndarray, and binary_cross_entropy(y_true, logits, reduction='mean') -> float or ndarray.

y_true and logits have broadcast-compatible shapes. The loss is $-y \log \sigma(z) - (1-y) \log(1-\sigma(z))$, but it must be computed in a stable logit form. reduction is one of 'mean', 'sum', or 'none'. Results use atol 1e-6.`,
    starter: `import numpy as np

def sigmoid(x):
    raise NotImplementedError

def binary_cross_entropy(y_true, logits, reduction="mean"):
    raise NotImplementedError
`,
    solution: `import numpy as np

def sigmoid(x):
    x = np.asarray(x, dtype=float)
    out = np.empty_like(x, dtype=float)
    pos = x >= 0
    out[pos] = 1.0 / (1.0 + np.exp(-x[pos]))
    exp_x = np.exp(x[~pos])
    out[~pos] = exp_x / (1.0 + exp_x)
    return out

def binary_cross_entropy(y_true, logits, reduction="mean"):
    y = np.asarray(y_true, dtype=float)
    z = np.asarray(logits, dtype=float)
    losses = np.maximum(z, 0.0) - z * y + np.log1p(np.exp(-np.abs(z)))
    if reduction == "mean":
        return float(np.mean(losses))
    if reduction == "sum":
        return float(np.sum(losses))
    if reduction == "none":
        return losses
    raise ValueError("reduction must be 'mean', 'sum', or 'none'")
`,
    explanation: `The sigmoid branch avoids evaluating $\exp(1000)$ or $\exp(-1000)$ in the unstable direction. For BCE, the identity $\max(z,0) - zy + \log(1 + \exp(-|z|))$ is algebraically equal to the logistic loss and stays finite.

The implementation is fully vectorized with NumPy broadcasting. Complexity is O(n) time and O(n) memory. Interviewers look for stable logits, correct reduction behavior, and avoidance of clipping probabilities as a primary strategy.`,
    hints: [
      'Compute sigmoid differently for positive and negative inputs.',
      'Do not call log(sigmoid(z)) directly for huge logits.',
      'The stable BCE formula uses max(z, 0) and log1p(exp(-abs(z))).'
    ],
    tests: [
      {
        name: 'sigmoid basic values',
        code: `x = np.array([-2.0, 0.0, 2.0])
out = sigmoid(x)
exp = 1.0 / (1.0 + np.exp(-x))
assert np.allclose(out, exp, atol=1e-6), f"expected {exp}, got {out}"`
      },
      {
        name: 'sigmoid extreme values finite',
        code: `x = np.array([-1000.0, 1000.0])
out = sigmoid(x)
assert np.all(np.isfinite(out)), f"sigmoid should be finite, got {out}"
assert out[0] < 1e-12 and out[1] > 1 - 1e-12, f"expected saturated probabilities, got {out}"`
      },
      {
        name: 'bce mean matches stable reference',
        code: `y = np.array([0.0, 1.0, 1.0, 0.0])
z = np.array([-1.0, 2.0, 0.5, 3.0])
exp = np.mean(np.maximum(z, 0.0) - z * y + np.log1p(np.exp(-np.abs(z))))
out = binary_cross_entropy(y, z)
assert np.allclose(out, exp, atol=1e-6), f"expected {exp}, got {out}"`
      },
      {
        name: 'bce none and sum reductions',
        code: `y = np.array([1.0, 0.0])
z = np.array([10.0, -10.0])
losses = binary_cross_entropy(y, z, reduction="none")
assert losses.shape == y.shape, f"expected per-example losses, got shape {losses.shape}"
assert np.all(losses < 1e-3), f"confident correct logits should have tiny loss, got {losses}"
assert np.allclose(binary_cross_entropy(y, z, reduction="sum"), losses.sum(), atol=1e-9), "sum reduction mismatch"`
      },
      {
        name: 'hidden bce huge wrong logits',
        hidden: true,
        code: `y = np.array([0.0, 1.0])
z = np.array([1000.0, -1000.0])
out = binary_cross_entropy(y, z, reduction="none")
exp = np.array([1000.0, 1000.0])
assert np.all(np.isfinite(out)), f"expected finite huge losses, got {out}"
assert np.allclose(out, exp, atol=1e-6), f"expected {exp}, got {out}"`
      }
    ]
  },
  {
    id: 'linear-regression-closed-form-gd',
    title: 'Linear Regression: Normal Equation and Gradient Descent',
    difficulty: 'Medium',
    category: 'Fundamentals',
    viz: 'gradient-descent',
    description: `Implement linear regression two ways.

Signatures: linear_regression_closed_form(X, y, fit_intercept=True, l2=0.0) -> (w, b), and linear_regression_gd(X, y, lr=0.1, epochs=1000, fit_intercept=True) -> (w, b, losses).

X has shape (n_samples, n_features), y has shape (n_samples,). Return w with shape (n_features,), scalar b, and for GD a Python list of mean squared errors. Use the objective $\frac{1}{2n}\sum_i (x_i w + b - y_i)^2$; for closed form, l2 regularizes only weights, not the intercept.`,
    starter: `import numpy as np

def linear_regression_closed_form(X, y, fit_intercept=True, l2=0.0):
    raise NotImplementedError

def linear_regression_gd(X, y, lr=0.1, epochs=1000, fit_intercept=True):
    raise NotImplementedError
`,
    solution: `import numpy as np

def linear_regression_closed_form(X, y, fit_intercept=True, l2=0.0):
    X = np.asarray(X, dtype=float)
    y = np.asarray(y, dtype=float).reshape(-1)
    if fit_intercept:
        A = np.column_stack([X, np.ones(X.shape[0])])
        reg = np.eye(A.shape[1]) * float(l2)
        reg[-1, -1] = 0.0
        theta = np.linalg.pinv(A.T @ A + reg) @ A.T @ y
        return theta[:-1], float(theta[-1])
    reg = np.eye(X.shape[1]) * float(l2)
    w = np.linalg.pinv(X.T @ X + reg) @ X.T @ y
    return w, 0.0

def linear_regression_gd(X, y, lr=0.1, epochs=1000, fit_intercept=True):
    X = np.asarray(X, dtype=float)
    y = np.asarray(y, dtype=float).reshape(-1)
    n, d = X.shape
    w = np.zeros(d, dtype=float)
    b = 0.0
    losses = []
    for _ in range(int(epochs)):
        pred = X @ w + (b if fit_intercept else 0.0)
        err = pred - y
        losses.append(float(0.5 * np.mean(err ** 2)))
        w -= lr * (X.T @ err) / n
        if fit_intercept:
            b -= lr * float(np.mean(err))
    pred = X @ w + (b if fit_intercept else 0.0)
    err = pred - y
    losses.append(float(0.5 * np.mean(err ** 2)))
    return w, float(b if fit_intercept else 0.0), losses
`,
    explanation: `The closed-form solution solves the normal equations. Appending a column of ones lets the intercept be estimated with the same linear algebra while leaving it unregularized.

Gradient descent uses gradients $X^T(\hat y-y)/n$ and mean residual for the bias. The loss history should decrease for a suitable learning rate. Complexity is O(nd^2 + d^3) for the normal equation and O(epochs times nd) for GD. Interviewers probe matrix shapes, intercept handling, and why ridge can use a diagonal penalty.`,
    hints: [
      'Add a ones column when fit_intercept is true.',
      'Use pinv rather than inverse to handle collinear features.',
      'The MSE gradient averages residuals over n samples.'
    ],
    tests: [
      {
        name: 'closed form recovers exact line',
        code: `X = np.array([[0.0], [1.0], [2.0], [3.0]])
y = 2.0 * X[:, 0] + 1.0
w, b = linear_regression_closed_form(X, y)
assert np.allclose(w, np.array([2.0]), atol=1e-6), f"expected slope 2, got {w}"
assert np.allclose(b, 1.0, atol=1e-6), f"expected intercept 1, got {b}"`
      },
      {
        name: 'closed form no intercept',
        code: `X = np.array([[1.0, 0.0], [0.0, 1.0], [1.0, 1.0]])
y = np.array([2.0, -1.0, 1.0])
w, b = linear_regression_closed_form(X, y, fit_intercept=False)
assert np.allclose(w, np.array([2.0, -1.0]), atol=1e-6), f"expected [2,-1], got {w}"
assert b == 0.0, f"expected zero bias, got {b}"`
      },
      {
        name: 'gd loss decreases and fits',
        code: `X = np.array([[0.0], [1.0], [2.0], [3.0]])
y = 3.0 * X[:, 0] - 2.0
w, b, losses = linear_regression_gd(X, y, lr=0.1, epochs=2000)
assert losses[-1] < losses[0], f"loss should decrease from {losses[0]} to {losses[-1]}"
assert np.allclose(w, np.array([3.0]), atol=1e-2), f"expected slope near 3, got {w}"
assert np.allclose(b, -2.0, atol=1e-2), f"expected intercept near -2, got {b}"`
      },
      {
        name: 'ridge shrinks weights',
        code: `X = np.array([[1.0], [2.0], [3.0], [4.0]])
y = np.array([2.0, 4.0, 6.0, 8.0])
w0, b0 = linear_regression_closed_form(X, y, fit_intercept=False, l2=0.0)
w1, b1 = linear_regression_closed_form(X, y, fit_intercept=False, l2=10.0)
assert abs(w1[0]) < abs(w0[0]), f"ridge should shrink weights, got unreg={w0}, reg={w1}"
assert b0 == b1 == 0.0, f"no-intercept bias should be zero, got {b0}, {b1}"`
      },
      {
        name: 'hidden multifeature closed form',
        hidden: true,
        code: `X = np.array([[1.0, 2.0], [3.0, -1.0], [0.0, 4.0], [2.0, 2.0]])
w_true = np.array([1.5, -0.5]); b_true = 0.25
y = X @ w_true + b_true
w, b = linear_regression_closed_form(X, y)
assert np.allclose(w, w_true, atol=1e-6), f"expected {w_true}, got {w}"
assert np.allclose(b, b_true, atol=1e-6), f"expected {b_true}, got {b}"`
      }
    ]
  },
  {
    id: 'logistic-regression-gradient-descent',
    title: 'Logistic Regression with Gradient Descent',
    difficulty: 'Medium',
    category: 'Fundamentals',
    viz: 'logistic-regression',
    description: `Train binary logistic regression with full-batch gradient descent.

Signatures: logistic_regression_gd(X, y, lr=0.1, epochs=1000, fit_intercept=True) -> (w, b, losses), and predict_proba(X, w, b=0.0) -> np.ndarray.

X has shape (n, d), y has zeros and ones with shape (n,). Minimize mean binary cross-entropy from logits $Xw+b$. Return w shape (d,), scalar b, and a list of losses. Probabilities must be stable for large logits.`,
    starter: `import numpy as np

def logistic_regression_gd(X, y, lr=0.1, epochs=1000, fit_intercept=True):
    raise NotImplementedError

def predict_proba(X, w, b=0.0):
    raise NotImplementedError
`,
    solution: `import numpy as np

def _sigmoid(z):
    z = np.asarray(z, dtype=float)
    out = np.empty_like(z, dtype=float)
    pos = z >= 0
    out[pos] = 1.0 / (1.0 + np.exp(-z[pos]))
    ez = np.exp(z[~pos])
    out[~pos] = ez / (1.0 + ez)
    return out

def _bce(y, z):
    return float(np.mean(np.maximum(z, 0.0) - z * y + np.log1p(np.exp(-np.abs(z)))))

def predict_proba(X, w, b=0.0):
    return _sigmoid(np.asarray(X, dtype=float) @ np.asarray(w, dtype=float) + float(b))

def logistic_regression_gd(X, y, lr=0.1, epochs=1000, fit_intercept=True):
    X = np.asarray(X, dtype=float)
    y = np.asarray(y, dtype=float).reshape(-1)
    n, d = X.shape
    w = np.zeros(d, dtype=float)
    b = 0.0
    losses = []
    for _ in range(int(epochs)):
        z = X @ w + (b if fit_intercept else 0.0)
        p = _sigmoid(z)
        losses.append(_bce(y, z))
        err = p - y
        w -= lr * (X.T @ err) / n
        if fit_intercept:
            b -= lr * float(np.mean(err))
    z = X @ w + (b if fit_intercept else 0.0)
    losses.append(_bce(y, z))
    return w, float(b if fit_intercept else 0.0), losses
`,
    explanation: `For logistic regression, the derivative of mean BCE with respect to logits is $\sigma(z)-y$. That makes the full-batch gradient $X^T(p-y)/n$ plus the average residual for the intercept.

The stable sigmoid prevents overflow during both training and prediction. Runtime is O(epochs times nd), memory is O(d+n). Interviewers probe the link between BCE and sigmoid, bias handling, and why the gradient has such a compact form.`,
    hints: [
      'Compute probabilities from logits, then use p - y as the residual.',
      'Track a stable BCE loss rather than log of clipped probabilities.',
      'Only update the bias when fit_intercept is true.'
    ],
    tests: [
      {
        name: 'probability helper is stable',
        code: `X = np.array([[1000.0], [-1000.0]])
w = np.array([1.0])
out = predict_proba(X, w, 0.0)
assert np.all(np.isfinite(out)), f"expected finite probabilities, got {out}"
assert out[0] > 1 - 1e-12 and out[1] < 1e-12, f"expected saturation, got {out}"`
      },
      {
        name: 'learns separable one-dimensional data',
        code: `X = np.array([[-3.0], [-2.0], [-1.0], [1.0], [2.0], [3.0]])
y = np.array([0, 0, 0, 1, 1, 1], dtype=float)
w, b, losses = logistic_regression_gd(X, y, lr=0.2, epochs=1200)
probs = predict_proba(X, w, b)
preds = (probs >= 0.5).astype(int)
assert losses[-1] < losses[0], f"loss should decrease from {losses[0]} to {losses[-1]}"
assert np.array_equal(preds, y.astype(int)), f"expected perfect separation, got probabilities {probs}"`
      },
      {
        name: 'bias shifts boundary',
        code: `X = np.array([[0.0], [1.0], [2.0], [3.0], [4.0]])
y = np.array([0, 0, 0, 1, 1], dtype=float)
w, b, losses = logistic_regression_gd(X, y, lr=0.2, epochs=1500)
assert b < 0, f"positive threshold should require negative bias, got {b}"
assert losses[-1] < 0.35, f"expected low loss, got {losses[-1]}"`
      },
      {
        name: 'no intercept leaves zero bias',
        code: `X = np.array([[-2.0], [-1.0], [1.0], [2.0]])
y = np.array([0, 0, 1, 1], dtype=float)
w, b, losses = logistic_regression_gd(X, y, lr=0.1, epochs=1000, fit_intercept=False)
assert b == 0.0, f"expected zero bias with fit_intercept=False, got {b}"
assert w[0] > 0, f"expected positive slope, got {w}"`
      },
      {
        name: 'hidden two-feature dataset',
        hidden: true,
        code: `X = np.array([[-2.0, -1.0], [-1.0, -1.0], [1.0, 1.0], [2.0, 1.0], [2.0, 2.0], [-2.0, -2.0]])
y = np.array([0, 0, 1, 1, 1, 0], dtype=float)
w, b, losses = logistic_regression_gd(X, y, lr=0.15, epochs=1500)
preds = (predict_proba(X, w, b) >= 0.5).astype(int)
assert np.array_equal(preds, y.astype(int)), f"expected perfect labels, got {preds}"`
      }
    ]
  },
  {
    id: 'sgd-momentum-adam-step',
    title: 'Momentum SGD and Adam Optimizer Steps',
    difficulty: 'Medium',
    category: 'Fundamentals',
    viz: 'gradient-descent',
    description: `Implement one update step for two optimizers.

Signatures: sgd_momentum_step(params, grads, velocity, lr=0.01, momentum=0.9) -> (new_params, new_velocity), and adam_step(params, grads, m, v, t, lr=0.001, beta1=0.9, beta2=0.999, eps=1e-8) -> (new_params, new_m, new_v).

params, grads, velocity, m, and v are dictionaries mapping identical parameter names to NumPy arrays. Return new dictionaries without mutating the inputs. Adam uses bias-corrected moments $m_t/(1-\beta_1^t)$ and $v_t/(1-\beta_2^t)$.`,
    starter: `import numpy as np

def sgd_momentum_step(params, grads, velocity, lr=0.01, momentum=0.9):
    raise NotImplementedError

def adam_step(params, grads, m, v, t, lr=0.001, beta1=0.9, beta2=0.999, eps=1e-8):
    raise NotImplementedError
`,
    solution: `import numpy as np

def sgd_momentum_step(params, grads, velocity, lr=0.01, momentum=0.9):
    new_params = {}
    new_velocity = {}
    for name, p in params.items():
        vel = momentum * np.asarray(velocity[name], dtype=float) - lr * np.asarray(grads[name], dtype=float)
        new_velocity[name] = vel
        new_params[name] = np.asarray(p, dtype=float) + vel
    return new_params, new_velocity

def adam_step(params, grads, m, v, t, lr=0.001, beta1=0.9, beta2=0.999, eps=1e-8):
    new_params = {}
    new_m = {}
    new_v = {}
    for name, p in params.items():
        g = np.asarray(grads[name], dtype=float)
        mt = beta1 * np.asarray(m[name], dtype=float) + (1.0 - beta1) * g
        vt = beta2 * np.asarray(v[name], dtype=float) + (1.0 - beta2) * (g ** 2)
        mhat = mt / (1.0 - beta1 ** int(t))
        vhat = vt / (1.0 - beta2 ** int(t))
        new_m[name] = mt
        new_v[name] = vt
        new_params[name] = np.asarray(p, dtype=float) - lr * mhat / (np.sqrt(vhat) + eps)
    return new_params, new_m, new_v
`,
    explanation: `Momentum stores an exponentially decayed velocity and adds it to the parameter. Adam stores first and second moments, corrects their initialization bias, then scales the step by the root mean square gradient.

Using dictionaries mirrors real training loops where each parameter tensor has its own state. The update is O(total parameters) and should allocate fresh arrays to avoid surprising callers. Interviewers probe sign conventions, bias correction, and state handling.`,
    hints: [
      'Momentum velocity often has the sign of the parameter step, not the raw gradient.',
      'Adam t is one-based in the bias correction factors.',
      'Return new state dictionaries instead of editing the old ones in place.'
    ],
    tests: [
      {
        name: 'momentum first step equals gradient descent',
        code: `params = {"w": np.array([1.0, -2.0])}
grads = {"w": np.array([0.5, -0.25])}
vel = {"w": np.zeros(2)}
new_p, new_v = sgd_momentum_step(params, grads, vel, lr=0.1, momentum=0.9)
exp_v = np.array([-0.05, 0.025])
exp_p = params["w"] + exp_v
assert np.allclose(new_v["w"], exp_v, atol=1e-9), f"expected velocity {exp_v}, got {new_v['w']}"
assert np.allclose(new_p["w"], exp_p, atol=1e-9), f"expected params {exp_p}, got {new_p['w']}"`
      },
      {
        name: 'momentum accumulates state',
        code: `params = {"w": np.array([1.0])}
grads = {"w": np.array([1.0])}
vel = {"w": np.array([-0.1])}
new_p, new_v = sgd_momentum_step(params, grads, vel, lr=0.1, momentum=0.9)
assert np.allclose(new_v["w"], np.array([-0.19]), atol=1e-9), f"expected -0.19 velocity, got {new_v['w']}"
assert np.allclose(new_p["w"], np.array([0.81]), atol=1e-9), f"expected parameter 0.81, got {new_p['w']}"`
      },
      {
        name: 'adam first step bias correction',
        code: `params = {"w": np.array([1.0, 2.0])}
grads = {"w": np.array([0.1, -0.2])}
m = {"w": np.zeros(2)}
v = {"w": np.zeros(2)}
new_p, new_m, new_v = adam_step(params, grads, m, v, t=1, lr=0.01)
exp = np.array([0.99, 2.01])
assert np.allclose(new_p["w"], exp, atol=1e-6), f"expected {exp}, got {new_p['w']}"
assert np.allclose(new_m["w"], np.array([0.01, -0.02]), atol=1e-9), f"wrong first moment {new_m['w']}"`
      },
      {
        name: 'does not mutate inputs',
        code: `params = {"w": np.array([1.0])}
grads = {"w": np.array([0.5])}
vel = {"w": np.array([0.0])}
orig = params["w"].copy()
new_p, new_v = sgd_momentum_step(params, grads, vel, lr=0.1)
assert np.allclose(params["w"], orig), f"params were mutated from {orig} to {params['w']}"
assert new_p["w"] is not params["w"], "new params should be a fresh array"`
      },
      {
        name: 'hidden adam multiple tensors',
        hidden: true,
        code: `params = {"w": np.array([1.0]), "b": np.array([0.0])}
grads = {"w": np.array([0.3]), "b": np.array([-0.1])}
m = {"w": np.array([0.03]), "b": np.array([0.0])}
v = {"w": np.array([0.0009]), "b": np.array([0.0])}
new_p, new_m, new_v = adam_step(params, grads, m, v, t=2, lr=0.01)
assert set(new_p) == {"w", "b"}, f"missing parameter keys {new_p.keys()}"
assert new_p["w"].shape == (1,) and new_p["b"].shape == (1,), "shapes should be preserved"`
      }
    ]
  },
  {
    id: 'regularized-linear-loss-gradient',
    title: 'L1 and L2 Regularized Linear Loss and Gradient',
    difficulty: 'Medium',
    category: 'Fundamentals',
    viz: 'regularization',
    description: `Implement a linear regression objective with L1 and L2 penalties.

Signature: regularized_linear_loss_grad(X, y, w, b=0.0, l1=0.0, l2=0.0) -> (loss, grad_w, grad_b).

Use $\frac{1}{2n}\sum_i (x_i w + b - y_i)^2 + l1 \sum_j |w_j| + \frac{l2}{2}\sum_j w_j^2$. Do not regularize b. Return a float loss, grad_w with shape like w, and scalar grad_b. At w_j = 0, use subgradient 0 for L1.`,
    starter: `import numpy as np

def regularized_linear_loss_grad(X, y, w, b=0.0, l1=0.0, l2=0.0):
    raise NotImplementedError
`,
    solution: `import numpy as np

def regularized_linear_loss_grad(X, y, w, b=0.0, l1=0.0, l2=0.0):
    X = np.asarray(X, dtype=float)
    y = np.asarray(y, dtype=float).reshape(-1)
    w = np.asarray(w, dtype=float)
    n = X.shape[0]
    err = X @ w + float(b) - y
    data_loss = 0.5 * np.mean(err ** 2)
    reg_loss = float(l1) * np.sum(np.abs(w)) + 0.5 * float(l2) * np.sum(w ** 2)
    grad_w = (X.T @ err) / n + float(l1) * np.sign(w) + float(l2) * w
    grad_b = float(np.mean(err))
    return float(data_loss + reg_loss), grad_w, grad_b
`,
    explanation: `The squared-error gradient contributes $X^T r / n$ where r is the residual vector. L2 adds $l2 \cdot w$ and L1 adds the sign subgradient; choosing zero at exactly zero is a common deterministic convention.

The bias is excluded from regularization because it shifts the baseline rather than controlling feature complexity. Runtime is O(nd). Interviewers probe subgradients, the 1/2 factor, and not accidentally penalizing the intercept.`,
    hints: [
      'Write the residual once and reuse it for loss and gradients.',
      'The 1/2 in the data loss cancels the 2 from differentiating squared error.',
      'np.sign gives the requested L1 subgradient, including 0 at w=0.'
    ],
    tests: [
      {
        name: 'unregularized gradient matches hand calculation',
        code: `X = np.array([[1.0, 2.0], [3.0, 4.0]])
y = np.array([1.0, 2.0])
w = np.array([0.5, -0.25])
loss, gw, gb = regularized_linear_loss_grad(X, y, w, b=0.1)
err = X @ w + 0.1 - y
exp_loss = 0.5 * np.mean(err ** 2)
exp_gw = X.T @ err / len(y)
exp_gb = err.mean()
assert np.allclose(loss, exp_loss, atol=1e-9), f"expected loss {exp_loss}, got {loss}"
assert np.allclose(gw, exp_gw, atol=1e-9), f"expected grad {exp_gw}, got {gw}"
assert np.allclose(gb, exp_gb, atol=1e-9), f"expected bias grad {exp_gb}, got {gb}"`
      },
      {
        name: 'l2 adds loss and gradient',
        code: `X = np.eye(2)
y = np.zeros(2)
w = np.array([2.0, -1.0])
loss, gw, gb = regularized_linear_loss_grad(X, y, w, l2=0.5)
_, gw0, _ = regularized_linear_loss_grad(X, y, w)
assert np.allclose(gw - gw0, 0.5 * w, atol=1e-9), f"L2 gradient addend wrong: {gw - gw0}"
assert loss > 0.5 * np.mean((X @ w) ** 2), "L2 should increase loss"`
      },
      {
        name: 'l1 subgradient uses sign',
        code: `X = np.zeros((3, 3))
y = np.zeros(3)
w = np.array([2.0, -3.0, 0.0])
loss, gw, gb = regularized_linear_loss_grad(X, y, w, l1=0.25)
exp_gw = np.array([0.25, -0.25, 0.0])
assert np.allclose(gw, exp_gw, atol=1e-9), f"expected {exp_gw}, got {gw}"
assert gb == 0.0, f"expected zero bias gradient, got {gb}"`
      },
      {
        name: 'bias is not regularized',
        code: `X = np.zeros((4, 2))
y = np.zeros(4)
w = np.array([0.0, 0.0])
loss, gw, gb = regularized_linear_loss_grad(X, y, w, b=10.0, l1=5.0, l2=5.0)
assert np.allclose(gw, np.zeros_like(w)), f"zero features should give zero weight grad, got {gw}"
assert np.allclose(gb, 10.0), f"bias grad should be residual mean 10, got {gb}"`
      }
    ]
  },
  {
    id: 'split-and-kfold-indices',
    title: 'Train/Test Split and K-Fold Indices',
    difficulty: 'Easy',
    category: 'Fundamentals',
    description: `Implement deterministic index split helpers.

Signatures: train_test_split_indices(n_samples, test_size=0.2, seed=None, shuffle=True) -> (train_idx, test_idx), and k_fold_indices(n_samples, k, seed=None, shuffle=True) -> list[(train_idx, val_idx)].

Return NumPy integer arrays. test_size may be a float fraction or an integer count. For shuffling, use np.random.default_rng(seed).permutation(n_samples). K folds should cover every index exactly once as validation, with fold sizes differing by at most one.`,
    starter: `import numpy as np

def train_test_split_indices(n_samples, test_size=0.2, seed=None, shuffle=True):
    raise NotImplementedError

def k_fold_indices(n_samples, k, seed=None, shuffle=True):
    raise NotImplementedError
`,
    solution: `import numpy as np

def _ordered_indices(n_samples, seed, shuffle):
    n = int(n_samples)
    if shuffle:
        return np.random.default_rng(seed).permutation(n)
    return np.arange(n)

def train_test_split_indices(n_samples, test_size=0.2, seed=None, shuffle=True):
    n = int(n_samples)
    if isinstance(test_size, float):
        n_test = int(np.ceil(n * test_size))
    else:
        n_test = int(test_size)
    n_test = max(0, min(n, n_test))
    idx = _ordered_indices(n, seed, shuffle)
    test_idx = idx[:n_test]
    train_idx = idx[n_test:]
    return train_idx.astype(int), test_idx.astype(int)

def k_fold_indices(n_samples, k, seed=None, shuffle=True):
    n = int(n_samples)
    k = int(k)
    if k <= 1 or k > n:
        raise ValueError("k must be in [2, n_samples]")
    idx = _ordered_indices(n, seed, shuffle)
    sizes = np.full(k, n // k, dtype=int)
    sizes[: n % k] += 1
    folds = []
    start = 0
    for size in sizes:
        val = idx[start:start + size]
        train = np.concatenate([idx[:start], idx[start + size:]])
        folds.append((train.astype(int), val.astype(int)))
        start += size
    return folds
`,
    explanation: `The split operates on indices so callers can reuse it for X, y, groups, or metadata. A seeded permutation makes the output reproducible without depending on global random state.

For k-fold, assigning the remainder to early folds gives sizes that differ by at most one. Complexity is O(nk) if each train array is materialized, which is acceptable for interview utilities. Interviewers probe off-by-one behavior and leakage-free validation coverage.`,
    hints: [
      'Convert float test_size with ceil so small datasets still get test rows.',
      'Use a local default_rng rather than np.random.seed.',
      'Each validation fold should be disjoint and their union should be all indices.'
    ],
    tests: [
      {
        name: 'non-shuffled split is deterministic',
        code: `train, test = train_test_split_indices(10, test_size=0.3, shuffle=False)
assert np.array_equal(test, np.array([0, 1, 2])), f"expected first three test indices, got {test}"
assert np.array_equal(train, np.arange(3, 10)), f"expected remaining train indices, got {train}"`
      },
      {
        name: 'integer test size',
        code: `train, test = train_test_split_indices(5, test_size=2, shuffle=False)
assert len(test) == 2 and len(train) == 3, f"expected 2 test and 3 train, got {len(test)}, {len(train)}"
assert set(train).isdisjoint(set(test)), f"train/test overlap: {train}, {test}"`
      },
      {
        name: 'seeded split reproducible',
        code: `a = train_test_split_indices(12, test_size=4, seed=7, shuffle=True)
b = train_test_split_indices(12, test_size=4, seed=7, shuffle=True)
assert np.array_equal(a[0], b[0]) and np.array_equal(a[1], b[1]), f"same seed should reproduce, got {a}, {b}"`
      },
      {
        name: 'k folds cover each index once',
        code: `folds = k_fold_indices(11, 4, seed=3)
vals = np.concatenate([v for _, v in folds])
assert sorted(vals.tolist()) == list(range(11)), f"validation indices should cover all samples once, got {vals}"
sizes = [len(v) for _, v in folds]
assert max(sizes) - min(sizes) <= 1, f"fold sizes should be balanced, got {sizes}"`
      },
      {
        name: 'hidden train excludes validation',
        hidden: true,
        code: `for train, val in k_fold_indices(9, 3, shuffle=False):
    assert set(train).isdisjoint(set(val)), f"train and val overlap: train={train}, val={val}"
    assert len(train) + len(val) == 9, "fold should partition all samples"`
      }
    ]
  },
  {
    id: 'numpy-scalers-fit-transform',
    title: 'Standardization and Min-Max Scaling API',
    difficulty: 'Easy',
    category: 'Fundamentals',
    description: `Build small preprocessing scaler classes with a fit/transform API.

Classes and methods: StandardScaler().fit(X), transform(X), fit_transform(X), inverse_transform(X); MinMaxScaler(feature_range=(0, 1)) with the same methods.

X is a 2D array with shape (n_samples, n_features). StandardScaler stores mean_, var_, and scale_, then returns (X - mean_) / scale_. MinMaxScaler stores data_min_, data_max_, scale_, and min_, then maps each feature into feature_range. Constant features should not divide by zero.`,
    starter: `import numpy as np

class StandardScaler:
    def fit(self, X):
        raise NotImplementedError
    def transform(self, X):
        raise NotImplementedError
    def fit_transform(self, X):
        raise NotImplementedError
    def inverse_transform(self, X):
        raise NotImplementedError

class MinMaxScaler:
    def __init__(self, feature_range=(0, 1)):
        raise NotImplementedError
    def fit(self, X):
        raise NotImplementedError
    def transform(self, X):
        raise NotImplementedError
    def fit_transform(self, X):
        raise NotImplementedError
    def inverse_transform(self, X):
        raise NotImplementedError
`,
    solution: `import numpy as np

class StandardScaler:
    def fit(self, X):
        X = np.asarray(X, dtype=float)
        self.mean_ = X.mean(axis=0)
        self.var_ = X.var(axis=0)
        self.scale_ = np.where(self.var_ == 0.0, 1.0, np.sqrt(self.var_))
        return self

    def transform(self, X):
        return (np.asarray(X, dtype=float) - self.mean_) / self.scale_

    def fit_transform(self, X):
        return self.fit(X).transform(X)

    def inverse_transform(self, X):
        return np.asarray(X, dtype=float) * self.scale_ + self.mean_

class MinMaxScaler:
    def __init__(self, feature_range=(0, 1)):
        self.feature_range = feature_range

    def fit(self, X):
        X = np.asarray(X, dtype=float)
        lo, hi = self.feature_range
        self.data_min_ = X.min(axis=0)
        self.data_max_ = X.max(axis=0)
        data_range = self.data_max_ - self.data_min_
        safe_range = np.where(data_range == 0.0, 1.0, data_range)
        self.scale_ = (hi - lo) / safe_range
        self.min_ = lo - self.data_min_ * self.scale_
        return self

    def transform(self, X):
        return np.asarray(X, dtype=float) * self.scale_ + self.min_

    def fit_transform(self, X):
        return self.fit(X).transform(X)

    def inverse_transform(self, X):
        X = np.asarray(X, dtype=float)
        return (X - self.min_) / self.scale_
`,
    explanation: `Fit computes only training-set statistics; transform reuses them for any later array. For standardization, constant columns use scale 1 so they transform to zero instead of NaN.

Min-max scaling is an affine map from observed data range to the requested feature range. The API returns self from fit to support chaining. Complexity is O(nd). Interviewers probe leakage prevention, broadcasting, and constant-feature behavior.`,
    hints: [
      'Store learned statistics as attributes with trailing underscores.',
      'Use axis=0 to compute per-feature statistics.',
      'For constant columns, choose a safe denominator of 1.'
    ],
    tests: [
      {
        name: 'standard scaler zero mean unit variance',
        code: `X = np.array([[1.0, 2.0], [3.0, 4.0], [5.0, 6.0]])
scaler = StandardScaler()
Z = scaler.fit_transform(X)
assert np.allclose(Z.mean(axis=0), np.zeros(2), atol=1e-9), f"mean should be zero, got {Z.mean(axis=0)}"
assert np.allclose(Z.var(axis=0), np.ones(2), atol=1e-9), f"variance should be one, got {Z.var(axis=0)}"`
      },
      {
        name: 'standard inverse recovers input',
        code: `X = np.array([[2.0, 10.0], [4.0, 10.0]])
scaler = StandardScaler().fit(X)
Z = scaler.transform(X)
back = scaler.inverse_transform(Z)
assert np.allclose(back, X, atol=1e-9), f"expected inverse to recover {X}, got {back}"
assert np.allclose(Z[:, 1], np.zeros(2)), f"constant feature should map to zero, got {Z[:, 1]}"`
      },
      {
        name: 'minmax maps range',
        code: `X = np.array([[0.0, 10.0], [5.0, 20.0], [10.0, 30.0]])
scaler = MinMaxScaler(feature_range=(-1, 1))
Z = scaler.fit_transform(X)
assert np.allclose(Z.min(axis=0), np.array([-1.0, -1.0]), atol=1e-9), f"min should be -1, got {Z.min(axis=0)}"
assert np.allclose(Z.max(axis=0), np.array([1.0, 1.0]), atol=1e-9), f"max should be 1, got {Z.max(axis=0)}"`
      },
      {
        name: 'minmax constant feature finite',
        code: `X = np.array([[3.0, 1.0], [3.0, 2.0], [3.0, 3.0]])
scaler = MinMaxScaler().fit(X)
Z = scaler.transform(X)
assert np.all(np.isfinite(Z)), f"expected finite scaled values, got {Z}"
assert np.allclose(Z[:, 0], np.zeros(3)), f"constant feature should map to lower bound 0, got {Z[:, 0]}"`
      }
    ]
  },
  {
    id: 'one-hot-encoding-numpy',
    title: 'One-Hot Encoding with NumPy',
    difficulty: 'Easy',
    category: 'Fundamentals',
    description: `Implement one-hot encoding for integer labels.

Signature: one_hot_encode(labels, num_classes=None, dtype=float) -> np.ndarray.

labels is a 1D array-like of nonnegative integer class ids. Return an array of shape (n_samples, num_classes). If num_classes is None, infer max(labels)+1. The output dtype should follow dtype. Empty labels are allowed only when num_classes is provided.`,
    starter: `import numpy as np

def one_hot_encode(labels, num_classes=None, dtype=float):
    raise NotImplementedError
`,
    solution: `import numpy as np

def one_hot_encode(labels, num_classes=None, dtype=float):
    labels = np.asarray(labels, dtype=int).reshape(-1)
    if num_classes is None:
        if labels.size == 0:
            raise ValueError("num_classes is required for empty labels")
        num_classes = int(labels.max()) + 1
    out = np.zeros((labels.size, int(num_classes)), dtype=dtype)
    if labels.size:
        if labels.min() < 0 or labels.max() >= int(num_classes):
            raise ValueError("labels out of range")
        out[np.arange(labels.size), labels] = 1
    return out
`,
    explanation: `One-hot encoding is just indexed assignment into a zero matrix. Advanced indexing selects one column per row and writes one in a single vectorized operation.

The runtime and memory are O(n times C), where C is the number of classes. Interviewers probe shape inference, dtype handling, and validation for empty or out-of-range labels.`,
    hints: [
      'Flatten labels to a 1D integer array.',
      'Allocate zeros with shape (n_samples, num_classes).',
      'Use out[np.arange(n), labels] = 1 for vectorized assignment.'
    ],
    tests: [
      {
        name: 'basic encoding',
        code: `labels = np.array([0, 2, 1])
out = one_hot_encode(labels)
exp = np.array([[1, 0, 0], [0, 0, 1], [0, 1, 0]], dtype=float)
assert np.allclose(out, exp), f"expected {exp}, got {out}"`
      },
      {
        name: 'explicit class count includes missing class',
        code: `out = one_hot_encode([1, 3], num_classes=5, dtype=int)
assert out.shape == (2, 5), f"expected shape (2,5), got {out.shape}"
assert out.dtype == np.dtype(int), f"expected int dtype, got {out.dtype}"
assert np.array_equal(out.sum(axis=1), np.ones(2, dtype=int)), f"each row should have one one, got {out}"`
      },
      {
        name: 'empty labels with class count',
        code: `out = one_hot_encode([], num_classes=4)
assert out.shape == (0, 4), f"expected empty matrix with 4 columns, got {out.shape}"`
      },
      {
        name: 'out of range raises',
        code: `try:
    one_hot_encode([0, 4], num_classes=3)
    ok = False
except ValueError:
    ok = True
assert ok, "expected ValueError for label >= num_classes"`
      }
    ]
  }
]

export default problems
