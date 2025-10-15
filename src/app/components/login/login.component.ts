import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

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

  constructor(private router: Router) {}

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    // Redirigir directamente al home sin verificar credenciales
    this.router.navigate(['/home']);
  }

  onForgotPassword(): void {
    // Simular envío de correo
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