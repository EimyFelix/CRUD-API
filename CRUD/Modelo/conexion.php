<?php
class DB {
    private static $instance = null;
    private $conexion;
    
    private function __construct() {
        try {
            $this->conexion = new PDO(
                "mysql:host=localhost;dbname=productosdb;charset=utf8",
                "root", // usuario
                ""      // contraseña vacía
            );
            $this->conexion->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        } catch (PDOException $e) {
            die("Error de conexión: " . $e->getMessage());
        }
    }
    
    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    public function getConexion() {
        return $this->conexion;
    }
    
    public function insertSeguro($tabla, $datos) {
        $columnas = implode(", ", array_keys($datos));
        $valores = ":" . implode(", :", array_keys($datos));
        
        $sql = "INSERT INTO $tabla ($columnas) VALUES ($valores)";
        $stmt = $this->conexion->prepare($sql);
        
        foreach ($datos as $key => $value) {
            $stmt->bindValue(":$key", $value);
        }
        
        return $stmt->execute();
    }
    
    public function updateSeguro($tabla, $datos, $condicion) {
        $set = "";
        foreach ($datos as $key => $value) {
            $set .= "$key = :$key, ";
        }
        $set = rtrim($set, ", ");
        
        $sql = "UPDATE $tabla SET $set WHERE $condicion";
        $stmt = $this->conexion->prepare($sql);
        
        foreach ($datos as $key => $value) {
            $stmt->bindValue(":$key", $value);
        }
        
        return $stmt->execute();
    }
    
    public function query($sql, $params = []) {
        $stmt = $this->conexion->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    public function Arreglos($sql, $params = []) {
        return $this->query($sql, $params);
    }
}
?>