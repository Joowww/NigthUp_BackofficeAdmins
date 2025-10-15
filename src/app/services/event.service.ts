import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

export interface Event {
  _id?: string;
  name: string;
  schedule: string;
  address?: string;
  participants: any[];
  active: boolean;
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

  constructor(private http: HttpClient) {}

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

  createEvent(event: Partial<Event>): Observable<Event> {
    return this.http.post<Event>(this.apiUrl, event);
  }

  // Admin endpoints
  getAllEventsWithInactive(skip: number = 0, limit: number = 10): Observable<EventsResponse> {
    const params = new HttpParams()
      .set('skip', skip.toString())
      .set('limit', limit.toString());
    
    return this.http.get<EventsResponse>(`${this.apiUrl}/all/inactive-included`, { params });
  }

  disableEvent(id: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, {});
  }

  reactivateEvent(id: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/reactivate`, {});
  }

  deleteEvent(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/hard/${id}`);
  }

  updateEvent(id: string, event: Partial<Event>): Observable<Event> {
    return this.http.put<Event>(`${this.apiUrl}/${id}`, event);
  }
}