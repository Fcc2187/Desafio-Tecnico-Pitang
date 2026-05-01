import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './pages/auth/LoginPage';
import { AuthRoute } from './components/shared/AuthRoute';
import { DashboardLayout } from './components/shared/DashboardLayout';
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { ReimbursementsPage } from './pages/reimbursements/ReimbursementsPage';
import { CategoriesPage } from './pages/categories/CategoriesPage';
import { UsersPage } from './pages/users/UsersPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        
        <Route element={<AuthRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/reimbursements" element={<ReimbursementsPage />} />

            <Route element={<AuthRoute allowedRoles={['ADMIN']} />}>
              <Route path="/categories" element={<CategoriesPage />} />
              <Route path="/users" element={<UsersPage />} />
            </Route>
          </Route>
        </Route>
        
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
