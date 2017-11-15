"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var platform_browser_1 = require("@angular/platform-browser");
var core_1 = require("@angular/core");
var forms_1 = require("@angular/forms");
var http_1 = require("@angular/http");
var angular2_masonry_1 = require("angular2-masonry");
var app_component_1 = require("./app.component");
var home_component_1 = require("./home.component");
var login_component_1 = require("./login.component");
var signup_component_1 = require("./signup.component");
var profile_component_1 = require("./profile.component");
var board_detail_component_1 = require("./board-detail.component");
var save_img_component_1 = require("./save-img.component");
var img_details_component_1 = require("./img-details.component");
var manage_imgs_form_component_1 = require("./forms/manage-imgs-form.component");
var update_board_form_component_1 = require("./forms/update-board-form.component");
var user_component_1 = require("./user.component");
var profile_settings_component_1 = require("./profile-settings.component");
var user_service_1 = require("./user.service");
var profile_service_1 = require("./profile.service");
var pipe_search_service_1 = require("./pipe-search.service");
var pipe_max_string_length_service_1 = require("./pipe-max-string-length.service");
var logged_in_guard_1 = require("./logged-in-guard");
var search_service_1 = require("./search.service");
var routing_module_1 = require("./routing.module");
var AppModule = (function () {
    function AppModule() {
    }
    return AppModule;
}());
AppModule = __decorate([
    core_1.NgModule({
        imports: [
            platform_browser_1.BrowserModule,
            forms_1.ReactiveFormsModule,
            http_1.HttpModule,
            routing_module_1.RoutingModule,
            angular2_masonry_1.MasonryModule
        ],
        declarations: [
            app_component_1.AppComponent,
            home_component_1.HomeComponent,
            save_img_component_1.SaveImageComponent,
            img_details_component_1.ImageDetailsComponent,
            login_component_1.LoginComponent,
            signup_component_1.SignupComponent,
            user_component_1.UserComponent,
            profile_component_1.ProfileComponent,
            board_detail_component_1.BoardDetailComponent,
            manage_imgs_form_component_1.ManageImgsForm,
            update_board_form_component_1.UpdateBoardForm,
            profile_settings_component_1.ProfileSettingsComponent,
            pipe_search_service_1.SearchPipe,
            pipe_max_string_length_service_1.PipeMaxStringLength,
        ],
        providers: [user_service_1.UserService, profile_service_1.ProfileService, logged_in_guard_1.LoggedInGuard, search_service_1.SearchService],
        bootstrap: [app_component_1.AppComponent]
    })
], AppModule);
exports.AppModule = AppModule;
//# sourceMappingURL=app.module.js.map