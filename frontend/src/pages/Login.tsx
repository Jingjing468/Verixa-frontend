import { useState } from 'react'
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout'
import googleIcon from '../assets/googleicon.png'
import { apiRequest, setAuthToken } from '../api/client'
import type { LoginResponse } from '../api/types'

function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await apiRequest<LoginResponse>('/auth/login', {
        method: 'POST',
        body: { email, password },
      })
      setAuthToken(result.token)
      navigate('/dashboard')
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout variant="login">
      <div className="auth-heading">
        <h2>Welcome Back</h2>
        <p>Sign in to your organization account.</p>
      </div>
      <form className="auth-form" onSubmit={handleSubmit}>
        <label>
          Email Address
          <span className="field">
            <Mail size={16} />
            <input type="email" placeholder="Enter your email" value={email} onChange={(event) => setEmail(event.target.value)} required />
          </span>
        </label>
        <label>
          Password
          <span className="field">
            <LockKeyhole size={16} />
            <input type={showPassword ? 'text' : 'password'} placeholder="Enter your password" value={password} onChange={(event) => setPassword(event.target.value)} required />
            <button
              className="password-visibility-toggle"
              type="button"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              aria-pressed={showPassword}
              onClick={() => setShowPassword((visible) => !visible)}
            >
              {showPassword ? <Eye size={16} /> : <EyeOff size={16} />}
            </button>
          </span>
        </label>
        {error && <span className="field-error">{error}</span>}
        <div className="form-options">
          <label className="checkbox-label"><input type="checkbox" /> Remember me</label>
          <Link to="/forgot-password">Forgot password?</Link>
        </div>
        <button className="auth-submit" type="submit" disabled={loading}>
          {loading ? 'Signing In...' : 'Sign In'} <ArrowRight size={17} />
        </button>
      </form>
      <div className="form-divider"><span>or continue with</span></div>
      <button className="google-button" type="button"><img src={googleIcon} alt="" /> Continue with Google</button>
      <p className="auth-switch">Don't have an account? <Link to="/register">Create Organization Account</Link></p>
    </AuthLayout>
  )
}

export default Login
