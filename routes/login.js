var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var SEED = require('../config/config').SEED;

var app = express();
var Usuario = require('../models/usuario');

// google
var CLIENT_ID = require('../config/config').CLIENT_ID;
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(CLIENT_ID);




// ###############################################################################
//										LOGIN CON GOOGLE
// ###############################################################################
async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();
    // const userid = payload['sub'];
    // If request specified a G Suite domain:
    //const domain = payload['hd'];

    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true,
    }
}

app.post('/google', async(request, response) => {

    var token = request.body.token;
    var googleUsr = await verify(token)
        .catch(err => {
            return response.status(403).json({
                ok: false,
                message: 'Token inválido.',
                errors: err
            });
        });

    Usuario.findOne({ email: googleUsr.email }, (err, usuarioBD) => {
        if (err) {
            return response.status(500).json({
                ok: false,
                message: 'Error al buscar usuario',
                errors: err
            });
        }

        if (usuarioBD) {
            if (usuarioBD.google === false) {
                return response.status(400).json({
                    ok: false,
                    message: 'Debe autenticarse de forma normal.'
                });
            } else {
                usuarioBD.password = null;
                // crear un token
                var token = jwt.sign({ usuario: usuarioBD }, SEED, { expiresIn: 14400 }); // 4 horas

                return response.status(200).json({
                    ok: true,
                    usuario: usuarioBD,
                    token: token,
                    menu: obtenerMenu(usuarioBD.rol)
                });
            }
        } else {
            // El usuario no existe, hay que crearlo

            var usuario = new Usuario({
                nombre: googleUsr.nombre,
                img: googleUsr.img,
                email: googleUsr.email,
                google: true,
                password: '-'
            });

            usuario.save((err, usuarioNuevo) => {

                if (err) {
                    return response.status(500).json({
                        ok: false,
                        message: 'Error al crear usuario',
                        errors: err
                    });
                }

                // crear un token
                var token = jwt.sign({ usuario: usuarioBD }, SEED, { expiresIn: 14400 }); // 4 horas

                return response.status(200).json({
                    ok: true,
                    usuario: usuarioNuevo,
                    token: token,
                    menu: obtenerMenu(usuarioNuevo.rol)

                });

            });
        }
    });
});


// ###############################################################################
//										LOGIN NORMAL
// ###############################################################################
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
            token: token,
            menu: obtenerMenu(usuarioBD.rol)

        });
    });

});

function obtenerMenu(rol) {

    var menu = [{
            titulo: 'Principal',
            icono: 'mdi mdi-gauge',
            submenu: [{
                    titulo: 'Dashboard',
                    url: '/dashboard'
                },
                {
                    titulo: 'Progress',
                    url: '/progress'
                },
                {
                    titulo: 'Graficas',
                    url: '/graficas1'
                },
                {
                    titulo: 'Promesas',
                    url: '/promesas'
                },
                {
                    titulo: 'Observables',
                    url: '/observables'
                },
                {
                    titulo: 'Settings',
                    url: '/settings'
                }
            ]
        },
        {
            titulo: 'Mantenimiento',
            icono: 'mdi mdi-folder-lock-open',
            submenu: [
                // { titulo: 'Usuarios', url: '/usuarios' },
                { titulo: 'Hospitales', url: '/hospitales' },
                { titulo: 'Medicos', url: '/medicos' }
            ]
        }
    ];

    if (rol == 'ADMIN_ROL') {
        menu[1].submenu.unshift({ titulo: 'Usuarios', url: '/usuarios' });
    }


    return menu;
}

module.exports = app;