import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client.ts";
import bcrypt from "bcrypt";

const connectionString = `${process.env.DATABASE_URL}`;

const adapter = new PrismaPg({ connectionString });
const basePrisma = new PrismaClient({ adapter });

const prisma = basePrisma.$extends({
  model: {
    usuario: {
      async autentifica(email: string, contraseña: string) {
        const usuario = await basePrisma.usuario.findUnique({
          where: { email }
        });
        if (!usuario) {
          throw new Error("Usuario no encontrado");
        }
        const match = await bcrypt.compare(contraseña, usuario.contraseña);
        if (!match) {
          throw new Error("Contraseña incorrecta");
        }
        return usuario;
      }
    }
  }
});

export default prisma;