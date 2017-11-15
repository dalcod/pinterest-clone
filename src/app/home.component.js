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
var user_service_1 = require("./user.service");
var search_service_1 = require("./search.service");
var HomeComponent = (function () {
    function HomeComponent(router, userService, searchService) {
        var _this = this;
        this.router = router;
        this.userService = userService;
        this.searchService = searchService;
        this.showSaveImgComp = false;
        this.nothingFound = false;
        this.myOptions = {
            itemSelector: '.pun-frame',
            columnWidth: 15
        };
        // osserva lo stato di visualizzazione dell'elemento 'save-image'.
        this.subscription = userService.saveImgComp$.subscribe(function (val) { return _this.showSaveImgComp = val; });
        // osserva se un termine viene cercato.
        this.subscription2 = searchService.inputTerm$.subscribe(function (term) {
            _this.searchTerm = term;
            _this.searchImgs(_this.searchTerm);
        });
        // ossreva se un errore nel componenete figlio 'login' viene emesso e se sì assegna il valore alla proprietà 'httpErr'.
        this.subscription3 = userService.handleError$.subscribe(function (err) { return _this.httpErr = err; });
    }
    HomeComponent.prototype.ngOnInit = function () {
        var _this = this;
        // se l'utente è loggato 
        if (this.loggedIn()) {
            // ottieni tutte le immagini e filtrale invocando il metodo 'serchImgs()' nel caso sia stato rilevato un termine di ricerca, oppure filtrale in base al codice sorgente.
            this.userService.getAllImgs()
                .then(function (res) {
                // se la ricerca è stata effettuata al di fuori del componente 'home'
                if (!_this.searchTerm && _this.searchService.searchTerm) {
                    _this.searchTerm = _this.searchService.searchTerm;
                    _this.searchImgs(_this.searchTerm);
                    return;
                }
                _this.imgs = _this.userService.imgs.filter(function (img) { return img.source === true; });
            }, function (err) { return _this.httpErr = err; });
            // la proprietà è consumata dal componente figlio "save-img"
            this.boards = this.userService.myBoards;
        }
    };
    HomeComponent.prototype.ngOnDestroy = function () {
        this.subscription.unsubscribe();
        this.subscription2.unsubscribe();
        this.subscription3.unsubscribe();
    };
    // ogni qual volta che sottomettiamo un termine nel campo input di ricerca questo viene passato a questa funzione che lo trasformerà in una nuova regular expression e filtrerà l'array 'imgs' in base a quest'ultima per trovare le immagini nella cui descrizione vi sia inserito un termine come quello cercato. Nel caso non sia stato trovato niente notificalo all'utente. alla fine resetta le proprietà in cui è stato precedentemente inserito il termine.
    HomeComponent.prototype.searchImgs = function (term) {
        var regExp = new RegExp(term, 'gi');
        this.imgs = this.userService.imgs.filter(function (img) { return img.source === true && regExp.test(img.description); });
        if (!this.imgs[0]) {
            this.nothingFound = true;
        }
        this.searchTerm = '';
        this.searchService.searchTerm = '';
    };
    // cliccando sul "go back" all'interno dell'elelento 'nothingFound' nascondi il messaggio e mostra tutte le immagini sorgente.
    HomeComponent.prototype.resetImgs = function () {
        this.nothingFound = false;
        this.imgs = this.userService.imgs.filter(function (img) { return img.source === true; });
    };
    HomeComponent.prototype.navigateToDetails = function (e, img) {
        if (e.target.localName === 'div') {
            this.userService.shownImg = img;
            this.router.navigate(['/image-details', 'all-imgs']);
        }
    };
    HomeComponent.prototype.processUrl = function (url) {
        return this.userService.processUrl(url);
    };
    HomeComponent.prototype.loggedIn = function () {
        return this.userService.isLoggedIn();
    };
    // mostra il componente 'save-image'
    HomeComponent.prototype.showSaveImgComponent = function (img) {
        // invia l'immagine al componente 'save-img';
        this.img = img;
        this.showSaveImgComp = true;
    };
    return HomeComponent;
}());
HomeComponent = __decorate([
    core_1.Component({
        templateUrl: './home.component.html',
        styleUrls: ['./home.component.css']
    }),
    __metadata("design:paramtypes", [router_1.Router, user_service_1.UserService, search_service_1.SearchService])
], HomeComponent);
exports.HomeComponent = HomeComponent;
//# sourceMappingURL=home.component.js.map