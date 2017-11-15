import { Injectable } from '@angular/core';

import { Subject } from 'rxjs/Subject';

@Injectable()
export class SearchService {
    searchTerm: string;
    
    constructor(){}
    
    // observable che gestisce la ricezione e l'invio al componente 'home' del termine inserito nel campo input di ricerca.
    private inputTermSrc = new Subject<string>();
    inputTerm$ = this.inputTermSrc.asObservable();
    sendInputTerm(term: string) {
        this.inputTermSrc.next(term);
    }

}
