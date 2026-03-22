import { formatCountdown } from '../lib/time';

export default function AuctionItemCard({ item, serverNow, currentUser, onBid }) {
  const { id, name, currentBid, highestBidder, status, endTime } = item;
  
  const isBreak = status === 'break';
  const isActive = status === 'active';
  const remainingMs = Math.max(0, endTime - serverNow);
  
  // Derived state
  const hasBidder = highestBidder !== null;
  const isWinning = hasBidder && highestBidder === currentUser;
  const isOutbid = hasBidder && highestBidder !== currentUser && currentUser !== null;
  const isCritical = isActive && remainingMs < 10000 && remainingMs > 0;
  const isEnded = isBreak || (isActive && remainingMs <= 0);

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">{name}</h3>
        {isActive && isWinning && <span className="badge badge-winning">Winning</span>}
        {isActive && isOutbid && <span className="badge badge-outbid">Outbid</span>}
      </div>

      <div className="card-bid">
        ${currentBid.toLocaleString()}
        <span> {hasBidder ? 'current bid' : 'starting bid'}</span>
      </div>

      {!isEnded ? (
        <>
          <div className={`timer ${isCritical ? 'critical' : ''}`}>
            ⏳ {formatCountdown(remainingMs)}
          </div>
          <button 
            className="btn"
            style={{ marginTop: '1rem' }}
            onClick={() => onBid(item)}
            disabled={isEnded}
          >
            Quick Bid +$10
          </button>
        </>
      ) : (
        <div className={`banner ${isWinning ? 'winner' : 'break'}`}>
          {isWinning ? '🏆 You Won This Item!' : 'Auction Ended - Restarting Soon'}
        </div>
      )}
    </div>
  );
}
