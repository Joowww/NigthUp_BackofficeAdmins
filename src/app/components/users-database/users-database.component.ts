import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService, UsersResponse, User, UserStats } from '../../services/user.service';

@Component({
  selector: 'app-users-database',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './users-database.component.html',
  styleUrls: ['./users-database.component.css']
})
export class UsersDatabaseComponent implements OnInit {
  searchTerm = '';
  users: User[] = [];
  filteredUsers: User[] = [];
  userStats: UserStats = {
    total: 0,
    active: 0,
    inactive: 0,
    newCount: 0,
    lastUpdated: ''
  };
  pagination = { skip: 0, limit: 10, total: 0, hasMore: false };
  loading = false;

  // Variables para los modales
  isEditModalOpen = false;
  isDeleteModalOpen = false;
  isViewModalOpen = false;
  editingUser: User | null = null;
  deletingUser: User | null = null;
  viewingUser: User | null = null;
  editedUserData: Partial<User> = {};
  deleteAction: 'disable' | 'delete' = 'disable';

  // Filtros
  roleFilter: string = 'all';
  statusFilter: string = 'all';

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.loadUsers();
    this.loadUserStats();
    this.checkAdminAccess();
  }

  checkAdminAccess(): void {
    const currentUser = this.userService.getCurrentUser();
    console.log('Current user:', currentUser);
    if (!currentUser || currentUser.role !== 'admin') {
      console.warn('Current user is not admin. Some operations may fail.');
    }
  }

  loadUsers(skip: number = this.pagination.skip): void {
    this.loading = true;
    this.userService.getAllUsersWithInactive(skip, this.pagination.limit)
      .subscribe({
        next: (res: UsersResponse) => {
          this.users = res.users;
          this.applyFilters();
          this.pagination = {
            ...res.pagination,
            skip: skip
          };
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading users:', error);
          this.loading = false;
        }
      });
  }

  loadUserStats(): void {
    this.userService.getUserStats().subscribe({
      next: (stats: UserStats) => {
        this.userStats = stats;
      },
      error: (error) => {
        console.error('Error loading user stats:', error);
      }
    });
  }

  // ✅ NUEVO: Aplicar filtros
  applyFilters(): void {
    let filtered = this.users;

    // Filtro de búsqueda
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(user => 
        user.username.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term)
      );
    }

    // Filtro por rol
    if (this.roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === this.roleFilter);
    }

    // Filtro por estado
    if (this.statusFilter !== 'all') {
      const isActive = this.statusFilter === 'active';
      filtered = filtered.filter(user => user.active === isActive);
    }

    this.filteredUsers = filtered;
  }

  // ✅ NUEVO: Exportar a CSV
  exportToCSV(): void {
    const headers = ['ID', 'Username', 'Email', 'Role', 'Status', 'Birthday', 'Events Count'];
    const csvData = this.filteredUsers.map(user => [
      user._id || '',
      user.username,
      user.email,
      user.role,
      user.active ? 'Active' : 'Inactive',
      this.formatDate(user.birthday),
      user.events?.length || 0
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `users_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
    this.editingUser = { ...user };
    this.editedUserData = {
      username: user.username,
      email: user.email,
      birthday: this.formatDateForInput(user.birthday)
      // ❌ REMOVIDO: No incluir active aquí
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

    if (!this.editedUserData.username || !this.editedUserData.email || !this.editedUserData.birthday) {
      alert('Username, email and birthday are required fields.');
      return;
    }

    this.loading = true;
    
    const updateData: any = {
      username: this.editedUserData.username,
      email: this.editedUserData.email,
      birthday: this.editedUserData.birthday
    };

    console.log('=== UPDATE USER DEBUG ===');
    console.log('Update data:', updateData);

    this.userService.updateUser(this.editingUser._id, updateData)
      .subscribe({
        next: (response: any) => {
          console.log('✅ Update response:', response);
          
          const index = this.users.findIndex(u => u._id === this.editingUser!._id);
          if (index !== -1) {
            this.users[index] = { 
              ...this.users[index], 
              username: updateData.username,
              email: updateData.email,
              birthday: updateData.birthday
            };
          }
          
          this.closeEditModal();
          this.loading = false;
          this.loadUserStats();
          this.loadUsers(this.pagination.skip);
          
          alert('User updated successfully!');
        },
        error: (error: any) => {
          console.error('❌ Error updating user:', error);
          this.loading = false;
          
          let errorMessage = 'Update failed: ';
          
          if (error.status === 401) {
            errorMessage += 'You are not authorized. Please login again.';
          } else if (error.status === 403) {
            errorMessage += 'You don\'t have permission to edit users. Only admins can edit users.';
          } else if (error.status === 404) {
            errorMessage += 'User not found. It may have been deleted.';
          } else if (error.status === 400) {
            if (error.error && error.error.message) {
              errorMessage += error.error.message;
            } else if (error.error && error.error.errors) {
              errorMessage += 'Validation errors: ' + JSON.stringify(error.error.errors);
            } else {
              errorMessage += 'Invalid data provided. Check all fields.';
            }
          } else if (error.status === 422) {
            errorMessage += 'Validation failed. Email or username might already exist.';
          } else if (error.status === 500) {
            errorMessage += 'Server error. Please try again later.';
          } else if (error.status === 0) {
            errorMessage += 'Cannot connect to server. Check your internet connection.';
          } else if (error.error?.message) {
            errorMessage += error.error.message;
          } else {
            errorMessage += `Unknown error (Status: ${error.status}). Check console for details.`;
          }
          
          alert(errorMessage);
        }
      });
  }

  // Métodos para el modal de vista
  openViewModal(user: User): void {
    this.viewingUser = user;
    this.isViewModalOpen = true;
  }

  closeViewModal(): void {
    this.isViewModalOpen = false;
    this.viewingUser = null;
  }

  // Métodos para el modal de eliminación
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
      this.userService.disableUser(this.deletingUser._id)
        .subscribe({
          next: (response: any) => {
            this.updateUserStatus(this.deletingUser!._id!, false);
            this.closeDeleteModal();
            this.loading = false;
            this.loadUserStats();
            this.loadUsers(this.pagination.skip);
            alert('User disabled successfully!');
          },
          error: (error: any) => {
            console.error('Error disabling user:', error);
            this.loading = false;
            alert('Error disabling user: ' + (error.error?.message || 'Unknown error'));
          }
        });
    } else {
      this.userService.deleteUser(this.deletingUser._id)
        .subscribe({
          next: (response: any) => {
            this.users = this.users.filter(u => u._id !== this.deletingUser!._id);
            this.filteredUsers = this.filteredUsers.filter(u => u._id !== this.deletingUser!._id);
            this.closeDeleteModal();
            this.loading = false;
            this.loadUserStats();
            alert('User deleted successfully!');
          },
          error: (error: any) => {
            console.error('Error deleting user:', error);
            this.loading = false;
            alert('Error deleting user: ' + (error.error?.message || 'Unknown error'));
          }
        });
    }
  }

  // Método para reactivar usuario
  reactivateUser(user: User): void {
    if (!user._id) return;

    this.loading = true;
    this.userService.reactivateUser(user._id)
      .subscribe({
        next: (response: any) => {
          this.updateUserStatus(user._id!, true);
          this.loading = false;
          this.loadUserStats();
          this.loadUsers(this.pagination.skip);
          alert('User reactivated successfully!');
        },
        error: (error: any) => {
          console.error('Error reactivating user:', error);
          this.loading = false;
          alert('Error reactivating user: ' + (error.error?.message || 'Unknown error'));
        }
      });
  }

  // Método para cambiar rol a admin
  makeUserAdmin(user: User): void {
    if (!user._id) return;

    this.loading = true;
    this.userService.makeUserAdmin(user._id)
      .subscribe({
        next: (response: any) => {
          const index = this.users.findIndex(u => u._id === user._id);
          if (index !== -1) {
            this.users[index].role = 'admin';
          }
          this.loading = false;
          this.loadUsers(this.pagination.skip);
          alert('User is now an admin!');
        },
        error: (error: any) => {
          console.error('Error making user admin:', error);
          this.loading = false;
          alert('Error making user admin: ' + (error.error?.message || 'Unknown error'));
        }
      });
  }

  // Método para quitar rol admin
  removeUserAdmin(user: User): void {
    if (!user._id) return;

    this.loading = true;
    this.userService.removeUserAdmin(user._id)
      .subscribe({
        next: (response: any) => {
          const index = this.users.findIndex(u => u._id === user._id);
          if (index !== -1) {
            this.users[index].role = 'user';
          }
          this.loading = false;
          this.loadUsers(this.pagination.skip);
          alert('Admin permissions removed! User is now a regular user.');
        },
        error: (error: any) => {
          console.error('Error removing admin role:', error);
          this.loading = false;
          alert('Error removing admin role: ' + (error.error?.message || 'Unknown error'));
        }
      });
  }

  // ✅ CORREGIDO: Método para hacer manager
  makeUserManager(user: User): void {
    if (!user._id) return;

    const currentUser = this.userService.getCurrentUser();
    console.log('=== MAKING USER MANAGER DEBUG ===');
    console.log('Target user:', user.username, 'with ID:', user._id);
    console.log('Current logged user:', currentUser);
    console.log('Current user role:', currentUser?.role);
    console.log('Is admin?', currentUser?.role === 'admin');
    
    this.loading = true;
    this.userService.makeUserManager(user._id)
      .subscribe({
        next: (response: any) => {
          console.log('✅ Manager response SUCCESS:', response);
          const index = this.users.findIndex(u => u._id === user._id);
          if (index !== -1) {
            this.users[index].role = 'manager';
          }
          this.loading = false;
          this.loadUsers(this.pagination.skip);
          alert('User is now a manager!');
        },
        error: (error: any) => {
          console.error('Full error making user manager:', error);
          this.loading = false;
          
          let errorMessage = 'Error making user manager: ';
          
          if (error.status === 401) {
            errorMessage += 'You are not authorized. Please login again.';
          } else if (error.status === 403) {
            errorMessage += 'You don\'t have permission to change user roles.';
          } else if (error.status === 404) {
            errorMessage += 'User not found or endpoint not available.';
          } else if (error.status === 400) {
            errorMessage += 'Invalid request. ' + (error.error?.message || '');
          } else if (error.status === 500) {
            errorMessage += 'Server error. The make-manager endpoint may not exist.';
          } else if (error.status === 0) {
            errorMessage += 'Cannot connect to server. Check your connection.';
          } else if (error.error?.message) {
            errorMessage += error.error.message;
          } else {
            errorMessage += `HTTP ${error.status}: ${error.statusText || 'Unknown error'}. Check if the /make-manager endpoint exists in your backend.`;
          }
          
          alert(errorMessage);
        }
      });
  }

  // ✅ CORREGIDO: Método para quitar manager
  removeUserManager(user: User): void {
    if (!user._id) return;

    console.log('Removing manager role from:', user.username, 'with ID:', user._id);

    this.loading = true;
    this.userService.removeUserManager(user._id)
      .subscribe({
        next: (response: any) => {
          console.log('Remove manager response:', response);
          const index = this.users.findIndex(u => u._id === user._id);
          if (index !== -1) {
            this.users[index].role = 'user';
          }
          this.loading = false;
          this.loadUsers(this.pagination.skip);
          alert('Manager permissions removed! User is now a regular user.');
        },
        error: (error: any) => {
          console.error('Full error removing manager role:', error);
          this.loading = false;
          
          let errorMessage = 'Error removing manager role: ';
          
          if (error.status === 401) {
            errorMessage += 'You are not authorized. Please login again.';
          } else if (error.status === 403) {
            errorMessage += 'You don\'t have permission to change user roles.';
          } else if (error.status === 404) {
            errorMessage += 'User not found or endpoint not available.';
          } else if (error.status === 400) {
            errorMessage += 'Invalid request. ' + (error.error?.message || '');
          } else if (error.status === 500) {
            errorMessage += 'Server error. The remove-manager endpoint may not exist.';
          } else if (error.status === 0) {
            errorMessage += 'Cannot connect to server. Check your connection.';
          } else if (error.error?.message) {
            errorMessage += error.error.message;
          } else {
            errorMessage += `HTTP ${error.status}: ${error.statusText || 'Unknown error'}. Check if the /remove-manager endpoint exists in your backend.`;
          }
          
          alert(errorMessage);
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

  // Formatear fecha para display
  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-GB');
    } catch {
      return 'Invalid Date';
    }
  }

  // Formatear fecha para input type="date"
  formatDateForInput(dateString: string): string {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toISOString().split('T')[0];
    } catch {
      return '';
    }
  }

  // Obtener el ID corto para mostrar
  getShortId(fullId: string | undefined): string {
    if (!fullId) return 'N/A';
    return fullId.substring(0, 8);
  }

  // Verificar si el usuario actual es admin
  isCurrentUserAdmin(): boolean {
    const currentUser = this.userService.getCurrentUser();
    return currentUser?.role === 'admin';
  }
}