var express = require('express');

var app = express();

var Hospital = require('../models/hospital');
var Medico = require('../models/medico');
var Usuario = require('../models/usuario');

// ###############################################################################
//										Busqueda por coleccion
// ###############################################################################
app.get('/coleccion/:coleccion/:busqueda', (request, response) => {
    var busqueda = request.params.busqueda;
    var coleccion = request.params.coleccion;
    var promesa;

    switch (coleccion) {
        case 'medicos':
            promesa = buscarMedicos(busqueda);

            break;
        case 'usuarios':
            promesa = buscarUsuarios(busqueda);

            break;
        case 'hospitales':
            promesa = buscarHospitales(busqueda);

            break;

        default:
            response.status(500).json({
                ok: false,
                message: 'Error al realizar la búsqueda por esa coleccion.',
                error: { message: 'Las colecciones validas son: hospitales, medicos y usuarios ' }
            });
    }

    promesa.then(data => {
        response.status(200).json({
            ok: true,
            [coleccion]: data
        });
    }).catch(err => {
        response.status(500).json({
            ok: false,
            message: 'Error al realizar la búsqueda',
            error: err
        });
    });
});



// ###############################################################################
//										Busqueda general
// ###############################################################################
app.get('/todo/:busqueda', (request, response, next) => {

    var busqueda = request.params.busqueda;

    Promise.all([
        buscarHospitales(busqueda),
        buscarUsuarios(busqueda),
        buscarMedicos(busqueda)
    ]).then(respuestas => {
        response.status(200).json({
            ok: true,
            hospitales: respuestas[0],
            usuarios: respuestas[1],
            medicos: respuestas[2]

        });

    }).catch(err => {
        response.status(500).json({
            ok: false,
            error: err

        });

    });

});

function buscarHospitales(busqueda) {

    var regex = new RegExp(busqueda, 'i');

    return new Promise((resolve, reject) => {

        Hospital.find({ nombre: regex })
            .populate('usuario', 'nombre email')
            .exec((error, hospitales) => {

                if (error) {
                    reject('Error al cargar hospitales', error);

                } else {
                    resolve(hospitales);

                }

            });
    });


}

function buscarMedicos(busqueda) {

    var regex = new RegExp(busqueda, 'i');

    return new Promise((resolve, reject) => {

        Medico.find({ nombre: regex }, (error, medicos) => {

            if (error) {
                reject('Error al cargar medicos', error);

            } else {
                resolve(medicos);

            }

        });
    });


}

function buscarUsuarios(busqueda) {

    var regex = new RegExp(busqueda, 'i');

    return new Promise((resolve, reject) => {

        Usuario.find({}, 'nombre email rol')
            .or([{ 'nombre': regex }, { 'email': regex }])
            .exec((err, usuarios) => {

                if (err) {
                    reject('Error al cargar usuarios', err);
                } else {
                    resolve(usuarios);
                }


            });
    });


}

module.exports = app;