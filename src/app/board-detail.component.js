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
var board_detail_service_1 = require("./board-detail.service");
var user_service_1 = require("./user.service");
var BoardDetailComponent = (function () {
    function BoardDetailComponent(userService, bS, fb, route, router) {
        var _this = this;
        this.userService = userService;
        this.bS = bS;
        this.fb = fb;
        this.route = route;
        this.router = router;
        this.showUpdateForm = false;
        this.showAddImageForm = false;
        this.showImgOptions = false;
        this.showAddImgDetail = false;
        this.showMngImgForm = false;
        this.showAlert = false;
        this.showSaveImgComp = false;
        this.canActivateLoad = false;
        this.control = [];
        this.myBoards = [];
        this.img = { url: '',
            title: '',
            description: 'No description',
            createdBy: '',
            displayName: '',
            board: '' };
        this.checkedImgs = [];
        this.myOptions = {
            itemSelector: '.pun-frame',
            columnWidth: 15
        };
        this.formErrors = {
            boardCoverUrl: '',
            imgUrl: '',
            title: ''
        };
        this.validationMessages = {
            boardCoverUrl: {
                'pattern': 'Invalid image URL.'
            },
            imgUrl: {
                'pattern': 'Invalid image URL.'
            },
            title: {
                'pattern': 'Title must contain only letters or numbers.'
            }
        };
        // observer che gestisce visibilità del componente 'manage-img-form'.
        this.subscription = bS.mngImgsFormVisibility$.subscribe(function (val) { return _this.showMngImgForm = val; });
        // observer che gestisce visibilità del componente 'update-board-form'.
        this.subscription2 = bS.updateBoardFormVisibility$.subscribe(function (val) { return _this.showUpdateForm = val; });
        // observer che gestisce visibilità del componente 'save-image'.
        // ... spostare observable "saveImgComp$" dal "HomeService" al "UserService" ed eliminare il primo da questo componente.
        this.subscription3 = userService.saveImgComp$.subscribe(function (val) { return _this.showSaveImgComp = val; });
        this.subscription4 = userService.handleError$.subscribe(function (err) { return _this.httpErr = err; });
        // resetta nel caso sia necessario la visualizzazione della barra per la modifica immagini.
        this.setCurrentClasses();
        this.createForms();
        this.addImageForm.valueChanges.subscribe(function () { return _this.onValueChanges(_this.addImageForm); });
        this.addImgDetailsForm.valueChanges.subscribe(function () { return _this.onValueChanges(_this.addImgDetailsForm); });
    }
    BoardDetailComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.myBoards = this.userService.myBoards;
        var profileUsername = this.route.snapshot.paramMap.get('username');
        var title = this.route.snapshot.paramMap.get('board-title');
        this.userService.getUserData(profileUsername)
            .then(function (obj) {
            obj.boards.forEach(function (board) {
                if (board.title === title) {
                    _this.board = board;
                }
            });
            _this.imgsArr = _this.board.imgs.reverse();
            _this.username = _this.userService.getMyUsername();
            _this.displayName = _this.userService.myData.displayName || _this.username;
            // "isMyProfile" non funziona se si passa direttamente al link "/profile/username/board"
            _this.isMyProfile = _this.userService.isMyProfile;
            _this.setAddImageClasses();
            _this.setBoardInfoClasses();
            _this.setBoardImgClasses();
        }, function (err) { return _this.httpErr = err; });
    };
    BoardDetailComponent.prototype.ngOnDestroy = function () {
        this.subscription.unsubscribe();
        this.subscription2.unsubscribe();
        this.subscription3.unsubscribe();
        this.subscription4.unsubscribe();
    };
    BoardDetailComponent.prototype.createForms = function () {
        this.addImageForm = this.fb.group({
            imgUrl: ['', forms_1.Validators.pattern(/\.(jpeg|jpg|gif|png)/gi)]
        });
        this.addImgDetailsForm = this.fb.group({
            title: ['', forms_1.Validators.pattern(/^[\w ]+$/i)],
            description: '',
        });
    };
    BoardDetailComponent.prototype.resetFormFields = function () {
        this.createForms();
    };
    BoardDetailComponent.prototype.onValueChanges = function (currentForm) {
        if (!this.addImageForm) {
            return;
        }
        var form = currentForm;
        this.error = false;
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
    // funzione consumata a sua volta dalla funzione "addImgDetails()" per mostrare le modifiche effettuate all'immagine.
    BoardDetailComponent.prototype.resetImgsArr = function () {
        var _this = this;
        var delay = 10;
        var arr = [];
        // sovrascrive la proprietà nell'array se l'immagine è stata modificata.
        this.imgsArr.forEach(function (imgObj, i) {
            if (imgObj.url === _this.img.url) {
                _this.imgsArr[i] = _this.img;
            }
        });
    };
    // la funzione è utilizzata per effettuare una sorta di "prepending" dell'immagine appena inserita per utilizzare un termine "jQueriano", sfortunatamente difatti 'angular-masonry' non ha un'opzione che consente di fare questo.
    // ... valutare di spostare i loop o anche gran parte della funzione del "ProfileService"
    BoardDetailComponent.prototype.resetImgsArrOnLoad = function () {
        var _this = this;
        // se la proprietà "canActivateLoad" è "true" fai partire la funzione quest'operazione è necessaria per evitare un bug abbastanza serio, ovvero il reset infinito delle immagini.
        if (this.canActivateLoad) {
            // appena la funzione scatta imposta la proprietà su "false" per evitare il bug descritto sopra.
            this.canActivateLoad = false;
            setTimeout(function () {
                var arr = [];
                // sovrascrive la proprietà nell'array se l'immagine è stata modificata.
                _this.imgsArr.forEach(function (imgObj, i) {
                    arr[i] = _this.imgsArr[i];
                });
                _this.imgsArr = [];
                // risetta l'array.
                setTimeout(function () {
                    _this.imgsArr = arr;
                }, 100);
            }, 100);
        }
    };
    // funzione utilizzata dall'elemento/form 'add-img' per la sottomissione dei dati inseriti dall'utente.
    BoardDetailComponent.prototype.addImage = function (formData) {
        var _this = this;
        this.error = false;
        this.canActivateLoad = false;
        // se l'immagine è già presente segnala un errore.
        this.board.imgs.forEach(function (elem) {
            if (elem.url === formData.imgUrl) {
                _this.error = true;
            }
        });
        if (!formData.imgUrl || this.error) {
            return;
        }
        this.img.url = formData.imgUrl;
        this.img.createdBy = this.username;
        this.img.description = (this.userService.myData.displayName || this.userService.myData.username) + ': ' + this.board.title;
        this.img.displayName = this.userService.myData.displayName || this.userService.myData.username;
        this.img.board = this.board.title;
        this.img.source = true;
        this.imgsArr.unshift(this.img);
        // la proprietà fa scattare la funzione "resetImgsArrOnLoad()" al caricamento dell'immagine
        this.canActivateLoad = true;
        this.resetFormFields();
        this.bS.addImage(this.img, this.board.title)
            .then(function (res) {
            // è necessario resettare l'oggetto per evitare bug.
            _this.img = { url: '',
                title: '',
                description: '',
                createdBy: '',
                displayName: '',
                board: '' };
        }, function (err) { return _this.httpErr = err; });
    };
    // funzione utilizzata dall'elemento/form 'add-img-details' per la sottomissione dei dati inseriti dall'utente.
    BoardDetailComponent.prototype.addImgDetails = function (formData) {
        var _this = this;
        // se il form è vuoto non sottomettere.
        if (!formData.title && !formData.description) {
            return;
        }
        this.img.title = formData.title || this.img.title;
        this.img.description = formData.description || this.img.description;
        this.resetImgsArr();
        this.show('add-img-details', false);
        this.resetFormFields();
        this.bS.updateImage(this.img, this.board.title)
            .then(function (res) {
            // è necessario resettare l'oggetto per evitare bug.
            _this.img = { url: '',
                title: '',
                description: '',
                createdBy: '',
                displayName: '',
                board: '' };
        }, function (err) { return _this.httpErr = err; });
    };
    // funzione utilizzata per cancellare le immagini
    BoardDetailComponent.prototype.deleteImages = function () {
        var _this = this;
        if (!this.checkedImgs[0]) {
            this.showAlert = true;
            return;
        }
        // rimuovi dall'array 'imgsArr' le immagini che abbiamo selezionato inserite nell'array 'checkedImgs', in modo da rendere visibile l'eliminazione immediatamente.
        this.checkedImgs.forEach(function (elem) {
            _this.imgsArr.forEach(function (elem2, i) {
                if (elem.url === elem2.url) {
                    _this.imgsArr.splice(i, 1);
                }
            });
        });
        // rimuovi le immagini selezionate dal database. 
        this.bS.deleteImages(this.checkedImgs, this.board.title)
            .then(function (res) {
            // resetta le selezioni delle immagini.
            _this.checkedImgs = [];
            _this.control = [];
        }, function (err) { return _this.httpErr = err; });
    };
    // la funzione viene invocata da un evento tipo '@Output' all'interno del componente 'manage-images-form' quando l'operazione di spostamento o copiatura è stata completata e resetta le varie proprietà utilizzate per l'operazione richiesta e d esegui il 'refresh' della pagina resettando e reimpostando l'array delle immagini.
    BoardDetailComponent.prototype.onOpCompleted = function (e) {
        if (e) {
            this.control = [];
            this.checkedImgs = [];
            // è necessario forzare l'aggiornamento dell'array quando spostiamo o copiamo le immagini, dato che il programma tende a non aggiornarsi a volte.
            this.imgsArr = [];
            this.imgsArr = this.board.imgs.reverse();
        }
    };
    BoardDetailComponent.prototype.checkImg = function (img) {
        // questa operazione ci consente nel caso una determinata immagine sia già stata selezionata di rimuoverla dall'array di controllo delle immagini segnate in modo tale da indicare ad angular che vogliamo deselezionare l'immagine.
        // altrimenti procedi nell'inserire l'immagine e l'id dell'immagine nei rispettivi array.  
        if (this.control.indexOf(img.url) !== -1) {
            var index = this.control.indexOf(img.url);
            this.control.splice(index, 1);
            this.checkedImgs.splice(index, 1);
        }
        else {
            this.checkedImgs.push(img);
            this.control.push(img.url);
        }
    };
    // la funzione viene utilizzata per creare l'effetto 'check' o 'de-check' all'interno delle immagini che decidiamo di modificare.
    BoardDetailComponent.prototype.alreadyChecked = function (img) {
        if (this.control.indexOf(img.url) === -1) {
            return true;
        }
    };
    // funzione utlizzata dall'elemento adibito allo spostamento o alla copiatura delle immagini per resettare le opzioni all'interno dell'elemento 'pseudo-select'.
    BoardDetailComponent.prototype.resetOptions = function () {
        this.showImgOptions = false;
        this.setCurrentClasses();
        this.control = [];
        this.checkedImgs = [];
    };
    // funzione utilizzata dai vari link all'interno dell'immagine per processare le varie URL di origine dell'immagine in modo tale da estrarre la 'base URL', inoltre nel caso l'immagine provenga da 'deviant art' non avendo quest'ultimo una 'base URL' la funzione passa quest'ultima direttamente.
    BoardDetailComponent.prototype.processUrl = function (url) {
        return this.userService.processUrl(url);
    };
    // la funzione viene utilizzata per creare l'effetto 'slide' della barra di modifica immagini.
    BoardDetailComponent.prototype.setCurrentClasses = function () {
        this.setMenuClasses = {
            'img-menu-slide-up': !this.showImgOptions,
            'img-menu-slide-down': this.showImgOptions
        };
        this.setNavClasses = {
            'img-nav-slide-up': !this.showImgOptions,
            'img-nav-slide-down': this.showImgOptions
        };
    };
    BoardDetailComponent.prototype.setAddImageClasses = function () {
        this.addImageClasses = {
            'visible': this.isMyProfile,
            'hidden': !this.isMyProfile
        };
    };
    BoardDetailComponent.prototype.setBoardInfoClasses = function () {
        this.boardInfoClasses = {
            'board-info-margin1': !this.isMyProfile,
            'board-info-margin2': this.isMyProfile
        };
    };
    BoardDetailComponent.prototype.setBoardImgClasses = function () {
        this.boardImgClasses = {
            'board-img-row-margin1': !this.isMyProfile,
            'board-img-row-margin2': this.isMyProfile
        };
    };
    // invia l'immagine da visualizzare al servizio 'userService' e quindi al componente 'image-details' e naviga a quest'ultimo.
    BoardDetailComponent.prototype.navigateToDetails = function (img) {
        this.userService.shownImg = img;
        this.router.navigate(['/image-details', 'board-detail']);
    };
    // mostra l'elemnto/form 'add-img-details'
    BoardDetailComponent.prototype.showImgDetailsForm = function (img) {
        this.show('add-img-details', true);
        this.img = img;
    };
    // mostra il componante 'save-image'.
    BoardDetailComponent.prototype.showSaveImgComponent = function (img) {
        this.myImg = img;
        this.showSaveImgComp = true;
    };
    // come il nome implica la funzione gestisce la visualizzazione o l'occultamento dei vari elementi/componenti pop-up.
    BoardDetailComponent.prototype.show = function (elem, val, e, op) {
        var _this = this;
        if (elem === 'update-form') {
            this.showUpdateForm = val;
        }
        if (elem === 'add-image-form') {
            // nascondi al click-out del elemento.
            if (!val && e) {
                this.bS.hideAddBoardsForms(e, this.showAddImageForm)
                    .then(function (res) {
                    if (!res) {
                        _this.showAddImageForm = res;
                    }
                });
            }
            else {
                this.showAddImageForm = val;
            }
        }
        if (elem === 'mng-img-form' && op) {
            // se non ci sono immagini selezionate per essere spostate o copiate mostra messaggio di allerta.
            if (!this.checkedImgs[0]) {
                this.showAlert = true;
                return;
            }
            // la proprietà 'op' verrà passata al componente 'manage-image-form' e consentirà a quest'ultimo di capire se abbiamo cliccato sul pulsante 'move' o 'copy' e quindi agire di conseguenza.
            this.op = op;
            this.showMngImgForm = val;
        }
        if (elem === 'img-options') {
            this.showImgOptions = true;
            this.setCurrentClasses();
        }
        if (elem === 'add-img-details') {
            if (!val) {
                // nascondi al click-out del elemento.
                if (e) {
                    this.bS.hideAddImgDetailsForm(e, this.showAddImgDetail)
                        .then(function (res) {
                        if (!res) {
                            _this.showAddImgDetail = res;
                        }
                    });
                    return;
                }
                this.showAddImgDetail = val;
            }
            else {
                this.showAddImgDetail = val;
            }
        }
        if (elem === 'alert-box') {
            this.showAlert = val;
        }
    };
    return BoardDetailComponent;
}());
BoardDetailComponent = __decorate([
    core_1.Component({
        templateUrl: './board-detail.component.html',
        styleUrls: ['./board-detail.component.css'],
        providers: [board_detail_service_1.BoardDetailService]
    }),
    __metadata("design:paramtypes", [user_service_1.UserService,
        board_detail_service_1.BoardDetailService,
        forms_1.FormBuilder,
        router_1.ActivatedRoute,
        router_1.Router])
], BoardDetailComponent);
exports.BoardDetailComponent = BoardDetailComponent;
//# sourceMappingURL=board-detail.component.js.map