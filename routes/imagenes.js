var express = require('express');

var app = express();

const path = require('path');
const fs = require('fs');


app.get('/:coleccion/:img', (request, response, next) => {

    var coleccion = request.params.coleccion;
    var img = request.params.img;

    var pathImagen = path.resolve(__dirname, `../uploads/${ coleccion }/${ img }`);

    if (fs.existsSync(pathImagen)) {
        response.sendFile(pathImagen);
    } else {
        var pathNoImagen = path.resolve(__dirname, '../assets/no-img.jpg');
        response.sendFile(pathNoImagen);
    }
});

module.exports = app;