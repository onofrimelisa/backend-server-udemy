var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var SEED = require('../config/config').SEED;

var app = express();
var Usuario = require('../models/usuario');

app.post('/', (request, response) => {

    var body = request.body;

    Usuario.findOne({ email: body.email }, (err, usuarioBD) => {

        if (err) {
            return response.status(500).json({
                ok: false,
                message: 'Error al buscar usuario',
                errors: err
            });
        }

        if (!usuarioBD) {
            return response.status(400).json({
                ok: false,
                message: 'Credenciales incorrectas',
                errors: err
            });
        }

        // usuario valido, hay que verificar la contraseña

        if (!bcrypt.compareSync(body.password, usuarioBD.password)) {
            return response.status(400).json({
                ok: false,
                message: 'Credenciales incorrectas',
                errors: err
            });
        }

        usuarioBD.password = null;
        // crear un token
        var token = jwt.sign({ usuario: usuarioBD }, SEED, { expiresIn: 14400 }); // 4 horas

        return response.status(200).json({
            ok: true,
            usuario: usuarioBD,
            token: token
        });
    });

});

module.exports = app;