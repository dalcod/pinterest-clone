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
var SignupComponent = (function () {
    function SignupComponent(fb, router, userService) {
        var _this = this;
        this.fb = fb;
        this.router = router;
        this.userService = userService;
        this.error = false;
        this.formErrors = {
            username: '',
            password: '',
            confirmPassword: ''
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
            },
            confirmPassword: {
                'required': 'Password must be confirmed.'
            }
        };
        this.createForm();
        this.signupForm.valueChanges.subscribe(function () { return _this.onValueChanges(); });
    }
    SignupComponent.prototype.createForm = function () {
        this.signupForm = this.fb.group({
            username: ['', forms_1.Validators.compose([forms_1.Validators.required, forms_1.Validators.minLength(3), forms_1.Validators.maxLength(15), forms_1.Validators.pattern(/^[\w]+$/)])],
            password: ['', forms_1.Validators.compose([forms_1.Validators.required, forms_1.Validators.minLength(6), forms_1.Validators.maxLength(20)])],
            confirmPassword: ['', forms_1.Validators.compose([forms_1.Validators.required])]
        });
    };
    SignupComponent.prototype.onValueChanges = function () {
        if (!this.signupForm) {
            return;
        }
        var form = this.signupForm;
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
    SignupComponent.prototype.onSubmit = function (formData) {
        var _this = this;
        var username = formData.username;
        var password = formData.password;
        var confirmPassword = formData.confirmPassword;
        if (!username || !password || !confirmPassword) {
            this.errMsg = 'You must fill all the inputs before submitting.';
            return;
        }
        if (password !== confirmPassword) {
            this.errMsg = 'Cannot confirm password. Password doesn\'t match.';
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
        this.userService.signup(username, password)
            .then(function (user_name) { return _this.router.navigate(['/profile', user_name]); }, function (err) {
            if (err.httpErr) {
                _this.httpErr = err.httpErr;
            }
            else {
                _this.errMsg = err.errMsg;
            }
        });
    };
    return SignupComponent;
}());
SignupComponent = __decorate([
    core_1.Component({
        templateUrl: './signup.component.html',
        styleUrls: ['./signup.component.css']
    }),
    __metadata("design:paramtypes", [forms_1.FormBuilder, router_1.Router, user_service_1.UserService])
], SignupComponent);
exports.SignupComponent = SignupComponent;
//# sourceMappingURL=signup.component.js.map