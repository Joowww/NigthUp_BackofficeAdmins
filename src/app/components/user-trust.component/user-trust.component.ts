import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserTrustService } from '../../services/user-trust.service';
import { UserTrust, UserTrustStats, UserTrustSummary } from '../../models/userTrust';

@Component({
  selector: 'app-user-trust',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-trust.component.html',
  styleUrls: ['./user-trust.component.css']
})
export class UserTrustComponent implements OnInit {
  globalAverageTrust: number | null = null;
  ratings: UserTrust[] = [];
  filteredRatings: UserTrust[] = [];
  trustSummaries: UserTrustSummary[] = [];
  loading = false;
  searchTerm = "";
  
  stats: UserTrustStats = {
    average: 0,
    count: 0,
    distribution: []
  };

  pagination = { skip: 0, limit: 10, total: 0, hasMore: false };

  // Modal variables
  isCreateModalOpen = false;
  isEditModalOpen = false;
  isViewModalOpen = false;
  selectedRating: UserTrust | null = null;

  newRatingData: Partial<UserTrust> = {
    rated: '',
    score: 5,
    comment: '',
    context: 'general'
  };

  editedRatingData: Partial<UserTrust> = {};

  constructor(private userTrustService: UserTrustService) {}

  ngOnInit(): void {
    this.loadRatings();
    this.loadAllTrustSummaries();
    this.userTrustService.getGlobalAverageTrust().subscribe({
      next: avg => this.globalAverageTrust = avg,
      error: err => {
        console.error('Error fetching global average trust:', err);
        this.globalAverageTrust = 0;
      }
    });
  }

  loadRatings(skip: number = this.pagination.skip): void {
    this.loading = true;
    this.userTrustService.getTrustRatings(skip, this.pagination.limit, this.searchTerm)
      .subscribe({
        next: (response: any) => {
          this.ratings = response.ratings;
          this.filteredRatings = response.ratings;
          this.pagination = {
            ...response.pagination,
            skip: skip
          };
          this.loading = false;
        },
        error: (error: any) => {
          console.error('Error loading trust ratings:', error);
          this.loading = false;
          alert('Error loading trust ratings: ' + (error.error?.message || 'Unknown error'));
        }
      });
  }

  loadAllTrustSummaries(): void {
    this.userTrustService.getAllUsersTrustSummary().subscribe({
      next: (summaries: any) => {
        this.trustSummaries = summaries;
        // Calculate average stats from summaries
        if (summaries.length > 0) {
          const totalRatings = summaries.reduce((sum: number, s: any) => sum + s.totalRatings, 0);
          const averageTrust = summaries.reduce((sum: number, s: any) => sum + s.averageTrust, 0) / summaries.length;
          
          this.stats = {
            average: parseFloat(averageTrust.toFixed(2)),
            count: totalRatings,
            distribution: [] // You might want to calculate this from the data
          };
        }
      },
      error: (error: any) => {
        console.error('Error loading trust summaries:', error);
      }
    });
  }

  applyFilters(): void {
    this.pagination.skip = 0;
    this.loadRatings();
  }

  // Modal methods
  openCreateModal(): void {
    this.newRatingData = {
      rated: '',
      score: 5,
      comment: '',
      context: 'general'
    };
    this.isCreateModalOpen = true;
  }

  closeCreateModal(): void {
    this.isCreateModalOpen = false;
  }

  submitCreate(): void {
    if (!this.newRatingData.rated || !this.newRatingData.context) {
      alert('Rated user and context are required');
      return;
    }

    this.loading = true;
    this.userTrustService.createTrustRating(this.newRatingData).subscribe({
      next: (rating: any) => {
        this.ratings.unshift(rating);
        this.filteredRatings = [...this.ratings];
        this.closeCreateModal();
        this.loading = false;
        this.loadAllTrustSummaries();
        alert('Trust rating created successfully!');
      },
      error: (error: any) => {
        console.error('Error creating trust rating:', error);
        this.loading = false;
        alert('Error creating trust rating: ' + (error.error?.message || 'Unknown error'));
      }
    });
  }

  openEditModal(rating: UserTrust): void {
    this.selectedRating = rating;
    this.editedRatingData = {
      rated: rating.rated,
      score: rating.score,
      comment: rating.comment,
      context: rating.context
    };
    this.isEditModalOpen = true;
  }

  closeEditModal(): void {
    this.isEditModalOpen = false;
    this.selectedRating = null;
    this.editedRatingData = {};
  }

  submitEdit(): void {
    if (!this.selectedRating || !this.selectedRating._id) return;

    this.loading = true;
    this.userTrustService.updateTrustRating(this.selectedRating._id, this.editedRatingData)
      .subscribe({
        next: (updatedRating: any) => {
          const index = this.ratings.findIndex(r => r._id === this.selectedRating!._id);
          if (index !== -1) {
            this.ratings[index] = { ...this.ratings[index], ...updatedRating };
            this.filteredRatings = [...this.ratings];
          }
          this.closeEditModal();
          this.loading = false;
          this.loadAllTrustSummaries();
          alert('Trust rating updated successfully!');
        },
        error: (error: any) => {
          console.error('Error updating trust rating:', error);
          this.loading = false;
          alert('Error updating trust rating: ' + (error.error?.message || 'Unknown error'));
        }
      });
  }

  openViewModal(rating: UserTrust): void {
    this.selectedRating = rating;
    this.isViewModalOpen = true;
  }

  closeViewModal(): void {
    this.isViewModalOpen = false;
    this.selectedRating = null;
  }

  deleteRating(rating: UserTrust): void {
    if (!rating._id) return;

    const confirmDelete = confirm('Are you sure you want to delete this trust rating?');
    if (!confirmDelete) return;

    this.userTrustService.deleteTrustRating(rating._id).subscribe({
      next: () => {
        this.ratings = this.ratings.filter(r => r._id !== rating._id);
        this.filteredRatings = this.filteredRatings.filter(r => r._id !== rating._id);
        this.loadAllTrustSummaries();
        alert('Trust rating deleted successfully!');
      },
      error: (error: any) => {
        console.error('Error deleting trust rating:', error);
        alert('Error deleting trust rating: ' + (error.error?.message || 'Unknown error'));
      }
    });
  }

  // Helper methods
  generateStars(score: number): string {
    return '★'.repeat(score) + '☆'.repeat(5 - score);
  }

  getTrustLevelColor(level: string): string {
    switch (level) {
      case 'high': return '#10b981';
      case 'medium': return '#f59e0b';
      case 'low': return '#ef4444';
      default: return '#6b7280';
    }
  }

  getTrustLevelText(level: string): string {
    switch (level) {
      case 'high': return 'High Trust';
      case 'medium': return 'Medium Trust';
      case 'low': return 'Low Trust';
      default: return 'Unknown';
    }
  }

  // Pagination
  nextPage(): void {
    if (this.pagination.hasMore) {
      this.loadRatings(this.pagination.skip + this.pagination.limit);
    }
  }

  prevPage(): void {
    if (this.pagination.skip > 0) {
      this.loadRatings(Math.max(0, this.pagination.skip - this.pagination.limit));
    }
  }

  // Helper methods
  getShortId(id?: string): string {
    return typeof id === 'string' ? id.slice(-6) : '';
  }

  getTotalPages(): number {
    return this.pagination.limit ? Math.ceil(this.pagination.total / this.pagination.limit) : 1;
  }
}