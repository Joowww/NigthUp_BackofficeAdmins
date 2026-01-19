import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { IEvent } from '../models/event';

export interface EventsResponse {
  events: IEvent[];
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

  constructor(private http: HttpClient) { }

  // Public endpoints
  getAllEvents(skip: number = 0, limit: number = 10): Observable<EventsResponse> {
    const params = new HttpParams()
      .set('skip', skip.toString())
      .set('limit', limit.toString());

    return this.http.get<EventsResponse>(this.apiUrl, { params });
  }

  getEventById(id: string): Observable<IEvent> {
    return this.http.get<IEvent>(`${this.apiUrl}/${id}`);
  }

  // Admin endpoints
  createEvent(event: Partial<IEvent>): Observable<IEvent> {
    return this.http.post<IEvent>(this.apiUrl, event);
  }

  getAllEventsWithInactive(skip: number = 0, limit: number = 10): Observable<EventsResponse> {
    const params = new HttpParams()
      .set('skip', skip.toString())
      .set('limit', limit.toString());

    return this.http.get<EventsResponse>(`${this.apiUrl}/with-inactive`, { params });
  }

  disableEvent(id: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/disable`, {});
  }

  reactivateEvent(id: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/reactivate`, {});
  }

  deleteEvent(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/hard/${id}`);
  }

  updateEvent(id: string, event: Partial<IEvent>): Observable<IEvent> {
    return this.http.patch<IEvent>(`${this.apiUrl}/${id}`, event);
  }

  // Event statistics
  getEventStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/stats`);
  }

  // Métodos para manejar coordenadas
  createEventWithCoordinates(
    name: string,
    schedule: string,
    longitude: number,
    latitude: number,
    description: string,
    category: string,
    capacity: number = 100,
    price: number = 0,
    active: boolean = true
  ): Observable<IEvent> {
    const eventData: Partial<IEvent> = {
      name,
      schedule,
      location: {
        type: 'Point',
        coordinates: [longitude, latitude]
      },
      description,
      category,
      capacity,
      price,
      active
    };

    return this.createEvent(eventData);
  }

  // Método para validar coordenadas
  isValidCoordinate(latitude: number, longitude: number): boolean {
    return latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180;
  }

  // Método para formatear coordenadas para display
  formatCoordinates(location: any): string {
    if (!location || !location.coordinates) {
      return 'Location not available';
    }

    const [lng, lat] = location.coordinates;
    return `Lat: ${lat?.toFixed(4)}, Lng: ${lng?.toFixed(4)}`;
  }
}