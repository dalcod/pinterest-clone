import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { UserService } from './user.service';

@Component({
    selector: 'login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css']
})

export class LoginComponent {
    loginForm: FormGroup;
    error: boolean;
    httpErr: string;
    errMsg: string;
    formErrors: any = {
        username: '',
        password: ''
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
        }
    };

    constructor(private fb: FormBuilder, private router: Router, private userService: UserService) {
        this.createForm();
        this.loginForm.valueChanges.subscribe(() => this.onValueChanges());
    }

    createForm() {
        this.loginForm = this.fb.group({
            username: ['', Validators.compose([Validators.required, Validators.minLength(3), Validators.maxLength(15), Validators.pattern(/^[\w]+$/)])],
            password: ['', Validators.compose([Validators.required, Validators.minLength(6), Validators.maxLength(20)])]
        });
    }

    onValueChanges() {
        if (!this.loginForm) { return; }
        const form = this.loginForm;
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
        const username = formData.username;
        const password = formData.password;
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
            .then(user_name => {
            // resetta la proprietà che consente al componente di visualizzare un messaggio in base all'update effettuato, per evitare di ritrovarcelo tra i piedi nel caso l'utente facesse il logout.
            this.userService.accountChange = '';
            this.router.navigate(['/profile', user_name]);
        },
                  err => {
            if (err.httpErr) {
                this.httpErr = err.httpErr;
                this.userService.sendNewError(err.httpErr);
            } else {
                this.errMsg = err.errMsg;
            }
        });
    }

    accountUpdate(): string {
        return this.userService.accountChange;
    }
}
