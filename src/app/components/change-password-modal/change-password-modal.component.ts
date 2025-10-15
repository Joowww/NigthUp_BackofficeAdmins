import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-change-password-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './change-password-modal.component.html',
  styleUrls: ['./change-password-modal.component.css']
})
export class ChangePasswordModalComponent {
  @Input() isOpen = false;
  @Output() onClose = new EventEmitter<void>();

  password = '';
  confirmPassword = '';
  showPassword = false;
  showConfirmPassword = false;

  close() {
    this.onClose.emit();
  }

  onSubmit(event: Event) {
    event.preventDefault();
    if (this.password === this.confirmPassword && this.password.length >= 8) {
      console.log('Password changed successfully');
      this.close();
    } else {
      alert('Passwords do not match or are too short (minimum 8 characters)');
    }
  }

  onBackdropClick(event: MouseEvent) {
    if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
      this.close();
    }
  }

  onModalClick(event: MouseEvent) {
    event.stopPropagation();
  }
}