import express from "express"
import prisma from "../prisma/prisma.client.ts"

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
    } catch (error) {
        console.error("~ error:", error.message)
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
    } catch (error) {
        console.error("~ error:", error.message)
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
    } catch (error) {
        console.error("~ error:", error.message)
        res.status(500).send(`Error: ${error.message}`)
    }
})

export default router
