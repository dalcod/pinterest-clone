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
var UserService = (function () {
    function UserService(http, router) {
        this.http = http;
        this.router = router;
        this.isMyProfile = true;
        this.header = new http_1.Headers({ 'Content-Type': 'application/json' });
        // quandp disponibile invia al componente 'app' il 'displayName' che verrà visualizzato nella barra di navigazione.
        this.displayNameSource = new Subject_1.Subject();
        this.displayName$ = this.displayNameSource.asObservable();
        // observable che gestisce la visualizzazione o meno del componente 'save-image'.
        this.showSaveImgCompSrc = new Subject_1.Subject();
        this.saveImgComp$ = this.showSaveImgCompSrc.asObservable();
        this.handleErrorSrc = new Subject_1.Subject();
        this.handleError$ = this.handleErrorSrc.asObservable();
        // questa espressione è necessaria per fare in modo che l'applicazione sia informata riguardo allo stato attuale del login passando da un componente all'altro.
        this.loggedIn = !!localStorage.getItem('loggedIn');
    }
    UserService.prototype.isLoggedIn = function () {
        return this.loggedIn;
    };
    UserService.prototype.getMyUsername = function () {
        return localStorage.getItem('username');
    };
    UserService.prototype.getProfileUsername = function () {
        return this.profileUsername;
    };
    UserService.prototype.handleError = function (error) {
        var errMsg;
        var obj;
        if (error instanceof http_1.Response) {
            errMsg = error.status + ' - ' + error.statusText;
        }
        return Promise.reject(errMsg);
    };
    UserService.prototype.handleLoginErrors = function (error) {
        var errMsg;
        var httpErr;
        var errObj = {};
        if (error.status === 401 && error instanceof http_1.Response) {
            errMsg = error.status + ' - ' + error.statusText;
            errObj.errMsg = error.statusText;
        }
        if (error.status !== 401 && error instanceof http_1.Response) {
            httpErr = error.status + ' - ' + error.statusText;
            errObj.httpErr = httpErr;
        }
        console.log(errObj);
        return Promise.reject(errObj);
    };
    UserService.prototype.sendDisplayName = function (name) {
        this.displayNameSource.next(name);
    };
    UserService.prototype.showSaveImgComp = function (val) {
        this.showSaveImgCompSrc.next(val);
    };
    UserService.prototype.sendNewError = function (err) {
        this.handleErrorSrc.next(err);
    };
    UserService.prototype.getUserData = function (username) {
        var _this = this;
        return this.http.get('/userdata/' + username)
            .toPromise()
            .then(function (res) {
            var resObj = res.json();
            _this.profileUsername = resObj.accData.username;
            // determina se il profilo che siamo attualmente visualizzando sia il nostro oppure no.
            _this.isMyProfile = localStorage.getItem('username') === _this.profileUsername;
            _this.boards = resObj.boards;
            return resObj;
        }).catch(this.handleError);
    };
    UserService.prototype.setUserData = function (username) {
        var _this = this;
        return this.http.get('/userdata/' + username)
            .toPromise()
            .then(function (res) {
            var resObj = res.json();
            // impostare tutte le proprietà che contengono i dati privati dell'utente
            _this.myData = resObj.accData;
            _this.myBoards = resObj.boards;
            // invia i ldisplayName al alla barra di navigazione.
            _this.sendDisplayName(resObj.accData.displayName || resObj.accData.username);
            // imposta nel localStorage tutti quei dati che ci consentiranno di distinguere il nostro profilo da un altro, oppure se siamo loggati, o ancora tramite quale metodo ci siamo loggati.
            localStorage.setItem('loggedIn', 'true');
            localStorage.setItem('username', resObj.accData.username);
            localStorage.setItem('method', resObj.accData.method);
            _this.loggedIn = true;
            return true;
        }).catch(this.handleError);
    };
    // funzione consumnata dal componente 'home' e ritorna tutte le immagini pubbliche e sorgente di tutti i profili.
    UserService.prototype.getAllImgs = function () {
        var _this = this;
        return this.http.get('/all-imgs')
            .toPromise()
            .then(function (res) {
            var resObj = res.json();
            _this.imgs = resObj.imgs;
            return true;
        }).catch(this.handleError);
    };
    UserService.prototype.getBoard = function (title) {
        return this.boards.filter(function (elem) { return elem.title === title; });
    };
    UserService.prototype.signup = function (username, password) {
        var _this = this;
        return this.http
            .post('/signup', JSON.stringify({ username: username, password: password }), { headers: this.header })
            .toPromise()
            .then(function (res) {
            var resObj = res.json();
            if (resObj.success) {
                // stesse oprazioni effettuate con la funzione 'setUserData()'
                _this.myData = resObj.accData;
                _this.myBoards = resObj.boards;
                _this.sendDisplayName(resObj.accData.displayName || resObj.accData.username);
                localStorage.setItem('loggedIn', 'true');
                localStorage.setItem('username', resObj.accData.username);
                localStorage.setItem('method', resObj.accData.method);
                _this.loggedIn = true;
                return resObj.accData.username;
            }
            else {
                throw resObj;
            }
        }).catch(this.handleLoginErrors);
    };
    UserService.prototype.login = function (username, password) {
        var _this = this;
        return this.http
            .post('/login', JSON.stringify({ username: username, password: password }), { headers: this.header })
            .toPromise()
            .then(function (res) {
            var resObj = res.json();
            if (resObj.success) {
                // stesse oprazioni effettuate con la funzione 'setUserData()'
                _this.myData = resObj.accData;
                _this.myBoards = resObj.boards;
                _this.sendDisplayName(resObj.accData.displayName || resObj.accData.username);
                localStorage.setItem('loggedIn', 'true');
                localStorage.setItem('username', resObj.accData.username);
                localStorage.setItem('method', resObj.accData.method);
                _this.loggedIn = true;
                return resObj.accData.username;
            }
            else {
                throw resObj;
            }
        }).catch(this.handleLoginErrors);
    };
    UserService.prototype.logout = function () {
        this.loggedIn = false;
        localStorage.removeItem('loggedIn');
        localStorage.removeItem('username');
        localStorage.removeItem('mothod'),
            this.http.get('/logout');
        this.router.navigate(['/home']);
    };
    UserService.prototype.updateProfile = function (data) {
        var username = localStorage.getItem('username');
        var method = localStorage.getItem('method');
        var newData = data;
        var oldData = {
            username: username,
            method: method
        };
        return this.http.put('/update-profile', JSON.stringify({ newData: newData, oldData: oldData }), { headers: this.header })
            .toPromise()
            .then(function (res) {
            var resObj = res.json();
            return resObj;
        }).catch(this.handleError);
    };
    UserService.prototype.deleteAccount = function () {
        var username = localStorage.getItem('username');
        var method = localStorage.getItem('method');
        return this.http.post('/delete-account', JSON.stringify({ username: username, method: method }), { headers: this.header })
            .toPromise()
            .then(function (res) { return true; })
            .catch(this.handleError);
    };
    UserService.prototype.updateMyImgs = function (obj) {
        var username = localStorage.getItem('username');
        var method = localStorage.getItem('method');
        return this.http.put('/update-images', JSON.stringify({ username: username, obj: obj, method: method }), { headers: this.header })
            .toPromise()
            .then(function (res) { return true; })
            .catch(this.handleError);
    };
    UserService.prototype.saveImage = function (boardTitle, img) {
        var username = localStorage.getItem('username');
        var method = localStorage.getItem('method');
        var obj = {
            username: username,
            boardTitle: boardTitle,
            img: img,
            method: method
        };
        return this.http.post('/save-image', obj, { headers: this.header })
            .toPromise()
            .catch(this.handleError);
    };
    UserService.prototype.processUrl = function (url) {
        var baseUrl = url.split('/').slice(0, 3).join('/');
        var devRegEx = /deviantart/gi;
        if (devRegEx.test(baseUrl)) {
            baseUrl = 'https://deviantart.com';
        }
        return baseUrl;
    };
    // funzione consumata dal componente 'profile' e dalla sezione 'puns' ci consente di recuperare le immagini necessarie in base al fatto che siamo attualmente sul nostro profilo o su quello di un'altro.
    UserService.prototype.getAllMyImgs = function () {
        var isMyProfile = this.getMyUsername() === this.getProfileUsername();
        var arr = [];
        this.boards.forEach(function (board) {
            // se non è il profilo dell'utente
            if (!isMyProfile) {
                // e se le board non sono segrete
                if (!board.secret) {
                    // inserisce tutte le immagini delle board pubbliche tralasciando quelle delle board segrete nell'array 'arr'.
                    board.imgs.forEach(function (myImg) {
                        arr.push(myImg);
                    });
                }
            }
            else {
                // inserisci le immagini inserite in tutte le board sia pubbliche che segrete nell'array 'arr'.
                board.imgs.forEach(function (myImg) {
                    arr.push(myImg);
                });
            }
        });
        return arr;
    };
    return UserService;
}());
UserService = __decorate([
    core_1.Injectable(),
    __metadata("design:paramtypes", [http_1.Http, router_1.Router])
], UserService);
exports.UserService = UserService;
//# sourceMappingURL=user.service.js.map