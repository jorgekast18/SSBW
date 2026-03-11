import express from 'express'
import nunjucks from 'nunjucks'
import ProductosRouter from "./routes/productos.ts"

const app = express()
const port = 3000

// Configure Nunjucks
nunjucks.configure('src/views', {
    autoescape: true,
    express: app
})

// Middleware for static files
app.use('/public/imagenes', express.static('imagenes'))

// Product router
app.use('/', ProductosRouter)

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`)
})