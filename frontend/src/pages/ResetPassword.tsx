import { ArrowRight, EyeOff, LockKeyhole } from 'lucide-react'
import { Link } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout'

function ResetPassword() {
  return <AuthLayout variant="reset"><div className="auth-heading"><h2>Reset Password</h2><p>Enter your new password below.</p></div><form className="auth-form" onSubmit={event => event.preventDefault()}><label>New Password<span className="field"><LockKeyhole size={16} /><input type="password" placeholder="Enter new password" /><EyeOff size={16} /></span></label><div className="strength"><span>Password strength: <b>Strong</b></span><i><b /><b /><b /><b /><b /></i></div><label>Confirm New Password<span className="field"><LockKeyhole size={16} /><input type="password" placeholder="Confirm new password" /><EyeOff size={16} /></span></label><button className="auth-submit" type="submit">Reset Password <ArrowRight size={17} /></button></form><p className="auth-switch">Remember your password? <Link to="/login">Sign In</Link></p></AuthLayout>
}
export default ResetPassword
