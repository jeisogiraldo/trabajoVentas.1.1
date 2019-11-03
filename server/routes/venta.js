const express = require('express');

// modelo de ventas
const Venta = require('../models/venta');

// modelo de productos
const Producto = require('../models/producto');

const { verificaToken, verificaAdmin_Role } = require('../middlewares/autenticacion');

const app = express();


// =================================
// Mostrar todas las ventas
// =================================
app.get('/venta', verificaToken, async(req, res) => {

    await Venta.find({ estado: true })
        .populate('productos.producto', 'nombre precioUni')
        .exec((err, ventaBD) => {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            res.status(200).json({
                ok: true,
                venta: ventaBD
            });

        });

});

// =================================
// Buscar producto o factura vendida
// =================================
app.get('/venta/buscar/:termino', verificaToken, (req, res) => {

    let termino = req.params.termino;

    Venta.find({ "productos.nombre": termino })
        .exec((err, data) => {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            if (data.length === 0) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'Producto no encontrado'
                    }
                });
            }

            res.json({
                ok: true,
                data
            })

        });


});

// =================================
// Registro de venta en la base de datos
// =================================
app.post('/venta', verificaToken, (req, res) => {

    let body = req.body;

    let venta = new Venta({

        usuario: body.usuario,
        factura: body.factura,
        productos: body.productos

    });

    // =================================
    //  Guardar venta de productos
    // =================================
    venta.save((err, ventaBD) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        let v = ventaBD.productos;

        // =================================
        // Actualizar la cantidad de productos
        // =================================
        function ActualizarDatosProducto(obj) {
            if ('producto' in obj && typeof(obj.producto)) {
                console.log(obj.producto);

                Producto.findById(obj.producto, (err, dataPro) => {

                    if (err) {
                        return res.status(500).json({
                            ok: false,
                            err
                        });
                    }

                    let cont = dataPro.cantidad - obj.cantidad;

                    dataPro.cantidad = cont;

                    dataPro.save((err, proSave) => {

                        if (err) {
                            return res.status(500).json({
                                ok: false,
                                err
                            });
                        }

                        console.log({ proSave });

                    });


                });

            }
        }

        let fgg = v.filter(ActualizarDatosProducto);
        // =================================
        // FIN Actualizar la cantidad de productos
        // =================================

        res.json({
            ok: true,
            venta: ventaBD
        });

    });

});


// =================================
// Actualizar factura de productos vendidos 
// =================================
app.put('/venta/:id', verificaToken, (req, res) => {

    let id = req.params.id;
    let body = req.body;

    Venta.findById(id, (err, dataSearch) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!dataSearch) {
            return res.status(404).json({
                ok: false,
                err
            });
        }

        dataSearch.usuario = body.usuario;
        dataSearch.factura = body.factura;
        dataSearch.estado = body.estado;
        dataSearch.productos = body.productos;

        dataSearch.save((err, dataSave) => {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                dataSave
            });

        });


    });

});


// =================================
// Eliminar factura de productos vendidos / Cambia estado a false 
// =================================
app.delete('/venta/:id', [verificaToken, verificaAdmin_Role], (req, res) => {

    let id = req.params.id;

    Venta.findById(id, (err, dataDelete) => {

        if (err) {
            return res.status(500).json({
                ok: true,
                err
            });
        }

        // console.log({ dataDelete });

        dataDelete.estado = false;

        dataDelete.save((err, ventaD) => {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                data: ventaD,
                mesaje: 'Venta borrada'
            })

        });

    });

});



module.exports = app;