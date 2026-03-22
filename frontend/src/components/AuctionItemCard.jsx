import { formatCountdown } from '../lib/time';

export default function AuctionItemCard({ item, serverNow, currentUser, onBid }) {
  const { id, name, currentBid, highestBidder, status, endTime, breakStartTime } = item;
  
  const isBreak = status === 'break';
  const isActive = status === 'active';
  const remainingMs = Math.max(0, endTime - serverNow);
  
  // Since server defines break as 10s, we dynamically calculate based on the break start time
  const breakMsRemaining = isBreak ? Math.max(0, breakStartTime + 10000 - serverNow) : 0;
  
  // Derived state
  const hasBidder = highestBidder !== null;
  const isWinning = hasBidder && highestBidder === currentUser;
  const isOutbid = hasBidder && highestBidder !== currentUser && currentUser !== null;
  
  // Animations and critical states
  const isCritical = isActive && remainingMs < 10000 && remainingMs > 0;
  const isEnded = isBreak || (isActive && remainingMs <= 0);

  return (
    <div className={`card ${isWinning && !isEnded ? 'card-winning-glow' : ''}`}>
      <div className="card-header">
        <h3 className="card-title">{name}</h3>
        {isActive && isWinning && <span className="badge badge-winning">Winning</span>}
        {isActive && isOutbid && <span className="badge badge-outbid">Outbid</span>}
      </div>

      <div className="card-bid">
        <span className="currency">$</span>{currentBid.toLocaleString()}
        <span className="bid-label"> {hasBidder ? 'Current Bid' : 'Starting Price'}</span>
      </div>

      {!isEnded ? (
        <>
          <div className={`timer ${isCritical ? 'critical' : ''}`}>
            ⏳ {formatCountdown(remainingMs)} left
          </div>
          
          <div className="bid-controls">
            <button 
              className="btn btn-quick"
              onClick={() => onBid(item, 50)}
              disabled={isEnded || !currentUser}
            >
              +$50
            </button>
            <button 
              className="btn btn-quick"
              onClick={() => onBid(item, 100)}
              disabled={isEnded || !currentUser}
            >
              +$100
            </button>
            <button 
              className="btn btn-quick primary"
              onClick={() => onBid(item, 250)}
              disabled={isEnded || !currentUser}
            >
              +$250
            </button>
          </div>
        </>
      ) : (
        <div className={`banner ${isWinning ? 'winner' : 'break'}`}>
          <div className="banner-status">
            {isWinning ? '🏆 You Won This Item!' : hasBidder ? '❌ You Were Outbid' : '⏰ No Bids Placed'}
          </div>
          <div className="banner-restart">
             Restarting in {formatCountdown(breakMsRemaining)}
          </div>
        </div>
      )}
    </div>
  );
}
