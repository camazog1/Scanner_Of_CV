import Header from "@components/Header";
import { Outlet } from "react-router-dom";
import "@styles/mainLayout.css";

function MainLayout() {
  return (
    <div className="main-layout d-flex flex-column min-vh-100 h-auto">
      <Header />
      <div className="container flex-grow-1 d-flex p-4">
        <Outlet /> {/* This will render the current page */}
      </div>
    </div>
  );
}

export default MainLayout;
