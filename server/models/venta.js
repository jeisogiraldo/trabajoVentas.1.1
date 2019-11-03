const mongoose = require('mongoose');

const Schema = mongoose.Schema;

let proSchema = new Schema({

    producto: { type: Schema.Types.ObjectId, ref: 'Producto' },
    cantidad: { type: Number },
    estado: { type: Boolean, default: true },

});


let ventaSchema = new Schema({
    usuario: { type: Schema.Types.ObjectId, ref: 'Usuario', require: true },
    factura: { type: Number, },
    estado: { type: Boolean, default: true },
    productos: [proSchema]

}, { timestamps: true });

module.exports = mongoose.model('Venta', ventaSchema);