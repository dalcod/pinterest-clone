"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var core_1 = require("@angular/core");
var SearchPipe = (function () {
    function SearchPipe() {
    }
    SearchPipe.prototype.transform = function (value, term) {
        // se non è presente un termine ritorna "value", questa espressione risulta necessaria appena andremo a cliccare nel campo input e quindi nel momento in cui non ci saranno termini inseriti, evitando così errori.
        if (!term)
            return value;
        // se vi sono termini filtra l'array "value". Ogni elemento "item" verrà confrontato con una nuova 'regular expression' per ogni chiamata alla funzione "transform". Questa 'reqEx' sarà composta dal nuovo termine "term" passato alla funzione con due 'flags': "g" ed "i", ogni elemento "item" sarà quindi testato "test(item)" rispetto alla 'regEx' e ritornerà "true" o "false" in base al fatto che quest'ultima combaci o meno con l'elemento. Grazie a questa operazione la funzione "filter()" sarà in grado di ritornare un nuovo array con al suo interno i nuovi valori che combaciano con il termine "term".
        return value.filter(function (item) { return new RegExp(term, 'gi').test(item.title); });
    };
    return SearchPipe;
}());
SearchPipe = __decorate([
    core_1.Pipe({
        name: 'search'
    })
], SearchPipe);
exports.SearchPipe = SearchPipe;
//# sourceMappingURL=pipe-search.service.js.map