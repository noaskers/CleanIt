
import React, { useState, useEffect, useRef } from 'react';

const AFVAL_TYPES = [
  { type: 'Plastic', color: '#FFD700', icon: '🧴' },
  { type: 'Papier', color: '#87CEEB', icon: '📄' },
  { type: 'Glas', color: '#90EE90', icon: '🍾' },
  { type: 'Rest', color: '#D3D3D3', icon: '🗑️' },
];

function shuffle(array) {
  let arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const SORT_TIME = 10;

const SortScreen = ({ verzameld, onEnd }) => {
  const [sortKeuzes, setSortKeuzes] = useState([]);
  const [afvalQueue, setAfvalQueue] = useState(() => shuffle(verzameld));
  const [currentIdx, setCurrentIdx] = useState(0);
  const [timer, setTimer] = useState(SORT_TIME);
  const [dragged, setDragged] = useState(false);
  const intervalRef = useRef();

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setTimer(t => {
        if (t <= 1) {
          clearInterval(intervalRef.current);
          handleEnd();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, []);

  const handleDrop = (bakType) => {
    if (currentIdx >= afvalQueue.length) return;
    const item = afvalQueue[currentIdx];
    const juist = item.type === bakType;
    setSortKeuzes([...sortKeuzes, { idx: currentIdx, type: bakType, juist }]);
    setCurrentIdx(currentIdx + 1);
    setDragged(false);
    if (currentIdx + 1 === afvalQueue.length) {
      setTimeout(handleEnd, 400);
    }
  };

  const handleEnd = () => {
    const goed = sortKeuzes.filter(k => k.juist).length;
    onEnd(verzameld.length + goed * 5);
  };

  if (!afvalQueue.length) return <div>Geen afval om te sorteren!</div>;

  // Drag event handlers
  const handleDragStart = e => {
    setDragged(true);
  };
  const handleDragEnd = () => setDragged(false);

  return (
    <div className="sort-bg">
      <h2 className="sort-title">Afval sorteren!</h2>
      <div className="sort-desc">Sleep het afval naar de juiste bak!</div>
      <div className={`sort-timer${timer < 6 ? ' low' : ''}`}>⏰ Tijd over: {timer}s</div>
      {/* Afvalstukje boven */}
      {currentIdx < afvalQueue.length && (
        <div className="sort-afval">
          <div
            draggable
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            className="sort-afval-icoon"
            style={{ background: afvalQueue[currentIdx].color }}
          >
            {afvalQueue[currentIdx].icon}
          </div>
        </div>
      )}
      {/* Bakken */}
      <div className="sort-bakken">
        {AFVAL_TYPES.map(bak => (
          <div
            key={bak.type}
            onDrop={() => handleDrop(bak.type)}
            onDragOver={e => e.preventDefault()}
            className="sort-bak"
            style={{ background: bak.color }}
          >
            <span className="sort-bak-icoon">{bak.icon}</span>
            <span className="sort-bak-label">{bak.type}</span>
          </div>
        ))}
      </div>
      <div className="sort-score">
        Score: {verzameld.length + sortKeuzes.filter(k => k.juist).length * 5}
        {(currentIdx >= afvalQueue.length || timer === 0) && (
          <button onClick={handleEnd} className="sort-btn">
            Afronden
          </button>
        )}
      </div>
    </div>
  );
};


export default SortScreen;
