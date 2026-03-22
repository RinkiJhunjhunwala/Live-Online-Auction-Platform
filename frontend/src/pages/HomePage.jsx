import { useState, useEffect } from 'react';
import { getItems } from '../lib/itemsApi';
import { getSocket } from '../lib/socket.js';
import { useServerNow } from '../hooks/useServerNow';
import AppShell from '../components/AppShell';
import AuctionItemCard from '../components/AuctionItemCard';

export default function HomePage() {
  const [items, setItems] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [connected, setConnected] = useState(false);
  const [toasts, setToasts] = useState([]);
  
  // Custom Modal State
  const [showModal, setShowModal] = useState(false);
  const [usernameInput, setUsernameInput] = useState('');

  const { serverNow, synced } = useServerNow();

  useEffect(() => {
    // 1. Ask for identity dynamically via customized modal instead of window.prompt
    let user = sessionStorage.getItem('auction_user');
    if (!user) {
      setShowModal(true);
    } else {
      setCurrentUser(user);
    }

    // 2. Fetch initial items state
    getItems().then(setItems).catch(err => console.error("Failed fetching items:", err));

    // 3. Set up global socket listeners
    const socket = getSocket();
    setConnected(socket.connected);

    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);
    
    const onStateUpdate = (updatedItems) => {
      setItems(updatedItems);
    };

    const onUpdateBid = (updatedItem) => {
      setItems(prevItems => prevItems.map(item => 
        item.id === updatedItem.id ? updatedItem : item
      ));
    };

    const onOutbid = ({ itemId, outbidUserId }) => {
      if (outbidUserId === sessionStorage.getItem('auction_user')) {
        addToast(`Watch out! You just got outbid!`, 'error');
      }
    };

    const onBidError = ({ itemId, error }) => {
      addToast(error, 'error');
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('STATE_UPDATE', onStateUpdate);
    socket.on('UPDATE_BID', onUpdateBid);
    socket.on('OUTBID', onOutbid);
    socket.on('BID_ERROR', onBidError);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('STATE_UPDATE', onStateUpdate);
      socket.off('UPDATE_BID', onUpdateBid);
      socket.off('OUTBID', onOutbid);
      socket.off('BID_ERROR', onBidError);
    };
  }, []);

  const handleSetUser = (e) => {
    e.preventDefault();
    let user = usernameInput.trim();
    if (!user) user = `Guest_${Math.floor(Math.random() * 10000)}`;
    sessionStorage.setItem('auction_user', user);
    setCurrentUser(user);
    setShowModal(false);
  };

  const addToast = (message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000); 
  };

  const handleBid = (item, increment) => {
    const socket = getSocket();
    const bidAmount = item.currentBid + increment;
    socket.emit('BID_PLACED', {
      itemId: item.id,
      bidAmount,
      userId: currentUser
    });
  };

  // Compute live stats
  const liveAuctions = items.filter(i => i.status === 'active').length;
  const closingSoon = items.filter(i => i.status === 'active' && Math.max(0, i.endTime - serverNow) < 15000).length;

  return (
    <AppShell connected={connected} currentUser={currentUser} serverNow={serverNow}>
      
      {/* Premium Identity Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h2>Welcome to Premium Auctions</h2>
            <p>Please enter your secure bidding alias to participate in live bidding right now.</p>
            <form onSubmit={handleSetUser}>
              <input 
                autoFocus
                className="input-field"
                type="text" 
                placeholder="e.g. CryptoKing99" 
                value={usernameInput} 
                onChange={e => setUsernameInput(e.target.value)}
              />
              <button className="btn" type="submit">Enter Live Auction</button>
            </form>
          </div>
        </div>
      )}

      {/* Global Status Bar */}
      <div className="stats-bar">
         <div className="stat-pill">🟢 Live Auctions: <strong>{liveAuctions}</strong></div>
         <div className="stat-pill">⏳ Ending Soon: <strong>{closingSoon}</strong></div>
      </div>

      {/* Auction Grid */}
      <div className="grid">
        {items.map(item => (
          <AuctionItemCard 
            key={item.id} 
            item={item} 
            serverNow={serverNow} 
            currentUser={currentUser}
            onBid={handleBid}
          />
        ))}
      </div>
      
      {/* Interactive Toasts Layer */}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast ${t.type}`}>
            {t.message}
          </div>
        ))}
      </div>
    </AppShell>
  );
}
