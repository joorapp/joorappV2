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
          position="top-right"
          autoClose={5000}
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
