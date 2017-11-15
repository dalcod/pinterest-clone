import { Injectable } from '@angular/core';
import { Http, Headers, Response } from '@angular/http';
import { Router } from '@angular/router';

import { Board, Img } from './board';

import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/toPromise';

@Injectable()
export class UserService {
    // notifica all'utente la riuscita dell'aggiornamento dell'account o della sua cancellazione.
    accountChange: string;
    loggedIn: boolean;
    // questa proprietà viene utilizzata dai componenti "save-img", "mng-img-form. è inoltre una proprietà che rimane inalterata a meno di modifiche dirette da parte dell'utente.
    myBoards: Board[];
    // la proprietà è 'dinamica' ovvero cambia in base al profilo utente.
    boards: Board[];
    // proprietà utilizzata per settare un'immagine che poi sarà consumata dal componente 'image-details' per viasualizzare il primo elemento.
    shownImg: Img;
    imgs: Img[];
    /* proprietà fondamentale quando andremo ad modificare le impostazioni profilo ricordarsi */
    // come "myBoards" è una proprietà che rimane inalterata a meno di modifiche è utilizzata dal componente "board-detail" 
    myData: any;
    // la proprietà è 'dinamica' ovvero cambia in base al profilo utente.
    profileUsername: string;
    isMyProfile: boolean = true;
    private header: Headers = new Headers({'Content-Type': 'application/json'});

    constructor(private http: Http, private router: Router) {
        // questa espressione è necessaria per fare in modo che l'applicazione sia informata riguardo allo stato attuale del login passando da un componente all'altro.
        this.loggedIn = !!localStorage.getItem('loggedIn');
    }

    public isLoggedIn(): boolean {
        return this.loggedIn;
    }

    public getMyUsername(): string {
        return localStorage.getItem('username');
    }

    public getProfileUsername(): string {
        return this.profileUsername;
    }

    private handleError (error: Response | any): Promise<string> {
        let errMsg: string;
        let obj: Object;
        if (error instanceof Response) {
            errMsg = error.status + ' - ' + error.statusText;
        }
        return Promise.reject(errMsg);
    }
    
    private handleLoginErrors (error: Response | any): Promise<string> {
        let errMsg: string;
        let httpErr: string;
        let errObj: any = {};
        if (error.status === 401 && error instanceof Response) {
            errMsg = error.status + ' - ' + error.statusText;
            errObj.errMsg = error.statusText;
        }
        if (error.status !== 401 && error instanceof Response) {
            httpErr = error.status + ' - ' + error.statusText;
            errObj.httpErr = httpErr;
        }
        console.log(errObj)
        return Promise.reject(errObj);
    }

    // quandp disponibile invia al componente 'app' il 'displayName' che verrà visualizzato nella barra di navigazione.
    private displayNameSource = new Subject<string>();
    displayName$ = this.displayNameSource.asObservable();
    sendDisplayName(name: string) {
        this.displayNameSource.next(name);
    }

    // observable che gestisce la visualizzazione o meno del componente 'save-image'.
    private showSaveImgCompSrc = new Subject<boolean>();
    saveImgComp$ = this.showSaveImgCompSrc.asObservable();
    showSaveImgComp(val: boolean) {
        this.showSaveImgCompSrc.next(val);
    }
    
    private handleErrorSrc = new Subject<string>();
    handleError$ = this.handleErrorSrc.asObservable();
    sendNewError(err: string) {
        this.handleErrorSrc.next(err);
    }

    public getUserData(username: string): Promise<any> {
        return this.http.get('/userdata/' + username)
            .toPromise()
            .then(res => {
            let resObj = res.json();
            this.profileUsername = resObj.accData.username;
            // determina se il profilo che siamo attualmente visualizzando sia il nostro oppure no.
            this.isMyProfile = localStorage.getItem('username')  === this.profileUsername;
            this.boards = resObj.boards;
            return resObj;
        }).catch(this.handleError);
    }

    public setUserData(username: string): Promise<any> {
        return this.http.get('/userdata/' + username)
            .toPromise()
            .then(res => {
            let resObj = res.json();
            // impostare tutte le proprietà che contengono i dati privati dell'utente
            this.myData = resObj.accData;
            this.myBoards = resObj.boards;
            // invia i ldisplayName al alla barra di navigazione.
            this.sendDisplayName(resObj.accData.displayName || resObj.accData.username);
            // imposta nel localStorage tutti quei dati che ci consentiranno di distinguere il nostro profilo da un altro, oppure se siamo loggati, o ancora tramite quale metodo ci siamo loggati.
            localStorage.setItem('loggedIn', 'true');
            localStorage.setItem('username', resObj.accData.username);
            localStorage.setItem('method', resObj.accData.method);
            this.loggedIn = true;
            return true;
        }).catch(this.handleError);
    }

    // funzione consumnata dal componente 'home' e ritorna tutte le immagini pubbliche e sorgente di tutti i profili.
    public getAllImgs(): Promise<boolean> {
        return this.http.get('/all-imgs')
            .toPromise()
            .then((res) => {
            let resObj = res.json();
            this.imgs = resObj.imgs;
            return true;
        }).catch(this.handleError);
    }

    getBoard(title: string): Board[] {
        return this.boards.filter((elem) => elem.title === title);
    }

    public signup(username: string, password: string): Promise<any> {
        return this.http
            .post('/signup', JSON.stringify({username, password}), {headers: this.header})
            .toPromise()
            .then(res => {
            let resObj = res.json();
            if (resObj.success) {
                // stesse oprazioni effettuate con la funzione 'setUserData()'
                this.myData = resObj.accData;
                this.myBoards = resObj.boards;
                this.sendDisplayName(resObj.accData.displayName || resObj.accData.username);
                localStorage.setItem('loggedIn', 'true');
                localStorage.setItem('username', resObj.accData.username);
                localStorage.setItem('method', resObj.accData.method);
                this.loggedIn = true;
                return resObj.accData.username;
            } else {
                throw resObj;
            }
        }).catch(this.handleLoginErrors);
    }

    public login(username: string, password: string): Promise<any> {
        return this.http
            .post('/login', JSON.stringify({username, password}), {headers: this.header})
            .toPromise()
            .then(res => {
            let resObj = res.json();
            if (resObj.success) {
                // stesse oprazioni effettuate con la funzione 'setUserData()'
                this.myData = resObj.accData;
                this.myBoards = resObj.boards;
                this.sendDisplayName(resObj.accData.displayName || resObj.accData.username);
                localStorage.setItem('loggedIn', 'true');
                localStorage.setItem('username', resObj.accData.username);
                localStorage.setItem('method', resObj.accData.method);
                this.loggedIn = true;
                return resObj.accData.username;
            } else {
                throw resObj;
            }
        }).catch(this.handleLoginErrors);
    }

    public logout(): void {
        this.loggedIn = false;
        localStorage.removeItem('loggedIn');
        localStorage.removeItem('username');
        localStorage.removeItem('mothod'),
            this.http.get('/logout');
        this.router.navigate(['/home']);
    }

    public updateProfile(data: any): Promise<any> {
        let username = localStorage.getItem('username');
        let method = localStorage.getItem('method');
        let newData = data;
        let oldData = {
            username: username,
            method: method
        };
        return this.http.put('/update-profile', JSON.stringify({newData, oldData}), {headers: this.header})
            .toPromise()
            .then((res) => {
            let resObj = res.json();
            return resObj;
        }).catch(this.handleError);
    }

    public deleteAccount(): Promise<any> {
        let username = localStorage.getItem('username');
        let method = localStorage.getItem('method');
        return this.http.post('/delete-account', JSON.stringify({username, method}), {headers: this.header})
            .toPromise()
            .then((res) => true)
            .catch(this.handleError);
    }

    public updateMyImgs(obj: { newDisplayName: string, oldDisplayName: string, newUsername: string, profilePicUrl?: string }): Promise<any> {
        let username = localStorage.getItem('username');
        let method = localStorage.getItem('method');
        return this.http.put('/update-images', JSON.stringify({ username, obj, method }), {headers: this.header})
            .toPromise()
            .then((res) => true)
            .catch(this.handleError);
    }

    public saveImage(boardTitle: string, img: Img): Promise<any> {
        let username = localStorage.getItem('username');
        let method = localStorage.getItem('method');
        let obj = {
            username: username,
            boardTitle: boardTitle,
            img: img,
            method: method
        }
        return this.http.post('/save-image', obj, {headers: this.header})
            .toPromise()
            .catch(this.handleError);
    }

    processUrl(url: string): string {
        let baseUrl = url.split('/').slice(0, 3).join('/');
        let devRegEx = /deviantart/gi;
        if (devRegEx.test(baseUrl)) {
            baseUrl = 'https://deviantart.com';
        }
        return baseUrl;
    }

    // funzione consumata dal componente 'profile' e dalla sezione 'puns' ci consente di recuperare le immagini necessarie in base al fatto che siamo attualmente sul nostro profilo o su quello di un'altro.
    getAllMyImgs(): Img[] {
        let isMyProfile = this.getMyUsername() === this.getProfileUsername();
        let arr: Img[] = [];
        this.boards.forEach((board) => {
            // se non è il profilo dell'utente
            if (!isMyProfile) {
                // e se le board non sono segrete
                if(!board.secret) {
                    // inserisce tutte le immagini delle board pubbliche tralasciando quelle delle board segrete nell'array 'arr'.
                    board.imgs.forEach((myImg) => {
                        arr.push(myImg); 
                    });
                }
                // altrimenti se siamo attualmente sul nostro profilo
            } else {
                // inserisci le immagini inserite in tutte le board sia pubbliche che segrete nell'array 'arr'.
                board.imgs.forEach((myImg) => {
                    arr.push(myImg); 
                });
            }
        });
        return arr;
    }
}
