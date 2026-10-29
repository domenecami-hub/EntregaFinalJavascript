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

    // Imagen del producto
    const imagen = document.createElement("img");

    imagen.src = img
      ? (img.startsWith("./") ? `../${img.slice(2)}` : img)
      : "";

    imagen.alt = nombre;
    imagen.classList.add("imagen-carrito");

    // Información del producto
    const informacion = document.createElement("div");
    informacion.classList.add("info-producto");

    const texto = document.createElement("span");
    texto.textContent = `${nombre} × ${cantidad}: $${precio * cantidad}`;

    informacion.appendChild(texto);

    // Botón para restar unidades
    const botonRestar = document.createElement("button");
    botonRestar.textContent = "−";
    botonRestar.addEventListener("click", () => cambiarCantidad(index, -1));

    // Botón para sumar unidades
    const botonSumar = document.createElement("button");
    botonSumar.textContent = "+";
    botonSumar.addEventListener("click", () => cambiarCantidad(index, 1));

    // Botón para eliminar el producto
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