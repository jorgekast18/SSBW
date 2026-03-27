import express from 'express';
import session from 'express-session';
import nunjucks from 'nunjucks';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import ProductosRouter from "./routes/productos.ts";
import UsuariosRouter from "./routes/usuarios.ts";
import ApiRouter from "./routes/api.ts";
import logger from "./logger.ts";
import prisma from "./prisma/prisma.client.ts";

declare module 'express-session' {
  interface SessionData {
    carrito: { id: number, cantidad: number }[];
    total_carrito: number;
  }
}

declare global {
  namespace Express {
    interface Request {
      usuario?: string;
      admin?: boolean;
    }
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

app.use(cookieParser())

app.use((req, res, next) => {
  const token = req.cookies.access_token;
  if (token) {
     try {
       const data = jwt.verify(token, process.env.SECRET_KEY || 'tiendaprado_secret') as any;
       req.usuario = data.usuario;
       req.admin = data.admin;
       app.locals.usuario = data.usuario;
       app.locals.admin = data.admin;
     } catch(e) {
       app.locals.usuario = undefined;
       app.locals.admin = undefined;
     }
  } else {
     app.locals.usuario = undefined;
     app.locals.admin = undefined;
  }
  next()
})

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

// Auth router
app.use('/', UsuariosRouter);

// API router
app.use('/api', ApiRouter);

// Product router
app.use('/', ProductosRouter);

app.listen(port, () => {
  logger.info(`Server running at http://localhost:${port}`)
})