import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-organized-events',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './organized-events.component.html',
  styleUrls: ['./organized-events.component.css']
})
export class OrganizedEventsComponent {
  viewMode: 'grid' | 'list' = 'grid';

  mockEvents = [
    { 
      id: 1, 
      name: 'Neon Nights Party', 
      venue: 'Club Noctis', 
      date: '2024-10-15', 
      time: '22:00', 
      attendees: 245, 
      capacity: 500,
      status: 'Active',
      organizer: 'Maria Garcia'
    },
    { 
      id: 2, 
      name: 'Techno Underground', 
      venue: 'The Warehouse', 
      date: '2024-10-18', 
      time: '23:00', 
      attendees: 189, 
      capacity: 300,
      status: 'Active',
      organizer: 'DJ Master'
    },
    { 
      id: 3, 
      name: 'Latin Vibes Night', 
      venue: 'Salsa Club', 
      date: '2024-10-20', 
      time: '21:00', 
      attendees: 412, 
      capacity: 600,
      status: 'Active',
      organizer: 'Carlos Lopez'
    },
    { 
      id: 4, 
      name: 'House Music Session', 
      venue: 'Rhythm Bar', 
      date: '2024-10-12', 
      time: '22:30', 
      attendees: 156, 
      capacity: 200,
      status: 'Completed',
      organizer: 'Ana Martinez'
    },
  ];
}