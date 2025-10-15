import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-company-policy-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './company-policy-modal.component.html',
  styleUrls: ['./company-policy-modal.component.css']
})
export class CompanyPolicyModalComponent {
  @Input() isOpen = false;
  @Output() isOpenChange = new EventEmitter<boolean>();

  closeModal() {
    this.isOpen = false;
    this.isOpenChange.emit(false);
  }
}