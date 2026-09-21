import { useEffect, useRef, useState } from 'react'
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout'
import googleIcon from '../assets/googleicon.png'
import { apiRequest, setAuthToken } from '../api/client'
import type { LoginResponse } from '../api/types'

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
const googleScriptId = 'google-identity-services'

function Login() {
  const navigate = useNavigate()
  const googleButtonRef = useRef<HTMLDivElement | null>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

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

  const handleGoogleCredential = async (response: GoogleCredentialResponse) => {
    if (!response.credential) {
      setError('Google sign-in did not return a credential')
      return
    }

    setError('')
    setGoogleLoading(true)

    try {
      const result = await apiRequest<LoginResponse>('/auth/google', {
        method: 'POST',
        body: { credential: response.credential },
      })
      setAuthToken(result.token)
      navigate('/dashboard')
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Google sign-in failed')
    } finally {
      setGoogleLoading(false)
    }
  }

  useEffect(() => {
    if (!googleClientId || !googleButtonRef.current) return

    const renderGoogleButton = () => {
      if (!window.google || !googleButtonRef.current) return

      googleButtonRef.current.innerHTML = ''
      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: handleGoogleCredential,
      })
      window.google.accounts.id.renderButton(googleButtonRef.current, {
        theme: 'outline',
        size: 'large',
        type: 'standard',
        text: 'continue_with',
        shape: 'rectangular',
        width: googleButtonRef.current.offsetWidth || 360,
      })
    }

    if (window.google) {
      renderGoogleButton()
      return
    }

    let script = document.getElementById(googleScriptId) as HTMLScriptElement | null
    if (!script) {
      script = document.createElement('script')
      script.id = googleScriptId
      script.src = 'https://accounts.google.com/gsi/client'
      script.async = true
      script.defer = true
      document.head.appendChild(script)
    }
    script.addEventListener('load', renderGoogleButton)

    return () => {
      script?.removeEventListener('load', renderGoogleButton)
    }
  }, [])

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
      {googleClientId ? (
        <div className={googleLoading ? 'google-button-container loading' : 'google-button-container'} ref={googleButtonRef} />
      ) : (
        <button className="google-button" type="button" onClick={() => setError('Google sign-in is not configured. Add VITE_GOOGLE_CLIENT_ID in frontend/.env and GOOGLE_CLIENT_ID in backend/.env.')}>
          <img src={googleIcon} alt="" />
          Continue with Google
        </button>
      )}
      <p className="auth-switch">Don't have an account? <Link to="/register">Create Organization Account</Link></p>
    </AuthLayout>
  )
}

export default Login
