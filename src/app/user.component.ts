import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { UserService } from './user.service';

@Component({
    templateUrl: './user.component.html',
    styleUrls: ['./user.component.css']
})

// questo componente è utilizzato solamente nel momento in cui abbiamo effettuato il redirect dopo aver ricevuto i dati dalla callback eseguendo il login con twitter o google ed è necessaria per impostare i dati privati dell'utente e consentire così al programma di distiguere se un particolare account è il nostro oppure no, e agire di conseguenza. Dopo aver settato i dati il componente redirige alla pagina 'profile'.
export class UserComponent implements OnInit {
    username: string;
    alreadyLogged: boolean;

    constructor (private userService: UserService,
                  private router: Router,
                  private route: ActivatedRoute) {}

    ngOnInit() {
        this.userService.isLoggedIn ? this.alreadyLogged = true : this.alreadyLogged = false;
        this.username = this.route.snapshot.paramMap.get('username');
        this.userService.setUserData(this.username)
            .then((res) => {
            if (this.alreadyLogged) {
                this.router.navigate(['/profile/' + this.username]);
            } else {
                this.router.navigate(['/home']);
            }
        },
            (err) => null);
    }
}
