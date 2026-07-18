import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Landing from '../pages/Landing';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Dashboard from '../pages/Dashboard';
import Transactions from '../pages/Transactions';
import Categories from '../pages/Categories';
import Budget from '../pages/Budget';
import Reports from '../pages/Reports';
import Wallets from '../pages/Wallets';
import Recurring from '../pages/Recurring';
import Settings from '../pages/Settings';
import Goals from '../pages/Goals';
import Debts from '../pages/Debts';
import Assistant from '../pages/Assistant';
import MainLayout from './layout/MainLayout';
import { useAuthStore } from '../store/authStore';
import PageTransition from './layout/PageTransition';

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

export default function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><Landing /></PageTransition>} />
        <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
        <Route path="/register" element={<PageTransition><Register /></PageTransition>} />
        
        {/* Protected Routes with MainLayout */}
        <Route element={<PrivateRoute><MainLayout /></PrivateRoute>}>
          <Route path="/dashboard" element={<PageTransition><Dashboard /></PageTransition>} />
          <Route path="/wallets" element={<PageTransition><Wallets /></PageTransition>} />
          <Route path="/transactions" element={<PageTransition><Transactions /></PageTransition>} />
          <Route path="/recurring" element={<PageTransition><Recurring /></PageTransition>} />
          <Route path="/categories" element={<PageTransition><Categories /></PageTransition>} />
          <Route path="/budget" element={<PageTransition><Budget /></PageTransition>} />
          <Route path="/reports" element={<PageTransition><Reports /></PageTransition>} />
          <Route path="/goals" element={<PageTransition><Goals /></PageTransition>} />
          <Route path="/debts" element={<PageTransition><Debts /></PageTransition>} />
          <Route path="/assistant" element={<PageTransition><Assistant /></PageTransition>} />
          <Route path="/settings" element={<PageTransition><Settings /></PageTransition>} />
        </Route>
      </Routes>
    </AnimatePresence>
  );
}
