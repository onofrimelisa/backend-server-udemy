// db.getCollection('usuarios').find({}).sort({_id:1})
var express = require('express');
var mdAutenticacion = require('../middlewares/autenticacion');
var app = express();

//modelos
var Usuario = require('../models/usuario');
var Hospital = require('../models/hospital');
var Medico = require('../models/medico');


app.get('/', [mdAutenticacion.verificaToken], (request, response) => {
    var entidades = [];

    Usuario.find({}).sort({ _id: -1 }).exec((err, usuarios) => {
        if (err) {
            return response.status(500).json({
                ok: false,
                message: 'Error al buscar usuarios',
                error: err
            });
        }
        entidades.push(usuarios.shift());

        // medicos
        Medico.find({}).sort({ _id: -1 }).exec((err, medicos) => {
            if (err) {
                return response.status(500).json({
                    ok: false,
                    message: 'Error al buscar medicos',
                    error: err
                });
            }

            entidades.push(medicos.shift());

            // hospitales
            Hospital.find({}).sort({ _id: -1 }).exec((err, hospitales) => {
                if (err) {
                    return response.status(500).json({
                        ok: false,
                        message: 'Error al buscar hospitales',
                        error: err
                    });
                }

                entidades.push(hospitales.shift());

                return response.status(200).json({
                    ok: true,
                    entidades: entidades
                })



            });



        });



    });

});

module.exports = app;