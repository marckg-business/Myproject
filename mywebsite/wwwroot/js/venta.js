document.addEventListener('DOMContentLoaded', () => {
    // Elementos del DOM
    const clienteSelect = document.getElementById('clienteSelect');
    const productoSelect = document.getElementById('productoSelect');
    const cantidadInput = document.getElementById('cantidadInput');
    const btnAgregar = document.getElementById('btnAgregar');
    const btnVaciar = document.getElementById('btnVaciar');
    const btnRegistrar = document.getElementById('btnRegistrar');
    const carritoBody = document.getElementById('carritoBody');
    const itemCountEl = document.getElementById('itemCount');
    const subtotalEl = document.getElementById('subtotal');
    const totalEl = document.getElementById('total');

    // Estado
    let clientes = [];
    let productos = [];
    let carrito = []; // [{ productoId, nombre, precio, cantidad }, ...]

    // API base
    const API_BASE = 'http://localhost:5276';

    
    async function cargarClientes() {
    try {
        
        const res = await fetch(`${API_BASE}/api/Clientes`);
        
        if (!res.ok) {
            throw new Error(`Error ${res.status}: ${res.statusText}`);
        }

        const data = await res.json();

        
        clientes = data.map(c => ({
            id: c.Id ?? c.id ?? 0,
            nombre: c.Nombre ?? c.nombre ?? 'Sin nombre',
            email: c.Email ?? c.email ?? ''
        }));

        // Limpiar y llenar el dropdown
        clienteSelect.innerHTML = '<option value="">Selecciona un cliente...</option>';
        clientes.forEach(c => {
            const opt = document.createElement('option');
            opt.value = c.id;
            opt.textContent = `${c.nombre} — ${c.email}`;
            clienteSelect.appendChild(opt);
        });

        
        clienteSelect.disabled = false;

    } catch (error) {
        console.error('❌ Error al cargar clientes:', error);
        alert(`No se pudieron cargar los clientes:\n${error.message}`);
        // Opcional: deshabilitar todo
        clienteSelect.disabled = true;
        productoSelect.disabled = true;
        cantidadInput.disabled = true;
        btnAgregar.disabled = true;
    }
}
    async function cargarProductos() {
        try {
            const res = await fetch(`${API_BASE}/api/Productos`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();

            productos = data.map(p => ({
                id: p.id ?? p.Id,
                nombre: p.nombre ?? p.Nombre,
                precio: parseFloat(p.precio ?? p.Precio) || 0,
                stock: parseInt(p.stock ?? p.Stock) || 0
            })).filter(p => p.stock > 0); // Solo disponibles

            productoSelect.innerHTML = '<option value="">Selecciona un producto...</option>';
            productos.forEach(p => {
                const opt = document.createElement('option');
                opt.value = p.id;
                opt.textContent = `${p.nombre} ($${p.precio.toFixed(2)}) [${p.stock} disp.]`;
                if (p.stock < 5) {
                    opt.classList.add('text-warning');
                }
                productoSelect.appendChild(opt);
            });

            // Habilitar controles
            productoSelect.disabled = false;
            cantidadInput.disabled = false;
            btnAgregar.disabled = false;
        } catch (error) {
            console.error('Error al cargar productos:', error);
            alert('❌ No se pudieron cargar los productos.');
        }
    }

    function agregarAlCarrito() {
        const productoId = parseInt(productoSelect.value);
        const cantidad = parseInt(cantidadInput.value);

        if (!productoId || cantidad <= 0) return;

        const producto = productos.find(p => p.id === productoId);
        if (!producto) return;

        if (cantidad > producto.stock) {
            alert(`⚠️ Solo hay ${producto.stock} unidades disponibles de "${producto.nombre}".`);
            return;
        }

        const itemExistente = carrito.find(item => item.productoId === productoId);
        if (itemExistente) {
            const nuevaCantidad = itemExistente.cantidad + cantidad;
            if (nuevaCantidad > producto.stock) {
                alert(`⚠️ Superarías el stock disponible (${producto.stock}).`);
                return;
            }
            itemExistente.cantidad = nuevaCantidad;
        } else {
            carrito.push({
                productoId: producto.id,
                nombre: producto.nombre,
                precio: producto.precio,
                cantidad: cantidad
            });
        }

        actualizarCarrito();
        // Resetear formulario
        productoSelect.value = '';
        cantidadInput.value = 1;
    }

    // Actualizar vista del carrito
    function actualizarCarrito() {
        // Contar items
        const totalItems = carrito.reduce((sum, item) => sum + item.cantidad, 0);
        itemCountEl.textContent = totalItems;

    if (carrito.length === 0) {
        carritoBody.innerHTML = `<tr><td colspan="5" class="text-center text-muted py-3">Aún no hay productos agregados.</td></tr>`;
        btnVaciar.disabled = true;
        btnRegistrar.disabled = true;
    } else {
        carritoBody.innerHTML = carrito.map((item, index) => `
            <tr class="cart-item">
                <td><strong>${item.nombre}</strong></td>
                <td class="text-end">${item.cantidad}</td>
                <td class="text-end">$${item.precio.toFixed(2)}</td>
                <td class="text-end">$${(item.precio * item.cantidad).toFixed(2)}</td>
                <td class="text-end">
                    <button class="btn btn-sm btn-outline-danger" data-index="${index}">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');

        btnVaciar.disabled = false;
        btnRegistrar.disabled = false;
    }

        // Calcular totales
       const total = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
        subtotalEl.textContent = `$${total.toFixed(2)}`;
        totalEl.textContent = `$${total.toFixed(2)}`;
    }

    //Enviar venta a la API
    async function registrarVenta() {
        if (carrito.length === 0) return;

        const clienteId = parseInt(clienteSelect.value);
        if (!clienteId) {
            alert('⚠️ Por favor selecciona un cliente.');
            return;
        }

        // Preparar DTO
        const ventaDto = {
            clienteId: clienteId,
            detalles: carrito.map(item => ({
                productId: item.productoId,
                cantidad: item.cantidad
            }))
        };

        try {
            const res = await fetch(`${API_BASE}/api/Ventas`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(ventaDto)
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || `Error ${res.status}`);
            }

            // Éxito
            alert(`✅ Venta registrada con ID: ${data.VentaId}`);
            // Limpiar
            carrito = [];
            actualizarCarrito();
            clienteSelect.value = '';
            productoSelect.disabled = true;
            cantidadInput.disabled = true;
            btnAgregar.disabled = true;

        } catch (error) {
            console.error('Error al registrar venta:', error);
            alert(`❌ Error al registrar la venta: ${error.message}`);
        }
    }

    // Eventos
    clienteSelect.addEventListener('change', () => {
        if (clienteSelect.value) {
            cargarProductos();
        } else {
            productoSelect.disabled = true;
            cantidadInput.disabled = true;
            btnAgregar.disabled = true;
        }
    });

    btnAgregar.addEventListener('click', agregarAlCarrito);

    // Eliminar item del carrito (delegación de eventos)
    carritoBody.addEventListener('click', (e) => {
        const btn = e.target.closest('button[data-index]');
        if (btn) {
            const index = parseInt(btn.dataset.index);
            carrito.splice(index, 1);
            actualizarCarrito();
        }
    });

    btnVaciar.addEventListener('click', () => {
        if (confirm('¿Vaciar carrito?')) {
            carrito = [];
            actualizarCarrito();
        }
    });

    btnRegistrar.addEventListener('click', registrarVenta);

    // Iniciar
    cargarClientes();
});