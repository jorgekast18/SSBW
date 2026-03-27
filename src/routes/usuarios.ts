import { Router } from "express";
import jwt from "jsonwebtoken";
import prisma from "../prisma/prisma.client.ts";
import logger from "../logger.ts";

const router = Router();
const SECRET_KEY = process.env.SECRET_KEY || "tiendaprado_secret";

router.get("/login", (req, res) => {
  if (res.locals.usuario) {
    return res.redirect("/");
  }
  res.render("login.njk", { error: false });
});

router.post("/login", async (req, res) => {
  const { email, contraseña } = req.body;

  try {
    const usuario = await prisma.usuario.autentifica(email, contraseña);
    const token = jwt.sign(
      { usuario: usuario.nombre, admin: usuario.admin },
      SECRET_KEY,
      { expiresIn: "1h" }
    );

    res.cookie("access_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 3600000 // 1 hour
    }).redirect("/");

  } catch (error) {
    const err = error as Error;
    logger.error(`Error logging in: ${err.message}`);
    res.render("login.njk", { error: true });
  }
});

router.get("/logout", (req, res) => {
  res.clearCookie("access_token");
  res.redirect("/");
});

export default router;
