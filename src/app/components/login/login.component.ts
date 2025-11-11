import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})

export class LoginComponent {
  username = '';
  password = '';
  loading = false;
  errorMessage = '';

  // Para el HTML
  showPassword = false;
  rememberMe = false;
  loginError = '';
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  // Forgot Password
  showForgotPassword = false;
  resetEmail = '';
  resetSent = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Cargar credenciales recordadas
    const remembered = localStorage.getItem('rememberMe');
    if (remembered === 'true') {
      this.rememberMe = true;
      const savedUsername = localStorage.getItem('savedUsername');
      if (savedUsername) {
        this.username = savedUsername;
      }
    }
  }

  onSubmit(): void {
    if (!this.username || !this.password) {
      this.errorMessage = 'Please enter both username and password';
      this.loginError = this.errorMessage;
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.loginError = '';

    this.authService.login(this.username, this.password).subscribe({
      next: (response) => {
        this.loading = false;
        // Guardar remember me
        if (this.rememberMe) {
          localStorage.setItem('rememberMe', 'true');
          localStorage.setItem('savedUsername', this.username);
        } else {
          localStorage.removeItem('rememberMe');
          localStorage.removeItem('savedUsername');
        }
        console.log('Login successful:', response);
        // Guardar usuario y token en localStorage
        if (response.user && response.token) {
          localStorage.setItem('currentUser', JSON.stringify(response.user));
          localStorage.setItem('token', response.token);
          this.authService['currentUserSubject'].next(response.user);
          this.authService['tokenSubject'].next(response.token);
        }
        if (response.refreshToken) {
          localStorage.setItem('refreshToken', response.refreshToken);
        }
        localStorage.setItem('isBackoffice', 'true');
        this.router.navigate(['/home']);
      },
      error: (error) => {
        this.loading = false;
        console.error('Login error:', error);
        if (error.status === 401) {
          this.errorMessage = 'Invalid username or password';
        } else if (error.error?.error) {
          this.errorMessage = error.error.error;
        } else {
          this.errorMessage = 'Login failed. Please try again.';
        }
        this.loginError = this.errorMessage;
      }
    });
  }

  onForgotPassword(): void {
    if (this.resetEmail) {
        this.loading = true;
        this.authService.forgotPassword(this.resetEmail).subscribe({
            next: (response) => {
                this.resetSent = true;
                this.loading = false;
                setTimeout(() => {
                    this.resetSent = false;
                    this.showForgotPassword = false;
                    this.resetEmail = "";
                }, 3000);
            },
            error: (error) => {
                this.loading = false;
                this.errorMessage = 'Error sending reset link. Please try again.';
                this.loginError = this.errorMessage;
            }
        });
    }
  }

  showLoginForm(): void {
    this.showForgotPassword = false;
    this.resetEmail = '';
    this.resetSent = false;
  }
}