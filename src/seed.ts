import prisma from './prisma/prisma.client.ts';
import productos from "../products.json" with { type: 'json' };

type Producto = {
  título: string;
  descripción: string;
  texto_precio: string;
  imagen: string;
};
type Productos = Producto[];

async function Guadar_en_DB(productos: Productos): Promise<void> {
  // Limpiar base de datos antes de empezar
  console.log('Limpiando base de datos...');
  await prisma.producto.deleteMany();
  console.log('Base de datos limpia.');

  for (const producto of productos) {
    const título = producto.título;
    const descripción = producto.descripción;
    const imagen = producto.imagen;
    let precio = 0;
    if (producto.texto_precio) {
      // Remove currency and handle European number format
      const cleaned = producto.texto_precio.replace(/[^\d,.-]/g, '').replace(',', '.');
      precio = parseFloat(cleaned) || 0;
    }

    try {
      const prod = await prisma.producto.create({
        data: {
          título,
          descripción: descripción || "Sin descripción disponible.",
          imagen,
          precio
        }
      });
      console.log('Creado', prod.título, "-", prod.precio, "€");
    } catch (error: any) {
      console.error(`Error al crear producto ${título}:`, error.message);
    }
  } // end-for
} // end-function

// Ejecución principal
(async () => {
  try {
    await Guadar_en_DB(productos);
  } catch (error: any) {
    console.error("Error fatal en el seed:", error.message);
  } finally {
    await prisma.$disconnect();
  }
})();