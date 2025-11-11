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
  token: string;
  refreshToken?: string;
}

export interface RefreshTokenResponse {
  message: string;
  token: string;
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

  refreshToken(refreshToken: string, userId: string): Observable<RefreshTokenResponse> {
    return this.http.post<RefreshTokenResponse>(`${this.apiUrl}/auth/refresh`, {
      refreshToken,
      userId
    });
  }

  verifyToken(): Observable<any> {
    return this.http.get(`${this.apiUrl}/auth/verify`);
  }

  setCurrentUser(user: User): void {
    this.currentUser = user;
    localStorage.setItem('currentUser', JSON.stringify(user));
  }

  getCurrentUser(): User | null {
    return this.currentUser;
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

  updateUser(id: string, user: Partial<User>): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/${id}`, user);
  }

  // Statistics
  getUserStats(): Observable<UserStats> {
    return this.http.get<UserStats>(`${this.apiUrl}/number-of-users`);
  }

  // Admin Operations
  disableUser(id: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/disable`, {});
  }

  reactivateUser(id: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/reactivate`, {});
  }

  deleteUser(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/hard/${id}`);
  }

  makeUserAdmin(id: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/make-admin`, {});
  }

  removeUserAdmin(id: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/remove-admin`, {});
  }

  makeUserManager(id: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/make-manager`, {});
  }

  removeUserManager(id: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/remove-manager`, {});
  }

  // User Profile
  getMyProfile(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/me`);
  }

  updateMyProfile(userData: Partial<User>): Observable<any> {
    return this.http.patch(`${this.apiUrl}/me`, userData);
  }

  // Admin User Creation
  createFirstAdmin(user: Partial<User>): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/first-admin`, user);
  }

  createAdminUser(user: Partial<User>): Observable<any> {
    return this.http.post(`${this.apiUrl}/admin/create`, user);
  }

  logout(): void {
    this.currentUser = null;
    localStorage.removeItem('currentUser');
  }

  // Add to UserService class
  changePassword(currentPassword: string, newPassword: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/change-password`, {
      currentPassword,
      newPassword
    });
  }

  changeEmail(newEmail: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/change-email`, {
      newEmail,
      password
    });
  }
}