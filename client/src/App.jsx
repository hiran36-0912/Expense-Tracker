import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { CurrencyProvider } from './context/CurrencyContext';
import { ToastProvider } from './context/ToastContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Budgets from './pages/Budgets';
import SavingsGoals from './pages/SavingsGoals';
import RecurringTransactions from './pages/RecurringTransactions';
import Reports from './pages/Reports';
import Categories from './pages/Categories';
import AddTransaction from './pages/AddTransaction';
import EditTransaction from './pages/EditTransaction';
import Profile from './pages/Profile';
import Analytics from './pages/Analytics';

function AppLayout({ children }) {
  return (
    <div className="app-layout">
      <Navbar />
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <CurrencyProvider>
        <ToastProvider>
          <Router>
            <AuthProvider>
              <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Protected Routes */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <AppLayout>
                        <Dashboard />
                      </AppLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/transactions"
                  element={
                    <ProtectedRoute>
                      <AppLayout>
                        <Transactions />
                      </AppLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/budgets"
                  element={
                    <ProtectedRoute>
                      <AppLayout>
                        <Budgets />
                      </AppLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/goals"
                  element={
                    <ProtectedRoute>
                      <AppLayout>
                        <SavingsGoals />
                      </AppLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/recurring"
                  element={
                    <ProtectedRoute>
                      <AppLayout>
                        <RecurringTransactions />
                      </AppLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/reports"
                  element={
                    <ProtectedRoute>
                      <AppLayout>
                        <Reports />
                      </AppLayout>
                    </ProtectedRoute>
                  }
                />
                {/* Keep /analytics backwards-compatible, pointing to Reports */}
                <Route
                  path="/analytics"
                  element={
                    <ProtectedRoute>
                      <AppLayout>
                        <Reports />
                      </AppLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/categories"
                  element={
                    <ProtectedRoute>
                      <AppLayout>
                        <Categories />
                      </AppLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/add-transaction"
                  element={
                    <ProtectedRoute>
                      <AppLayout>
                        <AddTransaction />
                      </AppLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/edit-transaction/:id"
                  element={
                    <ProtectedRoute>
                      <AppLayout>
                        <EditTransaction />
                      </AppLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <AppLayout>
                        <Profile />
                      </AppLayout>
                    </ProtectedRoute>
                  }
                />

                {/* Default redirect */}
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </AuthProvider>
          </Router>
        </ToastProvider>
      </CurrencyProvider>
    </ThemeProvider>
  );
}

export default App;
