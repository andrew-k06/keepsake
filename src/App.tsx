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
import { Guide } from './pages/Guide'
import { PrintMemo } from './pages/PrintMemo'
import { PrintInventory } from './pages/PrintInventory'
import { PrintBinder } from './pages/PrintBinder'

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
    </Layout>
  )
}

export default App
