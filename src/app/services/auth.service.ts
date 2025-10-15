import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { UserService, User, LoginResponse } from './user.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private userService: UserService,
    private router: Router
  ) {
    // Check for stored user on init
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      this.currentUserSubject.next(JSON.parse(storedUser));
    }
  }

  login(username: string, password: string, isBackoffice: boolean = false): Observable<LoginResponse> {
    const loginObservable = isBackoffice 
      ? this.userService.loginBackoffice(username, password)
      : this.userService.login(username, password);

    return new Observable(observer => {
      loginObservable.subscribe({
        next: (response) => {
          if (response.user) {
            this.currentUserSubject.next(response.user);
            localStorage.setItem('currentUser', JSON.stringify(response.user));
            localStorage.setItem('isBackoffice', isBackoffice.toString());
          }
          observer.next(response);
          observer.complete();
        },
        error: (error) => {
          observer.error(error);
        }
      });
    });
  }

  logout(): void {
    this.currentUserSubject.next(null);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('isBackoffice');
    this.router.navigate(['/login']);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isAuthenticated(): boolean {
    return this.currentUserSubject.value !== null;
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
}