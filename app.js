// inicializa el servidor de express, bd, etc

// carga las variables de entorno
require('dotenv').config();

// Requires (importacion de librerias para que funcione algo)
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');

// Inicializar variables
// creo mi aplicacion, inicializo la variable express
var app = express();

// CORS
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "PUT, GET, POST, OPTIONS, DELETE");
    next();
});
// Body Parserparse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


// Conexion a la BD
mongoose.connection.openUri(process.env.MONGODB_URI, {

    useNewUrlParser: true,
    useUnifiedTopology: true

}, (err, resp) => {
    if (err) {
        throw err;
    }

    console.log('Base de datos: \x1b[32m%s\x1b[0m', 'online');
});

// // Server index config
// var serveIndex = require('serve-index');
// app.use(express.static(__dirname + '/'));
// app.use('/uploads', serveIndex(__dirname + '/uploads'));


// Importar Rutas
var appRoutes = require('./routes/app');
var usuarioRoutes = require('./routes/usuario');
var loginRoutes = require('./routes/login');
var hospitalRoutes = require('./routes/hospital');
var medicoRoutes = require('./routes/medico');
var busquedaRoutes = require('./routes/busqueda');
var uploadRoutes = require('./routes/upload');
var imagenesRoutes = require('./routes/imagenes');
var entidadesRoutes = require('./routes/entidades');

// defino el middleware (se ejecuta antes de que se resuelvan otras rutas)
app.use('/usuario', usuarioRoutes);
app.use('/login', loginRoutes);
app.use('/hospital', hospitalRoutes);
app.use('/medico', medicoRoutes);
app.use('/busqueda', busquedaRoutes);
app.use('/upload', uploadRoutes);
app.use('/img', imagenesRoutes);
app.use('/entidades', entidadesRoutes);

// esta tiene que ser siempre la ultima ruta
app.use('/', appRoutes);


// Escuchar peticiones
app.listen(3000, () => {
    console.log('Express server corriendo en el puerto 3000: \x1b[32m%s\x1b[0m', 'online');

});