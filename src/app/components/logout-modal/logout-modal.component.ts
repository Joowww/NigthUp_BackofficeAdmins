import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-logout-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './logout-modal.component.html',
  styleUrls: ['./logout-modal.component.css']
})
export class LogoutModalComponent {
  @Input() isOpen = false;
  @Output() isOpenChange = new EventEmitter<boolean>();
  @Output() confirm = new EventEmitter<void>();

  closeModal() {
    this.isOpen = false;
    this.isOpenChange.emit(false);
  }

  onConfirm() {
    this.confirm.emit();
    this.closeModal();
  }
}