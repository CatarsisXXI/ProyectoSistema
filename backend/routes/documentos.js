const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
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

// Configuración de multer para subir PDFs
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/documentos';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos PDF'));
    }
  }
});

router.use(authenticateToken);

// Obtener todos los documentos contables
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT dc.*, 
             c.razon_social as cliente_nombre, c.ruc as cliente_ruc,
             CASE 
               WHEN dc.tipo_producto = 'farmaceutico' THEN pf.nombre_producto
               WHEN dc.tipo_producto = 'dispositivo_medico' THEN dm.nombre_producto
               WHEN dc.tipo_producto = 'biologico' THEN pb.nombre_producto
             END as producto_nombre,
             CASE 
               WHEN dc.tipo_producto = 'farmaceutico' THEN pf.codigo_registro
               WHEN dc.tipo_producto = 'dispositivo_medico' THEN dm.codigo_registro
               WHEN dc.tipo_producto = 'biologico' THEN pb.codigo_registro
             END as producto_registro
      FROM documentos_contables dc
      LEFT JOIN clientes c ON dc.cliente_id = c.id
      LEFT JOIN productos_farmaceuticos pf ON dc.tipo_producto = 'farmaceutico' AND dc.producto_id = pf.id
      LEFT JOIN dispositivos_medicos dm ON dc.tipo_producto = 'dispositivo_medico' AND dc.producto_id = dm.id
      LEFT JOIN productos_biologicos pb ON dc.tipo_producto = 'biologico' AND dc.producto_id = pb.id
      ORDER BY dc.created_at DESC
    `);
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener documentos:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// Obtener documento por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(`
      SELECT dc.*, 
             c.razon_social as cliente_nombre, c.ruc as cliente_ruc,
             CASE 
               WHEN dc.tipo_producto = 'farmaceutico' THEN pf.nombre_producto
               WHEN dc.tipo_producto = 'dispositivo_medico' THEN dm.nombre_producto
               WHEN dc.tipo_producto = 'biologico' THEN pb.nombre_producto
             END as producto_nombre,
             CASE 
               WHEN dc.tipo_producto = 'farmaceutico' THEN pf.codigo_registro
               WHEN dc.tipo_producto = 'dispositivo_medico' THEN dm.codigo_registro
               WHEN dc.tipo_producto = 'biologico' THEN pb.codigo_registro
             END as producto_registro
      FROM documentos_contables dc
      LEFT JOIN clientes c ON dc.cliente_id = c.id
      LEFT JOIN productos_farmaceuticos pf ON dc.tipo_producto = 'farmaceutico' AND dc.producto_id = pf.id
      LEFT JOIN dispositivos_medicos dm ON dc.tipo_producto = 'dispositivo_medico' AND dc.producto_id = dm.id
      LEFT JOIN productos_biologicos pb ON dc.tipo_producto = 'biologico' AND dc.producto_id = pb.id
      WHERE dc.id = ?
    `, [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Documento no encontrado' });
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error('Error al obtener documento:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// Subir PDF
router.post('/upload', upload.single('pdf'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se ha subido ningún archivo' });
    }
    res.json({ 
      filename: req.file.filename,
      path: `/uploads/documentos/${req.file.filename}`
    });
  } catch (error) {
    console.error('Error al subir archivo:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// Crear nuevo documento contable
router.post('/', async (req, res) => {
  try {
    const {
      tipo_producto,
      cliente_id,
      producto_id,
      // Farmacéutico
      categoria1,
      categoria2,
      cambio_mayor,
      cambio_mayor_costo,
      cambio_mayor_moneda,
      cambio_menor,
      cambio_menor_costo,
      cambio_menor_moneda,
      inscripcion,
      inscripcion_costo,
      inscripcion_moneda,
      renovacion,
      renovacion_costo,
      renovacion_moneda,
      traduccion,
      traduccion_costo,
      traduccion_moneda,
      // Dispositivos médicos
      clase1,
      clase1_costo,
      clase1_moneda,
      clase2,
      clase2_costo,
      clase2_moneda,
      clase3,
      clase3_costo,
      clase3_moneda,
      clase4,
      clase4_costo,
      clase4_moneda,
      // Biológicos
      vaccines_inmunologicos,
      vaccines_inmunologicos_costo,
      vaccines_inmunologicos_moneda,
      otros_biologicos,
      otros_biologicos_costo,
      otros_biologicos_moneda,
      bioequivalente,
      bioequivalente_costo,
      bioequivalente_moneda,
      biotecnologico,
      biotecnologico_costo,
      biotecnologico_moneda,
      // Derecho de trámite
      derecho_tramite_cpb,
      derecho_tramite_monto,
      pdf_adjunto
    } = req.body;

    const [result] = await pool.query(
      `INSERT INTO documentos_contables 
        (tipo_producto, cliente_id, producto_id, categoria1, categoria2,
         cambio_mayor, cambio_mayor_costo, cambio_mayor_moneda,
         cambio_menor, cambio_menor_costo, cambio_menor_moneda,
         inscripcion, inscripcion_costo, inscripcion_moneda,
         renovacion, renovacion_costo, renovacion_moneda,
         traduccion, traduccion_costo, traduccion_moneda,
         clase1, clase1_costo, clase1_moneda,
         clase2, clase2_costo, clase2_moneda,
         clase3, clase3_costo, clase3_moneda,
         clase4, clase4_costo, clase4_moneda,
         vaccines_inmunologicos, vaccines_inmunologicos_costo, vaccines_inmunologicos_moneda,
         otros_biologicos, otros_biologicos_costo, otros_biologicos_moneda,
         bioequivalente, bioequivalente_costo, bioequivalente_moneda,
         biotecnologico, biotecnologico_costo, biotecnologico_moneda,
         derecho_tramite_cpb, derecho_tramite_monto, pdf_adjunto)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [tipo_producto, cliente_id, producto_id, categoria1 || false, categoria2 || false,
       cambio_mayor || false, cambio_mayor_costo, cambio_mayor_moneda,
       cambio_menor || false, cambio_menor_costo, cambio_menor_moneda,
       inscripcion || false, inscripcion_costo, inscripcion_moneda,
       renovacion || false, renovacion_costo, renovacion_moneda,
       traduccion || false, traduccion_costo, traduccion_moneda,
       clase1 || false, clase1_costo, clase1_moneda,
       clase2 || false, clase2_costo, clase2_moneda,
       clase3 || false, clase3_costo, clase3_moneda,
       clase4 || false, clase4_costo, clase4_moneda,
       vaccines_inmunologicos || false, vaccines_inmunologicos_costo, vaccines_inmunologicos_moneda,
       otros_biologicos || false, otros_biologicos_costo, otros_biologicos_moneda,
       bioequivalente || false, bioequivalente_costo, bioequivalente_moneda,
       biotecnologico || false, biotecnologico_costo, biotecnologico_moneda,
       derecho_tramite_cpb, derecho_tramite_monto, pdf_adjunto]
    );

    const [nuevoDocumento] = await pool.query(
      'SELECT * FROM documentos_contables WHERE id = ?', 
      [result.insertId]
    );
    res.status(201).json(nuevoDocumento[0]);
  } catch (error) {
    console.error('Error al crear documento:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// Actualizar documento
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const fields = req.body;
    
    const updates = Object.keys(fields).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(fields), id];
    
    await pool.query(`UPDATE documentos_contables SET ${updates} WHERE id = ?`, values);
    
    const [updatedDocumento] = await pool.query('SELECT * FROM documentos_contables WHERE id = ?', [id]);
    res.json(updatedDocumento[0]);
  } catch (error) {
    console.error('Error al actualizar documento:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// Eliminar documento
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM documentos_contables WHERE id = ?', [id]);
    res.json({ message: 'Documento eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar documento:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// Obtener reporte para contabilidad
router.get('/reporte/contabilidad', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        dc.*,
        c.razon_social as cliente,
        c.ruc,
        CASE 
          WHEN dc.tipo_producto = 'farmaceutico' THEN pf.nombre_producto
          WHEN dc.tipo_producto = 'dispositivo_medico' THEN dm.nombre_producto
          WHEN dc.tipo_producto = 'biologico' THEN pb.nombre_producto
        END as producto_nombre,
        CASE 
          WHEN dc.tipo_producto = 'farmaceutico' THEN pf.codigo_registro
          WHEN dc.tipo_producto = 'dispositivo_medico' THEN dm.codigo_registro
          WHEN dc.tipo_producto = 'biologico' THEN pb.codigo_registro
        END as registro_sanitario
      FROM documentos_contables dc
      LEFT JOIN clientes c ON dc.cliente_id = c.id
      LEFT JOIN productos_farmaceuticos pf ON dc.tipo_producto = 'farmaceutico' AND dc.producto_id = pf.id
      LEFT JOIN dispositivos_medicos dm ON dc.tipo_producto = 'dispositivo_medico' AND dc.producto_id = dm.id
      LEFT JOIN productos_biologicos pb ON dc.tipo_producto = 'biologico' AND dc.producto_id = pb.id
      ORDER BY dc.created_at DESC
    `);
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener reporte:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

module.exports = router;
