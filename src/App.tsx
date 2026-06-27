import { Routes, Route } from 'react-router-dom'
import { Layout } from './components/Layout'
import { Welcome } from './pages/Welcome'
import { Home } from './pages/Home'
import { Room } from './pages/Room'
import { ItemDetail } from './pages/ItemDetail'
import { AddItem } from './pages/AddItem'
import { Family } from './pages/Family'
import { Appraisals } from './pages/Appraisals'
import { Emergency } from './pages/Emergency'
import { Summary } from './pages/Summary'

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/binder" element={<Home />} />
        <Route path="/room/:roomId" element={<Room />} />
        <Route path="/item/:itemId" element={<ItemDetail />} />
        <Route path="/add" element={<AddItem />} />
        <Route path="/family" element={<Family />} />
        <Route path="/appraisals" element={<Appraisals />} />
        <Route path="/emergency" element={<Emergency />} />
        <Route path="/summary" element={<Summary />} />
      </Routes>
    </Layout>
  )
}

export default App
