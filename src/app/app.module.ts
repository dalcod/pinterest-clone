import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { MasonryModule } from 'angular2-masonry';

import { AppComponent } from './app.component';
import { HomeComponent } from './home.component';
import { LoginComponent } from './login.component';
import { SignupComponent } from './signup.component';
import { ProfileComponent } from './profile.component';
import { BoardDetailComponent } from './board-detail.component';
import { SaveImageComponent } from './save-img.component';
import { ImageDetailsComponent } from './img-details.component';
import { ManageImgsForm } from './forms/manage-imgs-form.component';
import { UpdateBoardForm } from './forms/update-board-form.component';
import { UserComponent } from './user.component';
import { ProfileSettingsComponent } from './profile-settings.component';
import { UserService } from './user.service';
import { ProfileService } from './profile.service';
import { SearchPipe } from './pipe-search.service';
import { PipeMaxStringLength } from './pipe-max-string-length.service';
import { LoggedInGuard } from './logged-in-guard';
import { SearchService } from './search.service';

import { RoutingModule } from './routing.module';

@NgModule({
    imports: [
        BrowserModule,
        ReactiveFormsModule,
        HttpModule,
        RoutingModule,
        MasonryModule
    ],
    declarations: [
        AppComponent,
        HomeComponent,
        SaveImageComponent,
        ImageDetailsComponent,
        LoginComponent,
        SignupComponent,
        UserComponent,
        ProfileComponent,
        BoardDetailComponent,
        ManageImgsForm,
        UpdateBoardForm,
        ProfileSettingsComponent,
        SearchPipe,
        PipeMaxStringLength,
    ],
    providers: [UserService, ProfileService, LoggedInGuard, SearchService],
    bootstrap: [AppComponent]
})
export class AppModule { }
