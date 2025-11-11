import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { UserInterest, UserInterestStats, UserInterestsResponse } from '../models/userInterest';

@Injectable({
  providedIn: 'root'
})
export class UserInterestService {
  private apiUrl = `${environment.apiUrl}/user-interest`;

  constructor(private http: HttpClient) {}

  createUserInterest(interest: Partial<UserInterest>): Observable<UserInterest> {
    return this.http.post<UserInterest>(this.apiUrl, interest);
  }

  getUserInterests(skip: number = 0, limit: number = 10, search?: string): Observable<UserInterestsResponse> {
    let params = new HttpParams()
      .set('skip', skip.toString())
      .set('limit', limit.toString());

    if (search) {
      params = params.set('search', search);
    }

    return this.http.get<UserInterestsResponse>(this.apiUrl, { params });
  }

  getUserInterestsWithInactive(skip: number = 0, limit: number = 10): Observable<UserInterestsResponse> {
    const params = new HttpParams()
      .set('skip', skip.toString())
      .set('limit', limit.toString());

    return this.http.get<UserInterestsResponse>(`${this.apiUrl}/all/inactive-included`, { params });
  }

  getUserInterestById(id: string): Observable<UserInterest> {
    return this.http.get<UserInterest>(`${this.apiUrl}/${id}`);
  }

  updateUserInterest(id: string, interest: Partial<UserInterest>): Observable<UserInterest> {
    return this.http.patch<UserInterest>(`${this.apiUrl}/${id}`, interest);
  }

  disableUserInterest(id: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/disable`, {});
  }

  reactivateUserInterest(id: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/reactivate`, {});
  }

  deleteUserInterest(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  getUserInterestStats(): Observable<UserInterestStats> {
    return this.http.get<UserInterestStats>(`${this.apiUrl}/stats`);
  }

  getUserInterestsByUser(userId: string): Observable<UserInterest[]> {
    return this.http.get<UserInterest[]>(`${this.apiUrl}/user/${userId}`);
  }
}