import { Component, OnDestroy, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl } from '@angular/forms';

import { UserService } from './user.service';
import { SearchService } from './search.service';

import { Subscription } from 'rxjs/Subscription';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})

export class AppComponent implements OnDestroy {
    displayName: string;
    subscription: Subscription;
    show: boolean;
    search = new FormControl();

    constructor(private userService: UserService, private router: Router, private searchService: SearchService) {
        // effetua sottoscrizione all'observer 'displayName$' ogni volta che il 'displayName' cambiarà il valore della proprietà 'displayNmae' cambirà a sua volta, e così anche il nome visializzato nella barra di navigazione.
        this.userService.displayName$.subscribe((name) => {
            this.displayName = name;
        });
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }

    loggedIn(): boolean {
        return this.userService.isLoggedIn();
    }

    logout(): void {
        // è necessario impostare la proprietà direttamente altrimenti se l'utente rieffetua il login dopo un logout il tooltip rimane visibile.
        this.show = false;
        this.userService.logout();
        this.router.navigate(['/home']);
    }

    // se la pagina in cui siamo è la 'home' alla sottomissione del termine passa quest'ultimo al servizio 'searchService' che lo passerà a sua volta al componente relativo.
    submitSearch() {
        this.router.navigate(['/home']);
        this.searchService.sendInputTerm(this.search.value);
        // nel caso la pagin in cui siamo non sia la 'home' salva il termine nella variabile 'searchTerm'.
        this.searchService.searchTerm = this.search.value;
        // resetta campo input
        this.search = new FormControl();
    }

    // alla pressione del tasto 'enter' invoca la funzione 'submitSearch' e quindi effetua la ricerca. 
    @HostListener('keypress', ['$event']) keypress(e: any) {
        if (e.key === 'Enter' && this.search.value) {
            this.submitSearch();
        }
    }

    // naviga al nostro profilo utente, la funzione è necessaria perchè il 'routerLink' non funziona con parametri dinamici, e ne nostro caso ci serve inserire l'username nella URL.
    navigate(comp: string): void {
        const username = this.userService.getMyUsername();
        if (comp === 'profile') {
            this.router.navigate(['/profile', username]);
        }
    }

    // mostra o nascondi il tooltip che mostra le opzioni per profile/account 'settings' e 'logout'.
    showTooltip(val: boolean): void {
        this.show = val;
    }
}
