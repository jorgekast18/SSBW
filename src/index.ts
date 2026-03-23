import express from 'express'
import session from 'express-session'
import nunjucks from 'nunjucks'
import ProductosRouter from "./routes/productos.ts"
import logger from "./logger.ts"
import prisma from "./prisma/prisma.client.ts"

declare module 'express-session' {
  interface SessionData {
    carrito: { id: number, cantidad: number }[];
    total_carrito: number;
  }
}

const app = express()
const port = process.env.PORT || 3000

// Configure Nunjucks
nunjucks.configure('src/views', {
  autoescape: true,
  express: app
})

// Middleware for static files
app.use('/public/imagenes', express.static('imagenes'))

// Middleware for form parameters
app.use(express.urlencoded({ extended: true }));

// Middleware for sessions
app.use(session({
  secret: process.env.SESSION_SECRET || 'my-secret',
  resave: false,
  saveUninitialized: false
}))

// Global middleware to pass cart state to all views
app.use(async (req, res, next) => {
  res.locals.total_carrito = req.session.total_carrito || 0;

  if (req.session.carrito && req.session.carrito.length > 0) {
    try {
      const ids = req.session.carrito.map(item => item.id);
      const productos = await prisma.producto.findMany({
        where: { id: { in: ids } }
      });

      const carrito_items = req.session.carrito.map(item => {
        const prod = productos.find(p => p.id === item.id);
        return {
          ...item,
          producto: prod,
          subtotal: Number(prod?.precio || 0) * item.cantidad
        };
      });

      res.locals.carrito_items = carrito_items;
      res.locals.carrito_total_precio = carrito_items.reduce((acc, curr) => acc + curr.subtotal, 0);
    } catch (error) {
      logger.error(`Error loading cart items: ${error}`);
      res.locals.carrito_items = [];
      res.locals.carrito_total_precio = 0;
    }
  } else {
    res.locals.carrito_items = [];
    res.locals.carrito_total_precio = 0;
  }
  next();
});

// Product router
app.use('/', ProductosRouter)

app.listen(port, () => {
  logger.info(`Server running at http://localhost:${port}`)
})