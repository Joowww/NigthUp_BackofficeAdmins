import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-users-database',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './users-database.component.html',
  styleUrls: ['./users-database.component.css']
})
export class UsersDatabaseComponent {
  searchTerm = '';

  mockUsers = [
    { id: 1, name: 'María García', email: 'maria@example.com', role: 'User', status: 'Active', joined: '15/03/2024' },
    { id: 2, name: 'Juan Pérez', email: 'juan@example.com', role: 'User', status: 'Active', joined: '10/03/2024' },
    { id: 3, name: 'Ana Martínez', email: 'ana@example.com', role: 'Organizer', status: 'Active', joined: '05/03/2024' },
    { id: 4, name: 'Carlos López', email: 'carlos@example.com', role: 'User', status: 'Inactive', joined: '01/03/2024' },
    { id: 5, name: 'Laura Sánchez', email: 'laura@example.com', role: 'User', status: 'Active', joined: '28/02/2024' },
  ];
}