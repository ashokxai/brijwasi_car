import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { AuthProvider } from './context/AuthContext';
import AdminLayout from './layouts/AdminLayout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import CarsPage from './pages/CarsPage';
import AddCarPage from './pages/AddCarPage';
import UsersPage from './pages/UsersPage';
import BrandsPage from './pages/BrandsPage';
import ModelsPage from './pages/ModelsPage';
import CitiesPage from './pages/CitiesPage';
import FuelTypesPage from './pages/FuelTypesPage';
import BannersPage from './pages/BannersPage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';

export default function App() {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#C9A227',
          borderRadius: 8,
          fontFamily: "'Segoe UI', 'Helvetica Neue', Arial, sans-serif",
        },
      }}
    >
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route element={<AdminLayout />}>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/cars" element={<CarsPage />} />
              <Route path="/cars/add" element={<AddCarPage />} />
              <Route path="/users" element={<UsersPage />} />
              <Route path="/brands" element={<BrandsPage />} />
              <Route path="/models" element={<ModelsPage />} />
              <Route path="/cities" element={<CitiesPage />} />
              <Route path="/fuel-types" element={<FuelTypesPage />} />
              <Route path="/banners" element={<BannersPage />} />
              <Route path="/reports" element={<ReportsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ConfigProvider>
  );
}
