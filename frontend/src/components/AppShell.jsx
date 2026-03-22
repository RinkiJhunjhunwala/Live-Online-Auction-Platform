import { useMemo } from 'react';

export default function AppShell({ children, connected, currentUser, serverNow }) {
  const timeString = useMemo(() => {
    if (!serverNow) return '--:--:--';
    return new Date(serverNow).toLocaleTimeString();
  }, [serverNow]);

  return (
    <div className="shell">
      <header className="top-bar">
        <div className="top-bar-left">
          <h1 className="title" style={{ margin: 0, fontSize: '1.5rem' }}>Premium Auctions</h1>
        </div>
        
        <div className="top-bar-center">
          <span className="server-time">🕒 Server Time: {timeString}</span>
        </div>

        <div className="top-bar-right">
          {currentUser && <span className="user-badge">👤 {currentUser}</span>}
          <div className="status-indicator">
            <div className={`status-dot ${connected ? 'online' : 'offline'}`} />
            <span>{connected ? 'Live' : 'Connecting...'}</span>
          </div>
        </div>
      </header>

      <main className="main-content">
        {children}
      </main>

      <footer className="footer">
        <p>&copy; {new Date().getFullYear()} Premium Live Auctions Platform. Bid responsibly and securely.</p>
      </footer>
    </div>
  );
}
