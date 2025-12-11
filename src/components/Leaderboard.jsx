import React from 'react';


const trophyColors = ['#FFD700', '#C0C0C0', '#CD7F32'];

const Leaderboard = ({ scores, onBack }) => {
  const filtered = scores
    .filter(entry => entry.name && entry.name.trim() && typeof entry.score === 'number' && entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);
  return (
    <div className="leader-bg">
      <div className="leader-emoji">🏆</div>
      <h2 className="leader-title">Leaderboard</h2>
      <ol className="leader-list">
        {filtered.length === 0 && <li style={{ color: '#aaa', fontStyle: 'italic' }}>Nog geen scores...</li>}
        {filtered.map((entry, idx) => (
          <li
            key={idx}
            className={
              idx === 0 ? 'top1' : idx === 1 ? 'top2' : idx === 2 ? 'top3' : ''
            }
          >
            <span className="leader-rank">
              {idx < 3 ? <span style={{ color: trophyColors[idx] }}>🏅</span> : idx + 1}
            </span>
            <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{entry.name}</span>
            <span className="leader-score">{entry.score}</span>
          </li>
        ))}
      </ol>
      <button onClick={onBack} className="leader-btn">
        Terug
      </button>
    </div>
  );
};

export default Leaderboard;
