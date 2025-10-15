import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SettingsMenuComponent } from '../settings-menu/settings-menu.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, SettingsMenuComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
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
    { label: 'Event-published (this month)', value: '84', percentage: 60 },
    { label: 'Activity rate', value: '95%', percentage: 95 },
    { label: 'Average popularity', value: '88%', percentage: 88 }
  ];
}