var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var Schema = mongoose.Schema;

var imgSchema = new Schema({
    title: String,
    url: String,
    description: String,
    createdBy: String,
    displayName: String,
    profilePicUrl: String,
    board: String,
    broken: Boolean,
    source: Boolean
});

// Importante: fare attenzione ad impostare delle proprietà 'uniche' perchè vanno ad interessare tutta la collezione non solo l'oggetto/array in cui sono inserite, e una volta creata non la si può cancellare ad esempio modificando la sua accessibilità all'interno del modello ma verrà lasciato in memoria un indice unico che farà riferimento a quella proprietà anche se modificata.
var boardSchema = new Schema({
    title: {type: String, required: true},
    imgs: [imgSchema],
    coverUrl: String,
    description: String,
    secret: Boolean
});

var userSchema = new Schema({
    local: {
        method: String,
        username: String,
        firstName: String,
        surname: String,
        displayName: String,
        email: String,
        password: String,
        description: String,
        photos: []
    },
    twitter: {
        method: String,
        id: String,
        username: String,
        email: String,
        firstName: String,
        surname: String,
        displayName: String,
        token: String,
        description: String,
        photos: []
    },
    google: {
        method: String,
        id: String,
        email: String,
        username: String,
        firstName: String,
        surname: String,
        displayName: String,
        token: String,
        description: String,
        photos: []
    },
    boards: [boardSchema]
});

userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(10));
};

userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.local.password);
};

module.exports = mongoose.model("PunItUsers", userSchema);