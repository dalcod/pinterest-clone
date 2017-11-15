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
var forms_1 = require("@angular/forms");
var board_1 = require("../board");
var user_service_1 = require("../user.service");
var profile_service_1 = require("../profile.service");
var board_detail_service_1 = require("../board-detail.service");
var ManageImgsForm = (function () {
    function ManageImgsForm(userService, bS, pS, fb) {
        var _this = this;
        this.userService = userService;
        this.bS = bS;
        this.pS = pS;
        this.fb = fb;
        this.showOptions = false;
        this.showMngImgForm = false;
        this.opCompleted = new core_1.EventEmitter();
        this.formErrors = {
            'search-create-board': ''
        };
        this.validationMessages = {
            'search-create-board': {
                'pattern': 'Title must contain only letters or numbers.'
            }
        };
        this.subscription = this.bS.mngImgsFormVisibility$.subscribe(function (val) { return _this.showMngImgForm = val; });
        this.createForms();
        this.searchCreateBoardForm.valueChanges.subscribe(function () { return _this.onValueChanges(); });
    }
    ManageImgsForm.prototype.ngOnInit = function () {
        var _this = this;
        // imposta il valore iniziale della porprietà a cui fa riferimento la selezione.
        this.initVal = 'Select a board...';
        // non includere nell'array "options" la board attuale.
        this.options = this.userService.myBoards.filter(function (elem) { return elem.title !== _this.currentBoard.title; });
    };
    ManageImgsForm.prototype.ngOnDestroy = function () {
        this.subscription.unsubscribe();
    };
    ManageImgsForm.prototype.createForms = function () {
        this.mngImgForm = this.fb.group({
            select: ['']
        });
        this.searchCreateBoardForm = this.fb.group({
            'search-create-board': ['', forms_1.Validators.pattern(/^[\w ]+$/i)]
        });
    };
    ManageImgsForm.prototype.resetFormFields = function () {
        this.createForms();
    };
    ManageImgsForm.prototype.onValueChanges = function () {
        if (!this.searchCreateBoardForm) {
            return;
        }
        var form = this.searchCreateBoardForm;
        for (var field in this.formErrors) {
            this.formErrors[field] = '';
            var control = form.get(field);
            if (control && control.dirty && !control.valid) {
                var messages = this.validationMessages[field];
                for (var key in control.errors) {
                    this.formErrors[field] += messages[key] + ' ';
                }
            }
        }
    };
    ManageImgsForm.prototype.updateImgs = function () {
        var _this = this;
        this.error = '';
        if (!this.selTitle) {
            return;
        }
        if (this.op === 'move') {
            var imgsToUpdate_1 = this.selectedImgs;
            var doubleImgs_1 = [];
            this.userService.myBoards.forEach(function (elem) {
                // se il titolo della board "elem.title" combacia con il titolo della board selezionata "this.selTitle"
                if (elem.title === _this.selTitle) {
                    // se sono presenti delle immagini con la stessa url e quindi già presenti nella board di destinazione procedi ad inserirle nell'array "doubleImgs".
                    imgsToUpdate_1.forEach(function (elem2, i2) {
                        elem.imgs.forEach(function (elem3, i3) {
                            if (elem2.url === elem3.url) {
                                doubleImgs_1.push(elem2);
                            }
                        });
                    });
                }
            });
            // se sono presenti immaggini nell'array "doubleImgs" lancia un errore e ritorna la funzione.
            if (doubleImgs_1[0]) {
                this.error = 'There are duplicated images.';
                return;
            }
            else {
                // crea un pattern regExp che combaci la descrizione di default dell'immagine.
                var regPatt_1 = new RegExp((this.userService.myData.displayName || this.userService.myData.username) + ': ' + this.currentBoard.title, 'gi');
                // se non sono presenti delle immagini con lo stesso nome nell'array di destinazione rimuovi le immagini dalla board in cui è attualmente inserita
                this.userService.boards.forEach(function (elem) {
                    if (elem.title === _this.currentBoard.title) {
                        console.log('1');
                        // rimuovi le immagini dall'array "imgs" della board attuale/corrente.
                        imgsToUpdate_1.forEach(function (elem2) {
                            // aggiorna il valore della proprietà "board" inserita all'interno dell'oggetto "elem2" con il titolo della board di destinazione "this.selTitle" e la descrizione automatica. 
                            elem2.board = _this.selTitle;
                            // se l'espressione regExp combacia con la descrizione di default dell'immagine procedi ad aggiornarla con una che sostitusca il nome della board attuale con quella di destinazione.
                            if (regPatt_1.test(elem2.description)) {
                                elem2.description = (_this.userService.myData.displayName || _this.userService.myData.username) + ': ' + elem2.board;
                            }
                            elem.imgs.forEach(function (elem3, i) {
                                if (elem2.url === elem3.url) {
                                    console.log('3');
                                    elem.imgs.splice(i, 1);
                                }
                            });
                        });
                    }
                });
                this.hide('mng-img-form');
                this.opCompleted.emit(true);
                this.bS.moveImages(imgsToUpdate_1, this.currentBoard.title, this.selTitle)
                    .then(function (res) { return null; }, function (err) {
                    _this.userService.sendNewError(err);
                    _this.showOptions = false;
                    _this.bS.showMngImgsForm(false);
                });
            }
        }
        if (this.op === 'copy') {
            this.error = '';
            var imgsToUpdate_2 = this.selectedImgs;
            var doubleImgs_2 = [];
            this.userService.boards.forEach(function (elem) {
                if (elem.title === _this.selTitle) {
                    imgsToUpdate_2.forEach(function (elem2, i2) {
                        elem.imgs.forEach(function (elem3, i3) {
                            if (elem2.url === elem3.url) {
                                doubleImgs_2.push(elem2);
                            }
                        });
                    });
                }
            });
            if (doubleImgs_2[0]) {
                this.error = 'There are duplicated images.';
                return;
            }
            else {
                this.hide('mng-img-form');
                this.opCompleted.emit(true);
                var regPatt_2 = new RegExp((this.userService.myData.displayName || this.userService.myData.username) + ': ' + this.currentBoard.title, 'gi');
                // aggiorna il valore della proprietà "board" inserita all'interno dell'oggetto "elem" con il titolo della board di destinazione "this.selTitle".
                imgsToUpdate_2.forEach(function (elem) {
                    elem.board = _this.selTitle;
                    if (regPatt_2.test(elem.description)) {
                        elem.description = (_this.userService.myData.displayName || _this.userService.myData.username) + ': ' + elem.board;
                    }
                });
                this.bS.copyImages(imgsToUpdate_2, this.selTitle)
                    .then(function (res) { return null; }, function (err) {
                    _this.userService.sendNewError(err);
                    _this.showOptions = false;
                    _this.bS.showMngImgsForm(false);
                });
            }
        }
    };
    ManageImgsForm.prototype.selectValue = function (title, i) {
        this.error = '';
        this.hide('options');
        this.selIndex = i;
        this.selTitle = title;
        this.initVal = this.selTitle;
    };
    ManageImgsForm.prototype.createBoard = function (formData) {
        var _this = this;
        if (!formData['search-create-board'] || this.formErrors['search-create-board'])
            return;
        var board = { title: formData['search-create-board'], secret: false, imgs: [] };
        this.resetFormFields();
        this.initVal = formData['search-create-board'];
        this.selTitle = formData['search-create-board'];
        this.hide('options');
        if (this.pS.boardExist(this.userService.myBoards, board)) {
            this.error = 'A board with this name already exist.';
            return;
        }
        this.error = '';
        this.options.unshift(board);
        this.userService.myBoards.unshift(board);
        this.userService.boards.unshift(board);
        this.pS.addBoard(board)
            .then(function (res) { return null; }, function (err) {
            _this.userService.sendNewError(err);
            _this.showOptions = false;
            _this.bS.showMngImgsForm(false);
        });
    };
    ManageImgsForm.prototype.show = function (elem, e) {
        if (elem === 'mng-img-form') {
            this.bS.showMngImgsForm(true);
        }
        // il parametro "e" è necessaio per evitare che nel momento in cui cliccheremo sul capo input quest'ultimo faccia scattare la sua funzionalità di default tipica degli input tipo "text" ma a noi interessa che si comporti come un elemento tipo "<select>".
        if (elem === 'options') {
            if (e)
                e.preventDefault();
            this.showOptions = true;
        }
    };
    ManageImgsForm.prototype.hide = function (elem, e) {
        var _this = this;
        if (elem === 'mng-img-form') {
            if (e) {
                e.preventDefault();
                // resetta selezione;
                this.selTitle = '';
                this.initVal = '';
            }
            ;
            this.showOptions = false;
            this.bS.showMngImgsForm(false);
            return;
        }
        if (elem === 'options') {
            if (e) {
                this.bS.hideFormOptions(e, this.showOptions)
                    .then(function (res) {
                    if (!res) {
                        _this.showOptions = false;
                    }
                });
            }
            else {
                this.showOptions = false;
            }
        }
    };
    return ManageImgsForm;
}());
__decorate([
    core_1.Input(),
    __metadata("design:type", String)
], ManageImgsForm.prototype, "op", void 0);
__decorate([
    core_1.Input(),
    __metadata("design:type", board_1.Board)
], ManageImgsForm.prototype, "currentBoard", void 0);
__decorate([
    core_1.Input(),
    __metadata("design:type", Array)
], ManageImgsForm.prototype, "selectedImgs", void 0);
__decorate([
    core_1.Output(),
    __metadata("design:type", Object)
], ManageImgsForm.prototype, "opCompleted", void 0);
ManageImgsForm = __decorate([
    core_1.Component({
        selector: 'manage-imgs-form',
        templateUrl: './manage-imgs-form.component.html',
        styleUrls: ['./manage-imgs-form.component.css']
    }),
    __metadata("design:paramtypes", [user_service_1.UserService,
        board_detail_service_1.BoardDetailService,
        profile_service_1.ProfileService,
        forms_1.FormBuilder])
], ManageImgsForm);
exports.ManageImgsForm = ManageImgsForm;
//# sourceMappingURL=manage-imgs-form.component.js.map