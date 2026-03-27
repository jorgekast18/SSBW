import { Router } from "express";
import prisma from "../prisma/prisma.client.ts";

const router = Router();

router.get("/productos", async (req, res) => {
  const { desde, hasta, ordenación } = req.query;
  
  const take = hasta && desde ? Number(hasta) - Number(desde) + 1 : undefined;
  const skip = desde ? Number(desde) - 1 : undefined;
  
  let orderBy: any = undefined;
  if (ordenación === "ascendente") {
    orderBy = { precio: "asc" };
  } else if (ordenación === "descendente") {
    orderBy = { precio: "desc" };
  }

  try {
    const productos = await prisma.producto.findMany({
      skip,
      take,
      orderBy
    });
    res.json(productos);
  } catch (err) {
    const e = err as Error;
    res.status(500).json({ error: e.message });
  }
});

router.get("/productos/:id", async (req, res) => {
  try {
    const producto = await prisma.producto.findUnique({
      where: { id: parseInt(req.params.id) }
    });
    if (!producto) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }
    res.json(producto);
  } catch (err) {
    const e = err as Error;
    res.status(500).json({ error: e.message });
  }
});

router.post("/productos", async (req, res) => {
  try {
    const producto = await prisma.producto.create({
      data: req.body
    });
    res.status(201).json(producto);
  } catch (err) {
    const e = err as Error;
    res.status(500).json({ error: e.message });
  }
});

router.put("/productos/:id", async (req, res) => {
  try {
    const { título, descripción, precio, imagen } = req.body;
    const producto = await prisma.producto.update({
      where: { id: parseInt(req.params.id) },
      data: { título, descripción, precio, imagen }
    });
    res.json(producto);
  } catch (err) {
    const e = err as Error;
    res.status(500).json({ error: e.message });
  }
});

router.delete("/productos/:id", async (req, res) => {
  try {
    await prisma.producto.delete({
      where: { id: parseInt(req.params.id) }
    });
    res.status(204).send();
  } catch (err) {
    const e = err as Error;
    res.status(500).json({ error: e.message });
  }
});

export default router;
