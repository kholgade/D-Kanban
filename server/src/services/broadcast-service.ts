import { createLogger } from '../lib/logger.js';
import type { WebSocketMessage } from '@d-kanban/shared';
import type { WebSocket } from 'ws';

const log = createLogger('broadcast-service');

class BroadcastService {
  private subscribers: Set<WebSocket> = new Set();

  subscribe(ws: WebSocket): void {
    this.subscribers.add(ws);
    log.info({ clientCount: this.subscribers.size }, 'Client subscribed');
  }

  unsubscribe(ws: WebSocket): void {
    this.subscribers.delete(ws);
    log.info({ clientCount: this.subscribers.size }, 'Client unsubscribed');
  }

  broadcast<T>(message: WebSocketMessage<T>): void {
    const data = JSON.stringify(message);
    const failedClients: WebSocket[] = [];

    this.subscribers.forEach((ws) => {
      if (ws.readyState === 1) { // WebSocket.OPEN
        ws.send(data, (err) => {
          if (err) {
            log.warn('Failed to send message to client');
            failedClients.push(ws);
          }
        });
      }
    });

    // Clean up failed connections
    failedClients.forEach((ws) => this.unsubscribe(ws));
  }

  getConnectionCount(): number {
    return this.subscribers.size;
  }

  clear(): void {
    this.subscribers.forEach((ws) => {
      ws.close();
    });
    this.subscribers.clear();
  }
}

export const broadcastService = new BroadcastService();
