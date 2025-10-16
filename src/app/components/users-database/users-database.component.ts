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
  adminCredentials = { adminUsername: 'admin', adminPassword: 'adminpass' };

  // Variables para el modal de edición
  isEditModalOpen = false;
  isDeleteModalOpen = false;
  editingUser: User | null = null;
  deletingUser: User | null = null;
  editedUserData: Partial<User> = {};
  deleteAction: 'disable' | 'delete' = 'disable';

  constructor(private userService: UserService) {
    this.loadUsers();
  }

  loadUsers(skip: number = 0): void {
    this.loading = true;
    this.userService.getAllUsers(skip, this.pagination.limit)
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

  // Métodos para el modal de edición
  openEditModal(user: User): void {
    this.editingUser = user;
    // Creamos una copia de los datos del usuario para editar
    this.editedUserData = {
      username: user.username,
      email: user.email,
      birthday: user.birthday,
      role: user.role,
      active: user.active
    };
    this.isEditModalOpen = true;
  }

  closeEditModal(): void {
    this.isEditModalOpen = false;
    this.editingUser = null;
    this.editedUserData = {};
  }

  submitEdit(): void {
    if (!this.editingUser || !this.editingUser._id) return;

    this.loading = true;
    this.userService.updateUser(this.editingUser._id, this.editedUserData)
      .subscribe({
        next: (updatedUser) => {
          // Actualizar el usuario en la lista local
          const index = this.users.findIndex(u => u._id === updatedUser._id);
          if (index !== -1) {
            this.users[index] = updatedUser;
          }
          this.closeEditModal();
          this.loading = false;
        },
        error: (error) => {
          console.error('Error updating user:', error);
          this.loading = false;
        
        }
      });

  }

  openDeleteModal(user: User): void {
    this.deletingUser = user;
    this.deleteAction = user.active ? 'disable' : 'delete';
    this.isDeleteModalOpen = true;
  }

  closeDeleteModal(): void {
    this.isDeleteModalOpen = false;
    this.deletingUser = null;
    this.deleteAction = 'disable';
  }

  confirmDeleteAction(): void {
    if (!this.deletingUser || !this.deletingUser._id) return;

    this.loading = true;

    if (this.deleteAction === 'disable') {
      // Deshabilitar usuario
      this.userService.disableUser(this.deletingUser._id, this.adminCredentials)
        .subscribe({
          next: () => {
            this.updateUserStatus(this.deletingUser!._id!, false);
            this.closeDeleteModal();
            this.loading = false;
          },
          error: (error) => {
            console.error('Error disabling user:', error);
            this.loading = false;
          }
        });
    } else {
      // Eliminar definitivamente
      this.userService.deleteUser(this.deletingUser._id, this.adminCredentials)
        .subscribe({
          next: () => {
            this.users = this.users.filter(u => u._id !== this.deletingUser!._id);
            this.closeDeleteModal();
            this.loading = false;
          },
          error: (error) => {
            console.error('Error deleting user:', error);
            this.loading = false;
          }
        });
    }
  }

  // Método para reactivar usuario
  reactivateUser(user: User): void {
    if (!user._id) return;

    this.loading = true;
    this.userService.reactivateUser(user._id, this.adminCredentials)
      .subscribe({
        next: () => {
          this.updateUserStatus(user._id!, true);
          this.loading = false;
        },
        error: (error) => {
          console.error('Error reactivating user:', error);
          this.loading = false;
        }
      });
  }

  // Método auxiliar para actualizar estado
  private updateUserStatus(userId: string, isActive: boolean): void {
    const user = this.users.find(u => u._id === userId);
    if (user) {
      user.active = isActive;
    }
  }
}