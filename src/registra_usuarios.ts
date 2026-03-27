import prisma from "./prisma/prisma.client.ts";
import bcrypt from "bcrypt";

async function run() {
  try {
    const contraseña = await bcrypt.hash("1234", 10);

    const usuarios = [
      {
        email: "pepito@correo.com",
        nombre: "Pepito",
        contraseña,
        admin: false
      },
      {
        email: "juana@example.com",
        nombre: "Juana",
        contraseña,
        admin: false
      }
    ]

    for (const usuario of usuarios) {
      await prisma.usuario.create({
        data: usuario
      });
      console.log("Registered user:", usuario.email);
    }

  } catch (error) {
    console.error("Error registering user:", error);
  } finally {
    process.exit(0);
  }
}

run();
