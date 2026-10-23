import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import PwaStatus from './components/PwaStatus.jsx'
import Landing from './pages/Landing.jsx'
import Analyze from './pages/Analyze.jsx'
import Results from './pages/Results.jsx'

export default function App() {
  return (
    <>
      <Navbar />
      <PwaStatus />
      <main className="mx-auto max-w-5xl px-4 pb-16">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/analyze" element={<Analyze />} />
          <Route path="/results" element={<Results />} />
        </Routes>
      </main>
    </>
  )
}
