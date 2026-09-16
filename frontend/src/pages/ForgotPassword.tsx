import { ArrowRight, Headphones, Mail } from 'lucide-react'
import { Link } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout'

function ForgotPassword() {
  return <AuthLayout variant="forgot"><div className="auth-heading"><h2>Forgot Password?</h2><p>Enter your email address and we'll send you a link to reset your password.</p></div><form className="auth-form" onSubmit={event => event.preventDefault()}><label>Work Email Address<span className="field"><Mail size={16} /><input type="email" placeholder="Enter your work email" /></span></label><button className="auth-submit" type="submit">Send Reset Link <ArrowRight size={17} /></button></form><div className="form-divider"><span>or</span></div><Link className="back-button" to="/login">Back to Sign In</Link><p className="support-copy"><Headphones size={14} /> Still having trouble? <a href="#contact">Contact Support</a></p></AuthLayout>
}
export default ForgotPassword
