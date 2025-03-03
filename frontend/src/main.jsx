import '@styles/index.css'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import Dashboard from '@pages/Dashboard.jsx'
import About from '@pages/About.jsx'
import FileUpload from '@pages/FileUpload.jsx'
import MainLayout from '@layouts/MainLayout.jsx'
import { createBrowserRouter, RouterProvider } from 'react-router-dom';


const router = createBrowserRouter([
  {
    element: <MainLayout />, children: [
      { path: "/", element: <App /> },
      { path: "/dashboard", element: <Dashboard /> },
      { path: "/file-upload", element: <FileUpload /> },
      { path: "/about", element: <About /> },
    ]
  }
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
