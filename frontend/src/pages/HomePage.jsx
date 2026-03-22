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
  const { serverNow, synced } = useServerNow();

  useEffect(() => {
    // 1. Ask for identity and save to sessionStorage
    let user = sessionStorage.getItem('auction_user');
    if (!user) {
      user = window.prompt("Welcome to the auction! Please enter your bidding alias:");
      if (!user || user.trim() === '') {
        user = `Guest_${Math.floor(Math.random() * 10000)}`;
      }
      sessionStorage.setItem('auction_user', user);
    }
    setCurrentUser(user);

    // 2. Fetch initial items state
    getItems().then(setItems).catch(err => console.error("Failed fetching items:", err));

    // 3. Set up global socket listeners
    const socket = getSocket();
    
    // Check current connection status in case we already connected
    setConnected(socket.connected);

    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);
    
    // Updates the entire list (e.g. interval lifecycle hooks)
    const onStateUpdate = (updatedItems) => {
      setItems(updatedItems);
    };

    // Partial update applied to a specific item
    const onUpdateBid = (updatedItem) => {
      setItems(prevItems => prevItems.map(item => 
        item.id === updatedItem.id ? updatedItem : item
      ));
    };

    // Notice specifically that this user was outbid
    const onOutbid = ({ itemId, outbidUserId }) => {
      if (outbidUserId === user) {
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

  const addToast = (message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000); // clear toast after 4s
  };

  const handleBid = (item) => {
    const socket = getSocket();
    const bidAmount = item.currentBid + 10;
    socket.emit('BID_PLACED', {
      itemId: item.id,
      bidAmount,
      userId: currentUser
    });
  };

  return (
    <AppShell connected={connected}>
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
      
      {/* Dynamic Toasts Notification Layer */}
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
