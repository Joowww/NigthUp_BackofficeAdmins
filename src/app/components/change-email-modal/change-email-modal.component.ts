import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-change-email-modal',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './change-email-modal.component.html',
    styleUrls: ['./change-email-modal.component.css']
})
export class ChangeEmailModalComponent {
    @Input() isOpen = false;
    @Output() isOpenChange = new EventEmitter<boolean>();

    newEmail = '';
    confirmEmail = '';
    password = '';
    loading = false;
    errorMessage = '';
    successMessage = '';

    constructor(public authService: AuthService) {}

    closeModal() {
        this.isOpen = false;
        this.isOpenChange.emit(false);
        this.resetForm();
    }

    resetForm() {
        this.newEmail = '';
        this.confirmEmail = '';
        this.password = '';
        this.errorMessage = '';
        this.successMessage = '';
    }

    onSubmit() {
        this.errorMessage = '';
        this.successMessage = '';

        // Validation
        if (!this.newEmail || !this.confirmEmail || !this.password) {
            this.errorMessage = 'All fields are required';
            return;
        }

        if (this.newEmail !== this.confirmEmail) {
            this.errorMessage = 'Email addresses do not match';
            return;
        }

        if (!this.isValidEmail(this.newEmail)) {
            this.errorMessage = 'Please enter a valid email address';
            return;
        }

        // Check if new email is different from current
        const currentUser = this.authService.getCurrentUser();
        if (currentUser && currentUser.email === this.newEmail) {
            this.errorMessage = 'New email must be different from current email';
            return;
        }

        this.loading = true;

        this.authService.changeEmail(this.newEmail, this.password).subscribe({
            next: (response) => {
                this.loading = false;
                this.successMessage = 'Email changed successfully!';
                
                // Update current user in auth service
                if (response.user) {
                    this.authService.updateCurrentUser(response.user);
                }
                
                // Close modal after success
                setTimeout(() => {
                    this.closeModal();
                }, 2000);
            },
            error: (error) => {
                this.loading = false;
                this.errorMessage = error.error?.error || 'Failed to change email. Please try again.';
            }
        });
    }

    isValidEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    get emailsMatch(): boolean {
        return this.newEmail === this.confirmEmail && this.isValidEmail(this.newEmail);
    }
}