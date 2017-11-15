var express = require('express');
var passport = require('passport');
var path = require('path');
var router = express.Router();
var request = require('request');
var User = require('./model/user');

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    } else {
        res.redirect('/');
    }
};

router.post('/signup', function(req, res){
    passport.authenticate('local-signup', function(err, user, info){
        if (err) return res.status(500).send(err);
        if (!user) {
            res.statusMessage = 'This username has already been taken.';
            return res.status(401).end();
        }
        req.logIn(user, function(logErr){
            if (err) return res.status(500).send(logErr);
            return res.status(200).json({success: true, accData: user.local, boards: user.boards });
        });
    })(req, res);
});

router.post('/login', function(req, res){
    passport.authenticate('local-login', function(err, user, info){
        if (err) return res.status(500).send(err);
        // se l'username è già presente invia errore. Il sistema si basa sull'oggetto con proprietà 'ivalid' inviato da passport a seguito della verifica nel database.
        if (user.invalid === 'username') {
            res.statusMessage = 'This username doesn\'t exist.';
            return res.status(401).end();
        }
        // se la password è già presente invia errore.
        if (user.invalid === 'password') {
            res.statusMessage = 'Invalid password.';
            return res.status(401).end();
        }
        // se l'oggetto con proprietà 'invalid' non è presente allora procedi a creare  la sessione passport ed invia al servizio 'userService' di angular l'oggetto 'user 'appena creato.
        req.logIn(user, function(logErr){
            if (err) return res.status(500).send(logErr);
            return res.status(200).json({success: true, accData: user.local, boards: user.boards });
        });
    })(req, res);
});

// redirigi la pagina a quella di autenticazione di twitter.
router.get('/auth/twitter', passport.authenticate('twitter'));

// una volta autenticato tramite twitter intercetta la richiesta 'callback' di ritorno  salva l'utente nel database, crea una sessione passport, e redirigi l'applicazione alla pagina intermedia '/user/:username'.
router.get('/auth/twitter/callback', function(req, res){
    passport.authenticate('twitter', function(err, user, info){
        if (err) return res.status(500).send(err);
        if (!user) { return res.redirect('/'); }
        req.logIn(user, function(logErr){
            if (logErr) return res.status(500).send(logErr);
            res.redirect('/user/' +  user.twitter.username);
        });
    })(req, res);
});

router.get('/auth/google', passport.authenticate('google', { scope: 'profile' }));

router.get('/auth/google/callback', function(req, res){
    passport.authenticate('google', function(err, user, info){
        if (err) return res.status(500).send(err);
        if (!user) { return res.redirect('/'); }
        req.logIn(user, function(logErr){
            if (logErr) return res.status(500).send(logErr);
            res.redirect('/user/' +  user.google.username);
        });
    })(req, res);
});

// questa route è la più complicata e ci consente di salvare le modifiche relative all'account/profilo.
router.put('/update-profile', isLoggedIn, function(req, res){
    let newData = req.body.newData;
    var username = req.body.oldData.username;
    var method = req.body.oldData.method;
    var counter = 0;
    var error = false;
    var displayName;
    // funzione callback di 'User.findOne()'
    var fn = function(err, doc) {
        if (err) return res.status(500).send(err);
        // se è presente un'username nei 'newData cercalo tra i profili di tipo 'local' 'google' e 'twitter'. Per evitare che le funzioni vengano invocate ad ogni iteraizone della funzione 'fn' imposta la condizione in modo tale che possano essere invocate solo se il counter è uguale a 0.
        if (newData.username && counter === 0) {
            User.findOne({'local.username': newData.username}, function(err, doc1){
                if (err) return res.status(500).send(err);
                counter++;
                // se il profilo è già presente segnala l'errore e ritorna l'invocazione alla funzione 'fn' in modo che le condizioni poste in fondo possano catturarlo e inviare all'utente un messaggio significativo. 
                if (doc1){
                    error = true;
                    return fn(err, doc);
                }
                // se non è presente un'username tipo 'local' con questo nome ovvero il documento 'doc1' è uguale ad 'undefined' ritorna la funzione 'fn', questo ci consentirà di procedere con la modifica del documento 'doc', se sono presenti altri dati da modificare, e quindi al suo successivo salvataggio.
                return fn(err, doc);
            });
            User.findOne({'twitter.username': newData.username}, function(err, doc1){
                if (err) return res.status(500).send(err);
                counter++;
                if (doc1 && !error) {
                    error = true;
                    return fn(err, doc);
                }
                return fn(err, doc);
            });
            User.findOne({'google.username': newData.username}, function(err, doc1){
                if (err) return res.status(500).send(err);
                counter++;
                if (doc1 && !error) {
                    error = true;
                    return fn(err, doc);
                }
                return fn(err, doc);
            });
        }
        if (newData.password) {
            var newUser = new User();
            doc[method].password = newUser.generateHash(newData.password);
        }
        if (newData.email) {
            doc[method].email = newData.email;
        }
        if (newData.profilePicUrl) {
            doc[method].photos.set(0, { value: newData.profilePicUrl });
        }
        // se il 'firstName' è stato fornito salvalo nel documento.
        if (newData.firstName) {
            doc[method].firstName = newData.firstName;
            // se oltre al 'firstName' è stato fornito un nuovo 'surname' salvalo nel documento e crea un 'displayName' composto dall'unione dei due e salvalo nel documento.
            if (newData.surname) {
                doc[method].surname = newData.surname;
                displayName = newData.firstName + ' ' + newData.surname;
                doc[method].displayName = displayName; 
            } else {
                // se non è presente un nuovo 'surname' ma è presente già un 'surname' nel database crea un 'displayName' con il nuovo 'firstName' e il vecchio 'surname'.
                if (doc[method].surname){
                    doc[method].displayName = newData.firstName + ' ' + doc[method].surname;
                } else {
                    // altrimenti se non è presente neanche un 'vecchio' surname crea un 'displayName' con il solo 'firstName'.
                    doc[method].displayName = newData.firstName;
                }
            }
        }
        // se non è presente un nuovo 'firstName' ma solo un nuovo 'surname'
        if (!newData.firstName && newData.surname) {
            // e se è già presente un 'firstName' nel database crea un 'displayName' con il vecchio 'firstName' e il nuovo 'surname'
            if (doc[method].firstName) {
                doc[method].surname = newData.surname;
                doc[method].displayName = doc[method].firstName + ' ' + newData.surname;
                // altrimenti se non è presente un vecchio 'firstName' crea un 'displayName' con il solo 'surname'.
            } else {
                doc[method].displayName = newData.surname;
            }
        }
        if (newData.description) {
            doc[method].description = newData.description;
        }
        // se è stata eseguita una modifica all'account
        if (newData.username || newData.password) {
            // se l'username è stato modificato
            if(newData.username) {
                // e se il counter indica che quest'ultimo è stato cercato in tutti e 3 i tipi di profilo e non ne è stato trovato nessuno con questo 'username' (!error) salva quest'ultimo nel documento e ritornalo senza la 'password'.
                if (counter === 3 && !error) {
                    doc[method].username = newData.username;
                    doc.save(function(){
                        if (err) return res.status(500).send(err);
                        return res.status(200).json({ success: true, data: { displayName: doc[method].displayName, email: doc[method].email, description: doc[method].description, photos: doc[method].photos, firstName: doc[method].firstName, surname: doc[method].surname } });
                    });
                }
                // se invece esiste già un profilo con questo 'username' segnala all'utente il problema.
                if (counter === 3 && error) {
                    doc.save(function(){
                        if (err) return res.status(500).send(err);
                        return res.status(200).json({ success: false, errMsg: 'This username is already in use.' });
                    });
                }
            }
            // se non è presente una modifica all'username ma solo alla 'password' procedi a salvare il documento e a ritornarlo senza password.
            if(!newData.username && newData.password) {
                doc.save(function(){
                    if (err) return res.status(500).send(err);
                    return res.status(200).json({ success: true, data: { displayName: doc[method].displayName, email: doc[method].email, description: doc[method].description, photos: doc[method].photos, firstName: doc[method].firstName, surname: doc[method].surname }});
                });
            }
        } else {
            // se invece non sono state apportate modifiche all'account salva il documento e ritornalo senza password.
            doc.save(function(){
                if (err) return res.status(500).send(err);
                return res.status(200).json({ success: true, data: { displayName: doc[method].displayName, email: doc[method].email, description: doc[method].description, photos: doc[method].photos, firstName: doc[method].firstName, surname: doc[method].surname } });
            });
        }
    };
    if(method === 'twitter') {
        User.findOne({'twitter.username' : username}, fn);    
    }
    if(method === 'google') {
        User.findOne({'google.username' : username}, fn);    
    }
    if(method === 'local') {
        User.findOne({'local.username' : username}, fn);
    }
});

router.post('/delete-account', isLoggedIn, function(req, res){
    var username = req.body.username;
    var method = req.body.method;
    var fn = function(err, doc) {
        if (err) return res.status(500).send(err);
        res.status(200).end();
    };
    if(method === 'twitter') {
        User.findOneAndRemove({'twitter.username' : username}, fn);    
    }
    if(method === 'google') {
        User.findOneAndRemove({'google.username' : username}, fn);    
    }
    if(method === 'local') {
        User.findOneAndRemove({'local.username' : username}, fn);
    }
});

router.get('/logout', function(req, res){
    req.logout();
});

// invia i dati utente all'applicazione.
router.get('/userdata/:username', isLoggedIn, function(req, res){
    var username = req.params.username;
    User.findOne({'local.username': username}, function(err, doc){
        if (err) return res.status(500).send(err);
        if (doc) {
            var myDoc = {
                email: doc.local.email,
                username: doc.local.username,
                displayName: doc.local.displayName,
                firstName: doc.local.firstName,
                surname: doc.local.surname,
                displayName: doc.local.displayName,
                description: doc.local.description,
                method: doc.local.method,
                photos: doc.local.photos
            }
            return res.status(200).json({ accData: myDoc, boards: doc.boards });
        }
    });
    User.findOne({'twitter.username': username}, function(err, doc){
        if (err) return res.status(500).send(err);
        if (doc) {
            var myDoc = {
                email: doc.twitter.email,
                username: doc.twitter.username,
                displayName: doc.twitter.displayName,
                firstName: doc.twitter.firstName,
                surname: doc.twitter.surname,
                displayName: doc.twitter.displayName,
                description: doc.twitter.description,
                method: doc.twitter.method,
                photos: doc.twitter.photos
            }
            return res.status(200).json({ accData: myDoc, boards: doc.boards })
        };
    });
    User.findOne({'google.username': username}, function(err, doc){
        if (err) return res.status(500).send(err);
        if (doc) {
            var myDoc = {
                email: doc.google.email,
                username: doc.google.username,
                displayName: doc.google.displayName,
                firstName: doc.google.firstName,
                surname: doc.google.surname,
                displayName: doc.google.displayName,
                description: doc.google.description,
                method: doc.google.method,
                photos: doc.google.photos
            }
            return res.status(200).json({ accData: myDoc, boards: doc.boards });
        }
    });
});

// invia tutte le immagini contenute nelle board.
router.get('/all-imgs', isLoggedIn, function(req, res){
    User.find({}, function(err, docArr){
        if (err) return res.status(500).send(err);
        var imgsArr;
        var arr = [];
        // per ogni profilo utente
        docArr.forEach(function(profile){
            // estrai ciascuna board ed inseriscila nell'array 'arr'.
            profile.boards.forEach(function(board, i){
                if (board.secret) return;
                arr.push(board.imgs);
            });
        });
        // se sono presenti delle board all'interno dell'applicazione procedi.
        if(arr[0]) {
            // assegna all'array 'imgArr' tutte le immagini estratte dalle board inserite nell'array 'arr', tramite il loro concatenamento reso possibile grazie al metodo 'reduce'. 
            imgsArr = arr.reduce(function(x, y) {
                return x.concat(y);
            });
        }
        res.status(200).json({imgs: imgsArr});
    });
});

// inserisci una nuova board all'interno del documento relativo al profilo utente. 
router.post('/board', isLoggedIn, function(req, res){
    var board = req.body.board;
    var username = req.body.username;
    var method = req.body.method;
    var fn = function(err, doc) {
        if (err) return res.status(500).send(err);
        doc.boards.push(board);
        doc.save(function(err){
            if (err) return res.status(500).send(err);
            return res.status(200).end();
        });
    };
    if(method === 'twitter') {
        User.findOne({'twitter.username' : username}, fn);    
    }
    if(method === 'google') {
        User.findOne({'google.username' : username}, fn);    
    }
    if(method === 'local') {
        User.findOne({'local.username' : username}, fn);    
    }
});


// salve i cambiamenti apportati dall'utente ad una board.
router.put('/board', isLoggedIn, function(req, res){
    // il documento che contiene la board da modificare. 
    var board = req.body.board;
    // il vecchio titolo della board o il titolo della board a seconda che l oabbiam omodificato o meno ci consentirà di trovare la board all'interno dell'array 'boards'.
    var oldTitle = req.body.oldTitle;
    var username = req.body.username;
    var method = req.body.method;
    var fn = function(err, doc) {
        if (err) return res.status(500).send(err);
        var arr = new Array();
        doc.boards.forEach(function(elem, i){
            if (elem.title === oldTitle) {
                doc.boards.set(i, board);
            }
        });
        doc.save(function(err, done){
            if (err) return res.status(500).send(err);
            res.status(200).end();
        });
    };
    if(method === 'twitter') {
        User.findOne({'twitter.username' : username}, fn);    
    }
    if(method === 'google') {
        User.findOne({'google.username' : username}, fn);    
    }
    if(method === 'local') {
        User.findOne({'local.username' : username}, fn);    
    }
});

router.put('/remove/board', isLoggedIn, function(req, res) {
    var board = req.body.board;
    var username = req.body.username;
    var method = req.body.method;
    var findSubDoc = function(err, doc) {
        if (err) return res.status(500).send(err);
        doc.boards.forEach(function(elem, i){
            if (elem.title === board.title) {
                doc.boards.splice(i, 1);
            } 
        });
        doc.save(function(err, done){
            if (err) return res.status(500).send(err);
            res.status(200).end();
        });
    };
    if(method === 'twitter') {
        User.findOne({'twitter.username' : username}, findSubDoc);    
    }
    if(method === 'google') {
        User.findOne({'google.username' : username}, findSubDoc);    
    }
    if(method === 'local') {
        User.findOne({'local.username' : username}, findSubDoc);    
    }
});

router.post('/add-image', isLoggedIn, function(req, res){
    var username = req.body.username;
    var method = req.body.method;
    var boardTitle = req.body.boardTitle;
    var img = req.body.img;
    var fnc = function(err, doc) {
        if (err) return res.status(500).send(err);
        doc.boards.forEach(function(elem, i){
            if (elem.title === boardTitle) {
                doc.boards[i].imgs.push(img);
            } 
        });
        doc.save(function(err){
            if (err) return res.status(500).send(err);
            res.status(200).end();
        });
    };
    if(method === 'twitter') {
        User.findOne({'twitter.username': username}, fnc);
    }
    if(method === 'google') {
        User.findOne({'google.username': username}, fnc);
    }
    if(method === 'local') {
        User.findOne({'local.username': username}, fnc);
    }
});

router.post('/save-image', isLoggedIn, function(req, res){
    var username = req.body.username;
    var method = req.body.method;
    var boardTitle = req.body.boardTitle;
    var img = req.body.img;
    var fnc = function(err, doc) {
        if (err) return res.status(500).send(err);
        doc.boards.forEach(function(elem, i){
            if (elem.title === boardTitle) {
                doc.boards[i].imgs.push(img);
            } 
        });
        doc.save(function(err){
            if (err) return res.status(500).send(err);
            res.status(200).end();
        });
    };
    if(method === 'twitter') {
        User.findOne({'twitter.username': username}, fnc);
    }
    if(method === 'google') {
        User.findOne({'google.username': username}, fnc);
    }
    if(method === 'local') {
        User.findOne({'local.username': username}, fnc);
    }
});

router.put('/move-images', isLoggedIn, function(req, res){
    var username = req.body.username;
    var method = req.body.method;
    var imgs = req.body.imgsArr;
    var origBoardTitle = req.body.currBoardTitle;
    var destBoardTitle = req.body.nextBoardTitle;
    var fnc = function(err, doc) {
        if (err) return res.status(500).send(err);
        // aggiungi le immagini contenute nell'array nella nuova board di destinazione. 
        imgs.forEach(function(elem){
            doc.boards.forEach(function(elem2, i){
                if (elem2.title === destBoardTitle) {
                    doc.boards[i].imgs.push(elem)
                }
            });
        });
        // rimuovi le immagini contenute nell'array dalla board da cui le vogliamo spostare.
        imgs.forEach(function(elem){
            doc.boards.forEach(function(elem2, i){
                if (elem2.title === origBoardTitle) {
                    doc.boards[i].imgs.forEach(function(elem3, i2){
                        if(elem3.url === elem.url) {
                            doc.boards[i].imgs.splice(i2, 1);
                        }
                    });
                }
            });
        });
        doc.save(function(err){
            if (err) return res.status(500).send(err);
            res.status(200).end();
        });
    }
    if(method === 'twitter') {
        User.findOne({'twitter.username' : username}, fnc);    
    }
    if(method === 'google') {
        User.findOne({'google.username' : username}, fnc);    
    }
    if(method === 'local') {
        User.findOne({'local.username' : username}, fnc);    
    }
});

router.post('/copy-images', isLoggedIn, function(req, res){
    var username = req.body.username;
    var method = req.body.method;
    var imgs = req.body.imgsArr;
    var destBoardTitle = req.body.nextBoardTitle;
    var fnc = function(err, doc) {
        if (err) return res.status(500).send(err);
        imgs.forEach(function(elem){
            doc.boards.forEach(function(elem2, i){
                if (elem2.title === destBoardTitle) {
                    doc.boards[i].imgs.push(elem);
                }
            });
        });
        doc.save(function(err){
            if (err) return res.status(500).send(err);
            res.status(200).end();
        });
    }
    if(method === 'twitter') {
        User.findOne({'twitter.username' : username}, fnc);    
    }
    if(method === 'google') {
        User.findOne({'google.username' : username}, fnc);    
    }
    if(method === 'local') {
        User.findOne({'local.username' : username}, fnc);    
    }
});

router.put('/delete-images', function(req, res){
    var username = req.body.username;
    var method = req.body.method;
    var imgs = req.body.imgsArr;
    var boardTitle = req.body.boardTitle;
    var fnc = function(err, doc) {
        if (err) return res.status(500).send(err);
        imgs.forEach(function(elem){
            doc.boards.forEach(function(elem2, i){
                if (elem2.title === boardTitle) {
                    doc.boards[i].imgs.forEach(function(elem3, i2){
                        if(elem3.url === elem.url) {
                            doc.boards[i].imgs.splice(i2, 1);
                        }
                    });
                }
            });
        });
        doc.save(function(err){
            if (err) return res.status(500).send(err);

            res.status(200).end();
        });
    }
    if(method === 'twitter') {
        User.findOne({'twitter.username' : username}, fnc);
    }
    if(method === 'google') {
        User.findOne({'google.username' : username}, fnc);
    }
    if(method === 'local') {
        User.findOne({'local.username' : username}, fnc);
    }
});

router.put('/update-image', function(req, res){
    var username = req.body.username;
    var method = req.body.method;
    var img = req.body.img;
    var boardTitle = req.body.boardTitle;
    var fnc = function(err, doc) {
        if (err) return res.status(500).send(err);
        doc.boards.forEach(function(elem, i){
            if (elem.title === boardTitle) {
                doc.boards[i].imgs.forEach(function(elem2, i2){
                    if (elem2.url === img.url) {
                        doc.boards[i].imgs.set(i2, img);
                    }
                });
            }
        });
        doc.save(function(err){
            if (err) return res.status(500).send(err);
            return res.status(200).end();
        });
    }
    if(method === 'twitter') {
        User.findOne({'twitter.username' : username}, fnc);    
    }
    if(method === 'google') {
        User.findOne({'google.username' : username}, fnc);    
    }
    if(method === 'local') {
        User.findOne({'local.username' : username}, fnc);    
    }
});

// route particolare che viene utilizzata per aggiornare la descrizione di default delle immagini al cambio dell'username o del 'displayName'. 
router.put('/update-images', function(req, res){
    var method = req.body.method;
    var username = req.body.username;
    var newUsername = req.body.obj.newUsername;
    // se e presente un nuovo username
    if (newUsername) {
        username = newUsername;
    }
    var oldDisplayName = req.body.obj.oldDisplayName;
    var newDisplayName = req.body.obj.newDisplayName;
    var profilePicUrl = req.body.obj.profilePicUrl;
    var fnc = function(err, doc) {
        if (err) return res.status(500).send(err);
        if (newDisplayName || username) {
            // per ogni board dell'utente
            doc.boards.forEach(function(board, i){
                // ed immagine inserita in ciascuna board
                board.imgs.forEach(function(img, i2){
                    // crea una nuova 'regExp' la quale conterrà l'attuale descrizione di default.
                    var regPatt = new RegExp((oldDisplayName || username) + ': ' + board.title, 'gi');
                    // se la descrizione dell'immagine combacia con la 'regExp'
                    if (regPatt.test(img.description)) {
                        // e se è stato inserito un nuovo 'displayName', aggiorna la descrizione con una nuova la quale conterrà il nuovo 'displayName' e il titolo della board.
                        if (newDisplayName) {
                            doc.boards[i].imgs[i2].description = newDisplayName + ': ' + board.title;
                        }
                        // se non non vi fossero né un nuovo 'displayName' né uno vecchio ma fosse presente un nuovo username, aggiorna la descrizione di default dell'immagine con un'altra che contenga il nuovo username ed il titolo della board in cui è inserita.
                        if ((!newDisplayName || !oldDisplayName) && newUsername) {
                            doc.boards[i].imgs[i2].description = newUsername + ': ' + board.title;
                        }
                    }
                    // aggiorna la proprietà 'displayName' dell'oggetto 'img'.
                    doc.boards[i].imgs[i2].displayName = newDisplayName;
                    if (profilePicUrl) {
                        doc.boards[i].imgs[i2].profilePicUrl = profilePicUrl;
                    }
                });
            });
        } else {
            doc.boards.forEach(function(board, i){
                board.imgs.forEach(function(img, i2){
                    doc.boards[i].imgs[i2].profilePicUrl = profilePicUrl;
                });
            });
        }
        doc.save(function(err){
            if (err) return res.status(500).send(err);
            return res.status(200).end();
        });
    }
    if(method === 'twitter') {
        User.findOne({'twitter.username': username}, fnc);    
    }
    if(method === 'google') {
        User.findOne({'google.username': username}, fnc);    
    }
    if(method === 'local') {
        User.findOne({'local.username': username}, fnc);    
    }
});

// definisci le routes protette.
router.get(['/profile/:username',
            '/profile/:username/:board-title',
            '/settings',
            '/user/:username',
            'image-details/:component'], isLoggedIn, function(req, res){
    res.sendFile('index.html', {root: path.join(__dirname, '/dist')});
});

// definisci le routes pubbliche.
router.get(['/',
            '/home',
            '/signup',
            '/*'], function(req, res){
    res.sendFile('index.html', {root: path.join(__dirname, '/dist')});
});

module.exports = router;