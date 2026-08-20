import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail } from 'lucide-react'
import { Link } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout'
import googleIcon from '../assets/googleicon.png'

function Login() {
  return <AuthLayout variant="login"><div className="auth-heading"><h2>Welcome Back</h2><p>Sign in to your organization account.</p></div><form className="auth-form" onSubmit={event => event.preventDefault()}><label>Email Address<span className="field"><Mail size={16} /><input type="email" placeholder="Enter your email" /></span></label><label>Password<span className="field"><LockKeyhole size={16} /><input type="password" placeholder="Enter your password" /><EyeOff size={16} /></span></label><div className="form-options"><label className="checkbox-label"><input type="checkbox" /> Remember me</label><Link to="/forgot-password">Forgot password?</Link></div><button className="auth-submit" type="submit">Sign In <ArrowRight size={17} /></button></form><div className="form-divider"><span>or continue with</span></div><button className="google-button" type="button"><img src={googleIcon} alt="" /> Continue with Google</button><p className="auth-switch">Don't have an account? <Link to="/register">Create Organization Account</Link></p></AuthLayout>
}
export default Login
