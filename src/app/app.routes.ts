import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { HomeComponent } from './components/home/home.component';
import { UsersDatabaseComponent } from './components/users-database/users-database.component';
import { OrganizedEventsComponent } from './components/organized-events/organized-events.component';
import { AuthGuard } from './guards/auth.guard';
import { AdminGuard } from './guards/admin.guard';
import { BusinessManagementComponent } from './components/business-management/business-management.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: 'home',
    component: HomeComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'users',
    component: UsersDatabaseComponent,
    canActivate: [AuthGuard, AdminGuard]
  },
  {
    path: 'organized-events',
    component: OrganizedEventsComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'business-management',
    component: BusinessManagementComponent,
    canActivate: [AuthGuard, AdminGuard]
  },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' }
];
