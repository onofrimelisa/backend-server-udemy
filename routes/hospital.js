var express = require('express');

var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

//modelo de hospitales
var Hospital = require('../models/hospital');

// Obtener todos los hospitales

app.get('/', (request, response) => {

    var desde = request.query.desde || 0;
    desde = Number(desde);

    Hospital.find({})
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .exec((err, hospitales) => {
            if (err) {
                return response.status(500).json({
                    ok: false,
                    message: 'Error al buscar hospitales.',
                    errors: err
                });
            }

            Hospital.count({}, (err, total) => {
                if (err) {
                    return response.status(400).json({
                        ok: false,
                        mensaje: 'Error al buscar hospitales.'
                    });
                }

                return response.status(200).json({
                    ok: true,
                    total: total,
                    hospitales: hospitales
                });

            });
        });
});

// Crear hospital

app.post('/', mdAutenticacion.verificaToken, (request, response) => {

    var body = request.body;

    var hospital = new Hospital({
        nombre: body.nombre,
        img: body.img,
        usuario: body.usuario,
    });

    hospital.save((err, hospitalGuardado) => {

        if (err) {
            return response.status(500).json({
                ok: false,
                message: 'Error al agregar hospital.',
                errors: err
            });
        }

        response.status(201).json({
            ok: true,
            hospital: hospitalGuardado,
            usuarioToken: request.usuario
        });
    });

});

// Actualizar un hospital
app.put('/:id', mdAutenticacion.verificaToken, (request, response) => {
    var id = request.params.id;
    var body = request.body;

    Hospital.findById(id, (err, hospital) => {
        if (err) {
            return response.status(500).json({
                ok: false,
                message: 'Error al buscar hospitales.',
                errors: err
            });
        }

        if (!hospital) {
            return response.status(400).json({
                ok: false,
                message: 'No existe un hospital con ese id.',
                errors: err
            });
        }

        hospital.nombre = body.nombre;
        hospital.img = body.img;
        // hospital.usuario = body.usuario;

        hospital.save((err, hospitalActualizado) => {
            if (err) {
                return response.status(500).json({
                    ok: false,
                    message: 'Error al actualizar hospital.',
                    errors: err
                })
            }

            return response.status(200).json({
                ok: true,
                message: 'Hospital actualizado con éxito',
                hospital: hospitalActualizado
            });
        });
    });
});

// borrar un hospital
app.delete('/:id', mdAutenticacion.verificaToken, (request, response) => {
    var id = request.params.id;

    Hospital.findByIdAndDelete(id, (err, hospitalBorrado) => {

        if (err) {
            return response.status(500).json({
                ok: false,
                message: 'Error al buscar hospital',
                errors: err
            });
        }

        if (!hospitalBorrado) {
            return response.status(400).json({
                ok: false,
                message: 'No existe un hospital con ese id.',
                errors: err
            });
        }

        return response.status(200).json({
            ok: true,
            message: 'Hospital borrado con éxito.',
            hospital: hospitalBorrado
        });
    });
});


module.exports = app;