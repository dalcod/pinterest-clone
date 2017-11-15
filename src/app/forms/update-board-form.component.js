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
var UpdateBoardForm = (function () {
    function UpdateBoardForm(userService, bS, pS, fb) {
        var _this = this;
        this.userService = userService;
        this.bS = bS;
        this.pS = pS;
        this.fb = fb;
        this.showUpdateForm = false;
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
        this.createForm();
        this.subscription = this.bS.updateBoardFormVisibility$.subscribe(function (val) { return _this.showUpdateForm = val; });
        this.updateBoardForm.valueChanges.subscribe(function () { return _this.onValueChanges(_this.updateBoardForm); });
    }
    UpdateBoardForm.prototype.ngOnDestroy = function () {
        this.subscription.unsubscribe();
    };
    UpdateBoardForm.prototype.createForm = function () {
        this.updateBoardForm = this.fb.group({
            boardCoverUrl: ['', forms_1.Validators.pattern(/\.(jpeg|jpg|gif|png)/g)],
            title: ['', forms_1.Validators.pattern(/^[\w ]+$/i)],
            description: '',
            secret: false
        });
    };
    UpdateBoardForm.prototype.resetFormFields = function () {
        this.createForm();
    };
    UpdateBoardForm.prototype.onValueChanges = function (currentForm) {
        if (!this.updateBoardForm) {
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
    UpdateBoardForm.prototype.abc = function (e) {
        e.preventDefault();
    };
    UpdateBoardForm.prototype.updateBoard = function (formData) {
        var _this = this;
        if (this.error) {
            this.submitError = 'Please correct reported errors before submitting.';
            return;
        }
        // copia il valore della proprietà ".title" nella variabile "oldTitle".
        var oldTitle;
        for (var p in this.currentBoard) {
            if (p === 'title') {
                oldTitle = this.currentBoard[p];
            }
        }
        // aggiurna i valori delle prorpietà inserite nell'oggetto "this.currentBoard".
        var selB = this.currentBoard;
        selB.coverUrl = formData.boardCoverUrl || selB.coverUrl || '';
        selB.title = formData.title || selB.title;
        selB.description = formData.description || selB.description || '';
        selB.secret = formData.secret;
        // questa espressione è necessaria per annullare il metodo ".reverse()" che applichiamo all'array immagini quando andiamo a creare il componente "board-details" nel caso tornassimo alla pagina dopo la modifica.
        selB.imgs.reverse();
        // aggiorna il docuemento relativo alla board sul server.
        this.pS.updateBoard(selB, oldTitle)
            .then(function (res) { return null; }, function (err) {
            _this.userService.sendNewError(err);
            _this.bS.showUpdateBoardForm(false);
        });
        this.hide('update-form');
        this.resetFormFields();
    };
    UpdateBoardForm.prototype.show = function (elem) {
        if (elem === 'update-form') {
            this.bS.showUpdateBoardForm(true);
        }
    };
    UpdateBoardForm.prototype.hide = function (elem, e) {
        if (elem === 'update-form') {
            if (e)
                e.preventDefault();
            this.bS.showUpdateBoardForm(false);
        }
    };
    return UpdateBoardForm;
}());
__decorate([
    core_1.Input(),
    __metadata("design:type", board_1.Board)
], UpdateBoardForm.prototype, "currentBoard", void 0);
UpdateBoardForm = __decorate([
    core_1.Component({
        selector: 'update-board-form',
        templateUrl: './update-board-form.component.html',
        styleUrls: ['./update-board-form.component.css']
    }),
    __metadata("design:paramtypes", [user_service_1.UserService,
        board_detail_service_1.BoardDetailService,
        profile_service_1.ProfileService,
        forms_1.FormBuilder])
], UpdateBoardForm);
exports.UpdateBoardForm = UpdateBoardForm;
//# sourceMappingURL=update-board-form.component.js.map