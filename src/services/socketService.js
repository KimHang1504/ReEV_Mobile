// src/services/socketService.js
// Note: Cần cài đặt socket.io-client: npm install socket.io-client
import { io } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SOCKET_URL = process.env.EXPO_PUBLIC_SOCKET_URL || process.env.EXPO_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:3001';

class SocketService {
  constructor() {
    this.socket = null;
    this.userId = null;
  }

  async connect(userId) {
    if (this.socket?.connected) {
      return this.socket;
    }

    this.userId = userId;
    const token = await AsyncStorage.getItem('token');

    this.socket = io(`${SOCKET_URL}/auctions`, {
      path: '/socket.io/',
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10000,
      auth: {
        userId,
        token,
      },
      query: {
        userId,
      },
    });

    this.socket.on('connect', () => {
      console.log('[Socket] Connected:', this.socket.id);
    });

    this.socket.on('disconnect', () => {
      console.log('[Socket] Disconnected');
    });

    this.socket.on('connect_error', (error) => {
      console.error('[Socket] Connection error:', error);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinAuction(auctionId) {
    if (!this.socket?.connected) {
      throw new Error('Socket not connected');
    }
    this.socket.emit('auction:join', { auctionId });
  }

  leaveAuction(auctionId) {
    if (!this.socket?.connected) {
      return;
    }
    this.socket.emit('auction:leave', { auctionId });
  }

  placeBid(auctionId, amount, clientBidId) {
    if (!this.socket?.connected) {
      throw new Error('Socket not connected');
    }
    this.socket.emit('auction:place_bid', {
      auctionId,
      amount,
      clientBidId,
      bidderId: this.userId,
    });
  }

  onAuctionState(callback) {
    if (!this.socket) return;
    this.socket.on('auction:state', callback);
  }

  onPriceUpdate(callback) {
    if (!this.socket) return;
    this.socket.on('auction:price_update', callback);
  }

  onAuctionExtended(callback) {
    if (!this.socket) return;
    this.socket.on('auction:extended', callback);
  }

  onError(callback) {
    if (!this.socket) return;
    this.socket.on('auction:error', callback);
  }

  off(event, callback) {
    if (!this.socket) return;
    this.socket.off(event, callback);
  }

  removeAllListeners() {
    if (!this.socket) return;
    this.socket.removeAllListeners();
  }

  isConnected() {
    return this.socket?.connected || false;
  }
}

export const socketService = new SocketService();

