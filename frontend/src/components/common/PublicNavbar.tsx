import { Link } from 'react-router-dom'
import verixaLogo from '../../assets/verixaicon.png'

export default function PublicNavbar() {
  return (
    <header className="site-header">
      <Link className="brand" to="/">
        <img src={verixaLogo} alt="Verixa" className="brand-logo" />
      </Link>
      <nav>
        <a href="/#home">Home</a>
        <a href="/#features">Features</a>
        <a href="/#how-it-works">How It Works</a>
        <a href="/#contact">About</a>
      </nav>
      <Link className="login-button" to="/login">
        Admin Login
      </Link>
    </header>
  )
}
