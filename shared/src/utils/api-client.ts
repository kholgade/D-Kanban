import type { ApiResponse } from '../types/api.types.js';

export class ApiClient {
  private baseUrl: string;
  private token?: string;

  constructor(baseUrl: string = 'http://localhost:3000/api/v1') {
    this.baseUrl = baseUrl;
  }

  setToken(token: string) {
    this.token = token;
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    return headers;
  }

  async get<T>(path: string): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    const data = (await response.json()) as ApiResponse<T>;
    if (!data.success) throw new Error(data.error || 'Request failed');
    return data.data as T;
  }

  async post<T>(path: string, body: unknown): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(body),
    });
    const data = (await response.json()) as ApiResponse<T>;
    if (!data.success) throw new Error(data.error || 'Request failed');
    return data.data as T;
  }

  async put<T>(path: string, body: unknown): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(body),
    });
    const data = (await response.json()) as ApiResponse<T>;
    if (!data.success) throw new Error(data.error || 'Request failed');
    return data.data as T;
  }

  async delete<T>(path: string): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    const data = (await response.json()) as ApiResponse<T>;
    if (!data.success) throw new Error(data.error || 'Request failed');
    return data.data as T;
  }
}
