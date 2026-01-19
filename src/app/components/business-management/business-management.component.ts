import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BusinessService, BusinessResponse } from '../../services/business.service';
import { IBusiness } from '../../models/business';
import { UserService } from '../../services/user.service';
import { IUser } from '../../models/user';

@Component({
    selector: 'app-business-management',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './business-management.component.html',
    styleUrls: ['./business-management.component.css']
})
export class BusinessManagementComponent implements OnInit {
    businesses: IBusiness[] = [];
    loading = false;
    pagination = { skip: 0, limit: 10, total: 0, hasMore: false };

    // Modals state
    isCreateModalOpen = false;
    isEditModalOpen = false;
    isAssignModalOpen = false;

    selectedBusiness: IBusiness | null = null;

    // Forms data
    businessData: Partial<IBusiness> = {
        name: '',
        address: '',
        phone: '',
        email: '',
        location: { type: 'Point', coordinates: [0, 0] },
        active: true
    };

    tempLat: number = 0;
    tempLng: number = 0;

    // Manager assignment
    searchUserTerm = '';
    foundUsers: IUser[] = [];
    selectedUser: IUser | null = null;
    searchingUsers = false;

    constructor(
        private businessService: BusinessService,
        private userService: UserService
    ) { }

    ngOnInit(): void {
        this.loadBusinesses();
    }

    loadBusinesses(skip: number = this.pagination.skip): void {
        this.loading = true;
        this.businessService.getAllBusinessesWithInactive(skip, this.pagination.limit).subscribe({
            next: (res: BusinessResponse) => {
                this.businesses = res.businesses;
                this.pagination = { ...res.pagination, skip };
                this.loading = false;
            },
            error: (err: any) => {
                console.error('Error loading businesses', err);
                this.loading = false;
            }
        });
    }

    openCreateModal(): void {
        this.businessData = {
            name: '',
            address: '',
            phone: '',
            email: '',
            location: { type: 'Point', coordinates: [0, 0] },
            active: true
        };
        this.tempLat = 0;
        this.tempLng = 0;
        this.isCreateModalOpen = true;
    }

    openEditModal(business: IBusiness): void {
        this.selectedBusiness = business;
        this.businessData = { ...business };
        this.tempLng = business.location.coordinates[0];
        this.tempLat = business.location.coordinates[1];
        this.isEditModalOpen = true;
    }

    submitBusiness(): void {
        this.businessData.location = {
            type: 'Point',
            coordinates: [this.tempLng, this.tempLat]
        };

        if (this.isEditModalOpen && this.selectedBusiness?._id) {
            this.businessService.updateBusiness(this.selectedBusiness._id, this.businessData).subscribe({
                next: () => {
                    this.loadBusinesses();
                    this.isEditModalOpen = false;
                },
                error: (err: any) => alert('Error updating business: ' + err.message)
            });
        } else {
            this.businessService.createBusiness(this.businessData).subscribe({
                next: () => {
                    this.loadBusinesses();
                    this.isCreateModalOpen = false;
                },
                error: (err: any) => alert('Error creating business: ' + err.message)
            });
        }
    }

    openAssignModal(business: IBusiness): void {
        this.selectedBusiness = business;
        this.isAssignModalOpen = true;
        this.searchUserTerm = '';
        this.foundUsers = [];
        this.selectedUser = null;
    }

    searchUsers(): void {
        if (this.searchUserTerm.length < 3) return;
        this.searchingUsers = true;
        this.userService.getAllUsers(0, 20).subscribe({
            next: (res: any) => {
                // Simple client-side filter for now, as backend might not have search by term on this endpoint
                this.foundUsers = res.users.filter((u: IUser) =>
                    u.username.toLowerCase().includes(this.searchUserTerm.toLowerCase()) ||
                    u.email.toLowerCase().includes(this.searchUserTerm.toLowerCase())
                );
                this.searchingUsers = false;
            },
            error: () => this.searchingUsers = false
        });
    }

    selectUser(user: IUser): void {
        this.selectedUser = user;
    }

    assignManager(): void {
        if (!this.selectedUser?._id || !this.selectedBusiness?._id) return;

        this.businessService.assignManager(this.selectedUser._id, this.selectedBusiness._id).subscribe({
            next: () => {
                alert('Manager assigned successfully');
                this.loadBusinesses();
                this.isAssignModalOpen = false;
            },
            error: (err: any) => alert('Error assigning manager: ' + (err.error?.message || err.message))
        });
    }

    nextPage(): void {
        if (this.pagination.hasMore) this.loadBusinesses(this.pagination.skip + this.pagination.limit);
    }

    prevPage(): void {
        if (this.pagination.skip > 0) this.loadBusinesses(this.pagination.skip - this.pagination.limit);
    }
}
