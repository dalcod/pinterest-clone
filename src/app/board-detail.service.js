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
var http_1 = require("@angular/http");
var router_1 = require("@angular/router");
var Subject_1 = require("rxjs/Subject");
require("rxjs/add/operator/catch");
require("rxjs/add/operator/toPromise");
var BoardDetailService = (function () {
    function BoardDetailService(http, router) {
        this.http = http;
        this.router = router;
        this.header = new http_1.Headers({ 'Content-Type': 'application/json' });
        // observable che gestisce la visualizzazione del componente 'mamage-image-form'.
        this.mngImgsFormVisibilitySource = new Subject_1.Subject();
        this.mngImgsFormVisibility$ = this.mngImgsFormVisibilitySource.asObservable();
        // observable che gestisce la visualizzazione del componente 'update-board-form'.
        this.updateBoardFormVisibilitySource = new Subject_1.Subject();
        this.updateBoardFormVisibility$ = this.updateBoardFormVisibilitySource.asObservable();
    }
    BoardDetailService.prototype.handleError = function (error) {
        var errMsg;
        var obj;
        if (error instanceof http_1.Response) {
            errMsg = error.status + ' - ' + error.statusText;
        }
        return Promise.reject(errMsg);
    };
    BoardDetailService.prototype.showMngImgsForm = function (val) {
        this.mngImgsFormVisibilitySource.next(val);
    };
    BoardDetailService.prototype.showUpdateBoardForm = function (val) {
        this.updateBoardFormVisibilitySource.next(val);
    };
    BoardDetailService.prototype.addImage = function (img, boardTitle) {
        var username = localStorage.getItem('username');
        var method = localStorage.getItem('method');
        var obj = { img: img,
            boardTitle: boardTitle,
            username: username,
            method: method };
        return this.http.post('/add-image', JSON.stringify(obj), { headers: this.header })
            .toPromise()
            .then(function (res) { return true; })
            .catch(this.handleError);
    };
    BoardDetailService.prototype.moveImages = function (imgsArr, currBoardTitle, nextBoardTitle) {
        var username = localStorage.getItem('username');
        var method = localStorage.getItem('method');
        var obj = { imgsArr: imgsArr,
            currBoardTitle: currBoardTitle,
            nextBoardTitle: nextBoardTitle,
            username: username,
            method: method };
        return this.http.put('/move-images', JSON.stringify(obj), { headers: this.header })
            .toPromise()
            .then(function (res) { return true; })
            .catch(this.handleError);
    };
    BoardDetailService.prototype.copyImages = function (imgsArr, nextBoardTitle) {
        var username = localStorage.getItem('username');
        var method = localStorage.getItem('method');
        var obj = { imgsArr: imgsArr,
            nextBoardTitle: nextBoardTitle,
            username: username,
            method: method };
        return this.http.post('/copy-images', JSON.stringify(obj), { headers: this.header })
            .toPromise()
            .then(function (res) { return true; })
            .catch(this.handleError);
    };
    BoardDetailService.prototype.deleteImages = function (imgsArr, boardTitle) {
        var username = localStorage.getItem('username');
        var method = localStorage.getItem('method');
        var obj = { imgsArr: imgsArr,
            boardTitle: boardTitle,
            username: username,
            method: method };
        return this.http.put('/delete-images', JSON.stringify(obj), { headers: this.header })
            .toPromise()
            .then(function (res) { return true; })
            .catch(this.handleError);
    };
    BoardDetailService.prototype.updateImage = function (img, boardTitle) {
        var username = localStorage.getItem('username');
        var method = localStorage.getItem('method');
        var obj = { img: img,
            boardTitle: boardTitle,
            username: username,
            method: method };
        return this.http.put('/update-image', JSON.stringify(obj), { headers: this.header })
            .toPromise()
            .then(function (res) { return console.log('updated'); })
            .catch(this.handleError);
    };
    // funzione, come quelle successive che contiene una promise con al suo interno a sua volta una funzione ricorsiva la quale in base alla classe dell'elemento segnala al componente che consuma questa funzionalità se l'elemnto è da nascondere o meno.
    BoardDetailService.prototype.hideAddBoardsForms = function (e, showProp) {
        return new Promise(function (resolve, reject) {
            var domElem = e.target;
            var findElemByClass = function (thisElem, _class) {
                return Array.prototype.indexOf.call(thisElem.classList, _class) !== -1;
            };
            if (!showProp || findElemByClass(domElem, 'add-pun-window')) {
                resolve(true);
            }
            var parent = function (currElem) {
                if (currElem.localName === 'html') {
                    resolve(false);
                }
                var p = currElem.parentElement;
                if (findElemByClass(currElem, 'add-board-form') || findElemByClass(currElem, 'fa-circle') || findElemByClass(currElem, 'fa-plus-circle')) {
                    resolve(true);
                }
                else {
                    parent(p);
                }
            };
            parent(e.target);
        });
    };
    BoardDetailService.prototype.hideFormOptions = function (e, showProp) {
        return new Promise(function (resolve, reject) {
            var domElem = e.target;
            var findElemByClass = function (thisElem, _class) {
                return Array.prototype.indexOf.call(thisElem.classList, _class) !== -1;
            };
            if (!showProp) {
                resolve(true);
            }
            var parent = function (currElem) {
                if (currElem.localName === 'html') {
                    resolve(false);
                }
                var p = currElem.parentElement;
                if (findElemByClass(currElem, 'form-group')) {
                    resolve(true);
                }
                else {
                    parent(p);
                }
            };
            parent(e.target);
        });
    };
    BoardDetailService.prototype.hideAddImgDetailsForm = function (e, showProp) {
        return new Promise(function (resolve, reject) {
            var domElem = e.target;
            var findElemByClass = function (thisElem, _class) {
                return Array.prototype.indexOf.call(thisElem.classList, _class) !== -1;
            };
            if (!showProp) {
                resolve(true);
            }
            var parent = function (currElem) {
                if (findElemByClass(currElem, 'click-out')) {
                    resolve(false);
                }
                var p = currElem.parentElement;
                if (findElemByClass(currElem, 'stop')) {
                    resolve(true);
                }
                else {
                    parent(p);
                }
            };
            parent(e.target);
        });
    };
    return BoardDetailService;
}());
BoardDetailService = __decorate([
    core_1.Injectable(),
    __metadata("design:paramtypes", [http_1.Http, router_1.Router])
], BoardDetailService);
exports.BoardDetailService = BoardDetailService;
//# sourceMappingURL=board-detail.service.js.map