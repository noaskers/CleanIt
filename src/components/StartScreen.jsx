import React from 'react';


const StartScreen = ({ onStart, onShowLeaderboard }) => (
  <div className="start-bg">
    <div className="start-emoji">🧹</div>
    <h1 className="start-title">CleanIt</h1>
    <p className="start-desc">
      Welkom bij de afvalprikker game! Verzamel afval, ontwijk auto's en sorteer alles zo snel mogelijk.
    </p>
    <button onClick={onStart} className="start-btn">
      Start Game
    </button>
    <button onClick={onShowLeaderboard} className="start-btn secondary">
      Leaderboard
    </button>
  </div>
);

export default StartScreen;
