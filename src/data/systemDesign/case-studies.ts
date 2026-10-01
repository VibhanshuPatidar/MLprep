import type { DesignDoc } from '../../types/content'

const docs: DesignDoc[] = [
  {
    "id": "url-shortener",
    "title": "URL Shortener",
    "category": "Case Study",
    "difficulty": "Medium",
    "summary": "Design a TinyURL-like service that creates compact aliases and redirects users with low latency, high availability, and abuse controls.",
    "tags": [
      "url-shortener",
      "redirect",
      "id-generation",
      "cache",
      "cdn"
    ],
    "sections": [
      {
        "title": "Clarify Requirements",
        "body": "**Functional requirements**\n- Create a short code for a long URL, optionally with custom alias, expiration, and owner.\n- Redirect from short code to the original URL with very low latency.\n- Track basic analytics such as clicks by day, referrer, and country.\n- Support deletion or disablement for abuse, malware, or owner action.\n\n**Non-functional requirements**\n- Redirect path should be highly available and p95 below 100 ms in-region.\n- Creation can be slower but must avoid code collisions.\n- Reads dominate writes by roughly 100:1.\n- Abuse controls should not make the hot redirect path fragile."
      },
      {
        "title": "Capacity Estimation",
        "body": "Assume 100M monthly active users and 10M new links/day.\n\n| Metric | Math | Result |\n|---|---|---:|\n| Create QPS | 10M / 100k sec | ~100/s average |\n| Peak create QPS | 100/s × 10 | ~1k/s |\n| Redirects/day | 10M creates × 100 reads | 1B/day |\n| Redirect QPS | 1B / 100k sec | ~10k/s average |\n| Peak redirect QPS | 10k/s × 5 | ~50k/s |\n| Metadata storage | 10M × 500 B | ~5 GB/day raw |\n| Annual replicated storage | 5 GB × 365 × 3 | ~5.5 TB before indexes |\n\nA 7-character base62 code gives $62^7 \u0007pprox 3.5T$ possible codes, enough for years if collisions are checked or IDs are allocated deterministically."
      },
      {
        "title": "API Design",
        "body": "~~~http\nPOST /v1/links\n{\n  \"long_url\": \"https://example.com/a/very/long/path\",\n  \"custom_alias\": \"optional\",\n  \"expires_at\": \"2027-01-01T00:00:00Z\"\n}\n~~~\n\n~~~http\nGET /{short_code}\n-> 302 Location: https://example.com/a/very/long/path\n~~~\n\n~~~http\nGET /v1/links/{short_code}/stats?from=2026-10-01&to=2026-10-31\n~~~\n\nCreation should be authenticated for managed links; redirect may be unauthenticated but rate-limited and filtered for known abuse."
      },
      {
        "title": "Data Model",
        "body": "| Entity | Important fields | Access pattern |\n|---|---|---|\n| links | short_code PK, long_url, owner_id, created_at, expires_at, status | Redirect lookup by code |\n| custom_alias_reservations | alias PK, owner_id, created_at | Conditional insert for vanity aliases |\n| click_events | short_code, timestamp, country, referrer, user_agent_hash | Append-only analytics stream |\n| daily_link_stats | short_code, date, clicks, unique_estimate | Dashboard reads |\n\nStore long URLs in the primary database if small; for very large metadata, keep only pointers to object storage. Index owner_id plus created_at for dashboards."
      },
      {
        "title": "High-Level Design",
        "body": "The redirect path is: DNS/CDN or edge gateway → redirect service → cache lookup → database fallback → 302 response. Creation uses an ID generator or code allocator, writes the link record, then warms cache asynchronously.\n\nAnalytics should be asynchronous. The redirect service emits click events to a queue/stream and does not wait for aggregation before returning the redirect."
      },
      {
        "title": "Deep Dives",
        "body": "### Short-code generation\n\n| Option | Pros | Cons |\n|---|---|---|\n| Auto-increment ID + base62 | No collisions, compact | Predictable unless shuffled; central allocator |\n| Random code | Hard to guess | Collision checks and retries at high occupancy |\n| Pre-generated code pool | Fast creation | Pool management and wasted codes |\n| Hash of URL | Same URL can map to same code | Collisions and privacy leakage |\n\nA strong interview answer often chooses allocated numeric IDs encoded as base62, plus optional randomization to avoid easy enumeration.\n\n### Redirect latency\n\n| Option | Pros | Cons |\n|---|---|---|\n| Cache-aside Redis | Simple and fast for hot links | Misses still hit DB |\n| CDN edge redirects | Very low global latency | Purge and personalized redirects are harder |\n| Local in-process hot cache | Removes network hop | Per-replica staleness and memory limits |\n\n### Abuse and safety\n\nMaintain deny lists for malicious destinations, scan on creation, and support emergency status changes. Cache entries should include status and expiration so disabled links stop redirecting after a short TTL or explicit purge."
      },
      {
        "title": "Bottlenecks & Scaling",
        "body": "- Hot celebrity links can overload a single cache key; replicate hot keys or move redirect to CDN/edge.\n- Database lookup by short_code must be indexed and possibly sharded by code prefix/hash.\n- Analytics volume should be absorbed by a stream; aggregate asynchronously with backpressure.\n- Expired or disabled links need cache invalidation; use short TTL plus explicit purge for high-risk changes."
      },
      {
        "title": "Trade-offs & Alternatives",
        "body": "| Alternative | When it is better | Trade-off |\n|---|---|---|\n| Random aliases | Better privacy | Collision retries and storage checks |\n| Sequential aliases | Operationally simple | Enumeration risk unless obfuscated |\n| Edge-only redirect rules | Ultra-low latency | Harder dynamic updates and analytics |\n| Strongly consistent alias reservations | Prevents duplicates | Higher create latency for custom aliases |"
      },
      {
        "title": "What Great Answers Mention",
        "body": "- Read-heavy nature and separate write/redirect paths.\n- Collision avoidance and alias enumeration risks.\n- Asynchronous analytics so redirects remain fast.\n- Expiration, deletion, malware handling, and cache invalidation.\n- Observability for redirect p95, cache hit rate, 404/410 rate, and queue lag."
      }
    ],
    "diagrams": [
      {
        "title": "URL shortener architecture",
        "nodes": [
          {
            "id": "client",
            "label": "Clients",
            "kind": "client",
            "col": 0,
            "row": 2
          },
          {
            "id": "gateway",
            "label": "API Gateway",
            "kind": "gateway",
            "col": 1,
            "row": 2
          },
          {
            "id": "lb",
            "label": "Load Balancer",
            "kind": "lb",
            "col": 2,
            "row": 2
          },
          {
            "id": "service",
            "label": "Redirect + Link Service",
            "kind": "service",
            "col": 3,
            "row": 2,
            "detail": "The service owns code creation and redirect lookups. Keep redirect logic stateless so replicas can scale horizontally behind the load balancer."
          },
          {
            "id": "cache",
            "label": "Code Cache",
            "kind": "cache",
            "col": 4,
            "row": 1
          },
          {
            "id": "db",
            "label": "Link Metadata DB",
            "kind": "db",
            "col": 5,
            "row": 2,
            "detail": "The metadata DB stores short_code as the primary key and status fields needed by redirects. It can be sharded by code hash once a single primary no longer handles traffic."
          },
          {
            "id": "async",
            "label": "Click Events",
            "kind": "stream",
            "col": 4,
            "row": 4
          },
          {
            "id": "worker",
            "label": "Workers",
            "kind": "worker",
            "col": 5,
            "row": 4
          },
          {
            "id": "aux",
            "label": "Analytics Store",
            "kind": "storage",
            "col": 6,
            "row": 1,
            "detail": "The analytics store is derived from click events and can be rebuilt. It should not be on the synchronous redirect path."
          },
          {
            "id": "mon",
            "label": "Metrics + Alerts",
            "kind": "monitor",
            "col": 7,
            "row": 2
          }
        ],
        "edges": [
          {
            "from": "client",
            "to": "gateway",
            "label": "request"
          },
          {
            "from": "gateway",
            "to": "lb",
            "label": "route"
          },
          {
            "from": "lb",
            "to": "service",
            "label": "call"
          },
          {
            "from": "service",
            "to": "cache",
            "label": "hot"
          },
          {
            "from": "service",
            "to": "db",
            "label": "read/write"
          },
          {
            "from": "service",
            "to": "async",
            "label": "event"
          },
          {
            "from": "async",
            "to": "worker",
            "label": "consume"
          },
          {
            "from": "worker",
            "to": "aux",
            "label": "derive"
          },
          {
            "from": "service",
            "to": "aux",
            "label": "query"
          },
          {
            "from": "service",
            "to": "mon",
            "label": "slo"
          },
          {
            "from": "worker",
            "to": "mon",
            "label": "lag"
          }
        ]
      }
    ],
    "followUps": [
      {
        "q": "How do you avoid code collisions?",
        "a": "Use a unique numeric ID encoded in base62, or random codes with conditional insert and retry."
      },
      {
        "q": "How do you stop alias enumeration?",
        "a": "Randomize codes, require auth for analytics, rate limit scans, and avoid exposing sequential IDs directly."
      },
      {
        "q": "What status code should redirects use?",
        "a": "302/307 for changeable targets; 301 only when permanent caching is safe."
      },
      {
        "q": "How do you handle expired links?",
        "a": "Store expires_at, include it in cache values, return 410, and purge/wait for TTL on changes."
      },
      {
        "q": "Where should analytics happen?",
        "a": "Emit an event on redirect and aggregate asynchronously so user-facing latency is unaffected."
      },
      {
        "q": "How would you shard it?",
        "a": "Shard link metadata by short_code hash or prefix; keep custom alias reservation strongly consistent."
      }
    ],
    "resources": [
      {
        "title": "System Design Primer",
        "url": "https://github.com/donnemartin/system-design-primer",
        "type": "repo"
      },
      {
        "title": "Designing Data-Intensive Applications",
        "url": "https://dataintensive.net",
        "type": "book"
      },
      {
        "title": "Hello Interview System Design",
        "url": "https://www.hellointerview.com/learn/system-design",
        "type": "course"
      },
      {
        "title": "Base62 discussion in System Design Primer",
        "url": "https://github.com/donnemartin/system-design-primer#design-a-url-shortener",
        "type": "article"
      }
    ]
  },
  {
    "id": "distributed-rate-limiter",
    "title": "Distributed Rate Limiter",
    "category": "Case Study",
    "difficulty": "Hard",
    "summary": "Design a low-latency global limiter that enforces fair quotas across users, tenants, endpoints, and regions without becoming the system bottleneck.",
    "tags": [
      "rate-limiter",
      "quota",
      "redis",
      "global",
      "token-bucket"
    ],
    "widgets": [
      "rate-limiter"
    ],
    "sections": [
      {
        "title": "Clarify Requirements",
        "body": "**Functional requirements**\n- Enforce limits such as 100 requests/minute per API key and 10 writes/second per tenant.\n- Support burst capacity, per-endpoint rules, and plan-based quotas.\n- Return allow/deny plus remaining quota and retry-after where appropriate.\n- Update policies without restarting gateways.\n\n**Non-functional requirements**\n- p99 limiter decision under 10 ms for regional traffic.\n- High availability; low-risk reads may fail open, money-moving writes may fail closed.\n- Consistent enough that customers cannot exceed paid quota by large margins.\n- Observable by key, endpoint, region, and rule."
      },
      {
        "title": "Capacity Estimation",
        "body": "Assume the platform receives 2B API calls/day.\n\n| Metric | Math | Result |\n|---|---|---:|\n| Average decisions | 2B / 100k sec | ~20k/s |\n| Peak decisions | 20k/s × 8 | ~160k/s |\n| Active keys/minute | 5M | 5M counters/window |\n| Counter memory | 5M × 100 B | ~500 MB before replication |\n| Regional replicas | 500 MB × 3 | ~1.5 GB per active window |\n\nSliding-log storage is too large for hot identities at this scale. Token bucket or sliding-window counters are better defaults."
      },
      {
        "title": "API Design",
        "body": "~~~http\nPOST /v1/limit/check\n{\n  \"key\": \"tenant_42:user_7:/payments\",\n  \"cost\": 1,\n  \"request_id\": \"req_abc\"\n}\n~~~\n\nResponse:\n\n~~~json\n{ \"allowed\": true, \"remaining\": 17, \"retry_after_ms\": 0, \"rule_id\": \"pro-write-1s\" }\n~~~\n\nGateways can also embed a library to avoid a network hop, but a service API makes policy rollout and auditing simpler."
      },
      {
        "title": "Data Model",
        "body": "| Entity | Important fields | Notes |\n|---|---|---|\n| limit_rules | rule_id, scope, algorithm, rate, burst, priority | Config DB, cached at gateways |\n| bucket_state | key, tokens, last_refill_ts, version | Stored in Redis/sharded cache |\n| quota_lease | region, key_prefix, tokens, expiry | Optional global quota distribution |\n| decisions | key, rule_id, allowed, ts, region | Sampled/audited stream |\n\nUse compound keys that include tenant and endpoint when limits differ by resource. Keep high-cardinality decision logs in a stream, not the transactional store."
      },
      {
        "title": "High-Level Design",
        "body": "Edge or API gateways call a regional limiter. The limiter loads rule config, checks a sharded atomic counter/token bucket, and returns allow/deny. A control plane updates rules and a monitoring plane watches 429s, latency, Redis errors, and hot keys.\n\nFor global quotas, either route each identity to a home region or lease portions of quota to regions and reconcile periodically."
      },
      {
        "title": "Deep Dives",
        "body": "### Algorithm choice\n\n| Option | Pros | Cons |\n|---|---|---|\n| Fixed window | Small state, easy TTL | Boundary burst doubles effective rate |\n| Sliding log | Accurate | Memory grows with request count |\n| Sliding counter | Efficient and smoother | Approximate near boundaries |\n| Token bucket | Natural burst support | Requires precise atomic refill/spend |\n\n### Global enforcement\n\n| Option | Pros | Cons |\n|---|---|---|\n| Central store | Stronger global limit | Adds cross-region latency and outage blast radius |\n| Home-region routing | Consistent per identity | Remote users pay latency |\n| Regional quota leases | Low latency | Temporary over/under allocation |\n| Approximate local limits | Very available | Customers may exceed global quota briefly |\n\n### Failure policy\n\nPayment creation, password attempts, and expensive ML inference should usually fail closed or degrade to conservative local limits. Public reads can fail open with logging to avoid a limiter outage taking down the product."
      },
      {
        "title": "Bottlenecks & Scaling",
        "body": "- Hot keys from large tenants can overload one shard; shard by key hash and isolate enterprise tenants.\n- Redis scripts/transactions can become CPU-bound; batch checks or use local token caches for high-volume gateways.\n- Rule fanout must be safe; use versions and gradual rollout.\n- Monitor decision latency, denied rate, key cardinality, store saturation, and fail-open count."
      },
      {
        "title": "Trade-offs & Alternatives",
        "body": "| Alternative | Benefit | Cost |\n|---|---|---|\n| Gateway-only local limiter | Lowest latency | Weak global correctness |\n| Service-based limiter | Central policy and audit | Extra network hop |\n| Envoy/global rate limit service | Mature integration | Needs customization for product quotas |\n| Billing-ledger quota | Strong paid quota accounting | Too slow for every request unless cached |"
      },
      {
        "title": "What Great Answers Mention",
        "body": "- Identity key design and endpoint-specific costs.\n- Fail-open vs fail-closed by risk level.\n- Atomic counters, TTLs, and hot-key mitigation.\n- Global quota strategies and their consistency/latency trade-offs.\n- Clear client response semantics: 429 and retry-after."
      }
    ],
    "diagrams": [
      {
        "title": "Distributed rate limiter architecture",
        "nodes": [
          {
            "id": "client",
            "label": "Clients",
            "kind": "client",
            "col": 0,
            "row": 2
          },
          {
            "id": "gateway",
            "label": "API Gateway",
            "kind": "gateway",
            "col": 1,
            "row": 2
          },
          {
            "id": "lb",
            "label": "Load Balancer",
            "kind": "lb",
            "col": 2,
            "row": 2
          },
          {
            "id": "service",
            "label": "Limiter Service",
            "kind": "service",
            "col": 3,
            "row": 2,
            "detail": "The limiter evaluates policies and updates token buckets atomically. It should be stateless except for cached config so it can scale behind gateways."
          },
          {
            "id": "cache",
            "label": "Token Buckets",
            "kind": "cache",
            "col": 4,
            "row": 1
          },
          {
            "id": "db",
            "label": "Rule Config DB",
            "kind": "db",
            "col": 5,
            "row": 2,
            "detail": "The config database stores versioned policies, not hot counters. Gateways and limiter replicas subscribe to updates and keep a safe last-known-good copy."
          },
          {
            "id": "async",
            "label": "Decision Stream",
            "kind": "stream",
            "col": 4,
            "row": 4
          },
          {
            "id": "worker",
            "label": "Workers",
            "kind": "worker",
            "col": 5,
            "row": 4
          },
          {
            "id": "aux",
            "label": "Audit Warehouse",
            "kind": "storage",
            "col": 6,
            "row": 1,
            "detail": "Decision logs support customer dashboards, abuse analysis, and billing audits. They are sampled or compacted to avoid turning observability into the bottleneck."
          },
          {
            "id": "mon",
            "label": "Metrics + Alerts",
            "kind": "monitor",
            "col": 7,
            "row": 2
          }
        ],
        "edges": [
          {
            "from": "client",
            "to": "gateway",
            "label": "request"
          },
          {
            "from": "gateway",
            "to": "lb",
            "label": "route"
          },
          {
            "from": "lb",
            "to": "service",
            "label": "call"
          },
          {
            "from": "service",
            "to": "cache",
            "label": "hot"
          },
          {
            "from": "service",
            "to": "db",
            "label": "read/write"
          },
          {
            "from": "service",
            "to": "async",
            "label": "event"
          },
          {
            "from": "async",
            "to": "worker",
            "label": "consume"
          },
          {
            "from": "worker",
            "to": "aux",
            "label": "derive"
          },
          {
            "from": "service",
            "to": "aux",
            "label": "query"
          },
          {
            "from": "service",
            "to": "mon",
            "label": "slo"
          },
          {
            "from": "worker",
            "to": "mon",
            "label": "lag"
          }
        ]
      }
    ],
    "followUps": [
      {
        "q": "How do you enforce a global limit across regions?",
        "a": "Use home-region routing for strictness or quota leasing for low latency with bounded overage."
      },
      {
        "q": "What algorithm would you choose?",
        "a": "Token bucket for burst-friendly APIs; sliding-window counter when smoother window accuracy matters."
      },
      {
        "q": "How do you avoid the limiter becoming an outage source?",
        "a": "Cache rules locally, use timeouts, define fail-open/fail-closed policies, and keep a conservative local fallback."
      },
      {
        "q": "How do you support different request costs?",
        "a": "Include a cost field and deduct multiple tokens for expensive endpoints or large payloads."
      },
      {
        "q": "What should clients receive when limited?",
        "a": "HTTP 429 with retry-after and safe quota metadata; avoid leaking details that help attackers."
      },
      {
        "q": "How do you handle hot tenants?",
        "a": "Dedicated buckets/shards, local leases at gateways, enterprise-specific capacity, and separate alerts."
      }
    ],
    "resources": [
      {
        "title": "System Design Primer",
        "url": "https://github.com/donnemartin/system-design-primer",
        "type": "repo"
      },
      {
        "title": "Designing Data-Intensive Applications",
        "url": "https://dataintensive.net",
        "type": "book"
      },
      {
        "title": "Hello Interview System Design",
        "url": "https://www.hellointerview.com/learn/system-design",
        "type": "course"
      },
      {
        "title": "Stripe rate limits",
        "url": "https://stripe.com/docs/rate-limits",
        "type": "article"
      },
      {
        "title": "Envoy rate limit filter",
        "url": "https://www.envoyproxy.io/docs/envoy/latest/configuration/http/http_filters/rate_limit_filter",
        "type": "article"
      }
    ]
  },
  {
    "id": "key-value-store",
    "title": "Key-Value Store",
    "category": "Case Study",
    "difficulty": "Hard",
    "summary": "Design a Dynamo-like key-value store with partitioning, replication, tunable consistency, high availability, and predictable latency.",
    "tags": [
      "key-value",
      "dynamo",
      "consistent-hashing",
      "replication",
      "quorum"
    ],
    "widgets": [
      "consistent-hashing"
    ],
    "sections": [
      {
        "title": "Clarify Requirements",
        "body": "**Functional requirements**\n- PUT, GET, DELETE by key with values up to a configured size such as 1 MB.\n- Optional TTL and conditional write by version.\n- Tunable read/write consistency for clients.\n- Automatic replication and recovery from node failure.\n\n**Non-functional requirements**\n- p99 single-key read/write under 20 ms in-region for small values.\n- Survive node loss and tolerate regional deployment failures if configured.\n- Scale by adding nodes with limited data movement.\n- Prefer availability for many workloads, but support stronger reads when asked."
      },
      {
        "title": "Capacity Estimation",
        "body": "Assume 1B active keys, average value 1 KB, and 100k read/s plus 20k write/s peak.\n\n| Metric | Math | Result |\n|---|---|---:|\n| Raw storage | 1B × 1 KB | ~1 TB |\n| Replicated storage | 1 TB × 3 | ~3 TB before compaction/indexes |\n| Write bandwidth | 20k/s × 1 KB × 3 replicas | ~60 MB/s |\n| Read bandwidth | 100k/s × 1 KB | ~100 MB/s before cache |\n| Partitions | 256 virtual partitions × 3 replicas | 768 placements |\n\nMetadata and compaction overhead can double storage, so capacity planning should leave headroom."
      },
      {
        "title": "API Design",
        "body": "~~~http\nPUT /v1/kv/{key}\nX-Consistency: quorum\nIf-Match: version_123\n{ \"value_base64\": \"...\", \"ttl_seconds\": 86400 }\n~~~\n\n~~~http\nGET /v1/kv/{key}?consistency=one|quorum|all\n~~~\n\n~~~http\nDELETE /v1/kv/{key}\n~~~\n\nResponses include value, version/vector clock, expiry, and whether conflict resolution is needed."
      },
      {
        "title": "Data Model",
        "body": "| Entity | Important fields | Notes |\n|---|---|---|\n| object | key, value_pointer/value, version, ttl, tombstone | Stored in LSM or B-tree engine |\n| partition_map | partition_id, token_range, replica_nodes, version | Consensus-backed metadata |\n| hint | target_node, key, value, expiry | For hinted handoff during outages |\n| anti_entropy_state | partition, peer, last_scan | Repair scheduling |\n\nLarge values can be stored in object storage with the KV store holding metadata and checksums."
      },
      {
        "title": "High-Level Design",
        "body": "Clients or routers hash keys to token ranges. Coordinators send writes to N replicas and wait for W acknowledgements. Reads contact R replicas when quorum is requested, reconcile versions, and optionally perform read repair. Background anti-entropy compares replicas and repairs divergence."
      },
      {
        "title": "Deep Dives",
        "body": "### Partitioning\n\n| Option | Pros | Cons |\n|---|---|---|\n| Modulo hashing | Simple | Adding nodes remaps many keys |\n| Consistent hashing | Limited movement | Needs virtual nodes and ring metadata |\n| Fixed logical partitions | Easier rebalancing and monitoring | Requires partition-to-node map |\n\n### Consistency\n\n| Setting | Pros | Cons |\n|---|---|---|\n| R=1, W=1 | Lowest latency and high availability | Stale reads and lost conflict visibility |\n| Quorum R+W>N | Better freshness | More tail latency and lower availability |\n| All replicas | Strongest within replica set | Fragile during failure |\n\n### Conflict resolution\n\nUse last-write-wins only when overwriting is safe. For carts, sets, or collaborative state, store versions/vector clocks or CRDT-like structures so concurrent writes can be merged or surfaced."
      },
      {
        "title": "Bottlenecks & Scaling",
        "body": "- Hot keys dominate tail latency; add caching, key splitting, or per-key throttling.\n- Compaction can interfere with foreground latency; throttle and isolate IO.\n- Rebalancing after node addition must be incremental and observable.\n- Tombstones need retention long enough to propagate deletes before compaction."
      },
      {
        "title": "Trade-offs & Alternatives",
        "body": "| Alternative | Benefit | Cost |\n|---|---|---|\n| Relational DB | Transactions and secondary queries | Harder to scale arbitrary key writes |\n| Managed Redis | Very low latency | Memory cost and persistence constraints |\n| Wide-column store | Large-scale partitioned rows | More modeling discipline |\n| Strong consensus per key | Simpler semantics | Higher latency and lower availability |"
      },
      {
        "title": "What Great Answers Mention",
        "body": "- Consistent hashing or logical partitions with replication factor.\n- Quorum reads/writes and what stale reads mean.\n- Versioning, conflict handling, hinted handoff, and read repair.\n- Compaction, tombstones, and operational metrics.\n- Hot-key mitigation and large-value handling."
      }
    ],
    "diagrams": [
      {
        "title": "Dynamo-style key-value store",
        "nodes": [
          {
            "id": "client",
            "label": "Clients",
            "kind": "client",
            "col": 0,
            "row": 2
          },
          {
            "id": "gateway",
            "label": "API Gateway",
            "kind": "gateway",
            "col": 1,
            "row": 2
          },
          {
            "id": "lb",
            "label": "Load Balancer",
            "kind": "lb",
            "col": 2,
            "row": 2
          },
          {
            "id": "service",
            "label": "Coordinator",
            "kind": "service",
            "col": 3,
            "row": 2,
            "detail": "The coordinator routes a key to its replica set and waits for the requested read/write quorum. It should be stateless so clients can retry another coordinator."
          },
          {
            "id": "cache",
            "label": "Ring Metadata",
            "kind": "cache",
            "col": 4,
            "row": 1
          },
          {
            "id": "db",
            "label": "Replica Nodes",
            "kind": "db",
            "col": 5,
            "row": 2,
            "detail": "Replica nodes own logical partitions and store values in a local storage engine. They track versions and tombstones so repairs and deletes are safe."
          },
          {
            "id": "async",
            "label": "Repair Stream",
            "kind": "stream",
            "col": 4,
            "row": 4
          },
          {
            "id": "worker",
            "label": "Workers",
            "kind": "worker",
            "col": 5,
            "row": 4
          },
          {
            "id": "aux",
            "label": "Anti-entropy Store",
            "kind": "storage",
            "col": 6,
            "row": 1,
            "detail": "Anti-entropy jobs compare hashes or Merkle trees between replicas and schedule repairs. They protect against missed writes, disk replacement, and prolonged node outages."
          },
          {
            "id": "mon",
            "label": "Metrics + Alerts",
            "kind": "monitor",
            "col": 7,
            "row": 2
          }
        ],
        "edges": [
          {
            "from": "client",
            "to": "gateway",
            "label": "request"
          },
          {
            "from": "gateway",
            "to": "lb",
            "label": "route"
          },
          {
            "from": "lb",
            "to": "service",
            "label": "call"
          },
          {
            "from": "service",
            "to": "cache",
            "label": "hot"
          },
          {
            "from": "service",
            "to": "db",
            "label": "read/write"
          },
          {
            "from": "service",
            "to": "async",
            "label": "event"
          },
          {
            "from": "async",
            "to": "worker",
            "label": "consume"
          },
          {
            "from": "worker",
            "to": "aux",
            "label": "derive"
          },
          {
            "from": "service",
            "to": "aux",
            "label": "query"
          },
          {
            "from": "service",
            "to": "mon",
            "label": "slo"
          },
          {
            "from": "worker",
            "to": "mon",
            "label": "lag"
          }
        ]
      }
    ],
    "followUps": [
      {
        "q": "Why use consistent hashing?",
        "a": "It limits data movement when nodes join or leave and supports incremental rebalancing."
      },
      {
        "q": "What does R + W > N achieve?",
        "a": "A read quorum and write quorum overlap, increasing the chance a read sees the latest acknowledged write."
      },
      {
        "q": "How do you handle deletes?",
        "a": "Write tombstones, replicate them, retain them long enough for repair, then compact safely."
      },
      {
        "q": "What is hinted handoff?",
        "a": "A healthy node temporarily stores writes for an unavailable replica and forwards them when it recovers."
      },
      {
        "q": "How do you handle conflicts?",
        "a": "Use versions/vector clocks and merge rules; avoid blind last-write-wins for data where lost updates matter."
      },
      {
        "q": "What causes tail latency?",
        "a": "Slow replicas, compaction, hot keys, network jitter, and waiting for larger quorums."
      }
    ],
    "resources": [
      {
        "title": "System Design Primer",
        "url": "https://github.com/donnemartin/system-design-primer",
        "type": "repo"
      },
      {
        "title": "Designing Data-Intensive Applications",
        "url": "https://dataintensive.net",
        "type": "book"
      },
      {
        "title": "Hello Interview System Design",
        "url": "https://www.hellointerview.com/learn/system-design",
        "type": "course"
      },
      {
        "title": "Dynamo paper",
        "url": "https://www.allthingsdistributed.com/files/amazon-dynamo-sosp2007.pdf",
        "type": "paper"
      },
      {
        "title": "Bigtable paper",
        "url": "https://research.google/pubs/bigtable-a-distributed-storage-system-for-structured-data/",
        "type": "paper"
      }
    ]
  },
  {
    "id": "web-crawler",
    "title": "Web Crawler",
    "category": "Case Study",
    "difficulty": "Hard",
    "summary": "Design a polite, scalable crawler that discovers pages, respects robots and per-host limits, deduplicates content, and feeds search or analytics pipelines.",
    "tags": [
      "crawler",
      "frontier",
      "dedupe",
      "robots",
      "politeness"
    ],
    "widgets": [
      "bloom-filter"
    ],
    "sections": [
      {
        "title": "Clarify Requirements",
        "body": "**Functional requirements**\n- Accept seed URLs, fetch pages, extract links, and schedule newly discovered URLs.\n- Respect robots.txt, crawl-delay, nofollow where required, and per-host politeness.\n- Deduplicate URLs and optionally near-duplicate content.\n- Store raw pages or parsed documents for indexing.\n\n**Non-functional requirements**\n- Scale to hundreds of millions of pages per day.\n- Avoid overloading external sites and support blacklists.\n- Recover from worker failure without losing frontier state.\n- Keep crawl freshness configurable by domain importance."
      },
      {
        "title": "Capacity Estimation",
        "body": "Target 1B pages/month, roughly 33M/day.\n\n| Metric | Math | Result |\n|---|---|---:|\n| Fetch QPS | 33M / 100k sec | ~330/s average |\n| Peak fetch QPS | 330/s × 5 | ~1.6k/s |\n| Raw page bytes | 33M × 100 KB | ~3.3 TB/day |\n| Compressed storage | 3.3 TB × 30% | ~1 TB/day |\n| Link extraction | 33M × 100 links | 3.3B discovered URLs/day |\n\nDiscovered URLs far exceed fetched URLs, so dedupe and prioritization are central."
      },
      {
        "title": "API Design",
        "body": "~~~http\nPOST /v1/crawls/seeds\n{ \"urls\": [\"https://example.com\"], \"priority\": \"high\" }\n~~~\n\n~~~http\nGET /v1/crawls/status?host=example.com\n~~~\n\nInternal worker contract:\n\n~~~json\n{ \"url\": \"https://example.com/page\", \"host\": \"example.com\", \"priority\": 17, \"not_before\": \"2026-10-01T12:00:00Z\" }\n~~~"
      },
      {
        "title": "Data Model",
        "body": "| Entity | Important fields | Notes |\n|---|---|---|\n| url_frontier | normalized_url_hash, url, host, priority, not_before, status | Durable priority queue or sharded table |\n| host_policy | host, robots_rules, crawl_delay, next_fetch_after | Cached and refreshed |\n| fetched_page | url_hash, fetch_ts, status, content_hash, storage_uri | Raw/parsed page metadata |\n| seen_url_filter | shard, bloom_bits/version | Fast duplicate suppression |\n| content_fingerprint | simhash/minhash, canonical_url | Near-duplicate detection |"
      },
      {
        "title": "High-Level Design",
        "body": "A scheduler owns the URL frontier and dispatches fetch tasks only when host politeness permits. Fetchers download pages, store raw content, emit parse tasks, and parsers extract normalized links back into the frontier. Dedupe happens at URL ingestion and again at content fingerprinting."
      },
      {
        "title": "Deep Dives",
        "body": "### Frontier design\n\n| Option | Pros | Cons |\n|---|---|---|\n| Global priority queue | Simple priority ordering | Hard to enforce host politeness at scale |\n| Per-host queues | Natural politeness | Many small queues and scheduling overhead |\n| Sharded frontier by host hash | Scalable and polite | Rebalancing host shards carefully |\n\n### Dedupe\n\n| Option | Pros | Cons |\n|---|---|---|\n| Exact URL table | Accurate | Expensive at billions of URLs |\n| Bloom filter | Memory efficient | False positives skip some pages |\n| Content fingerprint | Finds mirrors and duplicates | CPU work and imperfect similarity |\n\n### Freshness\n\nImportant domains get shorter revisit intervals; low-value pages can be recrawled rarely. Use HTTP headers such as ETag and Last-Modified to save bandwidth."
      },
      {
        "title": "Bottlenecks & Scaling",
        "body": "- Frontier growth can explode; cap per-host discovery and score URLs.\n- DNS, TLS, and robots fetching can dominate latency; cache safely.\n- Large binary files should be filtered or handled by specialized workers.\n- External failures are normal; use retries with per-host backoff and error budgets."
      },
      {
        "title": "Trade-offs & Alternatives",
        "body": "| Alternative | Benefit | Cost |\n|---|---|---|\n| Breadth-first crawling | Broad coverage | Low freshness for important pages |\n| Priority-based crawling | Freshness and relevance | Requires scoring system |\n| Store only parsed text | Lower storage | Cannot reprocess raw pages later |\n| Store raw + parsed | Reprocessing possible | Higher storage cost |"
      },
      {
        "title": "What Great Answers Mention",
        "body": "- Politeness and robots are first-class constraints, not afterthoughts.\n- Frontier scheduling is the core scalability problem.\n- Bloom filters are acceptable only if missed crawls are tolerable.\n- Content dedupe, canonicalization, and URL normalization details.\n- Metrics: fetch success, host errors, queue age, duplicate rate, bytes/day."
      }
    ],
    "diagrams": [
      {
        "title": "Polite web crawler",
        "nodes": [
          {
            "id": "client",
            "label": "Clients",
            "kind": "client",
            "col": 0,
            "row": 2
          },
          {
            "id": "gateway",
            "label": "API Gateway",
            "kind": "gateway",
            "col": 1,
            "row": 2
          },
          {
            "id": "lb",
            "label": "Load Balancer",
            "kind": "lb",
            "col": 2,
            "row": 2
          },
          {
            "id": "service",
            "label": "Frontier Scheduler",
            "kind": "service",
            "col": 3,
            "row": 2,
            "detail": "The scheduler chooses which URL can be fetched next based on priority and host politeness. It should persist decisions so worker crashes do not lose crawl state."
          },
          {
            "id": "cache",
            "label": "Robots Cache",
            "kind": "cache",
            "col": 4,
            "row": 1
          },
          {
            "id": "db",
            "label": "Frontier Store",
            "kind": "db",
            "col": 5,
            "row": 2,
            "detail": "The frontier store tracks URL status, priority, and not-before times. It is often sharded by host hash to keep per-host ordering local."
          },
          {
            "id": "async",
            "label": "Fetch Queue",
            "kind": "queue",
            "col": 4,
            "row": 4
          },
          {
            "id": "worker",
            "label": "Workers",
            "kind": "worker",
            "col": 5,
            "row": 4
          },
          {
            "id": "aux",
            "label": "Page Store",
            "kind": "storage",
            "col": 6,
            "row": 1,
            "detail": "The page store keeps raw or parsed content for indexing and reprocessing. Compression and lifecycle rules are essential because crawl data grows by terabytes per day."
          },
          {
            "id": "mon",
            "label": "Metrics + Alerts",
            "kind": "monitor",
            "col": 7,
            "row": 2
          }
        ],
        "edges": [
          {
            "from": "client",
            "to": "gateway",
            "label": "request"
          },
          {
            "from": "gateway",
            "to": "lb",
            "label": "route"
          },
          {
            "from": "lb",
            "to": "service",
            "label": "call"
          },
          {
            "from": "service",
            "to": "cache",
            "label": "hot"
          },
          {
            "from": "service",
            "to": "db",
            "label": "read/write"
          },
          {
            "from": "service",
            "to": "async",
            "label": "event"
          },
          {
            "from": "async",
            "to": "worker",
            "label": "consume"
          },
          {
            "from": "worker",
            "to": "aux",
            "label": "derive"
          },
          {
            "from": "service",
            "to": "aux",
            "label": "query"
          },
          {
            "from": "service",
            "to": "mon",
            "label": "slo"
          },
          {
            "from": "worker",
            "to": "mon",
            "label": "lag"
          }
        ]
      }
    ],
    "followUps": [
      {
        "q": "How do you enforce politeness?",
        "a": "Use per-host queues and next-fetch timestamps derived from robots and crawl-delay rules."
      },
      {
        "q": "Why use a Bloom filter?",
        "a": "It cheaply rejects already-seen URLs before expensive database checks, accepting a small false-positive skip rate."
      },
      {
        "q": "How do you handle duplicate content?",
        "a": "Use canonical URLs plus fingerprints such as SimHash or MinHash for near-duplicate detection."
      },
      {
        "q": "What happens when a host returns many errors?",
        "a": "Back off that host, lower priority, and preserve global worker capacity for healthy hosts."
      },
      {
        "q": "How do you prioritize recrawls?",
        "a": "Score by page importance, change frequency, freshness SLO, and business value."
      },
      {
        "q": "What should be monitored?",
        "a": "Queue age, fetch QPS, per-host error rate, robots cache hits, dedupe rate, and bytes stored."
      }
    ],
    "resources": [
      {
        "title": "System Design Primer",
        "url": "https://github.com/donnemartin/system-design-primer",
        "type": "repo"
      },
      {
        "title": "Designing Data-Intensive Applications",
        "url": "https://dataintensive.net",
        "type": "book"
      },
      {
        "title": "Hello Interview System Design",
        "url": "https://www.hellointerview.com/learn/system-design",
        "type": "course"
      },
      {
        "title": "Anatomy of a Large-Scale Hypertextual Web Search Engine",
        "url": "https://snap.stanford.edu/class/cs224w-readings/Brin98Anatomy.pdf",
        "type": "paper"
      },
      {
        "title": "Robots Exclusion Protocol RFC",
        "url": "https://www.rfc-editor.org/rfc/rfc9309",
        "type": "paper"
      }
    ]
  },
  {
    "id": "notification-system",
    "title": "Notification System",
    "category": "Case Study",
    "difficulty": "Medium",
    "summary": "Design a multi-channel notification platform for push, email, SMS, and in-app messages with preferences, retries, templates, and provider failover.",
    "tags": [
      "notifications",
      "push",
      "email",
      "sms",
      "preferences",
      "retries"
    ],
    "sections": [
      {
        "title": "Clarify Requirements",
        "body": "**Functional requirements**\n- Send transactional and marketing notifications across push, email, SMS, and in-app channels.\n- Respect user preferences, quiet hours, locale, templates, and unsubscribe rules.\n- Track delivery status, opens/clicks where available, and failures.\n- Support priority and scheduled notifications.\n\n**Non-functional requirements**\n- Transactional notifications should enqueue within 100 ms and deliver quickly.\n- Duplicate sends must be avoided for the same event and channel.\n- Provider failures should be retried or failed over.\n- Marketing traffic must not starve security alerts."
      },
      {
        "title": "Capacity Estimation",
        "body": "Assume 50M DAU and 5 notifications/user/day.\n\n| Metric | Math | Result |\n|---|---|---:|\n| Notifications/day | 50M × 5 | 250M/day |\n| Average enqueue QPS | 250M / 100k sec | ~2.5k/s |\n| Peak enqueue QPS | 2.5k/s × 10 | ~25k/s |\n| Event size | 1 KB × 250M | ~250 GB/day raw events |\n| Provider callbacks | 30% callback rate | ~75M/day |\n\nChannel fanout matters: one product event may generate push plus email plus in-app, so capacity should count deliveries, not only product events."
      },
      {
        "title": "API Design",
        "body": "~~~http\nPOST /v1/notifications\n{\n  \"idempotency_key\": \"order_123:shipped\",\n  \"user_id\": \"u1\",\n  \"template\": \"order_shipped\",\n  \"channels\": [\"push\", \"email\"],\n  \"data\": { \"order_id\": \"123\" },\n  \"priority\": \"transactional\"\n}\n~~~\n\n~~~http\nPUT /v1/users/{user_id}/notification-preferences\n~~~\n\nProvider callbacks update delivery status asynchronously."
      },
      {
        "title": "Data Model",
        "body": "| Entity | Important fields | Notes |\n|---|---|---|\n| notification_request | id, idempotency_key, user_id, template, priority, created_at | One product event |\n| delivery | request_id, channel, provider, status, attempt_count, next_retry_at | One channel attempt lifecycle |\n| user_preference | user_id, channel, category, enabled, quiet_hours, locale | Read on send decision |\n| template | template_id, version, locale, subject/body | Versioned to reproduce sends |\n| device_token | user_id, platform, token, status | Push routing |"
      },
      {
        "title": "High-Level Design",
        "body": "Producers call the notification API, which validates idempotency and writes a request. Channel planners expand requests into deliveries after checking preferences. Priority queues feed channel-specific workers that render templates, call providers, and update status from callbacks."
      },
      {
        "title": "Deep Dives",
        "body": "### Queue isolation\n\n| Option | Pros | Cons |\n|---|---|---|\n| Single queue | Simple | Marketing bursts delay critical alerts |\n| Per-channel queues | Provider-specific scaling | Cross-channel priority is harder |\n| Priority queues | Protect urgent sends | Starvation must be managed |\n\n### Provider strategy\n\n| Option | Pros | Cons |\n|---|---|---|\n| One provider | Simpler operations | Provider outage blocks channel |\n| Active-passive failover | Better availability | Duplicate risk during ambiguous failures |\n| Active-active | Cost/performance optimization | Complex routing and reconciliation |\n\n### Idempotency and retries\n\nStore idempotency by product event and dedupe by delivery key `(request_id, channel)`. Retry transient failures with exponential backoff and stop on permanent errors such as invalid token or unsubscribed email."
      },
      {
        "title": "Bottlenecks & Scaling",
        "body": "- Template rendering can be CPU-heavy; cache compiled templates and localize carefully.\n- Provider rate limits require per-provider throttling and backpressure.\n- Device tokens churn; invalid tokens must be cleaned up from callbacks.\n- Store status transitions append-only for audit when notification compliance matters."
      },
      {
        "title": "Trade-offs & Alternatives",
        "body": "| Alternative | Benefit | Cost |\n|---|---|---|\n| Direct provider calls from product services | Fast to build | Duplicated preferences, retries, and compliance logic |\n| Central notification platform | Consistent controls | Adds dependency and onboarding work |\n| Synchronous send | Immediate status | User requests block on providers |\n| Async enqueue | Resilient and scalable | User sees eventual delivery |"
      },
      {
        "title": "What Great Answers Mention",
        "body": "- Preference and compliance checks before sends.\n- Priority isolation for security/transactional messages.\n- Idempotency across retries and provider failover.\n- Channel-specific queues, rate limits, and callbacks.\n- Observability: enqueue lag, delivery latency, provider errors, duplicate rate."
      }
    ],
    "diagrams": [
      {
        "title": "Notification platform",
        "nodes": [
          {
            "id": "client",
            "label": "Clients",
            "kind": "client",
            "col": 0,
            "row": 2
          },
          {
            "id": "gateway",
            "label": "API Gateway",
            "kind": "gateway",
            "col": 1,
            "row": 2
          },
          {
            "id": "lb",
            "label": "Load Balancer",
            "kind": "lb",
            "col": 2,
            "row": 2
          },
          {
            "id": "service",
            "label": "Notification API",
            "kind": "service",
            "col": 3,
            "row": 2,
            "detail": "The API validates requests, enforces idempotency, and records the notification intent. It should not call external providers synchronously in the user request path."
          },
          {
            "id": "cache",
            "label": "Preference Cache",
            "kind": "cache",
            "col": 4,
            "row": 1
          },
          {
            "id": "db",
            "label": "Notification DB",
            "kind": "db",
            "col": 5,
            "row": 2,
            "detail": "The notification database stores request and delivery state so retries are deterministic and auditable. Status updates should be append-friendly and queryable by user or request."
          },
          {
            "id": "async",
            "label": "Delivery Queues",
            "kind": "queue",
            "col": 4,
            "row": 4
          },
          {
            "id": "worker",
            "label": "Workers",
            "kind": "worker",
            "col": 5,
            "row": 4
          },
          {
            "id": "aux",
            "label": "Push/Email/SMS Providers",
            "kind": "external",
            "col": 6,
            "row": 1,
            "detail": "Providers deliver channel-specific messages and return callbacks with success or failure. Provider abstraction enables failover and consistent retry classification."
          },
          {
            "id": "mon",
            "label": "Metrics + Alerts",
            "kind": "monitor",
            "col": 7,
            "row": 2
          }
        ],
        "edges": [
          {
            "from": "client",
            "to": "gateway",
            "label": "request"
          },
          {
            "from": "gateway",
            "to": "lb",
            "label": "route"
          },
          {
            "from": "lb",
            "to": "service",
            "label": "call"
          },
          {
            "from": "service",
            "to": "cache",
            "label": "hot"
          },
          {
            "from": "service",
            "to": "db",
            "label": "read/write"
          },
          {
            "from": "service",
            "to": "async",
            "label": "event"
          },
          {
            "from": "async",
            "to": "worker",
            "label": "consume"
          },
          {
            "from": "worker",
            "to": "aux",
            "label": "derive"
          },
          {
            "from": "service",
            "to": "aux",
            "label": "query"
          },
          {
            "from": "service",
            "to": "mon",
            "label": "slo"
          },
          {
            "from": "worker",
            "to": "mon",
            "label": "lag"
          }
        ]
      }
    ],
    "followUps": [
      {
        "q": "How do you prevent duplicate notifications?",
        "a": "Use idempotency keys for product events and unique delivery keys per channel plus provider retry tracking."
      },
      {
        "q": "How do you respect quiet hours?",
        "a": "Planner checks user timezone and schedules non-urgent deliveries for the next allowed window."
      },
      {
        "q": "How do you handle provider rate limits?",
        "a": "Maintain per-provider token buckets, queue backpressure, and retry-after handling."
      },
      {
        "q": "Should sending be synchronous?",
        "a": "Usually no; enqueue synchronously and deliver asynchronously, except rare flows needing immediate provider confirmation."
      },
      {
        "q": "How do you fail over providers safely?",
        "a": "Classify ambiguous failures, use idempotency where providers support it, and suppress duplicates by delivery state."
      },
      {
        "q": "What metrics matter?",
        "a": "Queue lag, delivery latency, success rate by provider/channel, invalid token rate, retries, and duplicate sends."
      }
    ],
    "resources": [
      {
        "title": "System Design Primer",
        "url": "https://github.com/donnemartin/system-design-primer",
        "type": "repo"
      },
      {
        "title": "Designing Data-Intensive Applications",
        "url": "https://dataintensive.net",
        "type": "book"
      },
      {
        "title": "Hello Interview System Design",
        "url": "https://www.hellointerview.com/learn/system-design",
        "type": "course"
      },
      {
        "title": "Firebase Cloud Messaging",
        "url": "https://firebase.google.com/docs/cloud-messaging",
        "type": "article"
      },
      {
        "title": "Apple Push Notification service",
        "url": "https://developer.apple.com/documentation/usernotifications/setting_up_a_remote_notification_server",
        "type": "article"
      },
      {
        "title": "Twilio messaging docs",
        "url": "https://www.twilio.com/docs/messaging",
        "type": "article"
      }
    ]
  },
  {
    "id": "news-feed",
    "title": "News Feed (Twitter/Instagram)",
    "category": "Case Study",
    "difficulty": "Hard",
    "summary": "Design a social feed that supports posting, following, fanout, ranking, media, and low-latency feed reads under celebrity skew.",
    "tags": [
      "feed",
      "fanout",
      "ranking",
      "timeline",
      "social-graph"
    ],
    "sections": [
      {
        "title": "Clarify Requirements",
        "body": "**Functional requirements**\n- Users create posts with text/media and follow other users.\n- Home timeline returns recent or ranked posts from followed accounts.\n- Profile timeline shows a user's own posts.\n- Support likes/comments counts, deletion, privacy, and mute/block filters.\n\n**Non-functional requirements**\n- Feed read p95 under 300 ms for typical users.\n- Writes should be durable quickly; fanout can be asynchronous.\n- Handle celebrity users with millions of followers.\n- Ranking and counters may be eventually consistent."
      },
      {
        "title": "Capacity Estimation",
        "body": "Assume 50M DAU, 5 feed opens/day, and 5M posts/day.\n\n| Metric | Math | Result |\n|---|---|---:|\n| Feed reads/day | 50M × 5 | 250M/day |\n| Feed read QPS | 250M / 100k sec | ~2.5k/s average, ~25k/s peak |\n| Post writes | 5M / 100k sec | ~50/s average, ~500/s peak |\n| Post metadata | 5M × 2 KB | ~10 GB/day raw |\n| Fanout events | posts × avg followers 200 | ~1B timeline inserts/day |\n\nAverage fanout hides skew: one celebrity post may require tens of millions of timeline updates."
      },
      {
        "title": "API Design",
        "body": "~~~http\nPOST /v1/posts\n{ \"text\": \"hello\", \"media_ids\": [\"m1\"], \"visibility\": \"followers\" }\n~~~\n\n~~~http\nGET /v1/feed/home?cursor=opaque&limit=20\n~~~\n\n~~~http\nPOST /v1/users/{target_id}/follow\n~~~"
      },
      {
        "title": "Data Model",
        "body": "| Entity | Important fields | Access pattern |\n|---|---|---|\n| posts | post_id, author_id, text, media_ids, created_at, visibility | Fetch by post_id and author timeline |\n| follows | follower_id, followee_id, created_at | Social graph queries |\n| home_timeline | user_id, rank_time, post_id, author_id | Feed reads by user_id ordered by rank_time |\n| engagement_counts | post_id, likes, comments, reposts | Eventually consistent counters |\n| user_blocks | user_id, blocked_id | Filter on read/write fanout |"
      },
      {
        "title": "High-Level Design",
        "body": "The write path stores the post and emits a fanout event. Fanout workers push post IDs into followers' home timelines for normal users. Feed reads fetch candidate post IDs from the timeline cache/store, hydrate post details, apply privacy filters, and optionally rank or re-rank."
      },
      {
        "title": "Deep Dives",
        "body": "### Fanout model\n\n| Option | Pros | Cons |\n|---|---|---|\n| Fanout-on-write | Fast feed reads | Expensive for celebrities and follow changes |\n| Fanout-on-read | Cheap writes | Slow reads for users following many accounts |\n| Hybrid | Handles skew | More complex thresholds and merge logic |\n\nA common answer uses fanout-on-write for ordinary accounts and fanout-on-read for celebrities, merging celebrity posts at read time.\n\n### Ranking\n\n| Option | Pros | Cons |\n|---|---|---|\n| Reverse chronological | Simple and explainable | Lower engagement quality |\n| Offline ranking | Efficient serving | Less responsive to fresh context |\n| Online re-ranking | Personalized and fresh | Higher latency and ML infra complexity |\n\n### Consistency and privacy\n\nDeletes and blocks must be enforced at read time even if old timeline entries remain. Store immutable post IDs in timelines and hydrate/filter against current visibility."
      },
      {
        "title": "Bottlenecks & Scaling",
        "body": "- Timeline storage can be huge; cap per-user timeline length and rebuild from posts if needed.\n- Celebrity posts create fanout storms; use hybrid fanout and special queues.\n- Media should be stored in object storage and served via CDN, not through feed services.\n- Counters need write coalescing and eventual aggregation."
      },
      {
        "title": "Trade-offs & Alternatives",
        "body": "| Alternative | Benefit | Cost |\n|---|---|---|\n| Pure chronological | Easier correctness | Less personalized engagement |\n| Fully ranked feed | Better relevance | Harder explainability and latency |\n| Pull model | Lower write amplification | Higher read CPU and graph lookups |\n| Push model | Low read latency | High write amplification and storage |"
      },
      {
        "title": "What Great Answers Mention",
        "body": "- Hybrid fanout and celebrity skew.\n- Separation of post storage, timeline index, and hydration.\n- Privacy/delete filters at read time.\n- Cursor pagination with stable ordering.\n- Observability: fanout lag, feed p95, hydration miss rate, ranking latency."
      }
    ],
    "diagrams": [
      {
        "title": "Hybrid news feed",
        "nodes": [
          {
            "id": "client",
            "label": "Clients",
            "kind": "client",
            "col": 0,
            "row": 2
          },
          {
            "id": "gateway",
            "label": "API Gateway",
            "kind": "gateway",
            "col": 1,
            "row": 2
          },
          {
            "id": "lb",
            "label": "Load Balancer",
            "kind": "lb",
            "col": 2,
            "row": 2
          },
          {
            "id": "service",
            "label": "Feed Service",
            "kind": "service",
            "col": 3,
            "row": 2,
            "detail": "The feed service serves reads by fetching timeline candidates, hydrating posts, and applying privacy filters. It keeps expensive ranking optional and bounded by latency budgets."
          },
          {
            "id": "cache",
            "label": "Timeline Cache",
            "kind": "cache",
            "col": 4,
            "row": 1
          },
          {
            "id": "db",
            "label": "Post + Timeline Store",
            "kind": "db",
            "col": 5,
            "row": 2,
            "detail": "The store separates post facts from per-user timeline indexes. Timelines contain post IDs so stale fanout entries can be filtered when post visibility changes."
          },
          {
            "id": "async",
            "label": "Fanout Stream",
            "kind": "stream",
            "col": 4,
            "row": 4
          },
          {
            "id": "worker",
            "label": "Workers",
            "kind": "worker",
            "col": 5,
            "row": 4
          },
          {
            "id": "aux",
            "label": "Media CDN",
            "kind": "cdn",
            "col": 6,
            "row": 1,
            "detail": "Media is uploaded to object storage and distributed through a CDN. Feed responses should include URLs and metadata, not proxy large media bytes."
          },
          {
            "id": "mon",
            "label": "Metrics + Alerts",
            "kind": "monitor",
            "col": 7,
            "row": 2
          }
        ],
        "edges": [
          {
            "from": "client",
            "to": "gateway",
            "label": "request"
          },
          {
            "from": "gateway",
            "to": "lb",
            "label": "route"
          },
          {
            "from": "lb",
            "to": "service",
            "label": "call"
          },
          {
            "from": "service",
            "to": "cache",
            "label": "hot"
          },
          {
            "from": "service",
            "to": "db",
            "label": "read/write"
          },
          {
            "from": "service",
            "to": "async",
            "label": "event"
          },
          {
            "from": "async",
            "to": "worker",
            "label": "consume"
          },
          {
            "from": "worker",
            "to": "aux",
            "label": "derive"
          },
          {
            "from": "service",
            "to": "aux",
            "label": "query"
          },
          {
            "from": "service",
            "to": "mon",
            "label": "slo"
          },
          {
            "from": "worker",
            "to": "mon",
            "label": "lag"
          }
        ]
      }
    ],
    "followUps": [
      {
        "q": "How do you handle celebrity users?",
        "a": "Do not push to every follower; store celebrity posts separately and merge them into feeds at read time."
      },
      {
        "q": "How do deletes work?",
        "a": "Mark post deleted in source of truth and filter during hydration; asynchronously remove timeline entries."
      },
      {
        "q": "How do you paginate feeds?",
        "a": "Use a cursor containing rank/time and tie-breaker post ID, not offset."
      },
      {
        "q": "Where does ranking happen?",
        "a": "Precompute candidate scores offline, then optionally re-rank a bounded set online."
      },
      {
        "q": "How do follow changes affect feeds?",
        "a": "Backfill recent posts for new follows and lazily age out unfollowed authors with read-time filtering."
      },
      {
        "q": "What metrics indicate fanout trouble?",
        "a": "Queue lag, timeline insert failures, celebrity queue depth, feed freshness, and read-time merge latency."
      }
    ],
    "resources": [
      {
        "title": "System Design Primer",
        "url": "https://github.com/donnemartin/system-design-primer",
        "type": "repo"
      },
      {
        "title": "Designing Data-Intensive Applications",
        "url": "https://dataintensive.net",
        "type": "book"
      },
      {
        "title": "Hello Interview System Design",
        "url": "https://www.hellointerview.com/learn/system-design",
        "type": "course"
      },
      {
        "title": "Facebook TAO paper",
        "url": "https://www.usenix.org/system/files/conference/atc13/atc13-bronson.pdf",
        "type": "paper"
      },
      {
        "title": "Twitter Snowflake",
        "url": "https://blog.x.com/engineering/en_us/a/2010/announcing-snowflake",
        "type": "article"
      }
    ]
  },
  {
    "id": "chat-system",
    "title": "Chat System (WhatsApp/Slack)",
    "category": "Case Study",
    "difficulty": "Hard",
    "summary": "Design real-time messaging with conversations, presence, delivery receipts, offline sync, media attachments, and ordered message history.",
    "tags": [
      "chat",
      "websocket",
      "presence",
      "ordering",
      "messaging"
    ],
    "sections": [
      {
        "title": "Clarify Requirements",
        "body": "**Functional requirements**\n- One-to-one and group messaging with text, media, reactions, and edits/deletes.\n- Real-time delivery to online devices and offline sync for later.\n- Delivery/read receipts, typing indicators, and presence.\n- Search within message history may be a later requirement.\n\n**Non-functional requirements**\n- p95 send-to-online-device latency below 500 ms in-region.\n- Durable message storage before acking sender.\n- Preserve per-conversation message order.\n- Scale to many long-lived connections."
      },
      {
        "title": "Capacity Estimation",
        "body": "Assume 50M DAU and 40 messages/user/day.\n\n| Metric | Math | Result |\n|---|---|---:|\n| Messages/day | 50M × 40 | 2B/day |\n| Average message QPS | 2B / 100k sec | ~20k/s |\n| Peak message QPS | 20k/s × 10 | ~200k/s |\n| Message storage | 2B × 1 KB | ~2 TB/day raw |\n| Fanout to devices | 2 devices/user × online fraction | often 2-3 deliveries/message |\n\nMedia should not be stored in the message row; store attachments in object storage and reference them."
      },
      {
        "title": "API Design",
        "body": "~~~http\nPOST /v1/conversations/{conversation_id}/messages\n{ \"client_msg_id\": \"uuid\", \"text\": \"hi\", \"attachments\": [] }\n~~~\n\nWebSocket event:\n\n~~~json\n{ \"type\": \"message.created\", \"conversation_id\": \"c1\", \"message_id\": \"m9\", \"seq\": 1842 }\n~~~\n\n~~~http\nGET /v1/conversations/{conversation_id}/messages?before_seq=1842&limit=50\n~~~"
      },
      {
        "title": "Data Model",
        "body": "| Entity | Important fields | Access pattern |\n|---|---|---|\n| conversation | conversation_id, type, created_at | Membership lookup |\n| membership | conversation_id, user_id, role, last_read_seq | Participants and receipts |\n| message | conversation_id, seq, message_id, sender_id, body, created_at | History by conversation ordered by seq |\n| device_session | user_id, device_id, connection_server, last_seen | Routing online messages |\n| receipt | conversation_id, user_id, delivered_seq, read_seq | Receipt aggregation |"
      },
      {
        "title": "High-Level Design",
        "body": "Clients maintain WebSocket connections to connection servers. Message service validates membership, assigns a per-conversation sequence number, durably stores the message, publishes an event, and fanout workers deliver to online connection servers plus push notifications for offline users."
      },
      {
        "title": "Deep Dives",
        "body": "### Ordering\n\n| Option | Pros | Cons |\n|---|---|---|\n| Global sequence | Simple total order | Single bottleneck and unnecessary coupling |\n| Per-conversation sequence | Natural ordering boundary | Needs shard/leader per conversation |\n| Client timestamps | Low server work | Clock skew and conflicts |\n\n### Connection management\n\n| Option | Pros | Cons |\n|---|---|---|\n| Sticky WebSocket server | Simple session state | Rebalancing harder |\n| External session registry | Any service can route | Registry must be fast and fresh |\n| Pub/sub per user | Flexible fanout | Channel explosion at huge scale |\n\n### Receipts and presence\n\nReceipts can be batched and stored as highest contiguous sequence per user. Presence should be eventually consistent with short TTLs; exact presence is expensive and often misleading."
      },
      {
        "title": "Bottlenecks & Scaling",
        "body": "- Long-lived connections require specialized connection fleet scaling and heartbeat tuning.\n- Large groups create fanout bursts; use per-group streams and lazy delivery for very large channels.\n- Search indexing should be asynchronous and respect retention/encryption policies.\n- Multi-device sync needs idempotent client message IDs and per-device cursors."
      },
      {
        "title": "Trade-offs & Alternatives",
        "body": "| Alternative | Benefit | Cost |\n|---|---|---|\n| Polling | Simple clients | Higher latency and wasted requests |\n| WebSockets | Real-time bidirectional | Connection fleet complexity |\n| Store-and-forward queue per user | Offline sync is natural | Queue count and retention management |\n| Conversation log | Ordered history is simple | Fanout still needed for devices |"
      },
      {
        "title": "What Great Answers Mention",
        "body": "- Durable write before sender ack.\n- Per-conversation ordering rather than global ordering.\n- Connection registry, heartbeats, and offline push path.\n- Idempotent sends using client_msg_id.\n- Privacy/encryption, retention, and abuse moderation trade-offs."
      }
    ],
    "diagrams": [
      {
        "title": "Real-time chat architecture",
        "nodes": [
          {
            "id": "client",
            "label": "Clients",
            "kind": "client",
            "col": 0,
            "row": 2
          },
          {
            "id": "gateway",
            "label": "API Gateway",
            "kind": "gateway",
            "col": 1,
            "row": 2
          },
          {
            "id": "lb",
            "label": "Load Balancer",
            "kind": "lb",
            "col": 2,
            "row": 2
          },
          {
            "id": "service",
            "label": "Message Service",
            "kind": "service",
            "col": 3,
            "row": 2,
            "detail": "The message service validates membership, assigns sequence numbers, and writes messages durably before acknowledging sends. It should be idempotent by client message ID."
          },
          {
            "id": "cache",
            "label": "Session Registry",
            "kind": "cache",
            "col": 4,
            "row": 1
          },
          {
            "id": "db",
            "label": "Message Store",
            "kind": "db",
            "col": 5,
            "row": 2,
            "detail": "The message store is partitioned by conversation_id and ordered by sequence. This supports efficient history pagination and replay to offline devices."
          },
          {
            "id": "async",
            "label": "Message Stream",
            "kind": "stream",
            "col": 4,
            "row": 4
          },
          {
            "id": "worker",
            "label": "Workers",
            "kind": "worker",
            "col": 5,
            "row": 4
          },
          {
            "id": "aux",
            "label": "Connection Servers",
            "kind": "service",
            "col": 6,
            "row": 1,
            "detail": "Connection servers hold WebSocket sessions and deliver events to online devices. They remain mostly stateless by storing routing metadata in a session registry."
          },
          {
            "id": "mon",
            "label": "Metrics + Alerts",
            "kind": "monitor",
            "col": 7,
            "row": 2
          }
        ],
        "edges": [
          {
            "from": "client",
            "to": "gateway",
            "label": "request"
          },
          {
            "from": "gateway",
            "to": "lb",
            "label": "route"
          },
          {
            "from": "lb",
            "to": "service",
            "label": "call"
          },
          {
            "from": "service",
            "to": "cache",
            "label": "hot"
          },
          {
            "from": "service",
            "to": "db",
            "label": "read/write"
          },
          {
            "from": "service",
            "to": "async",
            "label": "event"
          },
          {
            "from": "async",
            "to": "worker",
            "label": "consume"
          },
          {
            "from": "worker",
            "to": "aux",
            "label": "derive"
          },
          {
            "from": "service",
            "to": "aux",
            "label": "query"
          },
          {
            "from": "service",
            "to": "mon",
            "label": "slo"
          },
          {
            "from": "worker",
            "to": "mon",
            "label": "lag"
          }
        ]
      }
    ],
    "followUps": [
      {
        "q": "How do you maintain message order?",
        "a": "Assign a monotonic sequence per conversation at the server and paginate by that sequence."
      },
      {
        "q": "How do you handle duplicate sends?",
        "a": "Require client_msg_id and make create-message idempotent within a conversation/sender scope."
      },
      {
        "q": "How do offline users receive messages?",
        "a": "Store durable history and send push notifications; clients sync from last seen sequence when online."
      },
      {
        "q": "How should presence work?",
        "a": "Use heartbeat TTLs and eventual consistency; avoid treating presence as exact truth."
      },
      {
        "q": "How do large groups change the design?",
        "a": "Use stream-based fanout, batching, and sometimes lazy delivery rather than immediate per-user writes."
      },
      {
        "q": "Where do attachments go?",
        "a": "Object storage plus CDN; message rows contain metadata, checksums, and signed URLs."
      }
    ],
    "resources": [
      {
        "title": "System Design Primer",
        "url": "https://github.com/donnemartin/system-design-primer",
        "type": "repo"
      },
      {
        "title": "Designing Data-Intensive Applications",
        "url": "https://dataintensive.net",
        "type": "book"
      },
      {
        "title": "Hello Interview System Design",
        "url": "https://www.hellointerview.com/learn/system-design",
        "type": "course"
      },
      {
        "title": "Slack Flannel edge cache",
        "url": "https://slack.engineering/flannel-an-application-level-edge-cache-to-make-slack-scale/",
        "type": "article"
      },
      {
        "title": "WebSocket RFC",
        "url": "https://www.rfc-editor.org/rfc/rfc6455",
        "type": "paper"
      }
    ]
  },
  {
    "id": "video-streaming",
    "title": "Video Streaming (YouTube/Netflix)",
    "category": "Case Study",
    "difficulty": "Hard",
    "summary": "Design video upload, transcoding, metadata, recommendations-adjacent discovery, CDN distribution, and adaptive bitrate playback at global scale.",
    "tags": [
      "video",
      "cdn",
      "transcoding",
      "streaming",
      "object-storage"
    ],
    "sections": [
      {
        "title": "Clarify Requirements",
        "body": "**Functional requirements**\n- Upload videos, process them into multiple formats/resolutions, and stream to viewers.\n- Support metadata, thumbnails, captions, comments/likes, and basic search/discovery.\n- Provide adaptive bitrate playback and resumable uploads.\n- Enforce access control for private or paid content.\n\n**Non-functional requirements**\n- Playback start p95 under 2 seconds for cached content.\n- Extremely high availability for playback; upload processing may be eventual.\n- Minimize origin bandwidth using CDN and regional caches.\n- Preserve original assets and derived encodes durably."
      },
      {
        "title": "Capacity Estimation",
        "body": "Assume 20M DAU watch 30 minutes/day at 3 Mbps average.\n\n| Metric | Math | Result |\n|---|---|---:|\n| Watch seconds/day | 20M × 1,800 | 36B seconds |\n| Egress | 36B sec × 3 Mb/s | 108B Mb ≈ 13.5 PB/day |\n| Uploads | 100k/day × 1 GB | 100 TB/day originals |\n| Encoded variants | original × 4 | ~400 TB/day derived before retention |\n| Playback QPS | video segment requests every 4 sec | millions/day; CDN must absorb most |\n\nEgress dominates cost and architecture. CDN hit rate is more important than application server count."
      },
      {
        "title": "API Design",
        "body": "~~~http\nPOST /v1/videos/uploads\n{ \"filename\": \"demo.mp4\", \"size_bytes\": 1048576000 }\n-> { \"upload_url\": \"signed-url\", \"video_id\": \"v1\" }\n~~~\n\n~~~http\nGET /v1/videos/{video_id}/manifest\n-> HLS/DASH manifest with signed segment URLs\n~~~\n\n~~~http\nPATCH /v1/videos/{video_id}\n{ \"title\": \"...\", \"visibility\": \"public\" }\n~~~"
      },
      {
        "title": "Data Model",
        "body": "| Entity | Important fields | Notes |\n|---|---|---|\n| video | video_id, owner_id, title, visibility, status, created_at | Metadata source of truth |\n| asset | video_id, kind, codec, resolution, bitrate, storage_uri, checksum | Original and derived files |\n| transcode_job | job_id, video_id, target_profile, status, attempts | Worker orchestration |\n| playback_session | session_id, user_id, video_id, position, device | Analytics and resume |\n| access_policy | video_id, region, entitlement, drm_required | Playback authorization |"
      },
      {
        "title": "High-Level Design",
        "body": "Uploads go directly to object storage through signed URLs. A processing pipeline validates media, extracts metadata, creates thumbnails, transcodes adaptive bitrate variants, and publishes manifests. Playback requests fetch metadata/access decisions from services, but video segments should be served by CDN edge caches."
      },
      {
        "title": "Deep Dives",
        "body": "### Upload and transcoding\n\n| Option | Pros | Cons |\n|---|---|---|\n| Synchronous transcode | Simple state | Users wait too long |\n| Async job pipeline | Scalable and resilient | Needs job state, retries, and progress |\n| Server upload proxy | Full control | Application bandwidth bottleneck |\n| Direct-to-object upload | Scales cheaply | Requires signed URLs and validation |\n\n### Playback delivery\n\n| Option | Pros | Cons |\n|---|---|---|\n| Origin streaming | Simple | Origin bandwidth and latency explode |\n| CDN cached segments | Low latency and cost | Cache invalidation and regional rights |\n| Peer-assisted | Reduces egress | Client complexity and trust issues |\n\n### Adaptive bitrate\n\nUse HLS or MPEG-DASH manifests listing segment variants. Clients switch bitrate based on measured bandwidth and buffer health, improving quality without rebuffering."
      },
      {
        "title": "Bottlenecks & Scaling",
        "body": "- CDN miss storms for viral videos; pre-warm or tier cache popular content.\n- Transcoding fleet is expensive; prioritize popular formats and use autoscaled workers.\n- Metadata hot spots for viral videos; cache manifests and counters separately.\n- Rights and privacy changes require tokenized URLs and manifest access checks."
      },
      {
        "title": "Trade-offs & Alternatives",
        "body": "| Alternative | Benefit | Cost |\n|---|---|---|\n| Store only original | Lower storage | Transcode on demand is too slow for playback |\n| Transcode all profiles | Great device support | High compute and storage cost |\n| Just-in-time packaging | Flexible manifests | More request-time complexity |\n| DRM everywhere | Stronger protection | Device support and licensing complexity |"
      },
      {
        "title": "What Great Answers Mention",
        "body": "- Direct uploads, async transcode pipeline, and manifest publication.\n- CDN-first playback and adaptive bitrate streaming.\n- Object storage for blobs; DB for metadata.\n- Viral content cache strategy and origin protection.\n- Observability: startup time, rebuffer ratio, CDN hit rate, transcode lag."
      }
    ],
    "diagrams": [
      {
        "title": "Video streaming platform",
        "nodes": [
          {
            "id": "client",
            "label": "Clients",
            "kind": "client",
            "col": 0,
            "row": 2
          },
          {
            "id": "gateway",
            "label": "API Gateway",
            "kind": "gateway",
            "col": 1,
            "row": 2
          },
          {
            "id": "lb",
            "label": "Load Balancer",
            "kind": "lb",
            "col": 2,
            "row": 2
          },
          {
            "id": "service",
            "label": "Video Metadata API",
            "kind": "service",
            "col": 3,
            "row": 2,
            "detail": "The metadata API owns upload sessions, visibility, manifests, and access checks. It should keep playback authorization fast and avoid serving media bytes."
          },
          {
            "id": "cache",
            "label": "Manifest Cache",
            "kind": "cache",
            "col": 4,
            "row": 1
          },
          {
            "id": "db",
            "label": "Video Metadata DB",
            "kind": "db",
            "col": 5,
            "row": 2,
            "detail": "The metadata database tracks video state and asset pointers, not large video blobs. It coordinates publication only after required encodes and thumbnails exist."
          },
          {
            "id": "async",
            "label": "Transcode Queue",
            "kind": "queue",
            "col": 4,
            "row": 4
          },
          {
            "id": "worker",
            "label": "Workers",
            "kind": "worker",
            "col": 5,
            "row": 4
          },
          {
            "id": "aux",
            "label": "CDN + Object Storage",
            "kind": "cdn",
            "col": 6,
            "row": 1,
            "detail": "CDN and object storage serve segment files at scale. Signed URLs, cache-control, and regional policies keep delivery fast and controlled."
          },
          {
            "id": "mon",
            "label": "Metrics + Alerts",
            "kind": "monitor",
            "col": 7,
            "row": 2
          }
        ],
        "edges": [
          {
            "from": "client",
            "to": "gateway",
            "label": "request"
          },
          {
            "from": "gateway",
            "to": "lb",
            "label": "route"
          },
          {
            "from": "lb",
            "to": "service",
            "label": "call"
          },
          {
            "from": "service",
            "to": "cache",
            "label": "hot"
          },
          {
            "from": "service",
            "to": "db",
            "label": "read/write"
          },
          {
            "from": "service",
            "to": "async",
            "label": "event"
          },
          {
            "from": "async",
            "to": "worker",
            "label": "consume"
          },
          {
            "from": "worker",
            "to": "aux",
            "label": "derive"
          },
          {
            "from": "service",
            "to": "aux",
            "label": "query"
          },
          {
            "from": "service",
            "to": "mon",
            "label": "slo"
          },
          {
            "from": "worker",
            "to": "mon",
            "label": "lag"
          }
        ]
      }
    ],
    "followUps": [
      {
        "q": "Why not stream from application servers?",
        "a": "Video egress is enormous; CDN/object storage are built for high-bandwidth delivery and edge locality."
      },
      {
        "q": "How do resumable uploads work?",
        "a": "Split files into chunks with upload IDs, offsets, checksums, and final assembly validation."
      },
      {
        "q": "What is adaptive bitrate?",
        "a": "Clients choose among encoded variants segment by segment based on bandwidth and buffer health."
      },
      {
        "q": "How do you handle viral videos?",
        "a": "Pre-warm CDN tiers, cache manifests, throttle origin, and isolate hot metadata/counter paths."
      },
      {
        "q": "How do privacy changes affect cached content?",
        "a": "Use signed URLs/manifests with short TTLs and purge when necessary for high-risk changes."
      },
      {
        "q": "What metrics matter?",
        "a": "Startup time, rebuffer ratio, bitrate switches, CDN hit rate, transcode queue age, and origin egress."
      }
    ],
    "resources": [
      {
        "title": "System Design Primer",
        "url": "https://github.com/donnemartin/system-design-primer",
        "type": "repo"
      },
      {
        "title": "Designing Data-Intensive Applications",
        "url": "https://dataintensive.net",
        "type": "book"
      },
      {
        "title": "Hello Interview System Design",
        "url": "https://www.hellointerview.com/learn/system-design",
        "type": "course"
      },
      {
        "title": "Netflix Open Connect",
        "url": "https://openconnect.netflix.com/en/",
        "type": "article"
      },
      {
        "title": "MPEG-DASH overview",
        "url": "https://mpeg.chiariglione.org/standards/mpeg-dash",
        "type": "article"
      },
      {
        "title": "HLS authoring specification",
        "url": "https://developer.apple.com/documentation/http-live-streaming/hls-authoring-specification-for-apple-devices",
        "type": "article"
      }
    ]
  },
  {
    "id": "ride-sharing",
    "title": "Ride Sharing (Uber: Geo-indexing)",
    "category": "Case Study",
    "difficulty": "Hard",
    "summary": "Design rider-driver matching with real-time locations, geo-indexing, dispatch, trip state, pricing, and operational safety.",
    "tags": [
      "ride-sharing",
      "geo-index",
      "matching",
      "dispatch",
      "h3"
    ],
    "sections": [
      {
        "title": "Clarify Requirements",
        "body": "**Functional requirements**\n- Riders request trips with pickup/dropoff and receive nearby driver options/ETA.\n- Drivers publish location and accept/decline dispatches.\n- Track trip lifecycle: requested, matched, arrived, in-progress, completed, canceled.\n- Calculate fare estimates and support payment handoff.\n\n**Non-functional requirements**\n- Location updates and matching must be low latency, often under a few seconds.\n- Dispatch should avoid double-assigning drivers.\n- Availability varies by city; system should degrade locally, not globally.\n- Strong auditability for trip and payment events."
      },
      {
        "title": "Capacity Estimation",
        "body": "Assume 500k online drivers globally, each sends location every 5 seconds.\n\n| Metric | Math | Result |\n|---|---|---:|\n| Location update QPS | 500k / 5 | 100k/s |\n| Trips/day | 2M | ~20/s average, ~200/s peak |\n| Candidate lookup | 200 req/s × 100 drivers scanned | ~20k candidate reads/s peak |\n| Location payload | 100k/s × 200 B | ~20 MB/s stream |\n| Trip events | 2M × 10 events | 20M/day |\n\nLocation stream scale is much higher than trip creation scale, so keep hot location state separate from durable trip records."
      },
      {
        "title": "API Design",
        "body": "~~~http\nPOST /v1/drivers/location\n{ \"lat\": 37.78, \"lng\": -122.41, \"heading\": 80, \"ts\": \"2026-10-01T12:00:00Z\" }\n~~~\n\n~~~http\nPOST /v1/trips\n{ \"pickup\": {\"lat\": 37.78, \"lng\": -122.41}, \"dropoff\": {\"lat\": 37.62, \"lng\": -122.38} }\n~~~\n\n~~~http\nPOST /v1/trips/{trip_id}/accept\n{ \"driver_id\": \"d1\", \"dispatch_id\": \"x\" }\n~~~"
      },
      {
        "title": "Data Model",
        "body": "| Entity | Important fields | Notes |\n|---|---|---|\n| driver_location | driver_id, lat, lng, h3_cell, ts, availability | Hot in-memory geo index with TTL |\n| trip | trip_id, rider_id, driver_id, status, pickup, dropoff, fare_estimate | Durable state machine |\n| dispatch | dispatch_id, trip_id, driver_id, status, expires_at | Prevents double assignment |\n| city_config | city_id, pricing_rules, service_area, supply_thresholds | Cached config |\n| trip_event | trip_id, event_type, actor, ts, metadata | Audit and analytics |"
      },
      {
        "title": "High-Level Design",
        "body": "Driver apps stream locations to regional ingestion. A geo-index stores available drivers by cell. Rider requests call matching, which expands nearby cells, scores candidates by ETA and constraints, creates dispatch offers with short leases, and transitions the trip when a driver accepts."
      },
      {
        "title": "Deep Dives",
        "body": "### Geo-indexing\n\n| Option | Pros | Cons |\n|---|---|---|\n| Geohash | Simple prefix cells | Cell shapes vary by latitude and boundaries |\n| S2/H3 cells | Hierarchical and production-proven | Library and operational complexity |\n| R-tree in database | Good spatial queries | Harder for 100k/s volatile updates |\n| In-memory grid | Very fast | Needs replication and recovery strategy |\n\n### Matching\n\n| Option | Pros | Cons |\n|---|---|---|\n| Nearest driver | Simple and fast | Ignores acceptance likelihood and fairness |\n| ETA-based score | Better rider experience | Requires traffic/route estimates |\n| Marketplace optimizer | Balances supply/demand | Harder to explain and tune |\n\n### Dispatch consistency\n\nUse a short dispatch lease and conditional accept so a driver cannot be assigned to two trips. Expire offers quickly and try the next candidate list if declined or timed out."
      },
      {
        "title": "Bottlenecks & Scaling",
        "body": "- Location writes are extremely hot; store latest state in memory/cache and asynchronously archive samples.\n- Cell hotspots during events require city-level partitioning and surge capacity.\n- External maps/routing APIs can dominate latency; cache common routes and degrade gracefully.\n- Trip state transitions should be idempotent and auditable."
      },
      {
        "title": "Trade-offs & Alternatives",
        "body": "| Alternative | Benefit | Cost |\n|---|---|---|\n| Database spatial query only | Simpler correctness | Too slow for high-frequency updates |\n| Cache-only locations | Fast | Lost state on cache failure unless drivers refresh quickly |\n| Central global matcher | Unified optimization | High latency and blast radius |\n| Per-city matcher | Local isolation | Cross-city edge cases and config rollout |"
      },
      {
        "title": "What Great Answers Mention",
        "body": "- Separate hot ephemeral location state from durable trip state.\n- H3/S2/geohash cells and expanding-radius search.\n- Dispatch leases/conditional accept to avoid double matching.\n- ETA scoring, driver availability TTLs, and local city isolation.\n- Audit trail for safety, support, and payments."
      }
    ],
    "diagrams": [
      {
        "title": "Ride sharing dispatch",
        "nodes": [
          {
            "id": "client",
            "label": "Clients",
            "kind": "client",
            "col": 0,
            "row": 2
          },
          {
            "id": "gateway",
            "label": "API Gateway",
            "kind": "gateway",
            "col": 1,
            "row": 2
          },
          {
            "id": "lb",
            "label": "Load Balancer",
            "kind": "lb",
            "col": 2,
            "row": 2
          },
          {
            "id": "service",
            "label": "Matching Service",
            "kind": "service",
            "col": 3,
            "row": 2,
            "detail": "The matching service expands geo cells around the pickup, scores candidates, and creates dispatch leases. It must be idempotent because mobile clients retry often."
          },
          {
            "id": "cache",
            "label": "City Config Cache",
            "kind": "cache",
            "col": 4,
            "row": 1
          },
          {
            "id": "db",
            "label": "Trip DB",
            "kind": "db",
            "col": 5,
            "row": 2,
            "detail": "The trip database stores the durable state machine and audit events. Conditional transitions prevent invalid states such as accepting a canceled trip."
          },
          {
            "id": "async",
            "label": "Location Stream",
            "kind": "stream",
            "col": 4,
            "row": 4
          },
          {
            "id": "worker",
            "label": "Workers",
            "kind": "worker",
            "col": 5,
            "row": 4
          },
          {
            "id": "aux",
            "label": "Geo Index",
            "kind": "search",
            "col": 6,
            "row": 1,
            "detail": "The geo index keeps latest available driver positions by H3/S2 cell with short TTLs. It is optimized for fast nearby lookup rather than long-term history."
          },
          {
            "id": "mon",
            "label": "Metrics + Alerts",
            "kind": "monitor",
            "col": 7,
            "row": 2
          }
        ],
        "edges": [
          {
            "from": "client",
            "to": "gateway",
            "label": "request"
          },
          {
            "from": "gateway",
            "to": "lb",
            "label": "route"
          },
          {
            "from": "lb",
            "to": "service",
            "label": "call"
          },
          {
            "from": "service",
            "to": "cache",
            "label": "hot"
          },
          {
            "from": "service",
            "to": "db",
            "label": "read/write"
          },
          {
            "from": "service",
            "to": "async",
            "label": "event"
          },
          {
            "from": "async",
            "to": "worker",
            "label": "consume"
          },
          {
            "from": "worker",
            "to": "aux",
            "label": "derive"
          },
          {
            "from": "service",
            "to": "aux",
            "label": "query"
          },
          {
            "from": "service",
            "to": "mon",
            "label": "slo"
          },
          {
            "from": "worker",
            "to": "mon",
            "label": "lag"
          }
        ]
      }
    ],
    "followUps": [
      {
        "q": "Why not store every location update in the main DB?",
        "a": "The write rate is too high and most matching only needs latest position; archive asynchronously if needed."
      },
      {
        "q": "How do you avoid assigning one driver twice?",
        "a": "Use dispatch leases and conditional trip/driver state transitions."
      },
      {
        "q": "How do you find nearby drivers?",
        "a": "Index available drivers by geo cell, expand neighboring cells, then score by ETA and constraints."
      },
      {
        "q": "How do you handle stale driver locations?",
        "a": "Attach timestamps/TTLs and remove drivers that miss heartbeats or go unavailable."
      },
      {
        "q": "What if maps service is slow?",
        "a": "Use cached ETA approximations, fallback distance scoring, and circuit breakers."
      },
      {
        "q": "What is city isolation?",
        "a": "Partition config, matching, and capacity by city/region so local surges or outages do not affect all markets."
      }
    ],
    "resources": [
      {
        "title": "System Design Primer",
        "url": "https://github.com/donnemartin/system-design-primer",
        "type": "repo"
      },
      {
        "title": "Designing Data-Intensive Applications",
        "url": "https://dataintensive.net",
        "type": "book"
      },
      {
        "title": "Hello Interview System Design",
        "url": "https://www.hellointerview.com/learn/system-design",
        "type": "course"
      },
      {
        "title": "Uber H3",
        "url": "https://www.uber.com/blog/h3/",
        "type": "article"
      },
      {
        "title": "S2 Geometry",
        "url": "https://s2geometry.io/",
        "type": "article"
      },
      {
        "title": "Google S2 library",
        "url": "https://github.com/google/s2geometry",
        "type": "repo"
      }
    ]
  },
  {
    "id": "search-autocomplete",
    "title": "Search Autocomplete (Typeahead)",
    "category": "Case Study",
    "difficulty": "Medium",
    "summary": "Design low-latency prefix suggestions using tries or search indexes, popularity ranking, personalization, and incremental index updates.",
    "tags": [
      "autocomplete",
      "typeahead",
      "trie",
      "search",
      "ranking"
    ],
    "sections": [
      {
        "title": "Clarify Requirements",
        "body": "**Functional requirements**\n- Return top suggestions for a typed prefix within a locale/language.\n- Rank by popularity, recency, personalization, and business rules.\n- Ingest new queries/documents and update suggestions periodically or near real time.\n- Filter unsafe, private, or low-quality suggestions.\n\n**Non-functional requirements**\n- p95 latency below 50 ms from service cache for common prefixes.\n- Very high read volume; writes can be asynchronous.\n- Results should be stable enough to avoid UI flicker while typing.\n- Support regional/language indexes."
      },
      {
        "title": "Capacity Estimation",
        "body": "Assume 100M search sessions/day and 5 autocomplete calls/session.\n\n| Metric | Math | Result |\n|---|---|---:|\n| Suggest requests/day | 100M × 5 | 500M/day |\n| Average QPS | 500M / 100k sec | ~5k/s |\n| Peak QPS | 5k/s × 10 | ~50k/s |\n| Popular queries | 10M strings × 100 B | ~1 GB raw |\n| Prefix cache | top 1M prefixes × 10 suggestions | feasible in memory |\n\nPrefix length distribution matters; one-letter prefixes are extremely hot and should be cached or precomputed."
      },
      {
        "title": "API Design",
        "body": "~~~http\nGET /v1/suggest?q=mach&locale=en-US&limit=10&cursor=optional\n~~~\n\nResponse:\n\n~~~json\n{ \"suggestions\": [ { \"text\": \"machine learning\", \"score\": 0.98 } ] }\n~~~\n\nInternal ingestion:\n\n~~~http\nPOST /v1/suggest/events\n{ \"query\": \"machine learning\", \"user_region\": \"US\", \"clicked\": true }\n~~~"
      },
      {
        "title": "Data Model",
        "body": "| Entity | Important fields | Notes |\n|---|---|---|\n| suggestion | text, locale, normalized_text, global_score, safety_status | Source candidates |\n| prefix_posting | prefix, locale, top_suggestions | Precomputed serving table |\n| query_event | query, user_id_hash, ts, clicked, region | Ranking signals stream |\n| user_profile | user_id, interests, recent_queries | Optional personalization |\n| blocklist | term, locale, reason | Safety filter |"
      },
      {
        "title": "High-Level Design",
        "body": "Clients call a suggestion service on each keystroke with debouncing. The service checks an in-memory prefix cache, then a search/trie serving index, applies lightweight personalization and safety filters, and returns top results. Offline jobs aggregate query logs and rebuild prefix indexes; near-real-time updates handle trending terms."
      },
      {
        "title": "Deep Dives",
        "body": "### Serving structure\n\n| Option | Pros | Cons |\n|---|---|---|\n| Trie with top-k at nodes | Very fast prefix lookup | Memory-heavy and rebuild complexity |\n| Search index completion suggester | Mature ranking/filtering | Operational dependency and tuning |\n| Precomputed prefix table | Simple and cacheable | Storage grows with prefixes; less flexible |\n\n### Ranking\n\n| Option | Pros | Cons |\n|---|---|---|\n| Frequency only | Simple and stable | Slow to adapt and can surface spam |\n| Time-decayed popularity | Captures trends | More noisy |\n| Personalized rerank | Better relevance | Privacy and latency concerns |\n\n### Updates\n\nBatch rebuilds are safe and deterministic. Streaming deltas reduce freshness lag for trends but require merge logic and rollback if spam slips through."
      },
      {
        "title": "Bottlenecks & Scaling",
        "body": "- Hot prefixes like \"a\" or \"t\" need edge/in-memory caching.\n- Unicode normalization, tokenization, and locale-specific sorting are easy to underestimate.\n- Safety filters must run before serving and again during index build.\n- Ranking features should be bounded so a malicious spike does not immediately dominate suggestions."
      },
      {
        "title": "Trade-offs & Alternatives",
        "body": "| Alternative | Benefit | Cost |\n|---|---|---|\n| Global index | Simple operations | Poor localization |\n| Per-locale index | Better language relevance | More indexes to build and deploy |\n| Client-side suggestions | Zero network latency for small dictionaries | Hard updates and personalization |\n| Server-side suggestions | Fresh and controlled | Requires very low latency infrastructure |"
      },
      {
        "title": "What Great Answers Mention",
        "body": "- Debouncing and caching for keystroke-heavy UI.\n- Trie/search/precomputed prefix trade-offs.\n- Top-k precomputation at prefix nodes.\n- Safety, spam, normalization, and locale handling.\n- Freshness strategy: batch rebuild plus streaming hot updates."
      }
    ],
    "diagrams": [
      {
        "title": "Autocomplete serving path",
        "nodes": [
          {
            "id": "client",
            "label": "Clients",
            "kind": "client",
            "col": 0,
            "row": 2
          },
          {
            "id": "gateway",
            "label": "API Gateway",
            "kind": "gateway",
            "col": 1,
            "row": 2
          },
          {
            "id": "lb",
            "label": "Load Balancer",
            "kind": "lb",
            "col": 2,
            "row": 2
          },
          {
            "id": "service",
            "label": "Suggest Service",
            "kind": "service",
            "col": 3,
            "row": 2,
            "detail": "The suggest service serves a small bounded request on every keystroke. It must keep ranking and personalization lightweight enough to meet very low latency targets."
          },
          {
            "id": "cache",
            "label": "Hot Prefix Cache",
            "kind": "cache",
            "col": 4,
            "row": 1
          },
          {
            "id": "db",
            "label": "Prefix Index Store",
            "kind": "db",
            "col": 5,
            "row": 2,
            "detail": "The prefix index stores precomputed top suggestions by normalized prefix and locale. It can be rebuilt offline and atomically swapped for safe deployments."
          },
          {
            "id": "async",
            "label": "Query Event Stream",
            "kind": "stream",
            "col": 4,
            "row": 4
          },
          {
            "id": "worker",
            "label": "Workers",
            "kind": "worker",
            "col": 5,
            "row": 4
          },
          {
            "id": "aux",
            "label": "Search/Trie Index",
            "kind": "search",
            "col": 6,
            "row": 1,
            "detail": "The search/trie index provides prefix lookup and filters. Hot prefixes are cached because they account for a large share of traffic."
          },
          {
            "id": "mon",
            "label": "Metrics + Alerts",
            "kind": "monitor",
            "col": 7,
            "row": 2
          }
        ],
        "edges": [
          {
            "from": "client",
            "to": "gateway",
            "label": "request"
          },
          {
            "from": "gateway",
            "to": "lb",
            "label": "route"
          },
          {
            "from": "lb",
            "to": "service",
            "label": "call"
          },
          {
            "from": "service",
            "to": "cache",
            "label": "hot"
          },
          {
            "from": "service",
            "to": "db",
            "label": "read/write"
          },
          {
            "from": "service",
            "to": "async",
            "label": "event"
          },
          {
            "from": "async",
            "to": "worker",
            "label": "consume"
          },
          {
            "from": "worker",
            "to": "aux",
            "label": "derive"
          },
          {
            "from": "service",
            "to": "aux",
            "label": "query"
          },
          {
            "from": "service",
            "to": "mon",
            "label": "slo"
          },
          {
            "from": "worker",
            "to": "mon",
            "label": "lag"
          }
        ]
      }
    ],
    "followUps": [
      {
        "q": "Why not query the full search system on every keystroke?",
        "a": "Autocomplete has stricter latency and smaller result needs; precomputed prefix indexes are faster and cheaper."
      },
      {
        "q": "How do you handle one-letter prefixes?",
        "a": "Precompute and cache heavily, possibly serving from edge or client for common locales."
      },
      {
        "q": "How do you rank suggestions?",
        "a": "Blend popularity, recency, locale, safety, and optional personalization with stable tie-breaking."
      },
      {
        "q": "How do you prevent offensive suggestions?",
        "a": "Use blocklists/classifiers during ingestion and serving, with emergency purge capability."
      },
      {
        "q": "How do updates become visible?",
        "a": "Batch rebuild daily/hourly plus streaming deltas for trending terms."
      },
      {
        "q": "How do you paginate suggestions?",
        "a": "Usually top 10 is enough; if needed use cursor by score/text tie-breaker, not offset."
      }
    ],
    "resources": [
      {
        "title": "System Design Primer",
        "url": "https://github.com/donnemartin/system-design-primer",
        "type": "repo"
      },
      {
        "title": "Designing Data-Intensive Applications",
        "url": "https://dataintensive.net",
        "type": "book"
      },
      {
        "title": "Hello Interview System Design",
        "url": "https://www.hellointerview.com/learn/system-design",
        "type": "course"
      },
      {
        "title": "Elasticsearch completion suggester",
        "url": "https://www.elastic.co/guide/en/elasticsearch/reference/current/search-suggesters.html#completion-suggester",
        "type": "article"
      },
      {
        "title": "Lucene suggesters",
        "url": "https://lucene.apache.org/core/9_0_0/suggest/index.html",
        "type": "article"
      }
    ]
  },
  {
    "id": "distributed-message-queue",
    "title": "Distributed Message Queue (Kafka-like)",
    "category": "Case Study",
    "difficulty": "Hard",
    "summary": "Design a partitioned, replicated append log that supports producers, consumer groups, retention, replay, ordering, and high-throughput delivery.",
    "tags": [
      "kafka",
      "message-queue",
      "log",
      "partition",
      "consumer-group"
    ],
    "sections": [
      {
        "title": "Clarify Requirements",
        "body": "**Functional requirements**\n- Producers publish messages to topics; consumers read by topic and consumer group.\n- Preserve order within a partition and support replay from offsets.\n- Retain messages by time or size independent of consumption.\n- Support acknowledgements, offset commits, and partition rebalancing.\n\n**Non-functional requirements**\n- High throughput: hundreds of thousands to millions of messages/sec.\n- Durable replication with leader failover.\n- p99 produce latency in tens of milliseconds when acks are satisfied.\n- Backpressure rather than silent data loss."
      },
      {
        "title": "Capacity Estimation",
        "body": "Assume 500k messages/sec peak, average 1 KB payload, replication factor 3, retention 7 days.\n\n| Metric | Math | Result |\n|---|---|---:|\n| Ingress bandwidth | 500k/s × 1 KB | ~500 MB/s |\n| Replicated write | 500 MB/s × 3 | ~1.5 GB/s cluster write |\n| Raw daily data | 500 MB/s × 86,400 | ~43 TB/day at peak |\n| 7-day replicated | 43 TB × 7 × 3 | ~900 TB worst-case |\n| Partitions | 500k/s / 5k per partition | ~100 hot partitions minimum |\n\nReal sizing uses sustained average plus peak headroom, compression ratio, and per-topic retention."
      },
      {
        "title": "API Design",
        "body": "~~~http\nPOST /v1/topics/orders/messages\n{ \"key\": \"customer_123\", \"value\": \"base64\", \"headers\": {\"event_id\":\"e1\"} }\n~~~\n\n~~~http\nGET /v1/topics/orders/partitions/3/messages?offset=184220&max_bytes=1048576\n~~~\n\n~~~http\nPOST /v1/consumer-groups/payments/offsets\n{ \"topic\": \"orders\", \"partition\": 3, \"offset\": 184300 }\n~~~"
      },
      {
        "title": "Data Model",
        "body": "| Entity | Important fields | Notes |\n|---|---|---|\n| topic | name, partition_count, retention, config | Control plane metadata |\n| partition | topic, partition_id, leader, replicas, ISR | Ordering and replication unit |\n| segment | base_offset, file_uri/path, size, created_at | Append-only log files |\n| consumer_offset | group_id, topic, partition, committed_offset | Consumer progress |\n| producer_state | producer_id, sequence, epoch | Idempotent producer support |"
      },
      {
        "title": "High-Level Design",
        "body": "Producers route messages by key to partition leaders. Leaders append to local log segments, replicate to followers, and acknowledge based on required acks. Consumers fetch batches from partition leaders and commit offsets. A controller manages metadata, leader elections, and consumer group rebalances."
      },
      {
        "title": "Deep Dives",
        "body": "### Partitioning and ordering\n\n| Option | Pros | Cons |\n|---|---|---|\n| Key hash partitioning | Preserves per-key order | Hot keys create hot partitions |\n| Round-robin | Balances throughput | No per-key ordering |\n| Custom partitioner | Business-aware | Operational surprises if poorly designed |\n\n### Replication acknowledgements\n\n| Option | Pros | Cons |\n|---|---|---|\n| ack=0 | Lowest latency | Producer may lose messages |\n| ack=leader | Fast | Leader crash can lose unreplicated data |\n| ack=all ISR | Stronger durability | Higher latency and reduced availability |\n\n### Consumer groups\n\nEach partition is consumed by at most one member in a group at a time. Rebalancing must pause/reassign partitions carefully to avoid duplicate processing surprises."
      },
      {
        "title": "Bottlenecks & Scaling",
        "body": "- Disk IO and page cache are central; sequential append is efficient, random indexes are not.\n- Too many partitions increase metadata, file handles, and recovery time.\n- Slow followers shrink the in-sync replica set or increase producer latency.\n- Consumers must handle duplicates after rebalance or retry; idempotent sinks are still necessary."
      },
      {
        "title": "Trade-offs & Alternatives",
        "body": "| Alternative | Benefit | Cost |\n|---|---|---|\n| Traditional work queue | Simpler jobs | Limited replay and fanout |\n| Kafka-like log | Replay and many consumers | More operations and storage management |\n| Cloud pub/sub | Managed scale | Less control over ordering/cost semantics |\n| Database outbox only | Strong local transaction | Not a general high-throughput broker |"
      },
      {
        "title": "What Great Answers Mention",
        "body": "- Partition as the unit of ordering, parallelism, and replication.\n- Append-only segments, retention, compaction, and page cache.\n- Consumer group offsets and rebalancing.\n- Producer idempotence and exactly-once effect boundaries.\n- Backpressure, quotas, and observability for lag and ISR health."
      }
    ],
    "diagrams": [
      {
        "title": "Kafka-like broker cluster",
        "nodes": [
          {
            "id": "client",
            "label": "Clients",
            "kind": "client",
            "col": 0,
            "row": 2
          },
          {
            "id": "gateway",
            "label": "API Gateway",
            "kind": "gateway",
            "col": 1,
            "row": 2
          },
          {
            "id": "lb",
            "label": "Load Balancer",
            "kind": "lb",
            "col": 2,
            "row": 2
          },
          {
            "id": "service",
            "label": "Broker Leader",
            "kind": "service",
            "col": 3,
            "row": 2,
            "detail": "The leader broker appends records for its partitions and serves producers/consumers. It batches disk writes and network sends for throughput."
          },
          {
            "id": "cache",
            "label": "Page Cache",
            "kind": "cache",
            "col": 4,
            "row": 1
          },
          {
            "id": "db",
            "label": "Metadata Store",
            "kind": "db",
            "col": 5,
            "row": 2,
            "detail": "The metadata store tracks topics, partitions, leaders, replicas, and consumer group assignments. It must be strongly consistent because wrong metadata can split ownership."
          },
          {
            "id": "async",
            "label": "Replication Stream",
            "kind": "stream",
            "col": 4,
            "row": 4
          },
          {
            "id": "worker",
            "label": "Workers",
            "kind": "worker",
            "col": 5,
            "row": 4
          },
          {
            "id": "aux",
            "label": "Segment Storage",
            "kind": "storage",
            "col": 6,
            "row": 1,
            "detail": "Segment storage is append-only and retained by time or size. Sequential IO and OS page cache make high throughput possible."
          },
          {
            "id": "mon",
            "label": "Metrics + Alerts",
            "kind": "monitor",
            "col": 7,
            "row": 2
          }
        ],
        "edges": [
          {
            "from": "client",
            "to": "gateway",
            "label": "request"
          },
          {
            "from": "gateway",
            "to": "lb",
            "label": "route"
          },
          {
            "from": "lb",
            "to": "service",
            "label": "call"
          },
          {
            "from": "service",
            "to": "cache",
            "label": "hot"
          },
          {
            "from": "service",
            "to": "db",
            "label": "read/write"
          },
          {
            "from": "service",
            "to": "async",
            "label": "event"
          },
          {
            "from": "async",
            "to": "worker",
            "label": "consume"
          },
          {
            "from": "worker",
            "to": "aux",
            "label": "derive"
          },
          {
            "from": "service",
            "to": "aux",
            "label": "query"
          },
          {
            "from": "service",
            "to": "mon",
            "label": "slo"
          },
          {
            "from": "worker",
            "to": "mon",
            "label": "lag"
          }
        ]
      }
    ],
    "followUps": [
      {
        "q": "Why partition topics?",
        "a": "Partitions provide parallelism and define the scope of ordering and leader ownership."
      },
      {
        "q": "How does a consumer group scale?",
        "a": "Different members own different partitions; adding members helps until members exceed partition count."
      },
      {
        "q": "What is ISR?",
        "a": "The in-sync replica set: followers caught up enough to be eligible for durable acknowledgements and leader election."
      },
      {
        "q": "How do you support replay?",
        "a": "Retain log segments independent of consumption and let consumers fetch from stored offsets."
      },
      {
        "q": "What causes duplicates?",
        "a": "Retries, producer ambiguity, consumer crashes before/after offset commit, and rebalances."
      },
      {
        "q": "How do you handle poison messages?",
        "a": "Consumers can skip after policy, route to dead-letter topics, and alert for manual replay."
      }
    ],
    "resources": [
      {
        "title": "System Design Primer",
        "url": "https://github.com/donnemartin/system-design-primer",
        "type": "repo"
      },
      {
        "title": "Designing Data-Intensive Applications",
        "url": "https://dataintensive.net",
        "type": "book"
      },
      {
        "title": "Hello Interview System Design",
        "url": "https://www.hellointerview.com/learn/system-design",
        "type": "course"
      },
      {
        "title": "Kafka paper",
        "url": "https://www.microsoft.com/en-us/research/publication/kafka-a-distributed-messaging-system-for-log-processing/",
        "type": "paper"
      },
      {
        "title": "Kafka documentation",
        "url": "https://kafka.apache.org/documentation/",
        "type": "article"
      }
    ]
  },
  {
    "id": "payment-system",
    "title": "Payment System",
    "category": "Case Study",
    "difficulty": "Hard",
    "summary": "Design a fintech-grade payment flow with idempotency, authorization/capture, double-entry ledgers, reconciliation, risk checks, and auditability.",
    "tags": [
      "payments",
      "idempotency",
      "ledger",
      "fintech",
      "reconciliation"
    ],
    "sections": [
      {
        "title": "Clarify Requirements",
        "body": "**Functional requirements**\n- Create payments, authorize/capture/refund/void, and expose status.\n- Ensure retries do not double-charge customers.\n- Maintain an immutable ledger of money movement.\n- Integrate with payment processors/banks and reconcile settlements.\n\n**Non-functional requirements**\n- Correctness and auditability are more important than low latency.\n- Every external side effect must be idempotent or compensatable.\n- Ledger entries must balance and be immutable.\n- Sensitive data must be tokenized and access-controlled."
      },
      {
        "title": "Capacity Estimation",
        "body": "Assume 10M payment attempts/day and peak 10x average.\n\n| Metric | Math | Result |\n|---|---|---:|\n| Average attempts | 10M / 100k sec | ~100/s |\n| Peak attempts | 100/s × 10 | ~1k/s |\n| Ledger rows | 10M × 2 minimum | 20M/day |\n| Ledger storage | 20M × 1 KB | ~20 GB/day raw |\n| Idempotency keys | 10M/day × 24h retention | modest but latency-critical |\n\nThroughput is often less challenging than correctness, reconciliation, and external processor behavior."
      },
      {
        "title": "API Design",
        "body": "~~~http\nPOST /v1/payments\nIdempotency-Key: merchant_7:cart_99:attempt_1\n{\n  \"amount_cents\": 2599,\n  \"currency\": \"USD\",\n  \"payment_method_token\": \"pm_tok\",\n  \"capture\": true\n}\n~~~\n\n~~~http\nPOST /v1/payments/{payment_id}/refunds\nIdempotency-Key: refund_abc\n{ \"amount_cents\": 2599 }\n~~~\n\n~~~http\nGET /v1/payments/{payment_id}\n~~~"
      },
      {
        "title": "Data Model",
        "body": "| Entity | Important fields | Notes |\n|---|---|---|\n| payment | payment_id, merchant_id, amount, currency, status, processor_ref | State machine |\n| idempotency_record | merchant_id, key, request_hash, response, status, expires_at | Retry safety |\n| ledger_entry | entry_id, transaction_id, account_id, debit, credit, currency, created_at | Immutable double-entry rows |\n| account | account_id, owner_type, currency, balance_cache | Balance derived from ledger |\n| processor_event | processor, event_id, payload_hash, received_at, processed_status | Webhook dedupe |\n| reconciliation_item | settlement_id, processor_ref, expected, actual, status | Daily settlement matching |"
      },
      {
        "title": "High-Level Design",
        "body": "The payment API first checks idempotency, validates merchant and risk rules, creates a payment state, calls the processor with a provider idempotency key, records the result, and writes balanced ledger entries in a transaction. Webhooks and settlement files update state through idempotent event handlers."
      },
      {
        "title": "Deep Dives",
        "body": "### Idempotency\n\n| Option | Pros | Cons |\n|---|---|---|\n| Client-generated key | Retries are safe across network failures | Clients must scope keys correctly |\n| Server-generated attempt ID | Easier server control | Client may not know if creation succeeded |\n| Request hash validation | Prevents key reuse for different payment | Requires storing response and hash |\n\n### Ledger model\n\n| Option | Pros | Cons |\n|---|---|---|\n| Mutable balance only | Simple reads | Poor auditability and hard reconciliation |\n| Append-only double-entry ledger | Auditable and balanced | More rows and balance materialization |\n| Event-sourced payments | Full history | Requires projections for queries |\n\n### External processors\n\nExternal calls have ambiguous outcomes. Treat timeouts as unknown, poll or wait for webhooks, and never blindly retry without idempotency keys."
      },
      {
        "title": "Bottlenecks & Scaling",
        "body": "- Processor outages require queued retries and clear unknown states.\n- Ledger writes should be strongly consistent and ideally scoped to one database transaction.\n- Webhooks arrive out of order and more than once; dedupe by processor event ID.\n- Reconciliation is a first-class batch workflow comparing internal ledger to processor settlements."
      },
      {
        "title": "Trade-offs & Alternatives",
        "body": "| Alternative | Benefit | Cost |\n|---|---|---|\n| Synchronous processor-only state | Faster build | Weak audit and recovery |\n| Internal ledger source of truth | Strong accounting | More complex domain model |\n| Saga for payment flow | Handles multi-step processes | Requires compensations and state machine |\n| Two-phase commit with processor | Not available in practice | External systems do not share transactions |"
      },
      {
        "title": "What Great Answers Mention",
        "body": "- Idempotency at API, processor, and webhook boundaries.\n- Payment state machine with unknown/pending states.\n- Immutable balanced ledger, not just payment rows.\n- Reconciliation and audit trails.\n- Risk/fraud checks, tokenization, PCI boundaries, and least-privilege access."
      }
    ],
    "diagrams": [
      {
        "title": "Payment processing with ledger",
        "nodes": [
          {
            "id": "client",
            "label": "Clients",
            "kind": "client",
            "col": 0,
            "row": 2
          },
          {
            "id": "gateway",
            "label": "API Gateway",
            "kind": "gateway",
            "col": 1,
            "row": 2
          },
          {
            "id": "lb",
            "label": "Load Balancer",
            "kind": "lb",
            "col": 2,
            "row": 2
          },
          {
            "id": "service",
            "label": "Payment Service",
            "kind": "service",
            "col": 3,
            "row": 2,
            "detail": "The payment service owns the state machine and coordinates idempotency, risk checks, processor calls, and ledger writes. It must treat network timeouts as unknown outcomes."
          },
          {
            "id": "cache",
            "label": "Idempotency Cache",
            "kind": "cache",
            "col": 4,
            "row": 1
          },
          {
            "id": "db",
            "label": "Payment + Ledger DB",
            "kind": "db",
            "col": 5,
            "row": 2,
            "detail": "The database stores idempotency records, payment state, and immutable ledger entries. Ledger writes should balance debits and credits in the same transaction."
          },
          {
            "id": "async",
            "label": "Outbox / Webhook Stream",
            "kind": "stream",
            "col": 4,
            "row": 4
          },
          {
            "id": "worker",
            "label": "Workers",
            "kind": "worker",
            "col": 5,
            "row": 4
          },
          {
            "id": "aux",
            "label": "Processor / Bank",
            "kind": "external",
            "col": 6,
            "row": 1,
            "detail": "External processors authorize, capture, refund, and later send webhooks or settlement files. They are not transaction participants, so integration must be idempotent and reconciled."
          },
          {
            "id": "mon",
            "label": "Metrics + Alerts",
            "kind": "monitor",
            "col": 7,
            "row": 2
          }
        ],
        "edges": [
          {
            "from": "client",
            "to": "gateway",
            "label": "request"
          },
          {
            "from": "gateway",
            "to": "lb",
            "label": "route"
          },
          {
            "from": "lb",
            "to": "service",
            "label": "call"
          },
          {
            "from": "service",
            "to": "cache",
            "label": "hot"
          },
          {
            "from": "service",
            "to": "db",
            "label": "read/write"
          },
          {
            "from": "service",
            "to": "async",
            "label": "event"
          },
          {
            "from": "async",
            "to": "worker",
            "label": "consume"
          },
          {
            "from": "worker",
            "to": "aux",
            "label": "derive"
          },
          {
            "from": "service",
            "to": "aux",
            "label": "query"
          },
          {
            "from": "service",
            "to": "mon",
            "label": "slo"
          },
          {
            "from": "worker",
            "to": "mon",
            "label": "lag"
          }
        ]
      }
    ],
    "followUps": [
      {
        "q": "How do you prevent double charges?",
        "a": "Require idempotency keys, store request hash/response, and pass provider idempotency keys on external calls."
      },
      {
        "q": "Why use double-entry ledger?",
        "a": "Every money movement has balanced debit/credit entries, giving auditability and easier reconciliation."
      },
      {
        "q": "What if the processor times out?",
        "a": "Mark payment pending/unknown, poll or wait for webhook, and avoid unsafe duplicate capture."
      },
      {
        "q": "How do webhooks behave?",
        "a": "They can be duplicated or out of order; dedupe by event ID and apply state transitions idempotently."
      },
      {
        "q": "How do refunds work?",
        "a": "Create a new idempotent refund transaction and ledger entries rather than mutating the original payment history."
      },
      {
        "q": "What is reconciliation?",
        "a": "Comparing internal ledger/payment records against processor settlement reports and resolving mismatches."
      }
    ],
    "resources": [
      {
        "title": "System Design Primer",
        "url": "https://github.com/donnemartin/system-design-primer",
        "type": "repo"
      },
      {
        "title": "Designing Data-Intensive Applications",
        "url": "https://dataintensive.net",
        "type": "book"
      },
      {
        "title": "Hello Interview System Design",
        "url": "https://www.hellointerview.com/learn/system-design",
        "type": "course"
      },
      {
        "title": "Stripe idempotent requests",
        "url": "https://stripe.com/docs/idempotency",
        "type": "article"
      },
      {
        "title": "Modern Treasury accounting for developers",
        "url": "https://www.moderntreasury.com/journal/accounting-for-developers-part-i",
        "type": "article"
      },
      {
        "title": "Stripe webhooks",
        "url": "https://stripe.com/docs/webhooks",
        "type": "article"
      }
    ]
  },
  {
    "id": "metrics-logging-monitoring-platform",
    "title": "Metrics/Logging & Monitoring Platform",
    "category": "Case Study",
    "difficulty": "Hard",
    "summary": "Design an observability platform that ingests metrics, logs, and traces, stores them cost-effectively, powers dashboards, and alerts reliably.",
    "tags": [
      "observability",
      "metrics",
      "logs",
      "traces",
      "alerting"
    ],
    "sections": [
      {
        "title": "Clarify Requirements",
        "body": "**Functional requirements**\n- Ingest metrics, logs, and traces from services and infrastructure.\n- Query recent data for dashboards and search logs by labels/text.\n- Evaluate alert rules and notify on-call systems.\n- Support retention tiers, sampling, and tenant isolation.\n\n**Non-functional requirements**\n- Very high write throughput with controlled cost.\n- Alerting should be reliable and timely even when query traffic spikes.\n- Queries should not starve ingestion.\n- Data loss should be visible; exact retention depends on signal type."
      },
      {
        "title": "Capacity Estimation",
        "body": "Assume 10k hosts emit 100 metrics every 10 seconds plus logs.\n\n| Metric | Math | Result |\n|---|---|---:|\n| Metric samples/sec | 10k × 100 / 10 | 100k/s |\n| Metric bytes/day | 100k/s × 100 B × 86,400 | ~864 GB/day raw |\n| Logs/day | 20 TB/day | Given by application volume |\n| Replicated hot storage | (0.9 TB + 20 TB) × 3 | ~63 TB/day before compression |\n| Alert evaluations | 10k rules/min | ~167 rule eval/s |\n\nCardinality, not just sample count, drives cost. A metric label containing user_id can explode storage."
      },
      {
        "title": "API Design",
        "body": "~~~http\nPOST /v1/metrics/write\n[{ \"name\": \"http_requests_total\", \"labels\": {\"service\":\"api\"}, \"ts\": 1790850000, \"value\": 1 }]\n~~~\n\n~~~http\nPOST /v1/logs/write\n{ \"service\": \"api\", \"level\": \"error\", \"message\": \"...\", \"trace_id\": \"abc\" }\n~~~\n\n~~~http\nGET /v1/query?expr=rate(http_requests_total[5m])\n~~~"
      },
      {
        "title": "Data Model",
        "body": "| Entity | Important fields | Notes |\n|---|---|---|\n| metric_sample | metric, labels_hash, ts, value | Time-series blocks/chunks |\n| series_index | labels, series_id, tenant, retention | High-cardinality control |\n| log_record | tenant, ts, service, level, trace_id, message, attrs | Indexed by time and labels |\n| trace_span | trace_id, span_id, parent_id, service, duration | Sampled traces |\n| alert_rule | tenant, expr, threshold, duration, route | Evaluated separately from ad-hoc queries |"
      },
      {
        "title": "High-Level Design",
        "body": "Agents batch and compress telemetry to regional collectors. Collectors validate tenant quotas, write to a durable ingest stream, and processors build time-series blocks, log indexes, and trace stores. Query frontends read recent hot storage and older object storage. Alert evaluators run isolated from user dashboards and send notifications through an incident channel."
      },
      {
        "title": "Deep Dives",
        "body": "### Ingestion path\n\n| Option | Pros | Cons |\n|---|---|---|\n| Direct writes to storage | Simple | Backpressure and retries hit clients |\n| Durable ingest stream | Buffers bursts and replays | Adds lag and broker operations |\n| Edge aggregation | Reduces volume | Loses raw granularity |\n\n### Storage model\n\n| Option | Pros | Cons |\n|---|---|---|\n| Time-series chunks | Efficient metrics range queries | Label cardinality issues |\n| Inverted log index | Fast text/label search | Expensive for verbose logs |\n| Object storage blocks | Cheap retention | Higher query latency |\n\n### Alerting\n\nAlerting should use precomputed or bounded queries, have rule ownership, dedupe notifications, and avoid depending on the same overloaded dashboard path."
      },
      {
        "title": "Bottlenecks & Scaling",
        "body": "- Label cardinality can bankrupt storage; enforce quotas and drop/aggregate bad labels.\n- Query fanout over long time ranges is expensive; use downsampling and block pruning.\n- Ingestion backpressure needs clear drop policies for debug logs versus critical metrics.\n- Multi-tenant noisy neighbors require per-tenant limits for ingest, query, and alerting."
      },
      {
        "title": "Trade-offs & Alternatives",
        "body": "| Alternative | Benefit | Cost |\n|---|---|---|\n| Pull metrics | Service discovery and backpressure control | Hard through firewalls/mobile |\n| Push metrics | Works for ephemeral clients | Gateway must handle abuse |\n| Store raw logs forever | Maximum forensic power | Very high cost |\n| Sample/aggregate | Lower cost | Missing rare events |"
      },
      {
        "title": "What Great Answers Mention",
        "body": "- Separate metrics, logs, and traces because access patterns differ.\n- Durable ingest stream and backpressure policies.\n- Cardinality control and tenant quotas.\n- Hot/cold retention tiers and downsampling.\n- Alerting isolation, dedupe, and notification routing."
      }
    ],
    "diagrams": [
      {
        "title": "Observability platform",
        "nodes": [
          {
            "id": "client",
            "label": "Clients",
            "kind": "client",
            "col": 0,
            "row": 2
          },
          {
            "id": "gateway",
            "label": "API Gateway",
            "kind": "gateway",
            "col": 1,
            "row": 2
          },
          {
            "id": "lb",
            "label": "Load Balancer",
            "kind": "lb",
            "col": 2,
            "row": 2
          },
          {
            "id": "service",
            "label": "Collector / Ingest API",
            "kind": "service",
            "col": 3,
            "row": 2,
            "detail": "Collectors authenticate tenants, validate labels, batch data, and write to the ingest stream. They should shed or sample low-priority telemetry under overload."
          },
          {
            "id": "cache",
            "label": "Query Cache",
            "kind": "cache",
            "col": 4,
            "row": 1
          },
          {
            "id": "db",
            "label": "Metadata DB",
            "kind": "db",
            "col": 5,
            "row": 2,
            "detail": "Metadata stores tenants, retention policies, alert rules, and series metadata. It is much smaller than telemetry data but critical for access control and query planning."
          },
          {
            "id": "async",
            "label": "Telemetry Stream",
            "kind": "stream",
            "col": 4,
            "row": 4
          },
          {
            "id": "worker",
            "label": "Workers",
            "kind": "worker",
            "col": 5,
            "row": 4
          },
          {
            "id": "aux",
            "label": "TSDB + Log Index",
            "kind": "search",
            "col": 6,
            "row": 1,
            "detail": "The TSDB/log index stores queryable telemetry by time, label, and text. Hot data lives on fast storage while compacted blocks move to object storage."
          },
          {
            "id": "mon",
            "label": "Metrics + Alerts",
            "kind": "monitor",
            "col": 7,
            "row": 2
          }
        ],
        "edges": [
          {
            "from": "client",
            "to": "gateway",
            "label": "request"
          },
          {
            "from": "gateway",
            "to": "lb",
            "label": "route"
          },
          {
            "from": "lb",
            "to": "service",
            "label": "call"
          },
          {
            "from": "service",
            "to": "cache",
            "label": "hot"
          },
          {
            "from": "service",
            "to": "db",
            "label": "read/write"
          },
          {
            "from": "service",
            "to": "async",
            "label": "event"
          },
          {
            "from": "async",
            "to": "worker",
            "label": "consume"
          },
          {
            "from": "worker",
            "to": "aux",
            "label": "derive"
          },
          {
            "from": "service",
            "to": "aux",
            "label": "query"
          },
          {
            "from": "service",
            "to": "mon",
            "label": "slo"
          },
          {
            "from": "worker",
            "to": "mon",
            "label": "lag"
          }
        ]
      }
    ],
    "followUps": [
      {
        "q": "What is high cardinality and why is it bad?",
        "a": "Too many unique label combinations create many series, increasing memory, index size, and query fanout."
      },
      {
        "q": "How do you protect ingestion during spikes?",
        "a": "Batch, compress, use durable queues, enforce quotas, and drop low-priority logs before critical metrics."
      },
      {
        "q": "Why separate alerting from dashboards?",
        "a": "Ad-hoc queries can be expensive; alerts need predictable evaluation and notification even during incidents."
      },
      {
        "q": "How do you reduce storage cost?",
        "a": "Downsample metrics, sample traces, tier old blocks to object storage, and set retention per signal."
      },
      {
        "q": "How do traces link to logs?",
        "a": "Propagate trace IDs and include them in log records, allowing query by trace_id."
      },
      {
        "q": "What SLOs matter?",
        "a": "Ingest availability, data freshness, query latency, alert evaluation delay, and dropped sample rate."
      }
    ],
    "resources": [
      {
        "title": "System Design Primer",
        "url": "https://github.com/donnemartin/system-design-primer",
        "type": "repo"
      },
      {
        "title": "Designing Data-Intensive Applications",
        "url": "https://dataintensive.net",
        "type": "book"
      },
      {
        "title": "Hello Interview System Design",
        "url": "https://www.hellointerview.com/learn/system-design",
        "type": "course"
      },
      {
        "title": "Prometheus documentation",
        "url": "https://prometheus.io/docs/introduction/overview/",
        "type": "article"
      },
      {
        "title": "OpenTelemetry docs",
        "url": "https://opentelemetry.io/docs/",
        "type": "article"
      },
      {
        "title": "Dapper paper",
        "url": "https://research.google/pubs/dapper-a-large-scale-distributed-systems-tracing-infrastructure/",
        "type": "paper"
      }
    ]
  },
  {
    "id": "distributed-job-scheduler",
    "title": "Distributed Job Scheduler",
    "category": "Case Study",
    "difficulty": "Hard",
    "summary": "Design a scheduler for one-time and recurring jobs with leases, retries, priorities, worker pools, and exactly-once effects despite at-least-once execution.",
    "tags": [
      "scheduler",
      "jobs",
      "cron",
      "leases",
      "workers"
    ],
    "sections": [
      {
        "title": "Clarify Requirements",
        "body": "**Functional requirements**\n- Schedule one-time jobs at a timestamp and recurring jobs by cron-like rules.\n- Dispatch jobs to workers, track status, retries, timeouts, and results.\n- Support priorities, cancellation, dedupe keys, and tenant quotas.\n- Provide visibility into queued, running, failed, and completed jobs.\n\n**Non-functional requirements**\n- No job should be lost; duplicate execution may happen and must be controlled.\n- Dispatch latency for due jobs should be seconds or better for normal priority.\n- Scheduler should be highly available with only one owner per shard/partition.\n- Worker failures should release leases and retry safely."
      },
      {
        "title": "Capacity Estimation",
        "body": "Assume 10M jobs/day and top-of-minute spikes from cron schedules.\n\n| Metric | Math | Result |\n|---|---|---:|\n| Average due jobs | 10M / 100k sec | ~100/s |\n| Peak due jobs | 100/s × 100 spike | ~10k/s |\n| Job metadata | 10M × 1 KB | ~10 GB/day |\n| Retention | 30 days history × 3 replicas | ~900 GB before indexes |\n| Poll shards | 1k time buckets | keeps scans bounded |\n\nCron herds are the main challenge: many jobs become due at exactly 00 seconds."
      },
      {
        "title": "API Design",
        "body": "~~~http\nPOST /v1/jobs\n{ \"run_at\": \"2026-10-01T12:00:00Z\", \"task_type\": \"send_email\", \"payload\": {}, \"dedupe_key\": \"welcome:u1\" }\n~~~\n\n~~~http\nPOST /v1/schedules\n{ \"cron\": \"0 * * * *\", \"task_type\": \"rebuild_report\", \"timezone\": \"UTC\" }\n~~~\n\n~~~http\nPOST /v1/jobs/{job_id}/cancel\n~~~"
      },
      {
        "title": "Data Model",
        "body": "| Entity | Important fields | Notes |\n|---|---|---|\n| job | job_id, tenant_id, task_type, payload_ref, run_at, priority, status, attempts | Durable job state |\n| lease | job_id, worker_id, lease_until, fencing_token | Prevents concurrent ownership |\n| schedule | schedule_id, cron, timezone, next_run_at, enabled | Recurring job generator |\n| attempt | job_id, attempt_no, started_at, finished_at, error | Debug and retry history |\n| time_bucket | bucket_ts, shard, due_count | Efficient due-job scanning |"
      },
      {
        "title": "High-Level Design",
        "body": "API writes jobs into a durable store partitioned by run_at bucket and tenant. Scheduler leaders own shards through leases, scan near-due buckets, enqueue runnable jobs, and workers claim jobs with leases. Workers heartbeat while running and update final status idempotently. Recurring schedules materialize the next job after each successful enqueue."
      },
      {
        "title": "Deep Dives",
        "body": "### Finding due jobs\n\n| Option | Pros | Cons |\n|---|---|---|\n| Poll DB by run_at index | Simple | Hot scans at high scale |\n| Time buckets/wheel | Bounded scans | More scheduling metadata |\n| Delay queue | Natural ordering | Broker-specific limits for long delays |\n| Hierarchical timing wheel | Efficient large volume | Complex implementation |\n\n### Execution guarantees\n\n| Option | Pros | Cons |\n|---|---|---|\n| At-most-once | No duplicates | Jobs can be lost on worker crash |\n| At-least-once | No lost jobs | Duplicates possible |\n| Exactly-once effect | Correct outcome | Requires idempotent task handlers and dedupe |\n\n### Scheduler leadership\n\nUse shard leases backed by consensus or conditional writes. Include fencing tokens in dispatch so stale leaders cannot enqueue the same shard after losing ownership."
      },
      {
        "title": "Bottlenecks & Scaling",
        "body": "- Cron spikes can overload workers; add jitter, priorities, quotas, and admission control.\n- Long-running jobs need heartbeats and lease extension without infinite ownership.\n- Payloads may be large; store payloads in object storage and put pointers in job rows.\n- Poison jobs should stop retrying after policy and move to a dead-letter state with tooling."
      },
      {
        "title": "Trade-offs & Alternatives",
        "body": "| Alternative | Benefit | Cost |\n|---|---|---|\n| Database-only scheduler | Easy to build | Polling and lock contention at scale |\n| Broker delay queues | Simple dispatch | Limited visibility and long-delay support |\n| Kubernetes CronJobs | Good for infra jobs | Not ideal for millions of tenant jobs |\n| Workflow engine | Rich dependencies | Heavier operational model |"
      },
      {
        "title": "What Great Answers Mention",
        "body": "- Durable job state and at-least-once execution.\n- Leases, heartbeats, fencing tokens, and idempotent handlers.\n- Time buckets/timing wheel for due job discovery.\n- Retry policy with exponential backoff, jitter, and dead-letter handling.\n- Tenant quotas, priorities, and cron spike mitigation."
      }
    ],
    "diagrams": [
      {
        "title": "Distributed job scheduler",
        "nodes": [
          {
            "id": "client",
            "label": "Clients",
            "kind": "client",
            "col": 0,
            "row": 2
          },
          {
            "id": "gateway",
            "label": "API Gateway",
            "kind": "gateway",
            "col": 1,
            "row": 2
          },
          {
            "id": "lb",
            "label": "Load Balancer",
            "kind": "lb",
            "col": 2,
            "row": 2
          },
          {
            "id": "service",
            "label": "Scheduler Leaders",
            "kind": "service",
            "col": 3,
            "row": 2,
            "detail": "Scheduler leaders own shards and move due jobs into ready queues. Leadership must be leased/fenced so two schedulers do not dispatch the same shard concurrently."
          },
          {
            "id": "cache",
            "label": "Shard Lease Cache",
            "kind": "cache",
            "col": 4,
            "row": 1
          },
          {
            "id": "db",
            "label": "Job Store",
            "kind": "db",
            "col": 5,
            "row": 2,
            "detail": "The job store is the durable source of truth for run_at, status, attempts, and leases. Index by time bucket and tenant to keep due scans bounded."
          },
          {
            "id": "async",
            "label": "Ready Queue",
            "kind": "queue",
            "col": 4,
            "row": 4
          },
          {
            "id": "worker",
            "label": "Workers",
            "kind": "worker",
            "col": 5,
            "row": 4
          },
          {
            "id": "aux",
            "label": "Worker Pool",
            "kind": "worker",
            "col": 6,
            "row": 1,
            "detail": "Workers claim jobs with leases, heartbeat during execution, and write idempotent completion. Failed or timed-out jobs return to the scheduler according to retry policy."
          },
          {
            "id": "mon",
            "label": "Metrics + Alerts",
            "kind": "monitor",
            "col": 7,
            "row": 2
          }
        ],
        "edges": [
          {
            "from": "client",
            "to": "gateway",
            "label": "request"
          },
          {
            "from": "gateway",
            "to": "lb",
            "label": "route"
          },
          {
            "from": "lb",
            "to": "service",
            "label": "call"
          },
          {
            "from": "service",
            "to": "cache",
            "label": "hot"
          },
          {
            "from": "service",
            "to": "db",
            "label": "read/write"
          },
          {
            "from": "service",
            "to": "async",
            "label": "event"
          },
          {
            "from": "async",
            "to": "worker",
            "label": "consume"
          },
          {
            "from": "worker",
            "to": "aux",
            "label": "derive"
          },
          {
            "from": "service",
            "to": "aux",
            "label": "query"
          },
          {
            "from": "service",
            "to": "mon",
            "label": "slo"
          },
          {
            "from": "worker",
            "to": "mon",
            "label": "lag"
          }
        ]
      }
    ],
    "followUps": [
      {
        "q": "How do you prevent lost jobs?",
        "a": "Persist jobs before dispatch and use at-least-once execution with leases that expire on worker failure."
      },
      {
        "q": "How do you prevent duplicate effects?",
        "a": "Make handlers idempotent with dedupe keys or conditional writes; scheduler alone cannot guarantee exactly-once side effects."
      },
      {
        "q": "How do you find due jobs efficiently?",
        "a": "Partition by time buckets or timing wheel shards so schedulers scan bounded ranges."
      },
      {
        "q": "How do recurring jobs work?",
        "a": "Store cron schedule and next_run_at; materialize the next job transactionally when due/enqueued."
      },
      {
        "q": "What happens when a worker dies?",
        "a": "Its lease expires, the job becomes runnable again, and retry attempt count/backoff are applied."
      },
      {
        "q": "How do you handle top-of-minute spikes?",
        "a": "Add schedule jitter, priority queues, autoscale workers, and enforce tenant quotas."
      }
    ],
    "resources": [
      {
        "title": "System Design Primer",
        "url": "https://github.com/donnemartin/system-design-primer",
        "type": "repo"
      },
      {
        "title": "Designing Data-Intensive Applications",
        "url": "https://dataintensive.net",
        "type": "book"
      },
      {
        "title": "Hello Interview System Design",
        "url": "https://www.hellointerview.com/learn/system-design",
        "type": "course"
      },
      {
        "title": "Google Borg paper",
        "url": "https://research.google/pubs/large-scale-cluster-management-at-google-with-borg/",
        "type": "paper"
      },
      {
        "title": "Kubernetes Jobs",
        "url": "https://kubernetes.io/docs/concepts/workloads/controllers/job/",
        "type": "article"
      },
      {
        "title": "Apache Airflow concepts",
        "url": "https://airflow.apache.org/docs/apache-airflow/stable/core-concepts/overview.html",
        "type": "article"
      }
    ]
  }
]

export default docs
