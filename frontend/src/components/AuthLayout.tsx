import { Building2, Check, FileCheck2, LockKeyhole, ShieldCheck } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import verixaLogo from '../assets/verixaicon.png'

type AuthVariant = 'login' | 'register' | 'forgot' | 'reset'

interface AuthIllustrationProps { variant: AuthVariant }
interface AuthLayoutProps { variant: AuthVariant; children: ReactNode }

const content: Record<AuthVariant, { description: string; chips: string[] }> = {
  login: { description: 'Manage blockchain-backed digital credentials with confidence. Issue, verify, and protect certificates through a secure and transparent platform.', chips: ['Blockchain Secured', 'Tamper-Proof', 'Trusted Verification'] },
  register: { description: 'Join thousands of organizations issuing trusted digital credentials on the blockchain.', chips: ['Immutable Records', 'Real-time Verification', 'Built for Institutions'] },
  forgot: { description: "No worries! We'll help you reset your password and get back to your account.", chips: ['Secure Process', 'Quick Recovery', 'Account Protection'] },
  reset: { description: 'Choose a new, strong password to keep your account safe and secure.', chips: ['Strong Password', 'Secure Account', 'Protected Data'] },
}

function AuthIllustration({ variant }: AuthIllustrationProps) {
  const Icon = variant === 'forgot' ? LockKeyhole : variant === 'register' ? Building2 : variant === 'login' ? FileCheck2 : ShieldCheck
  return <div className={`auth-illustration ${variant}`} aria-hidden="true"><span className="orbit orbit-one" /><span className="orbit orbit-two" /><div className="illustration-card"><Icon size={variant === 'login' ? 39 : 68} />{variant === 'login' && <div className="mini-credential"><small>Certificate of Completion</small><b>Blockchain Fundamentals</b><span>John Doe</span></div>}</div></div>
}

function AuthLayout({ variant, children }: AuthLayoutProps) {
  const data = content[variant]
  return <main className="auth-page"><aside className="auth-aside"><Link className="auth-brand" to="/"><img src={verixaLogo} alt="Verixa" className="auth-logo" /></Link><div className="auth-aside-copy"><h1>Secure.<br /><em>Verified.</em><br />Trusted.</h1><p>{data.description}</p></div><AuthIllustration variant={variant} /><div className="auth-chips">{data.chips.map(chip => <span key={chip}><Check size={13} />{chip}</span>)}</div><p className="auth-copyright">© 2026 Verixa. All rights reserved.</p></aside><section className="auth-panel"><div className="auth-card">{children}</div></section></main>
}

export default AuthLayout
