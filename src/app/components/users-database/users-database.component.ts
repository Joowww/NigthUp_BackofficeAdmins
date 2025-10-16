import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService, UsersResponse, User } from '../../services/user.service';

@Component({
  selector: 'app-users-database',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './users-database.component.html',
  styleUrls: ['./users-database.component.css']
})
export class UsersDatabaseComponent {
  searchTerm = '';
  users: User[] = [];
  pagination = { skip: 0, limit: 5, total: 0, hasMore: false };
  loading = false;
  adminCredentials = { adminUsername: 'admin', adminPassword: 'adminpass' }; // Cambia esto por los datos reales

  constructor(private userService: UserService) {
    this.loadUsers();
  }

  loadUsers(skip: number = 0): void {
    this.loading = true;
    this.userService.getAllUsers (skip, this.pagination.limit)
      .subscribe({
        next: (res: UsersResponse) => {
          this.users = res.users;
          this.pagination = res.pagination;
          this.loading = false;
        },
        error: () => {
          this.loading = false;
        }
      });
  }

  nextPage(): void {
    if (this.pagination.hasMore) {
      this.loadUsers(this.pagination.skip + this.pagination.limit);
    }
  }

  prevPage(): void {
    if (this.pagination.skip > 0) {
      this.loadUsers(this.pagination.skip - this.pagination.limit);
    }
  }
}