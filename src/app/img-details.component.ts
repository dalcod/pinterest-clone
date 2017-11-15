import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { Location } from '@angular/common';

import { Board, Img } from './board';
import { UserService } from './user.service';
import { ProfileService } from './profile.service';

import 'rxjs/add/operator/switchMap';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';

@Component({
    selector: 'img-details',
    templateUrl: './img-details.component.html',
    styleUrls: ['./img-details.component.css']
})

export class ImageDetailsComponent implements OnInit {
    img: Img;
    imgs: Img[];
    boards: Board[];
    currIndex: number;
    parentComp: string;
    subscription: Subscription;
    showSaveImgComp2: boolean;

    constructor(private userService: UserService,
                 private location: Location,
                 private route: ActivatedRoute) {
        this.subscription = userService.saveImgComp$.subscribe((val) => this.showSaveImgComp2 = val);
    }

    ngOnInit() {
        this.img = this.userService.shownImg;
        this.route.paramMap.switchMap((params: ParamMap) => {
            this.parentComp = params.get('component');
            if (this.parentComp === 'all-imgs') {
                // la proprietà è consumata dal componente figlio "save-img"
                this.boards = this.userService.myBoards;
                this.imgs = this.userService.imgs.filter((img) => img.source === true);
                // questa funzione serve a trovare l'indice dell'immagine che abbiamo selezionato all'interno dell'array contenente tutte le immagini, im modo tale da poter implementare la feature tipo slider cliccando sull'icona "prev" o "next image".
                this.imgs.forEach((elem, i) => {
                    if (elem._id === this.img._id) {
                        this.currIndex = i;
                    }
                });
            }
            if (this.parentComp === 'profile' || this.parentComp === 'board-detail') {
                this.boards = this.userService.myBoards;
                this.imgs = this.userService.getAllMyImgs();
                this.imgs.forEach((elem, i) => {
                    if (elem._id === this.img._id) {
                        this.currIndex = i;
                    }
                });
                // se non è il mio profilo rimuovi le immagini 'rotte'.
                if (!this.userService.isMyProfile) {
                    this.imgs = this.userService.imgs.filter((img) => !img.broken);
                }
            }
            return this.imgs;
        }).subscribe(() => null);
    }

    processUrl(url: string): string {
        return this.userService.processUrl(url);
    }

    // le due funzioni utilizzano il valore della proprietà 'currIndex' trovata all'interno della funzione 'ngOnInit' per capire se passare alla immagine precedente o successiva al click dell'icona corrispondente alle due funzioni.
    nextImage(): void {
        if (this.currIndex < this.imgs.length - 1) {
            this.currIndex++;
            this.img = this.imgs[this.currIndex];
        } else {
            return;
        }
    }

    prevImage(): void {
        if (this.currIndex > 0) {
            this.currIndex--;
            this.img = this.imgs[this.currIndex];
        } else {
            return;
        }
    }

    // al click-out del componente o al click sull'icona a forma di 'x' torna alla pagina precedente.
    goBack(e?: any): void {
        // al clickout cerca l'elemento con classe 'click-out' e torna indietro.
        if (e) {
            const findElemByClass = (thisElem: any, _class: string): boolean => {
                return Array.prototype.indexOf.call(thisElem.classList, _class) !== -1;
            };
            if (findElemByClass(e.target, 'click-out')) {
                this.location.back();
            }
            return;
        }
        this.location.back();
    }

    // mostra il componente save-image
    showSaveImgComp(): void {
        this.showSaveImgComp2 = true;
    }
}
