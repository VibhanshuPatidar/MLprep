import { motion } from 'framer-motion'
import { useMemo, useState } from 'react'
import { Badge, Slider, cn } from '../../components/ui'
import { C, VizFrame, useSize } from '../common'
import { formatCompact, formatMs } from './_shared'

type StageId = 'corpus' | 'candidate' | 'light' | 'heavy' | 'rerank' | 'slate'

interface Stage {
  id: StageId
  label: string
  count: number
  latency: number
  color: string
  details: {
    models: string
    features: string
    metrics: string
  }
}

function stageDetails(id: StageId): Stage['details'] {
  const details: Record<StageId, Stage['details']> = {
    corpus: { models: 'Embedding indexes, metadata stores, freshness pipelines', features: 'item id, creator, topic, locale, policy flags', metrics: 'coverage, freshness, index recall' },
    candidate: { models: 'Two-tower ANN, co-visitation, trending, subscriptions', features: 'user/item embeddings, recent clicks, social graph', metrics: 'recall@K, source diversity, ANN latency' },
    light: { models: 'GBDT / small DNN scorer', features: 'user affinity, item quality, cheap context', metrics: 'AUC, NDCG@K, candidates/sec' },
    heavy: { models: 'Cross-encoder, large DNN, sequence model', features: 'deep user history, creator stats, multimodal signals', metrics: 'NDCG, calibration, tail latency' },
    rerank: { models: 'MMR, constraints solver, business rules', features: 'category, creator, freshness, safety labels', metrics: 'diversity, fairness, policy violations' },
    slate: { models: 'Presentation layer and logging', features: 'position, layout, exploration bucket', metrics: 'CTR, dwell time, long-term value' },
  }
  return details[id]
}

function buildStages(values: {
  corpusM: number
  ann: number
  covis: number
  trending: number
  lightTop: number
  heavyTop: number
  slate: number
  candidateCost: number
  lightCost: number
  heavyCost: number
  rerankCost: number
}): Stage[] {
  const candidates = values.ann + values.covis + values.trending
  return [
    { id: 'corpus', label: 'Corpus', count: values.corpusM * 1_000_000, latency: 0, color: C.lineStrong, details: stageDetails('corpus') },
    { id: 'candidate', label: 'Candidate generation', count: candidates, latency: 12 + candidates * values.candidateCost, color: C.series[0], details: stageDetails('candidate') },
    { id: 'light', label: 'Light ranker', count: values.lightTop, latency: candidates * values.lightCost, color: C.series[1], details: stageDetails('light') },
    { id: 'heavy', label: 'Heavy ranker', count: values.heavyTop, latency: values.lightTop * values.heavyCost, color: C.series[2], details: stageDetails('heavy') },
    { id: 'rerank', label: 'Re-ranking', count: values.slate, latency: 6 + values.heavyTop * values.rerankCost, color: C.series[3], details: stageDetails('rerank') },
    { id: 'slate', label: 'Final slate', count: values.slate, latency: 3, color: C.ok, details: stageDetails('slate') },
  ]
}

export default function RecsysFunnel() {
  const [corpusM, setCorpusM] = useState(25)
  const [ann, setAnn] = useState(700)
  const [covis, setCovis] = useState(350)
  const [trending, setTrending] = useState(150)
  const [lightTop, setLightTop] = useState(450)
  const [heavyTop, setHeavyTop] = useState(90)
  const [slate, setSlate] = useState(20)
  const [candidateCost, setCandidateCost] = useState(0.015)
  const [lightCost, setLightCost] = useState(0.035)
  const [heavyCost, setHeavyCost] = useState(0.42)
  const [rerankCost, setRerankCost] = useState(0.08)
  const [slo, setSlo] = useState(200)
  const [selected, setSelected] = useState<StageId>('candidate')
  const [wrapRef, size] = useSize<HTMLDivElement>()

  const stages = useMemo(
    () => buildStages({ corpusM, ann, covis, trending, lightTop, heavyTop, slate, candidateCost, lightCost, heavyCost, rerankCost }),
    [ann, candidateCost, corpusM, covis, heavyCost, heavyTop, lightCost, lightTop, rerankCost, slate, trending],
  )
  const totalLatency = stages.reduce((acc, stage) => acc + stage.latency, 0)
  const selectedStage = stages.find((stage) => stage.id === selected) ?? stages[1]
  const compact = size.width < 760
  const maxCount = Math.max(...stages.map((stage) => stage.count))
  const minCount = Math.min(...stages.map((stage) => Math.max(1, stage.count)))
  const widthFor = (count: number) => {
    const t = (Math.log10(Math.max(1, count)) - Math.log10(minCount)) / Math.max(1e-6, Math.log10(maxCount) - Math.log10(minCount))
    return (compact ? 190 : 390) * (0.28 + 0.72 * t)
  }

  return (
    <VizFrame
      title="Recommendation system funnel"
      description="Multi-stage retrieval and ranking narrows millions of items into a personalized slate under a latency SLO."
      controls={
        <>
          <Slider label="SLO" value={slo} min={80} max={400} step={10} onChange={setSlo} format={(v) => `${v}ms`} className="w-36" />
          <Badge tone={totalLatency > slo ? 'err' : 'ok'}>{totalLatency > slo ? 'over budget' : 'within SLO'}</Badge>
        </>
      }
      caption={`Funnel returns ${slate} items from ${formatCompact(corpusM * 1_000_000, 1)} corpus items · latency ${formatMs(totalLatency)} / ${slo}ms SLO.`}
      legend={stages.filter((stage) => stage.id !== 'corpus').map((stage) => ({ color: stage.color, label: stage.label }))}
    >
      <div ref={wrapRef} className="space-y-4">
        <div className="grid gap-3 lg:grid-cols-[1.05fr_.95fr]">
          <div className="rounded-2xl border border-line bg-panel/80 p-4">
            <div className="mb-3 flex items-center justify-between gap-2">
              <div>
                <div className="text-sm font-semibold text-fg">Animated funnel</div>
                <div className="text-xs text-muted">Click a stage to inspect common models, features and metrics.</div>
              </div>
              <Badge tone="accent">log-scaled width</Badge>
            </div>
            <div className="space-y-2">
              {stages.map((stage, index) => {
                const width = widthFor(stage.count)
                return (
                  <button key={stage.id} type="button" onClick={() => setSelected(stage.id)} className="grid w-full grid-cols-[130px_1fr_86px] items-center gap-3 rounded-xl p-2 text-left transition-colors hover:bg-subtle">
                    <div className="text-xs font-medium text-muted">{index + 1}. {stage.label}</div>
                    <div className="relative h-12 rounded-xl bg-line/70">
                      <motion.div
                        initial={false}
                        animate={{ width }}
                        transition={{ type: 'spring', stiffness: 130, damping: 22 }}
                        className={cn('absolute top-0 bottom-0 left-1/2 -translate-x-1/2 rounded-xl border', selected === stage.id ? 'border-accent' : 'border-transparent')}
                        style={{ background: stage.color, opacity: selected === stage.id ? 0.95 : 0.72 }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center font-mono text-xs font-semibold text-fg">{formatCompact(stage.count, 1)} items</div>
                    </div>
                    <div className="text-right font-mono text-xs text-muted">{formatMs(stage.latency)}</div>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-line bg-panel/80 p-4">
            <div className="mb-3 flex items-center justify-between gap-2">
              <div className="text-sm font-semibold text-fg">{selectedStage.label}</div>
              <Badge tone={selectedStage.latency > slo * 0.35 ? 'warn' : 'accent'}>{formatMs(selectedStage.latency)}</Badge>
            </div>
            <div className="space-y-3 text-sm">
              <div className="rounded-xl bg-subtle p-3">
                <div className="text-xs font-semibold uppercase tracking-wide text-muted">Typical models</div>
                <div className="mt-1 text-fg">{selectedStage.details.models}</div>
              </div>
              <div className="rounded-xl bg-subtle p-3">
                <div className="text-xs font-semibold uppercase tracking-wide text-muted">Features</div>
                <div className="mt-1 text-fg">{selectedStage.details.features}</div>
              </div>
              <div className="rounded-xl bg-subtle p-3">
                <div className="text-xs font-semibold uppercase tracking-wide text-muted">Metrics</div>
                <div className="mt-1 text-fg">{selectedStage.details.metrics}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-3 lg:grid-cols-[.9fr_1.1fr]">
          <div className="rounded-2xl border border-line bg-panel/80 p-4">
            <div className="mb-3 text-sm font-semibold text-fg">Stage sizes</div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Slider label="corpus" value={corpusM} min={1} max={100} onChange={setCorpusM} format={(v) => `${v}M`} />
              <Slider label="ANN candidates" value={ann} min={100} max={2000} step={50} onChange={setAnn} />
              <Slider label="co-visitation" value={covis} min={0} max={1000} step={25} onChange={setCovis} />
              <Slider label="trending" value={trending} min={0} max={600} step={25} onChange={setTrending} />
              <Slider label="light rank top" value={lightTop} min={100} max={1500} step={25} onChange={setLightTop} />
              <Slider label="heavy rank top" value={heavyTop} min={20} max={400} step={10} onChange={setHeavyTop} />
              <Slider label="final slate" value={slate} min={5} max={50} onChange={setSlate} />
            </div>
          </div>

          <div className="rounded-2xl border border-line bg-panel/80 p-4">
            <div className="mb-3 text-sm font-semibold text-fg">Per-item model cost and latency budget</div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Slider label="candidate ms/item" value={candidateCost} min={0.002} max={0.08} step={0.001} onChange={setCandidateCost} format={(v) => `${v.toFixed(3)}ms`} />
              <Slider label="light ms/item" value={lightCost} min={0.005} max={0.15} step={0.005} onChange={setLightCost} format={(v) => `${v.toFixed(3)}ms`} />
              <Slider label="heavy ms/item" value={heavyCost} min={0.05} max={1.5} step={0.01} onChange={setHeavyCost} format={(v) => `${v.toFixed(2)}ms`} />
              <Slider label="rerank ms/item" value={rerankCost} min={0.01} max={0.3} step={0.01} onChange={setRerankCost} format={(v) => `${v.toFixed(2)}ms`} />
            </div>
            <div className="mt-4 overflow-hidden rounded-xl border border-line bg-subtle p-3">
              <div className="mb-2 flex items-center justify-between text-xs text-muted">
                <span>Latency stack</span>
                <span className={totalLatency > slo ? 'text-err' : 'text-ok'}>{formatMs(totalLatency)} / {slo}ms</span>
              </div>
              <div className="flex h-6 overflow-hidden rounded-full bg-line">
                {stages.filter((stage) => stage.latency > 0).map((stage) => (
                  <motion.div key={stage.id} initial={false} animate={{ width: `${(stage.latency / Math.max(totalLatency, slo)) * 100}%` }} className="h-full" style={{ background: totalLatency > slo ? C.err : stage.color }} title={`${stage.label}: ${formatMs(stage.latency)}`} />
                ))}
                {totalLatency < slo && <div className="h-full flex-1 bg-panel" />}
              </div>
            </div>
          </div>
        </div>

        <div className={cn('rounded-xl border border-line bg-subtle p-3 text-sm text-muted', totalLatency > slo && 'border-err/50')}>
          <span className="font-semibold text-fg">Insight:</span> Retrieval optimizes recall cheaply, ranking spends model cost only on narrowed candidates, and re-ranking enforces diversity and policy before the final slate.
        </div>
      </div>
    </VizFrame>
  )
}
