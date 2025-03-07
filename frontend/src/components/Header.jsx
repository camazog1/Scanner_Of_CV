import { Link } from "react-router-dom";
import '@styles/Index.css';

function Header() {
    return (
        <nav className="navbar navbar-expand-lg" style={{ backgroundColor: 'var(--primary-color)' }}>
            <div className="container-fluid">
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarTogglerDemo03" aria-controls="navbarTogglerDemo03" aria-expanded="false" aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                </button>
                <Link to="/" className="navbar-brand text-white">HireLens</Link>
                <div className="collapse navbar-collapse" id="navbarTogglerDemo03">
                    <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                        <li className="nav-item">
                            <Link to="/dashboard" className="nav-link text-white">Dashboard</Link>
                        </li>
                        <li className="nav-item">
                            <Link to="/file-upload" className="nav-link text-white">File upload</Link>
                        </li>
                        <li className="nav-item">
                            <Link to="/guide" className="nav-link text-white">Guía</Link>  {/* Nuevo botón */}
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    );
}

export default Header;
