// inicializa el servidor de express, bd, etc


// Requires (importacion de librerias para que funcione algo)
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser')

// Inicializar variables
// creo mi aplicacion, inicializo la variable express
var app = express();

// Body Parserparse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


// Conexion a la BD
mongoose.connection.openUri('mongodb://localhost:27017/hospitalDB', (err, res) => {

    if (err) {
        throw err;
    }

    console.log('Base de datos: \x1b[32m%s\x1b[0m', 'online');

});


// Importar Rutas
var appRoutes = require('./routes/app');
var usuarioRoutes = require('./routes/usuario');
var loginRoutes = require('./routes/login');

// defino el middleware (se ejecuta antes de que se resuelvan otras rutas)
app.use('/usuario', usuarioRoutes);
app.use('/login', loginRoutes);
app.use('/', appRoutes);


// Escuchar peticiones
app.listen(3000, () => {
    console.log('Express server corriendo en el puerto 3000: \x1b[32m%s\x1b[0m', 'online');

});