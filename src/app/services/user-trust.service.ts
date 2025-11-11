import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../environments/environment';
import { UserTrust, UserTrustStats, UserTrustSummary, UserTrustResponse } from '../models/userTrust';

@Injectable({
  providedIn: 'root'
})
export class UserTrustService {
  getGlobalAverageTrust(): Observable<number> {
    return this.http.get<{ averageTrust: number }>(`${this.apiUrl}/average`).pipe(
      map(res => res.averageTrust ?? 0)
    );
  }
  private apiUrl = `${environment.apiUrl}/user-trust`;

  constructor(private http: HttpClient) {}

  createTrustRating(rating: Partial<UserTrust>): Observable<UserTrust> {
    return this.http.post<UserTrust>(this.apiUrl, rating);
  }

  getTrustRatings(skip: number = 0, limit: number = 10, search?: string): Observable<UserTrustResponse> {
    let params = new HttpParams()
      .set('skip', skip.toString())
      .set('limit', limit.toString());

    if (search) {
      params = params.set('search', search);
    }

    return this.http.get<UserTrustResponse>(this.apiUrl, { params });
  }

  getTrustRatingById(id: string): Observable<UserTrust> {
    return this.http.get<UserTrust>(`${this.apiUrl}/${id}`);
  }

  updateTrustRating(id: string, rating: Partial<UserTrust>): Observable<UserTrust> {
    return this.http.patch<UserTrust>(`${this.apiUrl}/${id}`, rating);
  }

  deleteTrustRating(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  getUserTrustStats(userId: string): Observable<UserTrustStats> {
    return this.http.get<UserTrustStats>(`${this.apiUrl}/user/stats/${userId}`);
  }

  getTrustRatingsByUser(userId: string): Observable<UserTrust[]> {
    return this.http.get<UserTrust[]>(`${this.apiUrl}/user/ratings/${userId}`);
  }

  getTrustRatingsFromUser(userId: string): Observable<UserTrust[]> {
    return this.http.get<UserTrust[]>(`${this.apiUrl}/user/from/${userId}`);
  }

  getUserTrustSummary(userId: string): Observable<UserTrustSummary> {
    return this.http.get<UserTrustSummary>(`${this.apiUrl}/user/summary/${userId}`);
  }

  getAllUsersTrustSummary(): Observable<UserTrustSummary[]> {
    return this.http.get<UserTrustSummary[]>(`${this.apiUrl}/admin/all-summaries`);
  }
}