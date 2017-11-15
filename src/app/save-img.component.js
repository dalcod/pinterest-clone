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
var board_1 = require("./board");
var user_service_1 = require("./user.service");
var profile_service_1 = require("./profile.service");
var save_img_service_1 = require("./save-img.service");
var SaveImageComponent = (function () {
    function SaveImageComponent(userService, fb, si, ps) {
        var _this = this;
        this.userService = userService;
        this.fb = fb;
        this.si = si;
        this.ps = ps;
        this.newBoard = new core_1.EventEmitter();
        this.showForm = false;
        this.showSaveImgOpt = true;
        this.checked = false;
        this.alertMsg = '';
        this.error = false;
        this.formErrors = {
            boardTitle: '',
        };
        this.validationMessages = {
            boardTitle: {
                'required': 'Title is required.',
                'pattern': 'The title must contain only letters, numbers or underscores.'
            },
        };
        this.createForm();
        this.boardForm.valueChanges.subscribe(function () { return _this.onValueChanges(); });
    }
    SaveImageComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.userService.myBoards.forEach(function (board, i) {
            board.imgs.forEach(function (img) {
                if (_this.img.url === img.url) {
                    _this.alertMsg = 'You have already saved this image in the \'' + board.title + '\' board.';
                }
            });
            // ??? onestamente non so a cosa serve questa condizione
            /* if (i === this.userService.myBoards.length - 1) {
                this.canSave = true;
            } */
        });
    };
    SaveImageComponent.prototype.createForm = function () {
        this.boardForm = this.fb.group({
            boardTitle: ['', forms_1.Validators.compose([forms_1.Validators.required, forms_1.Validators.pattern(/^[\w]+$/)])]
        });
    };
    SaveImageComponent.prototype.resetForm = function () {
        this.createForm();
    };
    SaveImageComponent.prototype.onValueChanges = function () {
        if (!this.boardForm) {
            return;
        }
        var form = this.boardForm;
        this.error = false;
        this.errMsg = '';
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
    // versione leggera della funzione che viene dopo la quale oltre a salvare l'immagine crea anche la board in cui sarà salvata.
    SaveImageComponent.prototype.saveImg = function (title) {
        var _this = this;
        /* if (this.canSave) { */
        this.img.source = false;
        this.img.board = title;
        this.userService.saveImage(title, this.img)
            .then(function (res) {
            _this.hideComp();
        }, function (err) {
            _this.userService.sendNewError(err);
            _this.userService.showSaveImgComp(false);
        });
        /* } */
    };
    SaveImageComponent.prototype.onSubmit = function (formData) {
        var _this = this;
        this.errMsg = '';
        var title = formData.boardTitle;
        var secret = this.checked;
        if (!title) {
            this.errMsg = 'You must insert a title';
            return;
        }
        if (this.error) {
            this.errMsg = 'Please Correct reported errors';
            return;
        }
        var board = {
            title: title,
            description: '',
            secret: secret,
            imgs: []
        };
        // impostiamo il valore di source su 'false' in modo da non visualizzare l'immagine duplicata nella 'home'.
        this.img.source = false;
        this.img.board = title;
        this.ps.addBoard(board)
            .then(function (res) {
            // procedi al salvataggio dell'immagine nella nuova board.
            _this.userService.saveImage(board.title, _this.img)
                .then(function (res2) {
                board.imgs.push(_this.img);
                _this.newBoard.emit(board);
                _this.hideComp();
            }, function (err2) {
                _this.userService.sendNewError(err2);
                _this.userService.showSaveImgComp(false);
            });
        }, function (err) {
            _this.userService.sendNewError(err);
            _this.userService.showSaveImgComp(false);
        });
    };
    SaveImageComponent.prototype.show = function (elem) {
        if (elem === 'form') {
            this.showForm = true;
            this.showSaveImgOpt = false;
        }
        if (elem === 'save-img-options') {
            this.showForm = false;
            this.showSaveImgOpt = true;
            this.resetForm();
        }
    };
    // nascondi il componente al click-out utilizzando un metodo che itera tra gli elementi all'interno del DOM in cerca di uno che abbia come classe 'click-out' se lo trova il servizio ci consentirà di trovare un valore che sarà passato al componente padre di questo componente, il quale tramite un observer lo nasconderà.
    SaveImageComponent.prototype.hideComp = function (e) {
        var _this = this;
        if (e) {
            this.si.hideSaveImgComp(e)
                .then(function (res) {
                if (!res) {
                    _this.userService.showSaveImgComp(res);
                }
            });
            return;
        }
        else {
            this.userService.showSaveImgComp(false);
        }
    };
    // funzione utilizzata per switchare tra le due icone 'toggle' 
    SaveImageComponent.prototype.toggleCheck = function () {
        this.checked = !this.checked;
    };
    return SaveImageComponent;
}());
__decorate([
    core_1.Input(),
    __metadata("design:type", board_1.Img)
], SaveImageComponent.prototype, "img", void 0);
__decorate([
    core_1.Input(),
    __metadata("design:type", Array)
], SaveImageComponent.prototype, "boards", void 0);
__decorate([
    core_1.Output(),
    __metadata("design:type", Object)
], SaveImageComponent.prototype, "newBoard", void 0);
SaveImageComponent = __decorate([
    core_1.Component({
        selector: 'save-img-comp',
        templateUrl: './save-img.component.html',
        styleUrls: ['./save-img.component.css'],
        providers: [save_img_service_1.SaveImageService]
    }),
    __metadata("design:paramtypes", [user_service_1.UserService,
        forms_1.FormBuilder,
        save_img_service_1.SaveImageService,
        profile_service_1.ProfileService])
], SaveImageComponent);
exports.SaveImageComponent = SaveImageComponent;
//# sourceMappingURL=save-img.component.js.map