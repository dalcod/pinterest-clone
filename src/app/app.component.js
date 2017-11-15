"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var core_1 = require("@angular/core");
var router_1 = require("@angular/router");
var forms_1 = require("@angular/forms");
var user_service_1 = require("./user.service");
var search_service_1 = require("./search.service");
var AppComponent = (function () {
    function AppComponent(userService, router, searchService) {
        var _this = this;
        this.userService = userService;
        this.router = router;
        this.searchService = searchService;
        this.displayName = '';
        this.show = false;
        this.search = new forms_1.FormControl();
        // effetua sottoscrizione all'observer 'displayName$' ogni volta che il 'displayName' cambiarà il valore della proprietà 'displayNmae' cambirà a sua volta, e così anche il nome visializzato nella barra di navigazione.
        this.userService.displayName$.subscribe(function (name) {
            _this.displayName = name;
        });
    }
    AppComponent.prototype.ngOnDestroy = function () {
        this.subscription.unsubscribe();
    };
    AppComponent.prototype.loggedIn = function () {
        return this.userService.isLoggedIn();
    };
    AppComponent.prototype.logout = function () {
        // è necessario impostare la proprietà direttamente altrimenti se l'utente rieffetua il login dopo un logout il tooltip rimane visibile.
        this.show = false;
        this.userService.logout();
        this.router.navigate(['/home']);
    };
    // se la pagina in cui siamo è la 'home' alla sottomissione del termine passa quest'ultimo al servizio 'searchService' che lo passerà a sua volta al componente relativo.
    AppComponent.prototype.submitSearch = function () {
        this.router.navigate(['/home']);
        this.searchService.sendInputTerm(this.search.value);
        // nel caso la pagin in cui siamo non sia la 'home' salva il termine nella variabile 'searchTerm'.
        this.searchService.searchTerm = this.search.value;
        // resetta campo input
        this.search = new forms_1.FormControl();
    };
    // alla pressione del tasto 'enter' invoca la funzione 'submitSearch' e quindi effetua la ricerca. 
    AppComponent.prototype.keypress = function (e) {
        if (e.key === 'Enter') {
            this.submitSearch();
        }
    };
    // naviga al nostro profilo utente, la funzione è necessaria perchè il 'routerLink' non funziona con parametri dinamici, e ne nostro caso ci serve inserire l'username nella URL.
    AppComponent.prototype.navigate = function (comp) {
        var username = this.userService.getMyUsername();
        if (comp === 'profile') {
            this.router.navigate(['/profile', username]);
        }
    };
    // mostra o nascondi il tooltip che mostra le opzioni per profile/account 'settings' e 'logout'.
    AppComponent.prototype.showTooltip = function (val) {
        this.show = val;
    };
    return AppComponent;
}());
__decorate([
    core_1.HostListener('keypress', ['$event']),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AppComponent.prototype, "keypress", null);
AppComponent = __decorate([
    core_1.Component({
        selector: 'app-root',
        templateUrl: './app.component.html',
        styleUrls: ['./app.component.css']
    }),
    __metadata("design:paramtypes", [user_service_1.UserService, router_1.Router, search_service_1.SearchService])
], AppComponent);
exports.AppComponent = AppComponent;
//# sourceMappingURL=app.component.js.map