const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const { pool } = require('../database');

const router = express.Router();
const JWT_SECRET = 'sgr_secret_key_2024';

// ── Auth middleware: decodifica el token para obtener usuario_id y nombre ──
const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Acceso no autorizado' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { id, username, nombre_completo, rol }
    next();
  } catch {
    return res.status(401).json({ error: 'Token inválido' });
  }
};

// ── Multer ──
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/documentos';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1e9) + path.extname(file.originalname));
  }
});
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') cb(null, true);
    else cb(new Error('Solo se permiten archivos PDF'));
  }
});

router.use(authenticateToken);

// ── Helper: correlativo ──
const generarNumeroDocumento = async (connection, tipo_documento) => {
  const [[corr]] = await connection.query(
    'SELECT * FROM correlativos_documentos WHERE tipo_documento = ? FOR UPDATE',
    [tipo_documento]
  );
  if (!corr) throw new Error(`Tipo de documento inválido: ${tipo_documento}`);
  const nuevoNumero = corr.ultimo_numero + 1;
  await connection.query(
    'UPDATE correlativos_documentos SET ultimo_numero = ? WHERE tipo_documento = ?',
    [nuevoNumero, tipo_documento]
  );
  return `${corr.prefijo}-${String(nuevoNumero).padStart(5, '0')}`;
};

// ── Helper: query de productos de una orden ──
const queryOrdenProductos = `
  SELECT op.*,
    CASE
      WHEN op.tipo_producto = 'farmaceutico'      THEN pf.nombre_producto
      WHEN op.tipo_producto = 'dispositivo_medico' THEN dm.nombre_producto
      WHEN op.tipo_producto = 'biologico'          THEN pb.nombre_producto
    END AS producto_nombre,
    CASE
      WHEN op.tipo_producto = 'farmaceutico'      THEN pf.codigo_registro
      WHEN op.tipo_producto = 'dispositivo_medico' THEN dm.codigo_registro
      WHEN op.tipo_producto = 'biologico'          THEN pb.codigo_registro
    END AS producto_registro
  FROM orden_productos op
  LEFT JOIN productos_farmaceuticos pf  ON op.tipo_producto = 'farmaceutico'      AND op.producto_id = pf.id
  LEFT JOIN dispositivos_medicos    dm  ON op.tipo_producto = 'dispositivo_medico' AND op.producto_id = dm.id
  LEFT JOIN productos_biologicos    pb  ON op.tipo_producto = 'biologico'           AND op.producto_id = pb.id
  WHERE op.orden_id = ?
  ORDER BY op.id
`;

// ── SELECT base de documentos con usuario_nombre ──
const SELECT_BASE = `
  SELECT dc.*,
         c.razon_social  AS cliente,
         c.ruc           AS ruc,
         u.nombre_completo AS usuario_nombre,
         CASE
           WHEN dc.tipo_producto = 'farmaceutico'      THEN pf.nombre_producto
           WHEN dc.tipo_producto = 'dispositivo_medico' THEN dm.nombre_producto
           WHEN dc.tipo_producto = 'biologico'          THEN pb.nombre_producto
         END AS producto_nombre,
         CASE
           WHEN dc.tipo_producto = 'farmaceutico'      THEN pf.codigo_registro
           WHEN dc.tipo_producto = 'dispositivo_medico' THEN dm.codigo_registro
           WHEN dc.tipo_producto = 'biologico'          THEN pb.codigo_registro
         END AS registro_sanitario
  FROM documentos_contables dc
  LEFT JOIN clientes c ON dc.cliente_id = c.id
  LEFT JOIN usuarios  u ON dc.usuario_id = u.id
  LEFT JOIN productos_farmaceuticos pf  ON dc.tipo_producto = 'farmaceutico'      AND dc.producto_id = pf.id
  LEFT JOIN dispositivos_medicos    dm  ON dc.tipo_producto = 'dispositivo_medico' AND dc.producto_id = dm.id
  LEFT JOIN productos_biologicos    pb  ON dc.tipo_producto = 'biologico'           AND dc.producto_id = pb.id
`;

// ── GET reporte contabilidad ──
router.get('/reporte/contabilidad', async (req, res) => {
  try {
    const [rows] = await pool.query(SELECT_BASE + ' ORDER BY dc.created_at DESC');
    
    // Para cada documento, obtener los productos de la orden si existe
    for (let doc of rows) {
      if (doc.orden_id) {
        const [prods] = await pool.query(queryOrdenProductos, [doc.orden_id]);
        doc.productos_orden = prods;
      } else {
        doc.productos_orden = [];
      }
    }
    
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// ── GET todos ──
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(SELECT_BASE + ' ORDER BY dc.created_at DESC');
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// ── GET por ID (incluye productos de la orden si aplica) ──
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(SELECT_BASE + ' WHERE dc.id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Documento no encontrado' });

    const doc = rows[0];

    // Si el documento tiene orden asociada, traer todos sus productos
    if (doc.orden_id) {
      const [prods] = await pool.query(queryOrdenProductos, [doc.orden_id]);
      doc.orden_productos = prods;
    } else {
      doc.orden_productos = [];
    }

    res.json(doc);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// ── POST subir PDF ──
router.post('/upload', upload.single('pdf'), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No se ha subido ningún archivo' });
    res.json({ filename: req.file.filename, path: `/uploads/documentos/${req.file.filename}` });
  } catch (error) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// ── POST crear documento ──
router.post('/', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const usuario_id = req.user?.id || null;

    const {
      tipo_documento = 'factura',
      orden_id,
      monto_orden,
      tipo_producto,
      cliente_id,
      producto_id,
      // Farmacéutico
      categoria1, categoria2,
      cambio_mayor, cambio_mayor_costo, cambio_mayor_moneda,
      cambio_menor, cambio_menor_costo, cambio_menor_moneda,
      inscripcion, inscripcion_costo, inscripcion_moneda,
      renovacion, renovacion_costo, renovacion_moneda,
      traduccion, traduccion_costo, traduccion_moneda,
      // Dispositivo
      clase1, clase1_costo, clase1_moneda,
      clase2, clase2_costo, clase2_moneda,
      clase3, clase3_costo, clase3_moneda,
      clase4, clase4_costo, clase4_moneda,
      // Biológico
      vaccines_inmunologicos, vaccines_inmunologicos_costo, vaccines_inmunologicos_moneda,
      otros_biologicos, otros_biologicos_costo, otros_biologicos_moneda,
      bioequivalente, bioequivalente_costo, bioequivalente_moneda,
      biotecnologico, biotecnologico_costo, biotecnologico_moneda,
      // Trámite
      derecho_tramite_cpb, derecho_tramite_monto,
      pdf_adjunto
    } = req.body;

    const numero_documento = await generarNumeroDocumento(connection, tipo_documento);

    const [result] = await connection.query(
      `INSERT INTO documentos_contables
        (tipo_documento, numero_documento, orden_id, monto_orden, usuario_id,
         tipo_producto, cliente_id, producto_id,
         categoria1, categoria2,
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
       VALUES
        (?,?,?,?,?, ?,?,?, ?,?,
         ?,?,?, ?,?,?, ?,?,?, ?,?,?, ?,?,?,
         ?,?,?, ?,?,?, ?,?,?, ?,?,?,
         ?,?,?, ?,?,?, ?,?,?, ?,?,?,
         ?,?,?)`,
      [
        tipo_documento, numero_documento, orden_id || null, monto_orden || 0, usuario_id,
        tipo_producto, cliente_id, producto_id,
        categoria1 || false, categoria2 || false,
        cambio_mayor || false, cambio_mayor_costo || null, cambio_mayor_moneda || 'soles',
        cambio_menor || false, cambio_menor_costo || null, cambio_menor_moneda || 'soles',
        inscripcion  || false, inscripcion_costo  || null, inscripcion_moneda  || 'soles',
        renovacion   || false, renovacion_costo   || null, renovacion_moneda   || 'soles',
        traduccion   || false, traduccion_costo   || null, traduccion_moneda   || 'soles',
        clase1 || false, clase1_costo || null, clase1_moneda || 'soles',
        clase2 || false, clase2_costo || null, clase2_moneda || 'soles',
        clase3 || false, clase3_costo || null, clase3_moneda || 'soles',
        clase4 || false, clase4_costo || null, clase4_moneda || 'soles',
        vaccines_inmunologicos || false, vaccines_inmunologicos_costo || null, vaccines_inmunologicos_moneda || 'soles',
        otros_biologicos       || false, otros_biologicos_costo       || null, otros_biologicos_moneda       || 'soles',
        bioequivalente         || false, bioequivalente_costo         || null, bioequivalente_moneda         || 'soles',
        biotecnologico         || false, biotecnologico_costo         || null, biotecnologico_moneda         || 'soles',
        derecho_tramite_cpb || null, derecho_tramite_monto || null, pdf_adjunto || null
      ]
    );

    await connection.commit();

    const [rows] = await pool.query(SELECT_BASE + ' WHERE dc.id = ?', [result.insertId]);
    const doc = rows[0];
    if (doc.orden_id) {
      const [prods] = await pool.query(queryOrdenProductos, [doc.orden_id]);
      doc.orden_productos = prods;
    } else {
      doc.orden_productos = [];
    }
    res.status(201).json(doc);
  } catch (error) {
    await connection.rollback();
    console.error('Error al crear documento:', error);
    res.status(500).json({ error: 'Error del servidor: ' + error.message });
  } finally {
    connection.release();
  }
});

// ── PUT actualizar ──
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const fields = { ...req.body };
    delete fields.tipo_documento;
    delete fields.numero_documento;

    const updates = Object.keys(fields).map(k => `${k} = ?`).join(', ');
    const values  = [...Object.values(fields), id];
    await pool.query(`UPDATE documentos_contables SET ${updates} WHERE id = ?`, values);

    const [rows] = await pool.query(SELECT_BASE + ' WHERE dc.id = ?', [id]);
    const doc = rows[0];
    if (doc.orden_id) {
      const [prods] = await pool.query(queryOrdenProductos, [doc.orden_id]);
      doc.orden_productos = prods;
    } else {
      doc.orden_productos = [];
    }
    res.json(doc);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// ── DELETE ──
router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM documentos_contables WHERE id = ?', [req.params.id]);
    res.json({ message: 'Documento eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

module.exports = router;
