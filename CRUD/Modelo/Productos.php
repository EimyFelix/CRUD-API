<?php
include_once "conexion.php";

class Producto {
    private $pdo;
    public $Codigo;
    public $Producto;
    public $Precio;
    public $Cantidad;
    public $Errors = [];
    
    public function __construct() {
        $this->pdo = DB::getInstance();
    }
    
    public function setRequiredFields($fields) {
        $this->requiredFields = $fields;
    }
    
    public function validate() {
        $this->Errors = [];
        
        if (empty($this->Codigo)) {
            $this->Errors[] = "El código es obligatorio";
        }
        
        if (empty($this->Producto)) {
            $this->Errors[] = "El nombre del producto es obligatorio";
        }
        
        if (!is_numeric($this->Precio) || $this->Precio <= 0) {
            $this->Errors[] = "El precio debe ser un número positivo";
        }
        
        if (!is_numeric($this->Cantidad) || $this->Cantidad < 0) {
            $this->Errors[] = "La cantidad debe ser un número no negativo";
        }
    }
    
    public function guardarProducto() {
        $data = [
            "codigo" => $this->Codigo,
            "producto" => $this->Producto,
            "precio" => $this->Precio,
            "cantidad" => $this->Cantidad
        ];
        
        return $this->pdo->insertSeguro("productos", $data);
    }
    
    public function actualizarProducto($id) {
        $data = [
            "codigo" => $this->Codigo,
            "producto" => $this->Producto,
            "precio" => $this->Precio,
            "cantidad" => $this->Cantidad
        ];
        
        return $this->pdo->updateSeguro("productos", $data, "id = $id");
    }
    
    public function buscarProductos($termino = "") {
        if (empty($termino)) {
            $sql = "SELECT * FROM productos ORDER BY id DESC";
        } else {
            $sql = "SELECT * FROM productos 
                    WHERE producto LIKE :termino OR codigo LIKE :termino 
                    ORDER BY id DESC";
            $params = [':termino' => "%$termino%"];
            return $this->pdo->Arreglos($sql, $params);
        }
        return $this->pdo->Arreglos($sql);
    }
    
    public function ModelsToNotes($postData) {
        $this->Codigo = isset($postData['codigo']) ? trim($postData['codigo']) : '';
        $this->Producto = isset($postData['producto']) ? trim($postData['producto']) : '';
        $this->Precio = isset($postData['precio']) ? floatval($postData['precio']) : 0;
        $this->Cantidad = isset($postData['cantidad']) ? intval($postData['cantidad']) : 0;
    }
}
?>