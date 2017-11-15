import {Pipe, PipeTransform} from '@angular/core';
import { Board } from './board';
@Pipe({
    name: 'search'
})
export class SearchPipe implements PipeTransform {
    public transform(value: Board[], term: string) {
        // se non è presente un termine ritorna "value", questa espressione risulta necessaria appena andremo a cliccare nel campo input e quindi nel momento in cui non ci saranno termini inseriti, evitando così errori.
        if (!term) return value;
        // se vi sono termini filtra l'array "value". Ogni elemento "item" verrà confrontato con una nuova 'regular expression' per ogni chiamata alla funzione "transform". Questa 'reqEx' sarà composta dal nuovo termine "term" passato alla funzione con due 'flags': "g" ed "i", ogni elemento "item" sarà quindi testato "test(item)" rispetto alla 'regEx' e ritornerà "true" o "false" in base al fatto che quest'ultima combaci o meno con l'elemento. Grazie a questa operazione la funzione "filter()" sarà in grado di ritornare un nuovo array con al suo interno i nuovi valori che combaciano con il termine "term".
        return value.filter((item: Board) => new RegExp(term, 'gi').test(item.title));
    }
}