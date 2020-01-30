var express = require('express');
var bcrypt = require('bcryptjs');

var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

//mdoelo de usuarios
var Usuario = require('../models/usuario');


// OBTENER TODOS LOS USUARIOS
app.get('/', (request, response, next) => {

    var desde = request.query.desde || 0;
    desde = Number(desde);

    Usuario.find({}, 'nombre email img rol google')
        .skip(desde)
        .limit(5)
        .exec(

            (err, usuarios) => {

                if (err) {
                    return response.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando usuarios.',
                        errors: err
                    });
                }

                Usuario.count({}, (err, total) => {
                    if (err) {
                        return response.status(400).json({
                            ok: false,
                            mensaje: 'Error al buscar usuarios.'
                        });
                    }

                    response.status(200).json({
                        ok: true,
                        total: total,
                        usuarios: usuarios
                    });

                });
            }
        );

});

// ACTUALIZAR UN USUARIO

app.put('/:id', [mdAutenticacion.verificaToken, mdAutenticacion.verificaAdminOMismoUser], (request, response) => {
    var id = request.params.id;

    // verifico si un usuario existe con ese id

    Usuario.findById(id, (err, usuario) => {

        if (err) {
            return response.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario.',
                errors: err
            });
        }

        if (!usuario) {
            return response.status(400).json({
                ok: false,
                mensaje: 'El usuario con el id ' + id + ' no existe.',
                errors: { message: 'No existe un ususario con ese id' }
            });
        }

        var body = request.body;
        usuario.nombre = body.nombre;
        usuario.email = body.email;
        usuario.rol = body.rol;

        usuario.save((err, usuarioGuardado) => {
            if (err) {
                return response.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar usuario.',
                    errors: err
                });
            }

            usuarioGuardado.password = null;

            response.status(200).json({
                ok: true,
                message: 'Usuario actualizado con éxito',
                usuario: usuarioGuardado
            });
        });


    });

});



// CREAR UN USUARIO

app.post('/', (request, response) => {

    var body = request.body;

    if (chequearEdad(body.fecha_nacimiento)) {

        var usuario = new Usuario({
            nombre: body.nombre,
            email: body.email,
            password: bcrypt.hashSync(body.password, 10),
            img: body.img,
            fecha_nacimiento: body.fecha_nacimiento,
            rol: body.rol,
        });

        usuario.save((err, usuarioGuardado) => {

            if (err) {
                return response.status(400).json({
                    ok: false,
                    mensaje: 'Error al crear usuario.',
                    errors: err
                });
            }

            response.status(201).json({
                ok: true,
                usuario: usuarioGuardado,
                usuarioToken: request.usuario
            });


        });

    } else {
        return response.status(400).json({
            ok: false,
            message: 'Debe ser mayor de edad para poder registrarse en el sitio.'
        });
    }


});

// BORRAR UN USUARIO

app.delete('/:id', [mdAutenticacion.verificaToken, mdAutenticacion.verificaAdmin], (request, response) => {

    var id = request.params.id;

    Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {
        if (err) {
            return response.status(500).json({
                ok: false,
                mensaje: 'Error al borrar usuario.',
                errors: err
            });
        }

        if (!usuarioBorrado) {
            return response.status(400).json({
                ok: false,
                mensaje: 'No existe un usuario con ese id'
            });
        }

        response.status(200).json({
            ok: true,
            usuario: usuarioBorrado
        });
    });
});

// CHEQUEAR +18
function chequearEdad(fecha) {
    var fecha_aux = new Date(fecha);

    // Cálculo de las diferencias.
    var years = new Date().getFullYear() - fecha_aux.getFullYear();
    var months = new Date().getMonth() - fecha_aux.getMonth() + 1;
    var days = new Date().getDate() - fecha_aux.getDate();

    if ((years > 18) || (years == 18 && months >= 0 && days >= 0)) {
        return true;

    }
    return false;


}

module.exports = app;