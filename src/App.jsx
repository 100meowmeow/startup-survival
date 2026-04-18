import { useState } from 'react';
import Lobby from './Lobby';
import RoleReveal from './RoleReveal';
import Game from './Game';
import GameOver from './GameOver';

export default function App() {
  const [screen, setScreen] = useState('lobby');
  const [gameConfig, setGameConfig] = useState(null);
  const [playerData, setPlayerData] = useState(null);
  const [finalStats, setFinalStats] = useState(null);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#0a0a0a',
        color: '#fff',
        fontFamily: 'sans-serif',
      }}
    >
      {screen === 'lobby' && (
        <Lobby
          onGameStart={(config, player) => {
            setGameConfig(config);
            setPlayerData(player);
            setScreen('rolereveal');
          }}
        />
      )}
      {screen === 'rolereveal' && (
        <RoleReveal playerData={playerData} onReady={() => setScreen('game')} />
      )}
      {screen === 'game' && (
        <Game
          gameConfig={gameConfig}
          playerData={playerData}
          onGameOver={(stats) => {
            setFinalStats(stats);
            setScreen('gameover');
          }}
        />
      )}
      {screen === 'gameover' && (
        <GameOver
          stats={finalStats}
          playerData={playerData}
          gameConfig={gameConfig}
          onRestart={() => {
            setGameConfig(null);
            setPlayerData(null);
            setFinalStats(null);
            setScreen('lobby');
          }}
        />
      )}
    </div>
  );
}
