import { Injectable } from '@angular/core';
import { Http, Headers, Response } from '@angular/http';
import { Router } from '@angular/router';
import { Subject }    from 'rxjs/Subject';

import { Board, Img } from './board';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/toPromise';
import {  } from '';

@Injectable()
export class BoardDetailService {
    private header: Headers = new Headers({'Content-Type': 'application/json'});

    constructor(private http: Http, private router: Router) {}

    private handleError(error: Response | any): Promise<string> {
        let errMsg: string;
        let obj: Object;
        if (error instanceof Response) {
                errMsg = error.status + ' - ' + error.statusText;
        }
        return Promise.reject(errMsg);
    }
    
    // observable che gestisce la visualizzazione del componente 'mamage-image-form'.
    private mngImgsFormVisibilitySource = new Subject<boolean>();
    mngImgsFormVisibility$ = this.mngImgsFormVisibilitySource.asObservable();
    showMngImgsForm(val: boolean) {
        this.mngImgsFormVisibilitySource.next(val);
    }

    // observable che gestisce la visualizzazione del componente 'update-board-form'.
    private updateBoardFormVisibilitySource = new Subject<boolean>();
    updateBoardFormVisibility$ = this.updateBoardFormVisibilitySource.asObservable();
    showUpdateBoardForm(val: boolean) {
        this.updateBoardFormVisibilitySource.next(val);
    }

    public addImage(img: Img, boardTitle: string): Promise<any> {
        let username = localStorage.getItem('username');
        let method = localStorage.getItem('method');
        let obj = {img: img,
                   boardTitle: boardTitle,
                   username: username,
                   method: method};
        return this.http.post('/add-image', JSON.stringify(obj), {headers: this.header})
            .toPromise()
            .then((res) => true)
            .catch(this.handleError);
    }

    public moveImages(imgsArr: Img[], currBoardTitle: string, nextBoardTitle: string): Promise<any> {
        let username = localStorage.getItem('username');
        let method = localStorage.getItem('method');
        let obj = {imgsArr: imgsArr,
                   currBoardTitle: currBoardTitle,
                   nextBoardTitle: nextBoardTitle,
                   username: username,
                   method: method};
        return this.http.put('/move-images', JSON.stringify(obj), {headers: this.header})
            .toPromise()
            .then((res) => true)
            .catch(this.handleError);
    }

    public copyImages(imgsArr: Img[], nextBoardTitle: string): Promise<boolean> {
        let username = localStorage.getItem('username');
        let method = localStorage.getItem('method');
        let obj = {imgsArr: imgsArr,
                   nextBoardTitle: nextBoardTitle,
                   username: username,
                   method: method};
        return this.http.post('/copy-images', JSON.stringify(obj), {headers: this.header})
            .toPromise()
            .then((res) => true)
            .catch(this.handleError);
    }

    public deleteImages(imgsArr: Img[], boardTitle: string): Promise<boolean> {
        let username = localStorage.getItem('username');
        let method = localStorage.getItem('method');
        let obj = {imgsArr: imgsArr,
                   boardTitle: boardTitle,
                   username: username,
                   method: method};
        return this.http.put('/delete-images', JSON.stringify(obj), {headers: this.header})
            .toPromise()
            .then((res) => true)
            .catch(this.handleError);
    }

    updateImage(img: Img, boardTitle: string): Promise<any> {
        let username = localStorage.getItem('username');
        let method = localStorage.getItem('method');
        let obj = {img: img,
                   boardTitle: boardTitle,
                   username: username,
                   method: method};
        return this.http.put('/update-image', JSON.stringify(obj), {headers: this.header})
            .toPromise()
            .then((res) => null)
            .catch(this.handleError);
    }
    
    // funzione, come quelle successive che contiene una promise con al suo interno a sua volta una funzione ricorsiva la quale in base alla classe dell'elemento segnala al componente che consuma questa funzionalità se l'elemnto è da nascondere o meno.
    hideAddBoardsForms(e: any, showProp: boolean): Promise<boolean> {
        return new Promise((resolve, reject) => {
            let domElem = e.target;
            let findElemByClass = (thisElem: any, _class: string): boolean => {
                return Array.prototype.indexOf.call(thisElem.classList, _class) !== -1;
            };
            if (!showProp || findElemByClass(domElem, 'add-pun-window')) {
                resolve(true);
            }
            let parent = (currElem: any) => {
                if (currElem.localName === 'html') {
                    resolve(false);
                }
                let p = currElem.parentElement;
                if (findElemByClass(currElem, 'add-board-form') || findElemByClass(currElem, 'fa-circle') || findElemByClass(currElem, 'fa-plus-circle')) {
                    resolve(true);
                } else {
                    parent(p);
                }
            };
            parent(e.target);
        });
    }

    hideFormOptions(e: any, showProp: boolean): Promise<boolean> {
        return new Promise((resolve, reject) => {
            let domElem = e.target;
            let findElemByClass = (thisElem: any, _class: string): boolean => {
                return Array.prototype.indexOf.call(thisElem.classList, _class) !== -1;
            };
            if (!showProp) {
                resolve(true);
            }
            let parent = (currElem: any) => {
                if (currElem.localName === 'html') {
                    resolve(false);
                }
                let p = currElem.parentElement;
                if (findElemByClass(currElem, 'form-group')) {
                    resolve(true);
                } else {
                    parent(p);
                }
            };
            parent(e.target);
        });
    }
    
    hideAddImageForm(e:any, showProp: boolean): Promise<boolean> {
        return new Promise((resolve, reject) => {
            let domElem = e.target;
            let findElemByClass = (thisElem: any, _class: string): boolean => {
                return Array.prototype.indexOf.call(thisElem.classList, _class) !== -1;
            };
            if (!showProp) {
                resolve(true);
            }
            let parent = (currElem: any) => {
                if (currElem.localName === 'html') {
                    resolve(false);
                }
                let p = currElem.parentElement;
                if (findElemByClass(currElem, 'stop')) {
                    resolve(true);
                } else {
                    parent(p);
                }
            };
            parent(e.target);
        });
    }

    hideAddImgDetailsForm(e: any, showProp: boolean): Promise<boolean> {
        return new Promise((resolve, reject) => {
            let domElem = e.target;
            let findElemByClass = (thisElem: any, _class: string): boolean => {
                return Array.prototype.indexOf.call(thisElem.classList, _class) !== -1;
            };
            if (!showProp) {
                resolve(true);
            }
            let parent = (currElem: any) => {
                if (findElemByClass(currElem, 'click-out')) {
                    resolve(false);
                }
                let p = currElem.parentElement;
                if (findElemByClass(currElem, 'stop')) {
                    resolve(true);
                } else {
                    parent(p);
                }
            };
            parent(e.target);
        });
    }
}