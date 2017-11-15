import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ProfileComponent } from './profile.component';
import { HomeComponent } from './home.component';
import { SignupComponent } from './signup.component';
import { BoardDetailComponent } from './board-detail.component';
import { ImageDetailsComponent } from './img-details.component';
import { UserComponent } from './user.component';
import { ProfileSettingsComponent } from './profile-settings.component';
import {  } from '';

import { LoggedInGuard } from './logged-in-guard';

const routes: Routes = [
    { path: 'user/:username', component: UserComponent },
    { path: 'profile/:username', component: ProfileComponent, canActivate: [LoggedInGuard]},
    { path: 'profile/:username/:board-title', component: BoardDetailComponent, canActivate: [LoggedInGuard]},
    { path: 'signup', component: SignupComponent },
    { path: 'image-details/:component', component: ImageDetailsComponent, canActivate: [LoggedInGuard] },
    { path: 'home', component: HomeComponent },
    { path: '', redirectTo: 'home', pathMatch: 'full' },
    { path: 'settings', component: ProfileSettingsComponent, canActivate: [LoggedInGuard]},
];

@NgModule({
    imports: [ RouterModule.forRoot(routes) ],
    exports: [ RouterModule ]
})

export class RoutingModule {}
