import React, { useState } from 'react';

const EndGame = ({ score, onSave, onShowLeaderboard, onRestart }) => {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSave = () => {
    if (name.length < 1 || name.length > 20) {
      setError('Naam moet tussen 1 en 20 tekens zijn.');
      return;
    }
    setError('');
    onSave(name);
  };

  return (
    <div className="end-bg">
      <div className="end-emoji">🏁</div>
      <h2 className="end-title">Game Over</h2>
      <div className="end-score-label">Je score:</div>
      <div className="end-score">{score}</div>
      <input
        type="text"
        placeholder="Voer naam in"
        value={name}
        onChange={e => setName(e.target.value)}
        maxLength={20}
        className="end-input"
      />
      <button onClick={handleSave} className="end-btn">
        Opslaan
      </button>
      {error && <div className="end-error">{error}</div>}
      <div style={{ display: 'flex', gap: 16, marginTop: 10 }}>
        <button onClick={onShowLeaderboard} className="end-btn secondary">
          Leaderboard
        </button>
        <button onClick={onRestart} className="end-btn tertiary">
          Opnieuw spelen
        </button>
      </div>
    </div>
  );
};

export default EndGame;
