
function obtenerCarritoDelStorage() {
  try {
    const carritoGuardado = localStorage.getItem("misProductos");

    if (carritoGuardado == null) {
      return [];
    }

    const productosCarrito = JSON.parse(carritoGuardado) ?? [];

    return productosCarrito.map((producto) => ({
      ...producto,
      cantidad: producto.cantidad ?? 1
    }));
  } catch (error) {
    return [];
  }
}

function obtenerProductosDelStorage() {
  try {
    const productosGuardados = localStorage.getItem("productos");

    if (productosGuardados == null) {
      return [];
    }

    return JSON.parse(productosGuardados) ?? [];
  } catch (error) {
    return [];
  }
}

const carrito = obtenerCarritoDelStorage();
const productos = obtenerProductosDelStorage();

const vaciarCarrito = document.getElementById("vaciar-carrito");
const continuarCompra = document.getElementById("continuar-compra");

function guardarDatos() {
  localStorage.setItem("misProductos", JSON.stringify(carrito));
  localStorage.setItem("productos", JSON.stringify(productos));
}

function calcularTotal() {
  return carrito.reduce((acumulador, producto) => {
    return acumulador + producto.precio * producto.cantidad;
  }, 0);
}

function imprimirTotal() {
  const totalCarrito = document.getElementById("total-carrito");
  totalCarrito.textContent = ` $${calcularTotal().toLocaleString("es-AR")}`;
}

function imprimirCarritoEnHTML() {
  const listaCarrito = document.getElementById("listaDeCarrito");
  listaCarrito.innerHTML = "";

  if (carrito.length === 0) {
    const mensaje = document.createElement("li");
    mensaje.textContent = "Tu carrito está vacío.";
    listaCarrito.appendChild(mensaje);
  }

  for (const [index, producto] of carrito.entries()) {
    const { nombre, precio, cantidad, img } = producto;

    const item = document.createElement("li");
    item.classList.add("item-carrito");

    const imagen = document.createElement("img");

    imagen.src = img
      ? (img.startsWith("./") ? `../${img.slice(2)}` : img)
      : "";

    imagen.alt = nombre;
    imagen.classList.add("imagen-carrito");

    if (!img) {
      imagen.hidden = true;
    }

    const informacion = document.createElement("div");
    informacion.classList.add("info-producto");

    const texto = document.createElement("span");
    texto.textContent =
      `${nombre} × ${cantidad}: $${(precio * cantidad).toLocaleString("es-AR")}`;

    informacion.appendChild(texto);

    const botonRestar = document.createElement("button");
    botonRestar.textContent = "−";
    botonRestar.setAttribute("aria-label", `Restar una unidad de ${nombre}`);
    botonRestar.addEventListener("click", () => cambiarCantidad(index, -1));

    const botonSumar = document.createElement("button");
    botonSumar.textContent = "+";
    botonSumar.setAttribute("aria-label", `Agregar una unidad de ${nombre}`);
    botonSumar.addEventListener("click", () => cambiarCantidad(index, 1));

    const botonEliminar = document.createElement("button");
    botonEliminar.textContent = "Eliminar";
    botonEliminar.addEventListener("click", () => eliminarProducto(index));

    item.appendChild(imagen);
    item.appendChild(informacion);
    item.appendChild(botonRestar);
    item.appendChild(botonSumar);
    item.appendChild(botonEliminar);

    listaCarrito.appendChild(item);
  }

  imprimirTotal();

  vaciarCarrito.disabled = carrito.length === 0;
  continuarCompra.disabled = carrito.length === 0;
}

function cambiarCantidad(index, cambio) {
  const productoCarrito = carrito[index];

  if (!productoCarrito) {
    return;
  }

  const productoOriginal = productos.find(
    (producto) => producto.id === productoCarrito.id
  );

  if (cambio > 0) {
    if (!productoOriginal || productoOriginal.stock <= 0) {
      Swal.fire({
        title: "Sin stock disponible",
        text: "No quedan más unidades de este producto.",
        icon: "warning"
      });

      return;
    }

    productoOriginal.stock--;
    productoCarrito.cantidad++;
  } else {
    if (productoOriginal) {
      productoOriginal.stock++;
    }

    productoCarrito.cantidad--;

    if (productoCarrito.cantidad <= 0) {
      carrito.splice(index, 1);
    }
  }

  guardarDatos();
  imprimirCarritoEnHTML();
}

function restaurarStock(productoCarrito) {
  const productoOriginal = productos.find(
    (producto) => producto.id === productoCarrito.id
  );

  if (productoOriginal) {
    productoOriginal.stock += productoCarrito.cantidad;
  }
}

function eliminarProducto(index) {
  const productoEliminado = carrito[index];

  if (!productoEliminado) {
    return;
  }

  restaurarStock(productoEliminado);
  carrito.splice(index, 1);

  guardarDatos();
  imprimirCarritoEnHTML();
}

vaciarCarrito.addEventListener("click", () => {
  for (const producto of carrito) {
    restaurarStock(producto);
  }

  carrito.length = 0;

  guardarDatos();
  imprimirCarritoEnHTML();
});

continuarCompra.addEventListener("click", () => {
  if (carrito.length === 0) {
    return;
  }

  const total = calcularTotal();

  Swal.fire({
    title: "¿Querés confirmar tu compra?",
    text: `El total de tu compra es $${total.toLocaleString("es-AR")}.`,
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "Confirmar compra",
    cancelButtonText: "Seguir comprando"
  }).then((resultado) => {
    if (resultado.isConfirmed) {
      carrito.length = 0;

      guardarDatos();
      imprimirCarritoEnHTML();

      Swal.fire({
        title: "¡Compra realizada! 👜",
        text: "Gracias por comprar en Zadira.",
        icon: "success"
      });
    }
  });
});

imprimirCarritoEnHTML();