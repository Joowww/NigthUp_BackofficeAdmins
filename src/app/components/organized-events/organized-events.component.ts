import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EventService, EventsResponse } from '../../services/event.service';
import { IEvent } from '../../models/event';

// Interfaz para la ubicación GeoJSON
interface Location {
  type: string;
  coordinates: [number, number];
}

@Component({
  selector: 'app-organized-events',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './organized-events.component.html',
  styleUrls: ['./organized-events.component.css']
})
export class OrganizedEventsComponent implements OnInit {
  viewMode: 'grid' | 'list' = 'grid';
  events: IEvent[] = [];
  loading = false;

  // Paginación
  pagination = {
    skip: 0,
    limit: 10,
    total: 0,
    hasMore: false
  };

  // Variables para estadísticas reales
  eventStats = {
    total: 0,
    active: 0,
    attendees: 0,
    attendanceRate: 0
  };

  // Variables para modales
  isCreateModalOpen = false;
  isEditModalOpen = false;
  isViewModalOpen = false;
  selectedEvent: IEvent | null = null;

  // Datos para formularios - ACTUALIZADO con Location
  newEventData: Partial<IEvent> = {
    name: '',
    schedule: '',
    location: {
      type: 'Point',
      coordinates: [0, 0] // [longitude, latitude]
    },
    description: '',
    category: '',
    capacity: 100,
    price: 0,
    active: true
  };

  editedEventData: Partial<IEvent> = {};

  // Campos temporales para los formularios
  tempLatitude: number = 0;
  tempLongitude: number = 0;
  tempEditLatitude: number = 0;
  tempEditLongitude: number = 0;

  constructor(private eventService: EventService) { }

  ngOnInit(): void {
    this.loadEvents();
    this.calculateStats();
  }

  // Cargar eventos paginados
  loadEvents(skip: number = this.pagination.skip): void {
    this.loading = true;
    this.eventService.getAllEvents(skip, this.pagination.limit).subscribe({
      next: (response: EventsResponse) => {
        this.events = response.events;
        this.pagination = {
          ...response.pagination,
          skip: skip
        };
        this.calculateStats();
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error loading events:', error);
        this.loading = false;
        alert('Error loading events: ' + (error.error?.message || error.message));
      }
    });
  }

  nextPage(): void {
    if (this.pagination.hasMore) {
      this.loadEvents(this.pagination.skip + this.pagination.limit);
    }
  }

  prevPage(): void {
    if (this.pagination.skip > 0) {
      this.loadEvents(this.pagination.skip - this.pagination.limit);
    }
  }

  // ✅ Calcular estadísticas reales
  calculateStats(): void {
    this.eventStats.total = this.events.length;
    this.eventStats.active = this.events.filter(event => event.active).length;

    // Calcular total de asistentes
    this.eventStats.attendees = this.events.reduce((total, event) =>
      total + (event.participants?.length || 0), 0
    );

    // Calcular tasa de asistencia promedio
    const totalCapacity = this.events.reduce((total, event) => total + (event.capacity || 0), 0);
    this.eventStats.attendanceRate = totalCapacity > 0 ?
      Math.round((this.eventStats.attendees / totalCapacity) * 100) : 0;
  }

  // ✅ MODALES PARA CREAR EVENTO
  openCreateModal(): void {
    this.newEventData = {
      name: '',
      schedule: '',
      location: {
        type: 'Point',
        coordinates: [0, 0]
      },
      description: '',
      category: '',
      capacity: 100,
      price: 0,
      active: true
    };
    this.tempLatitude = 0;
    this.tempLongitude = 0;
    this.isCreateModalOpen = true;
  }

  closeCreateModal(): void {
    this.isCreateModalOpen = false;
    this.newEventData = {};
  }

  submitCreate(): void {
    // Asignar las coordenadas desde los campos temporales
    if (this.newEventData.location) {
      this.newEventData.location.coordinates = [this.tempLongitude, this.tempLatitude];
    }

    if (!this.validateEventData(this.newEventData)) return;

    this.loading = true;
    this.eventService.createEvent(this.newEventData as IEvent).subscribe({
      next: (event: IEvent) => {
        this.events.unshift(event);
        this.calculateStats();
        this.closeCreateModal();
        this.loading = false;
        alert('Event created successfully!');
      },
      error: (error: any) => {
        console.error('Error creating event:', error);
        this.loading = false;

        let errorMessage = 'Error creating event: ';
        if (error.status === 403) {
          errorMessage += 'Admin privileges required. Only administrators can create events.';
        } else if (error.status === 401) {
          errorMessage += 'You are not authorized. Please login again.';
        } else {
          errorMessage += error.error?.message || error.message;
        }

        alert(errorMessage);
      }
    });
  }

  // ✅ MODALES PARA EDITAR EVENTO
  openEditModal(event: IEvent): void {
    this.selectedEvent = event;
    this.editedEventData = {
      name: event.name,
      schedule: this.formatDateForInput(event.schedule as string),
      location: event.location,
      description: event.description,
      category: event.category,
      capacity: event.capacity,
      price: event.price,
      active: event.active
    };

    // Establecer las coordenadas temporales para edición
    if (event.location && event.location.coordinates) {
      this.tempEditLongitude = event.location.coordinates[0];
      this.tempEditLatitude = event.location.coordinates[1];
    } else {
      this.tempEditLongitude = 0;
      this.tempEditLatitude = 0;
    }

    this.isEditModalOpen = true;
  }

  closeEditModal(): void {
    this.isEditModalOpen = false;
    this.selectedEvent = null;
    this.editedEventData = {};
  }

  submitEdit(): void {
    if (!this.selectedEvent || !this.selectedEvent._id) return;

    // Asignar las coordenadas desde los campos temporales
    this.editedEventData.location = {
      type: 'Point',
      coordinates: [this.tempEditLongitude, this.tempEditLatitude]
    };

    if (!this.validateEventData(this.editedEventData)) return;

    this.loading = true;
    this.eventService.updateEvent(this.selectedEvent._id, this.editedEventData as IEvent).subscribe({
      next: (updatedEvent: IEvent) => {
        const index = this.events.findIndex(e => e._id === this.selectedEvent!._id);
        if (index !== -1) {
          this.events[index] = { ...this.events[index], ...updatedEvent };
        }
        this.calculateStats();
        this.closeEditModal();
        this.loading = false;
        alert('Event updated successfully!');
      },
      error: (error: any) => {
        console.error('Error updating event:', error);
        this.loading = false;

        let errorMessage = 'Error updating event: ';
        if (error.status === 403) {
          errorMessage += 'Admin or manager privileges required.';
        } else if (error.status === 401) {
          errorMessage += 'You are not authorized. Please login again.';
        } else {
          errorMessage += error.error?.message || error.message;
        }

        alert(errorMessage);
      }
    });
  }

  // ✅ MODAL PARA VER DETALLES
  openViewModal(event: IEvent): void {
    this.selectedEvent = event;
    this.isViewModalOpen = true;
  }

  closeViewModal(): void {
    this.isViewModalOpen = false;
    this.selectedEvent = null;
  }

  // ✅ VALIDACIÓN DE DATOS
  private validateEventData(eventData: any): boolean {
    if (!eventData.name || !eventData.schedule || !eventData.location ||
      !eventData.description || !eventData.category) {
      alert('Please fill all required fields: Name, Schedule, Location, Description, Category');
      return false;
    }
    return true;
  }

  // ✅ FORMATEO DE FECHAS PARA DISPLAY
  formatDate(dateVal: string | Date | undefined): string {
    if (!dateVal) return 'N/A';
    try {
      const date = new Date(dateVal);
      return date.toLocaleDateString('en-GB', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Invalid Date';
    }
  }

  // ✅ FORMATEO DE FECHAS PARA INPUT
  formatDateForInput(dateVal: string | Date | undefined): string {
    if (!dateVal) return '';
    try {
      const date = new Date(dateVal);
      return date.toISOString().slice(0, 16);
    } catch {
      return '';
    }
  }

  // ✅ CALCULAR PORCENTAJE DE ASISTENCIA
  getAttendancePercentage(event: IEvent): number {
    const participants = event.participants?.length || 0;
    const capacity = event.capacity || 1;
    return Math.round((participants / capacity) * 100);
  }

  // ✅ OBTENER ESTADO DEL EVENTO
  getEventStatus(event: IEvent): string {
    if (!event.active) return 'Cancelled';

    const eventDate = new Date(event.schedule);
    const now = new Date();

    if (eventDate < now) return 'Completed';
    return 'Active';
  }

  // ✅ OBTENER DIRECCIÓN LEGIBLE DESDE COORDENADAS
  getReadableLocation(event: IEvent): string {
    if (!event.location || !event.location.coordinates) {
      return 'Location not available';
    }

    const [lng, lat] = event.location.coordinates;
    return `Lat: ${lat?.toFixed(4)}, Lng: ${lng?.toFixed(4)}`;
  }
}