import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

// Interfaz para la ubicación GeoJSON
export interface Location {
  type: string;
  coordinates: [number, number];
}

export interface Event {
  _id?: string;
  name: string;
  schedule: string;
  location: Location;
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

  // Admin endpoints
  createEvent(event: Partial<Event>): Observable<Event> {
    return this.http.post<Event>(this.apiUrl, event);
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

  updateEvent(id: string, event: Partial<Event>): Observable<Event> {
    return this.http.patch<Event>(`${this.apiUrl}/${id}`, event);
  }

  // Event statistics
  getEventStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/stats`);
  }

  // Métodos para manejar coordenadas - CORREGIDO
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
  ): Observable<Event> {
    const eventData: Partial<Event> = {
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
      active,
      participants: [] // Añadido para cumplir con la interfaz
    };
    
    return this.createEvent(eventData);
  }

  // Método para validar coordenadas
  isValidCoordinate(latitude: number, longitude: number): boolean {
    return latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180;
  }

  // Método para formatear coordenadas para display
  formatCoordinates(location: Location): string {
    if (!location || !location.coordinates) {
      return 'Location not available';
    }
    
    const [lng, lat] = location.coordinates;
    return `Lat: ${lat?.toFixed(4)}, Lng: ${lng?.toFixed(4)}`;
  }
}