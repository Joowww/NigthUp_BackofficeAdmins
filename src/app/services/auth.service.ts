import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { UserService, LoginResponse } from './user.service';
import { IUser } from '../models/user';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<IUser | null>(null);
  private tokenSubject = new BehaviorSubject<string | null>(null);

  public currentUser$ = this.currentUserSubject.asObservable();
  public token$ = this.tokenSubject.asObservable();

  constructor(
    private userService: UserService,
    private router: Router,
    private http: HttpClient
  ) {
    // Check for stored user and token on init
    const storedUser = localStorage.getItem('currentUser');
    const storedToken = localStorage.getItem('token');

    if (storedUser && storedToken) {
      this.currentUserSubject.next(JSON.parse(storedUser));
      this.tokenSubject.next(storedToken);
    }
  }

  login(username: string, password: string): Observable<LoginResponse> {
    return this.userService.login(username, password).pipe(
      tap(response => {
        if (response.user && response.token) {
          this.currentUserSubject.next(response.user);
          this.tokenSubject.next(response.token);

          localStorage.setItem('currentUser', JSON.stringify(response.user));
          localStorage.setItem('token', response.token);

          if (response.refreshToken) {
            localStorage.setItem('refreshToken', response.refreshToken);
          }
        }
      })
    );
  }

  logout(): void {
    this.currentUserSubject.next(null);
    this.tokenSubject.next(null);

    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('isBackoffice');

    this.router.navigate(['/login']);
  }

  getCurrentUser(): IUser | null {
    return this.currentUserSubject.value;
  }

  getToken(): string | null {
    return this.tokenSubject.value;
  }

  isAuthenticated(): boolean {
    return this.currentUserSubject.value !== null && this.tokenSubject.value !== null;
  }

  isAdmin(): boolean {
    const user = this.currentUserSubject.value;
    return user ? user.role === 'admin' : false;
  }

  isManager(): boolean {
    const user = this.currentUserSubject.value;
    return user ? user.role === 'manager' : false;
  }

  hasRole(role: string): boolean {
    const user = this.currentUserSubject.value;
    return user ? user.role === role : false;
  }

  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${environment.apiUrl}/user/forgot-password`, { email });
  }

  // Refresh token method
  refreshToken(): Observable<any> {
    const refreshToken = localStorage.getItem('refreshToken');
    const userId = this.getCurrentUser()?._id;

    if (!refreshToken || !userId) {
      throw new Error('No refresh token available');
    }

    return this.userService.refreshToken(refreshToken, userId).pipe(
      tap(response => {
        if (response.token) {
          this.tokenSubject.next(response.token);
          localStorage.setItem('token', response.token);
        }
      })
    );
  }

  // Add to AuthService class
  changePassword(currentPassword: string, newPassword: string): Observable<any> {
    return this.userService.changePassword(currentPassword, newPassword);
  }

  changeEmail(newEmail: string, password: string): Observable<any> {
    return this.userService.changeEmail(newEmail, password);
  }

  // Update current user in local storage
  updateCurrentUser(user: IUser): void {
    this.currentUserSubject.next(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
  }
}