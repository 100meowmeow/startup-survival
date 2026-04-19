import { useState, useEffect, useRef, Component } from 'react';
import Lobby from './Lobby';
import RoleReveal from './RoleReveal';
import Game from './Game';
import GameOver from './GameOver';
import { db } from './firebase';
import { ref, onValue } from 'firebase/database';

// ─── Loading tips shown between screen transitions ─────────────────
const LOADING_TIPS = [
  "💡 90% of startups fail. Yours is already in the top 10% for trying.",
  "💡 Burn rate is how fast you spend money. Know yours at all times.",
  "💡 Product-market fit means users come back without being asked.",
  "💡 CAC > LTV means you lose money on every customer. Fix it fast.",
  "💡 Morale is contagious. One bad hire can tank a whole team.",
  "💡 The best pitch is a customer who did it for you.",
  "💡 A saboteur is most dangerous when nobody suspects them.",
  "💡 Stack your actions. Combos unlock exponential advantages.",
  "💡 Runway = cash / burn rate. Always know how many days you have.",
  "💡 The market doesn't care about your vision. It cares about value.",
  "💡 Pivoting too often is as deadly as not pivoting at all.",
  "💡 Your first 100 users are more valuable than your next 10,000.",
  "💡 Investors bet on teams, not ideas. Who's on yours?",
  "💡 Speed is a strategy. Ship fast, learn faster.",
  "💡 Revenue is a fact. Everything else is an opinion.",
  "💡 The paranoid player sees what others miss. Watch the numbers.",
  "💡 Culture eats strategy for breakfast. Keep morale up.",
  "💡 Cash in the bank is not profit. Don't confuse them.",
  "💡 A great market beats a great product every time.",
  "💡 The saboteur's best weapon is plausible deniability.",
];

function randomTip() {
  return LOADING_TIPS[Math.floor(Math.random() * LOADING_TIPS.length)];
}

// ─── Global error boundary ────────────────────────────────────────
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh', background: '#0a0a0a', color: '#fff',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', padding: '2rem', textAlign: 'center',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>💀</div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#ff4444', marginBottom: 8 }}>
            Something went wrong
          </h1>
          <p style={{ color: '#555', fontSize: 13, marginBottom: 24, maxWidth: 340, lineHeight: 1.6 }}>
            The app crashed unexpectedly. This is embarrassing. Try refreshing — your room code should still work.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '12px 24px', background: '#ff4444', color: '#fff',
              border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700,
              cursor: 'pointer', marginBottom: 12,
            }}
          >
            Reload Game
          </button>
          <p style={{ color: '#333', fontSize: 10, fontFamily: 'monospace' }}>
            {this.state.error?.message || 'Unknown error'}
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}

// ─── Reconnection overlay ─────────────────────────────────────────
function ReconnectOverlay() {
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', zIndex: 9999, textAlign: 'center', padding: '2rem',
    }}>
      <div style={{ fontSize: 40, marginBottom: 16 }}>📡</div>
      <h2 style={{ fontSize: 18, fontWeight: 700, color: '#ff4444', marginBottom: 8 }}>
        Connection Lost
      </h2>
      <p style={{ color: '#555', fontSize: 13, marginBottom: 24, lineHeight: 1.6 }}>
        Trying to reconnect... your game is paused.
      </p>
      <div style={{
        width: 40, height: 4, background: '#333', borderRadius: 2, overflow: 'hidden',
      }}>
        <div style={{
          width: '60%', height: '100%', background: '#ff4444', borderRadius: 2,
          animation: 'pulse 1.2s ease-in-out infinite',
        }} />
      </div>
      <style>{`@keyframes pulse { 0%,100%{opacity:0.3} 50%{opacity:1} }`}</style>
    </div>
  );
}

// ─── Exit confirmation modal ──────────────────────────────────────
function ExitConfirmModal({ onConfirm, onCancel }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 9998, padding: '1.5rem',
    }}>
      <div style={{
        background: '#111', border: '1px solid #333', borderRadius: 14,
        padding: '1.5rem', width: '100%', maxWidth: 340, textAlign: 'center',
      }}>
        <div style={{ fontSize: 36, marginBottom: 12 }}>⚠️</div>
        <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 8 }}>Leave the game?</h2>
        <p style={{ color: '#555', fontSize: 13, lineHeight: 1.6, marginBottom: 20 }}>
          Your progress will be lost. In multiplayer, your team will be notified you left.
        </p>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={onCancel} style={{
            flex: 1, padding: '11px', background: '#1a1a1a', color: '#aaa',
            border: '0.5px solid #333', borderRadius: 8, fontSize: 13,
            cursor: 'pointer', fontWeight: 500,
          }}>
            Stay
          </button>
          <button onClick={onConfirm} style={{
            flex: 1, padding: '11px', background: '#ff4444', color: '#fff',
            border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700,
            cursor: 'pointer',
          }}>
            Leave
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Loading screen with tip ──────────────────────────────────────
function LoadingScreen({ tip }) {
  return (
    <div style={{
      minHeight: '100vh', background: '#0a0a0a', color: '#fff',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', padding: '2rem', textAlign: 'center',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    }}>
      <div style={{ fontSize: 40, marginBottom: 16 }}>💀</div>
      <div style={{
        width: 40, height: 3, background: '#222', borderRadius: 2,
        overflow: 'hidden', marginBottom: 24,
      }}>
        <div style={{
          width: '70%', height: '100%', background: '#ff4444', borderRadius: 2,
          animation: 'slide 1s ease-in-out infinite alternate',
        }} />
      </div>
      {tip && (
        <p style={{
          color: '#444', fontSize: 12, maxWidth: 300, lineHeight: 1.7,
          fontStyle: 'italic',
        }}>
          {tip}
        </p>
      )}
      <style>{`@keyframes slide { from{transform:translateX(-100%)} to{transform:translateX(100%)} }`}</style>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen]         = useState('lobby');
  const [gameConfig, setGameConfig] = useState(null);
  const [playerData, setPlayerData] = useState(null);
  const [finalStats, setFinalStats] = useState(null);
  const [isConnected, setIsConnected] = useState(true);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [loading, setLoading]       = useState(false);
  const [loadingTip, setLoadingTip] = useState('');

  // Track connection state via Firebase .info/connected
  useEffect(() => {
    const connRef = ref(db, '.info/connected');
    const unsub = onValue(connRef, snap => {
      setIsConnected(snap.val() === true);
    });
    return () => unsub();
  }, []);

  // Exit confirmation on browser back / tab close during game
  useEffect(() => {
    if (screen !== 'game') return;
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [screen]);

  // Android back button interception during game
  useEffect(() => {
    if (screen !== 'game') return;
    const handlePopState = (e) => {
      e.preventDefault();
      window.history.pushState(null, '', window.location.href);
      setShowExitConfirm(true);
    };
    window.history.pushState(null, '', window.location.href);
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [screen]);

  function transitionTo(nextScreen) {
    setLoadingTip(randomTip());
    setLoading(true);
    setTimeout(() => {
      setScreen(nextScreen);
      setLoading(false);
    }, 800);
  }

  function handleGameStart(config, player) {
    setGameConfig(config);
    setPlayerData(player);
    transitionTo('rolereveal');
  }

  // FIX: onReady now accepts updatedPlayer from RoleReveal so rerolls work
  function handleReady(updatedPlayer) {
    if (updatedPlayer) setPlayerData(updatedPlayer);
    transitionTo('game');
  }

  function handleGameOver(stats) {
    setFinalStats(stats);
    transitionTo('gameover');
  }

  function handleRestart() {
    setGameConfig(null);
    setPlayerData(null);
    setFinalStats(null);
    transitionTo('lobby');
  }

  function handleConfirmExit() {
    setShowExitConfirm(false);
    setGameConfig(null);
    setPlayerData(null);
    setFinalStats(null);
    setScreen('lobby');
  }

  if (loading) return <LoadingScreen tip={loadingTip} />;

  return (
    <ErrorBoundary>
      <div style={{
        minHeight: '100vh',
        background: '#0a0a0a',
        color: '#fff',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        // Prevent horizontal scroll on mobile
        overflowX: 'hidden',
        // Safe area for notched phones
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}>

        {/* Reconnection overlay — only during active game */}
        {!isConnected && screen === 'game' && <ReconnectOverlay />}

        {/* Exit confirmation modal */}
        {showExitConfirm && (
          <ExitConfirmModal
            onConfirm={handleConfirmExit}
            onCancel={() => setShowExitConfirm(false)}
          />
        )}

        {screen === 'lobby' && (
          <Lobby onGameStart={handleGameStart} />
        )}

        {screen === 'rolereveal' && (
          <RoleReveal
            playerData={playerData}
            gameConfig={gameConfig}
            onReady={handleReady}
          />
        )}

        {screen === 'game' && (
          <Game
            gameConfig={gameConfig}
            playerData={playerData}
            onGameOver={handleGameOver}
            onExitRequest={() => setShowExitConfirm(true)}
          />
        )}

        {screen === 'gameover' && (
          <GameOver
            stats={finalStats}
            playerData={playerData}
            gameConfig={gameConfig}
            onRestart={handleRestart}
          />
        )}
      </div>
    </ErrorBoundary>
  );
}