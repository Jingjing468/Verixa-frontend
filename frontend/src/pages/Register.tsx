import { useState } from 'react'
import { ArrowRight, Building2, EyeOff, LockKeyhole, Mail, UserRound } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout'
import { apiRequest } from '../api/client'
import type { RegisterResponse } from '../api/types'

function Register() {
  const navigate = useNavigate()
  const [organizationName, setOrganizationName] = useState('')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (!acceptedTerms) {
      setError('Please accept the terms before creating an account')
      return
    }

    setLoading(true)

    try {
      await apiRequest<RegisterResponse>('/auth/register', {
        method: 'POST',
        body: {
          organizationName,
          organizationEmail: email,
          fullName,
          email,
          password,
        },
      })
      navigate('/login')
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout variant="register">
      <div className="auth-heading">
        <h2>Create Organization Account</h2>
        <p>Register your organization to start issuing digital certificates.</p>
      </div>
      <form className="auth-form compact-form" onSubmit={handleSubmit}>
        <label>Organization Name<span className="field"><input placeholder="e.g. Acme University" value={organizationName} onChange={(event) => setOrganizationName(event.target.value)} required /><Building2 size={16} /></span></label>
        <label>Admin Full Name<span className="field"><input placeholder="John Doe" value={fullName} onChange={(event) => setFullName(event.target.value)} required /><UserRound size={16} /></span></label>
        <label>Work Email Address<span className="field"><input type="email" placeholder="admin@organization.edu" value={email} onChange={(event) => setEmail(event.target.value)} required /><Mail size={16} /></span></label>
        <label>Password<span className="field"><input type="password" placeholder="Create a strong password" value={password} onChange={(event) => setPassword(event.target.value)} required /><LockKeyhole size={16} /><EyeOff size={16} /></span></label>
        <label>Confirm Password<span className="field"><input type="password" placeholder="Confirm your password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required /><LockKeyhole size={16} /><EyeOff size={16} /></span></label>
        <label className="checkbox-label terms"><input type="checkbox" checked={acceptedTerms} onChange={(event) => setAcceptedTerms(event.target.checked)} /> I agree to the <a href="#terms">Terms of Service</a> and <a href="#privacy">Privacy Policy</a>.</label>
        {error && <span className="field-error">{error}</span>}
        <button className="auth-submit" type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create Account'} <ArrowRight size={17} /></button>
      </form>
      <p className="auth-switch">Already have an account? <Link to="/login">Sign In</Link></p>
    </AuthLayout>
  )
}

export default Register
