import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import CommonRoutes from './routes/CommonRoutes';
import './App.scss';

// Main App Component
const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <CommonRoutes />
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;
