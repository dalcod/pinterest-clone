import { Component, Input, Output, OnInit, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { Board, Img } from './board';
import { UserService } from './user.service';
import { ProfileService } from './profile.service';
import { SaveImageService } from './save-img.service';

@Component({
    selector: 'save-img-comp',
    templateUrl: './save-img.component.html',
    styleUrls: ['./save-img.component.css'],
    providers: [ SaveImageService ]
})

export class SaveImageComponent implements OnInit {
    @Input() img: Img;
    @Input() boards: Board[];
    @Output() newBoard = new EventEmitter<Board>();
    showForm: boolean;
    showSaveImgOpt: boolean = true;
    checked: boolean;
    // canSave: boolean = false;
    boardForm: FormGroup;
    alertMsg: string = '';
    error: boolean;
    errMsg: string;
    formErrors: any = {
        boardTitle: '',
    };
    validationMessages: any = {
        boardTitle: {
            'required': 'Title is required.',
            'pattern': 'The title must contain only letters, numbers or underscores.'
        },
    };

    constructor(private userService: UserService,
                 private fb: FormBuilder,
                 private si: SaveImageService,
                 private ps: ProfileService) {
        this.createForm();
        this.boardForm.valueChanges.subscribe(() => this.onValueChanges());
    }

    ngOnInit() {
        this.userService.myBoards.forEach((board, i) => {
            board.imgs.forEach((img) => {
                if (this.img.url === img.url) {
                    this.alertMsg = 'You have already saved this image in the \'' + board.title + '\' board.';
                }
            });
            // ??? onestamente non so a cosa serve questa condizione
            /* if (i === this.userService.myBoards.length - 1) {
                this.canSave = true;
            } */
        });
    }

    createForm(): void {
        this.boardForm = this.fb.group({
            boardTitle: ['', Validators.compose([Validators.required, Validators.pattern(/^[\w]+$/)])]
        });
    }

    resetForm(): void {
        this.createForm();
    }

    onValueChanges() {
        if (!this.boardForm) { return; }
        const form = this.boardForm;
        this.error = false;
        this.errMsg = '';
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

    // versione leggera della funzione che viene dopo la quale oltre a salvare l'immagine crea anche la board in cui sarà salvata.
    saveImg(title: string): void {
        /* if (this.canSave) { */
        this.img.source = false;
        this.img.board = title;
        this.userService.saveImage(title, this.img)
            .then((res) => {
            this.hideComp();
        },
                  (err) => {
            this.userService.sendNewError(err);
            this.userService.showSaveImgComp(false);
        });
        /* } */
    }

    onSubmit(formData: any): void {
        this.errMsg = '';
        const title = formData.boardTitle;
        const secret = this.checked;
        if (!title) {
            this.errMsg = 'You must insert a title';
            return;
        }
        if (this.error) {
            this.errMsg = 'Please Correct reported errors';
            return;
        }
        const board: Board = {
            title: title,
            description: '',
            secret: secret,
            imgs: []
        };
        // impostiamo il valore di source su 'false' in modo da non visualizzare l'immagine duplicata nella 'home'.
        this.img.source = false;
        this.img.board = title;
        this.ps.addBoard(board)
            .then((res) => {
            // procedi al salvataggio dell'immagine nella nuova board.
            this.userService.saveImage(board.title, this.img)
                .then((res2) => {
                board.imgs.push(this.img);
                this.newBoard.emit(board);
                this.hideComp();
            },
                      (err2) => {
                this.userService.sendNewError(err2);
                this.userService.showSaveImgComp(false);
            });
        },
                  (err) => {
            this.userService.sendNewError(err);
            this.userService.showSaveImgComp(false);
        });
    }

    show(elem: string): void {
        if (elem === 'form') {
            this.showForm = true;
            this.showSaveImgOpt = false;
        }
        if (elem === 'save-img-options') {
            this.showForm = false;
            this.showSaveImgOpt = true;
            this.resetForm();
        }
    }

    // nascondi il componente al click-out utilizzando un metodo che itera tra gli elementi all'interno del DOM in cerca di uno che abbia come classe 'click-out' se lo trova il servizio ci consentirà di trovare un valore che sarà passato al componente padre di questo componente, il quale tramite un observer lo nasconderà.
    hideComp(e?: any): void {
        if (e) {
            this.si.hideSaveImgComp(e)
                .then((res) => {
                if (!res) {
                    this.userService.showSaveImgComp(res);
                }
            });
            return;
        } else {
            this.userService.showSaveImgComp(false);
        }
    }

    // funzione utilizzata per switchare tra le due icone 'toggle' 
    toggleCheck(): void {
        this.checked = !this.checked;
    }
}
