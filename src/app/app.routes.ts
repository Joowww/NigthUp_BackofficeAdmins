import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { HomeComponent } from './components/home/home.component';
import { UsersDatabaseComponent } from './components/users-database/users-database.component';
import { ConnectedUsersComponent } from './components/connected-users/connected-users.component';
import { OrganizedEventsComponent } from './components/organized-events/organized-events.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'home', component: HomeComponent },
  { path: 'users', component: UsersDatabaseComponent },
  { path: 'connected-users', component: ConnectedUsersComponent },
  { path: 'organized-events', component: OrganizedEventsComponent },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' }
];