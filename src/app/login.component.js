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
var LoginComponent = (function () {
    function LoginComponent(fb, router, userService) {
        var _this = this;
        this.fb = fb;
        this.router = router;
        this.userService = userService;
        this.error = false;
        this.formErrors = {
            username: '',
            password: ''
        };
        this.validationMessages = {
            username: {
                'required': 'Username is required.',
                'minlength': 'Username must be at least 3 characters long.',
                'maxlength': 'Username cannot be more than 10 characters.',
                'pattern': 'Username can contain only letters, numbers or underscores.'
            },
            password: {
                'required': 'Password is required.',
                'minlength': 'Password must be at least 6 characters long.',
                'maxlength': 'Password cannot be more than 20 characters.'
            }
        };
        this.createForm();
        this.loginForm.valueChanges.subscribe(function () { return _this.onValueChanges(); });
    }
    LoginComponent.prototype.createForm = function () {
        this.loginForm = this.fb.group({
            username: ['', forms_1.Validators.compose([forms_1.Validators.required, forms_1.Validators.minLength(3), forms_1.Validators.maxLength(15), forms_1.Validators.pattern(/^[\w]+$/)])],
            password: ['', forms_1.Validators.compose([forms_1.Validators.required, forms_1.Validators.minLength(6), forms_1.Validators.maxLength(20)])]
        });
    };
    LoginComponent.prototype.onValueChanges = function () {
        if (!this.loginForm) {
            return;
        }
        var form = this.loginForm;
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
    LoginComponent.prototype.onSubmit = function (formData) {
        var _this = this;
        var username = formData.username;
        var password = formData.password;
        if (!username || !password) {
            return;
        }
        if (this.error) {
            this.errMsg = 'Please correct reported errors before submitting.';
            return;
        }
        if (this.userService.isLoggedIn()) {
            this.errMsg = 'You are already logged in.';
            return;
        }
        this.userService.login(username, password)
            .then(function (user_name) {
            // resetta la proprietà che consente al componente di visualizzare un messaggio in base all'update effettuato, per evitare di ritrovarcelo tra i piedi nel caso l'utente facesse il logout.
            _this.userService.accountChange = '';
            _this.router.navigate(['/profile', user_name]);
        }, function (err) {
            if (err.httpErr) {
                _this.httpErr = err.httpErr;
                _this.userService.sendNewError(err.httpErr);
            }
            else {
                _this.errMsg = err.errMsg;
            }
        });
    };
    LoginComponent.prototype.accountUpdate = function () {
        return this.userService.accountChange;
    };
    return LoginComponent;
}());
LoginComponent = __decorate([
    core_1.Component({
        selector: 'login',
        templateUrl: './login.component.html',
        styleUrls: ['./login.component.css']
    }),
    __metadata("design:paramtypes", [forms_1.FormBuilder, router_1.Router, user_service_1.UserService])
], LoginComponent);
exports.LoginComponent = LoginComponent;
//# sourceMappingURL=login.component.js.map