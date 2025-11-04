import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
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

export interface UserStats {
  total: number;
  active: number;
  inactive: number;
  newCount: number;
  lastUpdated: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/user`;
  private currentUser: User | null = null;

  constructor(private http: HttpClient) {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      this.currentUser = JSON.parse(savedUser);
    }
  }

  // Authentication
  login(username: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, { username, password });
  }

  setCurrentUser(user: User): void {
    this.currentUser = user;
    localStorage.setItem('currentUser', JSON.stringify(user));
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  // Crear headers con el rol del usuario
  private getAuthHeaders(): HttpHeaders {
    const role = this.currentUser?.role || 'user';
    return new HttpHeaders({
      'user-role': role
    });
  }

  // Users Management
  getAllUsers(skip: number = 0, limit: number = 5): Observable<UsersResponse> {
    const params = new HttpParams()
      .set('skip', skip.toString())
      .set('limit', limit.toString());
    
    return this.http.get<UsersResponse>(this.apiUrl, { params });
  }

  getAllUsersWithInactive(skip: number = 0, limit: number = 10): Observable<UsersResponse> {
    const params = new HttpParams()
      .set('skip', skip.toString())
      .set('limit', limit.toString());
    
    return this.http.get<UsersResponse>(`${this.apiUrl}/with-inactive`, { params });
  }

  getUserById(id: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  createUser(user: Partial<User>): Observable<User> {
    return this.http.post<User>(this.apiUrl, user);
  }

  // CORREGIDO: Agregar headers con el rol del usuario
  updateUser(id: string, user: Partial<User>): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.patch<any>(`${this.apiUrl}/${id}`, user, { headers });
  }

  // Statistics
  getUserStats(): Observable<UserStats> {
    return this.http.get<UserStats>(`${this.apiUrl}/number-of-users`);
  }

  // Admin Operations - CORREGIDOS: Agregar headers
  disableUser(id: string): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.patch(`${this.apiUrl}/${id}/disable`, {}, { headers });
  }

  reactivateUser(id: string): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.patch(`${this.apiUrl}/${id}/reactivate`, {}, { headers });
  }

  deleteUser(id: string): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.delete(`${this.apiUrl}/hard/${id}`, { headers });
  }

  makeUserAdmin(id: string): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.patch(`${this.apiUrl}/${id}/make-admin`, {}, { headers });
  }

  removeUserAdmin(id: string): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.patch(`${this.apiUrl}/${id}/remove-admin`, {}, { headers });
  }

  // ✅ CORREGIDO: Método para hacer manager - usar endpoint específico
  makeUserManager(id: string): Observable<any> {
    const headers = this.getAuthHeaders();
    const url = `${this.apiUrl}/${id}/make-manager`;
    
    console.log('=== MAKE MANAGER SERVICE DEBUG ===');
    console.log('URL:', url);
    console.log('Headers:', headers);
    console.log('Current user sending request:', this.currentUser);
    console.log('User role in header:', headers.get('user-role'));
    
    return this.http.patch(url, {}, { headers });
  }

  // ✅ CORREGIDO: Método para quitar manager (convertir a user) - usar endpoint específico
  removeUserManager(id: string): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.patch(`${this.apiUrl}/${id}/remove-manager`, {}, { headers });
  }

  // Admin User Creation
  createFirstAdmin(user: Partial<User>): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/first-admin`, user);
  }

  createAdminUser(user: Partial<User>): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post(`${this.apiUrl}/admin/create`, user, { headers });
  }

  logout(): void {
    this.currentUser = null;
    localStorage.removeItem('currentUser');
  }
}