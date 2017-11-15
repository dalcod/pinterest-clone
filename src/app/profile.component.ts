import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { Location } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MasonryOptions } from 'angular2-masonry';

import 'rxjs/add/operator/switchMap';
import { Subscription } from 'rxjs/Subscription';

import { Board, Img } from './board';
import { UserService } from './user.service';
import { ProfileService } from './profile.service';

@Component({
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.css']
})

export class ProfileComponent implements OnInit, OnDestroy {
    method: string;
    username: string;
    displayName: string;
    profileDescription: string;
    avatar: string;
    isMyProfile: boolean;
    show1: boolean;
    show2: boolean;
    show3: boolean;
    show4: boolean;
    showBoards: boolean = true;
    showMyImgs: boolean;
    showSaveImgComp: boolean;
    selectedBoard: Board;
    boards: Board[] = [];
    myBoards: Board[] = [];
    secretBoards: Board[] = [];
    myImgs: Img[] = [];
    myImg: Img;
    boardForm: FormGroup;
    addBoardForm: FormGroup;
    addSecretBoardForm: FormGroup;
    subscription: Subscription;
    myOptions: MasonryOptions = {
        itemSelector: '.pun-frame',
        columnWidth: 15
    };
    // errors
    httpErr: string;
    submitError: string;
    imgError: boolean;
    publicBoardError: string;
    secretBoardError: string;
    error: boolean;
    formErrors: any = {
        boardCoverUrl: '',
        addTitle: '',
        addSecretTitle: '',
        title: ''
    };
    validationMessages: any = {
        boardCoverUrl: {
            'pattern': 'Invalid image URL.'
        },
        addTitle: {
            'pattern': 'Title must contain only letters or numbers.'
        },
        addSecretTitle: {
            'pattern': 'Title must contain only letters or numbers.'
        },
        title: {
            'pattern': 'Title must contain only letters or numbers.'
        }
    };


    constructor(private router: Router,
                 private userService: UserService,
                 private pS: ProfileService,
                 private route: ActivatedRoute,
                 private fb: FormBuilder,
                 private location: Location) {
        this.createForms();
        this.boardForm.valueChanges.subscribe(() => this.onValueChanges(this.boardForm));
        this.addBoardForm.valueChanges.subscribe(() => this.onValueChanges(this.addBoardForm));
        this.addSecretBoardForm.valueChanges.subscribe(() => this.onValueChanges(this.addSecretBoardForm));
        this.subscription = userService.saveImgComp$.subscribe((val) => this.showSaveImgComp = val);
    }

    ngOnInit() {
        this.isMyProfile = this.userService.isMyProfile;
        this.myBoards = this.userService.myBoards;
        // osserva se ci sono cambiamenti all'interno del parametro "username" relativo all'url. Nel caso vi siano cambiamenti provvedi ad invocare il metodo ".getUserData()".
        this.route.paramMap
            .switchMap((params: ParamMap) => {
            // ritorna i dati relativi all'utente.
            return this.userService.getUserData(params.get('username'))
                .then(data => {
                // resetta i dati 'profile' nel caso cambiassimo profilo all'interno di questo componente.
                this.resetProfileData();
                this.myBoards = this.userService.myBoards;
                // determina se il profilo che siamo attualmente visualizzando sia il nostro oppure no.
                this.isMyProfile = this.userService.isMyProfile;
                const boards = data.boards;
                // dividi le board pubbliche da quelle segrete e assegnale alle relative proprietà.
                boards.forEach((board: Board) => {
                    if (!board.secret) {
                        this.boards.push(board);
                    } else {
                        this.secretBoards.push(board);
                    }
                });
                this.boards.reverse();
                this.secretBoards.reverse();
                // estrai tutte le immagini dalle boards.
                this.getAllMyImgs();
                // imposta i dati profilo.
                this.username = data.accData.username;
                this.displayName = data.accData.displayName || data.accData.username;
                this.profileDescription = data.accData.description || '';
                if (data.accData.photos[0]) this.avatar = data.accData.photos[0].value || '';
            },
                      (err) => this.httpErr = err);
        }).subscribe(() => null);
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }

    loggedIn(): boolean {
        return this.userService.isLoggedIn();
    }

    resetProfileData(): void {
        this.boards = [];
        this.secretBoards = [];
        this.displayName = '';
        this.avatar = '';
        this.profileDescription = '';
    }

    createForms(): void {
        this.boardForm = this.fb.group({
            boardCoverUrl: ['', Validators.pattern(/\.(jpeg|jpg|gif|png)/g)],
            title: ['', Validators.pattern(/^[\w ]+$/i)],
            description: '',
            secret: false
        });
        this.addBoardForm = this.fb.group({
            addTitle: ['', Validators.pattern(/^[\w ]+$/i)]
        });
        this.addSecretBoardForm = this.fb.group({
            addSecretTitle: ['', Validators.pattern(/^[\w ]+$/i)]
        });
    }

    resetFormFields(): void {
        this.createForms();
    }

    onValueChanges(currentForm: any) {
        if (!this.boardForm || !this.addBoardForm || !this.addSecretBoardForm) {
            return;
        }
        const form = currentForm;
        this.error = false;
        this.submitError = '';
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

    // questa funzione ci consente di visualizzare nella sezione 'puns' o immagini, tutte le immagini inserite nelle nostre board estraendole grazie a un metodo dell'userService e assegnandole all'array 'myImgs'.
    getAllMyImgs(): void {
        this.myImgs = this.userService.getAllMyImgs();
    }

    // è necessario filtrare gli elementi cliccabili al solo 'div' in quel caso imposta la proprietà da visualizzare e naviga al componente 'image-details'.
    navigateToDetails(e: any, img: Img): void {
        if (e.target.localName === 'div') {
            this.userService.shownImg = img;
            this.router.navigate(['/image-details', 'profile']);
        }
    }

    // estrai la 'base url' dal link dell'immagine.
    processUrl(url: string): string {
        return this.userService.processUrl(url);
    }

    // se l'avatar non viene caricato dall'elemento 'img' lancia un errore.
    ifBrokenImg(): void {
        if (this.avatar === '') return;
        this.imgError = true;
    }

    // metodo utilizzato dal form 'update' ci consente di bloccare l'inserimento di caratteri nel caso avessimo raggiunto il limite di quelli possibili.
    setStringLengthLimit (e: any, limit: number) {
        const str = this.boardForm.value.description;
        if (e.key.toLowerCase() === 'backspace') {
            return;
        }
        if (str.length >= limit) {
            e.preventDefault();
        }
    }

    // al click sulla cover della board redirigi l'utente al componente 'board detail'.
    sendCurrentBoard(currBoard: Board): void {
        this.router.navigate(['/profile/' + this.username + '/' + currBoard.title]);
    }

    createBoard(_type: string, formData: any): void {
        if (_type === 'public') {
            if (!formData.addTitle) return;
            this.publicBoardError = '';
            // imposta le proprietà di default della board.
            const board: Board = {title: formData.addTitle, secret: false, imgs: []};
            this.resetFormFields();
            // se la board esiste già ritorna errore.
            if (this.pS.boardExist(this.myBoards, board)) {
                this.publicBoardError = 'A board with this name already exist.';
                return;
            }
            this.publicBoardError = '';
            // rendi la board disponibile localmente.
            this.boards.unshift(board);
            // rendi la board disponibile globalmente a tutti i componenti.
            this.userService.myBoards.unshift(board);
            // è necessario eseguire la stesa operazione per rendrere disponibile la nuova board al componente "board-detail"
            this.userService.boards.unshift(board);
            this.hide('public-form');
            // salva la board nel database.
            this.pS.addBoard(board)
                .then((res) => null,
                      (err) => this.httpErr = err);
        }
        if (_type === 'secret') {
            if (!formData.addSecretTitle) return;
            this.publicBoardError = '';
            const board = { title: formData.addSecretTitle, secret: true };
            this.resetFormFields();
            if (this.pS.boardExist(this.myBoards, board)) {
                this.secretBoardError = 'A board with this name already exist.';
                return;
            }
            this.secretBoardError = '';
            this.secretBoards.unshift(board);
            this.userService.myBoards.unshift(board);
            this.userService.boards.unshift(board);
            this.hide('secret-form');
            this.pS.addBoard(board)
                .then((res) => null,
                      (err) => this.httpErr = err);
        }
    }

    updateBoard(formData: any): void {
        if (this.error) {
            this.submitError = 'Please correct reported errors before submitting.';
            return;
        }
        // salva nella variabile 'oldTitle' attraverso il loop 'for..in' il vecchio titolo che ci consentirà in seguito, nel caso lo avessimo cambiato, di aggiornarlo all'interno del database.
        let oldTitle: string;
        for (let p in this.selectedBoard) {
            if (p === 'title') {
                oldTitle = this.selectedBoard[p];
            }
        }
        const selB = this.selectedBoard;
        // se è stata inserita una nuova cover salvala nella proprietà, altrimenti se non è stata inserita ma ve ne è già un'altra salva quest'ultima oppure se non vi è nessuna delle due opzioni salva una stringa vuota.
        selB.coverUrl = formData.boardCoverUrl || selB.coverUrl || '';
        selB.title = formData.title || selB.title;
        selB.description = formData.description || selB.description || '';
        const update = (boards1: Board[], boards2: Board[]) => {
            this.pS.deleteBoardFromArray(boards1, selB);
            selB.secret = formData.secret;
            this.pS.updateBoard(selB, oldTitle)
                .then((res) => null,
                      (err) => this.httpErr = err);
            boards2.unshift(selB);
            this.hide('update-form');
            this.resetFormFields();
        };
        // se la proprietà ".secret" è stata modificata da vera a falsa rimuovi la board dall'array 'segreto' e spostalo in quello 'pubblico', la condizione verifica lo stato della proprietà "secret" prima e dopo la sottomissione, quindi la proprietà "secret" di "formData" conterrà il suo valore attuale mentre la proprietà "secret" di "secretBoard" quello vecchio.
        if (formData.secret === false && this.selectedBoard.secret === true) {
            update(this.secretBoards, this.boards);
            return;
        }
        // contrario di quanto fatto sopra.
        if (formData.secret === true && this.selectedBoard.secret === false) {
            update(this.boards, this.secretBoards);
            return;
        }
        this.pS.updateBoard(selB, oldTitle)
            .then((res) => {
            this.hide('update-form');
            this.resetFormFields();
        },
                  (err) => this.httpErr = err );
    }

    // elimina la board selezionata dall'array.
    deleteBoard(): void {
        this.pS.deleteBoardFromArray(this.secretBoards, this.selectedBoard);
        this.pS.deleteBoardFromArray(this.boards, this.selectedBoard);
        // se nell'array "userservice.boards" è presente la board selezionata "selectedBoard" rimuovila, in questo modo la board non sarà più disponibile in tutti i componenti.
        this.pS.deleteBoardFromArray(this.userService.myBoards, this.selectedBoard);
        this.pS.deleteBoardFromArray(this.userService.boards, this.selectedBoard);
        this.myImgs.forEach((img, i) => {
            if (img.board === this.selectedBoard.title) {
                this.myImgs.splice(i, 1);
            }
        });
        this.pS.removeBoard(this.selectedBoard);
        this.hide('all-shown');
    }

    // funzione invocata dalla proprietà '@Output' 'newBoard' all'interno del componente 'save-image' nel caso decidessimo di creare una nuova board, nel caso aggiungi la nuova board all'array 'boards'.
    onNewBoard(e: Board): void {
        this.boards.unshift(e);
    }

    // funzione che ci consente di visualizzare e allo stesso tempo passare l'immagine su cui abbiamo cliccato dal componente 'save-image'.
    showSaveImgComponent(img: Img): void {
        this.myImg = img;
        this.showSaveImgComp = true;
    }

    show(elem: string, e?: any, board?: Board): void {
        if (elem === 'my-imgs') {
            this.showMyImgs = true;
            this.showBoards = false;
            return;
        }
        if (elem === 'boards') {
            this.showMyImgs = false;
            this.showBoards = true;
            return;
        }
        if (elem === 'public-form') {
            if (this.show2) {
                this.hide('secret-form');
            }
            this.show1 = true;
            return;
        }
        if (elem === 'secret-form') {
            if (this.show) {
                this.hide('public-form');
            }
            this.show2 = true;
            return;
        }
        if (elem === 'update-form' && board) {
            this.selectedBoard = board;
            this.show3 = true;
            return;
        }
        if (elem === 'confirm-window' && e) {
            e.preventDefault();
            this.show4 = true;
            return;
        }
    }

    hide(elem: string, e?: any): void {
        if (elem === 'public-form') {
            this.show1 = false;
            return;
        }
        if (elem === 'secret-form') {
            this.show2 = false;
            return;
        }
        if (elem === 'update-form') {
            this.show3 = false;
            return;
        }
        if (elem === 'confirm-window' && e) {
            e.preventDefault();
            this.show4 = false;
            return;
        }
        if (elem === 'public-secret-forms') {
            this.pS.hideAddBoardsForms(e, {show1: this.show1, show2: this.show2})
                .then((val) => {
                if (!val) {
                    // resetta l'errore nel caso sia presente
                    this.publicBoardError = '';
                    this.hide('public-form');
                    this.hide('secret-form');
                }
            });
        }
        if (elem === 'all-shown') {
            this.show1 = false;
            this.show2 = false;
            this.show3 = false;
            this.show4 = false;
        }
    }
}
