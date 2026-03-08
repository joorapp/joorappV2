/**
 * @author Ananthapadmanabhan V K
 * Main App component for the application
 * This component is the main entry point for the application
 * @returns App component with AuthProvider, CompaniesProvider, Router, ToastContainer, CommonRoutes
 */

import { BrowserRouter as Router } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { AuthProvider } from './context/AuthContext';
import { CompaniesProvider } from './context/CompaniesContext';
import CommonRoutes from './routes/CommonRoutes';
import './App.scss';
// Import scss
import "./assets/scss/theme.scss";
// Import react-toastify CSS
import 'react-toastify/dist/ReactToastify.css';

// Get toast configuration from environment variables
const TOAST_AUTO_CLOSE = Number(import.meta.env.VITE_TOAST_AUTO_CLOSE) || 5000;
const TOAST_POSITION = (import.meta.env.VITE_TOAST_POSITION as any) || 'top-right';

// Main App Component
const App = () => {
  return (
    <AuthProvider>
      <CompaniesProvider>
        <Router>
          <div className="app">
            <CommonRoutes />
          </div>
        </Router>
        <ToastContainer
          position={TOAST_POSITION}
          autoClose={TOAST_AUTO_CLOSE}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </CompaniesProvider>
    </AuthProvider>
  );
};

export default App;
