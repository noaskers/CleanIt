import React, { useState, useEffect } from 'react';
import SortScreen from './SortScreen';

const MAP_WIDTH = 50;
const MAP_HEIGHT = 50;
const TILE_SIZE = 32;
const VIEWPORT_WIDTH = 12;
const VIEWPORT_HEIGHT = 10;
const VERZAMELTIJD = 20;

const AFVAL_TYPES = [
  { type: 'Plastic', color: '#FFD700', icon: '🧴' },
  { type: 'Papier', color: '#87CEEB', icon: '📄' },
  { type: 'Glas', color: '#90EE90', icon: '🍾' },
  { type: 'Rest', color: '#D3D3D3', icon: '🗑️' },
];

const TILE_TYPES = {
  GRASS: { name: 'Gras', color: '#7ec850', icon: null },
  ROAD: { name: 'Weg', color: '#b2b2b2', icon: '🛣️' },
  SIDEWALK: { name: 'Stoep', color: '#e0e0e0', icon: '🟫' },
  HOUSE: { name: 'Huis', color: '#e6b89c', icon: '🏠' },
  TREE: { name: 'Boom', color: '#4e944f', icon: '🌳' },
  EMPTY: { name: 'Leeg', color: '#fff', icon: null },
};

function generateTilemap(width, height) {
  const map = [];
  for (let y = 0; y < height; y++) {
    const row = [];
    for (let x = 0; x < width; x++) {
      if (y % 8 === 0 || x % 8 === 0) row.push(1);
      else if (y % 8 === 1 || x % 8 === 1) row.push(2);
      else if (y % 8 === 2 || x % 8 === 2) row.push(4);
      else if (y % 8 === 3 || x % 8 === 3) row.push(3);
      else row.push(0);
    }
    map.push(row);
  }
  return map;
}

const TILEMAP = generateTilemap(MAP_WIDTH, MAP_HEIGHT);
const AUTO_EMOJI = '🚗';
const AUTO_ROWS = [0, 8, 16, 24, 32, 40, 48];
const AUTO_SPEED = 1;

// Random pos op gras
function randomPosOnMap() {
  let x, y;
  do {
    x = Math.floor(Math.random() * MAP_WIDTH);
    y = Math.floor(Math.random() * MAP_HEIGHT);
  } while (TILEMAP[y][x] !== 0);
  return { x, y };
}

function generateAfval(count) {
  const items = [];
  for (let i = 0; i < count; i++) {
    const pos = randomPosOnMap();
    const type = AFVAL_TYPES[Math.floor(Math.random() * AFVAL_TYPES.length)];
    items.push({ ...pos, ...type, id: i });
  }
  return items;
}

function Game({ onEnd }) {

  // ✅ ALLE STATE BOVENAAN
  const [fase, setFase] = useState('verzamelen');
  const [timer, setTimer] = useState(VERZAMELTIJD);
  // Zoek een veilig grasveld voor de speler om te spawnen
  function getSafeSpawn() {
    for (let y = 0; y < MAP_HEIGHT; y++) {
      for (let x = 0; x < MAP_WIDTH; x++) {
        if (TILEMAP[y][x] === 0) {
          // Check dat er geen auto is op deze plek
          if (!AUTO_ROWS.includes(y)) {
            return { x, y };
          }
        }
      }
    }
    return { x: 1, y: 1 };
  }
  const [player, setPlayer] = useState(getSafeSpawn());
  const [viewport, setViewport] = useState({ x: 0, y: 0 });

  const [afval, setAfval] = useState(generateAfval(20));
  const [verzameld, setVerzameld] = useState([]);

  const [sortKeuzes, setSortKeuzes] = useState([]);
  const [score, setScore] = useState(0);

  const [autos, setAutos] = useState(
    AUTO_ROWS.map(row => {
      let ax;
      do {
        ax = Math.floor(Math.random() * MAP_WIDTH);
      } while (ax === player.x && row === player.y);
      return { x: ax, y: row, dir: Math.random() > 0.5 ? 1 : -1 };
    })
  );

  // 🚗 Auto’s bewegen
  useEffect(() => {
    if (fase !== 'verzamelen') return;

    const interval = setInterval(() => {
      setAutos(prev =>
        prev.map(auto => {
          // Detecteer kruispunt: weg in meerdere richtingen
          const isRoad = (x, y) => x >= 0 && x < MAP_WIDTH && y >= 0 && y < MAP_HEIGHT && TILEMAP[y][x] === 1;
          // Richtingen: rechtdoor, links, rechts
          const rechtdoor = isRoad(auto.x + auto.dir, auto.y);
          const links = isRoad(auto.x, auto.y - 1);
          const rechts = isRoad(auto.x, auto.y + 1);
          // Een kruispunt is als er minimaal 3 wegen zijn
          const numRoads = [rechtdoor, links, rechts].filter(Boolean).length;

          if (numRoads >= 2) {
            // ECHT kruispunt: random links, rechts of rechtdoor
            const options = [];
            if (rechtdoor) options.push({ dx: auto.dir, dy: 0, dir: auto.dir });
            if (links) options.push({ dx: 0, dy: -1, dir: auto.dir });
            if (rechts) options.push({ dx: 0, dy: 1, dir: auto.dir });
            const choice = options[Math.floor(Math.random() * options.length)];
            return {
              ...auto,
              x: auto.x + choice.dx,
              y: auto.y + choice.dy,
              dir: auto.dir
            };
          } else if (rechtdoor) {
            // Rechte weg: gewoon rechtdoor
            return { ...auto, x: auto.x + auto.dir, y: auto.y };
          } else {
            // Doodlopend: auto stopt
            return { ...auto };
          }
        })
      );
    }, 400);

    return () => clearInterval(interval);
  }, [fase]);

  // ❗ Botsing met auto
  useEffect(() => {
    if (fase !== 'verzamelen') return;

    if (autos.some(auto => auto.x === player.x && auto.y === player.y)) {
      onEnd(verzameld.length);
    }
  }, [autos, player, fase]);

  // Countdown
  useEffect(() => {
    if (fase === 'verzamelen' && timer > 0) {
      const interval = setInterval(() => setTimer(t => t - 1), 1000);
      return () => clearInterval(interval);
    }
    if (fase === 'verzamelen' && timer === 0) {
      setFase('scheiden');
    }
  }, [fase, timer]);

  // WASD beweging
  useEffect(() => {
    if (fase !== 'verzamelen') return;

    const handleKey = e => {
      if (!['w','a','s','d','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)) return;
      setPlayer(prev => {
        let { x, y } = prev;
        // Speler mag over gras (0), stoep (3) en weg (1) lopen
        const canWalk = t => t === 0 || t === 1 || t === 3;
        if ((e.key === 'w' || e.key === 'ArrowUp') && y > 0 && canWalk(TILEMAP[y - 1][x])) y--;
        if ((e.key === 's' || e.key === 'ArrowDown') && y < MAP_HEIGHT - 1 && canWalk(TILEMAP[y + 1][x])) y++;
        if ((e.key === 'a' || e.key === 'ArrowLeft') && x > 0 && canWalk(TILEMAP[y][x - 1])) x--;
        if ((e.key === 'd' || e.key === 'ArrowRight') && x < MAP_WIDTH - 1 && canWalk(TILEMAP[y][x + 1])) x++;
        return { x, y };
      });
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [fase]);

  // Scroll viewport
  useEffect(() => {
    let vx = viewport.x;
    let vy = viewport.y;

    if (player.x < vx + 2 && vx > 0) vx--;
    if (player.x > vx + VIEWPORT_WIDTH - 3 && vx < MAP_WIDTH - VIEWPORT_WIDTH) vx++;

    if (player.y < vy + 2 && vy > 0) vy--;
    if (player.y > vy + VIEWPORT_HEIGHT - 3 && vy < MAP_HEIGHT - VIEWPORT_HEIGHT) vy++;

    setViewport({ x: vx, y: vy });
  }, [player]);

  // Afval oprapen
  useEffect(() => {
    if (fase !== 'verzamelen') return;

    const found = afval.find(item => item.x === player.x && item.y === player.y);
    if (found) {
      setVerzameld([...verzameld, found]);
      setAfval(afval.filter(item => item.id !== found.id));
    }
  }, [player, afval, fase, verzameld]);

  // Sorteerfase keuze
  const handleSort = (idx, type) => {
    const juist = verzameld[idx].type === type;
    setSortKeuzes([...sortKeuzes, { idx, type, juist }]);
    // Score wordt bij afronden berekend
  };

  // ...existing code...

  // ✔️ Sorteerscherm
  if (fase === 'scheiden') {
    return <SortScreen verzameld={verzameld} onEnd={onEnd} />;
  }

  // ✔️ Speelscherm (viewport)
  return (
    <div className="cleanit-bg">
      <h2 className="cleanit-title">CleanIt - Stad</h2>
      <div className="cleanit-hud">
        <div className="cleanit-hud-item">⏰ Tijd: {timer}s</div>
        <div className="cleanit-hud-item afval">🗑️ Afval: {verzameld.length}</div>
      </div>
      <div
        className="cleanit-grid"
        style={{
          gridTemplateColumns: `repeat(${VIEWPORT_WIDTH}, ${TILE_SIZE}px)`,
          gridTemplateRows: `repeat(${VIEWPORT_HEIGHT}, ${TILE_SIZE}px)`,
          width: VIEWPORT_WIDTH * TILE_SIZE,
          height: VIEWPORT_HEIGHT * TILE_SIZE,
        }}
      >
        {[...Array(VIEWPORT_WIDTH * VIEWPORT_HEIGHT)].map((_, i) => {
          const x = viewport.x + (i % VIEWPORT_WIDTH);
          const y = viewport.y + Math.floor(i / VIEWPORT_WIDTH);

          const tileType = TILEMAP[y][x];
          const tile =
            tileType === 0 ? TILE_TYPES.GRASS :
            tileType === 1 ? TILE_TYPES.ROAD :
            tileType === 2 ? TILE_TYPES.HOUSE :
            tileType === 3 ? TILE_TYPES.SIDEWALK :
            tileType === 4 ? TILE_TYPES.TREE : TILE_TYPES.EMPTY;

          const afvalItem = afval.find(item => item.x === x && item.y === y);
          const auto = autos.find(a => a.x === x && a.y === y);
          const isPlayer = player.x === x && player.y === y;

          // Dynamische achtergrondkleur
          let tileClass = 'cleanit-tile';
          if (isPlayer) tileClass += ' player';

          return (
            <div
              key={i}
              className={tileClass}
              style={{
                width: TILE_SIZE,
                height: TILE_SIZE,
                background: isPlayer ? '#8ecae6' : afvalItem ? afvalItem.color : tile.color,
              }}
            >
              {isPlayer && <span>🧑‍🦱</span>}
              {afvalItem && !isPlayer && <span>{afvalItem.icon}</span>}
              {auto && <span>{AUTO_EMOJI}</span>}
              {!isPlayer && !afvalItem && !auto && tile.icon && <span>{tile.icon}</span>}
            </div>
          );
        })}
      </div>
      <div className="cleanit-controls">
        Gebruik <b>WASD</b> om te lopen. Vermijd de <span style={{ fontSize: 22 }}>🚗</span>!
      </div>
    </div>
  );
}

export default Game;
