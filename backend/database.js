const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'sgr_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

const initDatabase = async () => {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: ''
  });

  await connection.query('CREATE DATABASE IF NOT EXISTS sgr_db');
  await connection.query('USE sgr_db');

  // Tabla usuarios
  await connection.query(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id INT PRIMARY KEY AUTO_INCREMENT,
      username VARCHAR(50) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      nombre_completo VARCHAR(100) NOT NULL,
      rol ENUM('admin', 'usuario') DEFAULT 'usuario',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Tabla clientes
  await connection.query(`
    CREATE TABLE IF NOT EXISTS clientes (
      id INT PRIMARY KEY AUTO_INCREMENT,
      codigo_cliente VARCHAR(20) UNIQUE NOT NULL,
      ruc VARCHAR(11) UNIQUE NOT NULL,
      razon_social VARCHAR(200) NOT NULL,
      usuario_id INT NOT NULL,
      representante_legal VARCHAR(100),
      email1 VARCHAR(100),
      email2 VARCHAR(100),
      email3 VARCHAR(100),
      celular1 VARCHAR(20),
      celular2 VARCHAR(20),
      celular3 VARCHAR(20),
      categoria JSON,
      solicitud JSON,
      otros_solicitud TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
    )
  `);

  // Tabla productos_farmaceuticos
  await connection.query(`
    CREATE TABLE IF NOT EXISTS productos_farmaceuticos (
      id INT PRIMARY KEY AUTO_INCREMENT,
      codigo_registro VARCHAR(20) UNIQUE NOT NULL,
      nombre_producto VARCHAR(200) NOT NULL,
      categoria1 BOOLEAN DEFAULT FALSE,
      categoria2 BOOLEAN DEFAULT FALSE,
      fabricante VARCHAR(200),
      pais_origen VARCHAR(100),
      pavs BOOLEAN,
      usuario_id INT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
    )
  `);

  // Tabla dispositivos_medicos
  await connection.query(`
    CREATE TABLE IF NOT EXISTS dispositivos_medicos (
      id INT PRIMARY KEY AUTO_INCREMENT,
      codigo_registro VARCHAR(20) UNIQUE NOT NULL,
      nombre_producto VARCHAR(200) NOT NULL,
      clase1 BOOLEAN DEFAULT FALSE,
      clase2 BOOLEAN DEFAULT FALSE,
      clase3 BOOLEAN DEFAULT FALSE,
      clase4 BOOLEAN DEFAULT FALSE,
      usuario_id INT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
    )
  `);

  // Tabla productos_biologicos
  await connection.query(`
    CREATE TABLE IF NOT EXISTS productos_biologicos (
      id INT PRIMARY KEY AUTO_INCREMENT,
      codigo_registro VARCHAR(20) UNIQUE NOT NULL,
      nombre_producto VARCHAR(200) NOT NULL,
      vacunas_inmunologicos BOOLEAN DEFAULT FALSE,
      otros_biologicos BOOLEAN DEFAULT FALSE,
      bioequivalente BOOLEAN DEFAULT FALSE,
      biotecnologico BOOLEAN DEFAULT FALSE,
      fabricante VARCHAR(200),
      pais_origen VARCHAR(100),
      pavs BOOLEAN,
      usuario_id INT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
    )
  `);

  // Tabla ordenes (cabecera)
  await connection.query(`
    CREATE TABLE IF NOT EXISTS ordenes (
      id INT PRIMARY KEY AUTO_INCREMENT,
      cliente_id INT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE
    )
  `);

  // Tabla orden_productos (detalle)
  await connection.query(`
    CREATE TABLE IF NOT EXISTS orden_productos (
      id INT PRIMARY KEY AUTO_INCREMENT,
      orden_id INT NOT NULL,
      producto_id INT NOT NULL,
      tipo_producto ENUM('farmaceutico', 'dispositivo_medico', 'biologico') NOT NULL,
      
      -- Campos comunes
      cpb_numero VARCHAR(50),
      monto DECIMAL(10,2),
      fecha_recepcion DATE,
      fecha_ingreso_vuce DATE,
      fecha_fin_proceso DATE,
      observaciones TEXT,
      
      -- Farmacéutico
      categoria1 BOOLEAN DEFAULT FALSE,
      categoria2 BOOLEAN DEFAULT FALSE,
      cambio_mayor BOOLEAN DEFAULT FALSE,
      cambio_mayor_autorizado VARCHAR(100),
      cambio_menor BOOLEAN DEFAULT FALSE,
      cambio_menor_autorizado VARCHAR(100),
      inscripcion BOOLEAN DEFAULT FALSE,
      inscripcion_autorizado VARCHAR(100),
      renovacion BOOLEAN DEFAULT FALSE,
      renovacion_autorizado VARCHAR(100),
      traduccion BOOLEAN DEFAULT FALSE,
      traduccion_autorizado VARCHAR(100),
      
      -- Dispositivo médico
      clase1 BOOLEAN DEFAULT FALSE,
      clase1_autorizado VARCHAR(100),
      clase2 BOOLEAN DEFAULT FALSE,
      clase2_autorizado VARCHAR(100),
      clase3 BOOLEAN DEFAULT FALSE,
      clase3_autorizado VARCHAR(100),
      clase4 BOOLEAN DEFAULT FALSE,
      clase4_autorizado VARCHAR(100),
      
      -- Biológico
      vaccines_immunologicos BOOLEAN DEFAULT FALSE,
      vaccines_immunologicos_autorizado VARCHAR(100),
      otros_biologicos_chk BOOLEAN DEFAULT FALSE,
      otros_biologicos_autorizado VARCHAR(100),
      bioequivalente_chk BOOLEAN DEFAULT FALSE,
      bioequivalente_autorizado VARCHAR(100),
      biotecnologico_chk BOOLEAN DEFAULT FALSE,
      biotecnologico_autorizado VARCHAR(100),
      
      FOREIGN KEY (orden_id) REFERENCES ordenes(id) ON DELETE CASCADE
    )
  `);

  // ============================================
  // TABLA DE CORRELATIVOS POR TIPO DE DOCUMENTO
  // ============================================
  await connection.query(`
    CREATE TABLE IF NOT EXISTS correlativos_documentos (
      id INT PRIMARY KEY AUTO_INCREMENT,
      tipo_documento ENUM('factura', 'factura_electronica', 'boleta', 'nota_credito') UNIQUE NOT NULL,
      prefijo VARCHAR(10) NOT NULL,
      ultimo_numero INT DEFAULT 0
    )
  `);

  // Insertar correlativos iniciales si no existen
  await connection.query(`
    INSERT IGNORE INTO correlativos_documentos (tipo_documento, prefijo, ultimo_numero) VALUES
      ('factura',            'F001',  0),
      ('factura_electronica','FE01',  0),
      ('boleta',             'B001',  0),
      ('nota_credito',       'NC01',  0)
  `);

  // Tabla documentos_contables
  await connection.query(`
    CREATE TABLE IF NOT EXISTS documentos_contables (
      id INT PRIMARY KEY AUTO_INCREMENT,
      
      -- Tipo y correlativo
      tipo_documento ENUM('factura','factura_electronica','boleta','nota_credito') DEFAULT 'factura',
      numero_documento VARCHAR(20),
      
      -- Referencia a la orden de origen (opcional)
      orden_id INT,
      monto_orden DECIMAL(10,2) DEFAULT 0,
      
      -- Usuario que creó el documento
      usuario_id INT,
      
      tipo_producto ENUM('farmaceutico', 'dispositivo_medico', 'biologico') NOT NULL,
      cliente_id INT NOT NULL,
      producto_id INT NOT NULL,
      categoria1 BOOLEAN DEFAULT FALSE,
      categoria2 BOOLEAN DEFAULT FALSE,
      cambio_mayor BOOLEAN DEFAULT FALSE,
      cambio_mayor_costo DECIMAL(10,2),
      cambio_mayor_moneda ENUM('soles', 'dolares'),
      cambio_menor BOOLEAN DEFAULT FALSE,
      cambio_menor_costo DECIMAL(10,2),
      cambio_menor_moneda ENUM('soles', 'dolares'),
      inscripcion BOOLEAN DEFAULT FALSE,
      inscripcion_costo DECIMAL(10,2),
      inscripcion_moneda ENUM('soles', 'dolares'),
      renovacion BOOLEAN DEFAULT FALSE,
      renovacion_costo DECIMAL(10,2),
      renovacion_moneda ENUM('soles', 'dolares'),
      traduccion BOOLEAN DEFAULT FALSE,
      traduccion_costo DECIMAL(10,2),
      traduccion_moneda ENUM('soles', 'dolares'),
      clase1 BOOLEAN DEFAULT FALSE,
      clase1_costo DECIMAL(10,2),
      clase1_moneda ENUM('soles', 'dolares'),
      clase2 BOOLEAN DEFAULT FALSE,
      clase2_costo DECIMAL(10,2),
      clase2_moneda ENUM('soles', 'dolares'),
      clase3 BOOLEAN DEFAULT FALSE,
      clase3_costo DECIMAL(10,2),
      clase3_moneda ENUM('soles', 'dolares'),
      clase4 BOOLEAN DEFAULT FALSE,
      clase4_costo DECIMAL(10,2),
      clase4_moneda ENUM('soles', 'dolares'),
      vaccines_inmunologicos BOOLEAN DEFAULT FALSE,
      vaccines_inmunologicos_costo DECIMAL(10,2),
      vaccines_inmunologicos_moneda ENUM('soles', 'dolares'),
      otros_biologicos BOOLEAN DEFAULT FALSE,
      otros_biologicos_costo DECIMAL(10,2),
      otros_biologicos_moneda ENUM('soles', 'dolares'),
      bioequivalente BOOLEAN DEFAULT FALSE,
      bioequivalente_costo DECIMAL(10,2),
      bioequivalente_moneda ENUM('soles', 'dolares'),
      biotecnologico BOOLEAN DEFAULT FALSE,
      biotecnologico_costo DECIMAL(10,2),
      biotecnologico_moneda ENUM('soles', 'dolares'),
      derecho_tramite_cpb VARCHAR(50),
      derecho_tramite_monto DECIMAL(10,2),
      pdf_adjunto VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (cliente_id) REFERENCES clientes(id)
    )
  `);

  // Migración: agregar columnas nuevas si la tabla ya existe
  const alterColumns = [
    `ALTER TABLE documentos_contables ADD COLUMN IF NOT EXISTS tipo_documento ENUM('factura','factura_electronica','boleta','nota_credito') DEFAULT 'factura'`,
    `ALTER TABLE documentos_contables ADD COLUMN IF NOT EXISTS numero_documento VARCHAR(20) AFTER tipo_documento`,
    `ALTER TABLE documentos_contables ADD COLUMN IF NOT EXISTS orden_id INT AFTER numero_documento`,
    `ALTER TABLE documentos_contables ADD COLUMN IF NOT EXISTS monto_orden DECIMAL(10,2) DEFAULT 0 AFTER orden_id`,
    `ALTER TABLE documentos_contables ADD COLUMN IF NOT EXISTS usuario_id INT AFTER monto_orden`,
  ];
  for (const sql of alterColumns) {
    try { await connection.query(sql); } catch (e) { /* columna ya existe */ }
  }

  // Insertar usuario admin por defecto
  const bcrypt = require('bcryptjs');
  const hashedPassword = await bcrypt.hash('admin123', 10);
  await connection.query(`
    INSERT IGNORE INTO usuarios (username, password, nombre_completo, rol) 
    VALUES ('admin', ?, 'Administrador', 'admin')
  `, [hashedPassword]);

  await connection.end();
  console.log('✅ Base de datos inicializada correctamente');
};

module.exports = { pool, initDatabase };
