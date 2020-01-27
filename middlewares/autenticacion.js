var jwt = require('jsonwebtoken');

var SEED = require('../config/config').SEED;

// VERIFICAR TOKEN

exports.verificaToken = function(request, response, next) {

    var token = request.query.token;

    jwt.verify(token, SEED, (err, decoded) => {
        if (err) {
            return response.status(401).json({
                ok: false,
                message: 'Token inválido',
                errors: err
            });
        }

        request.usuario = decoded.usuario;

        next();
    });

};

// VERIFICAR ADMINISTRADOR

exports.verificaAdmin = function(request, response, next) {

    var usuario = request.usuario;

    if (usuario.rol === 'ADMIN_ROL') {
        next();
        return;
    } else {

        return response.status(401).json({
            ok: false,
            message: 'No es administrador',
            errors: { message: 'No es administrador' }
        });
    }

};

// VERIFICAR ADMINISTRADOR O MISMO USUARIO

exports.verificaAdminOMismoUser = function(request, response, next) {

    var usuario = request.usuario;
    var id = request.params.id;

    if (usuario.rol === 'ADMIN_ROL' || id === usuario._id) {
        next();
        return;
    } else {

        return response.status(401).json({
            ok: false,
            message: 'No es administrador ni el mismo usuario',
            errors: { message: 'No es administrador ni el mismo usuario' }
        });
    }

};