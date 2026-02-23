const express = require('express');
const { pool } = require('../database');

const router = express.Router();

// Middleware para verificar autenticación
const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Acceso no autorizado' });
  }
  next();
};

router.use(authenticateToken);

// ==================== PRODUCTOS FARMACÉUTICOS ====================

// Obtener todos los productos farmacéuticos
router.get('/farmaceuticos', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT pf.*, u.nombre_completo as usuario_nombre 
      FROM productos_farmaceuticos pf 
      LEFT JOIN usuarios u ON pf.usuario_id = u.id 
      ORDER BY pf.created_at DESC
    `);
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener productos farmacéuticos:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// Obtener siguiente código correlativo para farmacéuticos
router.get('/farmaceuticos/siguiente-codigo', async (req, res) => {
  try {
    const [result] = await pool.query(
      "SELECT codigo_registro FROM productos_farmaceuticos ORDER BY id DESC LIMIT 1"
    );
    
    let siguienteNumero = 301;
    if (result.length > 0) {
      const ultimoCodigo = result[0].codigo_registro;
      const numero = parseInt(ultimoCodigo.replace('EE', ''));
      siguienteNumero = numero + 1;
    }
    
    const codigo = `EE00${siguienteNumero}`;
    res.json({ codigo });
  } catch (error) {
    console.error('Error al obtener código:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// Crear producto farmacéutico
router.post('/farmaceuticos', async (req, res) => {
  try {
    const {
      codigo_registro,
      nombre_producto,
      categoria1,
      categoria2,
      fabricante,
      pais_origen,
      pavs,
      usuario_id
    } = req.body;

    const [result] = await pool.query(
      `INSERT INTO productos_farmaceuticos 
        (codigo_registro, nombre_producto, categoria1, categoria2, fabricante, pais_origen, pavs, usuario_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [codigo_registro, nombre_producto, categoria1 || false, categoria2 || false, 
       fabricante, pais_origen, pavs, usuario_id]
    );

    const [nuevoProducto] = await pool.query(
      'SELECT * FROM productos_farmaceuticos WHERE id = ?', 
      [result.insertId]
    );
    res.status(201).json(nuevoProducto[0]);
  } catch (error) {
    console.error('Error al crear producto farmacéutico:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// ==================== DISPOSITIVOS MÉDICOS ====================

// Obtener todos los dispositivos médicos
router.get('/dispositivos', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT dm.*, u.nombre_completo as usuario_nombre 
      FROM dispositivos_medicos dm 
      LEFT JOIN usuarios u ON dm.usuario_id = u.id 
      ORDER BY dm.created_at DESC
    `);
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener dispositivos médicos:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// Obtener siguiente código correlativo para dispositivos médicos
router.get('/dispositivos/siguiente-codigo', async (req, res) => {
  try {
    const [result] = await pool.query(
      "SELECT codigo_registro FROM dispositivos_medicos ORDER BY id DESC LIMIT 1"
    );
    
    let siguienteNumero = 301;
    if (result.length > 0) {
      const ultimoCodigo = result[0].codigo_registro;
      const numero = parseInt(ultimoCodigo.replace('DM', ''));
      siguienteNumero = numero + 1;
    }
    
    const codigo = `DM00${siguienteNumero}`;
    res.json({ codigo });
  } catch (error) {
    console.error('Error al obtener código:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// Crear dispositivo médico
router.post('/dispositivos', async (req, res) => {
  try {
    const {
      codigo_registro,
      nombre_producto,
      clase1,
      clase2,
      clase3,
      clase4,
      usuario_id
    } = req.body;

    const [result] = await pool.query(
      `INSERT INTO dispositivos_medicos 
        (codigo_registro, nombre_producto, clase1, clase2, clase3, clase4, usuario_id)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [codigo_registro, nombre_producto, clase1 || false, clase2 || false, 
       clase3 || false, clase4 || false, usuario_id]
    );

    const [nuevoProducto] = await pool.query(
      'SELECT * FROM dispositivos_medicos WHERE id = ?', 
      [result.insertId]
    );
    res.status(201).json(nuevoProducto[0]);
  } catch (error) {
    console.error('Error al crear dispositivo médico:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// ==================== PRODUCTOS BIOLÓGICOS ====================

// Obtener todos los productos biológicos
router.get('/biologicos', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT pb.*, u.nombre_completo as usuario_nombre 
      FROM productos_biologicos pb 
      LEFT JOIN usuarios u ON pb.usuario_id = u.id 
      ORDER BY pb.created_at DESC
    `);
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener productos biológicos:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// Obtener siguiente código correlativo para productos biológicos
router.get('/biologicos/siguiente-codigo', async (req, res) => {
  try {
    const [result] = await pool.query(
      "SELECT codigo_registro FROM productos_biologicos ORDER BY id DESC LIMIT 1"
    );
    
    let siguienteNumero = 301;
    if (result.length > 0) {
      const ultimoCodigo = result[0].codigo_registro;
      const numero = parseInt(ultimoCodigo.replace('PB', ''));
      siguienteNumero = numero + 1;
    }
    
    const codigo = `PB00${siguienteNumero}`;
    res.json({ codigo });
  } catch (error) {
    console.error('Error al obtener código:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// Crear producto biológico
router.post('/biologicos', async (req, res) => {
  try {
    const {
      codigo_registro,
      nombre_producto,
      vacunas_inmunologicos,
      otros_biologicos,
      bioequivalente,
      biotecnologico,
      fabricante,
      pais_origen,
      pavs,
      usuario_id
    } = req.body;

    const [result] = await pool.query(
      `INSERT INTO productos_biologicos 
        (codigo_registro, nombre_producto, vacunas_inmunologicos, otros_biologicos, 
         bioequivalente, biotecnologico, fabricante, pais_origen, pavs, usuario_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [codigo_registro, nombre_producto, 
       vacunas_inmunologicos || false, otros_biologicos || false,
       bioequivalente || false, biotecnologico || false,
       fabricante, pais_origen, pavs, usuario_id]
    );

    const [nuevoProducto] = await pool.query(
      'SELECT * FROM productos_biologicos WHERE id = ?', 
      [result.insertId]
    );
    res.status(201).json(nuevoProducto[0]);
  } catch (error) {
    console.error('Error al crear producto biológico:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// ==================== BÚSQUEDAS ====================

// Buscar productos por tipo y nombre
router.get('/buscar/:tipo/:nombre', async (req, res) => {
  try {
    const { tipo, nombre } = req.params;
    let rows = [];
    
    if (tipo === 'farmaceutico') {
      [rows] = await pool.query(
        'SELECT * FROM productos_farmaceuticos WHERE nombre_producto LIKE ?',
        [`%${nombre}%`]
      );
    } else if (tipo === 'dispositivo_medico') {
      [rows] = await pool.query(
        'SELECT * FROM dispositivos_medicos WHERE nombre_producto LIKE ?',
        [`%${nombre}%`]
      );
    } else if (tipo === 'biologico') {
      [rows] = await pool.query(
        'SELECT * FROM productos_biologicos WHERE nombre_producto LIKE ?',
        [`%${nombre}%`]
      );
    }
    
    res.json(rows);
  } catch (error) {
    console.error('Error al buscar productos:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// Obtener producto por ID y tipo
router.get('/:tipo/:id', async (req, res) => {
  try {
    const { tipo, id } = req.params;
    let rows = [];
    
    if (tipo === 'farmaceutico') {
      [rows] = await pool.query('SELECT * FROM productos_farmaceuticos WHERE id = ?', [id]);
    } else if (tipo === 'dispositivo_medico') {
      [rows] = await pool.query('SELECT * FROM dispositivos_medicos WHERE id = ?', [id]);
    } else if (tipo === 'biologico') {
      [rows] = await pool.query('SELECT * FROM productos_biologicos WHERE id = ?', [id]);
    }
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error('Error al obtener producto:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

module.exports = router;
