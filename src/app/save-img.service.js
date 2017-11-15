"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var core_1 = require("@angular/core");
var SaveImageService = (function () {
    function SaveImageService() {
    }
    SaveImageService.prototype.hideSaveImgComp = function (e) {
        return new Promise(function (resolve, reject) {
            var domElem = e.target;
            var findElemByClass = function (thisElem, _class) {
                return Array.prototype.indexOf.call(thisElem.classList, _class) !== -1;
            };
            var parent = function (currElem) {
                if (findElemByClass(currElem, 'click-out')) {
                    resolve(false);
                }
                var p = currElem.parentElement;
                if (findElemByClass(p, 'stop')) {
                    resolve(true);
                }
                else {
                    parent(p);
                }
            };
            parent(e.target);
        });
    };
    return SaveImageService;
}());
SaveImageService = __decorate([
    core_1.Injectable(),
    __metadata("design:paramtypes", [])
], SaveImageService);
exports.SaveImageService = SaveImageService;
//# sourceMappingURL=save-img.service.js.map