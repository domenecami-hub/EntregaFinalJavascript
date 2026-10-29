const productos = [];

function obtenerCarritoDelStorage() {
  try {
    const carritoGuardado = localStorage.getItem("misProductos") || "[]";

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

const carrito = obtenerCarritoDelStorage();

const vaciarCarrito = document.getElementById("vaciar-carrito");
const formulario = document.getElementById("formulario");
const mensaje = document.getElementById("mensajeCarrito");
const inputBuscar = document.querySelector("#formulario input");

async function cargarProductos() {
  try {
    const respuesta = await fetch("./data/data.json");

    if (!respuesta.ok) {
      throw new Error("No se pudieron cargar los productos");
    }

    const productosJSON = await respuesta.json();
    const productosGuardados = localStorage.getItem("productos");

    if (productosGuardados !== null) {
      const productosParseados = JSON.parse(productosGuardados);

      if (Array.isArray(productosParseados) && productosParseados.length > 0) {
        productos.push(...productosParseados);
      } else {
        productos.push(...productosJSON);
        guardarProductos();
      }
    } else {
      productos.push(...productosJSON);
      guardarProductos();
    }

    imprimirElementosEnHTML(productos);
    imprimirCarritoEnHTML();

  } catch (error) {
    document.getElementById("productos").textContent =
      "No se pudieron cargar los productos. Intentá nuevamente.";

    Toastify({
      text: "Error al cargar los productos",
      duration: 3000,
      gravity: "top",
      position: "right"
    }).showToast();
  }
}

function guardarProductos() {
  localStorage.setItem("productos", JSON.stringify(productos));
}

function guardarCarrito() {
  localStorage.setItem("misProductos", JSON.stringify(carrito));
}

function imprimirElementosEnHTML(listaProductos) {
  const productosDOM = document.getElementById("productos");
  productosDOM.innerHTML = "";

  if (listaProductos.length === 0) {
    productosDOM.textContent = "No se encontraron productos.";
    return;
  }

  for (const producto of listaProductos) {
    const { nombre, precio, categoria, stock, img, id } = producto;

    const card = document.createElement("div");
    card.classList.add("card");

    const estadoStock = stock > 0 ? "Disponible" : "Sin stock";

    card.innerHTML = `
      <img src="${img}" alt="${nombre}">
      <h3>${nombre}</h3>
      <p>Categoría: ${categoria}</p>
      <p>Precio: $${precio}</p>
      <p>Stock: ${stock}</p>
      <p>Estado: ${estadoStock}</p>
      <button class="card-boton" data-id="${id}" ${stock <= 0 ? "disabled" : ""}>
        Comprar
      </button>
    `;

    productosDOM.appendChild(card);

    const botonComprar = card.querySelector(".card-boton");

    botonComprar.addEventListener("click", () => {
      agregarProductoAlCarrito(producto);
    });
  }
}

function agregarProductoAlCarrito(producto) {
  if (producto.stock <= 0) {
    Toastify({
      text: `${producto.nombre} no tiene stock disponible`,
      duration: 3000,
      gravity: "top",
      position: "right"
    }).showToast();

    return;
  }

  const productoEnCarrito = carrito.find(
    (item) => item.id === producto.id
  );

  if (productoEnCarrito) {
    productoEnCarrito.cantidad++;
  } else {
    carrito.push({
      ...producto,
      cantidad: 1
    });
  }

  producto.stock--;

  guardarProductos();
  guardarCarrito();

  imprimirElementosEnHTML(productos);
  imprimirCarritoEnHTML();

  Toastify({
    text: `${producto.nombre} agregado al carrito`,
    duration: 3000,
    gravity: "top",
    position: "right",
    style: {
      background: "linear-gradient(to right, #8d726e, #efd8de)"
    }
  }).showToast();
}

function imprimirCarritoEnHTML() {
  const listaCarrito = document.getElementById("listaDeCarrito");
  listaCarrito.innerHTML = "";

  if (carrito.length === 0) {
    const item = document.createElement("li");
    item.textContent = "Tu carrito está vacío.";
    listaCarrito.appendChild(item);
  }

  for (const [index, producto] of carrito.entries()) {
    const item = document.createElement("li");
    const { nombre, precio, cantidad } = producto;

    item.textContent = `${nombre} × ${cantidad}: $${precio * cantidad} `;

    const botonEliminar = document.createElement("button");
    botonEliminar.textContent = "Eliminar";
    botonEliminar.classList.add("btn-eliminar");

    botonEliminar.addEventListener("click", () => {
      eliminarProductoDelCarrito(index);
    });

    item.appendChild(botonEliminar);
    listaCarrito.appendChild(item);
  }
}

function restaurarStock(productoCarrito) {
  const productoOriginal = productos.find(
    (producto) => producto.id === productoCarrito.id
  );

  if (productoOriginal) {
    productoOriginal.stock += productoCarrito.cantidad;
  }
}

function eliminarProductoDelCarrito(index) {
  const productoEliminado = carrito[index];

  if (!productoEliminado) {
    return;
  }

  restaurarStock(productoEliminado);
  carrito.splice(index, 1);

  guardarProductos();
  guardarCarrito();

  imprimirElementosEnHTML(productos);
  imprimirCarritoEnHTML();

  mensaje.textContent = "Producto eliminado del carrito.";
}

vaciarCarrito.addEventListener("click", () => {
  for (const producto of carrito) {
    restaurarStock(producto);
  }

  carrito.length = 0;

  guardarProductos();
  guardarCarrito();

  imprimirElementosEnHTML(productos);
  imprimirCarritoEnHTML();

  mensaje.textContent = "Carrito vaciado.";
});

formulario.addEventListener("submit", (e) => {
  e.preventDefault();
  buscarProductos();
});

inputBuscar.addEventListener("input", buscarProductos);

function buscarProductos() {
  const texto = inputBuscar.value
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  const productosFiltrados = productos.filter((producto) =>
    producto.nombre
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .includes(texto)
  );

  imprimirElementosEnHTML(productosFiltrados);
}

cargarProductos();

setTimeout(() => {
  Swal.fire({
    title: "¡Bienvenido a Zadira! 👜",
    text: "Envío gratis en compras superiores a $100.000.",
    timer: 3000,
    showConfirmButton: false
  });
}, 1000);