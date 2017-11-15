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
var common_1 = require("@angular/common");
var user_service_1 = require("./user.service");
require("rxjs/add/operator/switchMap");
var ImageDetailsComponent = (function () {
    function ImageDetailsComponent(userService, location, route) {
        var _this = this;
        this.userService = userService;
        this.location = location;
        this.route = route;
        this.showSaveImgComp2 = false;
        this.subscription = userService.saveImgComp$.subscribe(function (val) { return _this.showSaveImgComp2 = val; });
    }
    ImageDetailsComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.img = this.userService.shownImg;
        this.route.paramMap.switchMap(function (params) {
            _this.parentComp = params.get('component');
            if (_this.parentComp === 'all-imgs') {
                // la proprietà è consumata dal componente figlio "save-img"
                _this.boards = _this.userService.myBoards;
                _this.imgs = _this.userService.imgs.filter(function (img) { return img.source === true; });
                // questa funzione serve a trovare l'indice dell'immagine che abbiamo selezionato all'interno dell'array contenente tutte le immagini, im modo tale da poter implementare la feature tipo slider cliccando sull'icona "prev" o "next image".
                _this.imgs.forEach(function (elem, i) {
                    if (elem._id === _this.img._id) {
                        _this.currIndex = i;
                    }
                });
            }
            if (_this.parentComp === 'profile') {
                _this.boards = _this.userService.myBoards;
                _this.imgs = _this.userService.getAllMyImgs();
                _this.imgs.forEach(function (elem, i) {
                    if (elem._id === _this.img._id) {
                        _this.currIndex = i;
                    }
                });
            }
            // è uguale alla condizione 'profile'
            if (_this.parentComp === 'board-detail') {
                _this.boards = _this.userService.myBoards;
                _this.imgs = _this.userService.getAllMyImgs();
                _this.imgs.forEach(function (elem, i) {
                    if (elem._id === _this.img._id) {
                        _this.currIndex = i;
                    }
                });
            }
            return _this.imgs;
        }).subscribe(function () { return null; });
    };
    ImageDetailsComponent.prototype.processUrl = function (url) {
        return this.userService.processUrl(url);
    };
    // le due funzioni utilizzano il valore della proprietà 'currIndex' trovata all'interno della funzione 'ngOnInit' per capire se passare alla immagine precedente o successiva al click dell'icona corrispondente alle due funzioni.
    ImageDetailsComponent.prototype.nextImage = function () {
        if (this.currIndex < this.imgs.length - 1) {
            this.currIndex++;
            this.img = this.imgs[this.currIndex];
        }
        else {
            return;
        }
    };
    ImageDetailsComponent.prototype.prevImage = function () {
        if (this.currIndex > 0) {
            this.currIndex--;
            this.img = this.imgs[this.currIndex];
        }
        else {
            return;
        }
    };
    // al click-out del componente o al click sull'icona a forma di 'x' torna alla pagina precedente.
    ImageDetailsComponent.prototype.goBack = function (e) {
        // al clickout cerca l'elemento con classe 'click-out' e torna indietro.
        if (e) {
            var findElemByClass = function (thisElem, _class) {
                return Array.prototype.indexOf.call(thisElem.classList, _class) !== -1;
            };
            if (findElemByClass(e.target, 'click-out')) {
                this.location.back();
            }
            return;
        }
        this.location.back();
    };
    // mostra il componente save-image
    ImageDetailsComponent.prototype.showSaveImgComp = function () {
        this.showSaveImgComp2 = true;
    };
    return ImageDetailsComponent;
}());
ImageDetailsComponent = __decorate([
    core_1.Component({
        selector: 'img-details',
        templateUrl: './img-details.component.html',
        styleUrls: ['./img-details.component.css']
    }),
    __metadata("design:paramtypes", [user_service_1.UserService,
        common_1.Location,
        router_1.ActivatedRoute])
], ImageDetailsComponent);
exports.ImageDetailsComponent = ImageDetailsComponent;
//# sourceMappingURL=img-details.component.js.map