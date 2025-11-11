import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TagService } from '../../services/tag.service';
import { Tag, TagStats, TagsResponse } from '../../models/tag';

@Component({
  selector: 'app-tags',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tags.component.html',
  styleUrls: ['./tags.component.css']
})
export class TagsComponent implements OnInit {
  tags: Tag[] = [];
  filteredTags: Tag[] = [];
  loading = false;
  searchTerm = "";
  
  stats: TagStats = {
    total: 0,
    active: 0,
    inactive: 0,
    mostUsed: []
  };

  pagination = { skip: 0, limit: 10, total: 0, hasMore: false };

  // Modal variables
  isCreateModalOpen = false;
  isEditModalOpen = false;
  isViewModalOpen = false;
  selectedTag: Tag | null = null;

  newTagData: Partial<Tag> = {
    name: '',
    description: '',
    color: '#3b82f6'
  };

  editedTagData: Partial<Tag> = {};

  constructor(private tagService: TagService) {}

  ngOnInit(): void {
    this.loadTags();
    this.loadStats();
  }

  loadTags(skip: number = this.pagination.skip): void {
    this.loading = true;
    this.tagService.getTags(skip, this.pagination.limit, this.searchTerm)
      .subscribe({
        next: (response) => {
          this.tags = response.tags;
          this.filteredTags = response.tags;
          this.pagination = {
            ...response.pagination,
            skip: skip
          };
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading tags:', error);
          this.loading = false;
          alert('Error loading tags: ' + (error.error?.message || 'Unknown error'));
        }
      });
  }

  loadStats(): void {
    this.tagService.getTagStats().subscribe({
      next: (stats) => {
        this.stats = stats;
      },
      error: (error) => {
        console.error('Error loading tag stats:', error);
      }
    });
  }

  applyFilters(): void {
    this.pagination.skip = 0;
    this.loadTags();
  }

  // Modal methods
  openCreateModal(): void {
    this.newTagData = {
      name: '',
      description: '',
      color: '#3b82f6'
    };
    this.isCreateModalOpen = true;
  }

  closeCreateModal(): void {
    this.isCreateModalOpen = false;
  }

  submitCreate(): void {
    if (!this.newTagData.name) {
      alert('Tag name is required');
      return;
    }

    this.loading = true;
    this.tagService.createTag(this.newTagData).subscribe({
      next: (tag) => {
        this.tags.unshift(tag);
        this.filteredTags = [...this.tags];
        this.closeCreateModal();
        this.loading = false;
        this.loadStats();
        alert('Tag created successfully!');
      },
      error: (error) => {
        console.error('Error creating tag:', error);
        this.loading = false;
        alert('Error creating tag: ' + (error.error?.message || 'Unknown error'));
      }
    });
  }

  openEditModal(tag: Tag): void {
    this.selectedTag = tag;
    this.editedTagData = {
      name: tag.name,
      description: tag.description,
      color: tag.color
    };
    this.isEditModalOpen = true;
  }

  closeEditModal(): void {
    this.isEditModalOpen = false;
    this.selectedTag = null;
  }

  submitEdit(): void {
    if (!this.selectedTag || !this.selectedTag._id) return;

    this.loading = true;
    this.tagService.updateTag(this.selectedTag._id, this.editedTagData)
      .subscribe({
        next: (updatedTag) => {
          const index = this.tags.findIndex(t => t._id === this.selectedTag!._id);
          if (index !== -1) {
            this.tags[index] = { ...this.tags[index], ...updatedTag };
            this.filteredTags = [...this.tags];
          }
          this.closeEditModal();
          this.loading = false;
          this.loadStats();
          alert('Tag updated successfully!');
        },
        error: (error) => {
          console.error('Error updating tag:', error);
          this.loading = false;
          alert('Error updating tag: ' + (error.error?.message || 'Unknown error'));
        }
      });
  }

  openViewModal(tag: Tag): void {
    this.selectedTag = tag;
    this.isViewModalOpen = true;
  }

  closeViewModal(): void {
    this.isViewModalOpen = false;
    this.selectedTag = null;
  }

  deleteTag(tag: Tag): void {
    if (!tag._id) return;

    const confirmDelete = confirm(`Are you sure you want to delete the tag "${tag.name}"?`);
    if (!confirmDelete) return;

    this.tagService.deleteTag(tag._id).subscribe({
      next: () => {
        this.tags = this.tags.filter(t => t._id !== tag._id);
        this.filteredTags = this.filteredTags.filter(t => t._id !== tag._id);
        this.loadStats();
        alert('Tag deleted successfully!');
      },
      error: (error) => {
        console.error('Error deleting tag:', error);
        alert('Error deleting tag: ' + (error.error?.message || 'Unknown error'));
      }
    });
  }

  // Pagination
  nextPage(): void {
    if (this.pagination.hasMore) {
      this.loadTags(this.pagination.skip + this.pagination.limit);
    }
  }

  prevPage(): void {
    if (this.pagination.skip > 0) {
      this.loadTags(Math.max(0, this.pagination.skip - this.pagination.limit));
    }
  }

  // Helper methods
  getShortId(id?: string): string {
    return typeof id === 'string' ? id.slice(-6) : '';
  }

  getTotalPages(): number {
    return this.pagination.limit ? Math.ceil(this.pagination.total / this.pagination.limit) : 1;
  }

  getTotalEvents(): number {
    return this.tags.reduce((total, tag) => total + (tag.events?.length || 0), 0);
  }
}