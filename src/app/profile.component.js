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
var forms_1 = require("@angular/forms");
require("rxjs/add/operator/switchMap");
var user_service_1 = require("./user.service");
var profile_service_1 = require("./profile.service");
var ProfileComponent = (function () {
    function ProfileComponent(router, userService, pS, route, fb, location) {
        var _this = this;
        this.router = router;
        this.userService = userService;
        this.pS = pS;
        this.route = route;
        this.fb = fb;
        this.location = location;
        this.show1 = false;
        this.show2 = false;
        this.show3 = false;
        this.show4 = false;
        this.showBoards = true;
        this.showMyImgs = false;
        this.showSaveImgComp = false;
        this.boards = [];
        this.myBoards = [];
        this.secretBoards = [];
        this.myImgs = [];
        this.myOptions = {
            itemSelector: '.pun-frame',
            columnWidth: 15
        };
        this.imgError = false;
        this.formErrors = {
            boardCoverUrl: '',
            addTitle: '',
            addSecretTitle: '',
            title: ''
        };
        this.validationMessages = {
            boardCoverUrl: {
                'pattern': 'Invalid image URL.'
            },
            addTitle: {
                'pattern': 'Title must contain only letters or numbers.'
            },
            addSecretTitle: {
                'pattern': 'Title must contain only letters or numbers.'
            },
            title: {
                'pattern': 'Title must contain only letters or numbers.'
            }
        };
        this.createForms();
        this.boardForm.valueChanges.subscribe(function () { return _this.onValueChanges(_this.boardForm); });
        this.addBoardForm.valueChanges.subscribe(function () { return _this.onValueChanges(_this.addBoardForm); });
        this.addSecretBoardForm.valueChanges.subscribe(function () { return _this.onValueChanges(_this.addSecretBoardForm); });
        this.subscription = userService.saveImgComp$.subscribe(function (val) { return _this.showSaveImgComp = val; });
    }
    ProfileComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.isMyProfile = this.userService.isMyProfile;
        this.myBoards = this.userService.myBoards;
        // osserva se ci sono cambiamenti all'interno del parametro "username" relativo all'url. Nel caso vi siano cambiamenti provvedi ad invocare il metodo ".getUserData()".
        this.route.paramMap
            .switchMap(function (params) {
            // ritorna i dati relativi all'utente.
            return _this.userService.getUserData(params.get('username'))
                .then(function (data) {
                // resetta i dati 'profile' nel caso cambiassimo profilo all'interno di questo componente.
                _this.resetProfileData();
                _this.myBoards = _this.userService.myBoards;
                // determina se il profilo che siamo attualmente visualizzando sia il nostro oppure no.
                _this.isMyProfile = _this.userService.isMyProfile;
                var boards = data.boards;
                // dividi le board pubbliche da quelle segrete e assegnale alle relative proprietà.
                boards.forEach(function (board) {
                    if (!board.secret) {
                        _this.boards.push(board);
                    }
                    else {
                        _this.secretBoards.push(board);
                    }
                });
                _this.boards.reverse();
                _this.secretBoards.reverse();
                // estrai tutte le immagini dalle boards.
                _this.getAllMyImgs();
                // imposta i dati profilo.
                _this.username = data.accData.username;
                _this.displayName = data.accData.displayName || data.accData.username;
                _this.profileDescription = data.accData.description || '';
                if (data.accData.photos[0])
                    _this.avatar = data.accData.photos[0].value || '';
            }, function (err) {
                _this.httpErr = err;
                console.log(_this.httpErr);
            });
        }).subscribe(function () { return null; });
    };
    ProfileComponent.prototype.ngOnDestroy = function () {
        this.subscription.unsubscribe();
    };
    ProfileComponent.prototype.loggedIn = function () {
        return this.userService.isLoggedIn();
    };
    ProfileComponent.prototype.resetProfileData = function () {
        this.boards = [];
        this.secretBoards = [];
        this.displayName = '';
        this.avatar = '';
        this.profileDescription = '';
    };
    ProfileComponent.prototype.createForms = function () {
        this.boardForm = this.fb.group({
            boardCoverUrl: ['', forms_1.Validators.pattern(/\.(jpeg|jpg|gif|png)/g)],
            title: ['', forms_1.Validators.pattern(/^[\w ]+$/i)],
            description: '',
            secret: false
        });
        this.addBoardForm = this.fb.group({
            addTitle: ['', forms_1.Validators.pattern(/^[\w ]+$/i)]
        });
        this.addSecretBoardForm = this.fb.group({
            addSecretTitle: ['', forms_1.Validators.pattern(/^[\w ]+$/i)]
        });
    };
    ProfileComponent.prototype.resetFormFields = function () {
        this.createForms();
    };
    ProfileComponent.prototype.onValueChanges = function (currentForm) {
        if (!this.boardForm || !this.addBoardForm || !this.addSecretBoardForm) {
            return;
        }
        var form = currentForm;
        this.error = false;
        this.submitError = '';
        for (var field in this.formErrors) {
            this.formErrors[field] = '';
            var control = form.get(field);
            if (control && control.dirty && !control.valid) {
                this.error = true;
                var messages = this.validationMessages[field];
                for (var key in control.errors) {
                    this.formErrors[field] += messages[key] + ' ';
                }
            }
        }
    };
    // questa funzione ci consente di visualizzare nella sezione 'puns' o immagini, tutte le immagini inserite nelle nostre board estraendole grazie a un metodo dell'userService e assegnandole all'array 'myImgs'.
    ProfileComponent.prototype.getAllMyImgs = function () {
        this.myImgs = this.userService.getAllMyImgs();
    };
    // è necessario filtrare gli elementi cliccabili al solo 'div' in quel caso imposta la proprietà da visualizzare e naviga al componente 'image-details'.
    ProfileComponent.prototype.navigateToDetails = function (e, img) {
        if (e.target.localName === 'div') {
            this.userService.shownImg = img;
            this.router.navigate(['/image-details', 'profile']);
        }
    };
    // estrai la 'base url' dal link dell'immagine.
    ProfileComponent.prototype.processUrl = function (url) {
        return this.userService.processUrl(url);
    };
    // se l'avatar non viene caricato dall'elemento 'img' lancia un errore.
    ProfileComponent.prototype.ifBrokenImg = function () {
        if (this.avatar === '')
            return;
        this.imgError = true;
    };
    // metodo utilizzato dal form 'update' ci consente di bloccare l'inserimento di caratteri nel caso avessimo raggiunto il limite di quelli possibili.
    ProfileComponent.prototype.setStringLengthLimit = function (e, limit) {
        var str = this.boardForm.value.description;
        if (e.key.toLowerCase() === 'backspace') {
            return;
        }
        if (str.length >= limit) {
            e.preventDefault();
        }
    };
    // al click sulla cover della board redirigi l'utente al componente 'board detail'.
    ProfileComponent.prototype.sendCurrentBoard = function (currBoard) {
        this.router.navigate(['/profile/' + this.username + '/' + currBoard.title]);
    };
    ProfileComponent.prototype.createBoard = function (_type, formData) {
        var _this = this;
        if (_type === 'public') {
            if (!formData.addTitle)
                return;
            this.publicBoardError = '';
            // imposta le proprietà di default della board.
            var board = { title: formData.addTitle, secret: false, imgs: [] };
            this.resetFormFields();
            // se la board esiste già ritorna errore.
            if (this.pS.boardExist(this.myBoards, board)) {
                this.publicBoardError = 'A board with this name already exist.';
                return;
            }
            this.publicBoardError = '';
            // rendi la board disponibile localmente.
            this.boards.unshift(board);
            // rendi la board disponibile globalmente a tutti i componenti.
            this.userService.myBoards.unshift(board);
            // è necessario eseguire la stesa operazione per rendrere disponibile la nuova board al componente "board-detail"
            this.userService.boards.unshift(board);
            this.hide('public-form');
            // salva la board nel database.
            this.pS.addBoard(board)
                .then(function (res) { return null; }, function (err) { return _this.httpErr = err; });
        }
        if (_type === 'secret') {
            if (!formData.addSecretTitle)
                return;
            this.publicBoardError = '';
            var board = { title: formData.addSecretTitle, secret: true };
            this.resetFormFields();
            if (this.pS.boardExist(this.myBoards, board)) {
                this.secretBoardError = 'A board with this name already exist.';
                return;
            }
            this.secretBoardError = '';
            this.secretBoards.unshift(board);
            this.userService.myBoards.unshift(board);
            this.userService.boards.unshift(board);
            this.hide('secret-form');
            this.pS.addBoard(board)
                .then(function (res) { return null; }, function (err) { return _this.httpErr = err; });
        }
    };
    ProfileComponent.prototype.updateBoard = function (formData) {
        var _this = this;
        if (this.error) {
            this.submitError = 'Please correct reported errors before submitting.';
            return;
        }
        // salva nella variabile 'oldTitle' attraverso il loop 'for..in' il vecchio titolo che ci consentirà in seguito, nel caso lo avessimo cambiato, di aggiornarlo all'interno del database.
        var oldTitle;
        for (var p in this.selectedBoard) {
            if (p === 'title') {
                oldTitle = this.selectedBoard[p];
            }
        }
        var selB = this.selectedBoard;
        // se è stata inserita una nuova cover salvala nella proprietà, altrimenti se non è stata inserita ma ve ne è già un'altra salva quest'ultima oppure se non vi è nessuna delle due opzioni salva una stringa vuota.
        selB.coverUrl = formData.boardCoverUrl || selB.coverUrl || '';
        selB.title = formData.title || selB.title;
        selB.description = formData.description || selB.description || '';
        var update = function (boards1, boards2) {
            _this.pS.deleteBoardFromArray(boards1, selB);
            selB.secret = formData.secret;
            _this.pS.updateBoard(selB, oldTitle)
                .then(function (res) { return null; }, function (err) { return _this.httpErr = err; });
            boards2.unshift(selB);
            _this.hide('update-form');
            _this.resetFormFields();
        };
        // se la proprietà ".secret" è stata modificata da vera a falsa rimuovi la board dall'array 'segreto' e spostalo in quello 'pubblico', la condizione verifica lo stato della proprietà "secret" prima e dopo la sottomissione, quindi la proprietà "secret" di "formData" conterrà il suo valore attuale mentre la proprietà "secret" di "secretBoard" quello vecchio.
        if (formData.secret === false && this.selectedBoard.secret === true) {
            update(this.secretBoards, this.boards);
            return;
        }
        // contrario di quanto fatto sopra.
        if (formData.secret === true && this.selectedBoard.secret === false) {
            update(this.boards, this.secretBoards);
            return;
        }
        this.pS.updateBoard(selB, oldTitle)
            .then(function (res) {
            _this.hide('update-form');
            _this.resetFormFields();
        }, function (err) { return _this.httpErr = err; });
    };
    // elimina la board selezionata dall'array.
    ProfileComponent.prototype.deleteBoard = function () {
        var _this = this;
        this.pS.deleteBoardFromArray(this.secretBoards, this.selectedBoard);
        this.pS.deleteBoardFromArray(this.boards, this.selectedBoard);
        // se nell'array "userservice.boards" è presente la board selezionata "selectedBoard" rimuovila, in questo modo la board non sarà più disponibile in tutti i componenti.
        this.pS.deleteBoardFromArray(this.userService.myBoards, this.selectedBoard);
        this.pS.deleteBoardFromArray(this.userService.boards, this.selectedBoard);
        this.myImgs.forEach(function (img, i) {
            if (img.board === _this.selectedBoard.title) {
                _this.myImgs.splice(i, 1);
            }
        });
        this.pS.removeBoard(this.selectedBoard);
        this.hide('all-shown');
    };
    // funzione invocata dalla proprietà '@Output' 'newBoard' all'interno del componente 'save-image' nel caso decidessimo di creare una nuova board, nel caso aggiungi la nuova board all'array 'boards'.
    ProfileComponent.prototype.onNewBoard = function (e) {
        this.boards.unshift(e);
    };
    // funzione che ci consente di visualizzare e allo stesso tempo passare l'immagine su cui abbiamo cliccato dal componente 'save-image'.
    ProfileComponent.prototype.showSaveImgComponent = function (img) {
        this.myImg = img;
        this.showSaveImgComp = true;
    };
    ProfileComponent.prototype.show = function (elem, e, board) {
        if (elem === 'my-imgs') {
            this.showMyImgs = true;
            this.showBoards = false;
            return;
        }
        if (elem === 'boards') {
            this.showMyImgs = false;
            this.showBoards = true;
            return;
        }
        if (elem === 'public-form') {
            if (this.show2) {
                this.hide('secret-form');
            }
            this.show1 = true;
            return;
        }
        if (elem === 'secret-form') {
            if (this.show) {
                this.hide('public-form');
            }
            this.show2 = true;
            return;
        }
        if (elem === 'update-form' && board) {
            this.selectedBoard = board;
            this.show3 = true;
            return;
        }
        if (elem === 'confirm-window' && e) {
            e.preventDefault();
            this.show4 = true;
            return;
        }
    };
    ProfileComponent.prototype.hide = function (elem, e) {
        var _this = this;
        if (elem === 'public-form') {
            this.show1 = false;
            return;
        }
        if (elem === 'secret-form') {
            this.show2 = false;
            return;
        }
        if (elem === 'update-form') {
            this.show3 = false;
            return;
        }
        if (elem === 'confirm-window' && e) {
            e.preventDefault();
            this.show4 = false;
            return;
        }
        if (elem === 'public-secret-forms') {
            this.pS.hideAddBoardsForms(e, { show1: this.show1, show2: this.show2 })
                .then(function (val) {
                if (!val) {
                    // resetta l'errore nel caso sia presente
                    _this.publicBoardError = '';
                    _this.hide('public-form');
                    _this.hide('secret-form');
                }
            });
        }
        if (elem === 'all-shown') {
            this.show1 = false;
            this.show2 = false;
            this.show3 = false;
            this.show4 = false;
        }
    };
    return ProfileComponent;
}());
ProfileComponent = __decorate([
    core_1.Component({
        templateUrl: './profile.component.html',
        styleUrls: ['./profile.component.css']
    }),
    __metadata("design:paramtypes", [router_1.Router,
        user_service_1.UserService,
        profile_service_1.ProfileService,
        router_1.ActivatedRoute,
        forms_1.FormBuilder,
        common_1.Location])
], ProfileComponent);
exports.ProfileComponent = ProfileComponent;
//# sourceMappingURL=profile.component.js.map