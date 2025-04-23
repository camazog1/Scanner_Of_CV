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
      {isMobile && (
        <div className="mobile-header">
          <img
            src="/images/magneto_logo.png"
            alt="Magneto Logo"
            className="magneto-logo-mobile"
          />
        </div>
      )}

      <nav className="navbar navbar-expand-lg header-container">
        <div className="container-fluid">
          <Link to="/" className="navbar-brand text-white">
            <img
              src="/images/hirelens_logo.png"
              alt="HireLens Logo"
              style={{ height: "45px" }}
            />
          </Link>

          <button
            className="navbar-toggler d-lg-none"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarTogglerDemo03"
            aria-controls="navbarTogglerDemo03"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="navbarTogglerDemo03">
            <ul className="navbar-nav ms-auto">
              <li className="nav-item">
                <Link to="/" className="nav-link text-white">
                  <b>Subir CV</b>
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/guide" className="nav-link text-white">
                  <b>Guía</b>
                </Link>
              </li>

              {!isMobile && (
                <li className="nav-item ms-4">
                  <img
                    src="/images/magneto_logo.png"
                    alt="Magneto Logo"
                    style={{ height: "40px" }}
                  />
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
