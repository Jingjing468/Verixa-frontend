import { useState } from 'react'
import { ArrowRight, EyeOff, LockKeyhole } from 'lucide-react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout'
import { apiRequest } from '../api/client'

function ResetPassword() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')?.trim() ?? ''
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')

    if (!token) {
      setError('Reset token is missing')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    setLoading(true)

    try {
      await apiRequest('/auth/reset-password', {
        method: 'POST',
        body: { token, newPassword: password },
      })
      navigate('/login', { replace: true })
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Password reset failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout variant="reset">
      <div className="auth-heading">
        <h2>Reset Password</h2>
        <p>{token ? 'Enter your new password below.' : 'Your reset link is missing its token. Please request a new reset link.'}</p>
      </div>
      <form className="auth-form" onSubmit={handleSubmit}>
        <label>New Password<span className="field"><LockKeyhole size={16} /><input type="password" placeholder="Enter new password" value={password} onChange={(event) => setPassword(event.target.value)} required /><EyeOff size={16} /></span></label>
        <div className="strength"><span>Password strength: <b>{password.length >= 8 ? 'Strong' : 'Too short'}</b></span><i><b /><b /><b /><b /><b /></i></div>
        <label>Confirm New Password<span className="field"><LockKeyhole size={16} /><input type="password" placeholder="Confirm new password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required /><EyeOff size={16} /></span></label>
        {error && <span className="field-error">{error}</span>}
        <button className="auth-submit" type="submit" disabled={loading || !token}>{loading ? 'Resetting...' : 'Reset Password'} <ArrowRight size={17} /></button>
      </form>
      <p className="auth-switch">Remember your password? <Link to="/login">Sign In</Link></p>
    </AuthLayout>
  )
}

export default ResetPassword
