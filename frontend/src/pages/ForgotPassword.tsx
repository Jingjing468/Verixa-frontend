import { useState } from 'react'
import { ArrowRight, Headphones, Mail } from 'lucide-react'
import { Link } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout'
import { apiRequest } from '../api/client'

function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setMessage('')
    setError('')
    setLoading(true)

    try {
      const response = await apiRequest<{ success: true; message: string }>('/auth/forgot-password', {
        method: 'POST',
        body: { email },
      })
      setMessage(response.message)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not send reset email')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout variant="forgot">
      <div className="auth-heading">
        <h2>Forgot Password?</h2>
        <p>Enter your email address and we'll send you a link to reset your password.</p>
      </div>
      <form className="auth-form" onSubmit={handleSubmit}>
        <label>Work Email Address<span className="field"><Mail size={16} /><input type="email" placeholder="Enter your work email" value={email} onChange={(event) => setEmail(event.target.value)} required /></span></label>
        {message && <span className="verify-helper">{message}</span>}
        {error && <span className="field-error">{error}</span>}
        <button className="auth-submit" type="submit" disabled={loading}>{loading ? 'Sending...' : 'Send Reset Link'} <ArrowRight size={17} /></button>
      </form>
      <div className="form-divider"><span>or</span></div>
      <Link className="back-button" to="/login">Back to Sign In</Link>
      <p className="support-copy"><Headphones size={14} /> Still having trouble? <a href="#contact">Contact Support</a></p>
    </AuthLayout>
  )
}

export default ForgotPassword
