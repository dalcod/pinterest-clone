"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var core_1 = require("@angular/core");
var PipeMaxStringLength = (function () {
    function PipeMaxStringLength() {
    }
    // la pipe riceve un valore, posto alla sua sinistra, che viene passato come primo parametro alla funzione 'transform' ovvero 'value', e uno più argomenti, posti alla sua destra, che corrisponderanno in ordine ai parametri successivi. Nel nostro caso avremo come 'value' la stringa aggiornata della descrizione che l'utente sta scrivendo, e 'maxLength' che è il valore che non vogliamo essa superi. La funzione quindi sottrarrà, se vi è un valore, la lunghezza corrente della descrizione con il valore di 'maxLength' e ritornerà un numero che ci indicherà quanti caratteri mancano ancora al limite.
    PipeMaxStringLength.prototype.transform = function (value, maxLength) {
        if (!value)
            return maxLength;
        if (value.length >= maxLength) {
            return '0';
        }
        return (maxLength - value.length);
    };
    return PipeMaxStringLength;
}());
PipeMaxStringLength = __decorate([
    core_1.Pipe({
        name: 'maxLength'
    })
], PipeMaxStringLength);
exports.PipeMaxStringLength = PipeMaxStringLength;
//# sourceMappingURL=pipe-max-string-length.service.js.map