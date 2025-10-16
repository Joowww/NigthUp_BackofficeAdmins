import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service'; // Importa el servicio

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  username: string = '';
  password: string = '';
  showPassword: boolean = false;
  rememberMe: boolean = false;

  // Forgot Password
  showForgotPassword: boolean = false;
  resetEmail: string = '';
  resetSent: boolean = false;

  // Mensaje de error
  loginError: string = '';

  constructor(private router: Router, private userService: UserService) {} // Inyecta el servicio

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    this.loginError = '';
    this.userService.login(this.username, this.password).subscribe({
      next: (res) => {
        if (res.user && res.user.role === 'admin') {
          this.router.navigate(['/home']);
        } else {
          this.loginError = 'Acceso denegado: solo administradores pueden entrar.';
        }
      },
      error: () => {
        this.loginError = 'Credenciales incorrectas o error de conexión.';
      }
    });
  }

  onForgotPassword(): void {
    if (this.resetEmail) {
      this.resetSent = true;
      setTimeout(() => {
        this.resetSent = false;
        this.showForgotPassword = false;
        this.resetEmail = '';
      }, 3000);
    }
  }

  showLoginForm(): void {
    this.showForgotPassword = false;
    this.resetEmail = '';
    this.resetSent = false;
  }
}