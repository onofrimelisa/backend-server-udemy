var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');

var Schema = mongoose.Schema;

var rolesValidos = {
    values: ['ADMIN_ROL', 'USER_ROL'],
    message: '{VALUE} no es un rol permitido'
}

var usuarioSchema = new Schema({
    nombre: { type: String, required: [true, 'El nombre es necesario.'] },
    email: { type: String, unique: true, required: [true, 'El email es necesario.'] },
    password: { type: String, required: [true, 'El password es necesario.'] },
    img: { type: String, required: false },
    fecha_nacimiento: { type: Date, required: true },
    rol: { type: String, required: [true, 'El rol es necesario.'], default: 'USER_ROL', enum: rolesValidos },
    google: { type: Boolean, default: false }
});

usuarioSchema.plugin(uniqueValidator, { message: 'El campo {PATH} debe ser único' });
module.exports = mongoose.model('Usuario', usuarioSchema);