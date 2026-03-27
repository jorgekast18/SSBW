-- CreateTable
CREATE TABLE "Usuario" (
    "email" CHAR(127) NOT NULL,
    "nombre" CHAR(127) NOT NULL,
    "contraseña" TEXT NOT NULL,
    "admin" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("email")
);
