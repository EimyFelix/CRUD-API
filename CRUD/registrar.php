<?php
// Activar errores temporalmente para debug
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Buffer para capturar cualquier output no deseado
ob_start();

header("Content-Type: application/json");

$response = [
    'success' => false,
    'message' => 'Error desconocido',
    'accion' => 'Error'
];

try {
    // Verificar que los archivos existen
    if (!file_exists("Modelo/conexion.php")) {
        throw new Exception("No se encuentra Modelo/conexion.php");
    }
    if (!file_exists("Modelo/Productos.php")) {
        throw new Exception("No se encuentra Modelo/Productos.php");
    }

    // Incluir archivos
    include_once("Modelo/conexion.php");
    include_once("Modelo/Productos.php");

    // Verificar que se recibió una acción
    if (!isset($_POST['Accion'])) {
        throw new Exception("No se especificó ninguna acción");
    }

    $Accion = $_POST['Accion'];
    $myProducts = new Producto();

    // Asignar datos del POST
    if ($_POST) {
        $myProducts->ModelsToNotes($_POST);
    }

    switch ($Accion) {
        case "Guardar":
            $myProducts->setRequiredFields(['Codigo', 'Producto', 'Precio', 'Cantidad']);
            $myProducts->validate();
            
            if (empty($myProducts->Errors)) {
                $resultado = $myProducts->guardarProducto();
                
                if ($resultado) {
                    $response = [ 
                        "success" => true,
                        "message" => "Producto Creado",
                        "accion" => "Guardar"
                    ];
                } else {
                    $response = [ 
                        "success" => false,
                        "message" => "Error al guardar el producto en la base de datos",
                        "accion" => "Guardar"
                    ];
                }
            } else {
                $response = [ 
                    "success" => false,
                    "message" => "Errores de validación",
                    "accion" => "Guardar",
                    "errors" => $myProducts->Errors
                ];
            }
            break;
            
        case "Modificar":
            $id = $_POST['id'] ?? 0;
            
            if (empty($id)) {
                throw new Exception("ID de producto no especificado para modificar");
            }
            
            $myProducts->setRequiredFields(['Codigo', 'Producto', 'Precio', 'Cantidad']);
            $myProducts->validate();
            
            if (empty($myProducts->Errors)) {
                $resultado = $myProducts->actualizarProducto($id);
                
                if ($resultado) {
                    $response = [ 
                        "success" => true,
                        "message" => "Producto Actualizado",
                        "accion" => "Modificar"
                    ];
                } else {
                    $response = [ 
                        "success" => false,
                        "message" => "Error al actualizar el producto en la base de datos",
                        "accion" => "Modificar"
                    ];
                }
            } else {
                $response = [ 
                    "success" => false,
                    "message" => "Errores de validación",
                    "accion" => "Modificar",
                    "errors" => $myProducts->Errors
                ];
            }
            break;
            
        case "Buscar":
            $termino = $_POST['termino'] ?? '';
            $productos = $myProducts->buscarProductos($termino);
            
            $response = [
                "success" => true,
                "productos" => $productos,
                "accion" => "Buscar",
                "total" => count($productos)
            ];
            break;
            
        case "Eliminar":
    $id = $_POST['id'] ?? 0;
    
    if (empty($id)) {
        throw new Exception("ID de producto no especificado para eliminar");
    }
    
    try {
        // Método alternativo usando la clase DB directamente
        $db = DB::getInstance();
        $sql = "DELETE FROM productos WHERE id = :id";
        $stmt = $db->getConexion()->prepare($sql);
        $resultado = $stmt->execute([':id' => $id]);
        
        if ($resultado && $stmt->rowCount() > 0) {
            $response = [ 
                "success" => true,
                "message" => "Producto Eliminado",
                "accion" => "Eliminar"
            ];
        } else {
            $response = [ 
                "success" => false,
                "message" => "Error al eliminar el producto o producto no encontrado",
                "accion" => "Eliminar"
            ];
        }
    } catch (Exception $e) {
        $response = [ 
            "success" => false,
            "message" => "Error al eliminar: " . $e->getMessage(),
            "accion" => "Eliminar"
        ];
    }
    break;
            
        default:
            throw new Exception("Acción no válida: " . $Accion);
    }

} catch (Exception $e) {
    $response = [
        "success" => false,
        "message" => "Error: " . $e->getMessage(),
        "accion" => "Error"
    ];
}

// Limpiar cualquier output no deseado y enviar JSON
ob_clean();
echo json_encode($response);
exit;
?>