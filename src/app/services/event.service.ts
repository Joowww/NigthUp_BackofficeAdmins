import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

export interface Event {
  _id?: string;
  name: string;
  schedule: string;
  location: string;
  description: string;
  category: string;
  capacity: number;
  price: number;
  participants: any[];
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface EventsResponse {
  events: Event[];
  pagination: {
    skip: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private apiUrl = `${environment.apiUrl}/event`;
  private currentUser: any = null;

  constructor(private http: HttpClient) {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      this.currentUser = JSON.parse(savedUser);
    }
  }

  // ✅ CORREGIDO: Agregar headers de autenticación
  private getAuthHeaders(): HttpHeaders {
    const role = this.currentUser?.role || 'user';
    return new HttpHeaders({
      'user-role': role
    });
  }

  // Public endpoints
  getAllEvents(skip: number = 0, limit: number = 10): Observable<EventsResponse> {
    const params = new HttpParams()
      .set('skip', skip.toString())
      .set('limit', limit.toString());
    
    return this.http.get<EventsResponse>(this.apiUrl, { params });
  }

  getEventById(id: string): Observable<Event> {
    return this.http.get<Event>(`${this.apiUrl}/${id}`);
  }

  // ✅ CORREGIDO: Agregar headers para crear evento (solo admin)
  createEvent(event: Partial<Event>): Observable<Event> {
    const headers = this.getAuthHeaders();
    return this.http.post<Event>(this.apiUrl, event, { headers });
  }

  // Admin endpoints
  getAllEventsWithInactive(skip: number = 0, limit: number = 10): Observable<EventsResponse> {
    const params = new HttpParams()
      .set('skip', skip.toString())
      .set('limit', limit.toString());
    
    return this.http.get<EventsResponse>(`${this.apiUrl}/with-inactive`, { params });
  }

  disableEvent(id: string): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.patch(`${this.apiUrl}/${id}/disable`, {}, { headers });
  }

  reactivateEvent(id: string): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.patch(`${this.apiUrl}/${id}/reactivate`, {}, { headers });
  }

  deleteEvent(id: string): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.delete(`${this.apiUrl}/hard/${id}`, { headers });
  }

  // ✅ CORREGIDO: Agregar headers para actualizar evento (admin o manager)
  updateEvent(id: string, event: Partial<Event>): Observable<Event> {
    const headers = this.getAuthHeaders();
    return this.http.patch<Event>(`${this.apiUrl}/${id}`, event, { headers });
  }
}