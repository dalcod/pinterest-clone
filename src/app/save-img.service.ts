import { Injectable } from '@angular/core';

@Injectable()
export class SaveImageService {

    constructor() {}

    hideSaveImgComp(e: any): Promise<boolean> {
        return new Promise((resolve, reject) => {
            let domElem = e.target;
            let findElemByClass = (thisElem: any, _class: string): boolean => {
                return Array.prototype.indexOf.call(thisElem.classList, _class) !== -1;
            };
            let parent = (currElem: any) => {
                if (findElemByClass(currElem, 'click-out')) {
                    resolve(false);
                }
                let p = currElem.parentElement;
                if (findElemByClass(p, 'stop')) {
                    resolve(true);
                } else {
                    parent(p);
                }
            };
            parent(e.target);
        });
    }
}