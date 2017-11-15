import { Injectable } from '@angular/core';
import { Http, Headers, Response } from '@angular/http';
import { Router } from '@angular/router';

import { Board } from './board';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/toPromise';
import {  } from '';

@Injectable()
export class ProfileService {
    private header: Headers = new Headers({'Content-Type': 'application/json'});

    constructor(private http: Http, private router: Router) {}

    private handleError (error: Response | any): Promise<string> {
        let errMsg: string;
        let obj: Object;
        if (error instanceof Response) {
            if (error.status === 401 && error.statusText !== 'Unauthorized') {
                errMsg = error.statusText;
                obj = {user: errMsg};
            } else {
                errMsg = error.status + ' - ' + error.statusText;
                obj = {http: errMsg};
            }
        }
        return Promise.reject(obj);
    }

    public addBoard(board: Board): Promise<any> {
        const username = localStorage.getItem('username');
        const method = localStorage.getItem('method');
        return this.http.post('/board', JSON.stringify({ board: board, username: username, method: method }), {headers: this.header})
            .toPromise()
            .then((res) => true )
            .catch(this.handleError);
    }

    public updateBoard(board: Board, oldTitle: string): Promise<any> {
        const username = localStorage.getItem('username');
        const method = localStorage.getItem('method');
        const obj = {board: board,
                   oldTitle: oldTitle,
                   username: username,
                   method: method};
        return this.http.put('/board', JSON.stringify(obj), {headers: this.header})
            .toPromise()
            .then((res) => true )
            .catch(this.handleError);
    }

    public removeBoard(board: Board): Promise<any> {
        const username = localStorage.getItem('username');
        const method = localStorage.getItem('method');
        return this.http.put('/remove/board', JSON.stringify({ board: board, username: username, method: method }), {headers: this.header})
        .toPromise()
        .then((res) => null)
        .catch(this.handleError);
    }

    boardExist(boards: Board[], board: Board): boolean {
        let exist = false;
        boards.forEach(function(elem: Board, i) {
            if (elem.title === board.title) {
                exist = true;
            }
        });
        return exist;
    }

    deleteBoardFromArray(boards: Board[], selB: Board): Board[] {
        boards.forEach((elem, i) => {
            if (elem.title === selB.title) {
                boards.splice(i, 1);
            }
        });
        boards.filter((elem) => elem.title !== selB.title );
        return boards;
    }

    hideAddBoardsForms(e: any, elem: {show1: boolean, show2: boolean}): Promise<boolean> {
        return new Promise((resolve, reject) => {
            // alternativa all'utilizzare i "prototype" è l'espressione "Array.from(e.target.classList).indexOf('fa-pencil')" purtroppo però il metodo ".from()" non è un metodo standard ma è specifico di "ES6" e non viene convertito da typescript in "ES5".
            const domElem = e.target;
            const findElemByClass = (thisElem: any, _class: string): boolean => {
                return Array.prototype.indexOf.call(thisElem.classList, _class) !== -1;
            };
            // se il form è già nascosto oppure abbiamo cliccato sull'icona "fa-pencil", la quale è adibita a mostrare il form, ritorna senza apportare modifiche.
            if ((!elem.show1 && !elem.show2) || findElemByClass(domElem, 'add-board-window')) {
                resolve(true);
            }
            const parent = (currElem: any) => {
                // se la funzione non riesce a trovare un elemento DOM padre con classe ".form-row" o "add-board-form" e quindi arriva al nodo "body" nascondi il form e ritorna.
                if (currElem.localName === 'html') {
                    resolve(false);
                }
                const p = currElem.parentElement;
                // se la funzione ricorsiva nel suo percorso a ritroso tra gli elementi padre incontra un elemento con classe ".form-row" lascia l'elemento visibile e ritorna senza apportare modifiche.
                if (findElemByClass(p, 'add-board-form') || findElemByClass(currElem, 'add-board-form')) {
                    resolve(true);
                } else {
                    parent(p);
                }
            };
            parent(e.target);
        });
    }
}
