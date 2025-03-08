import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "@styles/Index.css";

function Header() {
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return (
        <>
            {/* Header adicional solo en móviles */}
            {isMobile && (
                <div className="mobile-header">
                    <img src="/images/magneto_logo.png" alt="Magneto Logo" className="magneto-logo-mobile" />
                </div>
            )}

            {/* Header principal */}
            <nav className="navbar navbar-expand-lg header-container">
                <div className="container-fluid">
                    {/* Logo HireLens a la izquierda */}
                    <Link to="/" className="navbar-brand text-white">
                        <img src="/images/hirelens_logo.png" alt="HireLens Logo" style={{ height: "45px" }} />
                    </Link>

                    {/* Botón de menú solo en móviles */}
                    <button className="navbar-toggler d-lg-none" type="button" data-bs-toggle="collapse" data-bs-target="#navbarTogglerDemo03" aria-controls="navbarTogglerDemo03" aria-expanded="false" aria-label="Toggle navigation">
                        <span className="navbar-toggler-icon"></span>
                    </button>

                    {/* Menú de navegación */}
                    <div className="collapse navbar-collapse" id="navbarTogglerDemo03">
                        <ul className="navbar-nav ms-auto">
                            <li className="nav-item">
                                <Link to="/dashboard" className="nav-link text-white">Dashboard</Link>
                            </li>
                            <li className="nav-item">
                                <Link to="/file-upload" className="nav-link text-white">File upload</Link>
                            </li>
                            <li className="nav-item">
                                <Link to="/guide" className="nav-link text-white">Guía</Link>
                            </li>

                            {/* Mostrar logo Magneto solo en PC */}
                            {!isMobile && (
                                <li className="nav-item ms-4">
                                    <img src="/images/magneto_logo.png" alt="Magneto Logo" style={{ height: "40px" }} />
                                </li>
                            )}
                        </ul>
                    </div>
                </div>
            </nav>
        </>
    );
}

export default Header;
