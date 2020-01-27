var express = require('express');

var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

// modelo de medicos
var Medico = require('../models/medico');

// Recuperar todos los medicos
app.get('/', (request, response) => {

    var desde = request.query.desde || 0;
    desde = Number(desde);

    Medico.find({})
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .populate('hospital')
        .exec((err, medicos) => {
            if (err) {
                return response.status(500).json({
                    ok: false,
                    message: 'Error al buscar médicos.',
                    errors: err
                });
            }

            Medico.count({}, (err, total) => {
                if (err) {
                    return response.status(400).json({
                        ok: false,
                        mensaje: 'Error al buscar medicos.'
                    });
                }

                return response.status(200).json({
                    ok: true,
                    total: total,
                    medicos: medicos
                });

            });
        });
});

// Recuperar un médico
app.get('/:id', (request, response) => {
    let id = request.params.id;

    Medico.findById(id)
        .populate('usuario', 'nombre email img')
        .populate('hospital')
        .exec((err, medico) => {

            if (err) {
                return response.status(500).json({
                    ok: false,
                    message: 'Error al buscar médico',
                    error: err
                });
            }

            if (!medico) {
                return response.status(400).json({
                    ok: false,
                    message: 'No existe un medico con ese id'
                });
            }

            return response.status(200).json({
                ok: true,
                medico: medico
            });

        });
})

// Crear medicos
app.post('/', mdAutenticacion.verificaToken, (request, response) => {

    var body = request.body;

    var medico = new Medico({
        nombre: body.nombre,
        img: body.img,
        usuario: body.usuario,
        hospital: body.hospital
    });

    medico.save((err, medicoGuardado) => {

        if (err) {
            return response.status(500).json({
                ok: false,
                message: 'Error al guardar medico.',
                errors: err
            });
        }

        response.status(201).json({
            ok: true,
            message: 'Se creó el médico ' + medico.nombre,
            medico: medicoGuardado,
            usuarioToken: request.usuario
        });
    });
});

// Actualizar un medico
app.put('/:id', mdAutenticacion.verificaToken, (request, response) => {
    var id = request.params.id;
    var body = request.body;

    Medico.findById(id, (err, medico) => {

        if (err) {
            return response.status(500).json({
                ok: false,
                message: 'Error al buscar medicos',
                errors: err
            });
        }

        if (!medico) {
            return response.status(400).json({
                ok: false,
                message: 'No existe un medico con ese id.',
                errors: err
            });
        }

        medico.nombre = body.nombre;
        medico.img = body.img;
        medico.usuario = body.usuario;
        medico.hospital = body.hospital;

        medico.save((err, medicoGuardado) => {

            if (err) {
                return response.status(500).json({
                    ok: false,
                    message: 'Error al actualizar medico',
                    errors: err
                });
            }

            return response.status(200).json({
                ok: true,
                message: 'Se actualizo la información del médico.',
                medico: medicoGuardado
            });
        });


    });
});

// eliminar un medico
app.delete('/:id', mdAutenticacion.verificaToken, (request, response) => {
    var id = request.params.id;

    Medico.findByIdAndRemove(id, (err, medicoBorrado) => {
        if (err) {
            return response.status(500).json({
                ok: false,
                message: 'Error al buscar medico.',
                errors: err
            });
        }

        if (!medicoBorrado) {
            return response.status(400).json({
                ok: false,
                message: 'No existe un medico con ese id',
                errors: err
            });
        }

        return response.status(200).json({
            ok: true,
            message: 'Medico borrado con éxito.',
            medico: medicoBorrado
        });
    });
});

module.exports = app;