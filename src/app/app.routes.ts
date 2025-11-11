import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { HomeComponent } from './components/home/home.component';
import { UsersDatabaseComponent } from './components/users-database/users-database.component';
import { ConnectedUsersComponent } from './components/connected-users/connected-users.component';
import { OrganizedEventsComponent } from './components/organized-events/organized-events.component';
import { RatingsComponent } from './components/ratings.component/ratings.component';
import { AuthGuard } from './guards/auth.guard';
import { AdminGuard } from './guards/admin.guard';
import { TagsComponent } from './components/tags.component/tags.component';
import { UserInterestsComponent } from './components/user-interests.component/user-interests.component';
import { UserTrustComponent } from './components/user-trust.component/user-trust.component';

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
    path: 'connected-users', 
    component: ConnectedUsersComponent,
    canActivate: [AuthGuard, AdminGuard]
  },
  { 
    path: 'organized-events', 
    component: OrganizedEventsComponent,
    canActivate: [AuthGuard]
  },
  { 
    path: 'ratings', 
    component: RatingsComponent,
    canActivate: [AuthGuard]
  },
  { path: 'tags', component: TagsComponent, canActivate: [AuthGuard] },
  { path: 'user-interests', component: UserInterestsComponent, canActivate: [AuthGuard] },
  { path: 'user-trust', component: UserTrustComponent, canActivate: [AuthGuard] },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' }
];