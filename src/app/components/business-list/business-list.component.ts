import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { BusinessService } from '../../services/business.service';
import { IBusiness } from '../../models/business';

@Component({
  selector: 'app-business-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './business-list.component.html',
  styleUrls: ['./business-list.component.css']
})
export class BusinessListComponent implements OnInit {
  businesses: IBusiness[] = [];
  filteredBusinesses: IBusiness[] = [];
  searchTerm: string = '';
  private searchSubject = new Subject<string>();
  loading: boolean = true;

  // Para manejar la tarjeta expandida
  expandedBusinessId: string | null = null;

  constructor(
    private businessService: BusinessService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.loadBusinesses();

    // Debounce para evitar búsquedas excesivas
    this.searchSubject.pipe(debounceTime(250)).subscribe(term => {
      this.searchTerm = term;
      this.filteredBusinesses = this.filterBusinesses(term);
    });
  }

  loadBusinesses(): void {
    this.loading = true;
    this.businessService.getAllBusinessesWithInactive(0, 100).subscribe(
      res => {
        console.log('Negocios cargados:', res.businesses);
        this.businesses = res.businesses || [];
        this.filteredBusinesses = [...this.businesses]; // mostrar todos al inicio
        this.loading = false;
      },
      err => {
        console.error('Error cargando negocios', err);
        this.loading = false;
      }
    );
  }

  onSearchChange(term: string) {
    this.searchSubject.next(term || '');
  }

  private normalize(text: string): string {
    return text ? text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '') : '';
  }

  private filterBusinesses(term: string): IBusiness[] {
    const q = this.normalize(term).trim();
    if (!q) return [...this.businesses];
    return this.businesses.filter(b =>
      this.normalize(b.name).includes(q) ||
      this.normalize(b.address || '').includes(q) ||
      this.normalize(b.email || '').includes(q)
    );
  }

  highlightMatch(text: string): SafeHtml {
    const term = (this.searchTerm || '').trim();
    if (!term) return this.sanitizer.bypassSecurityTrustHtml(this.escapeHtml(text || ''));
    const escapedTerm = this.escapeRegExp(term);
    const regex = new RegExp(escapedTerm, 'ig');
    const safeHtml = (text || '').replace(regex, match => `<span class="highlight">${this.escapeHtml(match)}</span>`);
    return this.sanitizer.bypassSecurityTrustHtml(safeHtml);
  }

  toggleExpand(businessId: string): void {
    this.expandedBusinessId = this.expandedBusinessId === businessId ? null : businessId;
  }

  toArray(schedule: string | string[] | undefined | null): string[] {
    if (!schedule) return [];
    return Array.isArray(schedule) ? schedule : [schedule];
  }

  private escapeRegExp(text: string): string {
    return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  private escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}
