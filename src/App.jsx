
import { useState } from 'react';
import StartScreen from './components/StartScreen';
import Game from './components/Game';
import EndGame from './components/EndGame';
import Leaderboard from './components/Leaderboard';
import './App.css';
import './index.css';

function App() {
  const [screen, setScreen] = useState('start');
  const [score, setScore] = useState(0);
  const [scores, setScores] = useState([]);

  // Simuleer game einde
  // Game roept deze functie aan met de juiste score
  const handleEndGame = (finalScore) => {
    setScore(finalScore);
    setScreen('end');
  };

  // Simuleer score opslaan
  const handleSaveScore = (name) => {
    setScores([...scores, { name, score }]);
    setScreen('leaderboard');
  };

  const handleRestart = () => {
    setScreen('start');
    setScore(0);
  };

  return (
    <div className="app">
      {screen === 'start' && (
        <StartScreen
          onStart={() => setScreen('game')}
          onShowLeaderboard={() => setScreen('leaderboard')}
        />
      )}
      {screen === 'game' && (
        <Game onEnd={handleEndGame} />
      )}
      {screen === 'end' && (
        <EndGame
          score={score}
          onSave={handleSaveScore}
          onShowLeaderboard={() => setScreen('leaderboard')}
          onRestart={handleRestart}
        />
      )}
      {screen === 'leaderboard' && (
        <Leaderboard
          scores={scores.sort((a, b) => b.score - a.score).slice(0, 10)}
          onBack={handleRestart}
        />
      )}
    </div>
  );
}

export default App;
