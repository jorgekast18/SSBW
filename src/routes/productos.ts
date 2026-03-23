import express from "express"
import prisma from "../prisma/prisma.client.ts"
import logger from "../logger.ts"

const router = express.Router()

// Home page
router.get('/', async (req, res) => {
    try {
        const cards = await prisma.producto.findMany({
            select: {
                id: true,
                título: true,
                precio: true,
                imagen: true
            }
        })
        res.render('portada.njk', { cards })
    } catch (error: any) {
        logger.error(`Error en home: ${error.message}`)
        res.status(500).send(`Error: ${error.message}`)
    }
})

// Search
router.get('/buscar', async (req, res) => {
    const query = req.query.busqueda as string
    try {
        const cards = await prisma.producto.findMany({
            where: {
                título: {
                    contains: query,
                    mode: 'insensitive'
                }
            },
            select: {
                id: true,
                título: true,
                precio: true,
                imagen: true
            }
        })
        res.render('portada.njk', { cards, query })
    } catch (error: any) {
        logger.error(`Error en búsqueda: ${error.message}`)
        res.status(500).send(`Error: ${error.message}`)
    }
})

// Product detail
router.get('/producto/:id', async (req, res) => {
    const id = parseInt(req.params.id)
    try {
        const product = await prisma.producto.findUnique({
            where: { id }
        })
        if (!product) {
            return res.status(404).send("Producto no encontrado")
        }
        res.render('detalle.njk', { product })
    } catch (error: any) {
        logger.error(`Error en producto detalle: ${error.message}`)
        res.status(500).send(`Error: ${error.message}`)
    }
})

// carrito
router.post('/al-carrito/:id', async (req, res) => {
    const id = Number(req.params.id)
    const cantidad = Number(req.body.cantidad)
    logger.debug(`Al carrito de ${id} ${cantidad} unidad(es)`)

    if (cantidad > 0) {
        if (req.session.carrito !== undefined) {
            const item = req.session.carrito.find(c => c.id === id)
            if (item) {
                item.cantidad += cantidad
            } else {
                req.session.carrito.push({ id, cantidad })
            }
        } else {
            req.session.carrito = [{ id, cantidad }]
        }

        // calcular el total de productos del carrito
        let total = 0
        for (const it of req.session.carrito) {
            total += it.cantidad
        }
        res.locals.total_carrito = total
        req.session.total_carrito = total
        logger.debug(`Total en carrito: ${res.locals.total_carrito}`)
    }

    // redirigir de vuelta a la misma página
    res.redirect(`/producto/${id}`)
})

export default router
