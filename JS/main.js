const productos = [];

function obtenerCarritoDelStorage() {
  try {
    const carritoGuardado = localStorage.getItem("misProductos") || "[]";
    const productosCarrito = JSON.parse(carritoGuardado);

    if (!Array.isArray(productosCarrito)) {
      return [];
    }

    return productosCarrito.map((producto) => ({
      ...producto,
      cantidad: producto.cantidad ?? 1
    }));
  } catch (error) {
    return [];
  }
}

const carrito = obtenerCarritoDelStorage();

const inputBuscar = document.getElementById("buscar-producto");
const botonesCategoria = document.querySelectorAll(".filtro-categoria");
const contadorProductos = document.getElementById("contador-productos");

let categoriaSeleccionada = "Todos";

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

      if (
        Array.isArray(productosParseados) &&
        productosParseados.length > 0
      ) {
        productos.push(...productosParseados);
      } else {
        productos.push(...productosJSON);
        guardarProductos();
      }
    } else {
      productos.push(...productosJSON);
      guardarProductos();
    }

    buscarProductos();
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

function normalizarTexto(texto) {
  return String(texto ?? "")
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function imprimirElementosEnHTML(listaProductos) {
  const productosDOM = document.getElementById("productos");

  if (!productosDOM) {
    return;
  }

  productosDOM.innerHTML = "";

  if (contadorProductos) {
    contadorProductos.textContent =
      `${listaProductos.length} ${
        listaProductos.length === 1
          ? "producto encontrado"
          : "productos encontrados"
      }`;
  }

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
      <button
        class="card-boton"
        data-id="${id}"
        ${stock <= 0 ? "disabled" : ""}
      >
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

  buscarProductos();

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

function buscarProductos() {
  if (!inputBuscar) {
    imprimirElementosEnHTML(productos);
    return;
  }

  const texto = normalizarTexto(inputBuscar.value);

  const productosFiltrados = productos.filter((producto) => {
    const nombre = normalizarTexto(producto.nombre);
    const categoria = normalizarTexto(producto.categoria);

    const coincideTexto =
      nombre.includes(texto) || categoria.includes(texto);

    const coincideCategoria =
      categoriaSeleccionada === "Todos" ||
      categoria === normalizarTexto(categoriaSeleccionada);

    return coincideTexto && coincideCategoria;
  });

  imprimirElementosEnHTML(productosFiltrados);
}

if (inputBuscar) {
  inputBuscar.addEventListener("input", buscarProductos);
}

botonesCategoria.forEach((boton) => {
  boton.addEventListener("click", () => {
    categoriaSeleccionada = boton.dataset.categoria || "Todos";

    botonesCategoria.forEach((otroBoton) => {
      otroBoton.classList.toggle("activo", otroBoton === boton);
    });

    buscarProductos();
  });
});

cargarProductos();

setTimeout(() => {
  Swal.fire({
    title: "¡Bienvenido a Zadira! 👜",
    text: "Envío gratis en compras superiores a $100.000.",
    timer: 3000,
    showConfirmButton: false
  });
}, 1000);