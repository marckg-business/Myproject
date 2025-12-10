document.addEventListener('DOMContentLoaded', () => {
    const btnCargar = document.getElementById('btnCargar');
    const cuerpoTabla = document.getElementById('cuerpoTabla');
    const alertPlaceholder = document.getElementById('alertPlaceholder');

    // Función para mostrar alertas temporales
    function mostrarAlerta(mensaje, tipo = 'info') {
        const wrapper = document.createElement('div');
        wrapper.innerHTML = `
            <div class="alert alert-${tipo} alert-dismissible fade show my-3" role="alert">
                ${mensaje}
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
        `;
        alertPlaceholder.innerHTML = ''; 
        alertPlaceholder.appendChild(wrapper);
    }

    // Función para obtener el puerto correcto de la API
    function getApiBaseUrl() {
        
        return 'http://localhost:5276';
    }

    async function cargarProductos() {
        const spinner = btnCargar.querySelector('.spinner-border');
        const textoBtn = btnCargar.childNodes[1];

        // Activar estado de carga
        btnCargar.disabled = true;
        spinner.classList.remove('d-none');
        textoBtn.textContent = ' Cargando...';

        try {
            const url = `${getApiBaseUrl()}/api/Productos`;
            console.log('🔍 Consultando:', url);

            const response = await fetch(url, {
                method: 'GET',
                headers: { 'Accept': 'application/json' }
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Error ${response.status}: ${errorText || response.statusText}`);
            }

            const productos = await response.json();

            // Limpiar tabla
            cuerpoTabla.innerHTML = '';

            if (!Array.isArray(productos) || productos.length === 0) {
                cuerpoTabla.innerHTML = `
                    <tr>
                        <td colspan="5" class="text-center text-warning py-4">
                            <i class="bi bi-inbox"></i> No hay productos disponibles.
                        </td>
                    </tr>`;
                mostrarAlerta('⚠️ La API no devolvió productos.', 'warning');
                return;
            }

            // Renderizar filas
            productos.forEach(p => {
                const stock = p.stock || 0;
                const estado = stock > 0 
                    ? `<span class="badge bg-success">Disponible</span>`
                    : `<span class="badge bg-secondary">Agotado</span>`;

                let stockClass = 'bg-secondary text-white';
                if (stock > 10) stockClass = 'bg-success';
                else if (stock > 0) stockClass = 'bg-warning text-dark';

                const fila = `
                    <tr>
                        <td><span class="badge bg-light text-dark">#${p.id}</span></td>
                        <td><strong>${p.nombre || '—'}</strong></td>
                        <td class="text-end">${(p.precio || 0).toFixed(2)}</td>
                        <td class="text-center">
                            <span class="badge ${stockClass} stock-badge px-2 py-1">${stock}</span>
                        </td>
                        <td>${estado}</td>
                    </tr>
                `;
                cuerpoTabla.innerHTML += fila;
            });

            mostrarAlerta(`✅ Cargados ${productos.length} productos desde la API.`, 'success');
            function mostrarAlerta(mensaje, tipo = 'info') {
                const wrapper = document.createElement('div');
                wrapper.innerHTML = `
                    <div class="alert alert-${tipo} alert-dismissible fade show" role="alert">
                        ${mensaje}
                        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                    </div>`;
                
                const alertContainer = document.getElementById('alertPlaceholder');
                alertContainer.innerHTML = ''; // limpiar anteriores
                alertContainer.appendChild(wrapper);
            }
        } catch (error) {
            console.error('❌ Error al cargar productos:', error);
            cuerpoTabla.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center text-danger py-4">
                        <i class="bi bi-exclamation-triangle"></i> Error: ${error.message}
                    </td>
                </tr>`;
            mostrarAlerta(`❌ No se pudieron cargar los productos. ¿Está la API ejecutándose?`, 'danger');
        } finally {
            // Restaurar botón
            btnCargar.disabled = false;
            spinner.classList.add('d-none');
            textoBtn.textContent = ' Cargar Productos';
        }
    }


    if (btnCargar) {
        btnCargar.addEventListener('click', cargarProductos);
    }

   
});