import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RatingService } from '../../services/rating.service';
import { Rating, RatingStats } from '../../models/rating';

/**
 * Componente para gestionar el sistema de valoraciones
 */
@Component({
  selector: 'app-ratings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ratings.component.html',
  styleUrls: ['./ratings.component.css']
})
export class RatingsComponent implements OnInit {
  // Variables para la lista de valoraciones
  ratings: Rating[] = [];
  filteredRatings: Rating[] = [];
  loading = false;
  searchTerm = '';

  // Variables para estadísticas
  stats: RatingStats = { average: 0, count: 0 };
  eventIdForStats = '';

  // Variables para paginación
  pagination = { skip: 0, limit: 10, total: 0, hasMore: false };

  // Variables para modales
  isCreateModalOpen = false;
  isEditModalOpen = false;
  isViewModalOpen = false;
  selectedRating: Rating | null = null;

  // Datos para formularios
  newRatingData: Partial<Rating> = {
    event: '',
    username: '',
    score: 5,
    comment: ''
  };

  editedRatingData: Partial<Rating> = {};

  constructor(private ratingService: RatingService) {
    console.log(' RatingsComponent inicializado');
  }

  ngOnInit(): void {
    this.loadRatings();
    console.log(' RatingsComponent cargado');
  }

  /**
   * Cargar valoraciones desde el backend
   */
  loadRatings(): void {
    this.loading = true;
    console.log('🔄 Cargando valoraciones...');

    this.ratingService.getRatings(this.pagination.skip, this.pagination.limit, this.searchTerm)
      .subscribe({
        next: (response) => {
          console.log('Valoraciones cargadas:', response.ratings.length);
          this.ratings = response.ratings;
          this.filteredRatings = response.ratings;
          this.pagination = {
            ...response.pagination,
            skip: this.pagination.skip
          };
          this.loading = false;
        },
        error: (error) => {
          console.error(' Error cargando valoraciones:', error);
          this.loading = false;
          alert('Error cargando valoraciones: ' + (error.error?.message || 'Error desconocido'));
        }
      });
  }

  /**
   * Aplicar filtros de búsqueda
   */
  applyFilters(): void {
    console.log('🔍 Aplicando filtros:', this.searchTerm);
    this.pagination.skip = 0;
    this.loadRatings();
  }

  /**
   * Obtener estadísticas de un evento
   */
  getEventStats(): void {
    if (!this.eventIdForStats.trim()) {
      alert('Por favor ingresa un ID de evento');
      return;
    }

    console.log(`Obteniendo estadísticas para evento: ${this.eventIdForStats}`);
    this.ratingService.getEventRatingStats(this.eventIdForStats)
      .subscribe({
        next: (stats) => {
          console.log('Estadísticas obtenidas:', stats);
          this.stats = stats;
        },
        error: (error) => {
          console.error(' Error obteniendo estadísticas:', error);
          alert('Error obteniendo estadísticas: ' + (error.error?.message || 'Error desconocido'));
        }
      });
  }

  // --- MODALES PARA CREAR VALORACIÓN ---
  openCreateModal(): void {
  console.log('Abriendo modal de creación');
  this.newRatingData = {
    event: '',
    username: '',
    score: 5,
    comment: ''
  };
  this.isCreateModalOpen = true;
}

  closeCreateModal(): void {
    console.log('Cerrando modal de creación');
    this.isCreateModalOpen = false;
    this.newRatingData = {};
  }

  submitCreate(): void {
    console.log('Enviando creación de valoración:', this.newRatingData);
    console.log('Event value:', this.newRatingData.event);
    console.log('Username value:', this.newRatingData.username);
    console.log('Score value:', this.newRatingData.score);
    
    if (!this.validateRatingData(this.newRatingData)) {
      console.log('Validation failed');
      return;
    }

    this.loading = true;
    this.ratingService.createRating(this.newRatingData)
      .subscribe({
        next: (rating) => {
          console.log('Valoración creada:', rating);
          this.ratings.unshift(rating);
          this.filteredRatings = [...this.ratings];
          this.closeCreateModal();
          this.loading = false;
          this.loadRatings(); // Recargar para actualizar paginación
          alert('Valoración creada exitosamente!');
        },
        error: (error) => {
          console.error('Error creando valoración:', error);
          this.loading = false;
          let errorMessage = 'Error creando valoración: ';
          
          if (error.status === 400 && error.error?.error === 'Ya has valorado este evento') {
            errorMessage += 'Ya has valorado este evento anteriormente.';
          } else {
            errorMessage += error.error?.message || 'Error desconocido';
          }
          
          alert(errorMessage);
        }
      });
  }

  // --- MODALES PARA EDITAR VALORACIÓN ---
  openEditModal(rating: Rating): void {
    console.log('Abriendo modal de edición para:', rating._id);
    this.selectedRating = rating;
    this.editedRatingData = {
      score: rating.score,
      comment: rating.comment
    };
    this.isEditModalOpen = true;
  }

  closeEditModal(): void {
    console.log('Cerrando modal de edición');
    this.isEditModalOpen = false;
    this.selectedRating = null;
    this.editedRatingData = {};
  }

  submitEdit(): void {
    if (!this.selectedRating || !this.selectedRating._id) {
      alert('Error: No se ha seleccionado ninguna valoración para editar');
      return;
    }

    console.log('Enviando edición de valoración:', this.editedRatingData);

    if (this.editedRatingData.score && (this.editedRatingData.score < 1 || this.editedRatingData.score > 5)) {
      alert('La puntuación debe estar entre 1 y 5');
      return;
    }

    this.loading = true;
    this.ratingService.updateRating(this.selectedRating._id, this.editedRatingData)
      .subscribe({
        next: (updatedRating) => {
          console.log('Valoración actualizada:', updatedRating);
          // Actualizar en la lista local
          const index = this.ratings.findIndex(r => r._id === this.selectedRating!._id);
          if (index !== -1) {
            this.ratings[index] = { ...this.ratings[index], ...updatedRating };
            this.filteredRatings = [...this.ratings];
          }
          this.closeEditModal();
          this.loading = false;
          alert('Valoración actualizada exitosamente!');
        },
        error: (error) => {
          console.error('Error actualizando valoración:', error);
          this.loading = false;
          alert('Error actualizando valoración: ' + (error.error?.message || 'Error desconocido'));
        }
      });
  }

  // --- MODAL PARA VER DETALLES ---
  openViewModal(rating: Rating): void {
    console.log('Abriendo modal de detalles para:', rating._id);
    this.selectedRating = rating;
    this.isViewModalOpen = true;
  }

  closeViewModal(): void {
    console.log('Cerrando modal de detalles');
    this.isViewModalOpen = false;
    this.selectedRating = null;
  }

  // --- ELIMINAR VALORACIÓN ---
  deleteRating(rating: Rating): void {
    if (!rating._id) {
      alert('Error: Valoración no válida');
      return;
    }

    const confirmDelete = confirm(`¿Estás seguro de que quieres eliminar la valoración de ${rating.username}?`);
    if (!confirmDelete) return;

    console.log('🗑️ Eliminando valoración:', rating._id);
    this.ratingService.deleteRating(rating._id)
      .subscribe({
        next: (response) => {
          console.log('Valoración eliminada:', response);
          this.ratings = this.ratings.filter(r => r._id !== rating._id);
          this.filteredRatings = this.filteredRatings.filter(r => r._id !== rating._id);
          this.loadRatings(); // Recargar para actualizar paginación
          alert('Valoración eliminada exitosamente!');
        },
        error: (error) => {
          console.error('Error eliminando valoración:', error);
          alert('Error eliminando valoración: ' + (error.error?.message || 'Error desconocido'));
        }
      });
  }

  // --- PAGINACIÓN ---
  nextPage(): void {
    if (this.pagination.hasMore) {
      console.log('➡️ Siguiente página');
      this.pagination.skip += this.pagination.limit;
      this.loadRatings();
    }
  }

  prevPage(): void {
    if (this.pagination.skip > 0) {
      console.log('⬅️ Página anterior');
      this.pagination.skip = Math.max(0, this.pagination.skip - this.pagination.limit);
      this.loadRatings();
    }
  }

  // --- VALIDACIÓN ---
  private validateRatingData(ratingData: Partial<Rating>): boolean {
  console.log('Validating data:', ratingData);
  
  if (!ratingData.event || !ratingData.username || !ratingData.score) {
    alert('Please complete all required fields: Event, Username and Rating');
    return false;
  }
  
  // Asegurarse de que event y username no estén vacíos
  if (ratingData.event.toString().trim() === '' || ratingData.username.trim() === '') {
    alert('Please complete all required fields: Event, Username and Rating');
    return false;
  }
  
  if (ratingData.score < 1 || ratingData.score > 5) {
    alert('Rating must be between 1 and 5');
    return false;
  }
  
  return true;
}

  // --- FORMATEO DE FECHAS ---
  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Fecha inválida';
    }
  }

  // // --- OBTENER ID CORTO ---
  // getShortId(fullId: string | undefined): string {
  //   if (!fullId) return 'N/A';
  //   return fullId.substring(0, 8) + '...';
  // }

  // Reemplazar el método getShortId existente
  getShortId(fullId: any): string {
    if (!fullId) return 'N/A';
    
    // Si es un objeto, extraer el _id
    if (typeof fullId === 'object' && fullId._id) {
      return fullId._id.substring(0, 8) + '....';
    }
    
    // Si ya es string
    if (typeof fullId === 'string') {
      return fullId.substring(0, 8) + '....';
    }
    
    return 'N/A';
  }

  // --- GENERAR ESTRELLAS ---
  generateStars(score: number): string {
    return '★'.repeat(score) + '☆'.repeat(5 - score);
  }
}