import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { Rating, RatingStats, RatingsResponse } from '../models/rating';

@Injectable({
  providedIn: 'root'
})
export class RatingService {
  private apiUrl = `${environment.apiUrl}/rating`;

  constructor(private http: HttpClient) {
    console.log('RatingService inicializado - URL:', this.apiUrl);
  }

  createRating(rating: Partial<Rating>): Observable<Rating> {
    console.log('Creando nueva valoración:', rating);
    return this.http.post<Rating>(this.apiUrl, rating);
  }

  getRatings(skip: number = 0, limit: number = 10, search?: string): Observable<RatingsResponse> {
    console.log(`📍 Obteniendo valoraciones - skip: ${skip}, limit: ${limit}, search: ${search}`);

    let params = new HttpParams()
      .set('skip', skip.toString())
      .set('limit', limit.toString());

    if (search) {
      params = params.set('search', search);
    }

    return this.http.get<RatingsResponse>(this.apiUrl, { params });
  }

  getRatingById(id: string): Observable<Rating> {
    console.log(`Obteniendo valoración por ID: ${id}`);
    return this.http.get<Rating>(`${this.apiUrl}/${id}`);
  }

  updateRating(id: string, rating: Partial<Rating>): Observable<Rating> {
    console.log(`Actualizando valoración ${id}`, rating);
    return this.http.patch<Rating>(`${this.apiUrl}/${id}`, rating);
  }

  deleteRating(id: string): Observable<any> {
    console.log(`Eliminando valoración: ${id}`);
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  getEventRatingStats(eventId: string): Observable<RatingStats> {
    console.log(`Obteniendo estadísticas para evento: ${eventId}`);
    return this.http.get<RatingStats>(`${this.apiUrl}/event/${eventId}/stats`);
  }

  getRatingsByEvent(eventId: string): Observable<Rating[]> {
    console.log(`Obteniendo valoraciones para evento: ${eventId}`);
    return this.http.get<Rating[]>(`${this.apiUrl}/event/${eventId}`);
  }

  getRatingsByUser(username: string): Observable<Rating[]> {
    console.log(`Obteniendo valoraciones para usuario: ${username}`);
    return this.http.get<Rating[]>(`${this.apiUrl}/user/${username}`);
  }

  getUserEventRating(username: string, eventId: string): Observable<Rating> {
    console.log(`Obteniendo valoración usuario ${username} - evento ${eventId}`);
    return this.http.get<Rating>(`${this.apiUrl}/user/${username}/event/${eventId}`);
  }
}