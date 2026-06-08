import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Subject } from 'rxjs';
import { exhaustMap, delay } from 'rxjs/operators';
import pokemonData from '../data/pokemonMock.json';

export default function Battle() {
  const navigate = useNavigate();

  const [playerTeam, setPlayerTeam] = useState([]);
  const [opponentTeam, setOpponentTeam] = useState([]);
  const [activePlayerIdx, setActivePlayerIdx] = useState(0);
  const [activeOpponentIdx, setActiveOpponentIdx] = useState(0);
  
  const [battleLog, setBattleLog] = useState(["Witaj na arenie! Przygotuj się do walki."]);
  const [gameOver, setGameOver] = useState(null);
  
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [playerAnim, setPlayerAnim] = useState('');
  const [opponentAnim, setOpponentAnim] = useState('');

  const actionSubject = useMemo(() => new Subject(), []);

  useEffect(() => {
    const savedTeam = JSON.parse(localStorage.getItem('myTeam'));
    const difficulty = parseInt(localStorage.getItem('difficulty')) || 4;

    if (!savedTeam) {
      navigate('/team-builder');
      return;
    }

    setPlayerTeam(savedTeam.map(p => ({ ...p, currentHp: p.hp })));
    
    const shuffledData = [...pokemonData].sort(() => 0.5 - Math.random());
    const enemyTeam = shuffledData.slice(0, difficulty).map(p => ({ ...p, currentHp: p.hp }));
    setOpponentTeam(enemyTeam);
  }, [navigate]);

  useEffect(() => {
    const subscription = actionSubject.pipe(
      exhaustMap(action => {
        setIsPlayerTurn(false);
        return new Promise(resolve => executeTurn(action, resolve));
      })
    ).subscribe();

    return () => subscription.unsubscribe();
  }, [playerTeam, opponentTeam, activePlayerIdx, activeOpponentIdx, gameOver]);

  const addLog = (message) => setBattleLog(prev => [message, ...prev].slice(0, 6));

  const executeTurn = (action, resolvePromise) => {
    if (gameOver) return resolvePromise();

    if (action.type === 'ATTACK') {
      handleAttackSequence(action.moveName, resolvePromise);
    } else if (action.type === 'SWITCH') {
      setActivePlayerIdx(action.index);
      addLog(`Wracaj ${playerTeam[activePlayerIdx].name}! Wybieram Cię: ${playerTeam[action.index].name}!`);
      setTimeout(() => opponentTurnSequence(resolvePromise), 1000);
    }
  };

  const handleAttackSequence = (moveName, resolvePromise) => {
    const damage = Math.floor(Math.random() * 20) + 15;
    
    setPlayerAnim('anim-attack');
    
    setTimeout(() => setOpponentAnim('anim-hit'), 500);

    setTimeout(() => {
      setPlayerAnim('');
      setOpponentAnim('');
      
      let newOpponentTeam = [...opponentTeam];
      let currentEnemy = { ...newOpponentTeam[activeOpponentIdx] };
      currentEnemy.currentHp -= damage;
      addLog(`Twój ${playerTeam[activePlayerIdx].name} używa ${moveName}! Zadaje ${damage} DMG.`);

      if (currentEnemy.currentHp <= 0) {
        currentEnemy.currentHp = 0;
        addLog(`${currentEnemy.name} mdleje!`);
        newOpponentTeam[activeOpponentIdx] = currentEnemy;
        setOpponentTeam(newOpponentTeam);

        if (activeOpponentIdx + 1 < newOpponentTeam.length) {
          setActiveOpponentIdx(activeOpponentIdx + 1);
          addLog(`Przeciwnik wysyła ${newOpponentTeam[activeOpponentIdx + 1].name}!`);
          setIsPlayerTurn(true);
          resolvePromise();
        } else {
          setGameOver('win');
          resolvePromise();
        }
      } else {
        newOpponentTeam[activeOpponentIdx] = currentEnemy;
        setOpponentTeam(newOpponentTeam);
        setTimeout(() => opponentTurnSequence(resolvePromise), 1000);
      }
    }, 1000);
  };

  const opponentTurnSequence = (resolvePromise) => {
    const activeEnemy = opponentTeam[activeOpponentIdx];
    const randomMove = activeEnemy.moves[Math.floor(Math.random() * activeEnemy.moves.length)];
    const enemyDamage = Math.floor(Math.random() * 15) + 10;

    setOpponentAnim('anim-attack');
    setTimeout(() => setPlayerAnim('anim-hit'), 500);

    setTimeout(() => {
      setOpponentAnim('');
      setPlayerAnim('');

      let newPlayerTeam = [...playerTeam];
      let currentPlayer = { ...newPlayerTeam[activePlayerIdx] };
      currentPlayer.currentHp -= enemyDamage;
      addLog(`Przeciwnik ${activeEnemy.name} używa ${randomMove}! Zadaje ${enemyDamage} DMG.`);

      if (currentPlayer.currentHp <= 0) {
        currentPlayer.currentHp = 0;
        addLog(`Twój ${currentPlayer.name} mdleje! Wybierz innego.`);
        
        newPlayerTeam[activePlayerIdx] = currentPlayer;
        setPlayerTeam(newPlayerTeam);
        
        const isAllDead = newPlayerTeam.every(p => p.currentHp === 0);
        if (isAllDead) {
          setGameOver('lose');
        }
      } else {
        newPlayerTeam[activePlayerIdx] = currentPlayer;
        setPlayerTeam(newPlayerTeam);
      }
      
      setIsPlayerTurn(true);
      resolvePromise();
    }, 1000);
  };

  if (playerTeam.length === 0) return <p>Ładowanie areny...</p>;
 if (gameOver) {
    return (
      <div style={{ textAlign: 'center', marginTop: '80px' }}>
        <h1 style={{ fontSize: '3.5rem', color: gameOver === 'win' ? '#4CAF50' : '#F44336', textShadow: '2px 2px 4px rgba(0,0,0,0.2)' }}>
          {gameOver === 'win' ? '🏆 WYGRAŁEŚ WALKĘ! 🏆' : '💀 ZESPÓŁ POKONANY 💀'}
        </h1>
        
        {gameOver === 'win' && (
          <div>
            <img 
              src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/25.gif" 
              alt="Happy Pikachu" 
              className="bounce-win" 
            />
            <p style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#555' }}>Twój zespół spisał się na medal!</p>
          </div>
        )}

        <button onClick={() => navigate('/team-builder')} style={{ padding: '15px 40px', fontSize: '1.2rem', marginTop: '30px', background: '#2196F3', color: 'white', border: 'none', borderRadius: '30px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 10px rgba(33, 150, 243, 0.4)' }}>
          Zbuduj nową drużynę
        </button>
      </div>
    );
  }
  const activePlayer = playerTeam[activePlayerIdx];
  const activeOpponent = opponentTeam[activeOpponentIdx];

return (
    <div style={{ padding: '20px', maxWidth: '900px', margin: '0 auto' }}>
      
      <img 
        src="https://images.wikidexcdn.net/mwuploads/wikidex/thumb/e/e3/latest/20191122144704/Estadio_de_Pueblo_Hoyuelo.png/1200px-Estadio_de_Pueblo_Hoyuelo.png" 
        alt="Battle Stadium" 
        className="battle-banner"
      />

      <div style={{ display: 'flex', justifyContent: 'space-between', background: 'linear-gradient(to bottom, #d4f0ff 0%, #e8f9e9 100%)', padding: '30px', borderRadius: '15px', border: '3px solid #ccc' }}> 
        
        <div style={{ width: '40%', textAlign: 'center' }}>
          <div style={{ background: 'rgba(255,255,255,0.8)', padding: '10px', borderRadius: '10px', marginBottom: '10px' }}>
            <h3 style={{ margin: 0 }}>{activePlayer.name}</h3>
            <div style={{ background: '#ddd', height: '15px', width: '100%', borderRadius: '10px', overflow: 'hidden', marginTop: '5px' }}>
              <div style={{ background: activePlayer.currentHp > (activePlayer.hp*0.2) ? '#4CAF50' : '#F44336', height: '100%', width: `${(activePlayer.currentHp / activePlayer.hp) * 100}%`, transition: 'width 0.3s' }}></div>
            </div>
            <p style={{ margin: '5px 0 0 0', fontWeight: 'bold' }}>HP: {activePlayer.currentHp} / {activePlayer.hp}</p>
          </div>
          <img 
            src={activePlayer.image} 
            alt={activePlayer.name} 
            className={`battle-card ${playerAnim}`} 
            style={{ width: '180px', height: '180px', objectFit: 'contain' }} 
          />
        </div>

        <div style={{ width: '40%', textAlign: 'center' }}>
          <div style={{ background: 'rgba(255,255,255,0.8)', padding: '10px', borderRadius: '10px', marginBottom: '10px' }}>
            <h3 style={{ margin: 0 }}>Przeciwnik: {activeOpponent.name}</h3>
            <div style={{ background: '#ddd', height: '15px', width: '100%', borderRadius: '10px', overflow: 'hidden', marginTop: '5px' }}>
              <div style={{ background: activeOpponent.currentHp > (activeOpponent.hp*0.2) ? '#4CAF50' : '#F44336', height: '100%', width: `${(activeOpponent.currentHp / activeOpponent.hp) * 100}%`, transition: 'width 0.3s' }}></div>
            </div>
            <p style={{ margin: '5px 0 0 0', fontWeight: 'bold' }}>HP: {activeOpponent.currentHp} / {activeOpponent.hp}</p>
          </div>
          <img 
            src={activeOpponent.image} 
            alt={activeOpponent.name} 
            className={`battle-card ${opponentAnim}`} 
            style={{ width: '180px', height: '180px', objectFit: 'contain' }} 
          />
        </div>
      </div>

      <div style={{ display: 'flex', marginTop: '20px', gap: '20px' }}>
        <div style={{ flex: 1 }}>
          <h3 style={{ marginTop: 0 }}>Ruchy (Tura: {isPlayerTurn ? 'TWOJA' : 'PRZECIWNIKA'})</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {activePlayer.moves.map((move, i) => (
              <button 
                key={i} 
                disabled={!isPlayerTurn || activePlayer.currentHp === 0}
                onClick={() => actionSubject.next({ type: 'ATTACK', moveName: move })} 
                style={{ 
                  padding: '15px', cursor: isPlayerTurn && activePlayer.currentHp > 0 ? 'pointer' : 'not-allowed', 
                  background: isPlayerTurn ? 'white' : '#eee', border: '2px solid #ccc', borderRadius: '8px', fontWeight: 'bold',
                  opacity: isPlayerTurn ? 1 : 0.6
                }}
              >
                {move}
              </button>
            ))}
          </div>
        </div>

        <div style={{ flex: 1, background: '#333', color: 'white', padding: '15px', borderRadius: '8px', boxShadow: 'inset 0 0 10px black' }}>
          {battleLog.map((log, i) => (
            <p key={i} style={{ margin: '5px 0', opacity: 1 - (i * 0.15), fontSize: i === 0 ? '1.1rem' : '0.9rem', color: i === 0 ? 'yellow' : 'white' }}>
              {log}
            </p>
          ))}
        </div>
      </div>

      <div style={{ marginTop: '30px', background: 'white', padding: '15px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
        <h3 style={{ marginTop: 0 }}>Twoja drużyna (Zmiana kosztuje turę!)</h3>
        <div style={{ display: 'flex', gap: '15px', overflowX: 'auto', paddingBottom: '10px' }}>
          {playerTeam.map((poke, i) => (
            <div 
              key={i} 
              onClick={() => {
                if (isPlayerTurn && poke.currentHp > 0 && i !== activePlayerIdx) {
                  actionSubject.next({ type: 'SWITCH', index: i });
                }
              }}
              style={{ 
                border: `3px solid ${i === activePlayerIdx ? '#2196F3' : '#eee'}`, 
                borderRadius: '8px', padding: '10px', textAlign: 'center', minWidth: '100px',
                cursor: (isPlayerTurn && poke.currentHp > 0 && i !== activePlayerIdx) ? 'pointer' : 'not-allowed',
                opacity: poke.currentHp > 0 ? 1 : 0.4,
                background: i === activePlayerIdx ? '#e3f2fd' : 'white'
              }}
            >
              <img src={poke.image} alt={poke.name} style={{ width: '50px', height: '50px', objectFit: 'contain' }} />
              <p style={{ margin: '5px 0 0 0', fontSize: '0.9rem', fontWeight: 'bold' }}>{poke.name}</p>
              <small style={{ color: poke.currentHp < (poke.hp*0.2) ? 'red' : 'green' }}>HP: {poke.currentHp}</small>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}