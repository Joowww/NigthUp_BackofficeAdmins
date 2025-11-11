import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserInterestService } from '../../services/user-interest.service';
import { UserInterest, UserInterestStats } from '../../models/userInterest';

@Component({
  selector: 'app-user-interests',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-interests.component.html',
  styleUrls: ['./user-interests.component.css']
})
export class UserInterestsComponent implements OnInit {
  interests: UserInterest[] = [];
  filteredInterests: UserInterest[] = [];
  loading = false;
  searchTerm = "";
  
  stats: UserInterestStats = {
    total: 0,
    active: 0,
    inactive: 0,
    mostPopular: []
  };

  pagination = { skip: 0, limit: 10, total: 0, hasMore: false };

  // Modal variables
  isCreateModalOpen = false;
  isEditModalOpen = false;
  isViewModalOpen = false;
  selectedInterest: UserInterest | null = null;

  newInterestData: Partial<UserInterest> = {
    name: '',
    description: '',
    color: '#8b5cf6'
  };

  editedInterestData: Partial<UserInterest> = {};

  constructor(private userInterestService: UserInterestService) {}

  ngOnInit(): void {
    this.loadInterests();
    this.loadStats();
  }

  loadInterests(skip: number = this.pagination.skip): void {
    this.loading = true;
    this.userInterestService.getUserInterests(skip, this.pagination.limit, this.searchTerm)
      .subscribe({
        next: (response: any) => {
          this.interests = response.interests;
          this.filteredInterests = response.interests;
          this.pagination = {
            ...response.pagination,
            skip: skip
          };
          this.loading = false;
        },
        error: (error: any) => {
          console.error('Error loading user interests:', error);
          this.loading = false;
          alert('Error loading interests: ' + (error.error?.message || 'Unknown error'));
        }
      });
  }

  loadStats(): void {
    this.userInterestService.getUserInterestStats().subscribe({
      next: (stats: any) => {
        this.stats = stats;
      },
      error: (error: any) => {
        console.error('Error loading user interest stats:', error);
      }
    });
  }

  applyFilters(): void {
    this.pagination.skip = 0;
    this.loadInterests();
  }

  // Modal methods
  openCreateModal(): void {
    this.newInterestData = {
      name: '',
      description: '',
      color: '#8b5cf6'
    };
    this.isCreateModalOpen = true;
  }

  closeCreateModal(): void {
    this.isCreateModalOpen = false;
  }

  submitCreate(): void {
    if (!this.newInterestData.name) {
      alert('Interest name is required');
      return;
    }

    this.loading = true;
    this.userInterestService.createUserInterest(this.newInterestData).subscribe({
      next: (interest: any) => {
        this.interests.unshift(interest);
        this.filteredInterests = [...this.interests];
        this.closeCreateModal();
        this.loading = false;
        this.loadStats();
        alert('User interest created successfully!');
      },
      error: (error: any) => {
        console.error('Error creating user interest:', error);
        this.loading = false;
        alert('Error creating interest: ' + (error.error?.message || 'Unknown error'));
      }
    });
  }

  openEditModal(interest: UserInterest): void {
    this.selectedInterest = interest;
    this.editedInterestData = {
      name: interest.name,
      description: interest.description,
      color: interest.color
    };
    this.isEditModalOpen = true;
  }

  closeEditModal(): void {
    this.isEditModalOpen = false;
    this.selectedInterest = null;
  }

  submitEdit(): void {
    if (!this.selectedInterest || !this.selectedInterest._id) return;

    this.loading = true;
    this.userInterestService.updateUserInterest(this.selectedInterest._id, this.editedInterestData)
      .subscribe({
        next: (updatedInterest: any) => {
          const index = this.interests.findIndex(i => i._id === this.selectedInterest!._id);
          if (index !== -1) {
            this.interests[index] = { ...this.interests[index], ...updatedInterest };
            this.filteredInterests = [...this.interests];
          }
          this.closeEditModal();
          this.loading = false;
          this.loadStats();
          alert('User interest updated successfully!');
        },
        error: (error: any) => {
          console.error('Error updating user interest:', error);
          this.loading = false;
          alert('Error updating interest: ' + (error.error?.message || 'Unknown error'));
        }
      });
  }

  openViewModal(interest: UserInterest): void {
    this.selectedInterest = interest;
    this.isViewModalOpen = true;
  }

  closeViewModal(): void {
    this.isViewModalOpen = false;
    this.selectedInterest = null;
  }

  deleteInterest(interest: UserInterest): void {
    if (!interest._id) return;

    const confirmDelete = confirm(`Are you sure you want to delete the interest "${interest.name}"?`);
    if (!confirmDelete) return;

    this.userInterestService.deleteUserInterest(interest._id).subscribe({
      next: () => {
        this.interests = this.interests.filter(i => i._id !== interest._id);
        this.filteredInterests = this.filteredInterests.filter(i => i._id !== interest._id);
        this.loadStats();
        alert('User interest deleted successfully!');
      },
      error: (error: any) => {
        console.error('Error deleting user interest:', error);
        alert('Error deleting interest: ' + (error.error?.message || 'Unknown error'));
      }
    });
  }

  // Pagination
  nextPage(): void {
    if (this.pagination.hasMore) {
      this.loadInterests(this.pagination.skip + this.pagination.limit);
    }
  }

  prevPage(): void {
    if (this.pagination.skip > 0) {
      this.loadInterests(Math.max(0, this.pagination.skip - this.pagination.limit));
    }
  }

  // Helper methods
  getShortId(id?: string): string {
    return typeof id === 'string' ? id.slice(-6) : '';
  }

  getTotalPages(): number {
    return this.pagination.limit ? Math.ceil(this.pagination.total / this.pagination.limit) : 1;
  }

  getTotalUsers(): number {
    return this.interests.reduce((total, interest) => total + (interest.users?.length || 0), 0);
  }
}