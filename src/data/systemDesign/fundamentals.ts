import type { DesignDoc } from '../../types/content'

const docs: DesignDoc[] = [
  {
    "id": "system-design-interview-framework",
    "title": "Interview Framework",
    "category": "Fundamentals",
    "difficulty": "Easy",
    "summary": "A repeatable RESHADED-style path for turning an ambiguous prompt into a defendable architecture: requirements, estimation, APIs, data model, high-level design, deep dives, and bottlenecks.",
    "tags": [
      "interview",
      "framework",
      "requirements",
      "architecture"
    ],
    "sections": [
      {
        "title": "Why a Framework Matters",
        "body": "Strong system design interviews are not about drawing the biggest diagram. They are about reducing ambiguity, choosing reasonable constraints, and explaining why each trade-off fits the business goal.\n\nA useful mnemonic is **RESHADED**:\n\n| Step | Goal | Output |\n|---|---|---|\n| Requirements | Separate must-haves from nice-to-haves | Functional and non-functional scope |\n| Estimation | Size traffic, storage, bandwidth, and latency | Numbers that drive architecture |\n| Surface/API | Define product contracts | Endpoints, events, idempotency |\n| High-level design | Place major components | Services, stores, queues, caches |\n| Data model | Name entities and access patterns | Tables, keys, indexes, retention |\n| Edge cases | Talk about failure modes | Retries, duplicates, hot keys, abuse |\n| Deep dives | Spend time on the hardest parts | Sharding, consistency, ranking, fanout |\n| Defend/iterate | Close with bottlenecks and alternatives | Scaling plan and trade-offs |\n\n> **Interview tip:** Do not ask twenty questions at once. Ask the two or three questions that would change the architecture, then state assumptions and continue."
      },
      {
        "title": "A Practical Timeline",
        "body": "In a 45 minute interview, budget time deliberately.\n\n| Minutes | Activity | What to say out loud |\n|---:|---|---|\n| 0-5 | Clarify | Users, core actions, read/write ratio, consistency expectations |\n| 5-10 | Estimate | DAU, QPS, storage, payload size, peak multiplier |\n| 10-15 | APIs and data model | Contracts before boxes; names reveal access patterns |\n| 15-25 | High-level design | Draw the minimum viable architecture |\n| 25-40 | Deep dives | Pick two hard areas and compare alternatives |\n| 40-45 | Bottlenecks | Call out scaling path, monitoring, and failure handling |\n\nIf the interviewer steers you early, follow the signal. A fintech interviewer may care more about idempotency and ledgers than about CDN caching; a consumer product interviewer may care more about fanout, ranking, and abuse."
      },
      {
        "title": "Requirement Patterns",
        "body": "Requirements should be measurable enough to guide design.\n\n| Requirement type | Weak version | Interview-ready version |\n|---|---|---|\n| Availability | \"Highly available\" | 99.9% for writes, 99.99% for reads; graceful degradation allowed |\n| Latency | \"Fast\" | p95 read under 200 ms in-region, p99 under 800 ms globally |\n| Consistency | \"Correct\" | Read-your-writes for owners; eventual consistency acceptable for counters |\n| Scale | \"Many users\" | 50M DAU, 5:1 read/write, 3x peak during events |\n| Retention | \"Keep data\" | Hot 30 days online, cold 7 years in object storage |\n\n> **Interview tip:** After listing requirements, mark non-goals. \"We will not build full-text search in v1\" is often as valuable as a feature list."
      },
      {
        "title": "Common Pitfalls",
        "body": "- Drawing components before defining read/write paths.\n- Using fashionable technology names without explaining access patterns.\n- Ignoring deletes, retries, duplicate requests, and partial failures.\n- Treating average QPS as peak QPS; use a peak multiplier unless told otherwise.\n- Over-optimizing early. Start simple, then evolve when a number justifies complexity.\n\nA good answer can be simple if the constraints are simple. A great answer shows how the design changes when constraints become harder."
      }
    ],
    "diagrams": [
      {
        "title": "RESHADED interview flow",
        "nodes": [
          {
            "id": "candidate",
            "label": "Candidate",
            "kind": "client",
            "col": 0,
            "row": 2,
            "detail": "The candidate drives the structure and narrates assumptions. The best answers make uncertainty explicit instead of hiding it behind a diagram."
          },
          {
            "id": "req",
            "label": "Requirements",
            "kind": "gateway",
            "col": 1,
            "row": 2
          },
          {
            "id": "estimate",
            "label": "Estimation",
            "kind": "service",
            "col": 2,
            "row": 2
          },
          {
            "id": "api",
            "label": "API Surface",
            "kind": "service",
            "col": 3,
            "row": 1
          },
          {
            "id": "model",
            "label": "Data Model",
            "kind": "db",
            "col": 3,
            "row": 3,
            "detail": "The data model should follow access patterns, not the other way around. Name primary keys, secondary indexes, and retention because they determine scaling options."
          },
          {
            "id": "hld",
            "label": "High-Level Design",
            "kind": "service",
            "col": 5,
            "row": 2
          },
          {
            "id": "deep",
            "label": "Deep Dives",
            "kind": "worker",
            "col": 6,
            "row": 1,
            "detail": "Deep dives are where senior candidates differentiate. Pick the hardest risk: consistency, fanout, hot keys, ranking, cost, or regional failure."
          },
          {
            "id": "risks",
            "label": "Bottlenecks",
            "kind": "monitor",
            "col": 7,
            "row": 2
          }
        ],
        "edges": [
          {
            "from": "candidate",
            "to": "req",
            "label": "scope"
          },
          {
            "from": "req",
            "to": "estimate",
            "label": "numbers"
          },
          {
            "from": "estimate",
            "to": "api",
            "label": "contracts"
          },
          {
            "from": "api",
            "to": "model",
            "label": "entities"
          },
          {
            "from": "model",
            "to": "hld",
            "label": "storage"
          },
          {
            "from": "hld",
            "to": "deep",
            "label": "focus"
          },
          {
            "from": "deep",
            "to": "risks",
            "label": "defend"
          }
        ]
      }
    ],
    "followUps": [
      {
        "q": "What if requirements keep changing?",
        "a": "Restate the latest assumption, explain which design decision changes, and keep the old alternative in the trade-off discussion."
      },
      {
        "q": "Should APIs come before the diagram?",
        "a": "Usually yes. APIs force you to define who calls the system, what must be synchronous, and what can be asynchronous."
      },
      {
        "q": "How much math is enough?",
        "a": "Enough to justify component choices. A few QPS, storage, bandwidth, and peak estimates are better than ten unconnected calculations."
      },
      {
        "q": "What if you do not know a technology deeply?",
        "a": "Describe the property you need, such as ordered append logs or conditional writes, then name possible implementations."
      },
      {
        "q": "How do you choose deep dives?",
        "a": "Pick the parts most likely to fail the requirements: hot keys, consistency, fanout, geo-latency, abuse, or cost."
      },
      {
        "q": "How do you close strongly?",
        "a": "Summarize the design, top bottlenecks, monitoring signals, and the first change you would make at 10x scale."
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
        "title": "ByteByteGo",
        "url": "https://bytebytego.com",
        "type": "course"
      }
    ]
  },
  {
    "id": "back-of-the-envelope-estimation",
    "title": "Back-of-the-Envelope Estimation",
    "category": "Fundamentals",
    "difficulty": "Medium",
    "summary": "A compact playbook for turning product assumptions into QPS, storage, bandwidth, memory, and latency targets that drive the architecture.",
    "tags": [
      "capacity",
      "latency",
      "qps",
      "storage"
    ],
    "widgets": [
      "capacity-estimator"
    ],
    "sections": [
      {
        "title": "Core Numbers to Memorize",
        "body": "Estimates do not need to be exact; they need to be consistent and useful.\n\n| Quantity | Useful approximation |\n|---|---:|\n| 1 KB | 1 thousand bytes |\n| 1 MB | 1 million bytes |\n| 1 GB | 1 billion bytes |\n| 1 TB | 1 trillion bytes |\n| Power of two | $2^{10}\u0007pprox10^3$, $2^{20}\u0007pprox10^6$, $2^{30}\u0007pprox10^9$, $2^{40}\u0007pprox10^{12}$ |\n| Seconds/day | 86,400, often rounded to 100,000 |\n| Monthly seconds | About 2.6 million |\n\n| Operation | Ballpark latency |\n|---|---:|\n| CPU L1/L2 cache | sub-nanosecond to a few ns |\n| Main memory access | about 100 ns |\n| SSD random read | 50-200 microseconds |\n| Same-zone network round trip | 0.2-2 ms |\n| Cross-region round trip | 50-200 ms |\n| Disk seek on spinning media | several ms |\n| CDN edge hit | tens of ms for most users |\n\n> **Interview tip:** Round aggressively but say the rounding. \"I will use 100k seconds per day so QPS is daily events divided by 100k.\""
      },
      {
        "title": "QPS and Peak Math",
        "body": "Start from users, then convert actions into requests.\n\n| Step | Formula | Example |\n|---|---|---|\n| Daily actions | DAU × actions per user | 20M × 5 = 100M writes/day |\n| Average QPS | daily actions / 86,400 | 100M / 100k ≈ 1,000 writes/s |\n| Peak QPS | average × peak factor | 1,000 × 5 = 5,000 writes/s |\n| Read QPS | writes × read/write ratio | 5,000 × 20 = 100k reads/s |\n\nFor systems with strong diurnal patterns, the peak multiplier matters more than the exact daily denominator. For product launches, live sports, or payroll days, call out traffic spikes explicitly."
      },
      {
        "title": "Storage and Bandwidth",
        "body": "Storage math should include replicas, indexes, and retention.\n\n| Component | Formula |\n|---|---|\n| Raw data/day | writes/day × payload size |\n| Replicated storage | raw × replication factor |\n| Index overhead | raw × 20-100% depending on indexes |\n| Hot cache | working set × item size × overhead |\n| Egress bandwidth | QPS × response size |\n\nExample: 100M events/day × 1 KB ≈ 100 GB/day raw. With 3 replicas and 50% index overhead, budget roughly 450 GB/day. For 90 days hot retention, that is around 40 TB before compression."
      },
      {
        "title": "When Estimates Change Design",
        "body": "| Observation | Likely design implication |\n|---|---|\n| Reads dominate writes | Add cache/CDN/read replicas before sharding writes |\n| Writes are high and append-only | Consider log-structured storage or streams |\n| Payloads are large | Put blobs in object storage and metadata in a database |\n| Hot keys exist | Add request coalescing, partition by compound keys, or precompute |\n| Cross-region latency breaks SLO | Use regional reads, async replication, or active-active design |\n\n> **Interview tip:** Tie every major component to a number: \"The cache is useful because 80% of reads hit the last 24 hours, which is only 300 GB.\""
      }
    ],
    "diagrams": [
      {
        "title": "Capacity estimate drives architecture",
        "nodes": [
          {
            "id": "traffic",
            "label": "Traffic Assumptions",
            "kind": "client",
            "col": 0,
            "row": 2
          },
          {
            "id": "qps",
            "label": "QPS Math",
            "kind": "service",
            "col": 1,
            "row": 1,
            "detail": "QPS estimates separate average load from burst load. They determine how many stateless replicas, partitions, and queue consumers the system needs."
          },
          {
            "id": "payload",
            "label": "Payload Size",
            "kind": "service",
            "col": 1,
            "row": 3
          },
          {
            "id": "latency",
            "label": "Latency Budget",
            "kind": "gateway",
            "col": 3,
            "row": 0
          },
          {
            "id": "cache",
            "label": "Cache Working Set",
            "kind": "cache",
            "col": 3,
            "row": 2,
            "detail": "Cache sizing comes from working-set size and hit-rate goals, not total database size. Include serialization overhead and eviction policy when memory is tight."
          },
          {
            "id": "db",
            "label": "DB Partitions",
            "kind": "db",
            "col": 5,
            "row": 1
          },
          {
            "id": "storage",
            "label": "Blob Storage",
            "kind": "storage",
            "col": 5,
            "row": 3
          },
          {
            "id": "monitor",
            "label": "SLO Dashboard",
            "kind": "monitor",
            "col": 7,
            "row": 2
          }
        ],
        "edges": [
          {
            "from": "traffic",
            "to": "qps",
            "label": "actions"
          },
          {
            "from": "traffic",
            "to": "payload",
            "label": "items"
          },
          {
            "from": "qps",
            "to": "latency",
            "label": "budget"
          },
          {
            "from": "qps",
            "to": "cache",
            "label": "hot set"
          },
          {
            "from": "payload",
            "to": "storage",
            "label": "GB/day"
          },
          {
            "from": "cache",
            "to": "db",
            "label": "misses"
          },
          {
            "from": "db",
            "to": "monitor",
            "label": "p95"
          },
          {
            "from": "storage",
            "to": "monitor",
            "label": "cost"
          }
        ]
      }
    ],
    "followUps": [
      {
        "q": "Why use 100k seconds per day?",
        "a": "It makes mental math fast; the error is small enough for architecture choices."
      },
      {
        "q": "How do replicas affect storage estimates?",
        "a": "Multiply raw storage by replication factor, then add index and metadata overhead."
      },
      {
        "q": "What is the difference between average and peak QPS?",
        "a": "Average spreads requests over the full day; peak accounts for bursts and usually drives provisioning."
      },
      {
        "q": "How do you estimate cache size?",
        "a": "Estimate the hot working set, item size, overhead, desired hit rate, and replication across cache nodes."
      },
      {
        "q": "When does bandwidth matter?",
        "a": "Large responses, media, global egress, and service-to-service fanout can make bandwidth or CDN cost a primary constraint."
      },
      {
        "q": "What if the interviewer gives different numbers?",
        "a": "Recalculate quickly and state which component changes: replicas, shards, queue depth, or storage tier."
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
        "title": "Latency Numbers Every Programmer Should Know",
        "url": "https://gist.github.com/jboner/2841832",
        "type": "article"
      }
    ]
  },
  {
    "id": "scalability-load-balancing",
    "title": "Scalability & Load Balancing",
    "category": "Fundamentals",
    "difficulty": "Medium",
    "summary": "How to distribute traffic across stateless and stateful components using horizontal scaling, L4/L7 load balancers, health checks, and traffic algorithms.",
    "tags": [
      "scaling",
      "load-balancing",
      "l4",
      "l7",
      "health-checks"
    ],
    "widgets": [
      "load-balancer"
    ],
    "sections": [
      {
        "title": "Horizontal vs Vertical Scaling",
        "body": "| Approach | Best for | Strength | Weakness |\n|---|---|---|---|\n| Vertical scaling | Stateful databases, early prototypes | Simple operations | Hardware ceiling; failover may be harder |\n| Horizontal scaling | Stateless services, workers, caches | Elastic capacity and fault isolation | Requires routing, discovery, and shared state decisions |\n| Partitioned scaling | Databases, queues, indexes | Removes single-node limits | Rebalancing and hot partitions |\n\nScalable services are usually stateless at the request layer. Session state moves to signed tokens, a shared cache, or a backing database so any replica can serve any request."
      },
      {
        "title": "L4 vs L7 Load Balancers",
        "body": "| Layer | Routes by | Common use | Trade-off |\n|---|---|---|---|\n| L4 | IP, port, TCP/UDP connection | Very high throughput, TLS passthrough, database proxies | Limited request awareness |\n| L7 | HTTP path, headers, host, cookies, gRPC metadata | API routing, auth, canary, retries, WAF | More CPU work and more failure modes |\n\nL4 balancers are often placed at the edge or between tiers for connection distribution. L7 gateways understand requests and can enforce product rules such as version routing or tenant isolation.\n\n> **Interview tip:** Mention health checks and draining. A load balancer without safe removal can send traffic to instances that are shutting down."
      },
      {
        "title": "Algorithms",
        "body": "| Algorithm | How it works | Good when | Risk |\n|---|---|---|---|\n| Round robin | Rotate through backends | Similar capacity and short requests | Ignores outstanding work |\n| Weighted round robin | More traffic to stronger nodes | Mixed instance sizes | Bad weights overload nodes |\n| Least connections | Pick backend with fewest active connections | Long-lived connections | Can oscillate without smoothing |\n| Random + two choices | Pick less-loaded of two random nodes | Large fleets | Needs live load signal |\n| Consistent hashing | Stable mapping by key | Sticky sessions, cache sharding | Hot keys need mitigation |"
      },
      {
        "title": "Pitfalls and Interview Signals",
        "body": "- Autoscaling on CPU alone can fail for IO-bound services; consider queue depth, p95 latency, or error rate.\n- Retry storms can multiply load; use budgets, jitter, and circuit breakers.\n- Sticky sessions simplify state but hurt rebalancing and failover.\n- Health checks should cover dependencies only when dependency failure means the replica cannot safely serve traffic.\n\n> **Interview tip:** When drawing a load balancer, specify what happens during deploys: readiness checks, connection draining, and rollback."
      }
    ],
    "diagrams": [
      {
        "title": "Layered traffic distribution",
        "nodes": [
          {
            "id": "users",
            "label": "Users",
            "kind": "client",
            "col": 0,
            "row": 2
          },
          {
            "id": "dns",
            "label": "DNS / Geo DNS",
            "kind": "external",
            "col": 1,
            "row": 2
          },
          {
            "id": "edge",
            "label": "Edge L4 LB",
            "kind": "lb",
            "col": 2,
            "row": 2,
            "detail": "The L4 layer keeps packet and connection routing simple and fast. It is a good place for global anycast or regional entry points."
          },
          {
            "id": "gateway",
            "label": "L7 Gateway",
            "kind": "gateway",
            "col": 3,
            "row": 2,
            "detail": "The gateway understands HTTP or gRPC and can route by path, tenant, version, or canary policy. It also centralizes auth, rate limits, and request logging."
          },
          {
            "id": "svc1",
            "label": "API Replica A",
            "kind": "service",
            "col": 5,
            "row": 1
          },
          {
            "id": "svc2",
            "label": "API Replica B",
            "kind": "service",
            "col": 5,
            "row": 3
          },
          {
            "id": "cache",
            "label": "Shared Cache",
            "kind": "cache",
            "col": 6,
            "row": 0
          },
          {
            "id": "db",
            "label": "Primary DB",
            "kind": "db",
            "col": 6,
            "row": 4
          },
          {
            "id": "mon",
            "label": "Health + Metrics",
            "kind": "monitor",
            "col": 7,
            "row": 2
          }
        ],
        "edges": [
          {
            "from": "users",
            "to": "dns",
            "label": "lookup"
          },
          {
            "from": "dns",
            "to": "edge",
            "label": "region"
          },
          {
            "from": "edge",
            "to": "gateway",
            "label": "TCP"
          },
          {
            "from": "gateway",
            "to": "svc1",
            "label": "path"
          },
          {
            "from": "gateway",
            "to": "svc2",
            "label": "path"
          },
          {
            "from": "svc1",
            "to": "cache",
            "label": "read"
          },
          {
            "from": "svc2",
            "to": "db",
            "label": "write"
          },
          {
            "from": "mon",
            "to": "gateway",
            "label": "health",
            "dashed": true
          },
          {
            "from": "svc1",
            "to": "mon",
            "label": "metrics"
          },
          {
            "from": "svc2",
            "to": "mon",
            "label": "metrics"
          }
        ]
      }
    ],
    "followUps": [
      {
        "q": "When would you choose L4 over L7?",
        "a": "Use L4 for very high-throughput connection distribution or TLS passthrough; use L7 when request-aware routing is needed."
      },
      {
        "q": "Why avoid sticky sessions?",
        "a": "They reduce flexibility during failover and scaling. Prefer external session state unless affinity is required."
      },
      {
        "q": "How do health checks fail?",
        "a": "Too shallow checks route to broken replicas; too deep checks can eject the whole fleet during a shared dependency outage."
      },
      {
        "q": "What metric should drive autoscaling?",
        "a": "Use the bottleneck signal: CPU for compute-bound services, queue depth for workers, p95 latency for request services, or custom saturation metrics."
      },
      {
        "q": "How do you prevent retry storms?",
        "a": "Set timeouts, cap retries, add exponential backoff with jitter, and use circuit breakers or retry budgets."
      },
      {
        "q": "How do canaries use load balancers?",
        "a": "L7 gateways can route a small weighted slice by header, cookie, tenant, or version, then roll forward or back based on metrics."
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
        "title": "Envoy proxy architecture",
        "url": "https://www.envoyproxy.io/docs/envoy/latest/intro/arch_overview/arch_overview",
        "type": "article"
      }
    ]
  },
  {
    "id": "caching",
    "title": "Caching",
    "category": "Fundamentals",
    "difficulty": "Medium",
    "summary": "Caching improves latency and cost when reads repeat, but it introduces invalidation, freshness, stampede, and memory trade-offs.",
    "tags": [
      "cache",
      "cdn",
      "eviction",
      "stampede",
      "freshness"
    ],
    "widgets": [
      "lru-cache"
    ],
    "sections": [
      {
        "title": "Where Caches Live",
        "body": "| Layer | Examples | Best for | Notes |\n|---|---|---|---|\n| Browser/device | HTTP cache, mobile local store | Static assets, user preferences | Hard to invalidate globally |\n| CDN/edge | Cloudflare, Fastly, Akamai | Public assets, images, API responses with safe TTLs | Moves data near users |\n| Application cache | In-process LRU | Tiny hot data, computed config | Lost on restart, per-replica inconsistency |\n| Distributed cache | Redis, Memcached | Shared hot objects, sessions, counters | Network hop and cluster operations |\n| Database cache | Buffer pool, materialized views | Repeated query pages | Controlled by DB internals |\n\nCaches work when the hit rate is high enough to pay for added complexity. They are not a substitute for a data model that cannot serve required access patterns."
      },
      {
        "title": "Write Patterns",
        "body": "| Pattern | Flow | Good for | Risk |\n|---|---|---|---|\n| Cache-aside | App reads cache, falls back to DB, then fills cache | Common read-heavy services | Stale data and thundering herd on misses |\n| Write-through | Write cache and backing store in request path | Stronger read-after-write from cache | Higher write latency |\n| Write-back | Write cache first, flush asynchronously | Very high write volume | Data loss unless durable and replicated |\n| Refresh-ahead | Refresh before TTL expires | Predictable hot keys | Wasted work if access pattern changes |\n\n> **Interview tip:** If you say \"cache it,\" also say the key, value, TTL, invalidation trigger, and stale-data tolerance."
      },
      {
        "title": "Eviction, Stampede, and Freshness",
        "body": "| Problem | Mitigation |\n|---|---|\n| Eviction of useful keys | Use LRU/LFU, segmented LRU, or admission control |\n| Cache stampede | Single-flight locks, request coalescing, jittered TTLs, stale-while-revalidate |\n| Hot key overload | Replicate hot keys, local caches, key splitting for counters |\n| Stale reads | Short TTL, versioned keys, write invalidation, event-based purge |\n| Negative lookups | Cache misses for short TTL to protect databases |\n\nStaleness is a product decision. A profile picture can be stale for minutes; a payment authorization cannot."
      },
      {
        "title": "CDN Caching",
        "body": "CDNs cache closer to users and reduce origin bandwidth. They shine for immutable assets, resized media, public pages, and API responses that can vary by a small set of headers.\n\n| CDN choice | Benefit | Cost |\n|---|---|---|\n| Long immutable TTL | Excellent hit rate | Requires content-addressed URLs |\n| Short TTL | Simple freshness | Lower hit rate |\n| Explicit purge | Fast invalidation | Operational dependency and possible purge limits |\n| Signed URLs/cookies | Private content at edge | Key management and cache-key care |"
      }
    ],
    "diagrams": [
      {
        "title": "Cache-aside with stampede protection",
        "nodes": [
          {
            "id": "client",
            "label": "Client",
            "kind": "client",
            "col": 0,
            "row": 2
          },
          {
            "id": "cdn",
            "label": "CDN",
            "kind": "cdn",
            "col": 1,
            "row": 2,
            "detail": "The CDN serves cacheable public or signed content from edge locations. It should use explicit cache keys and avoid varying on unnecessary headers."
          },
          {
            "id": "api",
            "label": "API Service",
            "kind": "service",
            "col": 3,
            "row": 2
          },
          {
            "id": "local",
            "label": "Local LRU",
            "kind": "cache",
            "col": 4,
            "row": 1
          },
          {
            "id": "dist",
            "label": "Redis Cluster",
            "kind": "cache",
            "col": 5,
            "row": 2,
            "detail": "The distributed cache shares hot objects across replicas. TTL jitter and single-flight fills prevent many callers from refetching the same missing key."
          },
          {
            "id": "lock",
            "label": "Single-flight Lock",
            "kind": "service",
            "col": 5,
            "row": 4
          },
          {
            "id": "db",
            "label": "Source DB",
            "kind": "db",
            "col": 7,
            "row": 2
          },
          {
            "id": "mon",
            "label": "Hit-rate Metrics",
            "kind": "monitor",
            "col": 7,
            "row": 0
          }
        ],
        "edges": [
          {
            "from": "client",
            "to": "cdn",
            "label": "GET"
          },
          {
            "from": "cdn",
            "to": "api",
            "label": "miss"
          },
          {
            "from": "api",
            "to": "local",
            "label": "read"
          },
          {
            "from": "local",
            "to": "dist",
            "label": "miss"
          },
          {
            "from": "dist",
            "to": "lock",
            "label": "miss"
          },
          {
            "from": "lock",
            "to": "db",
            "label": "one fill"
          },
          {
            "from": "db",
            "to": "dist",
            "label": "set TTL"
          },
          {
            "from": "api",
            "to": "mon",
            "label": "hit/miss"
          },
          {
            "from": "dist",
            "to": "mon",
            "label": "evict"
          }
        ]
      }
    ],
    "followUps": [
      {
        "q": "When is cache-aside a poor fit?",
        "a": "When writes require strict freshness or the miss path is too expensive to tolerate during stampedes."
      },
      {
        "q": "How do you choose TTL?",
        "a": "Use business freshness requirements, update frequency, and miss cost; add jitter to avoid synchronized expiration."
      },
      {
        "q": "How do you handle hot keys?",
        "a": "Replicate hot values, add local caches, split counters, or precompute and push updates."
      },
      {
        "q": "What is stale-while-revalidate?",
        "a": "Serve a slightly stale value while one worker refreshes it asynchronously, reducing tail latency and stampedes."
      },
      {
        "q": "How can caching break correctness?",
        "a": "Stale authorization, stale inventory, or stale financial state can allow actions that should be rejected."
      },
      {
        "q": "What should you monitor?",
        "a": "Hit rate, miss latency, eviction rate, memory fragmentation, hot keys, backend QPS, and stale/error serving rate."
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
        "title": "Cloudflare cache documentation",
        "url": "https://developers.cloudflare.com/cache/",
        "type": "article"
      },
      {
        "title": "Redis caching patterns",
        "url": "https://redis.io/solutions/caching/",
        "type": "article"
      }
    ]
  },
  {
    "id": "databases-sql-nosql-indexing",
    "title": "Databases: SQL vs NoSQL, Indexing",
    "category": "Fundamentals",
    "difficulty": "Medium",
    "summary": "Choose storage by access pattern, transaction needs, data shape, and operational constraints; indexes speed reads by adding write and storage cost.",
    "tags": [
      "database",
      "sql",
      "nosql",
      "indexing",
      "transactions"
    ],
    "sections": [
      {
        "title": "Choosing a Store",
        "body": "| Store type | Strengths | Weaknesses | Good examples |\n|---|---|---|---|\n| Relational SQL | Joins, transactions, constraints, ad-hoc queries | Harder horizontal writes at extreme scale | Payments, orders, admin tools |\n| Key-value | Very high throughput by key | Limited queries | Sessions, feature flags, counters |\n| Document | Flexible nested records | Joins and constraints often weaker | User profiles, catalogs |\n| Wide-column | Massive partitioned writes | Requires careful partition-key design | Event timelines, IoT telemetry |\n| Search index | Text relevance and filtering | Eventually consistent, not source of truth | Search, autocomplete, logs |\n| Graph | Relationship traversal | Operationally specialized | Fraud rings, social graph exploration |\n\nThe best database is the one whose natural access path matches the main query. Polyglot persistence is common, but every additional store adds synchronization and failure modes."
      },
      {
        "title": "Indexing Basics",
        "body": "Indexes are alternate data structures that make reads faster by storing ordered or hashed pointers to rows.\n\n| Index | Good for | Not good for |\n|---|---|---|\n| B-tree | Range scans, ordering, prefix queries | Very write-heavy low-selectivity fields |\n| Hash | Exact equality | Range and order |\n| Composite | Multi-column predicates in index order | Queries that skip leading columns |\n| Covering | Reads satisfied from index only | Wide indexes with high write cost |\n| Inverted | Full-text terms to documents | Transactional source of truth |\n\nIndex selectivity matters. An index on a boolean field may not help if half the table matches."
      },
      {
        "title": "Transactions and Isolation",
        "body": "| Need | Design option |\n|---|---|\n| Atomic multi-row updates | SQL transaction with appropriate isolation |\n| Conditional single-key write | NoSQL compare-and-set or conditional put |\n| Cross-service workflow | Saga with compensating actions and idempotent steps |\n| Auditability | Append-only ledger or event log plus materialized views |\n\nCommon isolation anomalies include dirty reads, non-repeatable reads, phantom reads, and write skew. In interviews, name the anomaly that matters instead of reciting isolation levels mechanically."
      },
      {
        "title": "Pitfalls",
        "body": "- Picking NoSQL only because the system is \"large\"; many relational systems scale far with partitioning and read replicas.\n- Creating indexes for every query; each index slows writes and consumes storage.\n- Ignoring schema evolution, backfills, and dual writes.\n- Using a search index as the only copy of business-critical data.\n\n> **Interview tip:** Say the primary access patterns first, then choose keys and indexes. Database choice should feel like a consequence, not a brand preference."
      }
    ],
    "diagrams": [
      {
        "title": "Query path and derived indexes",
        "nodes": [
          {
            "id": "api",
            "label": "API Service",
            "kind": "service",
            "col": 0,
            "row": 2
          },
          {
            "id": "primary",
            "label": "Primary DB",
            "kind": "db",
            "col": 2,
            "row": 2,
            "detail": "The primary store owns correctness, constraints, and durable writes. In many designs this is relational for transactions or a partitioned key-value store for high write scale."
          },
          {
            "id": "btree",
            "label": "B-tree Index",
            "kind": "db",
            "col": 4,
            "row": 1
          },
          {
            "id": "search",
            "label": "Search Index",
            "kind": "search",
            "col": 4,
            "row": 3,
            "detail": "Search indexes are derived views optimized for retrieval and ranking. They should be rebuildable from the source of truth because they lag or become corrupt."
          },
          {
            "id": "cdc",
            "label": "CDC Stream",
            "kind": "stream",
            "col": 3,
            "row": 4
          },
          {
            "id": "cache",
            "label": "Read Cache",
            "kind": "cache",
            "col": 6,
            "row": 1
          },
          {
            "id": "analytics",
            "label": "Warehouse",
            "kind": "storage",
            "col": 6,
            "row": 4
          },
          {
            "id": "mon",
            "label": "DB Metrics",
            "kind": "monitor",
            "col": 7,
            "row": 2
          }
        ],
        "edges": [
          {
            "from": "api",
            "to": "primary",
            "label": "writes"
          },
          {
            "from": "primary",
            "to": "btree",
            "label": "maintain"
          },
          {
            "from": "primary",
            "to": "cdc",
            "label": "changes"
          },
          {
            "from": "cdc",
            "to": "search",
            "label": "index"
          },
          {
            "from": "api",
            "to": "btree",
            "label": "query"
          },
          {
            "from": "api",
            "to": "cache",
            "label": "hot read"
          },
          {
            "from": "cdc",
            "to": "analytics",
            "label": "batch"
          },
          {
            "from": "primary",
            "to": "mon",
            "label": "locks"
          }
        ]
      }
    ],
    "followUps": [
      {
        "q": "When would you prefer SQL?",
        "a": "When transactions, constraints, joins, and flexible querying are central to correctness or operations."
      },
      {
        "q": "When would you prefer a key-value store?",
        "a": "When access is mostly by primary key and you need predictable high throughput with simple operations."
      },
      {
        "q": "Why do indexes slow writes?",
        "a": "Every insert, update, or delete must also update each relevant index structure."
      },
      {
        "q": "What is a covering index?",
        "a": "An index containing all columns needed by a query, allowing the database to avoid fetching the base row."
      },
      {
        "q": "How do you migrate a large table?",
        "a": "Add backward-compatible schema, dual-write or backfill, verify counts/checksums, switch reads, then remove old paths."
      },
      {
        "q": "Can NoSQL be strongly consistent?",
        "a": "Yes, some systems support strong reads or transactions, but often with latency, availability, or scope trade-offs."
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
        "title": "PostgreSQL indexes documentation",
        "url": "https://www.postgresql.org/docs/current/indexes.html",
        "type": "article"
      },
      {
        "title": "Bigtable paper",
        "url": "https://research.google/pubs/bigtable-a-distributed-storage-system-for-structured-data/",
        "type": "paper"
      }
    ]
  },
  {
    "id": "replication-consistency",
    "title": "Replication & Consistency",
    "category": "Fundamentals",
    "difficulty": "Hard",
    "summary": "Replication improves availability and read scale, but every copy introduces questions about ordering, conflict resolution, failover, and what clients are allowed to observe.",
    "tags": [
      "replication",
      "consistency",
      "quorum",
      "cap",
      "pacelc"
    ],
    "sections": [
      {
        "title": "Replication Topologies",
        "body": "| Topology | Writes go to | Strength | Weakness |\n|---|---|---|---|\n| Leader/follower | One leader | Simple ordering and failover story | Leader bottleneck; failover lag |\n| Multi-leader | Regional leaders | Low-latency regional writes | Conflict resolution is hard |\n| Leaderless quorum | Any replica with quorum reads/writes | High availability and tunable consistency | Read repair, hinted handoff, and version conflicts |\n\nReplication lag is not just a number; it affects product behavior. A user may save a profile and then read from a follower that has not received the update."
      },
      {
        "title": "Consistency Models",
        "body": "| Model | Client guarantee | Example use |\n|---|---|---|\n| Linearizable | Operations appear instant and globally ordered | Locks, account balance checks |\n| Sequential | Everyone sees the same order, not necessarily real-time | Some replicated state machines |\n| Causal | Effects are seen after causes | Comments after posts |\n| Read-your-writes | A client sees its own updates | Profile edits, dashboards |\n| Eventual | Replicas converge if writes stop | Counts, feeds, recommendations |\n\n> **Interview tip:** Do not say \"CAP means choose two\" and stop. Explain the partition scenario and the product choice during the partition."
      },
      {
        "title": "Quorums, CAP, and PACELC",
        "body": "In a system with N replicas, write quorum W, and read quorum R, choosing R + W > N can ensure read/write quorum overlap, assuming versions and failure handling are implemented correctly.\n\n| Concept | Interview-ready phrasing |\n|---|---|\n| CAP | During a network partition, a distributed system must choose between serving potentially inconsistent responses or rejecting some operations |\n| PACELC | If partitioned choose Availability or Consistency; Else choose between Latency and Consistency |\n| Sloppy quorum | Accept writes on temporary substitute nodes to improve availability |\n| Read repair | Use reads to detect and repair stale replicas |\n| Vector clocks / versions | Track concurrent writes so conflicts are not silently overwritten |"
      },
      {
        "title": "Failover and Pitfalls",
        "body": "- Promote a follower only after considering replication lag; otherwise acknowledged writes may disappear.\n- Use fencing tokens for leaders so an old leader cannot continue writing after a split brain.\n- Make clients retry safely; duplicate writes should be idempotent or version-checked.\n- Monitor lag, quorum failures, conflict rate, and stale reads.\n\nStrong consistency is a feature with a cost. It may be necessary for money movement or locks, but unnecessary for likes or view counters."
      }
    ],
    "diagrams": [
      {
        "title": "Leader replication and quorum reads",
        "nodes": [
          {
            "id": "client",
            "label": "Client",
            "kind": "client",
            "col": 0,
            "row": 2
          },
          {
            "id": "router",
            "label": "Request Router",
            "kind": "gateway",
            "col": 1,
            "row": 2
          },
          {
            "id": "leader",
            "label": "Leader Replica",
            "kind": "db",
            "col": 3,
            "row": 2,
            "detail": "The leader serializes writes and assigns log order. It is simpler to reason about, but failover must guard against split brain and data loss."
          },
          {
            "id": "f1",
            "label": "Follower A",
            "kind": "db",
            "col": 5,
            "row": 1
          },
          {
            "id": "f2",
            "label": "Follower B",
            "kind": "db",
            "col": 5,
            "row": 3
          },
          {
            "id": "log",
            "label": "Replication Log",
            "kind": "stream",
            "col": 4,
            "row": 0
          },
          {
            "id": "election",
            "label": "Leader Election",
            "kind": "service",
            "col": 6,
            "row": 2,
            "detail": "Election needs a quorum or consensus-backed lease so only one writer is active. Fencing tokens prevent stale leaders from writing after losing authority."
          },
          {
            "id": "mon",
            "label": "Lag Monitor",
            "kind": "monitor",
            "col": 7,
            "row": 0
          }
        ],
        "edges": [
          {
            "from": "client",
            "to": "router",
            "label": "read/write"
          },
          {
            "from": "router",
            "to": "leader",
            "label": "writes"
          },
          {
            "from": "leader",
            "to": "log",
            "label": "append"
          },
          {
            "from": "log",
            "to": "f1",
            "label": "replay"
          },
          {
            "from": "log",
            "to": "f2",
            "label": "replay"
          },
          {
            "from": "router",
            "to": "f1",
            "label": "reads"
          },
          {
            "from": "router",
            "to": "f2",
            "label": "reads"
          },
          {
            "from": "election",
            "to": "leader",
            "label": "lease"
          },
          {
            "from": "f1",
            "to": "mon",
            "label": "lag"
          },
          {
            "from": "f2",
            "to": "mon",
            "label": "lag"
          }
        ]
      }
    ],
    "followUps": [
      {
        "q": "What is read-your-writes consistency?",
        "a": "After a client writes, subsequent reads by that client reflect the write, often by reading from leader or using session tokens."
      },
      {
        "q": "How do quorums help?",
        "a": "If read and write quorums overlap, a read can contact at least one replica that saw the latest acknowledged write."
      },
      {
        "q": "Why is multi-leader hard?",
        "a": "Two regions can update the same item concurrently, requiring conflict detection, merge rules, or user-visible resolution."
      },
      {
        "q": "What is split brain?",
        "a": "Two nodes believe they are leader and both accept writes; fencing and quorum leases reduce this risk."
      },
      {
        "q": "When is eventual consistency acceptable?",
        "a": "When temporary stale data does not break user trust or correctness, such as counts, feeds, or analytics."
      },
      {
        "q": "What should be monitored?",
        "a": "Replication lag, failover time, quorum errors, conflict rate, stale-read complaints, and lost-update anomalies."
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
        "title": "Raft paper",
        "url": "https://raft.github.io/raft.pdf",
        "type": "paper"
      },
      {
        "title": "PACELC paper abstract",
        "url": "https://www.cs.umd.edu/~abadi/papers/abadi-pacelc.pdf",
        "type": "paper"
      }
    ]
  },
  {
    "id": "sharding-consistent-hashing",
    "title": "Sharding & Consistent Hashing",
    "category": "Fundamentals",
    "difficulty": "Hard",
    "summary": "Sharding partitions data to remove single-node limits; consistent hashing reduces movement during membership changes but does not eliminate hot-key and rebalancing problems.",
    "tags": [
      "sharding",
      "partitioning",
      "consistent-hashing",
      "hot-keys"
    ],
    "widgets": [
      "consistent-hashing"
    ],
    "sections": [
      {
        "title": "Partitioning Strategies",
        "body": "| Strategy | How it works | Good for | Risk |\n|---|---|---|---|\n| Range shard | Key ranges map to shards | Range scans, time partitions | Hot latest range |\n| Hash shard | Hash(key) mod N | Uniform distribution | Resharding moves many keys |\n| Consistent hash | Hash ring maps keys to next node | Dynamic membership | Hot keys still hot |\n| Directory based | Lookup table maps key to shard | Custom placement and tenant movement | Directory availability and complexity |\n| Composite key | Hash tenant plus range suffix | Tenant isolation with range queries | Requires careful query design |"
      },
      {
        "title": "Consistent Hashing",
        "body": "Consistent hashing places nodes and keys on a ring. A key belongs to the first node clockwise. Adding or removing a node moves only a fraction of keys instead of remapping the whole cluster.\n\nVirtual nodes improve balance by giving each physical node many positions on the ring. Weighted virtual nodes let larger machines own more key ranges.\n\n> **Interview tip:** Consistent hashing solves membership churn, not data skew. Always discuss hot-key mitigation separately."
      },
      {
        "title": "Resharding and Routing",
        "body": "| Concern | Common solution |\n|---|---|\n| Finding the shard | Client library, routing service, or gateway metadata cache |\n| Moving data | Dual-read, backfill, change capture, cutover marker |\n| Hot shard | Split range, add salt, isolate tenant, cache hot data |\n| Cross-shard query | Scatter-gather, denormalized index, or avoid in product requirements |\n| Cross-shard transaction | Two-phase commit, saga, or single-shard aggregate design |\n\nThe cleanest designs choose a partition key that keeps the most important transactions and queries within one shard."
      },
      {
        "title": "Pitfalls",
        "body": "- Sharding too early creates operational complexity before a single node is exhausted.\n- A bad partition key can make scale worse by concentrating traffic.\n- Global secondary indexes may become their own sharded systems.\n- Rebalancing consumes network and IO; throttle it and track correctness."
      }
    ],
    "diagrams": [
      {
        "title": "Consistent-hash routing",
        "nodes": [
          {
            "id": "client",
            "label": "Client",
            "kind": "client",
            "col": 0,
            "row": 2
          },
          {
            "id": "router",
            "label": "Shard Router",
            "kind": "gateway",
            "col": 1,
            "row": 2,
            "detail": "The router keeps a cached view of the shard map or hash ring. It should refresh metadata safely and fail closed for writes if ownership is ambiguous."
          },
          {
            "id": "ring",
            "label": "Hash Ring",
            "kind": "service",
            "col": 2,
            "row": 2
          },
          {
            "id": "s1",
            "label": "Shard A",
            "kind": "db",
            "col": 4,
            "row": 0
          },
          {
            "id": "s2",
            "label": "Shard B",
            "kind": "db",
            "col": 4,
            "row": 2
          },
          {
            "id": "s3",
            "label": "Shard C",
            "kind": "db",
            "col": 4,
            "row": 4
          },
          {
            "id": "rebalance",
            "label": "Rebalancer",
            "kind": "worker",
            "col": 6,
            "row": 2,
            "detail": "The rebalancer copies ranges gradually and verifies checksums before cutover. It must coexist with live writes using dual-write, CDC, or versioned ownership."
          },
          {
            "id": "meta",
            "label": "Shard Map",
            "kind": "db",
            "col": 6,
            "row": 0
          },
          {
            "id": "mon",
            "label": "Hot-key Metrics",
            "kind": "monitor",
            "col": 7,
            "row": 4
          }
        ],
        "edges": [
          {
            "from": "client",
            "to": "router",
            "label": "key"
          },
          {
            "from": "router",
            "to": "ring",
            "label": "hash"
          },
          {
            "from": "ring",
            "to": "s1",
            "label": "range"
          },
          {
            "from": "ring",
            "to": "s2",
            "label": "range"
          },
          {
            "from": "ring",
            "to": "s3",
            "label": "range"
          },
          {
            "from": "rebalance",
            "to": "s2",
            "label": "move"
          },
          {
            "from": "rebalance",
            "to": "meta",
            "label": "update"
          },
          {
            "from": "meta",
            "to": "router",
            "label": "refresh"
          },
          {
            "from": "s2",
            "to": "mon",
            "label": "qps"
          }
        ]
      }
    ],
    "followUps": [
      {
        "q": "How do you choose a shard key?",
        "a": "Choose a high-cardinality key aligned with dominant queries and transactions; avoid monotonically increasing hot ranges unless range scans dominate."
      },
      {
        "q": "What are virtual nodes?",
        "a": "Multiple ring positions per physical node that smooth distribution and support weighted capacity."
      },
      {
        "q": "How do you handle a hot celebrity user?",
        "a": "Cache aggressively, split reads from writes, salt subkeys for fanout data, or isolate the tenant/key to dedicated capacity."
      },
      {
        "q": "What makes resharding risky?",
        "a": "Live writes can be lost or duplicated unless ownership, backfill, and verification are carefully staged."
      },
      {
        "q": "How do cross-shard transactions work?",
        "a": "They require coordination such as two-phase commit, or the design can avoid them with sagas and single-aggregate writes."
      },
      {
        "q": "When should you not shard?",
        "a": "If vertical scaling, indexes, read replicas, or caching meet requirements, sharding may add needless operational burden."
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
        "title": "Riak consistent hashing notes",
        "url": "https://docs.riak.com/riak/kv/latest/learn/concepts/clusters/index.html",
        "type": "article"
      }
    ]
  },
  {
    "id": "message-queues-stream-processing",
    "title": "Message Queues & Stream Processing",
    "category": "Fundamentals",
    "difficulty": "Medium",
    "summary": "Queues decouple producers from consumers, while streams preserve ordered event logs for replay, fanout, and stateful processing.",
    "tags": [
      "queues",
      "streams",
      "kafka",
      "idempotency",
      "backpressure"
    ],
    "sections": [
      {
        "title": "Queue vs Stream",
        "body": "| Property | Queue | Stream/log |\n|---|---|---|\n| Consumption | Work item usually handled by one consumer | Many consumer groups can replay independently |\n| Retention | Until ack or short retention | Time/size retention independent of consumers |\n| Ordering | Often per queue or best-effort | Per partition ordered log |\n| Use cases | Background jobs, email, thumbnailing | CDC, analytics, event sourcing, metrics |\n\nQueues are excellent for smoothing bursts and isolating slow work from user requests. Streams are excellent when events are durable facts that multiple systems need to process."
      },
      {
        "title": "Delivery Semantics",
        "body": "| Semantic | Meaning | How to design with it |\n|---|---|---|\n| At-most-once | Message may be lost but not retried | Rarely acceptable for critical work |\n| At-least-once | Message retried until ack; duplicates possible | Make consumers idempotent |\n| Exactly-once effect | Final state changes once despite retries | Transactions, dedupe keys, idempotent sinks |\n\n\"Exactly once\" is usually a system-specific guarantee, not magic. The practical goal is exactly-once effects at the business boundary."
      },
      {
        "title": "Partitioning and Backpressure",
        "body": "| Concern | Design choice |\n|---|---|\n| Ordering | Use the same partition key for events that must be ordered together |\n| Parallelism | Increase partitions and consumer instances |\n| Hot partitions | Choose better keys, split keys, or isolate heavy tenants |\n| Slow consumers | Track lag, autoscale consumers, shed low-priority work |\n| Poison messages | Dead-letter queues with replay tooling |\n\nBackpressure is a feature. If downstream storage is saturated, queues should absorb bursts briefly, then producers must slow down or shed work."
      },
      {
        "title": "Pitfalls",
        "body": "- A queue does not make a slow dependency fast; it moves latency off the request path.\n- Retrying non-idempotent consumers creates duplicate emails, charges, or inventory updates.\n- Unbounded queues hide incidents until lag becomes unrecoverable.\n- Repartitioning changes ordering and consumer state management.\n\n> **Interview tip:** For every async step, mention the retry policy, idempotency key, dead-letter handling, and lag metric."
      }
    ],
    "diagrams": [
      {
        "title": "Event log with consumer groups",
        "nodes": [
          {
            "id": "api",
            "label": "API Producers",
            "kind": "service",
            "col": 0,
            "row": 2
          },
          {
            "id": "broker",
            "label": "Kafka Brokers",
            "kind": "stream",
            "col": 2,
            "row": 2,
            "detail": "The broker cluster stores ordered partition logs and replicates them for durability. Partition count controls parallelism but also affects ordering boundaries and operations."
          },
          {
            "id": "p0",
            "label": "Partition 0",
            "kind": "stream",
            "col": 3,
            "row": 0
          },
          {
            "id": "p1",
            "label": "Partition 1",
            "kind": "stream",
            "col": 3,
            "row": 4
          },
          {
            "id": "worker",
            "label": "Job Consumers",
            "kind": "worker",
            "col": 5,
            "row": 1
          },
          {
            "id": "analytics",
            "label": "Analytics Consumers",
            "kind": "worker",
            "col": 5,
            "row": 3
          },
          {
            "id": "db",
            "label": "Idempotent Sink",
            "kind": "db",
            "col": 7,
            "row": 1,
            "detail": "The sink stores processed event IDs or uses natural idempotency keys. This converts at-least-once delivery into exactly-once business effects."
          },
          {
            "id": "dlq",
            "label": "Dead-letter Queue",
            "kind": "queue",
            "col": 7,
            "row": 4
          },
          {
            "id": "mon",
            "label": "Lag Monitor",
            "kind": "monitor",
            "col": 6,
            "row": 0
          }
        ],
        "edges": [
          {
            "from": "api",
            "to": "broker",
            "label": "events"
          },
          {
            "from": "broker",
            "to": "p0",
            "label": "hash key"
          },
          {
            "from": "broker",
            "to": "p1",
            "label": "hash key"
          },
          {
            "from": "p0",
            "to": "worker",
            "label": "group A"
          },
          {
            "from": "p1",
            "to": "worker",
            "label": "group A"
          },
          {
            "from": "p0",
            "to": "analytics",
            "label": "group B"
          },
          {
            "from": "worker",
            "to": "db",
            "label": "upsert"
          },
          {
            "from": "worker",
            "to": "dlq",
            "label": "poison"
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
        "q": "How do you preserve order?",
        "a": "Put related events on the same partition key and process that partition sequentially."
      },
      {
        "q": "What is a dead-letter queue?",
        "a": "A holding area for messages that repeatedly fail so they do not block the main stream forever."
      },
      {
        "q": "How do you make consumers idempotent?",
        "a": "Use event IDs, natural keys, conditional writes, or processed-message tables before applying side effects."
      },
      {
        "q": "What does consumer lag mean?",
        "a": "The distance between produced offsets and consumed offsets; it indicates backlog and recovery time."
      },
      {
        "q": "When would you use a queue instead of Kafka?",
        "a": "Use a simpler queue for independent jobs without replay requirements or many consumer groups."
      },
      {
        "q": "What is backpressure?",
        "a": "A mechanism that slows producers or sheds work when consumers/downstream systems cannot keep up."
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
    "id": "rate-limiting",
    "title": "Rate Limiting",
    "category": "Fundamentals",
    "difficulty": "Medium",
    "summary": "Rate limiters protect availability and fairness by bounding requests per identity, endpoint, or resource while allowing controlled bursts.",
    "tags": [
      "rate-limiting",
      "token-bucket",
      "sliding-window",
      "abuse"
    ],
    "widgets": [
      "rate-limiter"
    ],
    "sections": [
      {
        "title": "Algorithms",
        "body": "| Algorithm | How it works | Strength | Weakness |\n|---|---|---|---|\n| Fixed window | Count requests in discrete windows | Very simple | Burst at window boundary |\n| Sliding log | Store timestamps for each request | Accurate | High memory for busy identities |\n| Sliding window counter | Blend current and previous window counts | Approximate and efficient | Small estimation error |\n| Token bucket | Refill tokens at rate; spend per request | Allows bursts up to bucket size | Needs atomic token updates |\n| Leaky bucket | Drain at fixed rate | Smooths output | Can add queueing latency |"
      },
      {
        "title": "Where to Enforce",
        "body": "| Location | Good for | Caveat |\n|---|---|---|\n| CDN/WAF | Global abuse, IP limits | Limited user context |\n| API gateway | Authenticated users, tenants, endpoints | Must be highly available |\n| Service method | Resource-specific rules | Duplicated implementation risk |\n| Async consumers | Downstream protection | Does not protect request path |\n\nRate limits are usually layered: coarse IP limits at the edge, user/tenant limits at the gateway, and resource-specific limits in services."
      },
      {
        "title": "Distributed Limiters",
        "body": "A distributed limiter needs consistent decisions without adding too much latency.\n\n| Option | Pros | Cons |\n|---|---|---|\n| Central Redis counter | Simple atomic increments with TTL | Cross-region latency and Redis hotspot |\n| Local approximate buckets | Very low latency | Can exceed global limit during bursts |\n| Sharded counters | Higher throughput | Requires routing and aggregation |\n| Quota leasing | Regions lease chunks of quota | Temporary unfairness if traffic shifts |\n\n> **Interview tip:** State the identity key: IP, API key, user ID, tenant ID, endpoint, or a compound key. The wrong key either blocks good users or lets abuse through."
      },
      {
        "title": "Headers, UX, and Pitfalls",
        "body": "Return useful signals: status 429, retry-after time, current limit, and reset timestamp when safe. For paid APIs, also expose dashboards and alerts.\n\nPitfalls include trusting spoofed IP headers, counting failed auth attempts the same as successful requests, and making the limiter a single point of failure. Decide fail-open or fail-closed per endpoint."
      }
    ],
    "diagrams": [
      {
        "title": "Gateway token bucket",
        "nodes": [
          {
            "id": "client",
            "label": "Client",
            "kind": "client",
            "col": 0,
            "row": 2
          },
          {
            "id": "edge",
            "label": "Edge / WAF",
            "kind": "gateway",
            "col": 1,
            "row": 2
          },
          {
            "id": "gateway",
            "label": "API Gateway",
            "kind": "gateway",
            "col": 2,
            "row": 2,
            "detail": "The gateway identifies the caller and endpoint before checking quota. It should return 429 quickly and avoid forwarding rejected requests downstream."
          },
          {
            "id": "limiter",
            "label": "Rate Limit Service",
            "kind": "service",
            "col": 4,
            "row": 2
          },
          {
            "id": "redis",
            "label": "Atomic Counters",
            "kind": "cache",
            "col": 5,
            "row": 1,
            "detail": "Redis or a similar in-memory store keeps token counters with TTLs. Scripts or conditional operations make decrement-and-check atomic."
          },
          {
            "id": "api",
            "label": "Protected API",
            "kind": "service",
            "col": 6,
            "row": 2
          },
          {
            "id": "config",
            "label": "Limit Config",
            "kind": "db",
            "col": 5,
            "row": 4
          },
          {
            "id": "mon",
            "label": "Abuse Metrics",
            "kind": "monitor",
            "col": 7,
            "row": 0
          }
        ],
        "edges": [
          {
            "from": "client",
            "to": "edge",
            "label": "request"
          },
          {
            "from": "edge",
            "to": "gateway",
            "label": "headers"
          },
          {
            "from": "gateway",
            "to": "limiter",
            "label": "check"
          },
          {
            "from": "limiter",
            "to": "redis",
            "label": "tokens"
          },
          {
            "from": "config",
            "to": "limiter",
            "label": "rules"
          },
          {
            "from": "limiter",
            "to": "gateway",
            "label": "allow/deny"
          },
          {
            "from": "gateway",
            "to": "api",
            "label": "allowed"
          },
          {
            "from": "gateway",
            "to": "mon",
            "label": "429s"
          }
        ]
      }
    ],
    "followUps": [
      {
        "q": "Why token bucket over fixed window?",
        "a": "Token bucket allows controlled bursts while maintaining a long-term refill rate; fixed windows have boundary bursts."
      },
      {
        "q": "How do you rate limit globally across regions?",
        "a": "Use quota leasing, sharded counters with replication, or accept approximate local limits with periodic reconciliation."
      },
      {
        "q": "What should happen if the limiter is down?",
        "a": "Fail-open for low-risk reads to preserve availability; fail-closed for expensive or security-sensitive writes."
      },
      {
        "q": "How do you avoid Redis hot keys?",
        "a": "Shard by identity hash, use local prefilters, lease quota to gateways, or isolate heavy tenants."
      },
      {
        "q": "What response should clients see?",
        "a": "HTTP 429 with retry-after and, for APIs, limit/reset metadata when it does not leak abuse-sensitive details."
      },
      {
        "q": "How is rate limiting different from throttling?",
        "a": "Rate limiting rejects or delays above policy; throttling often intentionally slows traffic to protect downstream capacity."
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
        "title": "Envoy rate limit service",
        "url": "https://www.envoyproxy.io/docs/envoy/latest/configuration/http/http_filters/rate_limit_filter",
        "type": "article"
      }
    ]
  },
  {
    "id": "probabilistic-data-structures",
    "title": "Probabilistic Data Structures",
    "category": "Fundamentals",
    "difficulty": "Medium",
    "summary": "Bloom filters, HyperLogLog, and count-min sketch trade small, controlled error for dramatic memory savings in large-scale membership, cardinality, and frequency problems.",
    "tags": [
      "bloom-filter",
      "hyperloglog",
      "count-min-sketch",
      "approximation"
    ],
    "widgets": [
      "bloom-filter"
    ],
    "sections": [
      {
        "title": "Why Approximate?",
        "body": "Exact sets and counters can be too expensive when the input has billions of items or must live in memory at the edge. Probabilistic structures use hashing to answer questions with known error bounds.\n\n| Structure | Answers | Error type | Common use |\n|---|---|---|---|\n| Bloom filter | \"Have we probably seen this key?\" | False positives, no false negatives if not deleted | Cache penetration, crawl dedupe |\n| HyperLogLog | \"How many distinct items?\" | Approximate cardinality | Unique visitors, distinct queries |\n| Count-min sketch | \"How frequent is this item?\" | Overestimates counts | Heavy hitters, abuse detection |"
      },
      {
        "title": "Bloom Filters",
        "body": "A Bloom filter uses m bits and k hash functions. Insert sets k positions to 1. Lookup checks whether all k positions are 1. If any bit is 0, the item is definitely absent; if all are 1, it is probably present.\n\n| Design knob | Effect |\n|---|---|\n| More bits | Lower false positive rate |\n| More hash functions | Helps until too many bits are set |\n| Higher inserted count | Raises false positives |\n| Counting Bloom filter | Supports delete with more memory |\n\n> **Interview tip:** Say \"false positives are acceptable because...\" before proposing a Bloom filter. If a false positive is dangerous, it is the wrong structure."
      },
      {
        "title": "HyperLogLog and Count-Min Sketch",
        "body": "HyperLogLog hashes items and tracks the longest leading-zero patterns across registers. More registers reduce error. It is mergeable, which makes it useful across shards.\n\nCount-min sketch maintains several hashed counter arrays. It returns the minimum counter across rows to reduce collision overcounting. It is also mergeable and works well for streaming heavy hitter detection.\n\n| Requirement | Good fit |\n|---|---|\n| Unique users per day across shards | HyperLogLog |\n| Has URL been crawled before? | Bloom filter |\n| Top abusive API keys | Count-min sketch plus exact table for candidates |"
      },
      {
        "title": "Pitfalls",
        "body": "- Approximate structures need parameter choices tied to expected volume and tolerated error.\n- Bloom filters fill up; rotate or rebuild them for time-windowed data.\n- Count-min sketch overestimates, so use exact verification before enforcement.\n- Hash quality matters; correlated hashes produce surprising error."
      }
    ],
    "diagrams": [
      {
        "title": "Bloom filter before expensive lookup",
        "nodes": [
          {
            "id": "client",
            "label": "Request",
            "kind": "client",
            "col": 0,
            "row": 2
          },
          {
            "id": "api",
            "label": "API Service",
            "kind": "service",
            "col": 1,
            "row": 2
          },
          {
            "id": "bf",
            "label": "Bloom Filter",
            "kind": "cache",
            "col": 3,
            "row": 2,
            "detail": "The Bloom filter quickly rejects keys that are definitely absent. It saves database work but must tolerate false positives that still trigger a backend lookup."
          },
          {
            "id": "miss",
            "label": "Reject Absent",
            "kind": "gateway",
            "col": 4,
            "row": 0
          },
          {
            "id": "db",
            "label": "Primary DB",
            "kind": "db",
            "col": 5,
            "row": 2
          },
          {
            "id": "loader",
            "label": "Filter Builder",
            "kind": "worker",
            "col": 5,
            "row": 4,
            "detail": "A builder periodically rebuilds or rotates filters from source data. This controls saturation and keeps false-positive rates near the designed target."
          },
          {
            "id": "store",
            "label": "Snapshot Store",
            "kind": "storage",
            "col": 7,
            "row": 4
          },
          {
            "id": "mon",
            "label": "FPR Monitor",
            "kind": "monitor",
            "col": 7,
            "row": 1
          }
        ],
        "edges": [
          {
            "from": "client",
            "to": "api",
            "label": "key"
          },
          {
            "from": "api",
            "to": "bf",
            "label": "check"
          },
          {
            "from": "bf",
            "to": "miss",
            "label": "def no"
          },
          {
            "from": "bf",
            "to": "db",
            "label": "maybe"
          },
          {
            "from": "db",
            "to": "api",
            "label": "record"
          },
          {
            "from": "db",
            "to": "loader",
            "label": "scan"
          },
          {
            "from": "loader",
            "to": "store",
            "label": "snapshot"
          },
          {
            "from": "store",
            "to": "bf",
            "label": "load"
          },
          {
            "from": "bf",
            "to": "mon",
            "label": "rate"
          }
        ]
      }
    ],
    "followUps": [
      {
        "q": "Can a Bloom filter return a false negative?",
        "a": "Not for a standard insert-only Bloom filter; deletes or bugs can introduce false negatives."
      },
      {
        "q": "How do you delete from a Bloom filter?",
        "a": "Use a counting Bloom filter or rotate time-windowed filters; standard Bloom filters cannot safely unset shared bits."
      },
      {
        "q": "Why is HyperLogLog useful in distributed systems?",
        "a": "It is compact and mergeable, so shards can estimate global cardinality without sending raw sets."
      },
      {
        "q": "What is count-min sketch bad at?",
        "a": "It overestimates counts due to collisions and should not be the only source for punitive decisions."
      },
      {
        "q": "How do you choose Bloom filter size?",
        "a": "Start from expected insertions and target false-positive rate, then compute bits and hash count; monitor saturation."
      },
      {
        "q": "What are common use cases?",
        "a": "Crawler dedupe, cache penetration protection, unique visitor counts, streaming heavy hitters, and approximate analytics."
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
        "title": "Redis probabilistic data structures",
        "url": "https://redis.io/docs/latest/develop/data-types/probabilistic/",
        "type": "article"
      },
      {
        "title": "HyperLogLog paper",
        "url": "https://algo.inria.fr/flajolet/Publications/FlFuGaMe07.pdf",
        "type": "paper"
      }
    ]
  },
  {
    "id": "api-design-rest-grpc-graphql",
    "title": "API Design (REST/gRPC/GraphQL, Pagination, Idempotency Keys)",
    "category": "Fundamentals",
    "difficulty": "Medium",
    "summary": "Good APIs expose stable product contracts, handle retries safely, and make performance characteristics visible through pagination, versioning, and error semantics.",
    "tags": [
      "api",
      "rest",
      "grpc",
      "graphql",
      "pagination",
      "idempotency"
    ],
    "sections": [
      {
        "title": "Protocol Choices",
        "body": "| Style | Strength | Weakness | Use when |\n|---|---|---|---|\n| REST/HTTP JSON | Simple, cacheable, human-readable | Over/under-fetching; weaker schema | Public APIs, CRUD resources |\n| gRPC | Strong contracts, streaming, efficient binary | Browser/proxy friction; less human-readable | Internal service-to-service calls |\n| GraphQL | Client-selected fields and graph traversal | Query cost control and caching are harder | Multiple clients need flexible reads |\n| Events/webhooks | Async integration | Delivery retries and idempotency required | Notifications and state changes |\n\nPick by caller needs. A public fintech API might expose REST for compatibility and use gRPC internally for typed low-latency calls."
      },
      {
        "title": "Pagination",
        "body": "| Method | Pros | Cons |\n|---|---|---|\n| Offset/limit | Easy for humans and SQL | Slow/deceptive on large changing data |\n| Cursor | Stable for changing lists | Opaque token handling |\n| Keyset | Efficient using ordered index | Requires deterministic sort key |\n\nCursor tokens should include the last sort key, direction, filters, and possibly a signature to prevent tampering. Always specify ordering; pagination without ordering is undefined."
      },
      {
        "title": "Idempotency and Errors",
        "body": "Idempotency keys let clients safely retry a request that may have succeeded before the connection failed.\n\n~~~http\nPOST /payments\nIdempotency-Key: tenant_123:6b145...\n{\n  \"amount_cents\": 1999,\n  \"currency\": \"USD\",\n  \"source\": \"tok_abc\"\n}\n~~~\n\nStore the key, request hash, status, and response for a retention window. If the same key arrives with a different request body, return a conflict.\n\n| Status | Meaning |\n|---|---|\n| 400 | Invalid request that client can fix |\n| 401/403 | Authentication or authorization problem |\n| 404 | Resource not found or hidden |\n| 409 | Version conflict or duplicate incompatible idempotency key |\n| 429 | Rate limited; include retry guidance |\n| 5xx | Server failure; safe retries depend on idempotency |"
      },
      {
        "title": "Versioning and Pitfalls",
        "body": "Backward compatibility is an architecture feature. Prefer additive fields, tolerant readers, deprecation windows, and explicit version negotiation for breaking changes.\n\n> **Interview tip:** In design interviews, APIs are not syntax decoration. They reveal synchronous vs asynchronous boundaries, identity, authorization, and data ownership."
      }
    ],
    "diagrams": [
      {
        "title": "API gateway contract path",
        "nodes": [
          {
            "id": "client",
            "label": "Web/Mobile Client",
            "kind": "client",
            "col": 0,
            "row": 2
          },
          {
            "id": "gateway",
            "label": "API Gateway",
            "kind": "gateway",
            "col": 1,
            "row": 2,
            "detail": "The gateway terminates public protocol concerns: auth, rate limits, request IDs, version routing, and coarse validation. It should not own business state."
          },
          {
            "id": "rest",
            "label": "REST Controller",
            "kind": "service",
            "col": 3,
            "row": 1
          },
          {
            "id": "grpc",
            "label": "gRPC Backend",
            "kind": "service",
            "col": 4,
            "row": 3
          },
          {
            "id": "idemp",
            "label": "Idempotency Store",
            "kind": "db",
            "col": 5,
            "row": 0,
            "detail": "The idempotency store records keys, request hashes, and completed responses. It turns ambiguous client retries into deterministic replay or conflict responses."
          },
          {
            "id": "svc",
            "label": "Domain Service",
            "kind": "service",
            "col": 5,
            "row": 2
          },
          {
            "id": "db",
            "label": "Resource DB",
            "kind": "db",
            "col": 7,
            "row": 2
          },
          {
            "id": "events",
            "label": "Webhook Events",
            "kind": "queue",
            "col": 7,
            "row": 4
          }
        ],
        "edges": [
          {
            "from": "client",
            "to": "gateway",
            "label": "HTTP"
          },
          {
            "from": "gateway",
            "to": "rest",
            "label": "v1"
          },
          {
            "from": "rest",
            "to": "idemp",
            "label": "check"
          },
          {
            "from": "rest",
            "to": "grpc",
            "label": "internal"
          },
          {
            "from": "grpc",
            "to": "svc",
            "label": "typed"
          },
          {
            "from": "svc",
            "to": "db",
            "label": "commit"
          },
          {
            "from": "svc",
            "to": "events",
            "label": "publish"
          },
          {
            "from": "idemp",
            "to": "rest",
            "label": "replay"
          }
        ]
      }
    ],
    "followUps": [
      {
        "q": "When is cursor pagination better than offset?",
        "a": "When lists are large or changing because cursors keep progress tied to a stable sort key."
      },
      {
        "q": "How do idempotency keys differ from request IDs?",
        "a": "Request IDs trace a request; idempotency keys define retry equivalence for a business operation."
      },
      {
        "q": "Why use gRPC internally?",
        "a": "Typed contracts, efficient encoding, deadlines, and streaming can improve service-to-service reliability."
      },
      {
        "q": "What is hard about GraphQL?",
        "a": "Caching, authorization per field, query cost limits, and N+1 resolver calls require careful controls."
      },
      {
        "q": "How do you version an API?",
        "a": "Prefer additive changes; for breaking changes use path/header versions, compatibility windows, and clear migration tooling."
      },
      {
        "q": "What makes an API interview-ready?",
        "a": "Defined resources, auth, pagination, error codes, idempotency, rate limits, and async callbacks where needed."
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
        "title": "gRPC concepts",
        "url": "https://grpc.io/docs/what-is-grpc/core-concepts/",
        "type": "article"
      },
      {
        "title": "GraphQL best practices",
        "url": "https://graphql.org/learn/best-practices/",
        "type": "article"
      }
    ]
  },
  {
    "id": "distributed-systems-patterns",
    "title": "Distributed Systems Patterns",
    "category": "Fundamentals",
    "difficulty": "Hard",
    "summary": "Consensus, leader election, locks, sagas, outbox, CDC, retries, jitter, and circuit breakers are reusable tools for surviving partial failure.",
    "tags": [
      "consensus",
      "raft",
      "saga",
      "outbox",
      "cdc",
      "circuit-breaker"
    ],
    "sections": [
      {
        "title": "Consensus and Leader Election",
        "body": "Consensus lets a group agree on an ordered log despite failures. Raft explains this through leaders, terms, log replication, and majority agreement. You do not need to implement Raft in an interview, but you should know when you need a consensus-backed service.\n\n| Need | Pattern |\n|---|---|\n| Exactly one active scheduler | Leader election with lease and fencing token |\n| Cluster metadata | Consensus-backed key-value store |\n| Distributed lock | Lease with expiration plus fencing token |\n| Ordered replicated state | Consensus log |\n\n> **Interview tip:** A distributed lock without fencing can still corrupt data if an old holder pauses and resumes after its lease expired."
      },
      {
        "title": "Sagas, Outbox, and CDC",
        "body": "| Pattern | Purpose | Trade-off |\n|---|---|---|\n| Saga | Break a cross-service transaction into local steps and compensations | Temporary inconsistency and compensation logic |\n| Transactional outbox | Store domain change and outgoing event in one local transaction | Requires relay and dedupe |\n| CDC | Stream database changes to downstream systems | Lag and schema evolution handling |\n| Event sourcing | Store events as source of truth | Query complexity and event versioning |\n\nOutbox is especially useful when a service must update its database and publish an event without losing one side of the dual write."
      },
      {
        "title": "Retries, Jitter, and Circuit Breakers",
        "body": "| Pattern | Helps with | Important detail |\n|---|---|---|\n| Timeout | Avoids stuck callers | Use deadlines, not infinite waits |\n| Retry | Handles transient failure | Retry only safe/idempotent operations |\n| Exponential backoff | Reduces pressure after failure | Cap the delay |\n| Jitter | Avoids synchronized retries | Randomize delay per caller |\n| Circuit breaker | Stops calling a failing dependency | Include half-open probes and metrics |\n| Bulkhead | Isolates resource pools | Prevents one dependency from exhausting all threads |"
      },
      {
        "title": "When to Use Which Pattern",
        "body": "- Use consensus for small critical metadata, not for every user request.\n- Use sagas when business workflows span services and compensations are acceptable.\n- Use outbox/CDC when downstream systems need reliable derived updates.\n- Use circuit breakers when failing dependencies can cause cascading failure.\n- Use idempotency keys whenever clients or workers may retry side effects.\n\nThe strongest answers explain the failure the pattern prevents, not only the pattern name."
      }
    ],
    "diagrams": [
      {
        "title": "Outbox with reliable event publication",
        "nodes": [
          {
            "id": "client",
            "label": "Client",
            "kind": "client",
            "col": 0,
            "row": 2
          },
          {
            "id": "api",
            "label": "Order Service",
            "kind": "service",
            "col": 2,
            "row": 2,
            "detail": "The service performs the local business transaction and writes an outbox row in the same database commit. This avoids the classic dual-write gap between DB commit and message publish."
          },
          {
            "id": "db",
            "label": "Service DB",
            "kind": "db",
            "col": 4,
            "row": 2
          },
          {
            "id": "outbox",
            "label": "Outbox Table",
            "kind": "db",
            "col": 4,
            "row": 4
          },
          {
            "id": "relay",
            "label": "Outbox Relay",
            "kind": "worker",
            "col": 5,
            "row": 4,
            "detail": "The relay polls or tails outbox rows and publishes events with stable IDs. It marks rows sent only after the broker acknowledges them."
          },
          {
            "id": "broker",
            "label": "Event Broker",
            "kind": "stream",
            "col": 6,
            "row": 2
          },
          {
            "id": "consumer",
            "label": "Idempotent Consumer",
            "kind": "worker",
            "col": 7,
            "row": 1
          },
          {
            "id": "mon",
            "label": "Retry Metrics",
            "kind": "monitor",
            "col": 7,
            "row": 4
          }
        ],
        "edges": [
          {
            "from": "client",
            "to": "api",
            "label": "command"
          },
          {
            "from": "api",
            "to": "db",
            "label": "transaction"
          },
          {
            "from": "api",
            "to": "outbox",
            "label": "same commit"
          },
          {
            "from": "relay",
            "to": "outbox",
            "label": "read"
          },
          {
            "from": "relay",
            "to": "broker",
            "label": "publish"
          },
          {
            "from": "broker",
            "to": "consumer",
            "label": "event"
          },
          {
            "from": "consumer",
            "to": "mon",
            "label": "dedupe"
          },
          {
            "from": "relay",
            "to": "mon",
            "label": "lag"
          }
        ]
      }
    ],
    "followUps": [
      {
        "q": "What is Raft used for?",
        "a": "Replicating a small ordered log for metadata, leader election, or configuration where majority agreement is required."
      },
      {
        "q": "Why do distributed locks need fencing?",
        "a": "A paused client may resume after lease expiry; fencing tokens let downstream systems reject stale holders."
      },
      {
        "q": "How does outbox prevent dual-write bugs?",
        "a": "The state change and outgoing event are stored in the same local transaction, then a relay publishes reliably."
      },
      {
        "q": "When are sagas inappropriate?",
        "a": "When compensation cannot restore correctness, such as some irreversible money movements without ledger controls."
      },
      {
        "q": "Why add jitter to retries?",
        "a": "It prevents many clients from retrying at the same moments and amplifying an outage."
      },
      {
        "q": "What is a circuit breaker half-open state?",
        "a": "A limited probe mode used to test whether a dependency recovered before fully resuming traffic."
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
        "title": "Raft paper",
        "url": "https://raft.github.io/raft.pdf",
        "type": "paper"
      },
      {
        "title": "Transactional outbox pattern",
        "url": "https://microservices.io/patterns/data/transactional-outbox.html",
        "type": "article"
      },
      {
        "title": "Release It!",
        "url": "https://pragprog.com/titles/mnee2/release-it-second-edition/",
        "type": "book"
      }
    ]
  }
]

export default docs
