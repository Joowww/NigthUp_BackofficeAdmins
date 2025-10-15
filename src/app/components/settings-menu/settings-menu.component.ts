import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ChangePasswordModalComponent } from '../change-password-modal/change-password-modal.component';
import { ChangeEmailModalComponent } from '../change-email-modal/change-email-modal.component';
import { CompanyPolicyModalComponent } from '../company-policy-modal/company-policy-modal.component';
import { LogoutModalComponent } from '../logout-modal/logout-modal.component';

@Component({
  selector: 'app-settings-menu',
  standalone: true,
  imports: [
    CommonModule, 
    ChangePasswordModalComponent,
    ChangeEmailModalComponent,
    CompanyPolicyModalComponent,
    LogoutModalComponent
  ],
  templateUrl: './settings-menu.component.html',
  styleUrls: ['./settings-menu.component.css']
})
export class SettingsMenuComponent {
  isOpen = false;
  showLanguageMenu = false;
  theme: 'light' | 'dark' = 'dark';
  language = 'en';

  showPasswordModal = false;
  showEmailModal = false;
  showPolicyModal = false;
  showLogoutModal = false;

  languages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
  ];

  constructor(private router: Router) {}

  get currentLanguage() {
    return this.languages.find(lang => lang.code === this.language) || this.languages[0];
  }

  toggleTheme() {
    this.theme = this.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.classList.toggle('dark');
  }

  selectLanguage(langCode: string) {
    this.language = langCode;
    this.showLanguageMenu = false;
  }

  logout() {
    this.router.navigate(['/login']);
  }
}