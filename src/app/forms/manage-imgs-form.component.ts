import { Component, Input, Output, EventEmitter, OnInit, OnDestroy} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription }   from 'rxjs/Subscription';

import { Board, Img } from '../board';
import { UserService } from '../user.service';
import { ProfileService } from '../profile.service';
import { BoardDetailService } from '../board-detail.service';

@Component({
    selector: 'manage-imgs-form',
    templateUrl: './manage-imgs-form.component.html',
    styleUrls: ['./manage-imgs-form.component.css']
})

export class ManageImgsForm implements OnInit, OnDestroy {
    showOptions: boolean = false;
    showMngImgForm: boolean = false;
    selTitle: string;
    initVal: string;
    @Input() op: string;
    @Input() currentBoard: Board;
    @Input() selectedImgs: Img[];
    @Output() opCompleted = new EventEmitter<boolean>();
    options: Board[];
    selIndex: number;
    mngImgForm: FormGroup;
    searchCreateBoardForm: FormGroup;
    subscription: Subscription;

    error: string;
    formErrors: any = {
        'search-create-board': ''
    };
    validationMessages: any = {
        'search-create-board': {
            'pattern': 'Title must contain only letters or numbers.'
        }
    };

    constructor(
    private userService: UserService,
     private bS: BoardDetailService,
     private pS: ProfileService,
     private fb: FormBuilder) {
        this.subscription = this.bS.mngImgsFormVisibility$.subscribe(val => this.showMngImgForm = val);
        this.createForms();
        this.searchCreateBoardForm.valueChanges.subscribe(() => this.onValueChanges());
    }

    ngOnInit(): void {
        // imposta il valore iniziale della porprietà a cui fa riferimento la selezione.
        this.initVal = 'Select a board...';
        // non includere nell'array "options" la board attuale.
        this.options = this.userService.myBoards.filter((elem) => elem.title !== this.currentBoard.title);
    }

    ngOnDestroy(): void {
        this.subscription.unsubscribe();
    }

    createForms(): void {
        this.mngImgForm = this.fb.group({
            select: ['']
        });
        this.searchCreateBoardForm = this.fb.group({
            'search-create-board': ['',  Validators.pattern(/^[\w ]+$/i)]
        });
    }

    resetFormFields(): void {
        this.createForms();
    }

    onValueChanges() {
        if (!this.searchCreateBoardForm) {
            return;
        }
        const form = this.searchCreateBoardForm;
        for (const field in this.formErrors) {
            this.formErrors[field] = '';
            const control = form.get(field);
            if (control && control.dirty && !control.valid) {
                const messages = this.validationMessages[field];
                for (const key in control.errors) {
                    this.formErrors[field] += messages[key] + ' ';
                }
            }
        }
    }

    updateImgs(): void {
        this.error = '';
        if (!this.selTitle) {
            return;
        }
        if (this.op === 'move') {
            let imgsToUpdate = this.selectedImgs;
            let doubleImgs: Img[] = [];
            this.userService.myBoards.forEach((elem) => {
                // se il titolo della board "elem.title" combacia con il titolo della board selezionata "this.selTitle"
                if (elem.title === this.selTitle) {
                    // se sono presenti delle immagini con la stessa url e quindi già presenti nella board di destinazione procedi ad inserirle nell'array "doubleImgs".
                    imgsToUpdate.forEach((elem2, i2) => {
                        elem.imgs.forEach((elem3, i3) => {
                            if (elem2.url === elem3.url) {
                                doubleImgs.push(elem2);
                            }
                        });
                    });
                }
            });
            // se sono presenti immaggini nell'array "doubleImgs" lancia un errore e ritorna la funzione.
            if (doubleImgs[0]) {
                this.error = 'There are duplicated images.';
                return;
            } else {
                // crea un pattern regExp che combaci la descrizione di default dell'immagine.
                let regPatt = new RegExp((this.userService.myData.displayName || this.userService.myData.username) + ': ' + this.currentBoard.title, 'gi');
                // se non sono presenti delle immagini con lo stesso nome nell'array di destinazione rimuovi le immagini dalla board in cui è attualmente inserita
                this.userService.boards.forEach((elem) => {
                    if (elem.title === this.currentBoard.title) {
                        console.log('1')
                        // rimuovi le immagini dall'array "imgs" della board attuale/corrente.
                        imgsToUpdate.forEach((elem2) => {
                            // aggiorna il valore della proprietà "board" inserita all'interno dell'oggetto "elem2" con il titolo della board di destinazione "this.selTitle" e la descrizione automatica. 
                            elem2.board = this.selTitle;
                            // se l'espressione regExp combacia con la descrizione di default dell'immagine procedi ad aggiornarla con una che sostitusca il nome della board attuale con quella di destinazione.
                            if (regPatt.test(elem2.description)) {
                                elem2.description = (this.userService.myData.displayName || this.userService.myData.username) + ': ' + elem2.board;
                            }
                            elem.imgs.forEach((elem3, i) => {
                                if (elem2.url === elem3.url) {
                                    console.log('3')
                                    elem.imgs.splice(i, 1);
                                }
                            });
                        });
                    }
                }); 
                this.hide('mng-img-form');
                this.opCompleted.emit(true);
                this.bS.moveImages(imgsToUpdate, this.currentBoard.title, this.selTitle)
                    .then((res) => null,
                          (err) => {
                    this.userService.sendNewError(err);
                    this.showOptions = false;
                    this.bS.showMngImgsForm(false);
                });
            }
        }
        if (this.op === 'copy') {
            this.error = '';
            let imgsToUpdate = this.selectedImgs;
            let doubleImgs: Img[] = [];
            this.userService.boards.forEach((elem) => {
                if (elem.title === this.selTitle) {
                    imgsToUpdate.forEach((elem2, i2) => {
                        elem.imgs.forEach((elem3, i3) => {
                            if (elem2.url === elem3.url) {
                                doubleImgs.push(elem2);
                            }
                        });
                    });
                }
            });
            if (doubleImgs[0]) {
                this.error = 'There are duplicated images.';
                return;
            } else {
                this.hide('mng-img-form');
                this.opCompleted.emit(true);
                let regPatt = new RegExp((this.userService.myData.displayName || this.userService.myData.username) + ': ' + this.currentBoard.title, 'gi');
                // aggiorna il valore della proprietà "board" inserita all'interno dell'oggetto "elem" con il titolo della board di destinazione "this.selTitle".
                imgsToUpdate.forEach((elem) => {
                    elem.board = this.selTitle;
                    if (regPatt.test(elem.description)) {
                        elem.description = (this.userService.myData.displayName || this.userService.myData.username) + ': ' + elem.board;
                    }
                });
                this.bS.copyImages(imgsToUpdate, this.selTitle)
                    .then((res) => null,
                          (err) =>{
                    this.userService.sendNewError(err);
                    this.showOptions = false;
                    this.bS.showMngImgsForm(false);
                });
            }
        }
    }

    selectValue(title: string, i: number): void {
        this.error = '';
        this.hide('options');
        this.selIndex = i;
        this.selTitle = title;
        this.initVal = this.selTitle;
    }

    createBoard(formData: any): void {
        if (!formData['search-create-board'] || this.formErrors['search-create-board']) return;
        let board: Board = {title: formData['search-create-board'], secret: false, imgs: []};
        this.resetFormFields();
        this.initVal = formData['search-create-board'];
        this.selTitle = formData['search-create-board'];
        this.hide('options');
        if (this.pS.boardExist(this.userService.myBoards, board)) {
            this.error = 'A board with this name already exist.';
            return;
        }
        this.error = '';
        this.options.unshift(board);
        this.userService.myBoards.unshift(board);
        this.userService.boards.unshift(board);
        this.pS.addBoard(board)
            .then((res) => null,
                  (err) => {
            this.userService.sendNewError(err);
            this.showOptions = false;
            this.bS.showMngImgsForm(false);
        });
    }

    show(elem: string, e?:any): void {
        if (elem === 'mng-img-form') {
            this.bS.showMngImgsForm(true);
        }
        // il parametro "e" è necessaio per evitare che nel momento in cui cliccheremo sul capo input quest'ultimo faccia scattare la sua funzionalità di default tipica degli input tipo "text" ma a noi interessa che si comporti come un elemento tipo "<select>".
        if (elem === 'options') {
            if (e) e.preventDefault();
            this.showOptions = true;
        }
    }

    hide(elem: string, e?: any): void {
        if (elem === 'mng-img-form') {
            if (e) {
                e.preventDefault();
                // resetta selezione;
                this.selTitle = '';
                this.initVal = '';
            };
            this.showOptions = false;
            this.bS.showMngImgsForm(false);
            return;
        }
        if (elem === 'options') {
            if (e) {
                this.bS.hideFormOptions(e, this.showOptions)
                    .then((res) => {
                    if (!res) {
                        this.showOptions = false;
                    }
                });
            } else {
                this.showOptions = false;
            }
        }
    }
}