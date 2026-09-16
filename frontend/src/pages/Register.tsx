import { ArrowRight, Building2, EyeOff, LockKeyhole, Mail, UserRound } from 'lucide-react'
import { Link } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout'

function Register() {
  return <AuthLayout variant="register"><div className="auth-heading"><h2>Create Organization Account</h2><p>Register your organization to start issuing digital certificates.</p></div><form className="auth-form compact-form" onSubmit={event => event.preventDefault()}><label>Organization Name<span className="field"><input placeholder="e.g. Acme University" /><Building2 size={16} /></span></label><label>Admin Full Name<span className="field"><input placeholder="John Doe" /><UserRound size={16} /></span></label><label>Work Email Address<span className="field"><input type="email" placeholder="admin@organization.edu" /><Mail size={16} /></span></label><label>Password<span className="field"><input type="password" placeholder="Create a strong password" /><LockKeyhole size={16} /><EyeOff size={16} /></span></label><label>Confirm Password<span className="field"><input type="password" placeholder="Confirm your password" /><LockKeyhole size={16} /><EyeOff size={16} /></span></label><label className="checkbox-label terms"><input type="checkbox" /> I agree to the <a href="#terms">Terms of Service</a> and <a href="#privacy">Privacy Policy</a>.</label><button className="auth-submit" type="submit">Create Account <ArrowRight size={17} /></button></form><p className="auth-switch">Already have an account? <Link to="/login">Sign In</Link></p></AuthLayout>
}
export default Register
