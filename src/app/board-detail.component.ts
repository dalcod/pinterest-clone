import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MasonryOptions } from 'angular2-masonry';
import {  } from '';

import { Subscription } from 'rxjs/Subscription';

import { Board, Img } from './board';
import { BoardDetailService } from './board-detail.service';
import { UserService } from './user.service';

@Component({
    templateUrl: './board-detail.component.html',
    styleUrls: ['./board-detail.component.css'],
    providers: [BoardDetailService]
})

export class BoardDetailComponent implements OnInit, OnDestroy {
    showUpdateForm: boolean;
    showAddImageForm: boolean;
    showImgOptions: boolean;
    showAddImgDetail: boolean;
    showMngImgForm: boolean;
    showAlert: boolean;
    showSaveImgComp: boolean;
    canActivateLoad: boolean;
    isMyProfile: boolean;
    op: string;
    control: string[] = [];
    setMenuClasses: {};
    setNavClasses: {};
    subscription: Subscription;
    subscription2: Subscription;
    subscription3: Subscription;
    subscription4: Subscription;
    addImageForm: FormGroup;
    addImgDetailsForm: FormGroup;
    board: Board;
    myBoards: Board[] = [];
    username: string;
    displayName: string;
    img: Img = {url: '',
                title: '',
                description: 'No description',
                createdBy: '',
                displayName: '',
                board: '',
                profilePicUrl: ''};
    myImg: Img;
    imgsArr: Img[];
    checkedImgs: Img[] = [];
    myOptions: MasonryOptions = {
        itemSelector: '.pun-frame',
        columnWidth: 15
    };
    // errors
    error: boolean;
    errMsg: string;
    httpErr: string;
    formErrors: any = {
        imgUrl: '',
        title: ''
    };
    validationMessages: any = {
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
     private fb: FormBuilder,
     private route: ActivatedRoute,
     private router: Router) {
        // observer che gestisce visibilità del componente 'manage-img-form'.
        this.subscription = bS.mngImgsFormVisibility$.subscribe(val => this.showMngImgForm = val);
        // observer che gestisce visibilità del componente 'update-board-form'.
        this.subscription2 = bS.updateBoardFormVisibility$.subscribe(val => this.showUpdateForm = val);
        // observer che gestisce visibilità del componente 'save-image'.
        // ... spostare observable "saveImgComp$" dal "HomeService" al "UserService" ed eliminare il primo da questo componente.
        this.subscription3 = userService.saveImgComp$.subscribe((val) => this.showSaveImgComp = val);
        this.subscription4 = userService.handleError$.subscribe((err) => this.httpErr = err);
        // resetta nel caso sia necessario la visualizzazione della barra per la modifica immagini.
        this.setCurrentClasses();
        this.createForms();
        this.addImageForm.valueChanges.subscribe(() => this.onValueChanges2(this.addImageForm));
        this.addImgDetailsForm.valueChanges.subscribe(() => this.onValueChanges(this.addImgDetailsForm));
    }

    ngOnInit() {
        this.myBoards = this.userService.myBoards;
        const profileUsername = this.route.snapshot.paramMap.get('username');
        const title = this.route.snapshot.paramMap.get('board-title');
        this.userService.getUserData(profileUsername)
            .then((obj) => {
            obj.boards.forEach((board: Board) => {
                if (board.title === title) {
                    this.board = board;
                }
            });
            this.imgsArr = this.board.imgs.reverse();
            this.username = this.userService.getMyUsername();
            this.displayName = this.userService.myData.displayName || this.username;
            // "isMyProfile" non funziona se si passa direttamente al link "/profile/username/board"
            this.isMyProfile = this.userService.isMyProfile;
            this.setAddImageClasses();
            this.setBoardInfoClasses();
            this.setBoardImgClasses();
        },
                  (err) => this.httpErr = err);
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
        this.subscription2.unsubscribe();
        this.subscription3.unsubscribe();
        this.subscription4.unsubscribe();
    }

    createForms(): void {
        // non so per quale motivo ma "Validators.pattern(/\.(jpeg|jpg|gif|png)/gi)" non funziona come dovrebbe.
        this.addImageForm = this.fb.group({
            imgUrl: ['']
        });
        this.addImgDetailsForm = this.fb.group({
            title: ['', Validators.pattern(/^[\w ]+$/i)],
            description: '',
        });
    }

    resetFormFields(): void {
        this.createForms();
    }

    onValueChanges(currentForm: any) {
        if (!currentForm) {
            return;
        }
        const form = currentForm;
        this.error = false;
        this.errMsg = '';
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

    // questa funzione invece funziona a differenza del "Validators.pattern()".
    onValueChanges2(currentForm: any) {
        if (!currentForm) {
            return;
        }
        this.error = false;
        this.errMsg = '';
        this.formErrors['imgUrl'] = '';
        const val = currentForm.value.imgUrl;
        if (!/\.(jpeg|jpg|gif|png)/gi.test(val)) {
            this.error = true;
            const messages = this.validationMessages['imgUrl'];
            this.formErrors['imgUrl'] = messages['pattern'];
        }
    }

    // funzione consumata a sua volta dalla funzione "addImgDetails()" per mostrare le modifiche effettuate all'immagine.
    resetImgsArr(): void {
        const delay = 10;
        const arr: Img[] = [];
        // sovrascrive la proprietà nell'array se l'immagine è stata modificata.
        this.imgsArr.forEach((imgObj, i) => {
            if (imgObj.url === this.img.url) {
                this.imgsArr[i] = this.img;
            }
        });
    }

    // imposta un modo per rimuovere le immagini "rotte" dalla board automaticamente, avvisando l'utente dell'avvenuta operzione.

    onImageError(img: Img): void {
        // nel caso ci sia un'immagine rotta sostituisci la URL dell'immagine con un'altra che indichi l'errore.
        this.imgsArr.forEach((elem, i) => {
            if (elem.url === img.url) {
                elem.broken = true;
            }
        });

        this.bS.updateImage(img, this.board.title)
            .then((res) => null,
                  (err) => this.httpErr = err);
    }

    // funzione utilizzata dall'elemento/form 'add-img' per la sottomissione dei dati inseriti dall'utente.
    addImage(formData: any): void {
        if (!formData.imgUrl) return;
        let imgExist = false;
        // se l'immagine è già presente segnala un errore.
        this.board.imgs.forEach((elem) => {
            if (elem.url === formData.imgUrl) {
                this.errMsg = 'This image already exist.';
                imgExist = true;
            }
        });
        if (this.error || imgExist) {
            if (this.error) {
                this.errMsg = 'Correct errors before submitting.';
            }
            return;
        }
        this.canActivateLoad = false;
        this.img.url = formData.imgUrl;
        this.img.createdBy = this.username;
        this.img.description = (this.userService.myData.displayName || this.userService.myData.username) + ': ' + this.board.title;
        this.img.displayName = this.userService.myData.displayName || this.userService.myData.username;
        this.img.board = this.board.title;
        this.img.source = true;
        this.img.profilePicUrl = this.userService.myData.profilePicUrl;
        this.imgsArr.unshift(this.img);
        this.canActivateLoad = true;
        this.bS.addImage(this.img, this.board.title)
            .then((res) => {
            // è necessario resettare l'oggetto per evitare bug.
            this.img = {url: '',
                        title: '',
                        description: '',
                        createdBy: '',
                        displayName: '',
                        board: '',
                        profilePicUrl: ''};
        },
                  (err) => this.httpErr = err);
    }

    // funzione utilizzata dall'elemento/form 'add-img-details' per la sottomissione dei dati inseriti dall'utente.
    addImgDetails(formData: any): void {
        // se il form è vuoto non sottomettere.
        if (!formData.title && !formData.description) {
            return;
        }
        this.img.title = formData.title || this.img.title;
        this.img.description = formData.description || this.img.description;
        this.resetImgsArr();
        this.show('add-img-details', false);
        this.bS.updateImage(this.img, this.board.title)
            .then((res) => {
            // è necessario resettare l'oggetto per evitare bug.
            this.img = {url: '',
                        title: '',
                        description: '',
                        createdBy: '',
                        displayName: '',
                        board: '',
                        profilePicUrl: ''};
        },
                  (err) => this.httpErr = err);
    }

    // funzione utilizzata per cancellare le immagini
    deleteImages(): void {
        if (!this.checkedImgs[0]) {
            this.showAlert = true;
            return;
        }
        // rimuovi dall'array 'imgsArr' le immagini che abbiamo selezionato inserite nell'array 'checkedImgs', in modo da rendere visibile l'eliminazione immediatamente.
        this.checkedImgs.forEach((elem) => {
            this.imgsArr.forEach((elem2, i) => {
                if (elem.url === elem2.url) {
                    this.imgsArr.splice(i, 1);
                }
            });
        });
        // rimuovi le immagini selezionate dal database.
        this.bS.deleteImages(this.checkedImgs, this.board.title)
            .then((res) => {
            // resetta le selezioni delle immagini.
            this.checkedImgs = [];
            this.control = [];
        },
                  (err) => this.httpErr = err);
    }

    // la funzione viene invocata da un evento tipo '@Output' all'interno del componente 'manage-images-form' quando l'operazione di spostamento o copiatura è stata completata e resetta le varie proprietà utilizzate per l'operazione richiesta e d esegui il 'refresh' della pagina resettando e reimpostando l'array delle immagini.
    onOpCompleted(e: any): void {
        if (e) {
            this.control = [];
            this.checkedImgs = [];
            // è necessario forzare l'aggiornamento dell'array quando spostiamo o copiamo le immagini, dato che il programma tende a non aggiornarsi a volte.
            this.imgsArr = [];
            this.imgsArr = this.board.imgs.reverse();
        }
    }

    checkImg(img: Img): void {
        // questa operazione ci consente nel caso una determinata immagine sia già stata selezionata di rimuoverla dall'array di controllo delle immagini segnate in modo tale da indicare ad angular che vogliamo deselezionare l'immagine.
        // altrimenti procedi nell'inserire l'immagine e l'id dell'immagine nei rispettivi array.  
        if (this.control.indexOf(img.url) !== -1) {
            const index = this.control.indexOf(img.url);
            this.control.splice(index, 1);
            this.checkedImgs.splice(index, 1);
        } else {
            this.checkedImgs.push(img);
            this.control.push(img.url);
        }
    }

    // la funzione viene utilizzata per creare l'effetto 'check' o 'de-check' all'interno delle immagini che decidiamo di modificare.
    alreadyChecked(img: Img): boolean {
        if (this.control.indexOf(img.url) === -1) {
            return true;
        }
    }

    // funzione utlizzata dall'elemento adibito allo spostamento o alla copiatura delle immagini per resettare le opzioni all'interno dell'elemento 'pseudo-select'.
    resetOptions(): void {
        this.showImgOptions = false;
        this.setCurrentClasses();
        this.control = [];
        this.checkedImgs = [];
    }

    // funzione utilizzata dai vari link all'interno dell'immagine per processare le varie URL di origine dell'immagine in modo tale da estrarre la 'base URL', inoltre nel caso l'immagine provenga da 'deviant art' non avendo quest'ultimo una 'base URL' la funzione passa quest'ultima direttamente.
    processUrl(url: string): string {
        return this.userService.processUrl(url);
    }

    // la funzione viene utilizzata per creare l'effetto 'slide' della barra di modifica immagini.
    setCurrentClasses(): void {
        this.setMenuClasses = {
            'img-menu-slide-up': !this.showImgOptions,
            'img-menu-slide-down': this.showImgOptions
        };
        this.setNavClasses = {
            'img-nav-slide-up': !this.showImgOptions,
            'img-nav-slide-down': this.showImgOptions
        };
    }

    // questa funzione insieme alla succssiva è utilizzata per nascondere il form per l'aggiunta e la barra di modifica delle immagini nel caso in cui l'utente che visitasse la pagina non sia il proprietario del profilo. Inoltre vengono utilizzate le vaire classi per risettare i margini dei vari elementi. 
    addImageClasses: {};
    setAddImageClasses(): void {
        this.addImageClasses = {
            'visible': this.isMyProfile,
            'hidden': !this.isMyProfile
        };
    }

    boardInfoClasses: {};
    setBoardInfoClasses(): void {
        this.boardInfoClasses = {
            'board-info-margin1': !this.isMyProfile,
            'board-info-margin2': this.isMyProfile
        };
    }

    boardImgClasses: {};
    setBoardImgClasses(): void {
        this.boardImgClasses = {
            'board-img-row-margin1': !this.isMyProfile,
            'board-img-row-margin2': this.isMyProfile
        };
    }

    // invia l'immagine da visualizzare al servizio 'userService' e quindi al componente 'image-details' e naviga a quest'ultimo.
    navigateToDetails(img: Img): void {
        this.userService.shownImg = img;
        this.router.navigate(['/image-details', 'board-detail']);
    }

    // mostra l'elemnto/form 'add-img-details'
    showImgDetailsForm(img: Img): void {
        this.show('add-img-details', true);
        this.img = img;
    }

    // mostra il componante 'save-image'.
    showSaveImgComponent(img: Img): void {
        this.myImg = img;
        this.showSaveImgComp = true;
    }

    // come il nome implica la funzione gestisce la visualizzazione o l'occultamento dei vari elementi/componenti pop-up.
    show(elem: string, val: boolean, e?: any, op?: string): void {
        if (elem === 'update-form') {
            this.showUpdateForm = val;
        }
        if (elem === 'add-image-form') {
            // nascondi al click-out del elemento.
            if (!val && e) {
                this.bS.hideAddImageForm(e, this.showAddImageForm)
                    .then((res) => {
                    if (!res) {
                        this.showAddImageForm = res;
                    }
                });
            } else {
                this.showAddImageForm = val;
            }
        }
        if (elem === 'mng-img-form' && op) {
            // se non ci sono immagini selezionate per essere spostate o copiate mostra messaggio di allerta.
            if (!this.checkedImgs[0]) {
                this.showAlert = true;
                return;
            }
            // la proprietà 'op' verrà passata al componente 'manage-image-form' e consentirà a quest'ultimo di capire se abbiamo cliccato sul pulsante 'move' o 'copy' e quindi agire di conseguenza.
            this.op = op;
            this.showMngImgForm = val;
        }
        if (elem === 'img-options') {
            this.showImgOptions = true;
            this.setCurrentClasses();
        }
        if (elem === 'add-img-details') {
            if (!val) {
                // nascondi al click-out del elemento.
                if (e) {
                    this.bS.hideAddImgDetailsForm(e, this.showAddImgDetail)
                        .then((res) => {
                        if (!res) {
                            this.showAddImgDetail = res;
                        }
                    });
                    return;
                }
                this.showAddImgDetail = val;
            } else {
                this.showAddImgDetail = val;
            }
        }
        if (elem === 'alert-box') {
            this.showAlert = val;
        }
    }

}
