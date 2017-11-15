import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { UserService } from './user.service';

@Component({
    templateUrl: './signup.component.html',
    styleUrls: ['./signup.component.css']
})

export class SignupComponent {
    signupForm: FormGroup;
    error: boolean = false;
    httpErr: string;
    errMsg: string;
    formErrors: any = {
        username: '',
        password: '',
        confirmPassword: ''
    };
    validationMessages: any = {
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

    constructor(private fb: FormBuilder, private router: Router, private userService: UserService) {
        this.createForm();
        this.signupForm.valueChanges.subscribe(() => this.onValueChanges());
    }

    createForm() {
        this.signupForm = this.fb.group({
            username: ['', Validators.compose([Validators.required, Validators.minLength(3), Validators.maxLength(15), Validators.pattern(/^[\w]+$/)])],
            password: ['', Validators.compose([Validators.required, Validators.minLength(6), Validators.maxLength(20)])],
            confirmPassword: ['', Validators.compose([Validators.required])]
        });
    }

    onValueChanges() {
        if (!this.signupForm) { return; }
        const form = this.signupForm;
        this.error = false;
        for (const field in this.formErrors) {
            this.formErrors[field] = '';
            const control = form.get(field);
            if (control && control.dirty && !control.valid) {
                this.error = true;
                const messages = this.validationMessages[field];
                for (const key in control.errors) {
                    this.formErrors[field] += messages[key] + ' ';
                }
            }
        }
    }

    onSubmit(formData: any) {
        let username = formData.username;
        let password = formData.password;
        let confirmPassword = formData.confirmPassword;
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
            .then(user_name => this.router.navigate(['/profile', user_name]),
                  err => {
            if (err.httpErr) {
                this.httpErr = err.httpErr;
            } else {
                this.errMsg = err.errMsg;
            }
        });
    }

}
