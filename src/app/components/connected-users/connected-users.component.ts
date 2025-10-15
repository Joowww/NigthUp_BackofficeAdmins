import { Component } from '@angular/core';

interface ConnectedUser {
  id: number;
  name: string;
  avatar: string;
  status: 'online' | 'idle';
  location: string;
  lastActivity: string;
  duration: string;
}

@Component({
  selector: 'app-connected-users',
  templateUrl: './connected-users.component.html',
  styleUrls: ['./connected-users.component.css']
})
export class ConnectedUsersComponent {
  viewMode: 'grid' | 'list' = 'grid';

  connectedUsers: ConnectedUser[] = [
    { id: 1, name: 'María García', avatar: 'M', status: 'online', location: 'Dashboard', lastActivity: 'Now', duration: '15 min' },
    { id: 2, name: 'Juan Pérez', avatar: 'J', status: 'online', location: 'Events', lastActivity: '1 min ago', duration: '32 min' },
    { id: 3, name: 'Ana Martínez', avatar: 'A', status: 'online', location: 'Venues', lastActivity: '2 min ago', duration: '8 min' },
    { id: 4, name: 'Carlos López', avatar: 'C', status: 'idle', location: 'Profile', lastActivity: '5 min ago', duration: '45 min' },
    { id: 5, name: 'Laura Sánchez', avatar: 'L', status: 'online', location: 'Events', lastActivity: 'Now', duration: '22 min' },
    { id: 6, name: 'Pedro Ruiz', avatar: 'P', status: 'online', location: 'Calendar', lastActivity: '1 min ago', duration: '12 min' },
  ];
}