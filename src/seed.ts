import prisma from './prisma/prisma.client.ts';

type Producto = {
  título: string
  descripción: string
  texto_precio: string
  imagen: string
}
type Productos = Producto[]

import productos from "../products.json" with {type: 'json'}
await Guadar_en_DB(productos)

await prisma.$disconnect()

// async porque dentro hay await
async function Guadar_en_DB(productos: Productos): Promise<void> {

  for (const producto of productos) {
    const título = producto.título
    const descripción = producto.descripción
    const imagen = producto.imagen
    const precio = Number(producto.texto_precio.slice(0, -2).replace(/,/, '.'))
    //console.log(precio)
    try {
      const prod = await prisma.producto.create({
        data:{
          título,
          descripción,
          imagen,
          precio
        }
      })
      console.log('Creado', prod)
    } catch(error:any) {
      console.error(error.message)
    }
  } // end-for

} // end-function