import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { MasonryOptions } from 'angular2-masonry';

import { Subscription }   from 'rxjs/Subscription';

import { UserService } from './user.service';
import { SearchService } from './search.service';

import { Board, Img } from './board';

@Component({
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.css']
})

export class HomeComponent implements OnInit, OnDestroy {
    showSaveImgComp: boolean;
    nothingFound: boolean;
    searchTerm: string;
    img: Img;
    imgs: Img[];
    boards: Board[];
    subscription: Subscription;
    subscription2: Subscription;
    subscription3: Subscription;
    myOptions: MasonryOptions = {
        itemSelector: '.pun-frame',
        columnWidth: 15
    };
    httpErr: string;

    constructor (private router: Router, private userService: UserService, private searchService: SearchService) {
        // osserva lo stato di visualizzazione dell'elemento 'save-image'.
        this.subscription = userService.saveImgComp$.subscribe((val) => this.showSaveImgComp = val);
        // osserva se un termine viene cercato.
        this.subscription2 = searchService.inputTerm$.subscribe((term) => {
            this.searchTerm = term;
            this.searchImgs(this.searchTerm);
        });
        // ossreva se un errore nel componenete figlio 'login' viene emesso e se sì assegna il valore alla proprietà 'httpErr'.
        this.subscription3 = userService.handleError$.subscribe((err) => this.httpErr = err);
    }

    ngOnInit(): void {
        // se l'utente è loggato
        if (this.loggedIn()) {
            // ottieni tutte le immagini e filtrale invocando il metodo 'serchImgs()' nel caso sia stato rilevato un termine di ricerca, oppure filtrale in base al codice sorgente.
            this.userService.getAllImgs()
                .then((res) => {
                // se la ricerca è stata effettuata al di fuori del componente 'home'
                if (!this.searchTerm && this.searchService.searchTerm) {
                    this.searchTerm = this.searchService.searchTerm;
                    this.searchImgs(this.searchTerm);
                    return;
                }
                this.imgs = this.userService.imgs.filter((img) => img.source === true && !img.broken);
            },
                      (err) => this.httpErr = err);
            // la proprietà è consumata dal componente figlio "save-img"
            this.boards = this.userService.myBoards;
        }
    }

    ngOnDestroy(): void {
        this.subscription.unsubscribe();
        this.subscription2.unsubscribe();
        this.subscription3.unsubscribe();
    }

    // ogni qual volta che sottomettiamo un termine nel campo input di ricerca questo viene passato a questa funzione che lo trasformerà in una nuova regular expression e filtrerà l'array 'imgs' in base a quest'ultima per trovare le immagini nella cui descrizione vi sia inserito un termine come quello cercato. Nel caso non sia stato trovato niente notificalo all'utente. alla fine resetta le proprietà in cui è stato precedentemente inserito il termine.
    searchImgs(term: string): void {
        const regExp = new RegExp(term, 'gi');
        this.imgs = this.userService.imgs.filter((img) => img.source === true && regExp.test(img.description));
        if (!this.imgs[0]) {
            this.nothingFound = true;
        }
        this.searchTerm = '';
        this.searchService.searchTerm = '';
    }

    // cliccando sul "go back" all'interno dell'elelento 'nothingFound' nascondi il messaggio e mostra tutte le immagini sorgente.
    resetImgs(): void {
        this.nothingFound = false;
        this.imgs = this.userService.imgs.filter((img) => img.source === true);
    }

    navigateToDetails(e: any, img: Img): void {
        if (e.target.localName === 'div') {
            this.userService.shownImg = img;
            this.router.navigate(['/image-details', 'all-imgs']);
        }
    }

    processUrl(url: string): string {
        return this.userService.processUrl(url);
    }

    loggedIn(): boolean {
        return this.userService.isLoggedIn();
    }

    // mostra il componente 'save-image'
    showSaveImgComponent(img: Img): void {
        // invia l'immagine al componente 'save-img';
        this.img = img;
        this.showSaveImgComp = true;
    }
}
