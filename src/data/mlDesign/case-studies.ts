import type { DesignDoc } from '../../types/content'

const docs: DesignDoc[] = [
  {
    id: `video-content-recommendation`,
    title: `Video / Content Recommendation`,
    category: `Recommendation`,
    difficulty: `Hard`,
    summary: `Design a YouTube-style recommendation system that retrieves, ranks, diversifies, and monitors personalized video feeds.`,
    tags: [
      `recommendation`,
      `ranking`,
      `two-tower`,
      `watch-time`,
      `personalization`,
    ],
    sections: [
      {
        title: `Clarify Requirements & Scope`,
        body: `- Define the surface: home feed, next-up, shorts, or notifications. Each surface has different intent, latency, and diversity expectations.
- Clarify scale: active users, catalog size, requests per second, average candidates scored, and freshness target for new uploads.
- Decide whether the goal is short-term watch time, long-term retention, creator ecosystem health, or satisfaction surveys.
- Ask for safety constraints: age appropriateness, misinformation policy, repetitive content, and creator or topic diversity.
- Specify fallback behavior for anonymous users, new users, new videos, and feature-store outages.`,
      },
      {
        title: `Frame as an ML Problem`,
        body: `| Element | Design choice |
| --- | --- |
| Inputs | user id or session, device, locale, time, recent watch/search history, candidate video metadata, creator graph, and context surface. |
| Output | an ordered list of videos plus reasons, diversity constraints, and optional exploration slots. |
| ML objective | estimate expected utility per user-video-context pair, often combining click probability, watch time, satisfaction, and safety penalties. |
| Business objective | increase long-term satisfied engagement without harming safety, creator fairness, latency, or user trust. |

The system should expose model confidence and support deterministic fallbacks so product policy can decide what to do with uncertain predictions.`,
      },
      {
        title: `Metrics`,
        body: `| Metric layer | Examples |
| --- | --- |
| Offline | candidate recall@K, NDCG@K, watch-time weighted log loss, calibration by user segment, diversity/novelty metrics. |
| Online | watch time per session, return rate, likes/dislikes, survey satisfaction, creator follows, session starts. |
| Guardrails | hide/report rate, harmful-content exposure, creator concentration, p95 latency, stale-content rate, recommendation repetition. |

Pick one primary metric before discussing models; otherwise architecture debates become ungrounded.`,
      },
      {
        title: `Data & Labeling`,
        body: `- Sources: impression logs, watch events, skips, likes, dislikes, searches, subscriptions, video metadata, creator metadata, moderation labels, and survey feedback.
- Label definition: positive labels can be click, long watch, completion, like, or satisfied watch; define the horizon and whether impressions with no click are negatives.
- Delays and maturity: clicks arrive immediately, watch-time matures after playback, satisfaction surveys are sparse, and moderation outcomes can arrive much later.
- Bias and quality risks: logs are biased by the existing recommender, position, thumbnails, autoplay, popularity, and users who never saw unexposed videos.
- Store the prediction timestamp, exposure context, model version, and later outcome so evaluation can reconstruct exactly what the system knew at serving time.`,
      },
      {
        title: `Feature Engineering`,
        body: `| Feature group | Examples | Notes |
| --- | --- | --- |
| User | recent watches, topic affinities, subscription graph, language, device | Use decayed windows and avoid storing sensitive interests unnecessarily. |
| Item | title embeddings, thumbnail embeddings, creator, age, duration, topic, safety state | Fresh uploads need content and creator priors before interactions accumulate. |
| Context | surface, time of day, network, session depth, previous item | Context changes the value of novelty and video length. |
| Cross | user-topic affinity, creator affinity, similarity to last watch | Cross features drive personalization but are expensive online. |
| Graph/embedding | two-tower user/video vectors, co-watch graph, sequence embeddings | Useful for candidate generation and cold-ish recommendations. |`,
      },
      {
        title: `Model Architecture`,
        body: `- Baseline: popular and fresh videos by region/language with subscribed-channel boosts and safety filters.
- Production model: multi-stage funnel: candidate generators from subscriptions, co-watch, ANN two-tower retrieval, and trending; lightweight pre-ranker; deep ranker; post-ranking diversity and policy layer.
- Why this model: The catalog is too large to score exhaustively, and ranking quality depends on both memorized sparse IDs and dense sequence/content signals.
- Funnel or ensemble: Candidate generation optimizes recall, ranking optimizes utility, and post-processing enforces diversity, freshness, quotas, and safety.
- Keep the simplest model that clears the launch bar; add capacity only when data volume, latency budget, and monitoring maturity justify it.`,
      },
      {
        title: `Training`,
        body: `- Sampling: Sample from impressed candidates with position and surface context; add random exploration traffic to reduce policy bias.
- Negatives and counterexamples: Unclicked impressions are weak negatives; skips and hides are stronger negatives; sample hard negatives from retrieved but ignored similar videos.
- Imbalance: Clicks and likes are sparse relative to impressions; use weighted losses and per-user/session normalization so heavy users do not dominate.
- Loss: Multi-task loss for click, watch time, satisfaction, and hide/report risk, for example weighted log loss plus regression loss for watch duration.
- Validation: Time-based split with user-level grouping, slice metrics for new users/videos/languages, and replay of candidate recall before ranker evaluation.`,
      },
      {
        title: `Serving & Infrastructure`,
        body: `- Latency budget: Typical home feed budget might be 150-300 ms p95; reserve time for feature fetch, candidate retrieval, ranking, and post-processing.
- Caching and precomputation: Precompute user embeddings, creator/topic affinities, and candidate pools; cache anonymous or cold-start feeds by region and language.
- Batch vs real-time: Batch train embeddings and item features; update fresh popularity and recent user actions through streaming features.
- Reliability: Fallback to cached candidates or regional trending feed when model serving, ANN, or feature store is degraded.
- Log decisions asynchronously and design a safe fallback for model, feature store, or downstream service failures.`,
      },
      {
        title: `Monitoring & Iteration`,
        body: `- Track score distribution, candidate-source mix, content freshness, creator concentration, safety exposure, and engagement by cohort.
- Monitor exploration slots separately so their lower immediate CTR is not mistaken for a regression.
- Retrain on a regular cadence and trigger investigation when new-item performance, long-tail coverage, or satisfaction drops.`,
      },
      {
        title: `Trade-offs & Pitfalls`,
        body: `- Watch time can reward addictive or low-quality content; satisfaction and safety guardrails must constrain the objective.
- More personalization can reduce diversity and trap users in repetitive topics.
- Fresh content needs exposure for learning, but too much exploration hurts near-term experience.
- Large sequence models improve quality but increase inference cost and complicate explanation.`,
      },
      {
        title: `What Great Answers Mention`,
        body: `- Separate candidate generation, ranking, and post-ranking policy instead of proposing one giant model.
- Discuss position bias, feedback loops, and exploration traffic.
- Use multiple labels, not just clicks, and mention satisfaction or long-term retention.
- Add safety, diversity, creator ecosystem, and latency guardrails.
- Explain new user and new video cold-start paths.`,
      },
    ],
    diagrams: [
      {
        title: `Video / Content Recommendation training pipeline`,
        nodes: [
          {
            id: `events`,
            label: `Event Logs`,
            kind: `stream`,
            col: 0,
            row: 1,
            detail: `Raw recommendation interactions with timestamps, entities, and exposure context.`,
          },
          {
            id: `warehouse`,
            label: `Warehouse`,
            kind: `storage`,
            col: 1,
            row: 1,
          },
          {
            id: `labels`,
            label: `Labels`,
            kind: `db`,
            col: 2,
            row: 0,
            detail: `positive labels can be click, long watch, completion, like, or satisfied watch; define the horizon and whether impressions with no click are negatives.`,
          },
          {
            id: `features`,
            label: `Feature Store`,
            kind: `feature-store`,
            col: 2,
            row: 2,
            detail: `Point-in-time features shared by training and serving.`,
          },
          {
            id: `sampler`,
            label: `Sampler`,
            kind: `worker`,
            col: 3,
            row: 1,
          },
          {
            id: `trainer`,
            label: `Trainer`,
            kind: `worker`,
            col: 4,
            row: 1,
          },
          {
            id: `model`,
            label: `Model Artifact`,
            kind: `model`,
            col: 5,
            row: 1,
            detail: `Versioned model with schema, metrics, and rollback metadata.`,
          },
          {
            id: `eval`,
            label: `Offline Eval`,
            kind: `monitor`,
            col: 6,
            row: 0,
          },
          {
            id: `registry`,
            label: `Registry`,
            kind: `storage`,
            col: 7,
            row: 1,
          },
        ],
        edges: [
          {
            from: `events`,
            to: `warehouse`,
            label: `ingest`,
          },
          {
            from: `warehouse`,
            to: `labels`,
            label: `outcomes`,
          },
          {
            from: `warehouse`,
            to: `features`,
            label: `joins`,
          },
          {
            from: `labels`,
            to: `sampler`,
            label: `targets`,
          },
          {
            from: `features`,
            to: `sampler`,
            label: `examples`,
          },
          {
            from: `sampler`,
            to: `trainer`,
            label: `batches`,
          },
          {
            from: `trainer`,
            to: `model`,
            label: `train`,
          },
          {
            from: `model`,
            to: `eval`,
            label: `score`,
          },
          {
            from: `eval`,
            to: `registry`,
            label: `approve`,
          },
        ],
      },
      {
        title: `Video / Content Recommendation serving path`,
        nodes: [
          {
            id: `client`,
            label: `Client`,
            kind: `client`,
            col: 0,
            row: 1,
          },
          {
            id: `api`,
            label: `API Gateway`,
            kind: `gateway`,
            col: 1,
            row: 1,
            detail: `Receives the video / content recommendation request and enforces auth, policy, and request budgets.`,
          },
          {
            id: `cache`,
            label: `Cache`,
            kind: `cache`,
            col: 2,
            row: 0,
          },
          {
            id: `features`,
            label: `Online Features`,
            kind: `feature-store`,
            col: 2,
            row: 2,
          },
          {
            id: `candidates`,
            label: `Candidates`,
            kind: `search`,
            col: 3,
            row: 1,
            detail: `Retrieves a manageable set before expensive scoring.`,
          },
          {
            id: `ranker`,
            label: `Model`,
            kind: `model`,
            col: 4,
            row: 1,
            detail: `Scores candidates or predicts risk under the latency budget.`,
          },
          {
            id: `policy`,
            label: `Policy`,
            kind: `service`,
            col: 5,
            row: 1,
            detail: `Applies thresholds, business rules, diversity, safety, or pacing constraints.`,
          },
          {
            id: `logs`,
            label: `Decision Logs`,
            kind: `stream`,
            col: 6,
            row: 2,
          },
          {
            id: `monitor`,
            label: `Monitor`,
            kind: `monitor`,
            col: 7,
            row: 1,
          },
        ],
        edges: [
          {
            from: `client`,
            to: `api`,
            label: `request`,
          },
          {
            from: `api`,
            to: `cache`,
            label: `read`,
          },
          {
            from: `api`,
            to: `features`,
            label: `lookup`,
          },
          {
            from: `features`,
            to: `candidates`,
            label: `context`,
          },
          {
            from: `candidates`,
            to: `ranker`,
            label: `items`,
          },
          {
            from: `ranker`,
            to: `policy`,
            label: `scores`,
          },
          {
            from: `policy`,
            to: `client`,
            label: `response`,
          },
          {
            from: `policy`,
            to: `logs`,
            label: `log`,
            dashed: true,
          },
          {
            from: `logs`,
            to: `monitor`,
            label: `metrics`,
          },
        ],
      },
    ],
    widgets: [
      `recsys-funnel`,
    ],
    followUps: [
      {
        q: `What would you ship as the first version?`,
        a: `A regional trending/subscription baseline with a simple learning-to-rank model on impressed candidates, strict safety filters, and logging for future training.`,
      },
      {
        q: `How do you handle cold start or sparse history?`,
        a: `Use locale, device, onboarding interests, search context, subscriptions, item content embeddings, creator priors, and exploration slots until behavior accumulates.`,
      },
      {
        q: `What is the most likely offline-online gap?`,
        a: `The model learns only from videos exposed by the old policy; position and thumbnail effects can make offline NDCG overstate online lift.`,
      },
      {
        q: `How do you keep latency within budget?`,
        a: `Precompute candidate pools and embeddings, use ANN for retrieval, batch ranker inference, cap candidate counts, and cache safe fallback feeds.`,
      },
      {
        q: `How do you detect model degradation?`,
        a: `Watch segment-level engagement, hides/reports, safety exposure, candidate-source distribution, fresh-video coverage, score drift, and latency.`,
      },
      {
        q: `What is the hardest product trade-off?`,
        a: `Short-term watch time versus long-term satisfaction and content diversity.`,
      },
      {
        q: `How would you make the system safer or fairer?`,
        a: `Enforce policy filters before and after ranking, downrank borderline content, monitor vulnerable cohorts, and audit creator/topic concentration.`,
      },
    ],
    resources: [
      {
        title: `Deep Neural Networks for YouTube Recommendations`,
        url: `https://research.google/pubs/deep-neural-networks-for-youtube-recommendations/`,
        type: `paper`,
      },
      {
        title: `Wide & Deep Learning for Recommender Systems`,
        url: `https://arxiv.org/abs/1606.07792`,
        type: `paper`,
      },
      {
        title: `DLRM: Deep Learning Recommendation Model`,
        url: `https://arxiv.org/abs/1906.00091`,
        type: `paper`,
      },
      {
        title: `TensorFlow Recommenders`,
        url: `https://www.tensorflow.org/recommenders`,
        type: `article`,
      },
    ],
  },
  {
    id: `personalized-news-feed-ranking`,
    title: `Personalized News Feed Ranking`,
    category: `Recommendation`,
    difficulty: `Hard`,
    summary: `Rank social or news feed stories by predicted value while balancing freshness, diversity, integrity, and feedback loops.`,
    tags: [
      `feed`,
      `ranking`,
      `social`,
      `freshness`,
      `integrity`,
    ],
    sections: [
      {
        title: `Clarify Requirements & Scope`,
        body: `- Clarify whether the feed contains friend posts, publisher articles, groups, ads, or all of them; each source has different policy constraints.
- Define recency expectations: breaking news may need seconds of freshness while evergreen posts can be cached.
- Ask whether ranking should optimize clicks, meaningful interactions, dwell time, creator follows, or long-term retention.
- Scope integrity requirements: misinformation, spam, duplicate content, sensitive topics, and political or age-related constraints.
- Decide if explanations such as because you follow X are required for transparency.`,
      },
      {
        title: `Frame as an ML Problem`,
        body: `| Element | Design choice |
| --- | --- |
| Inputs | viewer, candidate story/post, author relationship, social graph, content text/media, recency, prior impressions, and session context. |
| Output | a ranked feed page with deduplication, source diversity, and optional reason codes. |
| ML objective | predict expected feed value from interactions such as click, dwell, comment, share, hide, and negative feedback. |
| Business objective | increase meaningful engagement and retention while protecting integrity, user control, and trust. |

The system should expose model confidence and support deterministic fallbacks so product policy can decide what to do with uncertain predictions.`,
      },
      {
        title: `Metrics`,
        body: `| Metric layer | Examples |
| --- | --- |
| Offline | NDCG@K, pairwise accuracy, multi-task log loss, calibration, source diversity, freshness error. |
| Online | feed sessions, meaningful interactions, return rate, follows, dwell time, survey value. |
| Guardrails | hides, reports, spam/misinformation exposure, author concentration, p95 latency, complaint rate, filter bubble measures. |

Pick one primary metric before discussing models; otherwise architecture debates become ungrounded.`,
      },
      {
        title: `Data & Labeling`,
        body: `- Sources: feed impressions, clicks, reactions, comments, shares, hides, reports, follows, graph edges, content embeddings, integrity classifier outputs, and surveys.
- Label definition: multi-label outcomes after an impression: positive interactions, dwell thresholds, negative feedback, and long-term return within a horizon.
- Delays and maturity: clicks and reactions are fast, comments/shares lag, reports and misinformation labels may arrive after review.
- Bias and quality risks: the prior feed policy, position, notification pushes, author popularity, and social graph homophily shape observed labels.
- Store the prediction timestamp, exposure context, model version, and later outcome so evaluation can reconstruct exactly what the system knew at serving time.`,
      },
      {
        title: `Feature Engineering`,
        body: `| Feature group | Examples | Notes |
| --- | --- | --- |
| Viewer | interests, follows, recent dwell, hide history, language | User controls should override model preference. |
| Story | age, topic, media type, text/media embeddings, integrity score | Freshness and policy state can change quickly. |
| Author/graph | relationship strength, mutual groups, past interactions | Important for social relevance but can amplify echo chambers. |
| Context | session depth, device, network, time, feed surface | Affects media length and ranking diversity. |
| Cross | viewer-author affinity, viewer-topic affinity, similarity to previous impressions | Used by the ranker and post-ranking deduper. |`,
      },
      {
        title: `Model Architecture`,
        body: `- Baseline: reverse-chronological feed with followed sources, simple popularity, and integrity filters.
- Production model: source-specific candidate generators followed by a multi-task ranking model and post-ranking constraints for diversity, freshness, deduplication, and integrity.
- Why this model: Feed value is multi-objective and highly personalized; a multi-task model can learn trade-offs among clicks, meaningful interactions, and negative feedback.
- Funnel or ensemble: Candidate pools from graph, followed publishers, groups, and trending; ranker scores; policy layer blends recency, diversity, and user controls.
- Keep the simplest model that clears the launch bar; add capacity only when data volume, latency budget, and monitoring maturity justify it.`,
      },
      {
        title: `Training`,
        body: `- Sampling: Train from logged impressions with user-level grouping; include fresh-story exploration and downsample very active users.
- Negatives and counterexamples: Ignored impressions and quick scrolls are weak negatives; hides, reports, and unfollows are strong negatives.
- Imbalance: Shares/reports are rare, so use task weights, focal loss for rare outcomes, and calibration per label.
- Loss: Weighted multi-task logistic losses for click/comment/share/hide plus optional pairwise ranking loss for ordering.
- Validation: Time split by impression time, slice by source type, follower graph distance, geography, language, and integrity category.`,
      },
      {
        title: `Serving & Infrastructure`,
        body: `- Latency budget: Feed page p95 may be 200-500 ms depending on fanout; candidate generation should be bounded before ranker scoring.
- Caching and precomputation: Cache candidate lists, author features, content embeddings, and integrity scores; compute recent viewer actions in streaming state.
- Batch vs real-time: Batch build graph/content features; real-time update new posts, reactions, hides, and breaking-news boosts.
- Reliability: Fallback to chronological followed content or cached ranked pages when candidate services fail.
- Log decisions asynchronously and design a safe fallback for model, feature store, or downstream service failures.`,
      },
      {
        title: `Monitoring & Iteration`,
        body: `- Monitor source mix, integrity exposure, user controls, negative feedback, freshness, and engagement by cohort.
- Track distribution shifts during elections, disasters, major sports events, or policy launches.
- Use holdbacks and long-term metrics to avoid optimizing for short-lived novelty.`,
      },
      {
        title: `Trade-offs & Pitfalls`,
        body: `- Freshness versus predicted relevance.
- Engagement versus integrity and user well-being.
- Personalization versus diversity and editorial balance.
- Exploration of new sources versus trust in familiar authors.`,
      },
      {
        title: `What Great Answers Mention`,
        body: `- Mention multi-task objectives and negative feedback, not just CTR.
- Discuss graph fanout, candidate generation, and post-ranking policy.
- Call out position bias, feedback loops, and long-term retention.
- Include integrity classifiers and user controls as first-class constraints.
- Measure slices around fresh posts, new users, source types, and sensitive topics.`,
      },
    ],
    diagrams: [
      {
        title: `Personalized News Feed Ranking training pipeline`,
        nodes: [
          {
            id: `events`,
            label: `Event Logs`,
            kind: `stream`,
            col: 0,
            row: 1,
            detail: `Raw recommendation interactions with timestamps, entities, and exposure context.`,
          },
          {
            id: `warehouse`,
            label: `Warehouse`,
            kind: `storage`,
            col: 1,
            row: 1,
          },
          {
            id: `labels`,
            label: `Labels`,
            kind: `db`,
            col: 2,
            row: 0,
            detail: `multi-label outcomes after an impression: positive interactions, dwell thresholds, negative feedback, and long-term return within a horizon.`,
          },
          {
            id: `features`,
            label: `Feature Store`,
            kind: `feature-store`,
            col: 2,
            row: 2,
            detail: `Point-in-time features shared by training and serving.`,
          },
          {
            id: `sampler`,
            label: `Sampler`,
            kind: `worker`,
            col: 3,
            row: 1,
          },
          {
            id: `trainer`,
            label: `Trainer`,
            kind: `worker`,
            col: 4,
            row: 1,
          },
          {
            id: `model`,
            label: `Model Artifact`,
            kind: `model`,
            col: 5,
            row: 1,
            detail: `Versioned model with schema, metrics, and rollback metadata.`,
          },
          {
            id: `eval`,
            label: `Offline Eval`,
            kind: `monitor`,
            col: 6,
            row: 0,
          },
          {
            id: `registry`,
            label: `Registry`,
            kind: `storage`,
            col: 7,
            row: 1,
          },
        ],
        edges: [
          {
            from: `events`,
            to: `warehouse`,
            label: `ingest`,
          },
          {
            from: `warehouse`,
            to: `labels`,
            label: `outcomes`,
          },
          {
            from: `warehouse`,
            to: `features`,
            label: `joins`,
          },
          {
            from: `labels`,
            to: `sampler`,
            label: `targets`,
          },
          {
            from: `features`,
            to: `sampler`,
            label: `examples`,
          },
          {
            from: `sampler`,
            to: `trainer`,
            label: `batches`,
          },
          {
            from: `trainer`,
            to: `model`,
            label: `train`,
          },
          {
            from: `model`,
            to: `eval`,
            label: `score`,
          },
          {
            from: `eval`,
            to: `registry`,
            label: `approve`,
          },
        ],
      },
      {
        title: `Personalized News Feed Ranking serving path`,
        nodes: [
          {
            id: `client`,
            label: `Client`,
            kind: `client`,
            col: 0,
            row: 1,
          },
          {
            id: `api`,
            label: `API Gateway`,
            kind: `gateway`,
            col: 1,
            row: 1,
            detail: `Receives the personalized news feed ranking request and enforces auth, policy, and request budgets.`,
          },
          {
            id: `cache`,
            label: `Cache`,
            kind: `cache`,
            col: 2,
            row: 0,
          },
          {
            id: `features`,
            label: `Online Features`,
            kind: `feature-store`,
            col: 2,
            row: 2,
          },
          {
            id: `candidates`,
            label: `Candidates`,
            kind: `service`,
            col: 3,
            row: 1,
            detail: `Retrieves a manageable set before expensive scoring.`,
          },
          {
            id: `ranker`,
            label: `Model`,
            kind: `model`,
            col: 4,
            row: 1,
            detail: `Scores candidates or predicts risk under the latency budget.`,
          },
          {
            id: `policy`,
            label: `Policy`,
            kind: `service`,
            col: 5,
            row: 1,
            detail: `Applies thresholds, business rules, diversity, safety, or pacing constraints.`,
          },
          {
            id: `logs`,
            label: `Decision Logs`,
            kind: `stream`,
            col: 6,
            row: 2,
          },
          {
            id: `monitor`,
            label: `Monitor`,
            kind: `monitor`,
            col: 7,
            row: 1,
          },
        ],
        edges: [
          {
            from: `client`,
            to: `api`,
            label: `request`,
          },
          {
            from: `api`,
            to: `cache`,
            label: `read`,
          },
          {
            from: `api`,
            to: `features`,
            label: `lookup`,
          },
          {
            from: `features`,
            to: `candidates`,
            label: `context`,
          },
          {
            from: `candidates`,
            to: `ranker`,
            label: `items`,
          },
          {
            from: `ranker`,
            to: `policy`,
            label: `scores`,
          },
          {
            from: `policy`,
            to: `client`,
            label: `response`,
          },
          {
            from: `policy`,
            to: `logs`,
            label: `log`,
            dashed: true,
          },
          {
            from: `logs`,
            to: `monitor`,
            label: `metrics`,
          },
        ],
      },
    ],
    followUps: [
      {
        q: `What would you ship as the first version?`,
        a: `A chronological-plus-popularity feed from followed sources with integrity filters and a lightweight ranker using recency, relationship strength, and topic affinity.`,
      },
      {
        q: `How do you handle cold start or sparse history?`,
        a: `Use onboarding follows, locale, trending topics, publisher quality priors, and explicit user controls; ask for interests only if it improves the first session.`,
      },
      {
        q: `What is the most likely offline-online gap?`,
        a: `Old-policy exposure and social graph homophily bias labels; online behavior can change when users see different source mixes.`,
      },
      {
        q: `How do you keep latency within budget?`,
        a: `Precompute candidate pools per viewer, cache content and author features, cap fanout, and use a small ranker before expensive reranking.`,
      },
      {
        q: `How do you detect model degradation?`,
        a: `Track integrity exposure, hides/reports, source diversity, freshness, engagement, and model scores by cohort and content type.`,
      },
      {
        q: `What is the hardest product trade-off?`,
        a: `Maximizing engagement can conflict with integrity, diversity, and user agency.`,
      },
      {
        q: `How would you make the system safer or fairer?`,
        a: `Add integrity models, policy thresholds, human-review queues for borderline content, user controls, and audits across source and demographic slices.`,
      },
    ],
    resources: [
      {
        title: `DLRM: Deep Learning Recommendation Model`,
        url: `https://arxiv.org/abs/1906.00091`,
        type: `paper`,
      },
      {
        title: `Twitter's recommendation algorithm`,
        url: `https://github.com/twitter/the-algorithm`,
        type: `repo`,
      },
      {
        title: `Wide & Deep Learning for Recommender Systems`,
        url: `https://arxiv.org/abs/1606.07792`,
        type: `paper`,
      },
      {
        title: `Rules of Machine Learning`,
        url: `https://developers.google.com/machine-learning/guides/rules-of-ml`,
        type: `article`,
      },
    ],
  },
  {
    id: `ecommerce-search-ranking`,
    title: `E-commerce Search Ranking`,
    category: `Search & Ranking`,
    difficulty: `Hard`,
    summary: `Rank products for a query using lexical retrieval, semantic matching, learning-to-rank, availability constraints, and business guardrails.`,
    tags: [
      `search`,
      `ranking`,
      `ecommerce`,
      `learning-to-rank`,
      `conversion`,
    ],
    sections: [
      {
        title: `Clarify Requirements & Scope`,
        body: `- Clarify surfaces: search results page, autocomplete, category browse, sponsored placements, or recommendations after search.
- Define query types: exact SKU, broad category, natural language, misspellings, multilingual, or image-assisted search.
- Ask for constraints: in-stock only, delivery promise, price filters, seller quality, personalization, and legal merchandising rules.
- Specify scale: catalog size, QPS, update frequency for inventory and price, and acceptable p95 latency.
- Decide whether ads are mixed into organic results or handled by a separate auction layer.`,
      },
      {
        title: `Frame as an ML Problem`,
        body: `| Element | Design choice |
| --- | --- |
| Inputs | query text, user/session context, filters, product catalog, inventory, price, seller signals, reviews, and past search interactions. |
| Output | ranked product list with filters, snippets, and optionally a blended sponsored result policy. |
| ML objective | rank products by probability of purchase or expected utility conditional on the query and shopper context. |
| Business objective | maximize successful purchases, customer satisfaction, and marketplace trust while respecting inventory, delivery, and seller rules. |

The system should expose model confidence and support deterministic fallbacks so product policy can decide what to do with uncertain predictions.`,
      },
      {
        title: `Metrics`,
        body: `| Metric layer | Examples |
| --- | --- |
| Offline | NDCG@K, recall@K, MRR, query-product relevance judgments, conversion-weighted ranking loss, zero-result rate. |
| Online | search conversion, add-to-cart, revenue per search, reformulation rate, abandonment, delivery promise success. |
| Guardrails | latency, out-of-stock impressions, seller concentration, return rate, complaint rate, price fairness, ad load. |

Pick one primary metric before discussing models; otherwise architecture debates become ungrounded.`,
      },
      {
        title: `Data & Labeling`,
        body: `- Sources: query logs, impressions, clicks, carts, purchases, returns, product catalog, inventory, reviews, seller data, human relevance judgments, and query rewrites.
- Label definition: graded relevance can combine human judgments, click, cart, purchase, return, and satisfaction; purchases are strong but delayed labels.
- Delays and maturity: clicks are immediate, purchases may take minutes to days, returns and satisfaction can arrive weeks later.
- Bias and quality risks: position bias, stock visibility, discounts, seller promotions, ads, and previous search ranking bias observed interactions.
- Store the prediction timestamp, exposure context, model version, and later outcome so evaluation can reconstruct exactly what the system knew at serving time.`,
      },
      {
        title: `Feature Engineering`,
        body: `| Feature group | Examples | Notes |
| --- | --- | --- |
| Query | tokens, spelling correction, intent, category, embedding | Intent classification drives retrieval and filters. |
| Product | title, attributes, image/text embeddings, price, stock, reviews | Catalog quality is often the bottleneck. |
| User/context | location, device, purchase history, price sensitivity | Personalization should not override explicit query intent. |
| Cross | BM25 score, semantic similarity, attribute match, brand affinity | Core features for learning-to-rank. |
| Marketplace | delivery ETA, seller quality, margin, return risk | Used with guardrails to avoid harmful business shortcuts. |`,
      },
      {
        title: `Model Architecture`,
        body: `- Baseline: BM25 or lexical search with filters, business rules, and popularity tie-breakers.
- Production model: hybrid retrieval from lexical and vector indexes, learning-to-rank model such as LambdaMART or neural ranker, and post-ranking constraints for availability and diversity.
- Why this model: Lexical matching handles exact queries while semantic retrieval covers synonyms and natural language; the ranker learns conversion and relevance trade-offs.
- Funnel or ensemble: Retrieve thousands by lexical/vector methods, pre-rank to hundreds, apply LTR/neural ranker, then enforce stock, delivery, duplicate, and merchandising rules.
- Keep the simplest model that clears the launch bar; add capacity only when data volume, latency budget, and monitoring maturity justify it.`,
      },
      {
        title: `Training`,
        body: `- Sampling: Train on query sessions with impressed products; add judged query-product pairs and exploration impressions for under-shown products.
- Negatives and counterexamples: Unclicked impressions, skipped higher-ranked products, reformulated queries, and non-purchased carts; sample hard negatives from semantically similar products.
- Imbalance: Purchases are rare relative to impressions; use weighted objectives and query-level normalization.
- Loss: Pairwise or listwise ranking loss such as LambdaRank, optionally combined with calibrated purchase probability loss.
- Validation: Time-based query split with head/tail queries, category slices, new products, and out-of-stock exclusion checks.`,
      },
      {
        title: `Serving & Infrastructure`,
        body: `- Latency budget: Search should often return in 100-300 ms p95; retrieval and ranking must be bounded by candidate count and feature fetch time.
- Caching and precomputation: Cache popular query results, query rewrites, product embeddings, and static product features; never cache stale price or stock without TTL.
- Batch vs real-time: Batch index product text/images and train rankers; stream price, inventory, and seller status updates into serving filters.
- Reliability: Fallback to lexical search and cached popular results if vector search or ranker is unavailable.
- Log decisions asynchronously and design a safe fallback for model, feature store, or downstream service failures.`,
      },
      {
        title: `Monitoring & Iteration`,
        body: `- Monitor zero-result rate, query reformulation, stock violations, category performance, tail-query quality, and latency.
- Track semantic retrieval recall with judged probes and exact-match regressions for SKU/brand queries.
- Inspect revenue lift together with returns, complaints, and seller concentration.`,
      },
      {
        title: `Trade-offs & Pitfalls`,
        body: `- Relevance versus revenue or margin.
- Semantic broadening versus exact query intent.
- Personalization versus fairness to sellers and consistency of search results.
- Fresh inventory updates versus cache efficiency.`,
      },
      {
        title: `What Great Answers Mention`,
        body: `- Start with lexical retrieval and explain why hybrid search is needed.
- Separate retrieval, ranking, and business-rule layers.
- Discuss position bias and delayed purchase/return labels.
- Include inventory, delivery, price, and seller-quality constraints.
- Measure query segments, not only aggregate conversion.`,
      },
    ],
    diagrams: [
      {
        title: `E-commerce Search Ranking training pipeline`,
        nodes: [
          {
            id: `events`,
            label: `Event Logs`,
            kind: `stream`,
            col: 0,
            row: 1,
            detail: `Raw search & ranking interactions with timestamps, entities, and exposure context.`,
          },
          {
            id: `warehouse`,
            label: `Warehouse`,
            kind: `storage`,
            col: 1,
            row: 1,
          },
          {
            id: `labels`,
            label: `Labels`,
            kind: `db`,
            col: 2,
            row: 0,
            detail: `graded relevance can combine human judgments, click, cart, purchase, return, and satisfaction; purchases are strong but delayed labels.`,
          },
          {
            id: `features`,
            label: `Feature Store`,
            kind: `feature-store`,
            col: 2,
            row: 2,
            detail: `Point-in-time features shared by training and serving.`,
          },
          {
            id: `sampler`,
            label: `Sampler`,
            kind: `worker`,
            col: 3,
            row: 1,
          },
          {
            id: `trainer`,
            label: `Trainer`,
            kind: `worker`,
            col: 4,
            row: 1,
          },
          {
            id: `model`,
            label: `Model Artifact`,
            kind: `model`,
            col: 5,
            row: 1,
            detail: `Versioned model with schema, metrics, and rollback metadata.`,
          },
          {
            id: `eval`,
            label: `Offline Eval`,
            kind: `monitor`,
            col: 6,
            row: 0,
          },
          {
            id: `registry`,
            label: `Registry`,
            kind: `storage`,
            col: 7,
            row: 1,
          },
        ],
        edges: [
          {
            from: `events`,
            to: `warehouse`,
            label: `ingest`,
          },
          {
            from: `warehouse`,
            to: `labels`,
            label: `outcomes`,
          },
          {
            from: `warehouse`,
            to: `features`,
            label: `joins`,
          },
          {
            from: `labels`,
            to: `sampler`,
            label: `targets`,
          },
          {
            from: `features`,
            to: `sampler`,
            label: `examples`,
          },
          {
            from: `sampler`,
            to: `trainer`,
            label: `batches`,
          },
          {
            from: `trainer`,
            to: `model`,
            label: `train`,
          },
          {
            from: `model`,
            to: `eval`,
            label: `score`,
          },
          {
            from: `eval`,
            to: `registry`,
            label: `approve`,
          },
        ],
      },
      {
        title: `E-commerce Search Ranking serving path`,
        nodes: [
          {
            id: `client`,
            label: `Client`,
            kind: `client`,
            col: 0,
            row: 1,
          },
          {
            id: `api`,
            label: `API Gateway`,
            kind: `gateway`,
            col: 1,
            row: 1,
            detail: `Receives the e-commerce search ranking request and enforces auth, policy, and request budgets.`,
          },
          {
            id: `cache`,
            label: `Cache`,
            kind: `cache`,
            col: 2,
            row: 0,
          },
          {
            id: `features`,
            label: `Online Features`,
            kind: `feature-store`,
            col: 2,
            row: 2,
          },
          {
            id: `candidates`,
            label: `Candidates`,
            kind: `search`,
            col: 3,
            row: 1,
            detail: `Retrieves a manageable set before expensive scoring.`,
          },
          {
            id: `ranker`,
            label: `Model`,
            kind: `model`,
            col: 4,
            row: 1,
            detail: `Scores candidates or predicts risk under the latency budget.`,
          },
          {
            id: `policy`,
            label: `Policy`,
            kind: `service`,
            col: 5,
            row: 1,
            detail: `Applies thresholds, business rules, diversity, safety, or pacing constraints.`,
          },
          {
            id: `logs`,
            label: `Decision Logs`,
            kind: `stream`,
            col: 6,
            row: 2,
          },
          {
            id: `monitor`,
            label: `Monitor`,
            kind: `monitor`,
            col: 7,
            row: 1,
          },
        ],
        edges: [
          {
            from: `client`,
            to: `api`,
            label: `request`,
          },
          {
            from: `api`,
            to: `cache`,
            label: `read`,
          },
          {
            from: `api`,
            to: `features`,
            label: `lookup`,
          },
          {
            from: `features`,
            to: `candidates`,
            label: `context`,
          },
          {
            from: `candidates`,
            to: `ranker`,
            label: `items`,
          },
          {
            from: `ranker`,
            to: `policy`,
            label: `scores`,
          },
          {
            from: `policy`,
            to: `client`,
            label: `response`,
          },
          {
            from: `policy`,
            to: `logs`,
            label: `log`,
            dashed: true,
          },
          {
            from: `logs`,
            to: `monitor`,
            label: `metrics`,
          },
        ],
      },
    ],
    followUps: [
      {
        q: `What would you ship as the first version?`,
        a: `BM25 search with category filters, spell correction, popularity tie-breakers, and basic learning-to-rank from clicks and purchases.`,
      },
      {
        q: `How do you handle cold start or sparse history?`,
        a: `For new products, use catalog attributes, text/image embeddings, seller priors, and controlled exploration until interaction data arrives.`,
      },
      {
        q: `What is the most likely offline-online gap?`,
        a: `Click/purchase logs reflect old ranks and promotions; offline lift can disappear if the model overfits position or discount effects.`,
      },
      {
        q: `How do you keep latency within budget?`,
        a: `Use two-stage retrieval, precomputed features, query-result caching, static feature caches, and strict candidate caps before the ranker.`,
      },
      {
        q: `How do you detect model degradation?`,
        a: `Watch zero-results, reformulations, conversion, stock violations, category slices, tail queries, and retrieval recall probes.`,
      },
      {
        q: `What is the hardest product trade-off?`,
        a: `Optimizing revenue can hurt relevance, trust, and long-term retention if shoppers see high-margin but poor matches.`,
      },
      {
        q: `How would you make the system safer or fairer?`,
        a: `Audit seller exposure, avoid prohibited products, enforce stock/price truthfulness, and monitor complaints and return rates by segment.`,
      },
    ],
    resources: [
      {
        title: `Learning to Rank for Information Retrieval`,
        url: `https://www.microsoft.com/en-us/research/publication/learning-to-rank-for-information-retrieval/`,
        type: `paper`,
      },
      {
        title: `Elasticsearch relevance guide`,
        url: `https://www.elastic.co/guide/en/elasticsearch/guide/current/relevance-intro.html`,
        type: `article`,
      },
      {
        title: `FAISS similarity search`,
        url: `https://arxiv.org/abs/1702.08734`,
        type: `paper`,
      },
      {
        title: `Amazon Science: search and ranking publications`,
        url: `https://www.amazon.science/tag/search-and-information-retrieval`,
        type: `article`,
      },
    ],
  },
  {
    id: `ads-click-through-rate-prediction`,
    title: `Ads Click-Through-Rate Prediction`,
    category: `Ads`,
    difficulty: `Hard`,
    summary: `Predict ad click probability for ranking and bidding while handling sparse categorical features, calibration, auctions, and delayed conversion feedback.`,
    tags: [
      `ads`,
      `ctr`,
      `calibration`,
      `auction`,
      `ranking`,
    ],
    sections: [
      {
        title: `Clarify Requirements & Scope`,
        body: `- Clarify whether the model is for retrieval, auction ranking, bid shading, budget pacing, or post-click conversion optimization.
- Define the ad surface, auction frequency, latency SLO, and number of candidate ads scored per request.
- Ask whether the objective is CTR, revenue, advertiser ROI, user experience, or a blended expected value.
- Clarify policy constraints: prohibited categories, frequency caps, privacy rules, and user ad preferences.
- Specify label horizon for clicks and whether conversions are modeled separately.`,
      },
      {
        title: `Frame as an ML Problem`,
        body: `| Element | Design choice |
| --- | --- |
| Inputs | user/context features, query or page context, ad creative, advertiser campaign, bid, budget state, historical performance, and auction constraints. |
| Output | calibrated click probability and optionally expected value for each ad candidate. |
| ML objective | estimate P(click | user, context, ad) and rank by expected value such as bid times predicted CTR after quality adjustments. |
| Business objective | maximize marketplace value while preserving advertiser ROI, user trust, policy compliance, and auction latency. |

The system should expose model confidence and support deterministic fallbacks so product policy can decide what to do with uncertain predictions.`,
      },
      {
        title: `Metrics`,
        body: `| Metric layer | Examples |
| --- | --- |
| Offline | log loss, AUC, calibration error, lift by decile, weighted loss by spend, slice metrics for campaigns and placements. |
| Online | CTR, revenue per mille, advertiser ROI, conversion rate, budget delivery, user engagement after ad exposure. |
| Guardrails | ad complaints, policy violations, frequency cap breaches, latency, calibration drift, small-advertiser exposure, privacy compliance. |

Pick one primary metric before discussing models; otherwise architecture debates become ungrounded.`,
      },
      {
        title: `Data & Labeling`,
        body: `- Sources: auction logs, impressions, clicks, conversions, campaign metadata, ad creatives, bids, budgets, page/query context, user consent state, and policy labels.
- Label definition: click within a defined window after impression; conversions are separate delayed labels for downstream value models.
- Delays and maturity: clicks arrive quickly but conversions may take hours or days and can be censored by attribution windows.
- Bias and quality risks: auction selection, position, reserve prices, budget pacing, advertiser targeting, and exploration policies bias observed impressions.
- Store the prediction timestamp, exposure context, model version, and later outcome so evaluation can reconstruct exactly what the system knew at serving time.`,
      },
      {
        title: `Feature Engineering`,
        body: `| Feature group | Examples | Notes |
| --- | --- | --- |
| User/context | device, geo, time, page category, query intent, frequency | Respect consent and privacy constraints. |
| Ad/creative | creative text/image embedding, landing page, category, quality score | Creative fatigue changes over time. |
| Advertiser | campaign history, bid, budget pace, conversion value | Budget state is real-time and volatile. |
| Cross | user-ad affinity, query-ad match, category match | Sparse crossed IDs are powerful but need regularization. |
| Historical | CTR by campaign/placement, smoothed with priors | Use time windows and smoothing to avoid leakage and cold-start bias. |`,
      },
      {
        title: `Model Architecture`,
        body: `- Baseline: logistic regression with hashed sparse categorical crosses and smoothed historical CTR features.
- Production model: wide-and-deep, DeepFM, or DLRM-style model with embeddings for sparse IDs, calibrated output, and a separate conversion/value model when needed.
- Why this model: Ads data contains high-cardinality sparse features and nonlinear interactions; embeddings plus crossed features capture memorization and generalization.
- Funnel or ensemble: Eligibility and policy filters, retrieval by targeting, CTR/value scoring in the auction, then pacing and ranking by expected value.
- Keep the simplest model that clears the launch bar; add capacity only when data volume, latency budget, and monitoring maturity justify it.`,
      },
      {
        title: `Training`,
        body: `- Sampling: Train on impressions with downsampled negatives; keep sampling weights so predicted probabilities remain calibrated.
- Negatives and counterexamples: Non-clicked impressions are negatives; hard negatives include high-ranked ads that were shown but ignored.
- Imbalance: Clicks are rare, so use weighted log loss, negative downsampling correction, and calibration by placement/campaign.
- Loss: Binary cross-entropy or weighted log loss; for value optimization, combine CTR with conversion probability or expected conversion value.
- Validation: Time split by impression, campaign and advertiser slices, cold-start campaigns, and calibration plots by score decile.`,
      },
      {
        title: `Serving & Infrastructure`,
        body: `- Latency budget: Auction scoring often has tens of milliseconds; use precomputed embeddings/features and small optimized models.
- Caching and precomputation: Cache creative embeddings, advertiser features, campaign stats, and eligible ad sets; never serve stale budget or policy state.
- Batch vs real-time: Batch train daily/hourly; stream click counts, budget spend, frequency caps, and policy updates.
- Reliability: Fallback to previous calibrated model or conservative ads ranking; fail closed on policy and budget constraints.
- Log decisions asynchronously and design a safe fallback for model, feature store, or downstream service failures.`,
      },
      {
        title: `Monitoring & Iteration`,
        body: `- Track calibration, score distribution, CTR by placement, advertiser ROI, spend delivery, complaint rate, and latency.
- Monitor cold-start campaigns and long-tail advertisers so the model does not starve new entrants.
- Detect creative fatigue and distribution shifts from seasonality, auctions, or policy changes.`,
      },
      {
        title: `Trade-offs & Pitfalls`,
        body: `- Revenue versus user experience.
- High bidder exposure versus relevance and advertiser ROI.
- Model complexity versus auction latency.
- Personalization versus privacy and regulatory constraints.`,
      },
      {
        title: `What Great Answers Mention`,
        body: `- Mention calibration, not just ranking AUC.
- Explain negative downsampling correction for probabilities.
- Connect CTR to auction expected value and advertiser ROI.
- Include budget pacing, frequency caps, and policy filters.
- Discuss delayed conversions and attribution separately from clicks.`,
      },
    ],
    diagrams: [
      {
        title: `Ads Click-Through-Rate Prediction training pipeline`,
        nodes: [
          {
            id: `events`,
            label: `Event Logs`,
            kind: `stream`,
            col: 0,
            row: 1,
            detail: `Raw ads interactions with timestamps, entities, and exposure context.`,
          },
          {
            id: `warehouse`,
            label: `Warehouse`,
            kind: `storage`,
            col: 1,
            row: 1,
          },
          {
            id: `labels`,
            label: `Labels`,
            kind: `db`,
            col: 2,
            row: 0,
            detail: `click within a defined window after impression; conversions are separate delayed labels for downstream value models.`,
          },
          {
            id: `features`,
            label: `Feature Store`,
            kind: `feature-store`,
            col: 2,
            row: 2,
            detail: `Point-in-time features shared by training and serving.`,
          },
          {
            id: `sampler`,
            label: `Sampler`,
            kind: `worker`,
            col: 3,
            row: 1,
          },
          {
            id: `trainer`,
            label: `Trainer`,
            kind: `worker`,
            col: 4,
            row: 1,
          },
          {
            id: `model`,
            label: `Model Artifact`,
            kind: `model`,
            col: 5,
            row: 1,
            detail: `Versioned model with schema, metrics, and rollback metadata.`,
          },
          {
            id: `eval`,
            label: `Offline Eval`,
            kind: `monitor`,
            col: 6,
            row: 0,
          },
          {
            id: `registry`,
            label: `Registry`,
            kind: `storage`,
            col: 7,
            row: 1,
          },
        ],
        edges: [
          {
            from: `events`,
            to: `warehouse`,
            label: `ingest`,
          },
          {
            from: `warehouse`,
            to: `labels`,
            label: `outcomes`,
          },
          {
            from: `warehouse`,
            to: `features`,
            label: `joins`,
          },
          {
            from: `labels`,
            to: `sampler`,
            label: `targets`,
          },
          {
            from: `features`,
            to: `sampler`,
            label: `examples`,
          },
          {
            from: `sampler`,
            to: `trainer`,
            label: `batches`,
          },
          {
            from: `trainer`,
            to: `model`,
            label: `train`,
          },
          {
            from: `model`,
            to: `eval`,
            label: `score`,
          },
          {
            from: `eval`,
            to: `registry`,
            label: `approve`,
          },
        ],
      },
      {
        title: `Ads Click-Through-Rate Prediction serving path`,
        nodes: [
          {
            id: `client`,
            label: `Client`,
            kind: `client`,
            col: 0,
            row: 1,
          },
          {
            id: `api`,
            label: `API Gateway`,
            kind: `gateway`,
            col: 1,
            row: 1,
            detail: `Receives the ads click-through-rate prediction request and enforces auth, policy, and request budgets.`,
          },
          {
            id: `cache`,
            label: `Cache`,
            kind: `cache`,
            col: 2,
            row: 0,
          },
          {
            id: `features`,
            label: `Online Features`,
            kind: `feature-store`,
            col: 2,
            row: 2,
          },
          {
            id: `candidates`,
            label: `Candidates`,
            kind: `service`,
            col: 3,
            row: 1,
            detail: `Retrieves a manageable set before expensive scoring.`,
          },
          {
            id: `ranker`,
            label: `Model`,
            kind: `model`,
            col: 4,
            row: 1,
            detail: `Scores candidates or predicts risk under the latency budget.`,
          },
          {
            id: `policy`,
            label: `Policy`,
            kind: `service`,
            col: 5,
            row: 1,
            detail: `Applies thresholds, business rules, diversity, safety, or pacing constraints.`,
          },
          {
            id: `logs`,
            label: `Decision Logs`,
            kind: `stream`,
            col: 6,
            row: 2,
          },
          {
            id: `monitor`,
            label: `Monitor`,
            kind: `monitor`,
            col: 7,
            row: 1,
          },
        ],
        edges: [
          {
            from: `client`,
            to: `api`,
            label: `request`,
          },
          {
            from: `api`,
            to: `cache`,
            label: `read`,
          },
          {
            from: `api`,
            to: `features`,
            label: `lookup`,
          },
          {
            from: `features`,
            to: `candidates`,
            label: `context`,
          },
          {
            from: `candidates`,
            to: `ranker`,
            label: `items`,
          },
          {
            from: `ranker`,
            to: `policy`,
            label: `scores`,
          },
          {
            from: `policy`,
            to: `client`,
            label: `response`,
          },
          {
            from: `policy`,
            to: `logs`,
            label: `log`,
            dashed: true,
          },
          {
            from: `logs`,
            to: `monitor`,
            label: `metrics`,
          },
        ],
      },
    ],
    followUps: [
      {
        q: `What would you ship as the first version?`,
        a: `A calibrated logistic regression with hashed categorical features, policy filters, and auction logging.`,
      },
      {
        q: `How do you handle cold start or sparse history?`,
        a: `Use advertiser/category priors, creative embeddings, landing-page features, contextual targeting, and exploration budgets.`,
      },
      {
        q: `What is the most likely offline-online gap?`,
        a: `Logged impressions are auction-selected; a model can look good offline but change auction dynamics and advertiser spend online.`,
      },
      {
        q: `How do you keep latency within budget?`,
        a: `Precompute embeddings and campaign stats, use compact models, batch feature fetches, and score only eligible candidates.`,
      },
      {
        q: `How do you detect model degradation?`,
        a: `Monitor calibration by placement and advertiser, CTR, ROI, spend pacing, complaints, policy violations, and serving latency.`,
      },
      {
        q: `What is the hardest product trade-off?`,
        a: `Short-term revenue versus user trust and advertiser return on spend.`,
      },
      {
        q: `How would you make the system safer or fairer?`,
        a: `Respect consent, enforce policy categories, frequency caps, sensitive-targeting restrictions, and audit exposure across advertiser segments.`,
      },
    ],
    resources: [
      {
        title: `Wide & Deep Learning for Recommender Systems`,
        url: `https://arxiv.org/abs/1606.07792`,
        type: `paper`,
      },
      {
        title: `DeepFM`,
        url: `https://arxiv.org/abs/1703.04247`,
        type: `paper`,
      },
      {
        title: `DLRM`,
        url: `https://arxiv.org/abs/1906.00091`,
        type: `paper`,
      },
      {
        title: `Criteo 1TB Click Logs dataset`,
        url: `https://ailab.criteo.com/download-criteo-1tb-click-logs-dataset/`,
        type: `article`,
      },
    ],
  },
  {
    id: `credit-card-fraud-detection`,
    title: `Credit Card Fraud Detection`,
    category: `Trust & Safety`,
    difficulty: `Hard`,
    summary: `Detect fraudulent card transactions in real time under extreme class imbalance, delayed labels, cost-sensitive decisions, and fintech constraints.`,
    tags: [
      `fraud`,
      `fintech`,
      `real-time`,
      `imbalance`,
      `risk`,
    ],
    sections: [
      {
        title: `Clarify Requirements & Scope`,
        body: `- Clarify the decision: approve, decline, step-up authentication, or send to manual review. These have very different costs.
- Ask for latency SLO at authorization time, usually tens to low hundreds of milliseconds including network calls.
- Define the threat model: stolen card, account takeover, merchant fraud, first-party fraud, or synthetic identity.
- Clarify label source: chargebacks, customer disputes, issuer confirmations, merchant reversals, and investigator labels.
- Discuss regulatory and customer-experience constraints: false declines, explainability, auditability, privacy, and fairness.`,
      },
      {
        title: `Frame as an ML Problem`,
        body: `| Element | Design choice |
| --- | --- |
| Inputs | transaction amount, merchant, cardholder, device, location, velocity features, historical behavior, authentication signals, and network risk signals. |
| Output | risk score plus action recommendation: approve, step up, decline, or review. |
| ML objective | estimate fraud probability or expected fraud loss for a transaction at authorization time. |
| Business objective | minimize fraud losses and operational review cost while avoiding excessive false declines and customer friction. |

The system should expose model confidence and support deterministic fallbacks so product policy can decide what to do with uncertain predictions.`,
      },
      {
        title: `Metrics`,
        body: `| Metric layer | Examples |
| --- | --- |
| Offline | precision/recall at review capacity, PR-AUC, recall at fixed false-positive rate, expected cost saved, calibration by segment. |
| Online | fraud loss rate, chargeback rate, false decline rate, step-up success, review hit rate, customer complaints. |
| Guardrails | authorization latency, approval rate for good customers, fairness slices, manual-review queue size, alert volume, model override rate. |

Pick one primary metric before discussing models; otherwise architecture debates become ungrounded.`,
      },
      {
        title: `Data & Labeling`,
        body: `- Sources: authorization logs, clearing/settlement data, chargebacks, customer disputes, merchant metadata, device fingerprints, geolocation, velocity streams, and manual review outcomes.
- Label definition: fraud confirmed within a label horizon such as 30-90 days; separate unauthorized fraud from merchant dispute or friendly fraud when possible.
- Delays and maturity: many labels arrive weeks later through chargebacks, while manual-review labels may be quicker but biased toward reviewed transactions.
- Bias and quality risks: declined transactions rarely receive fraud labels, reviewed transactions are oversampled, and attackers adapt after model or rule changes.
- Store the prediction timestamp, exposure context, model version, and later outcome so evaluation can reconstruct exactly what the system knew at serving time.`,
      },
      {
        title: `Feature Engineering`,
        body: `| Feature group | Examples | Notes |
| --- | --- | --- |
| Transaction | amount, currency, merchant category, channel, time | Amount normalization and merchant metadata are critical. |
| Cardholder | usual spend, home region, device history, account age | Use behavior relative to the cardholder, not only global patterns. |
| Velocity | transactions in 5 minutes, merchant changes, geo distance | Requires streaming features with low-latency updates. |
| Merchant/device | merchant risk, device reputation, IP ASN, token age | Can catch coordinated attacks but may create fairness issues. |
| Network/graph | shared device/card/merchant components, risky clusters | Useful for fraud rings and mule networks. |`,
      },
      {
        title: `Model Architecture`,
        body: `- Baseline: rules plus logistic regression or gradient-boosted trees on transaction and velocity features.
- Production model: ensemble of gradient-boosted trees, graph/ring signals, and rule engine, calibrated into an expected-cost policy with thresholds for approve/step-up/decline/review.
- Why this model: Tree models handle nonlinear tabular signals and missingness well; rules preserve expert controls and graph features capture coordinated fraud.
- Funnel or ensemble: Fast rules and deny/allow lists, real-time feature fetch, risk model scoring, cost-sensitive policy thresholds, and manual-review queue.
- Keep the simplest model that clears the launch bar; add capacity only when data volume, latency budget, and monitoring maturity justify it.`,
      },
      {
        title: `Training`,
        body: `- Sampling: Use all positives, downsample easy negatives, keep recent attack windows, and preserve transaction-time order.
- Negatives and counterexamples: Approved transactions without fraud after maturity are negatives; declined transactions are unlabeled, not clean negatives.
- Imbalance: Fraud is extremely rare, so optimize precision/recall at operating points, class weights, focal loss, and cost-based thresholds.
- Loss: Weighted log loss or focal loss, then policy minimizes expected cost: c_fn times missed fraud plus c_fp times false decline or review cost.
- Validation: Time-based backtests with rolling windows, attack-cohort slices, merchant/cardholder segments, and delayed-label maturity.`,
      },
      {
        title: `Serving & Infrastructure`,
        body: `- Latency budget: Authorization path may allow 50-150 ms for risk scoring; streaming feature reads and model inference must be predictable.
- Caching and precomputation: Cache stable cardholder/merchant profiles and keep velocity counters in low-latency stores with TTL.
- Batch vs real-time: Batch train models and merchant profiles; stream transaction velocities, device risk, and recent declines in real time.
- Reliability: Fallback to conservative rules and previous model; feature outages should trigger safe thresholds rather than blind approvals.
- Log decisions asynchronously and design a safe fallback for model, feature store, or downstream service failures.`,
      },
      {
        title: `Monitoring & Iteration`,
        body: `- Monitor fraud loss, false declines, step-up conversion, review precision, score distribution, and velocity feature freshness.
- Track delayed labels by vintage so recent performance is not confused with immature labels.
- Watch for attack spikes, merchant-level anomalies, and adversarial probing after rule changes.`,
      },
      {
        title: `Trade-offs & Pitfalls`,
        body: `- Fraud catch rate versus false declines and customer friction.
- Manual-review precision versus queue capacity and label bias.
- Aggressive real-time features versus latency and availability risk.
- Explainable policies versus black-box predictive power.`,
      },
      {
        title: `What Great Answers Mention`,
        body: `- Frame decisions by expected cost, not just probability.
- Treat declined transactions as censored labels.
- Mention streaming velocity features and graph/ring signals.
- Use PR-AUC and recall at fixed false-positive rate rather than accuracy.
- Discuss delayed chargeback labels, adversarial drift, and auditability.`,
      },
    ],
    diagrams: [
      {
        title: `Credit Card Fraud Detection training pipeline`,
        nodes: [
          {
            id: `events`,
            label: `Event Logs`,
            kind: `stream`,
            col: 0,
            row: 1,
            detail: `Raw trust & safety interactions with timestamps, entities, and exposure context.`,
          },
          {
            id: `warehouse`,
            label: `Warehouse`,
            kind: `storage`,
            col: 1,
            row: 1,
          },
          {
            id: `labels`,
            label: `Labels`,
            kind: `db`,
            col: 2,
            row: 0,
            detail: `fraud confirmed within a label horizon such as 30-90 days; separate unauthorized fraud from merchant dispute or friendly fraud when possible.`,
          },
          {
            id: `features`,
            label: `Feature Store`,
            kind: `feature-store`,
            col: 2,
            row: 2,
            detail: `Point-in-time features shared by training and serving.`,
          },
          {
            id: `sampler`,
            label: `Sampler`,
            kind: `worker`,
            col: 3,
            row: 1,
          },
          {
            id: `trainer`,
            label: `Trainer`,
            kind: `worker`,
            col: 4,
            row: 1,
          },
          {
            id: `model`,
            label: `Model Artifact`,
            kind: `model`,
            col: 5,
            row: 1,
            detail: `Versioned model with schema, metrics, and rollback metadata.`,
          },
          {
            id: `eval`,
            label: `Offline Eval`,
            kind: `monitor`,
            col: 6,
            row: 0,
          },
          {
            id: `registry`,
            label: `Registry`,
            kind: `storage`,
            col: 7,
            row: 1,
          },
        ],
        edges: [
          {
            from: `events`,
            to: `warehouse`,
            label: `ingest`,
          },
          {
            from: `warehouse`,
            to: `labels`,
            label: `outcomes`,
          },
          {
            from: `warehouse`,
            to: `features`,
            label: `joins`,
          },
          {
            from: `labels`,
            to: `sampler`,
            label: `targets`,
          },
          {
            from: `features`,
            to: `sampler`,
            label: `examples`,
          },
          {
            from: `sampler`,
            to: `trainer`,
            label: `batches`,
          },
          {
            from: `trainer`,
            to: `model`,
            label: `train`,
          },
          {
            from: `model`,
            to: `eval`,
            label: `score`,
          },
          {
            from: `eval`,
            to: `registry`,
            label: `approve`,
          },
        ],
      },
      {
        title: `Credit Card Fraud Detection serving path`,
        nodes: [
          {
            id: `client`,
            label: `Client`,
            kind: `client`,
            col: 0,
            row: 1,
          },
          {
            id: `api`,
            label: `API Gateway`,
            kind: `gateway`,
            col: 1,
            row: 1,
            detail: `Receives the credit card fraud detection request and enforces auth, policy, and request budgets.`,
          },
          {
            id: `cache`,
            label: `Cache`,
            kind: `cache`,
            col: 2,
            row: 0,
          },
          {
            id: `features`,
            label: `Online Features`,
            kind: `feature-store`,
            col: 2,
            row: 2,
          },
          {
            id: `candidates`,
            label: `Candidates`,
            kind: `service`,
            col: 3,
            row: 1,
            detail: `Retrieves a manageable set before expensive scoring.`,
          },
          {
            id: `ranker`,
            label: `Model`,
            kind: `model`,
            col: 4,
            row: 1,
            detail: `Scores candidates or predicts risk under the latency budget.`,
          },
          {
            id: `policy`,
            label: `Policy`,
            kind: `service`,
            col: 5,
            row: 1,
            detail: `Applies thresholds, business rules, diversity, safety, or pacing constraints.`,
          },
          {
            id: `logs`,
            label: `Decision Logs`,
            kind: `stream`,
            col: 6,
            row: 2,
          },
          {
            id: `monitor`,
            label: `Monitor`,
            kind: `monitor`,
            col: 7,
            row: 1,
          },
        ],
        edges: [
          {
            from: `client`,
            to: `api`,
            label: `request`,
          },
          {
            from: `api`,
            to: `cache`,
            label: `read`,
          },
          {
            from: `api`,
            to: `features`,
            label: `lookup`,
          },
          {
            from: `features`,
            to: `candidates`,
            label: `context`,
          },
          {
            from: `candidates`,
            to: `ranker`,
            label: `items`,
          },
          {
            from: `ranker`,
            to: `policy`,
            label: `scores`,
          },
          {
            from: `policy`,
            to: `client`,
            label: `response`,
          },
          {
            from: `policy`,
            to: `logs`,
            label: `log`,
            dashed: true,
          },
          {
            from: `logs`,
            to: `monitor`,
            label: `metrics`,
          },
        ],
      },
    ],
    followUps: [
      {
        q: `What would you ship as the first version?`,
        a: `A rules engine plus calibrated gradient-boosted tree on transaction, merchant, cardholder, and velocity features with manual-review thresholds.`,
      },
      {
        q: `How do you handle cold start or sparse history?`,
        a: `Use merchant/category risk, account age, network signals, device reputation, and conservative step-up flows for new cards or merchants.`,
      },
      {
        q: `What is the most likely offline-online gap?`,
        a: `Labels are delayed and censored; declined transactions do not reveal whether they were truly fraudulent.`,
      },
      {
        q: `How do you keep latency within budget?`,
        a: `Keep velocity counters in a low-latency store, precompute profiles, use compact models, and make external calls asynchronous or bounded.`,
      },
      {
        q: `How do you detect model degradation?`,
        a: `Track loss by vintage, false declines, review hit rate, score drift, feature freshness, and attack spikes by merchant/device/card cohort.`,
      },
      {
        q: `What is the hardest product trade-off?`,
        a: `Preventing fraud versus declining legitimate customers and increasing friction.`,
      },
      {
        q: `How would you make the system safer or fairer?`,
        a: `Audit adverse impact, require explanations for declines, cap automated-denial risk, and route uncertain high-impact cases to step-up or review.`,
      },
    ],
    resources: [
      {
        title: `Credit Card Fraud Detection dataset`,
        url: `https://www.kaggle.com/datasets/mlg-ulb/creditcardfraud`,
        type: `article`,
      },
      {
        title: `imbalanced-learn documentation`,
        url: `https://imbalanced-learn.org/stable/`,
        type: `article`,
      },
      {
        title: `Rules of Machine Learning`,
        url: `https://developers.google.com/machine-learning/guides/rules-of-ml`,
        type: `article`,
      },
      {
        title: `The ML Test Score`,
        url: `https://research.google/pubs/the-ml-test-score-a-rubric-for-ml-production-readiness-and-technical-debt-reduction/`,
        type: `paper`,
      },
    ],
  },
  {
    id: `people-you-may-know`,
    title: `People You May Know`,
    category: `Recommendation`,
    difficulty: `Medium`,
    summary: `Recommend social connections using graph signals, privacy constraints, ranking, and careful notification/product controls.`,
    tags: [
      `graph`,
      `recommendation`,
      `link-prediction`,
      `social`,
      `privacy`,
    ],
    sections: [
      {
        title: `Clarify Requirements & Scope`,
        body: `- Clarify surface: profile suggestions, onboarding, feed module, notifications, or email digest.
- Ask which connections are allowed: friends, colleagues, followers, contacts, groups, or professional network edges.
- Define privacy constraints: blocked users, hidden contacts, minors, sensitive relationships, and cross-region data rules.
- Clarify objective: accepted connections, meaningful subsequent interactions, network growth, or onboarding activation.
- Decide how often suggestions refresh and how to suppress repeated ignored suggestions.`,
      },
      {
        title: `Frame as an ML Problem`,
        body: `| Element | Design choice |
| --- | --- |
| Inputs | viewer node, candidate node, social graph, contact imports, profile attributes, shared groups, interaction history, and privacy settings. |
| Output | ranked list of candidate people with explanations such as mutual contacts or shared organization. |
| ML objective | predict probability of accepted connection and later meaningful interaction for a viewer-candidate pair. |
| Business objective | grow a useful network while preserving trust, privacy, and user control. |

The system should expose model confidence and support deterministic fallbacks so product policy can decide what to do with uncertain predictions.`,
      },
      {
        title: `Metrics`,
        body: `| Metric layer | Examples |
| --- | --- |
| Offline | recall@K for accepted edges, NDCG@K, link-prediction AUC, calibration, explanation coverage. |
| Online | connection acceptance rate, subsequent messages/interactions, onboarding completion, retention. |
| Guardrails | blocks/reports, hide rate, privacy violations, repeated suggestion rate, demographic exposure imbalance, latency. |

Pick one primary metric before discussing models; otherwise architecture debates become ungrounded.`,
      },
      {
        title: `Data & Labeling`,
        body: `- Sources: graph edges, profile fields, contact imports, search views, messages, shared groups/events, blocks, hides, reports, and invitation outcomes.
- Label definition: candidate was suggested and connection accepted within a horizon; stronger labels include reciprocal interaction after acceptance.
- Delays and maturity: acceptance can take days; meaningful interaction after acceptance may take weeks.
- Bias and quality risks: suggestions from the old algorithm get more exposure; imported contacts overrepresent some users; privacy settings censor possible edges.
- Store the prediction timestamp, exposure context, model version, and later outcome so evaluation can reconstruct exactly what the system knew at serving time.`,
      },
      {
        title: `Feature Engineering`,
        body: `| Feature group | Examples | Notes |
| --- | --- | --- |
| Graph | mutual friends, common communities, shortest path, Adamic-Adar | Strong baseline for link prediction. |
| Profile | school, employer, location, skills, language | Use only fields permitted by privacy policy. |
| Behavior | profile views, searches, messages, prior invites | Can be sensitive; aggregate and permission carefully. |
| Candidate quality | acceptance rate, spam reports, account age | Prevents recommending abusive accounts. |
| Embeddings | GraphSAGE/PinSage node embeddings | Helps generalize beyond hand-built graph features. |`,
      },
      {
        title: `Model Architecture`,
        body: `- Baseline: mutual connections and shared attributes ranked by simple weighted score with privacy filters.
- Production model: candidate generation from graph expansion, contacts, groups, and embeddings; gradient-boosted or neural ranker; privacy and suppression policy layer.
- Why this model: Graph heuristics are strong, but a ranker can combine relationship strength, candidate quality, and context while avoiding repeated poor suggestions.
- Funnel or ensemble: Generate candidates from two-hop graph, contacts, organizations, and ANN node embeddings; rank; filter blocked/private/suppressed pairs.
- Keep the simplest model that clears the launch bar; add capacity only when data volume, latency budget, and monitoring maturity justify it.`,
      },
      {
        title: `Training`,
        body: `- Sampling: Train on exposed suggestions and accepted invites; include random exploration candidates to reduce graph-policy bias.
- Negatives and counterexamples: Ignored suggestions, hides, declines, blocks, and repeated non-acceptance; blocks are high-severity negatives.
- Imbalance: Acceptances are sparse; use pairwise ranking loss or weighted binary loss and cap impressions per user.
- Loss: Weighted log loss for acceptance plus penalty for hide/block risk; optionally optimize accepted-and-interacted label.
- Validation: Temporal graph split so future edges are hidden; slice by new users, sparse graph users, geography, and privacy settings.`,
      },
      {
        title: `Serving & Infrastructure`,
        body: `- Latency budget: Suggestion modules can use cached candidate lists and rank within 100-300 ms when a page loads.
- Caching and precomputation: Precompute two-hop and embedding candidates; cache explanations and suppression state with frequent invalidation for blocks/privacy changes.
- Batch vs real-time: Batch graph embeddings and candidate lists; real-time update blocks, accepts, hides, and contact imports.
- Reliability: Fail closed on privacy filters; fallback to simple mutual-connection candidates only after applying suppression rules.
- Log decisions asynchronously and design a safe fallback for model, feature store, or downstream service failures.`,
      },
      {
        title: `Monitoring & Iteration`,
        body: `- Monitor acceptance, meaningful interactions, hides/blocks, repeated suggestions, and privacy-filter hit rate.
- Track graph coverage for sparse users and new geographies.
- Audit suggestions that users report as creepy, unsafe, or irrelevant.`,
      },
      {
        title: `Trade-offs & Pitfalls`,
        body: `- Network growth versus privacy perception.
- Strong behavioral signals versus creepiness and consent.
- Popular candidates versus equitable exposure for sparse users.
- Fresh suggestions versus repeated high-confidence candidates.`,
      },
      {
        title: `What Great Answers Mention`,
        body: `- Start with graph heuristics before embeddings.
- Make privacy and block filters non-negotiable serving constraints.
- Distinguish acceptance from meaningful post-acceptance interaction.
- Use temporal graph validation rather than random edge splits.
- Mention suppression, explanations, and user controls.`,
      },
    ],
    diagrams: [
      {
        title: `People You May Know training pipeline`,
        nodes: [
          {
            id: `events`,
            label: `Event Logs`,
            kind: `stream`,
            col: 0,
            row: 1,
            detail: `Raw recommendation interactions with timestamps, entities, and exposure context.`,
          },
          {
            id: `warehouse`,
            label: `Warehouse`,
            kind: `storage`,
            col: 1,
            row: 1,
          },
          {
            id: `labels`,
            label: `Labels`,
            kind: `db`,
            col: 2,
            row: 0,
            detail: `candidate was suggested and connection accepted within a horizon; stronger labels include reciprocal interaction after acceptance.`,
          },
          {
            id: `features`,
            label: `Feature Store`,
            kind: `feature-store`,
            col: 2,
            row: 2,
            detail: `Point-in-time features shared by training and serving.`,
          },
          {
            id: `sampler`,
            label: `Sampler`,
            kind: `worker`,
            col: 3,
            row: 1,
          },
          {
            id: `trainer`,
            label: `Trainer`,
            kind: `worker`,
            col: 4,
            row: 1,
          },
          {
            id: `model`,
            label: `Model Artifact`,
            kind: `model`,
            col: 5,
            row: 1,
            detail: `Versioned model with schema, metrics, and rollback metadata.`,
          },
          {
            id: `eval`,
            label: `Offline Eval`,
            kind: `monitor`,
            col: 6,
            row: 0,
          },
          {
            id: `registry`,
            label: `Registry`,
            kind: `storage`,
            col: 7,
            row: 1,
          },
        ],
        edges: [
          {
            from: `events`,
            to: `warehouse`,
            label: `ingest`,
          },
          {
            from: `warehouse`,
            to: `labels`,
            label: `outcomes`,
          },
          {
            from: `warehouse`,
            to: `features`,
            label: `joins`,
          },
          {
            from: `labels`,
            to: `sampler`,
            label: `targets`,
          },
          {
            from: `features`,
            to: `sampler`,
            label: `examples`,
          },
          {
            from: `sampler`,
            to: `trainer`,
            label: `batches`,
          },
          {
            from: `trainer`,
            to: `model`,
            label: `train`,
          },
          {
            from: `model`,
            to: `eval`,
            label: `score`,
          },
          {
            from: `eval`,
            to: `registry`,
            label: `approve`,
          },
        ],
      },
      {
        title: `People You May Know serving path`,
        nodes: [
          {
            id: `client`,
            label: `Client`,
            kind: `client`,
            col: 0,
            row: 1,
          },
          {
            id: `api`,
            label: `API Gateway`,
            kind: `gateway`,
            col: 1,
            row: 1,
            detail: `Receives the people you may know request and enforces auth, policy, and request budgets.`,
          },
          {
            id: `cache`,
            label: `Cache`,
            kind: `cache`,
            col: 2,
            row: 0,
          },
          {
            id: `features`,
            label: `Online Features`,
            kind: `feature-store`,
            col: 2,
            row: 2,
          },
          {
            id: `candidates`,
            label: `Candidates`,
            kind: `search`,
            col: 3,
            row: 1,
            detail: `Retrieves a manageable set before expensive scoring.`,
          },
          {
            id: `ranker`,
            label: `Model`,
            kind: `model`,
            col: 4,
            row: 1,
            detail: `Scores candidates or predicts risk under the latency budget.`,
          },
          {
            id: `policy`,
            label: `Policy`,
            kind: `service`,
            col: 5,
            row: 1,
            detail: `Applies thresholds, business rules, diversity, safety, or pacing constraints.`,
          },
          {
            id: `logs`,
            label: `Decision Logs`,
            kind: `stream`,
            col: 6,
            row: 2,
          },
          {
            id: `monitor`,
            label: `Monitor`,
            kind: `monitor`,
            col: 7,
            row: 1,
          },
        ],
        edges: [
          {
            from: `client`,
            to: `api`,
            label: `request`,
          },
          {
            from: `api`,
            to: `cache`,
            label: `read`,
          },
          {
            from: `api`,
            to: `features`,
            label: `lookup`,
          },
          {
            from: `features`,
            to: `candidates`,
            label: `context`,
          },
          {
            from: `candidates`,
            to: `ranker`,
            label: `items`,
          },
          {
            from: `ranker`,
            to: `policy`,
            label: `scores`,
          },
          {
            from: `policy`,
            to: `client`,
            label: `response`,
          },
          {
            from: `policy`,
            to: `logs`,
            label: `log`,
            dashed: true,
          },
          {
            from: `logs`,
            to: `monitor`,
            label: `metrics`,
          },
        ],
      },
    ],
    followUps: [
      {
        q: `What would you ship as the first version?`,
        a: `Two-hop mutual-friend suggestions with shared profile attributes, privacy filters, suppression, and a simple logistic ranker.`,
      },
      {
        q: `How do you handle cold start or sparse history?`,
        a: `Use onboarding contacts, profile attributes, organizations, location, and popular community members while respecting privacy and consent.`,
      },
      {
        q: `What is the most likely offline-online gap?`,
        a: `The old suggestion policy determines which edges are observed; random graph splits leak future network structure.`,
      },
      {
        q: `How do you keep latency within budget?`,
        a: `Precompute candidate pools and node embeddings, cache explanations, and rank a small set online with fast privacy filters.`,
      },
      {
        q: `How do you detect model degradation?`,
        a: `Track acceptances, downstream interactions, blocks, hides, suppression repeats, sparse-user coverage, and privacy-filter errors.`,
      },
      {
        q: `What is the hardest product trade-off?`,
        a: `Relevant suggestions can feel invasive if the signal source is not transparent or consented.`,
      },
      {
        q: `How would you make the system safer or fairer?`,
        a: `Enforce block/privacy filters, limit sensitive inferences, provide explanations and controls, and audit reports by demographic/geographic slices.`,
      },
    ],
    resources: [
      {
        title: `The Link Prediction Problem for Social Networks`,
        url: `https://www.cs.cornell.edu/home/kleinber/link-pred.pdf`,
        type: `paper`,
      },
      {
        title: `GraphSAGE`,
        url: `https://arxiv.org/abs/1706.02216`,
        type: `paper`,
      },
      {
        title: `PinSage`,
        url: `https://arxiv.org/abs/1806.01973`,
        type: `paper`,
      },
      {
        title: `Machine Learning Systems Design resources`,
        url: `https://github.com/chiphuyen/machine-learning-systems-design`,
        type: `repo`,
      },
    ],
  },
  {
    id: `harmful-content-moderation`,
    title: `Harmful Content Moderation`,
    category: `Trust & Safety`,
    difficulty: `Hard`,
    summary: `Detect and route harmful text, image, video, or audio content with multimodal models, policy thresholds, human review, and appeal loops.`,
    tags: [
      `moderation`,
      `multimodal`,
      `trust-safety`,
      `human-review`,
      `policy`,
    ],
    sections: [
      {
        title: `Clarify Requirements & Scope`,
        body: `- Clarify harm categories: spam, hate, harassment, self-harm, sexual content, violence, misinformation, or illegal goods.
- Define actions: allow, downrank, warning screen, remove, lock account, send to review, or escalate to emergency process.
- Ask about modalities: text, images, video frames, audio transcripts, live streams, and comments attached to media.
- Clarify policy tolerance: false negatives may harm users; false positives can censor legitimate speech and trigger appeals.
- Specify latency: upload-time blocking, live-stream monitoring, batch retroactive scans, or report-prioritized review.`,
      },
      {
        title: `Frame as an ML Problem`,
        body: `| Element | Design choice |
| --- | --- |
| Inputs | content media, text, metadata, account history, conversation context, reports, language, locale, and policy taxonomy. |
| Output | policy category probabilities, severity score, and enforcement or review action. |
| ML objective | classify content and context into policy categories with calibrated severity and uncertainty. |
| Business objective | reduce user harm and regulatory risk while preserving legitimate expression, appeal quality, and reviewer capacity. |

The system should expose model confidence and support deterministic fallbacks so product policy can decide what to do with uncertain predictions.`,
      },
      {
        title: `Metrics`,
        body: `| Metric layer | Examples |
| --- | --- |
| Offline | precision/recall by policy category, recall at fixed review volume, calibration, reviewer agreement, slice fairness. |
| Online | harmful exposure rate, report rate, successful appeals, reviewer throughput, time-to-action, repeat offender rate. |
| Guardrails | false removal rate, appeal overturn rate, latency, language coverage, reviewer load, emergency escalation misses. |

Pick one primary metric before discussing models; otherwise architecture debates become ungrounded.`,
      },
      {
        title: `Data & Labeling`,
        body: `- Sources: user uploads, reports, moderator decisions, appeals, account metadata, conversation threads, media embeddings, OCR, ASR transcripts, and trusted-signal feeds.
- Label definition: policy decision from trained reviewers or expert adjudication; labels should include category, severity, context, and confidence.
- Delays and maturity: reports and appeals arrive after exposure; expert review queues introduce variable delay and changing policy definitions.
- Bias and quality risks: reported content overrepresents visible and controversial posts; reviewer disagreement and policy updates create noisy labels.
- Store the prediction timestamp, exposure context, model version, and later outcome so evaluation can reconstruct exactly what the system knew at serving time.`,
      },
      {
        title: `Feature Engineering`,
        body: `| Feature group | Examples | Notes |
| --- | --- | --- |
| Text | tokens, language, toxicity model, topic, slurs with context | Context matters; quoted speech and counterspeech are hard. |
| Media | image/video embeddings, OCR, ASR transcript, frame sampling | Multimodal evidence reduces misses but increases cost. |
| Account | age, prior violations, report history, network risk | Use carefully to avoid prejudging users. |
| Context | thread, target, audience, geo/legal regime | Policy often depends on who says what to whom. |
| Reviewer | label confidence, policy version, appeal outcome | Needed for training and auditing. |`,
      },
      {
        title: `Model Architecture`,
        body: `- Baseline: keyword/rule filters and lightweight text classifier routing obvious high-risk cases to review.
- Production model: multimodal ensemble using text encoder, image/video encoder, OCR/ASR features, account/context model, calibrated category heads, and human-review queues for uncertain/high-impact cases.
- Why this model: Harm definitions depend on language, media, and context; multimodal ensembles improve recall while calibrated thresholds control enforcement risk.
- Funnel or ensemble: Fast pre-upload or post-upload classifier, policy thresholding, review queue prioritization, appeal feedback, and retroactive rescans after policy/model updates.
- Keep the simplest model that clears the launch bar; add capacity only when data volume, latency budget, and monitoring maturity justify it.`,
      },
      {
        title: `Training`,
        body: `- Sampling: Oversample rare harm categories, appeals, borderline cases, and under-covered languages while preserving a representative evaluation set.
- Negatives and counterexamples: Benign content near harmful keywords, satire, counterspeech, educational content, and appealed reversals are important hard negatives.
- Imbalance: Severe harms are rare; use class weights, focal loss, active learning, and category-specific thresholds.
- Loss: Multi-label cross-entropy with severity weights, plus calibration and abstention objectives for uncertain cases.
- Validation: Policy-versioned holdouts, language and region slices, adversarial examples, and human audit of high-severity predictions.`,
      },
      {
        title: `Serving & Infrastructure`,
        body: `- Latency budget: Upload gating may need sub-second decisions; full video or live-stream analysis can run async with rapid takedown paths.
- Caching and precomputation: Cache media hashes, embeddings, prior decisions, and known-bad signatures; invalidate when policy changes.
- Batch vs real-time: Run lightweight checks in real time; batch scan historical content for new policies or newly detected abuse campaigns.
- Reliability: Fail open for low-risk content but fail closed or route to review for high-risk categories depending on policy and legal requirements.
- Log decisions asynchronously and design a safe fallback for model, feature store, or downstream service failures.`,
      },
      {
        title: `Monitoring & Iteration`,
        body: `- Monitor exposure before action, report trends, appeal overturns, reviewer agreement, category distribution, and language coverage.
- Track model confidence and threshold volumes so review queues do not silently overflow.
- Use red-team and adversarial monitoring for coded language, image edits, and coordinated evasion.`,
      },
      {
        title: `Trade-offs & Pitfalls`,
        body: `- Recall of harmful content versus false positives and free expression.
- Real-time enforcement versus expensive multimodal context.
- Automation versus human reviewer cost and well-being.
- Global consistency versus local law and cultural context.`,
      },
      {
        title: `What Great Answers Mention`,
        body: `- Treat policy, human review, and appeals as part of the ML system.
- Discuss multimodal pipelines and uncertainty routing.
- Use category-specific thresholds and slice metrics.
- Mention label noise, reviewer agreement, and policy-versioning.
- Add adversarial evasion and reviewer-capacity guardrails.`,
      },
    ],
    diagrams: [
      {
        title: `Harmful Content Moderation training pipeline`,
        nodes: [
          {
            id: `events`,
            label: `Event Logs`,
            kind: `stream`,
            col: 0,
            row: 1,
            detail: `Raw trust & safety interactions with timestamps, entities, and exposure context.`,
          },
          {
            id: `warehouse`,
            label: `Warehouse`,
            kind: `storage`,
            col: 1,
            row: 1,
          },
          {
            id: `labels`,
            label: `Labels`,
            kind: `db`,
            col: 2,
            row: 0,
            detail: `policy decision from trained reviewers or expert adjudication; labels should include category, severity, context, and confidence.`,
          },
          {
            id: `features`,
            label: `Feature Store`,
            kind: `feature-store`,
            col: 2,
            row: 2,
            detail: `Point-in-time features shared by training and serving.`,
          },
          {
            id: `sampler`,
            label: `Sampler`,
            kind: `worker`,
            col: 3,
            row: 1,
          },
          {
            id: `trainer`,
            label: `Trainer`,
            kind: `worker`,
            col: 4,
            row: 1,
          },
          {
            id: `model`,
            label: `Model Artifact`,
            kind: `model`,
            col: 5,
            row: 1,
            detail: `Versioned model with schema, metrics, and rollback metadata.`,
          },
          {
            id: `eval`,
            label: `Offline Eval`,
            kind: `monitor`,
            col: 6,
            row: 0,
          },
          {
            id: `registry`,
            label: `Registry`,
            kind: `storage`,
            col: 7,
            row: 1,
          },
        ],
        edges: [
          {
            from: `events`,
            to: `warehouse`,
            label: `ingest`,
          },
          {
            from: `warehouse`,
            to: `labels`,
            label: `outcomes`,
          },
          {
            from: `warehouse`,
            to: `features`,
            label: `joins`,
          },
          {
            from: `labels`,
            to: `sampler`,
            label: `targets`,
          },
          {
            from: `features`,
            to: `sampler`,
            label: `examples`,
          },
          {
            from: `sampler`,
            to: `trainer`,
            label: `batches`,
          },
          {
            from: `trainer`,
            to: `model`,
            label: `train`,
          },
          {
            from: `model`,
            to: `eval`,
            label: `score`,
          },
          {
            from: `eval`,
            to: `registry`,
            label: `approve`,
          },
        ],
      },
      {
        title: `Harmful Content Moderation serving path`,
        nodes: [
          {
            id: `client`,
            label: `Client`,
            kind: `client`,
            col: 0,
            row: 1,
          },
          {
            id: `api`,
            label: `API Gateway`,
            kind: `gateway`,
            col: 1,
            row: 1,
            detail: `Receives the harmful content moderation request and enforces auth, policy, and request budgets.`,
          },
          {
            id: `cache`,
            label: `Cache`,
            kind: `cache`,
            col: 2,
            row: 0,
          },
          {
            id: `features`,
            label: `Online Features`,
            kind: `feature-store`,
            col: 2,
            row: 2,
          },
          {
            id: `candidates`,
            label: `Candidates`,
            kind: `service`,
            col: 3,
            row: 1,
            detail: `Retrieves a manageable set before expensive scoring.`,
          },
          {
            id: `ranker`,
            label: `Model`,
            kind: `model`,
            col: 4,
            row: 1,
            detail: `Scores candidates or predicts risk under the latency budget.`,
          },
          {
            id: `policy`,
            label: `Policy`,
            kind: `service`,
            col: 5,
            row: 1,
            detail: `Applies thresholds, business rules, diversity, safety, or pacing constraints.`,
          },
          {
            id: `logs`,
            label: `Decision Logs`,
            kind: `stream`,
            col: 6,
            row: 2,
          },
          {
            id: `monitor`,
            label: `Monitor`,
            kind: `monitor`,
            col: 7,
            row: 1,
          },
        ],
        edges: [
          {
            from: `client`,
            to: `api`,
            label: `request`,
          },
          {
            from: `api`,
            to: `cache`,
            label: `read`,
          },
          {
            from: `api`,
            to: `features`,
            label: `lookup`,
          },
          {
            from: `features`,
            to: `candidates`,
            label: `context`,
          },
          {
            from: `candidates`,
            to: `ranker`,
            label: `items`,
          },
          {
            from: `ranker`,
            to: `policy`,
            label: `scores`,
          },
          {
            from: `policy`,
            to: `client`,
            label: `response`,
          },
          {
            from: `policy`,
            to: `logs`,
            label: `log`,
            dashed: true,
          },
          {
            from: `logs`,
            to: `monitor`,
            label: `metrics`,
          },
        ],
      },
    ],
    followUps: [
      {
        q: `What would you ship as the first version?`,
        a: `Rules plus text classifier for obvious categories, media hashing for known bad content, and human review for uncertain or severe cases.`,
      },
      {
        q: `How do you handle cold start or sparse history?`,
        a: `For new harm patterns, use reports, keyword seeds, active learning, trusted flaggers, and reviewer-labeled bootstrap sets.`,
      },
      {
        q: `What is the most likely offline-online gap?`,
        a: `Reported and reviewed content is not representative; policy changes can make old labels inconsistent with current enforcement.`,
      },
      {
        q: `How do you keep latency within budget?`,
        a: `Run cheap classifiers and hashes synchronously, defer expensive video/multimodal passes, and prioritize high-reach content for fast review.`,
      },
      {
        q: `How do you detect model degradation?`,
        a: `Track report rate, harmful exposure, appeal overturns, reviewer agreement, queue age, category volumes, and adversarial trends.`,
      },
      {
        q: `What is the hardest product trade-off?`,
        a: `Catching more harmful content can remove legitimate speech and overload reviewers.`,
      },
      {
        q: `How would you make the system safer or fairer?`,
        a: `Calibrate by category, use human review for high-impact actions, audit protected language groups, and maintain appeals and policy-versioned labels.`,
      },
    ],
    resources: [
      {
        title: `CLIP`,
        url: `https://arxiv.org/abs/2103.00020`,
        type: `paper`,
      },
      {
        title: `Jigsaw Perspective API`,
        url: `https://perspectiveapi.com/`,
        type: `article`,
      },
      {
        title: `OpenAI moderation tooling`,
        url: `https://openai.com/index/new-and-improved-content-moderation-tooling/`,
        type: `article`,
      },
      {
        title: `Datasheets for Datasets`,
        url: `https://arxiv.org/abs/1803.09010`,
        type: `paper`,
      },
    ],
  },
  {
    id: `food-delivery-eta-prediction`,
    title: `Food Delivery ETA Prediction`,
    category: `Forecasting`,
    difficulty: `Medium`,
    summary: `Predict delivery arrival time across restaurant prep, courier assignment, routing, traffic, and marketplace dynamics.`,
    tags: [
      `forecasting`,
      `eta`,
      `marketplace`,
      `regression`,
      `logistics`,
    ],
    sections: [
      {
        title: `Clarify Requirements & Scope`,
        body: `- Clarify prediction point: before order, after checkout, after courier assignment, pickup ETA, or final delivery ETA.
- Define the output: point estimate, confidence interval, or time window shown to users and restaurants.
- Ask what actions use the prediction: customer promise, courier dispatch, batching orders, or restaurant prep coordination.
- Clarify constraints: geography, traffic data availability, courier GPS cadence, and latency for updating ETAs.
- Discuss user impact of underpromising versus overpromising and how cancellations are handled.`,
      },
      {
        title: `Frame as an ML Problem`,
        body: `| Element | Design choice |
| --- | --- |
| Inputs | order details, restaurant prep history, courier state, route distance, traffic, weather, marketplace demand/supply, and current timestamps. |
| Output | estimated arrival time or distribution over remaining delivery duration. |
| ML objective | predict remaining time and uncertainty for each delivery stage. |
| Business objective | improve promise accuracy, reduce cancellations/support contacts, and optimize dispatch efficiency. |

The system should expose model confidence and support deterministic fallbacks so product policy can decide what to do with uncertain predictions.`,
      },
      {
        title: `Metrics`,
        body: `| Metric layer | Examples |
| --- | --- |
| Offline | MAE, RMSE, p50/p90 absolute error, calibration of prediction intervals, late-order recall. |
| Online | on-time delivery rate, customer contacts, cancellations, courier idle time, restaurant wait time, reorder rate. |
| Guardrails | bias by region/restaurant, excessive optimistic promises, update churn, latency, courier safety, batching quality. |

Pick one primary metric before discussing models; otherwise architecture debates become ungrounded.`,
      },
      {
        title: `Data & Labeling`,
        body: `- Sources: order events, restaurant accept/prep timestamps, courier GPS, dispatch decisions, route engine outputs, traffic, weather, cancellations, and customer feedback.
- Label definition: actual elapsed time from prediction timestamp to delivery or stage completion; censored/cancelled orders need special handling.
- Delays and maturity: labels arrive when delivery completes; support complaints and satisfaction arrive later.
- Bias and quality risks: dispatch policy, courier assignment, batching decisions, and marketplace interventions affect observed times.
- Store the prediction timestamp, exposure context, model version, and later outcome so evaluation can reconstruct exactly what the system knew at serving time.`,
      },
      {
        title: `Feature Engineering`,
        body: `| Feature group | Examples | Notes |
| --- | --- | --- |
| Order | items, basket size, promised time, order age | Large or complex orders change prep time. |
| Restaurant | prep-time history, current backlog, category, reliability | Real-time backlog is often the strongest feature. |
| Courier | distance to restaurant, speed, active batch, experience | Use privacy-aware aggregates and current state. |
| Route/context | distance, traffic, weather, parking, time of day | Route estimates are model inputs, not final truth. |
| Marketplace | demand/supply ratio, surge, zone congestion | Captures systemic delays. |`,
      },
      {
        title: `Model Architecture`,
        body: `- Baseline: sum of heuristic stage estimates: restaurant prep average plus route-engine travel time plus buffer.
- Production model: stage-wise gradient-boosted or neural regression model predicting prep, pickup, and dropoff durations with quantile outputs for uncertainty.
- Why this model: Stage models expose bottlenecks and allow updates as new events arrive; quantiles produce reliable promise windows.
- Funnel or ensemble: Predict initial ETA, update after restaurant acceptance, update after courier assignment/pickup, and smooth user-facing changes.
- Keep the simplest model that clears the launch bar; add capacity only when data volume, latency budget, and monitoring maturity justify it.`,
      },
      {
        title: `Training`,
        body: `- Sampling: Train from completed deliveries with event-time snapshots at each prediction point; include cancelled orders separately for risk modeling.
- Negatives and counterexamples: Regression has no negatives, but hard examples include late deliveries, high congestion, and unusual restaurants.
- Imbalance: Large delays are rarer but important; weight tail errors or train quantile models for p90 risk.
- Loss: MAE/Huber for point estimates and pinball loss for quantiles; asymmetric loss if late promises cost more than early ones.
- Validation: Time and region split, stage-specific errors, new restaurant/courier slices, weather/holiday stress tests.`,
      },
      {
        title: `Serving & Infrastructure`,
        body: `- Latency budget: ETA updates should be fast, often under 100 ms for scoring, because they are called during checkout and dispatch.
- Caching and precomputation: Cache restaurant profiles, route estimates for common pairs, traffic tiles, and zone-level marketplace state with short TTLs.
- Batch vs real-time: Batch train profiles; stream courier GPS, restaurant backlog, order events, and traffic updates.
- Reliability: Fallback to route-engine plus historical prep heuristics when real-time features are unavailable.
- Log decisions asynchronously and design a safe fallback for model, feature store, or downstream service failures.`,
      },
      {
        title: `Monitoring & Iteration`,
        body: `- Monitor MAE, p90 error, late-order rate, cancellation, support contacts, and interval calibration by city/restaurant.
- Track feature freshness for GPS, backlog, and traffic; stale real-time data can be worse than no data.
- Analyze systematic bias: consistently optimistic ETAs erode trust even if average error is low.`,
      },
      {
        title: `Trade-offs & Pitfalls`,
        body: `- Optimistic ETAs improve conversion but increase disappointment and cancellations.
- Frequent updates improve accuracy but can feel unstable.
- Highly local models improve accuracy but need enough data per region.
- Complex routing features improve quality but add latency and dependency risk.`,
      },
      {
        title: `What Great Answers Mention`,
        body: `- Break ETA into stages rather than one black-box duration.
- Use quantiles or intervals, not only a point estimate.
- Discuss censored/cancelled orders and dispatch-policy feedback.
- Monitor calibration and systematic optimism by region/restaurant.
- Include real-time streaming features and safe fallbacks.`,
      },
    ],
    diagrams: [
      {
        title: `Food Delivery ETA Prediction training pipeline`,
        nodes: [
          {
            id: `events`,
            label: `Event Logs`,
            kind: `stream`,
            col: 0,
            row: 1,
            detail: `Raw forecasting interactions with timestamps, entities, and exposure context.`,
          },
          {
            id: `warehouse`,
            label: `Warehouse`,
            kind: `storage`,
            col: 1,
            row: 1,
          },
          {
            id: `labels`,
            label: `Labels`,
            kind: `db`,
            col: 2,
            row: 0,
            detail: `actual elapsed time from prediction timestamp to delivery or stage completion; censored/cancelled orders need special handling.`,
          },
          {
            id: `features`,
            label: `Feature Store`,
            kind: `feature-store`,
            col: 2,
            row: 2,
            detail: `Point-in-time features shared by training and serving.`,
          },
          {
            id: `sampler`,
            label: `Sampler`,
            kind: `worker`,
            col: 3,
            row: 1,
          },
          {
            id: `trainer`,
            label: `Trainer`,
            kind: `worker`,
            col: 4,
            row: 1,
          },
          {
            id: `model`,
            label: `Model Artifact`,
            kind: `model`,
            col: 5,
            row: 1,
            detail: `Versioned model with schema, metrics, and rollback metadata.`,
          },
          {
            id: `eval`,
            label: `Offline Eval`,
            kind: `monitor`,
            col: 6,
            row: 0,
          },
          {
            id: `registry`,
            label: `Registry`,
            kind: `storage`,
            col: 7,
            row: 1,
          },
        ],
        edges: [
          {
            from: `events`,
            to: `warehouse`,
            label: `ingest`,
          },
          {
            from: `warehouse`,
            to: `labels`,
            label: `outcomes`,
          },
          {
            from: `warehouse`,
            to: `features`,
            label: `joins`,
          },
          {
            from: `labels`,
            to: `sampler`,
            label: `targets`,
          },
          {
            from: `features`,
            to: `sampler`,
            label: `examples`,
          },
          {
            from: `sampler`,
            to: `trainer`,
            label: `batches`,
          },
          {
            from: `trainer`,
            to: `model`,
            label: `train`,
          },
          {
            from: `model`,
            to: `eval`,
            label: `score`,
          },
          {
            from: `eval`,
            to: `registry`,
            label: `approve`,
          },
        ],
      },
      {
        title: `Food Delivery ETA Prediction serving path`,
        nodes: [
          {
            id: `client`,
            label: `Client`,
            kind: `client`,
            col: 0,
            row: 1,
          },
          {
            id: `api`,
            label: `API Gateway`,
            kind: `gateway`,
            col: 1,
            row: 1,
            detail: `Receives the food delivery eta prediction request and enforces auth, policy, and request budgets.`,
          },
          {
            id: `cache`,
            label: `Cache`,
            kind: `cache`,
            col: 2,
            row: 0,
          },
          {
            id: `features`,
            label: `Online Features`,
            kind: `feature-store`,
            col: 2,
            row: 2,
          },
          {
            id: `candidates`,
            label: `Candidates`,
            kind: `service`,
            col: 3,
            row: 1,
            detail: `Retrieves a manageable set before expensive scoring.`,
          },
          {
            id: `ranker`,
            label: `Model`,
            kind: `model`,
            col: 4,
            row: 1,
            detail: `Scores candidates or predicts risk under the latency budget.`,
          },
          {
            id: `policy`,
            label: `Policy`,
            kind: `service`,
            col: 5,
            row: 1,
            detail: `Applies thresholds, business rules, diversity, safety, or pacing constraints.`,
          },
          {
            id: `logs`,
            label: `Decision Logs`,
            kind: `stream`,
            col: 6,
            row: 2,
          },
          {
            id: `monitor`,
            label: `Monitor`,
            kind: `monitor`,
            col: 7,
            row: 1,
          },
        ],
        edges: [
          {
            from: `client`,
            to: `api`,
            label: `request`,
          },
          {
            from: `api`,
            to: `cache`,
            label: `read`,
          },
          {
            from: `api`,
            to: `features`,
            label: `lookup`,
          },
          {
            from: `features`,
            to: `candidates`,
            label: `context`,
          },
          {
            from: `candidates`,
            to: `ranker`,
            label: `items`,
          },
          {
            from: `ranker`,
            to: `policy`,
            label: `scores`,
          },
          {
            from: `policy`,
            to: `client`,
            label: `response`,
          },
          {
            from: `policy`,
            to: `logs`,
            label: `log`,
            dashed: true,
          },
          {
            from: `logs`,
            to: `monitor`,
            label: `metrics`,
          },
        ],
      },
    ],
    followUps: [
      {
        q: `What would you ship as the first version?`,
        a: `Historical restaurant prep averages plus route-engine travel time and a simple regression adjustment by time, distance, and zone.`,
      },
      {
        q: `How do you handle cold start or sparse history?`,
        a: `Use cuisine/category priors, restaurant onboarding estimates, route distance, zone congestion, and wide uncertainty intervals.`,
      },
      {
        q: `What is the most likely offline-online gap?`,
        a: `Dispatch decisions affect delivery time, so offline data reflects the old assignment policy and may not generalize after optimization changes.`,
      },
      {
        q: `How do you keep latency within budget?`,
        a: `Precompute restaurant and zone features, cache route estimates, stream current state, and use compact models per stage.`,
      },
      {
        q: `How do you detect model degradation?`,
        a: `Track MAE, p90 error, interval coverage, late deliveries, cancellations, feature freshness, and region/restaurant bias.`,
      },
      {
        q: `What is the hardest product trade-off?`,
        a: `A promise that maximizes checkout conversion may be too optimistic for customer trust.`,
      },
      {
        q: `How would you make the system safer or fairer?`,
        a: `Avoid incentives for unsafe courier behavior; audit systematic errors in underserved regions and provide conservative uncertainty for sparse data.`,
      },
    ],
    resources: [
      {
        title: `DoorDash delivery time prediction`,
        url: `https://www.doordash.engineering/2021/02/24/using-machine-learning-to-predict-delivery-times/`,
        type: `article`,
      },
      {
        title: `Uber Michelangelo`,
        url: `https://www.uber.com/blog/michelangelo-machine-learning-platform/`,
        type: `article`,
      },
      {
        title: `Quantile Regression`,
        url: `https://projecteuclid.org/journals/econometric-theory/volume-2/issue-1/Regression-Quantiles/10.1017/S0266466600011163.full`,
        type: `paper`,
      },
      {
        title: `Google Maps Platform routes`,
        url: `https://developers.google.com/maps/documentation/routes`,
        type: `article`,
      },
    ],
  },
  {
    id: `visual-search-similar-images`,
    title: `Visual Search / Similar Images`,
    category: `Search & Ranking`,
    difficulty: `Medium`,
    summary: `Build image-based retrieval with embeddings, ANN indexing, metadata filters, reranking, and catalog freshness.`,
    tags: [
      `computer-vision`,
      `visual-search`,
      `embeddings`,
      `ann`,
      `similarity`,
    ],
    sections: [
      {
        title: `Clarify Requirements & Scope`,
        body: `- Clarify input: uploaded image, camera capture, product image, screenshot, or crop/region selection.
- Define success: exact product match, visually similar items, style inspiration, duplicate detection, or moderation lookup.
- Ask about catalog size, image update frequency, latency, metadata filters, and whether text query can accompany the image.
- Clarify constraints: out-of-stock filtering, brand/category restrictions, copyright/safety policy, and personalization.
- Decide if results need explanations such as same color, shape, brand, or visually similar style.`,
      },
      {
        title: `Frame as an ML Problem`,
        body: `| Element | Design choice |
| --- | --- |
| Inputs | query image or crop, optional text/filter context, catalog images, product metadata, availability, and user context. |
| Output | ranked visually similar or matching items with metadata filters and optional reranked relevance. |
| ML objective | learn an embedding where relevant image-product pairs are near each other and irrelevant items are far. |
| Business objective | help users find products or visually related content quickly, increasing conversion and discovery satisfaction. |

The system should expose model confidence and support deterministic fallbacks so product policy can decide what to do with uncertain predictions.`,
      },
      {
        title: `Metrics`,
        body: `| Metric layer | Examples |
| --- | --- |
| Offline | recall@K, mAP, NDCG@K, exact-match accuracy, category-filter accuracy, embedding drift. |
| Online | visual-search conversion, click-through, add-to-cart, query reformulation, time to first useful result. |
| Guardrails | latency, out-of-stock impressions, unsafe content exposure, duplicate rate, bias across categories/skin tones if people are present. |

Pick one primary metric before discussing models; otherwise architecture debates become ungrounded.`,
      },
      {
        title: `Data & Labeling`,
        body: `- Sources: catalog images, user query images, clicks, purchases, product metadata, human relevance judgments, image augmentations, and availability feeds.
- Label definition: positive pairs from exact product matches, clicks/purchases after image search, or human-labeled similarity; negatives from same-category nonmatches and random items.
- Delays and maturity: clicks are immediate, purchases and returns delayed, human labels depend on labeling throughput.
- Bias and quality risks: popular products receive more interactions; catalog photos differ from user-uploaded lighting, angle, background, and crop quality.
- Store the prediction timestamp, exposure context, model version, and later outcome so evaluation can reconstruct exactly what the system knew at serving time.`,
      },
      {
        title: `Feature Engineering`,
        body: `| Feature group | Examples | Notes |
| --- | --- | --- |
| Image | CNN/ViT embedding, color histogram, object boxes, quality score | Robustness to crop, lighting, and background is key. |
| Product | category, brand, price, availability, attributes | Metadata filters prevent visually similar but unavailable results. |
| Text | caption, product title, optional query terms | Hybrid image-text retrieval improves ambiguous queries. |
| User/context | locale, size preferences, recent browse | Personalization should not override the visual intent. |
| Similarity | embedding distance, category match, color/shape match | Used by reranker and explanations. |`,
      },
      {
        title: `Model Architecture`,
        body: `- Baseline: pretrained CNN or CLIP embeddings with brute-force or small ANN search and category filters.
- Production model: fine-tuned image or image-text encoder, ANN index with metadata filters, cross-modal reranker, and business-rule post-filtering.
- Why this model: Embeddings scale to large catalogs and handle visual similarity, while reranking corrects cases where visual closeness is not product relevance.
- Funnel or ensemble: Encode query, retrieve nearest neighbors, filter by metadata/availability, rerank with image-text-product features, diversify results.
- Keep the simplest model that clears the launch bar; add capacity only when data volume, latency budget, and monitoring maturity justify it.`,
      },
      {
        title: `Training`,
        body: `- Sampling: Use labeled pairs, interaction positives, and hard negatives from visually close but wrong items.
- Negatives and counterexamples: Same-category products with different attributes, visually similar but unavailable items, and clicked-but-not-purchased results.
- Imbalance: Exact matches are sparse; use contrastive learning with in-batch negatives and class-balanced batches.
- Loss: Contrastive or triplet loss for embeddings, optionally combined with cross-entropy for category/attribute prediction.
- Validation: Hold out query images by product and time; evaluate exact match, similar-style, and category-specific slices.`,
      },
      {
        title: `Serving & Infrastructure`,
        body: `- Latency budget: Image search may allow 300-800 ms if upload/encoding is involved; ANN lookup and filters should be sub-100 ms after encoding.
- Caching and precomputation: Cache catalog embeddings, query embeddings for repeated images, thumbnails, and popular result sets; invalidate on inventory changes.
- Batch vs real-time: Batch index catalog images; real-time encode user queries and stream inventory updates into filters.
- Reliability: Fallback to text/category search when image encoding fails; return safe empty states for policy-blocked images.
- Log decisions asynchronously and design a safe fallback for model, feature store, or downstream service failures.`,
      },
      {
        title: `Monitoring & Iteration`,
        body: `- Monitor retrieval recall on labeled probes, ANN latency, embedding norm drift, no-result rate, conversion, and inventory filter violations.
- Track query image quality and failure rates for camera versus uploaded images.
- Refresh embeddings after model upgrades and compare index versions before cutover.`,
      },
      {
        title: `Trade-offs & Pitfalls`,
        body: `- High recall versus ANN latency and memory.
- Visual similarity versus purchasable relevance.
- Fine-tuning for one category versus generalization across the catalog.
- Strict filters versus showing enough visually useful results.`,
      },
      {
        title: `What Great Answers Mention`,
        body: `- Use embeddings and ANN but add metadata filtering and reranking.
- Discuss hard negatives and domain shift from catalog to user images.
- Handle index freshness, deletes, and inventory changes.
- Evaluate both exact-match and similar-style use cases.
- Mention CLIP or multimodal encoders when text and image both matter.`,
      },
    ],
    diagrams: [
      {
        title: `Visual Search / Similar Images training pipeline`,
        nodes: [
          {
            id: `events`,
            label: `Event Logs`,
            kind: `stream`,
            col: 0,
            row: 1,
            detail: `Raw search & ranking interactions with timestamps, entities, and exposure context.`,
          },
          {
            id: `warehouse`,
            label: `Warehouse`,
            kind: `storage`,
            col: 1,
            row: 1,
          },
          {
            id: `labels`,
            label: `Labels`,
            kind: `db`,
            col: 2,
            row: 0,
            detail: `positive pairs from exact product matches, clicks/purchases after image search, or human-labeled similarity; negatives from same-category nonmatches and random items.`,
          },
          {
            id: `features`,
            label: `Feature Store`,
            kind: `feature-store`,
            col: 2,
            row: 2,
            detail: `Point-in-time features shared by training and serving.`,
          },
          {
            id: `sampler`,
            label: `Sampler`,
            kind: `worker`,
            col: 3,
            row: 1,
          },
          {
            id: `trainer`,
            label: `Trainer`,
            kind: `worker`,
            col: 4,
            row: 1,
          },
          {
            id: `model`,
            label: `Model Artifact`,
            kind: `model`,
            col: 5,
            row: 1,
            detail: `Versioned model with schema, metrics, and rollback metadata.`,
          },
          {
            id: `eval`,
            label: `Offline Eval`,
            kind: `monitor`,
            col: 6,
            row: 0,
          },
          {
            id: `registry`,
            label: `Registry`,
            kind: `storage`,
            col: 7,
            row: 1,
          },
        ],
        edges: [
          {
            from: `events`,
            to: `warehouse`,
            label: `ingest`,
          },
          {
            from: `warehouse`,
            to: `labels`,
            label: `outcomes`,
          },
          {
            from: `warehouse`,
            to: `features`,
            label: `joins`,
          },
          {
            from: `labels`,
            to: `sampler`,
            label: `targets`,
          },
          {
            from: `features`,
            to: `sampler`,
            label: `examples`,
          },
          {
            from: `sampler`,
            to: `trainer`,
            label: `batches`,
          },
          {
            from: `trainer`,
            to: `model`,
            label: `train`,
          },
          {
            from: `model`,
            to: `eval`,
            label: `score`,
          },
          {
            from: `eval`,
            to: `registry`,
            label: `approve`,
          },
        ],
      },
      {
        title: `Visual Search / Similar Images serving path`,
        nodes: [
          {
            id: `client`,
            label: `Client`,
            kind: `client`,
            col: 0,
            row: 1,
          },
          {
            id: `api`,
            label: `API Gateway`,
            kind: `gateway`,
            col: 1,
            row: 1,
            detail: `Receives the visual search / similar images request and enforces auth, policy, and request budgets.`,
          },
          {
            id: `cache`,
            label: `Cache`,
            kind: `cache`,
            col: 2,
            row: 0,
          },
          {
            id: `features`,
            label: `Online Features`,
            kind: `feature-store`,
            col: 2,
            row: 2,
          },
          {
            id: `candidates`,
            label: `Candidates`,
            kind: `search`,
            col: 3,
            row: 1,
            detail: `Retrieves a manageable set before expensive scoring.`,
          },
          {
            id: `ranker`,
            label: `Model`,
            kind: `model`,
            col: 4,
            row: 1,
            detail: `Scores candidates or predicts risk under the latency budget.`,
          },
          {
            id: `policy`,
            label: `Policy`,
            kind: `service`,
            col: 5,
            row: 1,
            detail: `Applies thresholds, business rules, diversity, safety, or pacing constraints.`,
          },
          {
            id: `logs`,
            label: `Decision Logs`,
            kind: `stream`,
            col: 6,
            row: 2,
          },
          {
            id: `monitor`,
            label: `Monitor`,
            kind: `monitor`,
            col: 7,
            row: 1,
          },
        ],
        edges: [
          {
            from: `client`,
            to: `api`,
            label: `request`,
          },
          {
            from: `api`,
            to: `cache`,
            label: `read`,
          },
          {
            from: `api`,
            to: `features`,
            label: `lookup`,
          },
          {
            from: `features`,
            to: `candidates`,
            label: `context`,
          },
          {
            from: `candidates`,
            to: `ranker`,
            label: `items`,
          },
          {
            from: `ranker`,
            to: `policy`,
            label: `scores`,
          },
          {
            from: `policy`,
            to: `client`,
            label: `response`,
          },
          {
            from: `policy`,
            to: `logs`,
            label: `log`,
            dashed: true,
          },
          {
            from: `logs`,
            to: `monitor`,
            label: `metrics`,
          },
        ],
      },
    ],
    followUps: [
      {
        q: `What would you ship as the first version?`,
        a: `CLIP or pretrained vision embeddings indexed with ANN plus category and stock filters.`,
      },
      {
        q: `How do you handle cold start or sparse history?`,
        a: `New items can be indexed from catalog images and metadata immediately; no interaction history is required for retrieval.`,
      },
      {
        q: `What is the most likely offline-online gap?`,
        a: `Catalog images are clean while user photos have noise, crops, lighting changes, and occlusion, so offline catalog benchmarks can overstate performance.`,
      },
      {
        q: `How do you keep latency within budget?`,
        a: `Precompute catalog vectors, use ANN, resize and encode queries efficiently, and cache repeated query/result pairs.`,
      },
      {
        q: `How do you detect model degradation?`,
        a: `Track recall probes, no-result rate, conversion, image-quality failures, index freshness, embedding drift, and latency.`,
      },
      {
        q: `What is the hardest product trade-off?`,
        a: `The visually closest item may be unavailable, too expensive, or irrelevant to the user's purchase intent.`,
      },
      {
        q: `How would you make the system safer or fairer?`,
        a: `Filter unsafe uploads/results, respect copyright/product policy, and audit categories involving people for representational bias.`,
      },
    ],
    resources: [
      {
        title: `CLIP`,
        url: `https://arxiv.org/abs/2103.00020`,
        type: `paper`,
      },
      {
        title: `FAISS`,
        url: `https://arxiv.org/abs/1702.08734`,
        type: `paper`,
      },
      {
        title: `Pinterest Lens visual search`,
        url: `https://medium.com/pinterest-engineering/introducing-pinterest-lens-the-worlds-first-visual-discovery-engine-6b66c58b3f5e`,
        type: `article`,
      },
      {
        title: `HNSW`,
        url: `https://arxiv.org/abs/1603.09320`,
        type: `paper`,
      },
    ],
  },
  {
    id: `semantic-search-with-embeddings`,
    title: `Semantic Search with Embeddings`,
    category: `Search & Ranking`,
    difficulty: `Medium`,
    summary: `Design text semantic search with embedding models, hybrid retrieval, ANN indexes, reranking, evaluation sets, and freshness controls.`,
    tags: [
      `semantic-search`,
      `embeddings`,
      `hybrid-search`,
      `reranking`,
      `ann`,
    ],
    sections: [
      {
        title: `Clarify Requirements & Scope`,
        body: `- Clarify corpus: documents, tickets, products, code, knowledge base, or messages; size and update rate drive index design.
- Define query style: keyword, natural language question, multilingual, domain jargon, or conversational follow-up.
- Ask if exact lexical matching must be preserved for identifiers, error codes, names, or legal terms.
- Clarify filters and permissions: tenant, team, document ACL, freshness, language, and compliance deletes.
- Specify latency, result count, snippets, explanations, and whether answers are generated downstream.`,
      },
      {
        title: `Frame as an ML Problem`,
        body: `| Element | Design choice |
| --- | --- |
| Inputs | query text, user permissions, metadata filters, document chunks, embeddings, lexical index, and click/feedback logs. |
| Output | ranked documents or chunks with snippets, scores, citations, and metadata. |
| ML objective | retrieve semantically relevant passages for a query while preserving exact-match and permission constraints. |
| Business objective | reduce search time and improve task completion without leaking data or hiding exact matches. |

The system should expose model confidence and support deterministic fallbacks so product policy can decide what to do with uncertain predictions.`,
      },
      {
        title: `Metrics`,
        body: `| Metric layer | Examples |
| --- | --- |
| Offline | recall@K, MRR, NDCG@K, exact-match success, filter correctness, judged relevance by query segment. |
| Online | click success, dwell, reformulation rate, task completion, support deflection, user feedback. |
| Guardrails | ACL violations, stale/deleted document exposure, latency, zero-result rate, hallucinated snippets if generated. |

Pick one primary metric before discussing models; otherwise architecture debates become ungrounded.`,
      },
      {
        title: `Data & Labeling`,
        body: `- Sources: documents/chunks, metadata, ACLs, search logs, clicks, dwell, explicit feedback, support outcomes, and human relevance judgments.
- Label definition: query-document relevance from human judgments, clicks with dwell thresholds, solved tickets, or accepted answers.
- Delays and maturity: clicks are quick; task completion and support resolution may arrive hours or days later.
- Bias and quality risks: top-ranked results get more clicks; users may stop at good-enough answers; permissions hide potentially relevant documents.
- Store the prediction timestamp, exposure context, model version, and later outcome so evaluation can reconstruct exactly what the system knew at serving time.`,
      },
      {
        title: `Feature Engineering`,
        body: `| Feature group | Examples | Notes |
| --- | --- | --- |
| Query | embedding, language, entities, rewritten query, intent | Query rewriting helps conversational and verbose queries. |
| Document | chunk embedding, title, section, freshness, authority | Chunking and metadata affect retrieval quality. |
| Lexical | BM25, exact identifier match, phrase match | Critical for codes, names, and rare tokens. |
| Cross | query-doc cosine, BM25, metadata match, user-doc affinity | Reranker combines hybrid signals. |
| Permissions | tenant, ACL, classification, retention state | Must be enforced before final display. |`,
      },
      {
        title: `Model Architecture`,
        body: `- Baseline: BM25 lexical search with metadata filters and manual synonyms.
- Production model: hybrid BM25 plus dense vector retrieval, cross-encoder reranker for top candidates, and strict ACL/freshness filtering.
- Why this model: Dense retrieval improves synonym and natural-language matching, while lexical search protects exact tokens and identifiers.
- Funnel or ensemble: Rewrite query, retrieve from lexical and vector indexes, merge/deduplicate, rerank top candidates, enforce ACLs, generate snippets.
- Keep the simplest model that clears the launch bar; add capacity only when data volume, latency budget, and monitoring maturity justify it.`,
      },
      {
        title: `Training`,
        body: `- Sampling: Use judged query-document pairs, click logs with debiasing, and hard negatives from high-BM25 or high-cosine nonrelevant documents.
- Negatives and counterexamples: Documents clicked briefly, skipped top results, same-topic wrong documents, and permission-ineligible documents for guardrail tests.
- Imbalance: Most query-document pairs are irrelevant; train with sampled negatives and evaluate at top-K.
- Loss: Contrastive loss for embeddings and pairwise/listwise loss for reranking; calibrate scores for blending.
- Validation: Query-segment holdout with exact-token, tail, multilingual, newly added, and permission-sensitive slices.`,
      },
      {
        title: `Serving & Infrastructure`,
        body: `- Latency budget: Interactive search often targets p95 under 300 ms; reranking depth must be limited.
- Caching and precomputation: Cache embeddings, popular query results, query rewrites, and ACL-filtered metadata with short TTLs for permission changes.
- Batch vs real-time: Batch embed stable documents; stream updates, deletes, and ACL changes into indexes as near-real-time operations.
- Reliability: Fallback to lexical search when vector index or embedding service fails; never bypass permission filters.
- Log decisions asynchronously and design a safe fallback for model, feature store, or downstream service failures.`,
      },
      {
        title: `Monitoring & Iteration`,
        body: `- Monitor recall probes, zero-result rate, reformulations, click success, exact-match regressions, stale results, and ACL denials.
- Track embedding distribution and index lag after document ingestion.
- Review failed queries to expand labels, synonyms, and chunking rules.`,
      },
      {
        title: `Trade-offs & Pitfalls`,
        body: `- Semantic recall versus exact-match precision.
- Reranking quality versus latency and cost.
- Larger chunks preserve context but reduce precise retrieval.
- Aggressive caching versus permission freshness.`,
      },
      {
        title: `What Great Answers Mention`,
        body: `- Propose hybrid retrieval instead of replacing lexical search entirely.
- Discuss chunking, metadata filters, and ACL enforcement.
- Evaluate exact identifiers and tail queries separately.
- Use hard negatives and reranking.
- Handle updates, deletes, and index versioning.`,
      },
    ],
    diagrams: [
      {
        title: `Semantic Search with Embeddings training pipeline`,
        nodes: [
          {
            id: `events`,
            label: `Event Logs`,
            kind: `stream`,
            col: 0,
            row: 1,
            detail: `Raw search & ranking interactions with timestamps, entities, and exposure context.`,
          },
          {
            id: `warehouse`,
            label: `Warehouse`,
            kind: `storage`,
            col: 1,
            row: 1,
          },
          {
            id: `labels`,
            label: `Labels`,
            kind: `db`,
            col: 2,
            row: 0,
            detail: `query-document relevance from human judgments, clicks with dwell thresholds, solved tickets, or accepted answers.`,
          },
          {
            id: `features`,
            label: `Feature Store`,
            kind: `feature-store`,
            col: 2,
            row: 2,
            detail: `Point-in-time features shared by training and serving.`,
          },
          {
            id: `sampler`,
            label: `Sampler`,
            kind: `worker`,
            col: 3,
            row: 1,
          },
          {
            id: `trainer`,
            label: `Trainer`,
            kind: `worker`,
            col: 4,
            row: 1,
          },
          {
            id: `model`,
            label: `Model Artifact`,
            kind: `model`,
            col: 5,
            row: 1,
            detail: `Versioned model with schema, metrics, and rollback metadata.`,
          },
          {
            id: `eval`,
            label: `Offline Eval`,
            kind: `monitor`,
            col: 6,
            row: 0,
          },
          {
            id: `registry`,
            label: `Registry`,
            kind: `storage`,
            col: 7,
            row: 1,
          },
        ],
        edges: [
          {
            from: `events`,
            to: `warehouse`,
            label: `ingest`,
          },
          {
            from: `warehouse`,
            to: `labels`,
            label: `outcomes`,
          },
          {
            from: `warehouse`,
            to: `features`,
            label: `joins`,
          },
          {
            from: `labels`,
            to: `sampler`,
            label: `targets`,
          },
          {
            from: `features`,
            to: `sampler`,
            label: `examples`,
          },
          {
            from: `sampler`,
            to: `trainer`,
            label: `batches`,
          },
          {
            from: `trainer`,
            to: `model`,
            label: `train`,
          },
          {
            from: `model`,
            to: `eval`,
            label: `score`,
          },
          {
            from: `eval`,
            to: `registry`,
            label: `approve`,
          },
        ],
      },
      {
        title: `Semantic Search with Embeddings serving path`,
        nodes: [
          {
            id: `client`,
            label: `Client`,
            kind: `client`,
            col: 0,
            row: 1,
          },
          {
            id: `api`,
            label: `API Gateway`,
            kind: `gateway`,
            col: 1,
            row: 1,
            detail: `Receives the semantic search with embeddings request and enforces auth, policy, and request budgets.`,
          },
          {
            id: `cache`,
            label: `Cache`,
            kind: `cache`,
            col: 2,
            row: 0,
          },
          {
            id: `features`,
            label: `Online Features`,
            kind: `feature-store`,
            col: 2,
            row: 2,
          },
          {
            id: `candidates`,
            label: `Candidates`,
            kind: `search`,
            col: 3,
            row: 1,
            detail: `Retrieves a manageable set before expensive scoring.`,
          },
          {
            id: `ranker`,
            label: `Model`,
            kind: `model`,
            col: 4,
            row: 1,
            detail: `Scores candidates or predicts risk under the latency budget.`,
          },
          {
            id: `policy`,
            label: `Policy`,
            kind: `service`,
            col: 5,
            row: 1,
            detail: `Applies thresholds, business rules, diversity, safety, or pacing constraints.`,
          },
          {
            id: `logs`,
            label: `Decision Logs`,
            kind: `stream`,
            col: 6,
            row: 2,
          },
          {
            id: `monitor`,
            label: `Monitor`,
            kind: `monitor`,
            col: 7,
            row: 1,
          },
        ],
        edges: [
          {
            from: `client`,
            to: `api`,
            label: `request`,
          },
          {
            from: `api`,
            to: `cache`,
            label: `read`,
          },
          {
            from: `api`,
            to: `features`,
            label: `lookup`,
          },
          {
            from: `features`,
            to: `candidates`,
            label: `context`,
          },
          {
            from: `candidates`,
            to: `ranker`,
            label: `items`,
          },
          {
            from: `ranker`,
            to: `policy`,
            label: `scores`,
          },
          {
            from: `policy`,
            to: `client`,
            label: `response`,
          },
          {
            from: `policy`,
            to: `logs`,
            label: `log`,
            dashed: true,
          },
          {
            from: `logs`,
            to: `monitor`,
            label: `metrics`,
          },
        ],
      },
    ],
    followUps: [
      {
        q: `What would you ship as the first version?`,
        a: `BM25 plus a general embedding model over chunks, merged results, simple reranker, and strict ACL filters.`,
      },
      {
        q: `How do you handle cold start or sparse history?`,
        a: `New documents can be embedded and indexed immediately; rely on metadata authority and lexical matches until click feedback arrives.`,
      },
      {
        q: `What is the most likely offline-online gap?`,
        a: `Click labels reflect old rankings and users often click the first acceptable result, not all relevant results.`,
      },
      {
        q: `How do you keep latency within budget?`,
        a: `Limit retrieval fanout, precompute document embeddings, use ANN, cache popular queries, and rerank only top candidates.`,
      },
      {
        q: `How do you detect model degradation?`,
        a: `Track judged recall, reformulation rate, exact-match probes, index lag, ACL violations, stale/deleted results, and p95 latency.`,
      },
      {
        q: `What is the hardest product trade-off?`,
        a: `Dense search may find conceptually related but legally or operationally wrong documents; exactness still matters.`,
      },
      {
        q: `How would you make the system safer or fairer?`,
        a: `Enforce ACLs before display, test permission-sensitive queries, redact snippets, and monitor deleted or classified document exposure.`,
      },
    ],
    resources: [
      {
        title: `Sentence-BERT`,
        url: `https://arxiv.org/abs/1908.10084`,
        type: `paper`,
      },
      {
        title: `FAISS`,
        url: `https://arxiv.org/abs/1702.08734`,
        type: `paper`,
      },
      {
        title: `HNSW`,
        url: `https://arxiv.org/abs/1603.09320`,
        type: `paper`,
      },
      {
        title: `Elasticsearch relevance`,
        url: `https://www.elastic.co/guide/en/elasticsearch/guide/current/relevance-intro.html`,
        type: `article`,
      },
    ],
  },
  {
    id: `enterprise-rag-chatbot`,
    title: `Enterprise RAG Chatbot`,
    category: `GenAI`,
    difficulty: `Hard`,
    summary: `Build an enterprise assistant that retrieves permissioned knowledge, generates grounded answers, evaluates quality, and controls cost and risk.`,
    tags: [
      `rag`,
      `llm`,
      `enterprise`,
      `permissions`,
      `evaluation`,
    ],
    sections: [
      {
        title: `Clarify Requirements & Scope`,
        body: `- Clarify users and tasks: employee self-service, customer support, analyst research, code search, or policy Q&A.
- Define data sources: documents, tickets, wiki, Slack/Teams, CRM, code, PDFs, and databases; ask about freshness and ownership.
- Specify permissions and tenancy: the assistant must never reveal data the user cannot access directly.
- Decide allowed actions: answer only, cite sources, create tickets, call tools, or execute workflow steps.
- Clarify quality bar, latency, cost target, audit logging, and human escalation requirements.`,
      },
      {
        title: `Frame as an ML Problem`,
        body: `| Element | Design choice |
| --- | --- |
| Inputs | user query, conversation history, user identity/ACLs, indexed chunks, metadata, tools, prompt templates, and feedback. |
| Output | grounded answer with citations, refusal/escalation when unsupported, and optional tool calls. |
| ML objective | retrieve supporting context and generate an answer that is grounded, helpful, safe, and policy-compliant. |
| Business objective | reduce time to answer and support load while preventing data leakage, hallucinations, and excessive cost. |

The system should expose model confidence and support deterministic fallbacks so product policy can decide what to do with uncertain predictions.`,
      },
      {
        title: `Metrics`,
        body: `| Metric layer | Examples |
| --- | --- |
| Offline | retrieval hit rate, context recall, groundedness, answer correctness, citation precision, refusal quality, test-suite pass rate. |
| Online | self-serve resolution, user rating, escalation rate, time saved, repeat questions, accepted tool actions. |
| Guardrails | ACL violations, hallucination rate, PII leakage, toxic output, latency, token cost, unsupported-answer rate. |

Pick one primary metric before discussing models; otherwise architecture debates become ungrounded.`,
      },
      {
        title: `Data & Labeling`,
        body: `- Sources: enterprise documents, metadata/ACLs, search logs, support tickets, chat transcripts, human evaluations, thumbs up/down, and tool outcomes.
- Label definition: human-rated answer correctness and groundedness; retrieval labels map queries to sufficient source chunks.
- Delays and maturity: explicit feedback is immediate but sparse; business outcome such as ticket deflection may be measured later.
- Bias and quality risks: feedback comes from motivated users; historical tickets overrepresent difficult cases; docs may be stale or contradictory.
- Store the prediction timestamp, exposure context, model version, and later outcome so evaluation can reconstruct exactly what the system knew at serving time.`,
      },
      {
        title: `Feature Engineering`,
        body: `| Feature group | Examples | Notes |
| --- | --- | --- |
| Query | embedding, intent, entities, conversation summary | Rewrite follow-ups into standalone queries. |
| Document | chunk embedding, title, owner, freshness, ACL, source | Metadata powers filters and citations. |
| Retrieval | BM25 score, vector score, rerank score, recency | Hybrid retrieval improves robustness. |
| User | role, team, permissions, locale | Use for access control, not hidden personalization that leaks data. |
| Generation | prompt version, context budget, model, tool schema | Logged for reproducible evaluation. |`,
      },
      {
        title: `Model Architecture`,
        body: `- Baseline: enterprise search returning top documents plus a non-generative FAQ or template answer for known intents.
- Production model: hybrid retrieval with ACL filters, reranker, prompt assembly with citations, LLM generation, policy/grounding checks, feedback loop, and tool gating.
- Why this model: RAG keeps knowledge fresh and permissioned; generation improves usability but must be constrained by retrieved evidence.
- Funnel or ensemble: Authenticate user, rewrite query, retrieve permissioned chunks, rerank, generate with citations, verify, respond or escalate.
- Keep the simplest model that clears the launch bar; add capacity only when data volume, latency budget, and monitoring maturity justify it.`,
      },
      {
        title: `Training`,
        body: `- Sampling: Build eval sets from top enterprise intents, failed searches, tickets, and adversarial permission prompts.
- Negatives and counterexamples: Irrelevant chunks with similar terms, stale policy docs, unauthorized documents, and prompt-injection examples.
- Imbalance: High-risk failures are rare; oversample safety, permission, and unsupported-answer cases in evaluation and fine-tuning data.
- Loss: Usually no custom training initially; if fine-tuning, use supervised instruction loss for style/tool format and separate retrieval contrastive loss.
- Validation: Versioned golden set by domain, ACL tests, citation audits, human ratings, and regression tests for known incidents.`,
      },
      {
        title: `Serving & Infrastructure`,
        body: `- Latency budget: Interactive chat often targets first token in 1-3 seconds; retrieval/reranking should leave most budget for generation.
- Caching and precomputation: Cache embeddings, document chunks, popular retrieval results, and safe deterministic answers; include ACL and document version in cache keys.
- Batch vs real-time: Batch ingest and embed documents; near-real-time index high-priority docs, deletes, and ACL changes.
- Reliability: Fallback to search results or escalation when retrieval, LLM, or guardrails are unavailable; never answer from unauthorized context.
- Log decisions asynchronously and design a safe fallback for model, feature store, or downstream service failures.`,
      },
      {
        title: `Monitoring & Iteration`,
        body: `- Monitor answer ratings, citation click-through, groundedness audits, retrieval misses, cost per resolved query, and ACL denials.
- Track document freshness, index lag, chunk coverage, prompt version, and model/version drift.
- Review low-confidence and high-impact conversations for dataset expansion.`,
      },
      {
        title: `Trade-offs & Pitfalls`,
        body: `- Answer helpfulness versus refusal conservatism.
- More retrieved context versus cost and distraction.
- Large models versus latency and budget.
- Caching versus permission and document freshness.`,
      },
      {
        title: `What Great Answers Mention`,
        body: `- Make ACL filtering non-negotiable and include it in retrieval/cache keys.
- Evaluate retrieval and generation separately.
- Use citations and unsupported-answer refusal.
- Mention prompt injection from retrieved documents.
- Track cost per resolved task, not just answer quality.`,
      },
    ],
    diagrams: [
      {
        title: `Enterprise RAG Chatbot training pipeline`,
        nodes: [
          {
            id: `events`,
            label: `Event Logs`,
            kind: `stream`,
            col: 0,
            row: 1,
            detail: `Raw genai interactions with timestamps, entities, and exposure context.`,
          },
          {
            id: `warehouse`,
            label: `Warehouse`,
            kind: `storage`,
            col: 1,
            row: 1,
          },
          {
            id: `labels`,
            label: `Labels`,
            kind: `db`,
            col: 2,
            row: 0,
            detail: `human-rated answer correctness and groundedness; retrieval labels map queries to sufficient source chunks.`,
          },
          {
            id: `features`,
            label: `Feature Store`,
            kind: `feature-store`,
            col: 2,
            row: 2,
            detail: `Point-in-time features shared by training and serving.`,
          },
          {
            id: `sampler`,
            label: `Sampler`,
            kind: `worker`,
            col: 3,
            row: 1,
          },
          {
            id: `trainer`,
            label: `Trainer`,
            kind: `worker`,
            col: 4,
            row: 1,
          },
          {
            id: `model`,
            label: `Model Artifact`,
            kind: `model`,
            col: 5,
            row: 1,
            detail: `Versioned model with schema, metrics, and rollback metadata.`,
          },
          {
            id: `eval`,
            label: `Offline Eval`,
            kind: `monitor`,
            col: 6,
            row: 0,
          },
          {
            id: `registry`,
            label: `Registry`,
            kind: `storage`,
            col: 7,
            row: 1,
          },
        ],
        edges: [
          {
            from: `events`,
            to: `warehouse`,
            label: `ingest`,
          },
          {
            from: `warehouse`,
            to: `labels`,
            label: `outcomes`,
          },
          {
            from: `warehouse`,
            to: `features`,
            label: `joins`,
          },
          {
            from: `labels`,
            to: `sampler`,
            label: `targets`,
          },
          {
            from: `features`,
            to: `sampler`,
            label: `examples`,
          },
          {
            from: `sampler`,
            to: `trainer`,
            label: `batches`,
          },
          {
            from: `trainer`,
            to: `model`,
            label: `train`,
          },
          {
            from: `model`,
            to: `eval`,
            label: `score`,
          },
          {
            from: `eval`,
            to: `registry`,
            label: `approve`,
          },
        ],
      },
      {
        title: `Enterprise RAG Chatbot serving path`,
        nodes: [
          {
            id: `client`,
            label: `Client`,
            kind: `client`,
            col: 0,
            row: 1,
          },
          {
            id: `api`,
            label: `API Gateway`,
            kind: `gateway`,
            col: 1,
            row: 1,
            detail: `Receives the enterprise rag chatbot request and enforces auth, policy, and request budgets.`,
          },
          {
            id: `cache`,
            label: `Cache`,
            kind: `cache`,
            col: 2,
            row: 0,
          },
          {
            id: `features`,
            label: `Online Features`,
            kind: `feature-store`,
            col: 2,
            row: 2,
          },
          {
            id: `candidates`,
            label: `Candidates`,
            kind: `search`,
            col: 3,
            row: 1,
            detail: `Retrieves a manageable set before expensive scoring.`,
          },
          {
            id: `ranker`,
            label: `Model`,
            kind: `model`,
            col: 4,
            row: 1,
            detail: `Scores candidates or predicts risk under the latency budget.`,
          },
          {
            id: `policy`,
            label: `Policy`,
            kind: `service`,
            col: 5,
            row: 1,
            detail: `Applies thresholds, business rules, diversity, safety, or pacing constraints.`,
          },
          {
            id: `logs`,
            label: `Decision Logs`,
            kind: `stream`,
            col: 6,
            row: 2,
          },
          {
            id: `monitor`,
            label: `Monitor`,
            kind: `monitor`,
            col: 7,
            row: 1,
          },
        ],
        edges: [
          {
            from: `client`,
            to: `api`,
            label: `request`,
          },
          {
            from: `api`,
            to: `cache`,
            label: `read`,
          },
          {
            from: `api`,
            to: `features`,
            label: `lookup`,
          },
          {
            from: `features`,
            to: `candidates`,
            label: `context`,
          },
          {
            from: `candidates`,
            to: `ranker`,
            label: `items`,
          },
          {
            from: `ranker`,
            to: `policy`,
            label: `scores`,
          },
          {
            from: `policy`,
            to: `client`,
            label: `response`,
          },
          {
            from: `policy`,
            to: `logs`,
            label: `log`,
            dashed: true,
          },
          {
            from: `logs`,
            to: `monitor`,
            label: `metrics`,
          },
        ],
      },
    ],
    followUps: [
      {
        q: `What would you ship as the first version?`,
        a: `Permissioned hybrid search with citations and a conservative LLM answer that refuses when retrieved evidence is insufficient.`,
      },
      {
        q: `How do you handle cold start or sparse history?`,
        a: `Start with high-quality docs and curated FAQs; collect failed queries and feedback to build evals before fine-tuning.`,
      },
      {
        q: `What is the most likely offline-online gap?`,
        a: `Human eval sets may not cover real permission edges, stale documents, or adversarial prompts; online feedback is sparse and biased.`,
      },
      {
        q: `How do you keep latency within budget?`,
        a: `Precompute embeddings, use hybrid retrieval with shallow reranking, stream generation, cache safe answers, and route easy intents to smaller models.`,
      },
      {
        q: `How do you detect model degradation?`,
        a: `Track groundedness, retrieval hit rate, ACL denials, user ratings, escalation, token cost, latency, and stale-source citations.`,
      },
      {
        q: `What is the hardest product trade-off?`,
        a: `A helpful assistant can become dangerous if it answers beyond evidence or permissions.`,
      },
      {
        q: `How would you make the system safer or fairer?`,
        a: `Filter by ACL before retrieval output, defend against prompt injection, redact PII, log audits, and require human approval for high-impact tool actions.`,
      },
    ],
    resources: [
      {
        title: `Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks`,
        url: `https://arxiv.org/abs/2005.11401`,
        type: `paper`,
      },
      {
        title: `OpenAI Evals`,
        url: `https://github.com/openai/evals`,
        type: `repo`,
      },
      {
        title: `Chip Huyen: LLM Powered Applications`,
        url: `https://huyenchip.com/2023/04/11/llm-engineering.html`,
        type: `article`,
      },
      {
        title: `LlamaIndex documentation`,
        url: `https://docs.llamaindex.ai/`,
        type: `article`,
      },
    ],
  },
  {
    id: `llm-inference-serving-platform`,
    title: `LLM Inference Serving Platform`,
    category: `GenAI`,
    difficulty: `Hard`,
    summary: `Design a platform for serving LLMs with batching, KV-cache management, routing, quotas, observability, and cost controls.`,
    tags: [
      `llm`,
      `inference`,
      `serving`,
      `gpu`,
      `platform`,
    ],
    sections: [
      {
        title: `Clarify Requirements & Scope`,
        body: `- Clarify users: internal product teams, external API customers, offline batch jobs, or interactive chat applications.
- Define model mix: open weights, hosted APIs, fine-tunes, LoRA adapters, embedding models, and safety classifiers.
- Ask about SLOs: time to first token, tokens per second, p95 latency, availability, context length, and max cost per request.
- Clarify features: streaming, tool calls, JSON mode, logprobs, multi-tenant quotas, prompt caching, and audit logging.
- Specify safety and compliance: PII handling, data retention, abuse detection, and customer isolation.`,
      },
      {
        title: `Frame as an ML Problem`,
        body: `| Element | Design choice |
| --- | --- |
| Inputs | prompt, model or route policy, generation parameters, tenant identity, safety flags, context length, and optional adapters/tools. |
| Output | streamed tokens or embeddings plus usage, safety metadata, and trace ids. |
| ML objective | serve requested model outputs reliably under latency, throughput, quality, and cost constraints. |
| Business objective | maximize useful model capacity per dollar while meeting product SLOs and tenant isolation requirements. |

The system should expose model confidence and support deterministic fallbacks so product policy can decide what to do with uncertain predictions.`,
      },
      {
        title: `Metrics`,
        body: `| Metric layer | Examples |
| --- | --- |
| Offline | tokens/sec, time-to-first-token, throughput under load, quality regression set, memory utilization, cost per million tokens. |
| Online | availability, p95 latency, request success, user-perceived latency, quota utilization, completion acceptance. |
| Guardrails | safety blocks, abuse rate, tenant isolation incidents, GPU OOMs, queue time, fallback rate, data retention violations. |

Pick one primary metric before discussing models; otherwise architecture debates become ungrounded.`,
      },
      {
        title: `Data & Labeling`,
        body: `- Sources: request traces, prompts metadata, token counts, model versions, GPU metrics, safety events, customer quotas, feedback, and incident logs.
- Label definition: platform quality labels from successful completions, user feedback, safety review, and regression evals rather than a single supervised target.
- Delays and maturity: latency/cost labels are immediate; user satisfaction and abuse reviews may arrive later.
- Bias and quality risks: traffic mix changes with pricing, outages, routing policy, and customers who retry failures.
- Store the prediction timestamp, exposure context, model version, and later outcome so evaluation can reconstruct exactly what the system knew at serving time.`,
      },
      {
        title: `Feature Engineering`,
        body: `| Feature group | Examples | Notes |
| --- | --- | --- |
| Request | prompt tokens, max tokens, streaming, temperature, context length | Predicts cost and routing needs. |
| Tenant | quota, priority, model access, region | Controls fairness and isolation. |
| Model | size, quantization, adapter, context window, GPU memory | Used for scheduling and routing. |
| Runtime | queue depth, KV cache, batch fill, GPU utilization | Core platform health signals. |
| Safety | policy category, PII flags, abuse score | Can route or block requests before generation. |`,
      },
      {
        title: `Model Architecture`,
        body: `- Baseline: single model endpoint with static batching, rate limits, and basic logging.
- Production model: multi-tenant serving layer with request router, dynamic batching, paged KV cache, model/adaptor registry, autoscaling GPU pools, safety sidecars, and fallbacks.
- Why this model: The platform problem is systems-heavy: scheduling, memory, and routing determine cost and SLO more than model architecture alone.
- Funnel or ensemble: Authenticate, validate request, route to model pool, batch/decode, stream tokens, run safety checks, log usage, and charge quota.
- Keep the simplest model that clears the launch bar; add capacity only when data volume, latency budget, and monitoring maturity justify it.`,
      },
      {
        title: `Training`,
        body: `- Sampling: Use replay traffic and synthetic load tests across prompt lengths, tenants, and model sizes to tune schedulers.
- Negatives and counterexamples: Bad requests, unsafe prompts, overlong contexts, OOM-producing loads, and low-priority traffic during overload.
- Imbalance: Peak loads and adversarial abuse are rare; stress tests must oversample them.
- Loss: Not a conventional training loss; optimize scheduling objectives such as admitted tokens, latency SLO violations, and cost under constraints.
- Validation: Load tests, canaries, quality regression prompts, safety regression prompts, and tenant isolation tests before rollout.`,
      },
      {
        title: `Serving & Infrastructure`,
        body: `- Latency budget: Track queue time, prefill time, time to first token, decode tokens/sec, safety checks, and network streaming overhead.
- Caching and precomputation: Prompt/KV caching for repeated prefixes, embedding caches, model warm pools, and adapter caches; cache keys include tenant/model/version.
- Batch vs real-time: Online serving is real-time; offline batch APIs can use larger batches and lower-priority queues for cost efficiency.
- Reliability: Fallback to smaller model, lower max tokens, different region, or queued async job when high-priority interactive SLOs are at risk.
- Log decisions asynchronously and design a safe fallback for model, feature store, or downstream service failures.`,
      },
      {
        title: `Monitoring & Iteration`,
        body: `- Monitor TTFT, tokens/sec, queue depth, GPU memory, OOMs, batch size, cache hit rate, cost, safety blocks, and error codes.
- Track quality regressions whenever routing, quantization, adapters, or model versions change.
- Alert on tenant-level noisy neighbors and quota anomalies.`,
      },
      {
        title: `Trade-offs & Pitfalls`,
        body: `- Throughput batching versus time-to-first-token.
- Large models versus cost and latency.
- Aggressive quantization versus quality regression.
- High utilization versus overload isolation and availability.`,
      },
      {
        title: `What Great Answers Mention`,
        body: `- Break latency into prefill, decode, queueing, and streaming.
- Mention KV-cache memory as the core LLM serving bottleneck.
- Use dynamic batching and priority queues with quotas.
- Discuss model routing, fallbacks, and quality regression tests.
- Track cost and tokens, not just request count.`,
      },
    ],
    diagrams: [
      {
        title: `LLM Inference Serving Platform training pipeline`,
        nodes: [
          {
            id: `events`,
            label: `Event Logs`,
            kind: `stream`,
            col: 0,
            row: 1,
            detail: `Raw genai interactions with timestamps, entities, and exposure context.`,
          },
          {
            id: `warehouse`,
            label: `Warehouse`,
            kind: `storage`,
            col: 1,
            row: 1,
          },
          {
            id: `labels`,
            label: `Labels`,
            kind: `db`,
            col: 2,
            row: 0,
            detail: `platform quality labels from successful completions, user feedback, safety review, and regression evals rather than a single supervised target.`,
          },
          {
            id: `features`,
            label: `Feature Store`,
            kind: `feature-store`,
            col: 2,
            row: 2,
            detail: `Point-in-time features shared by training and serving.`,
          },
          {
            id: `sampler`,
            label: `Sampler`,
            kind: `worker`,
            col: 3,
            row: 1,
          },
          {
            id: `trainer`,
            label: `Trainer`,
            kind: `worker`,
            col: 4,
            row: 1,
          },
          {
            id: `model`,
            label: `Model Artifact`,
            kind: `model`,
            col: 5,
            row: 1,
            detail: `Versioned model with schema, metrics, and rollback metadata.`,
          },
          {
            id: `eval`,
            label: `Offline Eval`,
            kind: `monitor`,
            col: 6,
            row: 0,
          },
          {
            id: `registry`,
            label: `Registry`,
            kind: `storage`,
            col: 7,
            row: 1,
          },
        ],
        edges: [
          {
            from: `events`,
            to: `warehouse`,
            label: `ingest`,
          },
          {
            from: `warehouse`,
            to: `labels`,
            label: `outcomes`,
          },
          {
            from: `warehouse`,
            to: `features`,
            label: `joins`,
          },
          {
            from: `labels`,
            to: `sampler`,
            label: `targets`,
          },
          {
            from: `features`,
            to: `sampler`,
            label: `examples`,
          },
          {
            from: `sampler`,
            to: `trainer`,
            label: `batches`,
          },
          {
            from: `trainer`,
            to: `model`,
            label: `train`,
          },
          {
            from: `model`,
            to: `eval`,
            label: `score`,
          },
          {
            from: `eval`,
            to: `registry`,
            label: `approve`,
          },
        ],
      },
      {
        title: `LLM Inference Serving Platform serving path`,
        nodes: [
          {
            id: `client`,
            label: `Client`,
            kind: `client`,
            col: 0,
            row: 1,
          },
          {
            id: `api`,
            label: `API Gateway`,
            kind: `gateway`,
            col: 1,
            row: 1,
            detail: `Receives the llm inference serving platform request and enforces auth, policy, and request budgets.`,
          },
          {
            id: `cache`,
            label: `Cache`,
            kind: `cache`,
            col: 2,
            row: 0,
          },
          {
            id: `features`,
            label: `Online Features`,
            kind: `feature-store`,
            col: 2,
            row: 2,
          },
          {
            id: `candidates`,
            label: `Candidates`,
            kind: `service`,
            col: 3,
            row: 1,
            detail: `Retrieves a manageable set before expensive scoring.`,
          },
          {
            id: `ranker`,
            label: `Model`,
            kind: `model`,
            col: 4,
            row: 1,
            detail: `Scores candidates or predicts risk under the latency budget.`,
          },
          {
            id: `policy`,
            label: `Policy`,
            kind: `service`,
            col: 5,
            row: 1,
            detail: `Applies thresholds, business rules, diversity, safety, or pacing constraints.`,
          },
          {
            id: `logs`,
            label: `Decision Logs`,
            kind: `stream`,
            col: 6,
            row: 2,
          },
          {
            id: `monitor`,
            label: `Monitor`,
            kind: `monitor`,
            col: 7,
            row: 1,
          },
        ],
        edges: [
          {
            from: `client`,
            to: `api`,
            label: `request`,
          },
          {
            from: `api`,
            to: `cache`,
            label: `read`,
          },
          {
            from: `api`,
            to: `features`,
            label: `lookup`,
          },
          {
            from: `features`,
            to: `candidates`,
            label: `context`,
          },
          {
            from: `candidates`,
            to: `ranker`,
            label: `items`,
          },
          {
            from: `ranker`,
            to: `policy`,
            label: `scores`,
          },
          {
            from: `policy`,
            to: `client`,
            label: `response`,
          },
          {
            from: `policy`,
            to: `logs`,
            label: `log`,
            dashed: true,
          },
          {
            from: `logs`,
            to: `monitor`,
            label: `metrics`,
          },
        ],
      },
    ],
    followUps: [
      {
        q: `What would you ship as the first version?`,
        a: `A single optimized endpoint with streaming, rate limits, static batching, autoscaling, basic safety filters, and detailed usage logs.`,
      },
      {
        q: `How do you handle cold start or sparse history?`,
        a: `For new tenants or models, start with conservative quotas, canary traffic, warmed replicas, and regression evals before broader routing.`,
      },
      {
        q: `What is the most likely offline-online gap?`,
        a: `Offline benchmarks rarely match real prompt-length distributions, concurrency, retries, and tenant priority mix.`,
      },
      {
        q: `How do you keep latency within budget?`,
        a: `Use dynamic batching, paged KV cache, warm pools, prompt caching, model routing, and priority queues with admission control.`,
      },
      {
        q: `How do you detect model degradation?`,
        a: `Track TTFT, decode speed, queue time, GPU memory, cache hit rate, OOMs, fallbacks, token cost, and quality regressions.`,
      },
      {
        q: `What is the hardest product trade-off?`,
        a: `Maximizing GPU utilization can increase tail latency for interactive users.`,
      },
      {
        q: `How would you make the system safer or fairer?`,
        a: `Enforce tenant isolation, audit logs, abuse filters, PII policy, rate limits, and safe fallbacks for high-risk prompts.`,
      },
    ],
    resources: [
      {
        title: `vLLM`,
        url: `https://arxiv.org/abs/2309.06180`,
        type: `paper`,
      },
      {
        title: `NVIDIA Triton Inference Server`,
        url: `https://github.com/triton-inference-server/server`,
        type: `repo`,
      },
      {
        title: `Hugging Face Text Generation Inference`,
        url: `https://github.com/huggingface/text-generation-inference`,
        type: `repo`,
      },
      {
        title: `Efficient Memory Management for Large Language Model Serving with PagedAttention`,
        url: `https://arxiv.org/abs/2309.06180`,
        type: `paper`,
      },
    ],
  },
  {
    id: `spam-phishing-email-detection`,
    title: `Spam / Phishing Email Detection`,
    category: `Trust & Safety`,
    difficulty: `Medium`,
    summary: `Classify email abuse using text, sender reputation, URLs, attachments, user feedback, and adversarial monitoring.`,
    tags: [
      `spam`,
      `phishing`,
      `email`,
      `security`,
      `classification`,
    ],
    sections: [
      {
        title: `Clarify Requirements & Scope`,
        body: `- Clarify action: inbox, spam folder, quarantine, warning banner, URL rewrite, attachment sandbox, or account takedown.
- Define abuse types: bulk spam, phishing, malware, business email compromise, scams, spoofing, and graymail.
- Ask about latency: pre-delivery scanning must be fast; attachment detonation can be asynchronous.
- Clarify labels: user reports, security analyst decisions, URL verdicts, mail authentication, and post-delivery corrections.
- Discuss false-positive cost for important business mail and appeal/recovery paths.`,
      },
      {
        title: `Frame as an ML Problem`,
        body: `| Element | Design choice |
| --- | --- |
| Inputs | email headers, sender/domain reputation, authentication results, text, URLs, attachments, recipient context, and user feedback. |
| Output | abuse category probability and delivery action with explanation signals. |
| ML objective | detect spam/phishing/malware while calibrating thresholds for user and organizational risk. |
| Business objective | protect users from harm without blocking legitimate communication or increasing operational burden. |

The system should expose model confidence and support deterministic fallbacks so product policy can decide what to do with uncertain predictions.`,
      },
      {
        title: `Metrics`,
        body: `| Metric layer | Examples |
| --- | --- |
| Offline | precision/recall by abuse category, PR-AUC, false-positive rate on trusted senders, time-to-detect campaigns. |
| Online | inbox spam rate, phishing click-through, user report rate, false-positive appeals, post-delivery removals. |
| Guardrails | delivery latency, business-mail false positives, sender fairness, analyst queue volume, URL sandbox cost, adversarial evasion rate. |

Pick one primary metric before discussing models; otherwise architecture debates become ungrounded.`,
      },
      {
        title: `Data & Labeling`,
        body: `- Sources: mail flow logs, headers, body text, URLs, attachments, DNS/authentication, sender reputation, user reports, analyst labels, sandbox verdicts, and threat intel feeds.
- Label definition: message-level category from user reports, analyst review, campaign clustering, URL/malware verdicts, and corrections after delivery.
- Delays and maturity: reports and threat intel can arrive after delivery; analyst labels lag during large campaigns.
- Bias and quality risks: users report obvious spam more than subtle phishing; high-profile senders get more scrutiny; attackers adapt to filters.
- Store the prediction timestamp, exposure context, model version, and later outcome so evaluation can reconstruct exactly what the system knew at serving time.`,
      },
      {
        title: `Feature Engineering`,
        body: `| Feature group | Examples | Notes |
| --- | --- | --- |
| Header/sender | SPF/DKIM/DMARC, domain age, IP reputation, reply-to mismatch | Strong for spoofing and bulk campaigns. |
| Content | text embeddings, intent, urgency phrases, language | Must handle obfuscation and multilingual attacks. |
| URL/attachment | domain reputation, redirect chain, file hash, sandbox result | Often async or expensive. |
| Recipient | known contacts, organization role, past interactions | Personalizes risk but needs privacy care. |
| Campaign | near-duplicate clusters, sending velocity, shared infrastructure | Catches coordinated attacks quickly. |`,
      },
      {
        title: `Model Architecture`,
        body: `- Baseline: rules, blocklists, sender reputation, and bag-of-words/logistic classifier.
- Production model: ensemble of sender reputation, text transformer or gradient-boosted features, URL/attachment verdicts, campaign clustering, and policy thresholds per action.
- Why this model: Abuse is adversarial and multimodal; ensembles with reputation and campaign signals are more robust than content-only models.
- Funnel or ensemble: Authenticate and reputation check, cheap content scan, URL/attachment analysis, risk scoring, action policy, and post-delivery remediation.
- Keep the simplest model that clears the launch bar; add capacity only when data volume, latency budget, and monitoring maturity justify it.`,
      },
      {
        title: `Training`,
        body: `- Sampling: Use recent mail with all confirmed bad messages, sampled good mail from trusted and long-tail senders, and campaign-balanced batches.
- Negatives and counterexamples: Legitimate marketing, newsletters, password resets, invoices, and security alerts that resemble phishing.
- Imbalance: Serious phishing is rare; use class weights, category-specific thresholds, and review capacity targets.
- Loss: Weighted cross-entropy or focal loss; tune thresholds by expected harm and false-positive cost.
- Validation: Time split by campaign, not random messages; hold out new domains, languages, and attachment types.`,
      },
      {
        title: `Serving & Infrastructure`,
        body: `- Latency budget: Pre-delivery scoring often needs tens to hundreds of milliseconds; expensive sandbox results can update decisions post-delivery.
- Caching and precomputation: Cache sender/domain reputation, URL verdicts, attachment hashes, and campaign cluster verdicts with careful expiry.
- Batch vs real-time: Real-time score incoming mail; batch or streaming jobs cluster campaigns and update reputations.
- Reliability: Fallback to conservative reputation/rule checks; defer uncertain mail to quarantine rather than silently delivering high-risk messages.
- Log decisions asynchronously and design a safe fallback for model, feature store, or downstream service failures.`,
      },
      {
        title: `Monitoring & Iteration`,
        body: `- Monitor inbox spam, phishing clicks, false-positive appeals, campaign detection delay, sender/domain drift, and latency.
- Track feature availability for DNS, URL sandbox, and attachment scanning dependencies.
- Run adversarial probes for obfuscation, image-only phishing, and lookalike domains.`,
      },
      {
        title: `Trade-offs & Pitfalls`,
        body: `- Blocking more phishing versus delaying or losing legitimate mail.
- Expensive deep inspection versus delivery latency.
- Personalized recipient features versus privacy and explainability.
- Fast campaign response versus risk of broad false positives.`,
      },
      {
        title: `What Great Answers Mention`,
        body: `- Use sender reputation and campaign clustering, not only text classification.
- Evaluate by campaign/time split to avoid near-duplicate leakage.
- Discuss post-delivery remediation and delayed threat labels.
- Tune thresholds by action severity and false-positive cost.
- Mention adversarial adaptation and URL/attachment analysis.`,
      },
    ],
    diagrams: [
      {
        title: `Spam / Phishing Email Detection training pipeline`,
        nodes: [
          {
            id: `events`,
            label: `Event Logs`,
            kind: `stream`,
            col: 0,
            row: 1,
            detail: `Raw trust & safety interactions with timestamps, entities, and exposure context.`,
          },
          {
            id: `warehouse`,
            label: `Warehouse`,
            kind: `storage`,
            col: 1,
            row: 1,
          },
          {
            id: `labels`,
            label: `Labels`,
            kind: `db`,
            col: 2,
            row: 0,
            detail: `message-level category from user reports, analyst review, campaign clustering, URL/malware verdicts, and corrections after delivery.`,
          },
          {
            id: `features`,
            label: `Feature Store`,
            kind: `feature-store`,
            col: 2,
            row: 2,
            detail: `Point-in-time features shared by training and serving.`,
          },
          {
            id: `sampler`,
            label: `Sampler`,
            kind: `worker`,
            col: 3,
            row: 1,
          },
          {
            id: `trainer`,
            label: `Trainer`,
            kind: `worker`,
            col: 4,
            row: 1,
          },
          {
            id: `model`,
            label: `Model Artifact`,
            kind: `model`,
            col: 5,
            row: 1,
            detail: `Versioned model with schema, metrics, and rollback metadata.`,
          },
          {
            id: `eval`,
            label: `Offline Eval`,
            kind: `monitor`,
            col: 6,
            row: 0,
          },
          {
            id: `registry`,
            label: `Registry`,
            kind: `storage`,
            col: 7,
            row: 1,
          },
        ],
        edges: [
          {
            from: `events`,
            to: `warehouse`,
            label: `ingest`,
          },
          {
            from: `warehouse`,
            to: `labels`,
            label: `outcomes`,
          },
          {
            from: `warehouse`,
            to: `features`,
            label: `joins`,
          },
          {
            from: `labels`,
            to: `sampler`,
            label: `targets`,
          },
          {
            from: `features`,
            to: `sampler`,
            label: `examples`,
          },
          {
            from: `sampler`,
            to: `trainer`,
            label: `batches`,
          },
          {
            from: `trainer`,
            to: `model`,
            label: `train`,
          },
          {
            from: `model`,
            to: `eval`,
            label: `score`,
          },
          {
            from: `eval`,
            to: `registry`,
            label: `approve`,
          },
        ],
      },
      {
        title: `Spam / Phishing Email Detection serving path`,
        nodes: [
          {
            id: `client`,
            label: `Client`,
            kind: `client`,
            col: 0,
            row: 1,
          },
          {
            id: `api`,
            label: `API Gateway`,
            kind: `gateway`,
            col: 1,
            row: 1,
            detail: `Receives the spam / phishing email detection request and enforces auth, policy, and request budgets.`,
          },
          {
            id: `cache`,
            label: `Cache`,
            kind: `cache`,
            col: 2,
            row: 0,
          },
          {
            id: `features`,
            label: `Online Features`,
            kind: `feature-store`,
            col: 2,
            row: 2,
          },
          {
            id: `candidates`,
            label: `Candidates`,
            kind: `service`,
            col: 3,
            row: 1,
            detail: `Retrieves a manageable set before expensive scoring.`,
          },
          {
            id: `ranker`,
            label: `Model`,
            kind: `model`,
            col: 4,
            row: 1,
            detail: `Scores candidates or predicts risk under the latency budget.`,
          },
          {
            id: `policy`,
            label: `Policy`,
            kind: `service`,
            col: 5,
            row: 1,
            detail: `Applies thresholds, business rules, diversity, safety, or pacing constraints.`,
          },
          {
            id: `logs`,
            label: `Decision Logs`,
            kind: `stream`,
            col: 6,
            row: 2,
          },
          {
            id: `monitor`,
            label: `Monitor`,
            kind: `monitor`,
            col: 7,
            row: 1,
          },
        ],
        edges: [
          {
            from: `client`,
            to: `api`,
            label: `request`,
          },
          {
            from: `api`,
            to: `cache`,
            label: `read`,
          },
          {
            from: `api`,
            to: `features`,
            label: `lookup`,
          },
          {
            from: `features`,
            to: `candidates`,
            label: `context`,
          },
          {
            from: `candidates`,
            to: `ranker`,
            label: `items`,
          },
          {
            from: `ranker`,
            to: `policy`,
            label: `scores`,
          },
          {
            from: `policy`,
            to: `client`,
            label: `response`,
          },
          {
            from: `policy`,
            to: `logs`,
            label: `log`,
            dashed: true,
          },
          {
            from: `logs`,
            to: `monitor`,
            label: `metrics`,
          },
        ],
      },
    ],
    followUps: [
      {
        q: `What would you ship as the first version?`,
        a: `Authentication checks, reputation lists, URL/attachment hashes, and a lightweight text classifier with quarantine for uncertain high-risk mail.`,
      },
      {
        q: `How do you handle cold start or sparse history?`,
        a: `For new domains or campaigns, use authentication, domain age, sending velocity, content similarity, URL reputation, and cautious quarantine.`,
      },
      {
        q: `What is the most likely offline-online gap?`,
        a: `Random splits leak near-duplicate campaign messages; user reports are delayed and biased toward obvious spam.`,
      },
      {
        q: `How do you keep latency within budget?`,
        a: `Run cheap features synchronously, cache reputation/verdicts, defer sandboxing when needed, and use post-delivery remediation for late signals.`,
      },
      {
        q: `How do you detect model degradation?`,
        a: `Track inbox spam, phishing clicks, false positives, appeal overturns, campaign detection lag, dependency health, and drift in sender infrastructure.`,
      },
      {
        q: `What is the hardest product trade-off?`,
        a: `A false positive on critical legitimate mail can be more costly than many low-severity spam misses.`,
      },
      {
        q: `How would you make the system safer or fairer?`,
        a: `Use action-specific thresholds, quarantine and user warnings, analyst review for high-impact cases, and audits for sender/domain false positives.`,
      },
    ],
    resources: [
      {
        title: `SpamAssassin public corpus`,
        url: `https://spamassassin.apache.org/old/publiccorpus/`,
        type: `article`,
      },
      {
        title: `Enron-Spam datasets`,
        url: `https://www2.aueb.gr/users/ion/data/enron-spam/`,
        type: `article`,
      },
      {
        title: `PhishTank developer information`,
        url: `https://phishtank.org/developer_info.php`,
        type: `article`,
      },
      {
        title: `Google: Protecting Gmail with machine learning`,
        url: `https://blog.google/products/gmail/protecting-gmail-with-machine-learning/`,
        type: `article`,
      },
    ],
  },
]

export default docs
