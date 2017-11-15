import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { UserService } from './user.service';

@Component({
    templateUrl: './profile-settings.component.html',
    styleUrls: ['./profile-settings.component.css']
})

export class ProfileSettingsComponent {
    myData: any;
    profilePic: string;
    profileSettingsForm: FormGroup;
    loading: boolean;
    showElem: boolean;
    opComplete: boolean;
    error: boolean;
    httpErr: string;
    errMsg: string;
    formErrors: any = {
        email: '',
        firstName: '',
        surname: '',
        profilePicUrl: '',
        username: '',
        password: '',
        descriotion: ''
    };
    validationMessages: any = {
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

    constructor(private userService: UserService, private router: Router, private fb: FormBuilder) {
        this.myData = this.userService.myData;
        if (this.myData.photos[0]) {
            this.profilePic = this.myData.photos[0].value || '';
        }
        this.createForm();
        this.profileSettingsForm.valueChanges.subscribe(() => this.onValueChanges());
    }

    loggedIn(): boolean {
        return this.userService.isLoggedIn();
    }

    onValueChanges() {
        if (!this.profileSettingsForm) { return; }
        const form = this.profileSettingsForm;
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

    createForm(): void {
        this.profileSettingsForm = this.fb.group({
            email: ['', Validators.email],
            password: ['', Validators.compose([Validators.minLength(6), Validators.maxLength(20)])],
            firstName: ['', Validators.pattern(/^[\w ]+$/)],
            surname: ['', Validators.pattern(/^[\w ]+$/)],
            profilePicUrl: ['', Validators.pattern(/\.(jpeg|jpg|gif|png)/gi)],
            username: ['', Validators.compose([Validators.minLength(3), Validators.maxLength(15), Validators.pattern(/^[\w]+$/)])],
            description: ['', Validators.maxLength(300)]
        });
    }

    resetForm(e: any): void {
        e.preventDefault();
        this.createForm();
    }

    onSubmit(formData: any) {
        if (this.error) {
            this.errMsg = 'Please correct reported errors before submitting.';
            return;
        }
        // mostra l'icona di caricamento dell'operazione.
        this.loading = true;
        this.opComplete = false;
        // aggiorna il profilo
        this.userService.updateProfile(formData)
            .then((res) => {
            // quando la Promise ritorna nascondi l'icona di caricamento.
            this.loading = false;
            // se vi sono errori lancia un messaggio di errore in base a quello che il server ha ricontrato non conforme ad esempio username già utilizzati.
            if (!res.success) {
                this.error = true;
                this.formErrors.username = res.errMsg;
                return;
            } else {
                // se si sono modificate proprietà relative all'account
                if (formData.username || formData.password) {
                    // se si è modificato l'username
                    if (formData.username) {
                        // continua il caricamento.
                        this.loading = true;
                        // aggiorna le descrizioni di default delle immagini dell'utente con il nuovo username.
                        this.userService.updateMyImgs({newDisplayName: res.data.displayName, oldDisplayName: this.userService.myData.displayName, newUsername: formData.username})
                            .then((res2) => {
                            // rendi le modifiche visibili immediatamente all'utente aggiornando l'array 'myData'.
                            for (let prop in res.data) {
                                this.userService.myData[prop] = res.data[prop];
                            }
                            // notifica il tipo di 'update' effettuato, la proprietà verrà utilizzata dal componente 'login' per mostrare un messaggio specifico all'operazione compiuta.
                            this.userService.accountChange = 'updated';
                            // effetua il logout
                            this.userService.logout();
                            // naviga alla 'home' per rieffettaure il login.
                            this.router.navigate(['/home']);
                        },
                                  (err2) => this.httpErr = err2);
                    }
                } else if (formData.profilePicUrl) {
                    this.loading = true;
                    // se è stato inserito oltre alla "profilePic" anche un "firstName o un "surname".
                    if (formData.firstName || formData.surname) {
                        // mantieni visibile l'icona di caricamento-
                        this.loading = true;
                        // aggiorna il displayName visualizzato nella barra di navigazione.
                        this.userService.sendDisplayName(res.data.displayName);
                        // se il 'displayName' è diverso rispetto a quello precedente aggiorna la descrizione di default delle mie immagini con il nuovo displayName.
                        if (res.data.dispalyName !== this.userService.myData.displayName) {
                            this.userService.updateMyImgs({newDisplayName: res.data.displayName, oldDisplayName: this.userService.myData.displayName, newUsername: '', profilePicUrl: formData.profilePicUrl})
                                .then((res2) => {
                                for (let prop in res.data) {
                                    this.userService.myData[prop] = res.data[prop];
                                }
                                // visualizza messaggio che indica l'avvenuto salvataggio delle impostazioni profilo
                                this.opComplete = true;
                                // nascondi l'icona di caricamento all'interno del bottone 'save changes'.
                                this.loading = false;
                            },
                                      (err3) => this.httpErr = err3);
                        } else {
                            this.opComplete = true;
                            this.loading = false;
                        }
                    } else {
                        this.userService.updateMyImgs({newDisplayName: '', oldDisplayName: '', newUsername: '', profilePicUrl: formData.profilePicUrl})
                            .then((res2) => {
                            for (let prop in res.data) {
                                this.userService.myData[prop] = res.data[prop];
                            }
                            this.opComplete = true;
                            this.loading = false;
                        },
                                  (err3) => this.httpErr = err3);
                    }
                    this.opComplete = true;
                    this.loading = false;
                } else {
                    // se non sono stati modificati campi relativi all'account e se è stato modificato il displayName.
                    if (res.data.displayName) {
                        // mantieni visibile l'icona di caricamento-
                        this.loading = true;
                        // aggiorna il displayName visualizzato nella barra di navigazione.
                        this.userService.sendDisplayName(res.data.displayName);
                        // se il 'displayName' è stato diverso rispetto a quello precedente aggiorna la descrizione di default delle mie immagini con il nuovo displayName.
                        if (res.data.dispalyName !== this.userService.myData.displayName) {
                            this.userService.updateMyImgs({newDisplayName: res.data.displayName, oldDisplayName: this.userService.myData.displayName, newUsername: ''})
                                .then((res2) => {
                                for (let prop in res.data) {
                                    this.userService.myData[prop] = res.data[prop];
                                }
                                // visualizza messaggio che indica l'avvenuto salvataggio delle impostazioni profilo
                                this.opComplete = true;
                                // nascondi l'icona di caricamento all'interno del bottone 'save changes'.
                                this.loading = false;
                            },
                                      (err3) => this.httpErr = err3);
                        }
                        // se è stata effettuata una modifica da quelle elencate sopra semplicemente visualizza un messaggio di completamento dell'operazione e nascondi l'icona di caricamento.
                    } else {
                        this.opComplete = true;
                        this.loading = false;
                    }
                }
            }
        },
                  (err) => this.httpErr = err);
    }

    // cancella l'account
    deleteAccount(e: any): void {
        e.preventDefault();
        this.userService.deleteAccount()
            .then((res) => {
            this.userService.accountChange = 'deleted';
            this.userService.logout();
            this.router.navigate(['/home']);
        },
                  (err) => this.httpErr = err);
    }

    // la funzione consente di visualizzare immediatamente l'immagine di profilo inserita, nel caso che la URL inserita non sia conforme ai formati accettati lancia un'errore.
    replaceProfilePic(url: string): void {
        if (!/\.(jpeg|jpg|gif|png)/gi.test(url)) {
            this.error = true;
            this.formErrors.profilePicUrl = this.validationMessages.profilePicUrl.pattern;
            return;
        } else {
            this.error = false;
            this.formErrors.profilePicUrl = '';
            this.profilePic = url;
        }
    }

    // limita il numero di caratteri inseribili nella descrizione profilo.
    setStringLengthLimit (e: any, limit: number) {
        const str = this.profileSettingsForm.value.description;
        if (e.key.toLowerCase() === 'backspace') {
            return;
        }
        if (str.length >= limit) {
            e.preventDefault();
        }
    }

    // funzione utilizzata dal bottone 'delete' mostra un alert box di conferma cancellazione profilo.
    showConfirmBox(val: boolean, e?: any): void {
        if (e) e.preventDefault();
        this.showElem = val;
    }
}
