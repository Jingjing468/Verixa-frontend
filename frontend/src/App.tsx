import { BrowserRouter, Route, Routes } from 'react-router-dom'
import ForgotPassword from './pages/ForgotPassword'
import Dashboard from './pages/Dashboard'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import ResetPassword from './pages/ResetPassword'
import CreateCertificate from './pages/CreateCertificate'
import CertificateList from './pages/CertificateList'
import CertificateDetail from './pages/CertificateDetail'
import EditCertificate from './pages/EditCertificate'
import RevokeCertificate from './pages/RevokeCertificate'
import Settings from './pages/Settings'
import Recipients from './pages/Recipients'
import Reports from './pages/Reports'
import Notifications from './pages/Notifications'
import Profile from './pages/Profile'
import VerifyCertificate from './pages/VerifyCertificate'
import VerificationResult from './pages/VerificationResult'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/certificates/create" element={<CreateCertificate />} />
        <Route path="/certificates" element={<CertificateList />} />
        <Route path="/certificates/:id" element={<CertificateDetail />} />
        <Route path="/certificates/:id/edit" element={<EditCertificate />} />
        <Route path="/certificates/:id/revoke" element={<RevokeCertificate />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/recipients" element={<Recipients />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/verify" element={<VerifyCertificate />} />
        <Route path="/verify/:id" element={<VerificationResult />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
