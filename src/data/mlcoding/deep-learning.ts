import type { MlCodingProblem } from '../../types/content'

const problems: MlCodingProblem[] = [
  {
    id: 'dense-layer-forward-backward',
    title: 'Dense Layer Forward and Backward',
    difficulty: 'Medium',
    category: 'Deep Learning',
    description: `Implement the forward and backward pass for a fully connected layer.

Signatures: dense_forward(X, W, b) -> (out, cache), and dense_backward(dout, cache) -> (dX, dW, db).

X has shape (batch, in_features), W has shape (in_features, out_features), b has shape (out_features,). The forward pass returns XW+b. Given dout with shape (batch, out_features), return gradients with shapes matching X, W, and b.`,
    starter: `import numpy as np

def dense_forward(X, W, b):
    raise NotImplementedError

def dense_backward(dout, cache):
    raise NotImplementedError
`,
    solution: `import numpy as np

def dense_forward(X, W, b):
    X = np.asarray(X, dtype=float)
    W = np.asarray(W, dtype=float)
    b = np.asarray(b, dtype=float)
    out = X @ W + b
    return out, (X, W, b)

def dense_backward(dout, cache):
    X, W, b = cache
    dout = np.asarray(dout, dtype=float)
    dX = dout @ W.T
    dW = X.T @ dout
    db = dout.sum(axis=0)
    return dX, dW, db
`,
    explanation: `The dense layer is a matrix multiplication plus broadcast bias. Reverse-mode gradients follow from matrix calculus: upstream gradients multiply by transposes, and the bias gradient sums over the batch.

No loops are needed. Complexity is O(batch times in_features times out_features). Interviewers probe shape reasoning, broadcasting, and whether gradients are summed or averaged.`,
    hints: [
      'Cache X and W because the backward pass needs both.',
      'dW is X transposed times dout.',
      'The bias is shared across rows, so sum dout over axis 0.'
    ],
    tests: [
      {
        name: 'forward shape and values',
        code: `X = np.array([[1.0, 2.0], [3.0, 4.0]])
W = np.array([[1.0, 0.0], [0.5, -1.0]])
b = np.array([0.1, 0.2])
out, cache = dense_forward(X, W, b)
exp = X @ W + b
assert out.shape == (2, 2), f"expected shape (2,2), got {out.shape}"
assert np.allclose(out, exp, atol=1e-9), f"expected {exp}, got {out}"`
      },
      {
        name: 'backward values',
        code: `X = np.array([[1.0, 2.0], [3.0, 4.0]])
W = np.array([[1.0, 0.0], [0.5, -1.0]])
b = np.array([0.1, 0.2])
out, cache = dense_forward(X, W, b)
dout = np.array([[1.0, 2.0], [3.0, 4.0]])
dX, dW, db = dense_backward(dout, cache)
assert np.allclose(dX, dout @ W.T), f"wrong dX {dX}"
assert np.allclose(dW, X.T @ dout), f"wrong dW {dW}"
assert np.allclose(db, dout.sum(axis=0)), f"wrong db {db}"`
      },
      {
        name: 'finite difference weight gradient',
        code: `X = np.array([[0.2, -0.4]])
W = np.array([[0.5], [-0.3]])
b = np.array([0.1])
out, cache = dense_forward(X, W, b)
dout = np.array([[2.0]])
dX, dW, db = dense_backward(dout, cache)
eps = 1e-6
Wp = W.copy(); Wp[0, 0] += eps
Wm = W.copy(); Wm[0, 0] -= eps
fp = (dense_forward(X, Wp, b)[0] * dout).sum()
fm = (dense_forward(X, Wm, b)[0] * dout).sum()
num = (fp - fm) / (2 * eps)
assert np.allclose(dW[0, 0], num, atol=1e-6), f"expected finite diff {num}, got {dW[0,0]}"`
      },
      {
        name: 'batch bias gradient sums rows',
        code: `X = np.ones((5, 3)); W = np.ones((3, 2)); b = np.zeros(2)
out, cache = dense_forward(X, W, b)
dout = np.ones((5, 2))
dX, dW, db = dense_backward(dout, cache)
assert np.allclose(db, np.array([5.0, 5.0])), f"bias grad should sum batch, got {db}"`
      }
    ]
  },
  {
    id: 'xor-two-layer-mlp',
    title: 'Train a Two-Layer MLP on XOR',
    difficulty: 'Hard',
    category: 'Deep Learning',
    viz: 'nn-playground',
    description: `Train a tiny neural network to solve XOR.

Signatures: train_xor_mlp(X, y, hidden=4, lr=1.0, epochs=5000, seed=0) -> (params, losses), and mlp_predict(params, X) -> np.ndarray.

Use a two-layer network: tanh hidden layer and sigmoid output. X has shape (n, 2), y has shape (n,) with zeros and ones. Initialize W1 with rng.normal(0, 0.5, size=(2, hidden)), b1 zeros, W2 with rng.normal(0, 0.5, size=(hidden, 1)), b2 zero using np.random.default_rng(seed). Train with full-batch BCE. Return probabilities from mlp_predict.`,
    starter: `import numpy as np

def train_xor_mlp(X, y, hidden=4, lr=1.0, epochs=5000, seed=0):
    raise NotImplementedError

def mlp_predict(params, X):
    raise NotImplementedError
`,
    solution: `import numpy as np

def _sigmoid(z):
    z = np.asarray(z, dtype=float)
    out = np.empty_like(z)
    pos = z >= 0
    out[pos] = 1.0 / (1.0 + np.exp(-z[pos]))
    ez = np.exp(z[~pos])
    out[~pos] = ez / (1.0 + ez)
    return out

def mlp_predict(params, X):
    X = np.asarray(X, dtype=float)
    h = np.tanh(X @ params["W1"] + params["b1"])
    return _sigmoid(h @ params["W2"] + params["b2"]).reshape(-1)

def train_xor_mlp(X, y, hidden=4, lr=1.0, epochs=5000, seed=0):
    X = np.asarray(X, dtype=float)
    y = np.asarray(y, dtype=float).reshape(-1, 1)
    rng = np.random.default_rng(seed)
    params = {
        "W1": rng.normal(0.0, 0.5, size=(X.shape[1], int(hidden))),
        "b1": np.zeros(int(hidden)),
        "W2": rng.normal(0.0, 0.5, size=(int(hidden), 1)),
        "b2": np.zeros(1),
    }
    losses = []
    n = X.shape[0]
    for _ in range(int(epochs)):
        z1 = X @ params["W1"] + params["b1"]
        h = np.tanh(z1)
        z2 = h @ params["W2"] + params["b2"]
        p = _sigmoid(z2)
        loss = np.mean(np.maximum(z2, 0.0) - z2 * y + np.log1p(np.exp(-np.abs(z2))))
        losses.append(float(loss))
        dz2 = (p - y) / n
        dW2 = h.T @ dz2
        db2 = dz2.sum(axis=0)
        dh = dz2 @ params["W2"].T
        dz1 = dh * (1.0 - h ** 2)
        dW1 = X.T @ dz1
        db1 = dz1.sum(axis=0)
        params["W1"] -= lr * dW1
        params["b1"] -= lr * db1
        params["W2"] -= lr * dW2
        params["b2"] -= lr * db2
    z2 = np.tanh(X @ params["W1"] + params["b1"]) @ params["W2"] + params["b2"]
    losses.append(float(np.mean(np.maximum(z2, 0.0) - z2 * y + np.log1p(np.exp(-np.abs(z2))))))
    return params, losses
`,
    explanation: `XOR is not linearly separable, so the tanh hidden layer creates nonlinear features. BCE with sigmoid has output-layer gradient p-y, then backpropagates through W2 and tanh derivative 1-h squared.

The seeded initialization makes tests deterministic while still requiring real learning. Complexity is O(epochs times n times hidden). Interviewers probe forward/backward mechanics, stable BCE, and why a hidden layer is necessary.`,
    hints: [
      'Use tanh for the hidden activations and sigmoid for the output probabilities.',
      'For BCE plus sigmoid, dz2 is p - y divided by batch size.',
      'Backprop through tanh with 1 - h**2.'
    ],
    tests: [
      {
        name: 'learns xor truth table',
        code: `X = np.array([[0.0, 0.0], [0.0, 1.0], [1.0, 0.0], [1.0, 1.0]])
y = np.array([0, 1, 1, 0], dtype=float)
params, losses = train_xor_mlp(X, y, hidden=4, lr=1.0, epochs=5000, seed=0)
probs = mlp_predict(params, X)
preds = (probs >= 0.5).astype(int)
assert np.array_equal(preds, y.astype(int)), f"expected XOR predictions {y}, got probs {probs}"
assert losses[-1] < 0.1, f"expected low final BCE, got {losses[-1]}"`
      },
      {
        name: 'loss decreases',
        code: `X = np.array([[0.0, 0.0], [0.0, 1.0], [1.0, 0.0], [1.0, 1.0]])
y = np.array([0, 1, 1, 0], dtype=float)
params, losses = train_xor_mlp(X, y, hidden=4, lr=1.0, epochs=1000, seed=0)
assert losses[-1] < losses[0], f"loss should decrease from {losses[0]} to {losses[-1]}"`
      },
      {
        name: 'parameter shapes',
        code: `X = np.zeros((4, 2)); y = np.array([0, 1, 1, 0])
params, losses = train_xor_mlp(X, y, hidden=3, epochs=1, seed=2)
assert params["W1"].shape == (2, 3), f"wrong W1 shape {params['W1'].shape}"
assert params["W2"].shape == (3, 1), f"wrong W2 shape {params['W2'].shape}"
assert params["b1"].shape == (3,) and params["b2"].shape == (1,), "wrong bias shapes"`
      },
      {
        name: 'predict returns probabilities',
        code: `params = {"W1": np.zeros((2, 2)), "b1": np.zeros(2), "W2": np.zeros((2, 1)), "b2": np.zeros(1)}
out = mlp_predict(params, np.array([[0.0, 0.0], [1.0, 1.0]]))
assert out.shape == (2,), f"expected shape (2,), got {out.shape}"
assert np.allclose(out, np.array([0.5, 0.5])), f"zero network should output 0.5, got {out}"`
      }
    ]
  },
  {
    id: 'relu-gelu-derivatives',
    title: 'ReLU, GELU, and Derivatives',
    difficulty: 'Medium',
    category: 'Deep Learning',
    viz: 'activations',
    description: `Implement two activations and their elementwise derivatives.

Signatures: relu(x), relu_grad(x), gelu(x), gelu_grad(x), each returning a NumPy array with the same shape as x.

Use ReLU max(0, x), with derivative 1 for x > 0 and 0 otherwise. For GELU use the common tanh approximation: $0.5x(1 + tanh(c(x + 0.044715x^3)))$ where $c = \sqrt{2/\pi}$. Return the analytic derivative of that approximation.`,
    starter: `import numpy as np

def relu(x):
    raise NotImplementedError

def relu_grad(x):
    raise NotImplementedError

def gelu(x):
    raise NotImplementedError

def gelu_grad(x):
    raise NotImplementedError
`,
    solution: `import numpy as np

def relu(x):
    x = np.asarray(x, dtype=float)
    return np.maximum(x, 0.0)

def relu_grad(x):
    x = np.asarray(x, dtype=float)
    return (x > 0.0).astype(float)

def gelu(x):
    x = np.asarray(x, dtype=float)
    c = np.sqrt(2.0 / np.pi)
    u = c * (x + 0.044715 * x ** 3)
    return 0.5 * x * (1.0 + np.tanh(u))

def gelu_grad(x):
    x = np.asarray(x, dtype=float)
    c = np.sqrt(2.0 / np.pi)
    u = c * (x + 0.044715 * x ** 3)
    tanh_u = np.tanh(u)
    du = c * (1.0 + 3.0 * 0.044715 * x ** 2)
    return 0.5 * (1.0 + tanh_u) + 0.5 * x * (1.0 - tanh_u ** 2) * du
`,
    explanation: `ReLU is piecewise linear and uses a conventional zero subgradient at the kink. GELU smoothly gates x by an approximate Gaussian CDF; differentiating the tanh approximation requires the chain rule through both x and x cubed.

All operations are elementwise, so runtime and memory are O(n). Interviewers probe non-differentiable points, approximate vs exact GELU, and stable vectorization.`,
    hints: [
      'For ReLU derivative, choose 0 at x = 0.',
      'Let u = c * (x + 0.044715*x**3) and differentiate 0.5*x*(1+tanh(u)).',
      'The derivative of tanh(u) is 1 - tanh(u)**2.'
    ],
    tests: [
      {
        name: 'relu values and gradient',
        code: `x = np.array([-2.0, 0.0, 3.0])
assert np.array_equal(relu(x), np.array([0.0, 0.0, 3.0])), f"wrong relu {relu(x)}"
assert np.array_equal(relu_grad(x), np.array([0.0, 0.0, 1.0])), f"wrong relu grad {relu_grad(x)}"`
      },
      {
        name: 'gelu matches tanh approximation',
        code: `x = np.array([-1.0, 0.0, 1.0])
c = np.sqrt(2.0 / np.pi)
exp = 0.5 * x * (1.0 + np.tanh(c * (x + 0.044715 * x ** 3)))
out = gelu(x)
assert np.allclose(out, exp, atol=1e-9), f"expected {exp}, got {out}"`
      },
      {
        name: 'gelu gradient finite difference',
        code: `x = np.array([-0.7, 0.2, 1.3])
eps = 1e-6
num = (gelu(x + eps) - gelu(x - eps)) / (2 * eps)
out = gelu_grad(x)
assert np.allclose(out, num, atol=1e-5), f"expected finite diff {num}, got {out}"`
      },
      {
        name: 'shape preserved',
        code: `x = np.arange(6.0).reshape(2, 3) - 3
assert gelu(x).shape == x.shape, f"gelu shape mismatch {gelu(x).shape}"
assert relu_grad(x).shape == x.shape, f"relu_grad shape mismatch {relu_grad(x).shape}"`
      }
    ]
  },
  {
    id: 'batchnorm-forward-train',
    title: 'Batch Normalization Forward Pass in Train Mode',
    difficulty: 'Medium',
    category: 'Deep Learning',
    description: `Implement the training-mode forward pass for batch normalization.

Signature: batch_norm_forward(X, gamma, beta, eps=1e-5) -> (out, cache).

X has shape (batch, features). Compute per-feature batch mean and variance over axis 0, normalize with eps, then scale and shift using gamma and beta with shape (features,). Return out with shape like X and a cache containing useful intermediate values.`,
    starter: `import numpy as np

def batch_norm_forward(X, gamma, beta, eps=1e-5):
    raise NotImplementedError
`,
    solution: `import numpy as np

def batch_norm_forward(X, gamma, beta, eps=1e-5):
    X = np.asarray(X, dtype=float)
    gamma = np.asarray(gamma, dtype=float)
    beta = np.asarray(beta, dtype=float)
    mean = X.mean(axis=0)
    var = X.var(axis=0)
    x_hat = (X - mean) / np.sqrt(var + eps)
    out = gamma * x_hat + beta
    cache = {"X": X, "mean": mean, "var": var, "x_hat": x_hat, "gamma": gamma, "beta": beta, "eps": eps}
    return out, cache
`,
    explanation: `Batch norm standardizes each feature using statistics from the current mini-batch, then applies a learned affine transform. eps prevents division by zero for low-variance features.

The computation broadcasts feature vectors across rows and costs O(batch times features). Interviewers probe train vs inference mode, axis choices, and why gamma and beta are needed after normalization.`,
    hints: [
      'Mean and variance are computed over the batch axis, axis 0.',
      'Normalize before applying gamma and beta.',
      'Include eps inside the square root.'
    ],
    tests: [
      {
        name: 'normalizes to zero mean unit variance',
        code: `X = np.array([[1.0, 2.0], [3.0, 4.0], [5.0, 6.0]])
out, cache = batch_norm_forward(X, np.ones(2), np.zeros(2), eps=1e-12)
assert np.allclose(out.mean(axis=0), np.zeros(2), atol=1e-8), f"mean should be zero, got {out.mean(axis=0)}"
assert np.allclose(out.var(axis=0), np.ones(2), atol=1e-8), f"variance should be one, got {out.var(axis=0)}"`
      },
      {
        name: 'gamma beta affine transform',
        code: `X = np.array([[0.0], [2.0]])
out, cache = batch_norm_forward(X, np.array([2.0]), np.array([3.0]), eps=1e-12)
exp = np.array([[1.0], [5.0]])
assert np.allclose(out, exp, atol=1e-6), f"expected {exp}, got {out}"`
      },
      {
        name: 'constant feature finite',
        code: `X = np.ones((4, 2)) * 7.0
out, cache = batch_norm_forward(X, np.ones(2), np.zeros(2))
assert np.all(np.isfinite(out)), f"expected finite output, got {out}"
assert np.allclose(out, np.zeros_like(out)), f"constant normalized output should be zero, got {out}"`
      },
      {
        name: 'cache contains statistics',
        code: `X = np.array([[1.0, 3.0], [2.0, 5.0]])
out, cache = batch_norm_forward(X, np.ones(2), np.zeros(2))
assert "mean" in cache and "var" in cache and "x_hat" in cache, f"cache missing keys {cache.keys()}"
assert np.allclose(cache["mean"], X.mean(axis=0)), f"wrong cached mean {cache['mean']}"`
      }
    ]
  },
  {
    id: 'inverted-dropout-forward',
    title: 'Inverted Dropout Forward Pass',
    difficulty: 'Easy',
    category: 'Deep Learning',
    description: `Implement inverted dropout.

Signature: dropout_forward(X, p=0.5, seed=None, training=True) -> (out, mask).

p is the drop probability. In training mode, sample mask entries with keep probability 1-p using np.random.default_rng(seed), and scale kept activations by 1/(1-p) so the expectation is unchanged. In evaluation mode, return X unchanged and a mask of ones.`,
    starter: `import numpy as np

def dropout_forward(X, p=0.5, seed=None, training=True):
    raise NotImplementedError
`,
    solution: `import numpy as np

def dropout_forward(X, p=0.5, seed=None, training=True):
    X = np.asarray(X, dtype=float)
    if not training:
        return X.copy(), np.ones_like(X, dtype=float)
    if p < 0 or p >= 1:
        raise ValueError("p must be in [0, 1)")
    keep = 1.0 - float(p)
    rng = np.random.default_rng(seed)
    mask = (rng.random(X.shape) < keep).astype(float) / keep
    return X * mask, mask
`,
    explanation: `Inverted dropout applies random multiplicative noise during training and scales kept units by reciprocal keep probability. That makes the expected activation equal to the input, so inference needs no scaling.

The mask is useful for backpropagation and deterministic tests when a seed is supplied. Complexity is O(n). Interviewers probe train/eval differences, p meaning, and expectation preservation.`,
    hints: [
      'Keep probability is 1 - p.',
      'The training mask should contain 0 or 1/keep, not just 0 or 1.',
      'Use a local random generator to make seeding deterministic.'
    ],
    tests: [
      {
        name: 'same seed same mask',
        code: `X = np.ones((3, 4))
out1, mask1 = dropout_forward(X, p=0.25, seed=123)
out2, mask2 = dropout_forward(X, p=0.25, seed=123)
assert np.array_equal(mask1, mask2), f"same seed should reproduce masks, got {mask1} and {mask2}"
assert np.array_equal(out1, out2), "same seed should reproduce outputs"`
      },
      {
        name: 'mask values are inverted scaled',
        code: `X = np.ones((100,))
out, mask = dropout_forward(X, p=0.2, seed=1)
vals = set(np.unique(mask).round(8).tolist())
assert vals.issubset({0.0, 1.25}), f"mask should contain 0 and 1/(1-p), got {vals}"`
      },
      {
        name: 'eval mode is identity',
        code: `X = np.array([[1.0, 2.0], [3.0, 4.0]])
out, mask = dropout_forward(X, p=0.9, seed=0, training=False)
assert np.allclose(out, X), f"eval output should equal input, got {out}"
assert np.allclose(mask, np.ones_like(X)), f"eval mask should be ones, got {mask}"`
      },
      {
        name: 'large sample preserves expectation approximately',
        code: `X = np.ones((20000,))
out, mask = dropout_forward(X, p=0.3, seed=7)
assert abs(out.mean() - 1.0) < 0.03, f"inverted dropout mean should be near 1, got {out.mean()}"`
      }
    ]
  },
  {
    id: 'conv2d-single-channel-forward',
    title: '2D Convolution Forward Pass, Single Channel',
    difficulty: 'Medium',
    category: 'Deep Learning',
    viz: 'convolution',
    description: `Implement single-channel 2D convolution forward pass.

Signature: conv2d_forward(x, kernel, bias=0.0, stride=1, padding=0) -> np.ndarray.

x has shape (H, W), kernel has shape (KH, KW). Zero-pad x by padding on all sides, slide the kernel with the given stride, and return shape ((H + 2p - KH)//stride + 1, (W + 2p - KW)//stride + 1). Use cross-correlation semantics: do not flip the kernel.`,
    starter: `import numpy as np

def conv2d_forward(x, kernel, bias=0.0, stride=1, padding=0):
    raise NotImplementedError
`,
    solution: `import numpy as np

def conv2d_forward(x, kernel, bias=0.0, stride=1, padding=0):
    x = np.asarray(x, dtype=float)
    kernel = np.asarray(kernel, dtype=float)
    stride = int(stride)
    padding = int(padding)
    if padding > 0:
        xp = np.pad(x, ((padding, padding), (padding, padding)), mode="constant")
    else:
        xp = x
    H, W = xp.shape
    KH, KW = kernel.shape
    out_h = (H - KH) // stride + 1
    out_w = (W - KW) // stride + 1
    out = np.zeros((out_h, out_w), dtype=float)
    for i in range(out_h):
        for j in range(out_w):
            patch = xp[i * stride:i * stride + KH, j * stride:j * stride + KW]
            out[i, j] = np.sum(patch * kernel) + float(bias)
    return out
`,
    explanation: `Deep-learning convolution layers usually implement cross-correlation, so the kernel is not flipped. Padding changes the effective input size, and stride changes which top-left patch positions are visited.

A double loop over output positions is clear and acceptable for an interview; each entry computes a KH by KW dot product. Complexity is O(out_h times out_w times KH times KW). Interviewers probe output shapes, padding, stride, and correlation vs mathematical convolution.`,
    hints: [
      'Use np.pad before computing output dimensions.',
      'For each output position, slice a patch of the padded image.',
      'Do not reverse the kernel unless the prompt asks for mathematical convolution.'
    ],
    tests: [
      {
        name: 'valid convolution values',
        code: `x = np.array([[1.0, 2.0, 3.0], [4.0, 5.0, 6.0], [7.0, 8.0, 9.0]])
k = np.array([[1.0, 0.0], [0.0, -1.0]])
out = conv2d_forward(x, k)
exp = np.array([[-4.0, -4.0], [-4.0, -4.0]])
assert np.allclose(out, exp), f"expected {exp}, got {out}"`
      },
      {
        name: 'padding preserves larger shape',
        code: `x = np.array([[1.0, 2.0], [3.0, 4.0]])
k = np.ones((2, 2))
out = conv2d_forward(x, k, padding=1)
exp = np.array([[1.0, 3.0, 2.0], [4.0, 10.0, 6.0], [3.0, 7.0, 4.0]])
assert np.allclose(out, exp), f"expected {exp}, got {out}"`
      },
      {
        name: 'stride two shape and values',
        code: `x = np.arange(16.0).reshape(4, 4)
k = np.ones((2, 2))
out = conv2d_forward(x, k, stride=2)
exp = np.array([[10.0, 18.0], [42.0, 50.0]])
assert np.allclose(out, exp), f"expected {exp}, got {out}"`
      },
      {
        name: 'bias added',
        code: `x = np.ones((2, 2))
k = np.ones((2, 2))
out = conv2d_forward(x, k, bias=0.5)
assert np.allclose(out, np.array([[4.5]])), f"expected bias-added 4.5, got {out}"`
      }
    ]
  },
  {
    id: 'max-pool2d-forward',
    title: 'Max Pooling Forward Pass',
    difficulty: 'Easy',
    category: 'Deep Learning',
    description: `Implement 2D max pooling for a single channel.

Signature: max_pool2d(x, pool_size=2, stride=2) -> np.ndarray.

x has shape (H, W). pool_size may be an int or a tuple (PH, PW). stride may be an int or tuple (SH, SW). Return the maximum in each non-overlapping or strided window using floor output dimensions.`,
    starter: `import numpy as np

def max_pool2d(x, pool_size=2, stride=2):
    raise NotImplementedError
`,
    solution: `import numpy as np

def _pair(v):
    if isinstance(v, tuple):
        return int(v[0]), int(v[1])
    return int(v), int(v)

def max_pool2d(x, pool_size=2, stride=2):
    x = np.asarray(x, dtype=float)
    ph, pw = _pair(pool_size)
    sh, sw = _pair(stride)
    out_h = (x.shape[0] - ph) // sh + 1
    out_w = (x.shape[1] - pw) // sw + 1
    out = np.zeros((out_h, out_w), dtype=float)
    for i in range(out_h):
        for j in range(out_w):
            patch = x[i * sh:i * sh + ph, j * sw:j * sw + pw]
            out[i, j] = np.max(patch)
    return out
`,
    explanation: `Max pooling downsamples by keeping the strongest activation in each window. The windows are selected by stride and the output size uses integer floor behavior when the window does not fit at the end.

The implementation loops over output windows and uses NumPy max inside each patch. Complexity is O(out_h times out_w times pool area). Interviewers probe shape formulas and tuple/int argument handling.`,
    hints: [
      'Normalize int arguments into (height, width) tuples.',
      'The top-left corner of output (i, j) is (i*stride_h, j*stride_w).',
      'Use floor dimensions by integer division.'
    ],
    tests: [
      {
        name: 'basic 2 by 2 pooling',
        code: `x = np.array([[1.0, 3.0, 2.0, 0.0], [4.0, 6.0, 1.0, 2.0], [0.0, 1.0, 5.0, 3.0], [2.0, 1.0, 4.0, 8.0]])
out = max_pool2d(x, pool_size=2, stride=2)
exp = np.array([[6.0, 2.0], [2.0, 8.0]])
assert np.allclose(out, exp), f"expected {exp}, got {out}"`
      },
      {
        name: 'overlapping pooling',
        code: `x = np.array([[1.0, 2.0, 3.0], [4.0, 5.0, 6.0], [7.0, 8.0, 9.0]])
out = max_pool2d(x, pool_size=2, stride=1)
exp = np.array([[5.0, 6.0], [8.0, 9.0]])
assert np.allclose(out, exp), f"expected {exp}, got {out}"`
      },
      {
        name: 'tuple pool and stride',
        code: `x = np.arange(20.0).reshape(4, 5)
out = max_pool2d(x, pool_size=(2, 3), stride=(2, 2))
exp = np.array([[7.0, 9.0], [17.0, 19.0]])
assert np.allclose(out, exp), f"expected {exp}, got {out}"`
      },
      {
        name: 'negative values choose least negative max',
        code: `x = np.array([[-5.0, -2.0], [-3.0, -4.0]])
out = max_pool2d(x, 2, 2)
assert np.allclose(out, np.array([[-2.0]])), f"expected -2, got {out}"`
      }
    ]
  },
  {
    id: 'scaled-dot-product-attention',
    title: 'Scaled Dot-Product Attention with Mask',
    difficulty: 'Medium',
    category: 'Deep Learning',
    viz: 'attention',
    description: `Implement scaled dot-product attention.

Signature: scaled_dot_product_attention(Q, K, V, mask=None) -> (out, weights).

Q has shape (n_query, d_k), K has shape (n_key, d_k), V has shape (n_key, d_v). Compute softmax(QK^T / sqrt(d_k)) over keys. If mask is provided, it is broadcast-compatible with (n_query, n_key) and True means keep while False means block. Masked keys should receive zero probability.`,
    starter: `import numpy as np

def scaled_dot_product_attention(Q, K, V, mask=None):
    raise NotImplementedError
`,
    solution: `import numpy as np

def scaled_dot_product_attention(Q, K, V, mask=None):
    Q = np.asarray(Q, dtype=float)
    K = np.asarray(K, dtype=float)
    V = np.asarray(V, dtype=float)
    scores = (Q @ K.T) / np.sqrt(K.shape[1])
    if mask is not None:
        keep = np.asarray(mask, dtype=bool)
        scores = np.where(keep, scores, -1e30)
    shifted = scores - np.max(scores, axis=-1, keepdims=True)
    exp_scores = np.exp(shifted)
    if mask is not None:
        exp_scores = np.where(np.asarray(mask, dtype=bool), exp_scores, 0.0)
    denom = exp_scores.sum(axis=-1, keepdims=True)
    weights = exp_scores / denom
    out = weights @ V
    return out, weights
`,
    explanation: `Attention compares queries to keys, scales by square root key dimension to keep logits controlled, then uses softmax weights to average values. Subtracting the row maximum makes softmax stable.

A boolean mask removes invalid positions before softmax and again after exponentiation. Complexity is O(n_query times n_key times d). Interviewers probe mask polarity, scaling, stability, and shape alignment.`,
    hints: [
      'Scores have shape (n_query, n_key).',
      'Use sqrt(d_k) in the denominator before softmax.',
      'Set masked scores to a very negative value and zero them after exp.'
    ],
    tests: [
      {
        name: 'weights sum to one',
        code: `Q = np.array([[1.0, 0.0]])
K = np.array([[1.0, 0.0], [0.0, 1.0]])
V = np.array([[10.0], [20.0]])
out, weights = scaled_dot_product_attention(Q, K, V)
assert np.allclose(weights.sum(axis=1), np.ones(1)), f"weights should sum to one, got {weights}"
assert out.shape == (1, 1), f"wrong output shape {out.shape}"`
      },
      {
        name: 'mask blocks key',
        code: `Q = np.array([[1.0, 0.0]])
K = np.array([[1.0, 0.0], [1.0, 0.0]])
V = np.array([[5.0], [99.0]])
mask = np.array([[True, False]])
out, weights = scaled_dot_product_attention(Q, K, V, mask=mask)
assert np.allclose(out, np.array([[5.0]]), atol=1e-6), f"masked value should be ignored, got {out}"
assert np.allclose(weights, np.array([[1.0, 0.0]]), atol=1e-6), f"wrong masked weights {weights}"`
      },
      {
        name: 'stable for large scores',
        code: `Q = np.array([[1000.0, 0.0]])
K = np.array([[1000.0, 0.0], [999.0, 0.0]])
V = np.array([[1.0], [2.0]])
out, weights = scaled_dot_product_attention(Q, K, V)
assert np.all(np.isfinite(weights)), f"weights should be finite, got {weights}"
assert weights[0, 0] > weights[0, 1], f"larger score should get larger weight, got {weights}"`
      },
      {
        name: 'uniform scores average values',
        code: `Q = np.zeros((2, 3)); K = np.zeros((4, 3)); V = np.arange(8.0).reshape(4, 2)
out, weights = scaled_dot_product_attention(Q, K, V)
exp = np.tile(V.mean(axis=0), (2, 1))
assert np.allclose(out, exp, atol=1e-6), f"expected average {exp}, got {out}"`
      }
    ]
  },
  {
    id: 'multi-head-attention-reshape',
    title: 'Multi-Head Attention Reshape Logic',
    difficulty: 'Hard',
    category: 'Deep Learning',
    description: `Implement the reshape helpers used by multi-head attention plus a simple forward pass.

Signatures: split_heads(x, num_heads) -> np.ndarray, combine_heads(x) -> np.ndarray, and multi_head_attention_forward(X, Wq, Wk, Wv, Wo, num_heads, mask=None) -> (out, weights).

X has shape (batch, seq_len, d_model). split_heads returns (batch, num_heads, seq_len, head_dim), where head_dim = d_model / num_heads. combine_heads reverses that. The forward pass projects Q,K,V, applies scaled attention per head, combines heads, and applies Wo.`,
    starter: `import numpy as np

def split_heads(x, num_heads):
    raise NotImplementedError

def combine_heads(x):
    raise NotImplementedError

def multi_head_attention_forward(X, Wq, Wk, Wv, Wo, num_heads, mask=None):
    raise NotImplementedError
`,
    solution: `import numpy as np

def split_heads(x, num_heads):
    x = np.asarray(x, dtype=float)
    b, s, d = x.shape
    h = int(num_heads)
    if d % h != 0:
        raise ValueError("d_model must be divisible by num_heads")
    head_dim = d // h
    return x.reshape(b, s, h, head_dim).transpose(0, 2, 1, 3)

def combine_heads(x):
    x = np.asarray(x, dtype=float)
    b, h, s, head_dim = x.shape
    return x.transpose(0, 2, 1, 3).reshape(b, s, h * head_dim)

def _attention(Q, K, V, mask=None):
    scores = (Q @ np.swapaxes(K, -1, -2)) / np.sqrt(Q.shape[-1])
    if mask is not None:
        keep = np.asarray(mask, dtype=bool)
        while keep.ndim < scores.ndim:
            keep = keep[:, None, :, :]
        scores = np.where(keep, scores, -1e30)
    shifted = scores - np.max(scores, axis=-1, keepdims=True)
    exp_scores = np.exp(shifted)
    if mask is not None:
        exp_scores = np.where(keep, exp_scores, 0.0)
    weights = exp_scores / exp_scores.sum(axis=-1, keepdims=True)
    return weights @ V, weights

def multi_head_attention_forward(X, Wq, Wk, Wv, Wo, num_heads, mask=None):
    X = np.asarray(X, dtype=float)
    Q = split_heads(X @ np.asarray(Wq, dtype=float), num_heads)
    K = split_heads(X @ np.asarray(Wk, dtype=float), num_heads)
    V = split_heads(X @ np.asarray(Wv, dtype=float), num_heads)
    head_out, weights = _attention(Q, K, V, mask)
    combined = combine_heads(head_out)
    out = combined @ np.asarray(Wo, dtype=float)
    return out, weights
`,
    explanation: `Multi-head attention is mostly careful reshaping: split d_model into heads, move the head axis before sequence, run attention independently, then transpose and reshape back.

The projection matrices are ordinary dense layers. The attention weights have shape (batch, heads, seq, seq). Complexity is O(batch times heads times seq squared times head_dim). Interviewers probe transposes, contiguity assumptions, and mask broadcasting.`,
    hints: [
      'Reshape to (batch, seq, heads, head_dim) then transpose to put heads before seq.',
      'Combining heads applies the inverse transpose before reshape.',
      'For mask shape (batch, seq, seq), insert a singleton head axis.'
    ],
    tests: [
      {
        name: 'split and combine round trip',
        code: `x = np.arange(2 * 3 * 4.0).reshape(2, 3, 4)
heads = split_heads(x, 2)
back = combine_heads(heads)
assert heads.shape == (2, 2, 3, 2), f"wrong split shape {heads.shape}"
assert np.allclose(back, x), f"combine should invert split, got {back}"`
      },
      {
        name: 'forward output shape',
        code: `X = np.arange(1 * 3 * 4.0).reshape(1, 3, 4) / 10
I = np.eye(4)
out, weights = multi_head_attention_forward(X, I, I, I, I, num_heads=2)
assert out.shape == X.shape, f"expected output shape {X.shape}, got {out.shape}"
assert weights.shape == (1, 2, 3, 3), f"wrong weights shape {weights.shape}"`
      },
      {
        name: 'attention weights normalized per head',
        code: `X = np.random.default_rng(0).normal(size=(2, 4, 6))
I = np.eye(6)
out, weights = multi_head_attention_forward(X, I, I, I, I, num_heads=3)
assert np.allclose(weights.sum(axis=-1), np.ones((2, 3, 4)), atol=1e-6), f"weights should sum to one, got {weights.sum(axis=-1)}"`
      },
      {
        name: 'mask blocks positions',
        code: `X = np.eye(3).reshape(1, 3, 3)
I = np.eye(3)
mask = np.array([[[True, False, False], [True, True, False], [True, True, True]]])
out, weights = multi_head_attention_forward(X, I, I, I, I, num_heads=1, mask=mask)
assert np.allclose(weights[0, 0][~mask[0]], 0.0, atol=1e-9), f"masked weights should be zero, got {weights}"`
      }
    ]
  },
  {
    id: 'layer-norm-forward',
    title: 'Layer Normalization Forward Pass',
    difficulty: 'Medium',
    category: 'Deep Learning',
    description: `Implement layer normalization over the last axis.

Signature: layer_norm_forward(X, gamma, beta, eps=1e-5) -> (out, cache).

X can have shape (..., features). For each sample position, compute mean and variance over the final feature axis, normalize, then apply gamma and beta broadcast over the last axis. Return out with shape like X and a cache with mean, var, x_hat, gamma, beta, and eps.`,
    starter: `import numpy as np

def layer_norm_forward(X, gamma, beta, eps=1e-5):
    raise NotImplementedError
`,
    solution: `import numpy as np

def layer_norm_forward(X, gamma, beta, eps=1e-5):
    X = np.asarray(X, dtype=float)
    gamma = np.asarray(gamma, dtype=float)
    beta = np.asarray(beta, dtype=float)
    mean = X.mean(axis=-1, keepdims=True)
    var = X.var(axis=-1, keepdims=True)
    x_hat = (X - mean) / np.sqrt(var + eps)
    out = x_hat * gamma + beta
    cache = {"X": X, "mean": mean, "var": var, "x_hat": x_hat, "gamma": gamma, "beta": beta, "eps": eps}
    return out, cache
`,
    explanation: `Layer norm differs from batch norm by normalizing within each sample across features, not across the batch. That makes it independent of batch size and common in Transformers.

Broadcasting gamma and beta over the last axis handles both 2D and 3D tensors. Complexity is O(number of elements). Interviewers probe axis choice, keepdims, and batch-size independence.`,
    hints: [
      'Use axis=-1 and keepdims=True for mean and variance.',
      'gamma and beta have shape equal to the feature dimension.',
      'The output shape should exactly match X.'
    ],
    tests: [
      {
        name: 'normalizes each row',
        code: `X = np.array([[1.0, 2.0, 3.0], [2.0, 4.0, 6.0]])
out, cache = layer_norm_forward(X, np.ones(3), np.zeros(3), eps=1e-12)
assert np.allclose(out.mean(axis=-1), np.zeros(2), atol=1e-8), f"row means should be zero, got {out.mean(axis=-1)}"
assert np.allclose(out.var(axis=-1), np.ones(2), atol=1e-8), f"row variances should be one, got {out.var(axis=-1)}"`
      },
      {
        name: 'gamma beta applied',
        code: `X = np.array([[0.0, 2.0]])
out, cache = layer_norm_forward(X, np.array([2.0, 3.0]), np.array([1.0, -1.0]), eps=1e-12)
exp = np.array([[-1.0, 2.0]])
assert np.allclose(out, exp, atol=1e-6), f"expected {exp}, got {out}"`
      },
      {
        name: 'works on 3d tensors',
        code: `X = np.arange(24.0).reshape(2, 3, 4)
out, cache = layer_norm_forward(X, np.ones(4), np.zeros(4))
assert out.shape == X.shape, f"expected shape {X.shape}, got {out.shape}"
assert np.allclose(out.mean(axis=-1), np.zeros((2, 3)), atol=1e-6), "last-axis means should be zero"`
      },
      {
        name: 'constant features finite',
        code: `X = np.ones((2, 3)) * 5
out, cache = layer_norm_forward(X, np.ones(3), np.zeros(3))
assert np.all(np.isfinite(out)), f"expected finite output, got {out}"
assert np.allclose(out, np.zeros_like(out)), f"constant rows should normalize to zero, got {out}"`
      }
    ]
  },
  {
    id: 'sinusoidal-positional-encoding',
    title: 'Sinusoidal Positional Encoding',
    difficulty: 'Easy',
    category: 'Deep Learning',
    viz: 'positional-encoding',
    description: `Implement Transformer sinusoidal positional encodings.

Signature: sinusoidal_positional_encoding(seq_len, d_model) -> np.ndarray.

Return an array of shape (seq_len, d_model). For position pos and pair index i: PE[pos, 2i] = sin(pos / 10000^(2i/d_model)) and PE[pos, 2i+1] = cos(pos / 10000^(2i/d_model)). If d_model is odd, fill the final even sine column and omit its cosine partner.`,
    starter: `import numpy as np

def sinusoidal_positional_encoding(seq_len, d_model):
    raise NotImplementedError
`,
    solution: `import numpy as np

def sinusoidal_positional_encoding(seq_len, d_model):
    seq_len = int(seq_len)
    d_model = int(d_model)
    pos = np.arange(seq_len, dtype=float)[:, None]
    even_dims = np.arange(0, d_model, 2, dtype=float)
    div = np.power(10000.0, even_dims / d_model)
    angles = pos / div
    pe = np.zeros((seq_len, d_model), dtype=float)
    pe[:, 0::2] = np.sin(angles)
    pe[:, 1::2] = np.cos(angles[:, :pe[:, 1::2].shape[1]])
    return pe
`,
    explanation: `Sinusoidal encodings assign each dimension pair a different wavelength, letting the model infer relative offsets through linear combinations. Position zero has sine columns 0 and cosine columns 1.

The implementation vectorizes over positions and even dimensions. Complexity is O(seq_len times d_model). Interviewers probe shape handling for odd d_model and the exponent denominator.`,
    hints: [
      'Build a column vector of positions and a row vector of even dimensions.',
      'Fill even columns with sine and odd columns with cosine.',
      'For odd d_model, the number of odd columns is one fewer than even columns.'
    ],
    tests: [
      {
        name: 'shape and position zero',
        code: `pe = sinusoidal_positional_encoding(4, 6)
assert pe.shape == (4, 6), f"expected shape (4,6), got {pe.shape}"
assert np.allclose(pe[0, 0::2], np.zeros(3)), f"position zero sine columns should be zero, got {pe[0]}"
assert np.allclose(pe[0, 1::2], np.ones(3)), f"position zero cosine columns should be one, got {pe[0]}"`
      },
      {
        name: 'known small values',
        code: `pe = sinusoidal_positional_encoding(2, 4)
exp0 = np.sin(1.0)
exp1 = np.cos(1.0)
assert np.allclose(pe[1, 0], exp0, atol=1e-9), f"expected sin(1), got {pe[1,0]}"
assert np.allclose(pe[1, 1], exp1, atol=1e-9), f"expected cos(1), got {pe[1,1]}"`
      },
      {
        name: 'odd model dimension',
        code: `pe = sinusoidal_positional_encoding(3, 5)
assert pe.shape == (3, 5), f"expected shape (3,5), got {pe.shape}"
assert np.all(np.isfinite(pe)), f"expected finite encodings, got {pe}"`
      },
      {
        name: 'different positions differ',
        code: `pe = sinusoidal_positional_encoding(5, 8)
assert not np.allclose(pe[1], pe[2]), f"adjacent positions should differ, got {pe[1]} and {pe[2]}"`
      }
    ]
  }
]

export default problems
