import { Suspense, lazy } from 'react'
import type { ReactNode } from 'react'
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom'
import Layout from './components/Layout'

const Dashboard = lazy(() => import('./pages/Dashboard'))
const DsaList = lazy(() => import('./pages/DsaList'))
const DsaWorkspace = lazy(() => import('./pages/DsaWorkspace'))
const SqlList = lazy(() => import('./pages/Sql').then((m) => ({ default: m.SqlList })))
const SqlWorkspace = lazy(() => import('./pages/Sql'))
const MlList = lazy(() => import('./pages/MlCoding').then((m) => ({ default: m.MlList })))
const MlWorkspace = lazy(() => import('./pages/MlCoding'))
const SdList = lazy(() => import('./pages/Design').then((m) => ({ default: () => <m.DesignList kind="sd" /> })))
const SdDoc = lazy(() => import('./pages/Design').then((m) => ({ default: () => <m.DesignDocPage kind="sd" /> })))
const MlsdList = lazy(() => import('./pages/Design').then((m) => ({ default: () => <m.DesignList kind="mlsd" /> })))
const MlsdDoc = lazy(() => import('./pages/Design').then((m) => ({ default: () => <m.DesignDocPage kind="mlsd" /> })))
const TheoryList = lazy(() => import('./pages/Theory').then((m) => ({ default: m.TheoryList })))
const TheoryTopic = lazy(() => import('./pages/Theory').then((m) => ({ default: m.TheoryTopicPage })))
const Review = lazy(() => import('./pages/Review'))
const VizGallery = lazy(() => import('./pages/Visualizers').then((m) => ({ default: m.VisualizerGallery })))
const VizDetail = lazy(() => import('./pages/Visualizers').then((m) => ({ default: m.VisualizerDetail })))
const StudyPlan = lazy(() => import('./pages/StudyPlan'))
const Mock = lazy(() => import('./pages/Mock'))
const Resources = lazy(() => import('./pages/Resources'))
const Settings = lazy(() => import('./pages/Settings'))
const SelfTest = lazy(() => import('./pages/SelfTest'))

function Loading() {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-line border-t-accent" />
    </div>
  )
}

function Keyed({ children }: { children: ReactNode }) {
  const loc = useLocation()
  return <Suspense key={loc.pathname.split('/')[1]} fallback={<Loading />}>{children}</Suspense>
}

function NotFound() {
  return <div className="p-10 text-center text-muted">Page not found.</div>
}

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Keyed>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/plan" element={<StudyPlan />} />
            <Route path="/dsa" element={<DsaList />} />
            <Route path="/dsa/:id" element={<DsaWorkspace />} />
            <Route path="/sql" element={<SqlList />} />
            <Route path="/sql/:id" element={<SqlWorkspace />} />
            <Route path="/ml-coding" element={<MlList />} />
            <Route path="/ml-coding/:id" element={<MlWorkspace />} />
            <Route path="/system-design" element={<SdList />} />
            <Route path="/system-design/:id" element={<SdDoc />} />
            <Route path="/ml-design" element={<MlsdList />} />
            <Route path="/ml-design/:id" element={<MlsdDoc />} />
            <Route path="/theory" element={<TheoryList />} />
            <Route path="/theory/:id" element={<TheoryTopic />} />
            <Route path="/review" element={<Review />} />
            <Route path="/visualizers" element={<VizGallery />} />
            <Route path="/visualizers/:id" element={<VizDetail />} />
            <Route path="/mock" element={<Mock />} />
            <Route path="/resources" element={<Resources />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/diagnostics" element={<SelfTest />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Keyed>
      </Layout>
    </BrowserRouter>
  )
}
