import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SettingsMenuComponent } from '../settings-menu/settings-menu.component';
import { ChangeEmailModalComponent } from '../change-email-modal/change-email-modal.component';
import { ChangePasswordModalComponent } from '../change-password-modal/change-password-modal.component';
import { CompanyPolicyModalComponent } from '../company-policy-modal/company-policy-modal.component';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    SettingsMenuComponent,
    ChangeEmailModalComponent,
    ChangePasswordModalComponent,
    CompanyPolicyModalComponent
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  isChangeEmailModalOpen = false;
  isChangePasswordModalOpen = false;
  isCompanyPolicyModalOpen = false;

  openChangeEmailModal(): void {
    this.isChangeEmailModalOpen = true;
  }

  openChangePasswordModal(): void {
    this.isChangePasswordModalOpen = true;
  }

  openCompanyPolicyModal(): void {
    this.isCompanyPolicyModalOpen = true;
  }

  closeChangeEmailModal(): void {
    this.isChangeEmailModalOpen = false;
  }

  closeChangePasswordModal(): void {
    this.isChangePasswordModalOpen = false;
  }

  closeCompanyPolicyModal(): void {
    this.isCompanyPolicyModalOpen = false;
  }
  recentActivities = [
    {
      action: 'New user registered',
      user: 'More (items)',
      time: '4 min ago',
      type: 'user'
    },
    {
      action: 'Event published',
      user: 'Our hosts',
      time: '1.5 min ago',
      type: 'event'
    },
    {
      action: 'User reported',
      user: 'Active (items)',
      time: '1 hour ago',
      type: 'alert'
    },
    {
      action: 'New venue added',
      user: '0.1 hours',
      time: '2 hours ago',
      type: 'location'
    }
  ];

  quickStats = [
    { label: 'New users (this week)', value: '127', percentage: 75 },
    { label: 'Event-published (this month)', value: '84', percentage: 50 },
    { label: 'Activity rate', value: '95%', percentage: 95 },
    { label: 'Average popularity', value: '88%', percentage: 88 }
  ];

  currentUser: any;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    console.log('Current user:', this.currentUser);
  }

  logout(): void {
    this.authService.logout();
  }
}