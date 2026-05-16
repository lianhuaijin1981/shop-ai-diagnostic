import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from '@/components/Layout'
import {
  Dashboard,
  Diagnostic,
  ProductDiagnostic,
  TaskCenter,
  AlertCenter,
  Settings,
} from '@/pages'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="diagnostic" element={<Diagnostic />} />
          <Route path="diagnostic/products" element={<ProductDiagnostic />} />
          <Route path="tasks" element={<TaskCenter />} />
          <Route path="alerts" element={<AlertCenter />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
