export default function AppShell({ children, connected }) {
  return (
    <div className="shell">
      <header className="top-bar">
        <h1 className="title" style={{ margin: 0 }}>Premium Live Auctions</h1>
        <div className="status-indicator">
          <div className={`status-dot ${connected ? 'online' : 'offline'}`} />
          <span>{connected ? 'Live Connected' : 'Connecting...'}</span>
        </div>
      </header>
      <main>
        {children}
      </main>
    </div>
  );
}
