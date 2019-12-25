// inicializa el servidor de express, bd, etc


// Requires (importaciond e librerias para que funcione algo)
var express = require('express');
var mongoose = require('mongoose');


// Inicializar variables
// creo mi aplicacion, inicializo la variable express
var app = express();


// Conexion a la BD
mongoose.connection.openUri('mongodb://localhost:27017/hospitalDB', (err, res) => {

    if (err) {
        throw err;
    }

    console.log('Base de datos: \x1b[32m%s\x1b[0m', 'online');

});


// Rutas
app.get('/', (request, response, next) => {

    response.status(200).json({
        ok: true,
        mensaje: 'Peticion realizada correctamente'
    });
});

// Escuchar peticiones
app.listen(3000, () => {
    console.log('Express server corriendo en el puerto 3000: \x1b[32m%s\x1b[0m', 'online');

});