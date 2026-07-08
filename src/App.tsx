import { lazy, Suspense } from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import { Layout } from './components/Layout'
import { Card } from './components/ui'
import { Welcome } from './pages/Welcome'
import { Start } from './pages/Start'
import { Home } from './pages/Home'
import { Room } from './pages/Room'
import { ItemDetail } from './pages/ItemDetail'
import { AddItem } from './pages/AddItem'
import { Family } from './pages/Family'
import { Appraisals } from './pages/Appraisals'
import { Emergency } from './pages/Emergency'
import { Summary } from './pages/Summary'
import { Plan } from './pages/Plan'
import { OfferCheck } from './pages/OfferCheck'

// Leaf-weight routes load on demand — the common path never pays for them.
const Guide = lazy(() => import('./pages/Guide').then((m) => ({ default: m.Guide })))
const PrintMemo = lazy(() => import('./pages/PrintMemo').then((m) => ({ default: m.PrintMemo })))
const PrintInventory = lazy(() =>
  import('./pages/PrintInventory').then((m) => ({ default: m.PrintInventory })),
)
const PrintBinder = lazy(() =>
  import('./pages/PrintBinder').then((m) => ({ default: m.PrintBinder })),
)

function NotFound() {
  return (
    <Card className="mx-auto mt-10 max-w-lg p-8 text-center">
      <p className="text-xl font-semibold">That page doesn’t exist.</p>
      <p className="mt-1 text-ink-soft">No harm done — your binder is safe.</p>
      <Link
        to="/binder"
        className="mt-5 inline-flex min-h-11 items-center rounded-2xl bg-clay px-6 py-3 text-lg font-semibold text-white hover:bg-clay-dark"
      >
        Back to my binder
      </Link>
    </Card>
  )
}

function App() {
  return (
    <Layout>
      <Suspense
        fallback={
          <p className="mt-16 text-center font-serif text-2xl text-ink-soft">One moment…</p>
        }
      >
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/start" element={<Start />} />
        <Route path="/binder" element={<Home />} />
        <Route path="/room/:roomId" element={<Room />} />
        <Route path="/item/:itemId" element={<ItemDetail />} />
        <Route path="/add" element={<AddItem />} />
        <Route path="/family" element={<Family />} />
        <Route path="/appraisals" element={<Appraisals />} />
        <Route path="/emergency" element={<Emergency />} />
        <Route path="/summary" element={<Summary />} />
        <Route path="/plan" element={<Plan />} />
        <Route path="/check" element={<OfferCheck />} />
        <Route path="/guide" element={<Guide />} />
        <Route path="/print/binder" element={<PrintBinder />} />
        <Route path="/print/memo" element={<PrintMemo />} />
        <Route path="/print/inventory" element={<PrintInventory />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      </Suspense>
    </Layout>
  )
}

export default App
