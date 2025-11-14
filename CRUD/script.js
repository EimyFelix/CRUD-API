// Variable global para el modo de edición
let editando = false;

// Cargar productos al iniciar la página
document.addEventListener('DOMContentLoaded', function() {
    console.log('📦 Página cargada, iniciando CRUD...');
    listarProductos();
});

// Manejar envío del formulario
document.getElementById('formProducto').addEventListener('submit', function(e) {
    e.preventDefault();
    
    if (editando) {
        modificarProducto();
    } else {
        guardarProducto();
    }
});

// Función para guardar producto
async function guardarProducto() {
    console.log('💾 Intentando guardar producto...');
    
    const formData = new FormData(document.getElementById('formProducto'));
    formData.set('Accion', 'Guardar');
    
    try {
        const response = await fetch('registrar.php', {
            method: 'POST',
            body: formData
        });
        
        // Verificar si es JSON
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            const text = await response.text();
            console.error('❌ El servidor devolvió HTML:', text.substring(0, 500));
            throw new Error('Error del servidor: respuesta no es JSON. Revisa errores PHP.');
        }
        
        const resultado = await response.json();
        console.log('📨 Respuesta del servidor:', resultado);
        
        if (resultado.success) {
            await Swal.fire({
                icon: 'success',
                title: '¡Éxito!',
                text: resultado.message,
                timer: 2000,
                showConfirmButton: false
            });
            limpiarFormulario();
            listarProductos();
        } else {
            let mensajeError = resultado.message;
            if (resultado.errors && resultado.errors.length > 0) {
                mensajeError += '<br>' + resultado.errors.join('<br>');
            }
            Swal.fire({
                icon: 'error',
                title: 'Error',
                html: mensajeError
            });
        }
    } catch (error) {
        console.error('❌ Error:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error de conexión',
            text: error.message || 'No se pudo conectar con el servidor'
        });
    }
}

// Función para modificar producto
async function modificarProducto() {
    console.log('✏️ Intentando modificar producto...');
    
    const formData = new FormData(document.getElementById('formProducto'));
    formData.set('Accion', 'Modificar');
    
    // Verificar que tenemos un ID
    const productoId = document.getElementById('productoId').value;
    if (!productoId) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se puede modificar: ID de producto no especificado'
        });
        return;
    }
    
    try {
        const response = await fetch('registrar.php', {
            method: 'POST',
            body: formData
        });
        
        // Verificar si es JSON
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            const text = await response.text();
            console.error('❌ El servidor devolvió HTML:', text.substring(0, 500));
            throw new Error('Error del servidor: respuesta no es JSON. Revisa errores PHP.');
        }
        
        const resultado = await response.json();
        console.log('📨 Respuesta modificación:', resultado);
        
        if (resultado.success) {
            await Swal.fire({
                icon: 'success',
                title: '¡Éxito!',
                text: resultado.message,
                timer: 2000,
                showConfirmButton: false
            });
            limpiarFormulario();
            listarProductos();
        } else {
            let mensajeError = resultado.message;
            if (resultado.errors && resultado.errors.length > 0) {
                mensajeError += '<br>' + resultado.errors.join('<br>');
            }
            Swal.fire({
                icon: 'error',
                title: 'Error',
                html: mensajeError
            });
        }
    } catch (error) {
        console.error('❌ Error en modificarProducto:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error de conexión',
            text: error.message || 'No se pudo conectar con el servidor'
        });
    }
}

// FUNCIÓN ELIMINAR PRODUCTO
async function eliminarProducto(id) {
    console.log('🗑️ Intentando eliminar producto ID:', id);
    
    // Validar que el ID sea un número válido
    if (!id || isNaN(id) || id <= 0) {
        console.error('❌ ID de producto inválido:', id);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'ID de producto inválido'
        });
        return;
    }
    
    try {
        // Confirmación antes de eliminar
        const confirmacion = await Swal.fire({
            icon: 'warning',
            title: '¿Estás seguro?',
            text: '¿Quieres eliminar este producto? Esta acción no se puede deshacer.',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
            reverseButtons: true
        });
        
        if (!confirmacion.isConfirmed) {
            console.log('❌ Eliminación cancelada por el usuario');
            return;
        }
        
        // Preparar datos para enviar
        const formData = new FormData();
        formData.set('Accion', 'Eliminar');
        formData.set('id', id.toString());
        
        console.log('📤 Enviando solicitud de eliminación...');
        
        const response = await fetch('registrar.php', {
            method: 'POST',
            body: formData
        });
        
        // Verificar si es JSON
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            const text = await response.text();
            console.error('❌ El servidor devolvió HTML en lugar de JSON:', text.substring(0, 500));
            throw new Error('Error del servidor. Revisa la consola para más detalles.');
        }
        
        const resultado = await response.json();
        console.log('📨 Respuesta del servidor (eliminar):', resultado);
        
        if (resultado.success) {
            await Swal.fire({
                icon: 'success',
                title: '¡Eliminado!',
                text: resultado.message,
                timer: 2000,
                showConfirmButton: false
            });
            // Recargar la lista de productos
            await listarProductos();
        } else {
            await Swal.fire({
                icon: 'error',
                title: 'Error',
                text: resultado.message || 'No se pudo eliminar el producto'
            });
        }
        
    } catch (error) {
        console.error('❌ Error en eliminarProducto:', error);
        await Swal.fire({
            icon: 'error',
            title: 'Error de conexión',
            text: error.message || 'No se pudo conectar con el servidor'
        });
    }
}

// Función para buscar productos
async function buscarProductos() {
    const termino = document.getElementById('buscarTermino').value;
    console.log('🔍 Buscando:', termino);
    
    const formData = new FormData();
    formData.set('Accion', 'Buscar');
    formData.set('termino', termino);
    
    try {
        const response = await fetch('registrar.php', {
            method: 'POST',
            body: formData
        });
        
        // Verificar si es JSON
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            const text = await response.text();
            console.error('❌ El servidor devolvió HTML:', text.substring(0, 500));
            throw new Error('Error del servidor: respuesta no es JSON. Revisa errores PHP.');
        }
        
        const resultado = await response.json();
        console.log('🔍 Resultado búsqueda:', resultado);
        
        if (resultado.success) {
            mostrarProductos(resultado.productos);
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: resultado.message || 'No se pudieron cargar los productos'
            });
        }
    } catch (error) {
        console.error('❌ Error en buscarProductos:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error de conexión',
            text: error.message || 'No se pudo conectar con el servidor'
        });
    }
}

// Función para listar todos los productos
async function listarProductos() {
    console.log('📋 Listando todos los productos...');
    await buscarProductos(); // Reutiliza la función de búsqueda sin término
}

// Función para mostrar productos en la tabla
function mostrarProductos(productos) {
    console.log('🎯 Mostrando productos en tabla:', productos);
    
    const tabla = document.getElementById('tablaProductos');
    
    if (!tabla) {
        console.error('❌ No se encontró el elemento tablaProductos');
        return;
    }
    
    tabla.innerHTML = '';
    
    if (!productos || productos.length === 0) {
        tabla.innerHTML = `
            <tr>
                <td colspan="5" class="text-center text-muted">
                    <i class="fas fa-box-open me-2"></i>No se encontraron productos
                </td>
            </tr>
        `;
        return;
    }
    
    productos.forEach(producto => {
        const fila = document.createElement('tr');
        fila.innerHTML = `
            <td>${producto.codigo || 'N/A'}</td>
            <td>${producto.producto || 'N/A'}</td>
            <td>$${parseFloat(producto.precio || 0).toFixed(2)}</td>
            <td>${producto.cantidad || 0}</td>
            <td>
                <button class="btn btn-warning btn-sm me-1" onclick="editarProducto(${producto.id})" title="Editar producto">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-danger btn-sm" onclick="eliminarProducto(${producto.id})" title="Eliminar producto">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tabla.appendChild(fila);
    });
    
    console.log('✅ Productos mostrados en la tabla con botones de eliminar');
}


// Función para cargar producto en el formulario para editar
async function editarProducto(id) {
    console.log('✏️ Editando producto ID:', id);
    
    const productos = await obtenerProductoPorId(id);
    if (productos.length > 0) {
        const producto = productos[0];
        
        console.log('📝 Cargando producto para edición:', producto);
        
        document.getElementById('productoId').value = producto.id;
        document.getElementById('codigo').value = producto.codigo;
        document.getElementById('producto').value = producto.producto;
        document.getElementById('precio').value = producto.precio;
        document.getElementById('cantidad').value = producto.cantidad;
        
        document.getElementById('btnSubmit').innerHTML = '<i class="fas fa-sync-alt me-1"></i>Actualizar Producto';
        document.getElementById('btnSubmit').classList.remove('btn-success');
        document.getElementById('btnSubmit').classList.add('btn-warning');
        
        editando = true;
        
        console.log('✅ Producto cargado para edición');
        
        // Scroll al formulario
        document.getElementById('formProducto').scrollIntoView({ behavior: 'smooth' });
    } else {
        console.error('❌ No se encontró el producto con ID:', id);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo cargar el producto para editar'
        });
    }
}

// Función auxiliar para obtener producto por ID
async function obtenerProductoPorId(id) {
    const formData = new FormData();
    formData.set('Accion', 'Buscar');
    formData.set('termino', '');
    
    try {
        const response = await fetch('registrar.php', {
            method: 'POST',
            body: formData
        });
        
        // Verificar si es JSON
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            const text = await response.text();
            console.error('❌ El servidor devolvió HTML:', text.substring(0, 500));
            throw new Error('Error del servidor: respuesta no es JSON');
        }
        
        const resultado = await response.json();
        return resultado.productos.filter(p => p.id == id);
    } catch (error) {
        console.error('❌ Error en obtenerProductoPorId:', error);
        return [];
    }
}

// Función para limpiar el formulario
function limpiarFormulario() {
    document.getElementById('formProducto').reset();
    document.getElementById('productoId').value = '';
    document.getElementById('btnSubmit').innerHTML = '<i class="fas fa-save me-1"></i>Registrar Producto';
    document.getElementById('btnSubmit').classList.remove('btn-warning');
    document.getElementById('btnSubmit').classList.add('btn-success');
    editando = false;
    console.log('🧹 Formulario limpiado');
}