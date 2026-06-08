import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login({ setAuth }) {
  const [username, setUsername] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    
    // Walidacja: minimum 3 znaki i przynajmniej jedna cyfra
    const hasNumber = /\d/.test(username);
    
    if (username.trim().length >= 3 && hasNumber) {
      localStorage.setItem('user', username);
      setAuth(true);
      navigate('/team-builder');
    } else {
      alert("Formularz odrzucony: Login musi mieć minimum 3 znaki i zawierać co najmniej jedną cyfrę!");
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      backgroundImage: "url('https://images.wikidexcdn.net/mwuploads/wikidex/thumb/3/36/latest/20160222165038/Fondo_de_Batalla_Pradera_6_G.png/1200px-Fondo_de_Batalla_Pradera_6_G.png')", 
      backgroundSize: 'cover', 
      backgroundPosition: 'center' 
    }}>
      <div style={{ 
        background: 'rgba(255, 255, 255, 0.95)', 
        padding: '40px', 
        borderRadius: '20px', 
        boxShadow: '0 10px 30px rgba(0,0,0,0.4)', 
        textAlign: 'center', 
        maxWidth: '400px', 
        width: '90%' 
      }}>
        <img 
          src="https://upload.wikimedia.org/wikipedia/commons/9/98/International_Pok%C3%A9mon_logo.svg" 
          alt="Pokemon Logo" 
          style={{ width: '80%', marginBottom: '10px' }} 
        />
        <h2 style={{ marginBottom: '25px', color: '#333', fontSize: '1.5rem' }}>Zaloguj się na Arenę</h2>
        
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <input 
            type="text" 
            placeholder="Twój login (np. Trener123)..." 
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{ padding: '15px', borderRadius: '10px', border: '2px solid #ddd', fontSize: '1rem', outline: 'none' }}
          />
          <button 
            type="submit"
            style={{ 
              padding: '15px', 
              borderRadius: '10px', 
              border: 'none', 
              background: '#3b4cca', /* Klasyczny niebieski z Pokemonów */
              color: 'white', 
              fontSize: '1.2rem', 
              fontWeight: 'bold', 
              cursor: 'pointer',
              boxShadow: '0 4px 6px rgba(59, 76, 202, 0.4)'
            }}
          >
            Wejdź do gry
          </button>
        </form>
        <p style={{ marginTop: '15px', fontSize: '0.8rem', color: '#666' }}>Wymagane: min. 3 znaki i 1 cyfra</p>
      </div>
    </div>
  );
}