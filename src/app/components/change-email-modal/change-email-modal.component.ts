import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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

  email = '';
  confirmEmail = '';

  closeModal() {
    this.isOpen = false;
    this.isOpenChange.emit(false);
    this.resetForm();
  }

  resetForm() {
    this.email = '';
    this.confirmEmail = '';
  }

  onSubmit() {
    if (this.email === this.confirmEmail && this.isValidEmail(this.email)) {
      console.log('Email changed successfully to:', this.email);
      this.closeModal();
    } else {
      alert('Emails do not match or invalid email format');
    }
  }

  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  get emailsMatch(): boolean {
    return this.email === this.confirmEmail && this.isValidEmail(this.email);
  }
}