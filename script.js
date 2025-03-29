// Esperar a que el DOM esté completamente cargado
document.addEventListener("DOMContentLoaded", () => {
  // Variables globales
  let products = [] // Almacena todos los productos
  let cart = [] // Almacena los productos en el carrito
  let currentProduct = null // Producto actual seleccionado para añadir al carrito

  // Elementos del DOM
  const productsContainer = document.getElementById("productsContainer")
  const searchInput = document.getElementById("searchInput")
  const searchButton = document.getElementById("searchButton")
  const categoryButtons = document.querySelectorAll("[data-category]")
  const cartCount = document.getElementById("cartCount")
  const cartItemsList = document.getElementById("cartItemsList")
  const cartSubtotal = document.getElementById("cartSubtotal")
  const cartTax = document.getElementById("cartTax")
  const cartTotal = document.getElementById("cartTotal")
  const emptyCartMessage = document.getElementById("emptyCartMessage")
  const cartItems = document.getElementById("cartItems")
  const clearCartButton = document.getElementById("clearCartButton")
  const checkoutButton = document.getElementById("checkoutButton")
  const processPaymentButton = document.getElementById("processPaymentButton")

  // Elementos del modal de cantidad
  const quantityModal = document.getElementById("quantityModal")
  const quantityModalOverlay = document.getElementById("quantityModalOverlay")
  const closeQuantityModal = document.getElementById("closeQuantityModal")
  const cancelQuantityButton = document.getElementById("cancelQuantityButton")
  const modalProductName = document.getElementById("modalProductName")
  const modalProductPrice = document.getElementById("modalProductPrice")
  const modalProductImage = document.getElementById("modalProductImage")
  const quantityInput = document.getElementById("quantityInput")
  const decreaseQuantity = document.getElementById("decreaseQuantity")
  const increaseQuantity = document.getElementById("increaseQuantity")
  const addToCartButton = document.getElementById("addToCartButton")

  // Elementos del modal de detalles del producto
  const productDetailModal = document.getElementById("productDetailModal")
  const productDetailOverlay = document.getElementById("productDetailOverlay")
  const closeProductDetail = document.getElementById("closeProductDetail")
  const productDetailImage = document.getElementById("productDetailImage")
  const productDetailName = document.getElementById("productDetailName")
  const productDetailCategory = document.getElementById("productDetailCategory")
  const productDetailPrice = document.getElementById("productDetailPrice")
  const productDetailDescription = document.getElementById("productDetailDescription")
  const detailQuantityInput = document.getElementById("detailQuantityInput")
  const detailDecreaseQuantity = document.getElementById("detailDecreaseQuantity")
  const detailIncreaseQuantity = document.getElementById("detailIncreaseQuantity")
  const detailAddToCartButton = document.getElementById("detailAddToCartButton")

  // Elementos del modal del carrito
  const cartModal = document.getElementById("cartModal")
  const cartModalOverlay = document.getElementById("cartModalOverlay")
  const closeCartModal = document.getElementById("closeCartModal")
  const continueShoppingButton = document.getElementById("continueShoppingButton")

  // Elementos del modal de pago
  const paymentModal = document.getElementById("paymentModal")
  const paymentModalOverlay = document.getElementById("paymentModalOverlay")
  const closePaymentModal = document.getElementById("closePaymentModal")
  const cancelPaymentButton = document.getElementById("cancelPaymentButton")

  // Elementos del menú móvil
  const mobileMenuButton = document.getElementById("mobileMenuButton")
  const mobileMenu = document.getElementById("mobileMenu")

  // Elementos del carrito (nuevo)
  const cartButton = document.getElementById("cartButton")

  // Funciones para manejar modales
  function openModal(modal) {
    modal.classList.remove("hidden")
    document.body.classList.add("modal-open")
  }

  function closeModal(modal) {
    modal.classList.add("hidden")
    document.body.classList.remove("modal-open")
  }

  // Cargar productos desde la API
  async function fetchProducts() {
    try {
      const response = await fetch("https://fakestoreapi.com/products")
      if (!response.ok) {
        throw new Error("Error al cargar los productos")
      }
      products = await response.json()
      displayProducts(products)
    } catch (error) {
      console.error("Error:", error)
      productsContainer.innerHTML = `
                <div class="col-span-full text-center py-10">
                    <div class="bg-red-100 text-red-700 p-4 rounded-lg inline-block">
                        <i class="fas fa-exclamation-triangle mr-2"></i>
                        Error al cargar los productos. Por favor, intenta de nuevo más tarde.
                    </div>
                </div>
            `
    }
  }

  // Mostrar productos en la página
  function displayProducts(productsToDisplay) {
    // Limpiar el contenedor de productos
    productsContainer.innerHTML = ""

    if (productsToDisplay.length === 0) {
      productsContainer.innerHTML = `
                <div class="col-span-full text-center py-10">
                    <i class="fas fa-search text-gray-300 text-5xl mb-4"></i>
                    <h4 class="text-xl font-semibold text-gray-700">No se encontraron productos</h4>
                    <p class="text-gray-500">Intenta con otra búsqueda o categoría</p>
                </div>
            `
      return
    }

    // Crear tarjetas de productos
    productsToDisplay.forEach((product) => {
      const productCard = document.createElement("div")
      productCard.className = "bg-white rounded-xl shadow-md overflow-hidden product-card fade-in"
      productCard.innerHTML = `
                <div class="relative h-56 bg-white p-4 flex items-center justify-center cursor-pointer" data-id="${product.id}">
                    <img src="${product.image}" alt="${product.title}" class="max-h-full max-w-full object-contain">
                    <div class="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 transition-all duration-300 flex items-center justify-center">
                        <span class="opacity-0 hover:opacity-100 text-white bg-blue-600 px-4 py-2 rounded-full transform scale-0 hover:scale-100 transition-all duration-300">
                            Ver detalles
                        </span>
                    </div>
                </div>
                <div class="p-4">
                    <h5 class="text-lg font-semibold mb-2 h-14 overflow-hidden" title="${product.title}">${product.title}</h5>
                    <p class="text-sm text-gray-500 mb-4 h-12 overflow-hidden">${product.description.substring(0, 60)}...</p>
                    <div class="flex justify-between items-center">
                        <p class="text-xl font-bold text-blue-600">$${product.price.toFixed(2)}</p>
                        <button class="btn-add-to-cart p-2 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-600 hover:text-white transition-colors duration-300" data-id="${product.id}">
                            <i class="fas fa-cart-plus"></i>
                        </button>
                    </div>
                </div>
            `
      productsContainer.appendChild(productCard)
    })

    // Añadir event listeners a los botones de añadir al carrito
    document.querySelectorAll(".btn-add-to-cart").forEach((button) => {
      button.addEventListener("click", function (e) {
        e.stopPropagation() // Evitar que se abra el modal de detalles
        const productId = Number.parseInt(this.getAttribute("data-id"))
        openQuantityModal(productId)
      })
    })

    // Añadir event listeners para abrir el modal de detalles
    document.querySelectorAll(".product-card .h-56").forEach((card) => {
      card.addEventListener("click", function () {
        const productId = Number.parseInt(this.getAttribute("data-id"))
        openProductDetailModal(productId)
      })
    })
  }

  // Abrir modal de detalles del producto
  function openProductDetailModal(productId) {
    currentProduct = products.find((product) => product.id === productId)

    if (currentProduct) {
      productDetailImage.src = currentProduct.image
      productDetailName.textContent = currentProduct.title
      productDetailCategory.textContent = currentProduct.category
      productDetailPrice.textContent = `$${currentProduct.price.toFixed(2)}`
      productDetailDescription.textContent = currentProduct.description
      detailQuantityInput.value = 1

      openModal(productDetailModal)
    }
  }

  // Filtrar productos por categoría
  function filterProductsByCategory(category) {
    if (category === "all") {
      displayProducts(products)
    } else {
      const filteredProducts = products.filter((product) => product.category === category)
      displayProducts(filteredProducts)
    }
  }

  // Buscar productos
  function searchProducts(query) {
    query = query.toLowerCase().trim()
    if (query === "") {
      displayProducts(products)
      return
    }

    const filteredProducts = products.filter(
      (product) =>
        product.title.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query),
    )

    displayProducts(filteredProducts)
  }

  // Abrir modal de cantidad
  function openQuantityModal(productId) {
    currentProduct = products.find((product) => product.id === productId)

    if (currentProduct) {
      modalProductName.textContent = currentProduct.title
      modalProductPrice.textContent = `$${currentProduct.price.toFixed(2)}`
      modalProductImage.src = currentProduct.image
      quantityInput.value = 1

      openModal(quantityModal)
    }
  }

  // Actualizar el carrito
  function updateCart() {
    // Actualizar contador del carrito
    cartCount.textContent = cart.reduce((total, item) => total + item.quantity, 0)

    // Mostrar mensaje de carrito vacío si no hay productos
    if (cart.length === 0) {
      emptyCartMessage.classList.remove("hidden")
      cartItems.classList.add("hidden")
      checkoutButton.disabled = true
      checkoutButton.classList.add("opacity-50", "cursor-not-allowed")
      return
    }

    // Mostrar productos en el carrito
    emptyCartMessage.classList.add("hidden")
    cartItems.classList.remove("hidden")
    checkoutButton.disabled = false
    checkoutButton.classList.remove("opacity-50", "cursor-not-allowed")

    // Limpiar lista de productos en el carrito
    cartItemsList.innerHTML = ""

    // Calcular subtotal
    let subtotal = 0

    // Añadir productos al carrito
    cart.forEach((item) => {
      const product = products.find((p) => p.id === item.id)
      const itemSubtotal = product.price * item.quantity
      subtotal += itemSubtotal

      const row = document.createElement("tr")
      row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                        <img src="${product.image}" alt="${product.title}" class="w-12 h-12 object-contain mr-3">
                        <div class="text-sm font-medium text-gray-900 max-w-xs truncate">${product.title}</div>
                    </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">$${product.price.toFixed(2)}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center border rounded-md overflow-hidden w-24">
                        <button class="btn-decrease px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700" data-id="${product.id}">-</button>
                        <input type="text" class="w-8 text-center border-0 focus:ring-0" value="${item.quantity}" readonly>
                        <button class="btn-increase px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700" data-id="${product.id}">+</button>
                    </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">$${itemSubtotal.toFixed(2)}</td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button class="btn-remove text-red-600 hover:text-red-900" data-id="${product.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `
      cartItemsList.appendChild(row)
    })

    // Calcular impuestos y total
    const tax = subtotal * 0.16
    const total = subtotal + tax

    // Actualizar resumen del carrito
    cartSubtotal.textContent = `$${subtotal.toFixed(2)}`
    cartTax.textContent = `$${tax.toFixed(2)}`
    cartTotal.textContent = `$${total.toFixed(2)}`

    // Añadir event listeners a los botones del carrito
    document.querySelectorAll(".btn-decrease").forEach((button) => {
      button.addEventListener("click", function () {
        const productId = Number.parseInt(this.getAttribute("data-id"))
        decreaseCartItemQuantity(productId)
      })
    })

    document.querySelectorAll(".btn-increase").forEach((button) => {
      button.addEventListener("click", function () {
        const productId = Number.parseInt(this.getAttribute("data-id"))
        increaseCartItemQuantity(productId)
      })
    })

    document.querySelectorAll(".btn-remove").forEach((button) => {
      button.addEventListener("click", function () {
        const productId = Number.parseInt(this.getAttribute("data-id"))
        removeFromCart(productId)
      })
    })
  }

  // Añadir producto al carrito
  function addToCart(product, quantity) {
    // Buscar si el producto ya está en el carrito
    const existingItemIndex = cart.findIndex((item) => item.id === product.id)

    if (existingItemIndex !== -1) {
      // Actualizar cantidad si ya existe
      cart[existingItemIndex].quantity += quantity
    } else {
      // Añadir nuevo producto al carrito
      cart.push({
        id: product.id,
        quantity: quantity,
      })
    }

    // Guardar carrito en localStorage
    saveCartToLocalStorage()

    // Actualizar interfaz del carrito
    updateCart()

    // Mostrar notificación
    showToast(`${product.title} añadido al carrito`)
  }

  // Disminuir cantidad de un producto en el carrito
  function decreaseCartItemQuantity(productId) {
    const itemIndex = cart.findIndex((item) => item.id === productId)

    if (itemIndex !== -1) {
      if (cart[itemIndex].quantity > 1) {
        cart[itemIndex].quantity--
      } else {
        cart.splice(itemIndex, 1)
      }

      saveCartToLocalStorage()
      updateCart()
    }
  }

  // Aumentar cantidad de un producto en el carrito
  function increaseCartItemQuantity(productId) {
    const itemIndex = cart.findIndex((item) => item.id === productId)

    if (itemIndex !== -1) {
      cart[itemIndex].quantity++
      saveCartToLocalStorage()
      updateCart()
    }
  }

  // Eliminar producto del carrito
  function removeFromCart(productId) {
    cart = cart.filter((item) => item.id !== productId)
    saveCartToLocalStorage()
    updateCart()
  }

  // Vaciar carrito
  function clearCart() {
    cart = []
    saveCartToLocalStorage()
    updateCart()
  }

  // Guardar carrito en localStorage
  function saveCartToLocalStorage() {
    localStorage.setItem("cart", JSON.stringify(cart))
  }

  // Cargar carrito desde localStorage
  function loadCartFromLocalStorage() {
    const savedCart = localStorage.getItem("cart")
    if (savedCart) {
      cart = JSON.parse(savedCart)
      updateCart()
    }
  }

  // Mostrar notificación toast
  function showToast(message) {
    // Crear elemento toast
    const toastContainer = document.createElement("div")
    toastContainer.className = "fixed bottom-4 right-4 z-50"

    toastContainer.innerHTML = `
            <div class="bg-white rounded-lg shadow-lg p-4 mb-4 flex items-center border-l-4 border-blue-500">
                <div class="text-blue-500 mr-3">
                    <i class="fas fa-check-circle text-xl"></i>
                </div>
                <div>
                    <p class="font-medium">${message}</p>
                </div>
                <button class="ml-auto text-gray-400 hover:text-gray-500">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `

    document.body.appendChild(toastContainer)

    // Eliminar toast después de 3 segundos
    setTimeout(() => {
      toastContainer.remove()
    }, 3000)

    // Añadir event listener para cerrar el toast
    toastContainer.querySelector("button").addEventListener("click", () => {
      toastContainer.remove()
    })
  }

  // Generar factura en PDF
  function generateInvoice(customerInfo) {
    // Importar jsPDF
    const { jsPDF } = window.jspdf

    // Crear nuevo documento PDF
    const doc = new jsPDF()

    // Añadir título
    doc.setFontSize(20)
    doc.text("FACTURA", 105, 20, { align: "center" })

    // Añadir información de la tienda
    doc.setFontSize(12)
    doc.text("TechShop", 14, 30)
    doc.text("info@techshop.com", 14, 35)
    doc.text("(123) 456-7890", 14, 40)

    // Añadir fecha
    const today = new Date()
    doc.text(`Fecha: ${today.toLocaleDateString()}`, 14, 50)

    // Añadir información del cliente
    doc.text("CLIENTE:", 14, 60)
    doc.text(`Nombre: ${customerInfo.fullName}`, 14, 65)
    doc.text(`Email: ${customerInfo.email}`, 14, 70)
    doc.text(`Teléfono: ${customerInfo.phone}`, 14, 75)
    doc.text(`Dirección: ${customerInfo.address}`, 14, 80)

    // Añadir tabla de productos
    const tableColumn = ["Producto", "Precio", "Cantidad", "Subtotal"]
    const tableRows = []

    // Calcular subtotal
    let subtotal = 0

    // Añadir productos a la tabla
    cart.forEach((item) => {
      const product = products.find((p) => p.id === item.id)
      const itemSubtotal = product.price * item.quantity
      subtotal += itemSubtotal

      tableRows.push([
        product.title.substring(0, 30) + (product.title.length > 30 ? "..." : ""),
        `$${product.price.toFixed(2)}`,
        item.quantity,
        `$${itemSubtotal.toFixed(2)}`,
      ])
    })

    // Calcular impuestos y total
    const tax = subtotal * 0.16
    const total = subtotal + tax

    // Añadir tabla al PDF
    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 90,
      theme: "striped",
      headStyles: { fillColor: [59, 130, 246] },
    })

    // Añadir resumen
    const finalY = doc.lastAutoTable.finalY + 10
    doc.text(`Subtotal: $${subtotal.toFixed(2)}`, 150, finalY, { align: "right" })
    doc.text(`IVA (16%): $${tax.toFixed(2)}`, 150, finalY + 5, { align: "right" })
    doc.text(`Total: $${total.toFixed(2)}`, 150, finalY + 10, { align: "right" })

    // Añadir pie de página
    doc.setFontSize(10)
    doc.text("Gracias por tu compra", 105, 280, { align: "center" })

    // Guardar PDF
    doc.save("factura_techshop.pdf")
  }

  // Event Listeners

  // Menú móvil
  if (mobileMenuButton) {
    mobileMenuButton.addEventListener("click", () => {
      mobileMenu.classList.toggle("hidden")
    })
  }

  // Botones de categoría
  categoryButtons.forEach((button) => {
    button.addEventListener("click", function () {
      // Quitar clase active de todos los botones
      categoryButtons.forEach((btn) => {
        btn.classList.remove("bg-blue-600", "text-white")
        btn.classList.add("bg-gray-200", "text-gray-700")
      })

      // Añadir clase active al botón seleccionado
      this.classList.remove("bg-gray-200", "text-gray-700")
      this.classList.add("bg-blue-600", "text-white")

      // Filtrar productos por categoría
      const category = this.getAttribute("data-category")
      filterProductsByCategory(category)
    })
  })

  // Búsqueda de productos
  searchButton.addEventListener("click", () => {
    searchProducts(searchInput.value)
  })

  searchInput.addEventListener("keyup", function (event) {
    if (event.key === "Enter") {
      searchProducts(this.value)
    }
  })

  // Modal de cantidad
  if (closeQuantityModal) {
    closeQuantityModal.addEventListener("click", () => {
      closeModal(quantityModal)
    })
  }

  if (cancelQuantityButton) {
    cancelQuantityButton.addEventListener("click", () => {
      closeModal(quantityModal)
    })
  }

  if (quantityModalOverlay) {
    quantityModalOverlay.addEventListener("click", () => {
      closeModal(quantityModal)
    })
  }

  // Control de cantidad en el modal
  if (decreaseQuantity) {
    decreaseQuantity.addEventListener("click", () => {
      const quantity = Number.parseInt(quantityInput.value)
      if (quantity > 1) {
        quantityInput.value = quantity - 1
      }
    })
  }

  if (increaseQuantity) {
    increaseQuantity.addEventListener("click", () => {
      const quantity = Number.parseInt(quantityInput.value)
      if (quantity < 10) {
        quantityInput.value = quantity + 1
      }
    })
  }

  // Añadir al carrito desde el modal de cantidad
  if (addToCartButton) {
    addToCartButton.addEventListener("click", () => {
      const quantity = Number.parseInt(quantityInput.value)
      if (currentProduct && quantity > 0) {
        addToCart(currentProduct, quantity)
        closeModal(quantityModal)
      }
    })
  }

  // Modal de detalles del producto
  if (closeProductDetail) {
    closeProductDetail.addEventListener("click", () => {
      closeModal(productDetailModal)
    })
  }

  if (productDetailOverlay) {
    productDetailOverlay.addEventListener("click", () => {
      closeModal(productDetailModal)
    })
  }

  // Control de cantidad en el modal de detalles
  if (detailDecreaseQuantity) {
    detailDecreaseQuantity.addEventListener("click", () => {
      const quantity = Number.parseInt(detailQuantityInput.value)
      if (quantity > 1) {
        detailQuantityInput.value = quantity - 1
      }
    })
  }

  if (detailIncreaseQuantity) {
    detailIncreaseQuantity.addEventListener("click", () => {
      const quantity = Number.parseInt(detailQuantityInput.value)
      if (quantity < 10) {
        detailQuantityInput.value = quantity + 1
      }
    })
  }

  // Añadir al carrito desde el modal de detalles
  if (detailAddToCartButton) {
    detailAddToCartButton.addEventListener("click", () => {
      const quantity = Number.parseInt(detailQuantityInput.value)
      if (currentProduct && quantity > 0) {
        addToCart(currentProduct, quantity)
        closeModal(productDetailModal)
      }
    })
  }

  // Modal del carrito
  if (cartButton) {
    cartButton.addEventListener("click", () => {
      openModal(cartModal)
    })
  }

  if (closeCartModal) {
    closeCartModal.addEventListener("click", () => {
      closeModal(cartModal)
    })
  }

  if (continueShoppingButton) {
    continueShoppingButton.addEventListener("click", () => {
      closeModal(cartModal)
    })
  }

  if (cartModalOverlay) {
    cartModalOverlay.addEventListener("click", () => {
      closeModal(cartModal)
    })
  }

  // Vaciar carrito
  if (clearCartButton) {
    clearCartButton.addEventListener("click", () => {
      if (confirm("¿Estás seguro de que deseas vaciar el carrito?")) {
        clearCart()
      }
    })
  }

  // Proceder al pago
  if (checkoutButton) {
    checkoutButton.addEventListener("click", () => {
      closeModal(cartModal)
      openModal(paymentModal)
    })
  }

  // Modal de pago
  if (closePaymentModal) {
    closePaymentModal.addEventListener("click", () => {
      closeModal(paymentModal)
    })
  }

  if (cancelPaymentButton) {
    cancelPaymentButton.addEventListener("click", () => {
      closeModal(paymentModal)
    })
  }

  if (paymentModalOverlay) {
    paymentModalOverlay.addEventListener("click", () => {
      closeModal(paymentModal)
    })
  }

  // Procesar pago
  if (processPaymentButton) {
    processPaymentButton.addEventListener("click", () => {
      // Validar formulario
      const paymentForm = document.getElementById("paymentForm")
      if (!paymentForm.checkValidity()) {
        paymentForm.reportValidity()
        return
      }

      // Recoger información del cliente
      const customerInfo = {
        fullName: document.getElementById("fullName").value,
        email: document.getElementById("email").value,
        phone: document.getElementById("phone").value,
        address: document.getElementById("address").value,
        cardNumber: document.getElementById("cardNumber").value,
        expiryDate: document.getElementById("expiryDate").value,
        cvv: document.getElementById("cvv").value,
        cardName: document.getElementById("cardName").value,
      }

      // Generar factura
      generateInvoice(customerInfo)

      // Mostrar mensaje de éxito
      alert("¡Pago procesado con éxito! Se ha generado tu factura.")

      // Cerrar modal y vaciar carrito
      closeModal(paymentModal)
      clearCart()
    })
  }

  // Inicialización
  fetchProducts()
  loadCartFromLocalStorage()
})

