import { ConfigProvider } from 'antd';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { antdTheme } from '@/config/antdTheme';
import MainLayout from '@/layouts/MainLayout';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import Clients from '@/pages/Clients';
import Projects from '@/pages/Projects';
import Purchases from '@/pages/Purchases';
import Stock from '@/pages/Stock';
import SalesOrders from '@/pages/SalesOrders';
import Billing from '@/pages/Billing';
import Reports from '@/pages/Reports';
import NotFound from '@/pages/NotFound';

const App = () => (
  <ConfigProvider theme={antdTheme}>
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="clients" element={<Clients />} />
          <Route path="projects" element={<Projects />} />
          <Route path="purchases" element={<Purchases />} />
          <Route path="stock" element={<Stock />} />
          <Route path="sales" element={<SalesOrders />} />
          <Route path="billing" element={<Billing />} />
          <Route path="reports" element={<Reports />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </ConfigProvider>
);

export default App;
