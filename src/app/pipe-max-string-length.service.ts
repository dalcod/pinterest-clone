import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
    name: 'maxLength'
})

export class PipeMaxStringLength implements PipeTransform {
    // la pipe riceve un valore, posto alla sua sinistra, che viene passato come primo parametro alla funzione 'transform' ovvero 'value', e uno più argomenti, posti alla sua destra, che corrisponderanno in ordine ai parametri successivi. Nel nostro caso avremo come 'value' la stringa aggiornata della descrizione che l'utente sta scrivendo, e 'maxLength' che è il valore che non vogliamo essa superi. La funzione quindi sottrarrà, se vi è un valore, la lunghezza corrente della descrizione con il valore di 'maxLength' e ritornerà un numero che ci indicherà quanti caratteri mancano ancora al limite.
    public transform (value: string, maxLength: number) {
        if (!value) return maxLength;
        if (value.length >= maxLength) {
            return '0';
        }
        return (maxLength - value.length);
    }
}
