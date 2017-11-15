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
require("rxjs/add/operator/catch");
require("rxjs/add/operator/toPromise");
var ProfileService = (function () {
    function ProfileService(http, router) {
        this.http = http;
        this.router = router;
        this.header = new http_1.Headers({ 'Content-Type': 'application/json' });
    }
    ProfileService.prototype.handleError = function (error) {
        var errMsg;
        var obj;
        if (error instanceof http_1.Response) {
            if (error.status === 401 && error.statusText !== 'Unauthorized') {
                errMsg = error.statusText;
                obj = { user: errMsg };
            }
            else {
                errMsg = error.status + ' - ' + error.statusText;
                obj = { http: errMsg };
            }
        }
        return Promise.reject(obj);
    };
    ProfileService.prototype.addBoard = function (board) {
        var username = localStorage.getItem('username');
        var method = localStorage.getItem('method');
        return this.http.post('/board', JSON.stringify({ board: board, username: username, method: method }), { headers: this.header })
            .toPromise()
            .then(function (res) { return true; })
            .catch(this.handleError);
    };
    ProfileService.prototype.updateBoard = function (board, oldTitle) {
        var username = localStorage.getItem('username');
        var method = localStorage.getItem('method');
        var obj = { board: board,
            oldTitle: oldTitle,
            username: username,
            method: method };
        return this.http.put('/board', JSON.stringify(obj), { headers: this.header })
            .toPromise()
            .then(function (res) { return true; })
            .catch(this.handleError);
    };
    ProfileService.prototype.removeBoard = function (board) {
        var username = localStorage.getItem('username');
        var method = localStorage.getItem('method');
        return this.http.put('/remove/board', JSON.stringify({ board: board, username: username, method: method }), { headers: this.header })
            .toPromise()
            .then(function (res) { return null; })
            .catch(this.handleError);
    };
    ProfileService.prototype.boardExist = function (boards, board) {
        var exist = false;
        boards.forEach(function (elem, i) {
            if (elem.title === board.title) {
                exist = true;
            }
        });
        return exist;
    };
    ProfileService.prototype.deleteBoardFromArray = function (boards, selB) {
        boards.forEach(function (elem, i) {
            if (elem.title === selB.title) {
                boards.splice(i, 1);
            }
        });
        boards.filter(function (elem) { return elem.title !== selB.title; });
        return boards;
    };
    ProfileService.prototype.hideAddBoardsForms = function (e, elem) {
        return new Promise(function (resolve, reject) {
            // alternativa all'utilizzare i "prototype" è l'espressione "Array.from(e.target.classList).indexOf('fa-pencil')" purtroppo però il metodo ".from()" non è un metodo standard ma è specifico di "ES6" e non viene convertito da typescript in "ES5".
            var domElem = e.target;
            var findElemByClass = function (thisElem, _class) {
                return Array.prototype.indexOf.call(thisElem.classList, _class) !== -1;
            };
            // se il form è già nascosto oppure abbiamo cliccato sull'icona "fa-pencil", la quale è adibita a mostrare il form, ritorna senza apportare modifiche.
            if ((!elem.show1 && !elem.show2) || findElemByClass(domElem, 'add-board-window')) {
                resolve(true);
            }
            var parent = function (currElem) {
                // se la funzione non riesce a trovare un elemento DOM padre con classe ".form-row" o "add-board-form" e quindi arriva al nodo "body" nascondi il form e ritorna.
                if (currElem.localName === 'html') {
                    resolve(false);
                }
                var p = currElem.parentElement;
                // se la funzione ricorsiva nel suo percorso a ritroso tra gli elementi padre incontra un elemento con classe ".form-row" lascia l'elemento visibile e ritorna senza apportare modifiche.
                if (findElemByClass(p, 'add-board-form') || findElemByClass(currElem, 'add-board-form')) {
                    resolve(true);
                }
                else {
                    parent(p);
                }
            };
            parent(e.target);
        });
    };
    return ProfileService;
}());
ProfileService = __decorate([
    core_1.Injectable(),
    __metadata("design:paramtypes", [http_1.Http, router_1.Router])
], ProfileService);
exports.ProfileService = ProfileService;
//# sourceMappingURL=profile.service.js.map