export type WebSocketMessageType =
  | 'task:created'
  | 'task:updated'
  | 'task:deleted'
  | 'board:sync'
  | 'connection:status'
  | 'error';

export interface WebSocketMessage<T = unknown> {
  type: WebSocketMessageType;
  payload: T;
  timestamp: string;
}

export interface ConnectionStatus {
  connected: boolean;
  userId?: string;
  reconnectAttempt?: number;
}
