var express = require('express');
var bcrypt = require('bcryptjs');

var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

//modelos
var Usuario = require('../models/usuario');
var Hospital = require('../models/hospital');
var Medico = require('../models/medico');


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

// get dashboard para ADMIN
app.get('/dashboard/:id', mdAutenticacion.verificaToken, (request, response) => {
    var id = request.params.id;

    // chequeo que exista el usuario con ese id
    Usuario.findById(id, (err, usuarioBD) => {

        if (err) {
            return response.status(500).json({
                ok: false,
                message: 'No existe un usuario con ese id',
                error: err
            });
        }
        var cantidadGoogle = 0;
        var cantidadTotal = 0;

        // existe el usuario, chequeo su rol
        if (usuarioBD.rol === 'ADMIN_ROL') {

            // cuento el total de usuarios
            Usuario.estimatedDocumentCount({}, (err, totalUsuarios) => {
                if (err) {
                    return response.status(500).json({
                        ok: false,
                        message: 'Error al contar total de usuarios',
                        error: err
                    });
                }

                cantidadTotal = cantidadTotal + totalUsuarios;


                // cuento el total con google
                Usuario.count({ 'google': true }, (err, totalGoogle) => {
                    if (err) {
                        return response.status(500).json({
                            ok: false,
                            message: 'Error al contar usuarios autenticados con Google',
                            error: err
                        });
                    }
                    cantidadGoogle = cantidadGoogle + totalGoogle;

                    return dashboardAdmin(response, cantidadGoogle, cantidadTotal - cantidadGoogle, cantidadTotal);
                });
            });



        } else {
            console.log('no es admin');
            return response.status(200).json({
                ok: false,
                message: '-'
            });

        }


    });

});


function dashboardAdmin(response, cantidadGoogle, cantidadNormal, totalUsuarios) {
    var totalHospitales = 0;
    var totalMedicos = 0;

    // cuento total de hospitales
    Hospital.count({}, (err, totalHospitalesAux) => {
        if (err) {
            return response.status(500).json({
                ok: false,
                message: 'Error al contar hospitales',
                error: err
            });
        }

        totalHospitales = totalHospitales + totalHospitalesAux;

        // cuento total de medicos
        Medico.count({}, (err, totalMedicosAux) => {
            if (err) {
                return response.status(500).json({
                    ok: false,
                    message: 'Error al contar medicos',
                    error: err
                });
            }

            totalMedicos = totalMedicos + totalMedicosAux;

            // devuelvo el json para los graficos
            return response.status(200).json({
                ok: true,
                graficos: {
                    autenticacion: {
                        labels: ['Autenticación con google', 'Autenticación normal'],
                        data: [cantidadGoogle, cantidadNormal],
                        type: 'doughnut',
                        leyenda: 'Autenticación de usuarios'
                    },
                    entidades: {
                        labels: ['Médicos', 'Hospitales', 'Usuarios'],
                        data: [totalMedicos, totalHospitales, totalUsuarios],
                        type: 'doughnut',
                        leyenda: 'Entidades cargadas'
                    },
                    top3hospitales: {
                        labels: ['Hospital1', 'Hospital2', 'hospital3'],
                        data: [24, 30, 46],
                        type: 'doughnut',
                        leyenda: 'Top 3 hospitales con mayor cantidad de médicos asignados'
                    }
                }
            });
        });
    });

}

module.exports = app;