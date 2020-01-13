var express = require('express');
var fileUpload = require('express-fileupload');
var app = express();

var Usuario = require('../models/usuario');
var Medico = require('../models/medico');
var Hospital = require('../models/hospital');

// Recurso filesystem de node para poder borrar las imagenes
var fs = require('fs');

// default options
app.use(fileUpload());

app.put('/:tipo/:id', (request, response, next) => {

    var tipo = request.params.tipo;
    var id = request.params.id;

    // tipos de coleccion
    var tiposValidos = ['hospitales', 'medicos', 'usuarios'];

    if (tiposValidos.indexOf(tipo) < 0) {
        return response.status(500).json({
            ok: false,
            message: 'Tipo de colección inválida.'
        });
    }

    if (!request.files || Object.keys(request.files).length === 0) {
        return response.status(400).json({
            ok: false,
            message: 'No se seleccionó ningún archivo.'
        });
    }

    // The name of the input field (i.e. "imagen") is used to retrieve the uploaded file
    var imagen = request.files.imagen;

    // obtener nombre del archivo
    var nombreCortado = imagen.name.split('.');
    var extension = nombreCortado[nombreCortado.length - 1];
    console.log(extension);


    // extensiones aceptadas
    var extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];

    if (extensionesValidas.indexOf(extension) < 0) {
        return response.status(400).json({
            ok: false,
            message: 'Extension no valida.',
            error: { message: 'Las extensiones validas son: ' + extensionesValidas.join(', ') }
        });
    }

    // nombre del archivo personalizado
    var nombreArchivo = `${ id }-${ new Date().getMilliseconds() }.${ extension }`;

    var path = `./uploads/${ tipo }/${ nombreArchivo }`;


    // Use the mv() method to place the file somewhere on your server
    imagen.mv(path, (err) => {
        if (err) {
            return response.status(400).json({
                ok: false,
                message: 'Error al mover archivo.',
                error: err
            });
        }

        subirPorTipo(tipo, id, nombreArchivo, response)


    });
});


function subirPorTipo(tipo, id, nombreArchivo, response) {

    switch (tipo) {
        case 'usuarios':
            Usuario.findById(id, (err, usuario) => {

                if (err) {
                    return response.status(500).json({
                        ok: false,
                        message: 'Error al buscar usuario.',
                        errors: err
                    });
                }

                var pathViejo = './uploads/usuarios/' + usuario.img;

                // si existe, elimina la imagen anterior
                if (fs.existsSync(pathViejo)) {
                    fs.unlink(pathViejo);
                }

                usuario.img = nombreArchivo;

                usuario.save((err, usuarioActualizado) => {

                    if (err) {
                        return response.status(500).json({
                            ok: false,
                            message: 'Error al actualizar imagen de usuario.',
                            errors: err
                        });
                    }

                    return response.status(200).json({
                        ok: true,
                        mensaje: 'Imagen de usuario actualizada correctamente.',
                        usuario: usuarioActualizado
                    });
                });
            });
            break;

        case 'hospitales':

            Hospital.findById(id, (err, hospital) => {

                if (err) {
                    return response.status(500).json({
                        ok: false,
                        message: 'Error al buscar hospital.',
                        errors: err
                    });
                }

                if (!hospital) {
                    return response.status(400).json({
                        ok: false,
                        message: 'No existe un hospital con ese id.'
                    });
                }

                var pathViejo = './uploads/hospitales/' + hospital.img;

                // si existe, elimina la imagen anterior
                if (fs.existsSync(pathViejo)) {
                    fs.unlink(pathViejo);
                }

                hospital.img = nombreArchivo;

                hospital.save((err, hospitalActualizado) => {

                    if (err) {
                        return response.status(500).json({
                            ok: false,
                            message: 'Error al actualizar imagen de hospital.',
                            errors: err
                        });
                    }

                    return response.status(200).json({
                        ok: true,
                        mensaje: 'Imagen de hospital actualizada correctamente.',
                        hospital: hospitalActualizado
                    });
                });
            });

            break;

        case 'medicos':
            Medico.findById(id, (err, medico) => {

                if (err) {
                    return response.status(500).json({
                        ok: false,
                        message: 'Error al buscar medico.',
                        errors: err
                    });
                }

                if (!medico) {
                    return response.status(400).json({
                        ok: false,
                        message: 'No existe un medico con ese id.'
                    });
                }

                var pathViejo = './uploads/medicos/' + medico.img;

                // si existe, elimina la imagen anterior
                if (fs.existsSync(pathViejo)) {
                    fs.unlink(pathViejo);
                }

                medico.img = nombreArchivo;

                medico.save((err, medicoActualizado) => {

                    if (err) {
                        return response.status(500).json({
                            ok: false,
                            message: 'Error al actualizar imagen de medico.',
                            errors: err
                        });
                    }

                    return response.status(200).json({
                        ok: true,
                        mensaje: 'Imagen de medico actualizada correctamente.',
                        medico: medicoActualizado
                    });
                });
            });

            break;
    }
}

module.exports = app;