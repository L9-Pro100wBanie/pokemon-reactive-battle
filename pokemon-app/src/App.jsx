import Battle from './components/Battle';
import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import TeamBuilder from './components/TeamBuilder';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setIsAuthenticated(false);
  };

  return (
    <BrowserRouter>
      {isAuthenticated && (
        <nav style={{ padding: '10px', background: '#eee', display: 'flex', justifyContent: 'space-between' }}>
          <strong>Pokemon Battle App</strong>
          <button onClick={handleLogout}>Wyloguj</button>
        </nav>
      )}

      <Routes>
        <Route 
          path="/" 
          element={isAuthenticated ? <Navigate to="/team-builder" /> : <Navigate to="/login" />} 
        />
        
        <Route 
          path="/login" 
          element={<Login setAuth={setIsAuthenticated} />} 
        />
        
        <Route 
          path="/team-builder" 
          element={isAuthenticated ? <TeamBuilder /> : <Navigate to="/login" />} 
        />
        
        <Route 
         path="/battle"
         element={isAuthenticated ? <Battle /> : <Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;