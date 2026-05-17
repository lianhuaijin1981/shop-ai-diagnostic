import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from '@/components/Layout'
import {
  Dashboard,
  Diagnostic,
  CustomerFlowAnalysis,
  ConversionAnalysis,
  AvgAmountAnalysis,
  RepurchaseAnalysis,
  ProfitAnalysis,
  ProductDiagnostic,
  StrategyCenter,
  AlertCenter,
  Reports,
  Customers,
  Transactions,
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
          <Route path="diagnostic/customer-flow" element={<CustomerFlowAnalysis />} />
          <Route path="diagnostic/conversion" element={<ConversionAnalysis />} />
          <Route path="diagnostic/avg-amount" element={<AvgAmountAnalysis />} />
          <Route path="diagnostic/repurchase" element={<RepurchaseAnalysis />} />
          <Route path="diagnostic/profit" element={<ProfitAnalysis />} />
          <Route path="products" element={<ProductDiagnostic />} />
          <Route path="tasks" element={<StrategyCenter />} />
          <Route path="alerts" element={<AlertCenter />} />
          <Route path="reports" element={<Reports />} />
          <Route path="customers" element={<Customers />} />
          <Route path="transactions" element={<Transactions />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

