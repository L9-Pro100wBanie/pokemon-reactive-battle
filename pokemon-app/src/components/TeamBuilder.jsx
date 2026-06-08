import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Subject, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, delay } from 'rxjs/operators';
import pokemonData from '../data/pokemonMock.json';

export default function TeamBuilder() {
  const navigate = useNavigate();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredPokemon, setFilteredPokemon] = useState(pokemonData);
  const [team, setTeam] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const searchSubject = useMemo(() => new Subject(), []);

  useEffect(() => {
    const subscription = searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      switchMap((term) => {
        setIsSearching(true);
        const results = pokemonData.filter(p => 
          p.name.toLowerCase().includes(term.toLowerCase()) || 
          p.type.toLowerCase().includes(term.toLowerCase())
        );
        return of(results).pipe(delay(500)); 
      })
    ).subscribe((results) => {
      setFilteredPokemon(results);
      setIsSearching(false);
    });

    return () => subscription.unsubscribe();
  }, [searchSubject]);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    searchSubject.next(value);
  };

  const addToTeam = (pokemon) => {
    if (team.length >= 6) {
      alert("Twoja drużyna jest już pełna! (Max 6)");
      return;
    }
    if (team.find(p => p.id === pokemon.id)) {
      alert("Ten Pokemon jest już w drużynie!");
      return;
    }
    setTeam([...team, pokemon]);
  };

  const removeFromTeam = (pokemonId) => {
    setTeam(team.filter(p => p.id !== pokemonId));
  };

  const startBattle = (difficulty) => {
    localStorage.setItem('myTeam', JSON.stringify(team));
    localStorage.setItem('difficulty', difficulty); // Zapisujemy poziom trudności
    navigate('/battle');
  };

  // --- FUNKCJA MAPUJĄCA TYP NA KOLOR TŁA ---
  const getTypeColor = (type) => {
    const colors = {
      Grass: 'linear-gradient(135deg, #78C850, #4E8234)',
      Fire: 'linear-gradient(135deg, #F08030, #9C531F)',
      Water: 'linear-gradient(135deg, #6890F0, #445E9C)',
      Electric: 'linear-gradient(135deg, #F8D030, #A1871F)',
      Ghost: 'linear-gradient(135deg, #705898, #493963)',
      Psychic: 'linear-gradient(135deg, #F85888, #A13959)',
      Normal: 'linear-gradient(135deg, #A8A878, #6D6D4E)',
      Dragon: 'linear-gradient(135deg, #7038F8, #4924A1)',
      Fighting: 'linear-gradient(135deg, #C03028, #7D1F1A)',
      Fairy: 'linear-gradient(135deg, #EE99AC, #9B6470)',
    };
    return colors[type] || 'linear-gradient(135deg, #68A090, #44685E)';
  };

  return (
    <div style={{ padding: '20px', maxWidth: '900px', margin: '0 auto' }}>
      <h2 style={{ textAlign: 'center' }}>Witaj Trenerze {localStorage.getItem('user')}!</h2>
      
      {/* Sekcja Twojej drużyny */}
      <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)', marginBottom: '30px' }}>
        <h3 style={{ marginTop: 0 }}>Twój skład ({team.length}/6)</h3>
        
        <div style={{ display: 'flex', gap: '15px', minHeight: '160px', flexWrap: 'wrap', alignItems: 'center' }}>
          {team.length === 0 ? <p style={{ color: '#888' }}>Wybierz Pokemony z listy poniżej, aby zbudować zespół...</p> : null}
          
          {team.map((poke) => (
            <div 
              key={`team-${poke.id}`} 
              className="pokemon-card team-member"
              style={{ background: getTypeColor(poke.type) }}
            >
              <img src={poke.image} alt={poke.name} className="pokemon-image" />
              <div style={{ fontWeight: 'bold' }}>{poke.name}</div>
              <button 
                onClick={() => removeFromTeam(poke.id)} 
                className="btn-choose"
                style={{ color: 'red' }}
              >
                Usuń
              </button>
            </div>
          ))}
        </div>

        {team.length === 6 && (
          <div style={{ marginTop: '20px', width: '100%', textAlign: 'center' }}>
            <h4 style={{ margin: '10px 0' }}>Wybierz poziom trudności:</h4>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button 
                onClick={() => startBattle(4)}
                style={{ padding: '15px 30px', background: '#4CAF50', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                ŁATWY (4 Wrogów)
              </button>
              <button 
                onClick={() => startBattle(5)}
                style={{ padding: '15px 30px', background: '#FF9800', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                ŚREDNI (5 Wrogów)
              </button>
              <button 
                onClick={() => startBattle(6)}
                style={{ padding: '15px 30px', background: '#F44336', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                TRUDNY (6 Wrogów)
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Wyszukiwarka RxJS */}
      <div style={{ marginBottom: '20px' }}>
        <input 
          type="text" 
          placeholder="Szukaj po nazwie lub typie (np. Fire)..." 
          value={searchTerm}
          onChange={handleSearchChange}
          style={{ padding: '12px', width: '100%', borderRadius: '8px', border: '1px solid #ddd', fontSize: '1rem', boxSizing: 'border-box' }}
        />
        {isSearching && <p style={{ color: '#6890F0', fontWeight: 'bold' }}>Szukam Pokemonów (RxJS)...</p>}
      </div>

      {/* Lista dostępnych Pokemonów */}
      <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', justifyContent: 'center' }}>
        {filteredPokemon.map((poke) => (
          <div 
            key={poke.id} 
            className="pokemon-card"
            style={{ background: getTypeColor(poke.type) }}
          >
            <img src={poke.image} alt={poke.name} className="pokemon-image" />
            <div style={{ fontSize: '1.1rem', fontWeight: 'bold', margin: '5px 0' }}>{poke.name}</div>
            <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>{poke.type} | HP: {poke.hp}</div>
            <button 
              onClick={() => addToTeam(poke)}
              disabled={team.find(p => p.id === poke.id) || team.length >= 6}
              className="btn-choose"
            >
              {team.find(p => p.id === poke.id) ? 'W drużynie' : 'Wybierz'}
            </button>
          </div>
        ))}
        {filteredPokemon.length === 0 && !isSearching && <p>Nie znaleziono takiego Pokemona.</p>}
      </div>
    </div>
  );
}