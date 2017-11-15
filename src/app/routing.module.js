"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var core_1 = require("@angular/core");
var router_1 = require("@angular/router");
var profile_component_1 = require("./profile.component");
var home_component_1 = require("./home.component");
var signup_component_1 = require("./signup.component");
var board_detail_component_1 = require("./board-detail.component");
var img_details_component_1 = require("./img-details.component");
var user_component_1 = require("./user.component");
var profile_settings_component_1 = require("./profile-settings.component");
var logged_in_guard_1 = require("./logged-in-guard");
var routes = [
    { path: 'user/:username', component: user_component_1.UserComponent },
    { path: 'profile/:username', component: profile_component_1.ProfileComponent },
    { path: 'profile/:username/:board-title', component: board_detail_component_1.BoardDetailComponent, canActivate: [logged_in_guard_1.LoggedInGuard] },
    { path: 'signup', component: signup_component_1.SignupComponent },
    { path: 'image-details/:component', component: img_details_component_1.ImageDetailsComponent },
    { path: 'home', component: home_component_1.HomeComponent },
    { path: '', redirectTo: 'home', pathMatch: 'full' },
    { path: 'settings', component: profile_settings_component_1.ProfileSettingsComponent, canActivate: [logged_in_guard_1.LoggedInGuard] },
];
var RoutingModule = (function () {
    function RoutingModule() {
    }
    return RoutingModule;
}());
RoutingModule = __decorate([
    core_1.NgModule({
        imports: [router_1.RouterModule.forRoot(routes)],
        exports: [router_1.RouterModule]
    })
], RoutingModule);
exports.RoutingModule = RoutingModule;
//# sourceMappingURL=routing.module.js.map