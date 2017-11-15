import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription }   from 'rxjs/Subscription';

import { Board } from '../board';
import { UserService } from '../user.service';
import { ProfileService } from '../profile.service';
import { BoardDetailService } from '../board-detail.service';

@Component({
    selector: 'update-board-form',
    templateUrl: './update-board-form.component.html',
    styleUrls: ['./update-board-form.component.css']
})

export class UpdateBoardForm implements OnDestroy {
    showUpdateForm: boolean = false;
    showConfirm: boolean = false;
    @Input() currentBoard: Board;
    updateBoardForm: FormGroup;
    subscription: Subscription;
    error: boolean;
    submitError: string;
    formErrors: any = {
        boardCoverUrl: '',
        imgUrl: '',
        title: ''
    };
    validationMessages: any = {
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

    constructor(
    private userService: UserService,
     private bS: BoardDetailService,
     private pS: ProfileService,
     private fb: FormBuilder,
     private router: Router) {
        this.createForm();
        this.subscription = this.bS.updateBoardFormVisibility$.subscribe(val => this.showUpdateForm = val);
        this.updateBoardForm.valueChanges.subscribe(() => this.onValueChanges(this.updateBoardForm));
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }

    createForm() {
        this.updateBoardForm = this.fb.group({
            boardCoverUrl: ['', Validators.pattern(/\.(jpeg|jpg|gif|png)/g)],
            title: ['', Validators.pattern(/^[\w ]+$/i)],
            description: '',
            secret: false
        });
    }

    resetFormFields(): void {
        this.createForm();
    }

    onValueChanges(currentForm: any) {
        if (!this.updateBoardForm) {
            return;
        }
        const form = currentForm;
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
    abc(e: any): void {
        e.preventDefault();
    }

    updateBoard(formData: any): void {
        if (this.error) {
            this.submitError = 'Please correct reported errors before submitting.';
            return;
        }
        // copia il valore della proprietà ".title" nella variabile "oldTitle".
        let oldTitle: string;
        for (let p in this.currentBoard) {
            if (p === 'title') {
                oldTitle = this.currentBoard[p];
            }
        }
        // aggiurna i valori delle prorpietà inserite nell'oggetto "this.currentBoard".
        let selB = this.currentBoard;
        selB.coverUrl = formData.boardCoverUrl || selB.coverUrl || '';
        selB.title = formData.title || selB.title;
        selB.description = formData.description || selB.description || '';
        selB.secret = formData.secret;
        // questa espressione è necessaria per annullare il metodo ".reverse()" che applichiamo all'array immagini quando andiamo a creare il componente "board-details" nel caso tornassimo alla pagina dopo la modifica.
        selB.imgs.reverse();
        // aggiorna il docuemento relativo alla board sul server.
        this.pS.updateBoard(selB, oldTitle)
            .then((res) => null,
                  (err) => {
            this.userService.sendNewError(err);
            this.bS.showUpdateBoardForm(false);
        });
        this.hide('update-form');
        this.resetFormFields();
    }

    // elimina la board attuale dall'array.
    deleteBoard(): void {
        this.pS.deleteBoardFromArray(this.userService.myBoards, this.currentBoard);
        this.pS.deleteBoardFromArray(this.userService.boards, this.currentBoard);
        this.pS.removeBoard(this.currentBoard)
            .then((res) => {
            this.router.navigate(['/profile', this.userService.getMyUsername()]);
        },
                  (err) => {
            this.userService.sendNewError(err);
            this.bS.showUpdateBoardForm(false);
        });
    }

    show(elem: string, e?: any): void {
        if (elem === 'update-form') {
            this.bS.showUpdateBoardForm(true);
        }
        if (elem === 'confirm-window') {
            e.preventDefault();
            this.showConfirm = true;
        }
    }

    hide(elem: string, e?: any): void {
        if (elem === 'update-form') {
            if (e) e.preventDefault();
            this.bS.showUpdateBoardForm(false);
        }
        if (elem === 'confirm-window') {
            e.preventDefault();
            this.showConfirm = false;
        }
    }
}