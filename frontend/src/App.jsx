import { BrowserRouter, Route, Routes } from 'react-router-dom'

import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import History from './pages/History'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="history" element={<History />} />
          <Route path="*" element={<Dashboard />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
