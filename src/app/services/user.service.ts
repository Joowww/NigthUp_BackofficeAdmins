import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

export interface User {
  _id?: string;
  username: string;
  email: string;
  password?: string;
  birthday: string;
  events: any[];
  active: boolean;
  role: 'admin' | 'manager' | 'user';
}

export interface UsersResponse {
  users: User[];
  pagination: {
    skip: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

export interface LoginResponse {
  message: string;
  user: User;
  isAdmin?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/user`;

  constructor(private http: HttpClient) {}

  // Authentication
  login(username: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, { username, password });
  }

  loginBackoffice(username: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login-backoffice`, { username, password });
  }

  // Users Management
  getAllUsers(skip: number = 0, limit: number = 10): Observable<UsersResponse> {
    const params = new HttpParams()
      .set('skip', skip.toString())
      .set('limit', limit.toString());
    
    return this.http.get<UsersResponse>(this.apiUrl, { params });
  }

  getAllUsersWithInactive(adminCredentials: { adminUsername: string, adminPassword: string }, skip: number = 0, limit: number = 10): Observable<UsersResponse> {
    const params = new HttpParams()
      .set('skip', skip.toString())
      .set('limit', limit.toString());
    
    // CORREGIDO: Usar POST en lugar de GET con body
    return this.http.post<UsersResponse>(`${this.apiUrl}/all/inactive-included`, adminCredentials, { params });
  }

  getUserById(id: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  createUser(user: Partial<User>): Observable<User> {
    return this.http.post<User>(this.apiUrl, user);
  }

  updateUser(id: string, user: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}`, user);
  }

  // Admin Operations
  disableUser(id: string, adminCredentials: { adminUsername: string, adminPassword: string }): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/disable`, adminCredentials);
  }

  reactivateUser(id: string, adminCredentials: { adminUsername: string, adminPassword: string }): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/reactivate`, adminCredentials);
  }

  deleteUser(id: string, adminCredentials: { adminUsername: string, adminPassword: string }): Observable<any> {
    return this.http.request('delete', `${this.apiUrl}/hard/${id}`, { body: adminCredentials });
  }

  makeUserAdmin(id: string, adminCredentials: { adminUsername: string, adminPassword: string }): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/make-admin`, adminCredentials);
  }

  removeUserAdmin(id: string, adminCredentials: { adminUsername: string, adminPassword: string }): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/remove-admin`, adminCredentials);
  }

  // Admin User Creation
  createFirstAdmin(user: Partial<User>): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/first-admin`, user);
  }

  createAdminUser(adminCredentials: { adminUsername: string, adminPassword: string }, user: Partial<User>): Observable<any> {
    const requestBody = {
      ...adminCredentials,
      ...user
    };
    return this.http.post(`${this.apiUrl}/admin/create`, requestBody);
  }
}