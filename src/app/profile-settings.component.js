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
var router_1 = require("@angular/router");
var user_service_1 = require("./user.service");
var ProfileSettingsComponent = (function () {
    function ProfileSettingsComponent(userService, router, fb) {
        var _this = this;
        this.userService = userService;
        this.router = router;
        this.fb = fb;
        this.profilePic = '';
        this.loading = false;
        this.showElem = false;
        this.opComplete = false;
        this.error = false;
        this.formErrors = {
            email: '',
            firstName: '',
            surname: '',
            profilePicUrl: '',
            username: '',
            password: '',
            descriotion: ''
        };
        this.validationMessages = {
            email: {
                'email': 'Invalid email.'
            },
            firstName: {
                'pattern': 'First name can contain only letters, numbers or underscores.'
            },
            surname: {
                'pattern': 'Surname can contain only letters, numbers or underscores.'
            },
            profilePicUrl: {
                'pattern': 'Invalid image URL.'
            },
            username: {
                'minlength': 'Username must be at least 3 characters long.',
                'maxlength': 'Username cannot be more than 10 characters.',
                'pattern': 'Username can contain only letters, numbers or underscores.'
            },
            password: {
                'minlength': 'Password must be at least 6 characters long.',
                'maxlength': 'Password cannot be more than 20 characters.'
            },
            decsription: {
                'maxlength': 'Description max length reached.'
            }
        };
        this.myData = this.userService.myData;
        if (this.myData.photos[0]) {
            this.profilePic = this.myData.photos[0].value || '';
        }
        this.createForm();
        this.profileSettingsForm.valueChanges.subscribe(function () { return _this.onValueChanges(); });
    }
    ProfileSettingsComponent.prototype.loggedIn = function () {
        return this.userService.isLoggedIn();
    };
    ProfileSettingsComponent.prototype.onValueChanges = function () {
        if (!this.profileSettingsForm) {
            return;
        }
        var form = this.profileSettingsForm;
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
    ProfileSettingsComponent.prototype.createForm = function () {
        this.profileSettingsForm = this.fb.group({
            email: ['', forms_1.Validators.email],
            password: ['', forms_1.Validators.compose([forms_1.Validators.minLength(6), forms_1.Validators.maxLength(20)])],
            firstName: ['', forms_1.Validators.pattern(/^[\w ]+$/)],
            surname: ['', forms_1.Validators.pattern(/^[\w ]+$/)],
            profilePicUrl: ['', forms_1.Validators.pattern(/\.(jpeg|jpg|gif|png)/gi)],
            username: ['', forms_1.Validators.compose([forms_1.Validators.minLength(3), forms_1.Validators.maxLength(15), forms_1.Validators.pattern(/^[\w]+$/)])],
            description: ['', forms_1.Validators.maxLength(300)]
        });
    };
    ProfileSettingsComponent.prototype.resetForm = function (e) {
        e.preventDefault();
        this.createForm();
    };
    ProfileSettingsComponent.prototype.onSubmit = function (formData) {
        var _this = this;
        if (this.error) {
            this.errMsg = 'Please correct reported errors before submitting.';
            return;
        }
        // mostra l'icona di caricamento dell'operazione.
        this.loading = true;
        this.opComplete = false;
        // aggiorna il profilo
        this.userService.updateProfile(formData)
            .then(function (res) {
            // quando la Promise ritorna nascondi l'icona di caricamento.
            _this.loading = false;
            // se vi sono errori lancia un messaggio di errore in base a quello che il server ha ricontrato non conforme ad esempio username già utilizzati.
            if (!res.success) {
                _this.error = true;
                _this.formErrors.username = res.errMsg;
                return;
            }
            else {
                // se si sono modificate proprietà relatice all'account
                if (formData.username || formData.password) {
                    // se si è modificato l'username
                    if (formData.username) {
                        // continua il caricamento.
                        _this.loading = true;
                        // aggiorna le descrizioni di default delle immagini dell'utente con il nuovo username.
                        _this.userService.updateMyImgs({ newDisplayName: res.data.displayName, oldDisplayName: _this.userService.myData.displayName, newUsername: formData.username })
                            .then(function (res2) {
                            // rendi le modifiche visibili immediatamente all'utente aggiornando l'array 'myData'.
                            for (var prop in res.data) {
                                _this.userService.myData[prop] = res.data[prop];
                            }
                            // notifica il tipo di 'update' effettuato, la proprietà verrà utilizzata dal componente 'login' per mostrare un messaggio specifico all'operazione compiuta.
                            _this.userService.accountChange = 'updated';
                            // effetua il logout
                            _this.userService.logout();
                            // naviga alla 'home' per rieffettaure il login.
                            _this.router.navigate(['/home']);
                        }, function (err2) { return _this.httpErr = err2; });
                    }
                }
                else {
                    // se non sono stati modificati campi relativi all'account e se è stato modificato il displayName.
                    if (res.data.displayName) {
                        // mantieni visibile l'icona di caricamento-
                        _this.loading = true;
                        // aggiorna il displayName visualizzato nella barra di navigazione.
                        _this.userService.sendDisplayName(res.data.displayName);
                        // se il 'displayName' è stato diverso rispetto a quello precedente aggiorna la descrizione di default delle mie immagini con il nuovo displayName.
                        if (res.data.dispalyName !== _this.userService.myData.displayName) {
                            _this.userService.updateMyImgs({ newDisplayName: res.data.displayName, oldDisplayName: _this.userService.myData.displayName, newUsername: '' })
                                .then(function (res2) {
                                for (var prop in res.data) {
                                    _this.userService.myData[prop] = res.data[prop];
                                }
                                // visualizza messaggio che indica l'avvenuto salvataggio delle impostazioni profilo
                                _this.opComplete = true;
                                // nascondi l'icona di caricamento all'interno del bottone 'save changes'.
                                _this.loading = false;
                            }, function (err3) { return _this.httpErr = err3; });
                        }
                    }
                    else {
                        _this.opComplete = true;
                        _this.loading = false;
                    }
                }
            }
        }, function (err) { return _this.httpErr = err; });
    };
    // cancella l'account
    ProfileSettingsComponent.prototype.deleteAccount = function (e) {
        var _this = this;
        e.preventDefault();
        this.userService.deleteAccount()
            .then(function (res) {
            _this.userService.accountChange = 'deleted';
            _this.userService.logout();
            _this.router.navigate(['/home']);
        }, function (err) { return _this.httpErr = err; });
    };
    // la funzione consente di visualizzare immediatamente l'immagine di profilo inserita, nel caso che la URL inserita non sia conforme ai formati accettati lancia un'errore.
    ProfileSettingsComponent.prototype.replaceProfilePic = function (url) {
        if (!/\.(jpeg|jpg|gif|png)/gi.test(url)) {
            this.error = true;
            this.formErrors.profilePicUrl = this.validationMessages.profilePicUrl.pattern;
            return;
        }
        else {
            this.error = false;
            this.formErrors.profilePicUrl = '';
            this.profilePic = url;
        }
    };
    // limita il numero di caratteri inseribili nella descrizione profilo.
    ProfileSettingsComponent.prototype.setStringLengthLimit = function (e, limit) {
        var str = this.profileSettingsForm.value.description;
        if (e.key.toLowerCase() === 'backspace') {
            return;
        }
        if (str.length >= limit) {
            e.preventDefault();
        }
    };
    // funzione utilizzata dal bottone 'delete' mostra un alert box di conferma cancellazione profilo.
    ProfileSettingsComponent.prototype.showConfirmBox = function (val, e) {
        if (e)
            e.preventDefault();
        this.showElem = val;
    };
    return ProfileSettingsComponent;
}());
ProfileSettingsComponent = __decorate([
    core_1.Component({
        templateUrl: './profile-settings.component.html',
        styleUrls: ['./profile-settings.component.css']
    }),
    __metadata("design:paramtypes", [user_service_1.UserService, router_1.Router, forms_1.FormBuilder])
], ProfileSettingsComponent);
exports.ProfileSettingsComponent = ProfileSettingsComponent;
//# sourceMappingURL=profile-settings.component.js.map