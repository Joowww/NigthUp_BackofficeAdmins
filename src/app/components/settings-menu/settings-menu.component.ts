import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-settings-menu',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './settings-menu.component.html',
  styleUrls: ['./settings-menu.component.css']
})
export class SettingsMenuComponent {
  @Output() changeEmail = new EventEmitter<void>();
  @Output() changePassword = new EventEmitter<void>();
  @Output() companyPolicy = new EventEmitter<void>();
  isMenuOpen = false;
  currentUser: any;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    this.currentUser = this.authService.getCurrentUser();
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  logout(): void {
    this.authService.logout();
  }

  get userInitial(): string {
    return this.currentUser?.username?.charAt(0).toUpperCase() || 'U';
  }

  openChangeEmail(): void {
    this.changeEmail.emit();
    this.isMenuOpen = false;
  }

  openChangePassword(): void {
    this.changePassword.emit();
    this.isMenuOpen = false;
  }

  openCompanyPolicy(): void {
    this.companyPolicy.emit();
    this.isMenuOpen = false;
  }
}