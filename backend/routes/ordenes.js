const express = require('express');
const jwt = require('jsonwebtoken');
const { pool } = require('../database');

const router = express.Router();
const JWT_SECRET = 'sgr_secret_key_2024';

// Helper para castear booleanos de forma segura
const toBool = (val) => (val === true || val === 1 || val === '1') ? 1 : 0;

// Middleware de autenticación
const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Acceso no autorizado' });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ error: 'Token inválido' });
  }
};

router.use(authenticateToken);

// -------------------------------------------------------------------
// Obtener todas las órdenes con sus productos
// -------------------------------------------------------------------
router.get('/', async (req, res) => {
  try {
    const [ordenes] = await pool.query(`
      SELECT o.*, c.razon_social as cliente_nombre, c.ruc as cliente_ruc
      FROM ordenes o
      LEFT JOIN clientes c ON o.cliente_id = c.id
      ORDER BY o.created_at DESC
    `);

    for (let orden of ordenes) {
      const [productos] = await pool.query(`
        SELECT op.*,
          CASE 
            WHEN op.tipo_producto = 'farmaceutico' THEN pf.nombre_producto
            WHEN op.tipo_producto = 'dispositivo_medico' THEN dm.nombre_producto
            WHEN op.tipo_producto = 'biologico' THEN pb.nombre_producto
          END as producto_nombre,
          CASE 
            WHEN op.tipo_producto = 'farmaceutico' THEN pf.codigo_registro
            WHEN op.tipo_producto = 'dispositivo_medico' THEN dm.codigo_registro
            WHEN op.tipo_producto = 'biologico' THEN pb.codigo_registro
          END as producto_registro
        FROM orden_productos op
        LEFT JOIN productos_farmaceuticos pf ON op.tipo_producto = 'farmaceutico' AND op.producto_id = pf.id
        LEFT JOIN dispositivos_medicos dm ON op.tipo_producto = 'dispositivo_medico' AND op.producto_id = dm.id
        LEFT JOIN productos_biologicos pb ON op.tipo_producto = 'biologico' AND op.producto_id = pb.id
        WHERE op.orden_id = ?
      `, [orden.id]);

      orden.productos = productos;
    }

    res.json(ordenes);
  } catch (error) {
    console.error('Error al obtener órdenes:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// -------------------------------------------------------------------
// Obtener una orden por ID con sus productos
// -------------------------------------------------------------------
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [ordenes] = await pool.query(`
      SELECT o.*, c.razon_social as cliente_nombre, c.ruc as cliente_ruc
      FROM ordenes o
      LEFT JOIN clientes c ON o.cliente_id = c.id
      WHERE o.id = ?
    `, [id]);

    if (ordenes.length === 0) {
      return res.status(404).json({ error: 'Orden no encontrada' });
    }

    const orden = ordenes[0];

    const [productos] = await pool.query(`
      SELECT op.*,
        CASE 
          WHEN op.tipo_producto = 'farmaceutico' THEN pf.nombre_producto
          WHEN op.tipo_producto = 'dispositivo_medico' THEN dm.nombre_producto
          WHEN op.tipo_producto = 'biologico' THEN pb.nombre_producto
        END as producto_nombre,
        CASE 
          WHEN op.tipo_producto = 'farmaceutico' THEN pf.codigo_registro
          WHEN op.tipo_producto = 'dispositivo_medico' THEN dm.codigo_registro
          WHEN op.tipo_producto = 'biologico' THEN pb.codigo_registro
        END as producto_registro
      FROM orden_productos op
      LEFT JOIN productos_farmaceuticos pf ON op.tipo_producto = 'farmaceutico' AND op.producto_id = pf.id
      LEFT JOIN dispositivos_medicos dm ON op.tipo_producto = 'dispositivo_medico' AND op.producto_id = dm.id
      LEFT JOIN productos_biologicos pb ON op.tipo_producto = 'biologico' AND op.producto_id = pb.id
      WHERE op.orden_id = ?
    `, [id]);

    orden.productos = productos;
    res.json(orden);
  } catch (error) {
    console.error('Error al obtener orden:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// -------------------------------------------------------------------
// Crear nueva orden con múltiples productos
// -------------------------------------------------------------------
router.post('/', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { cliente_id, productos } = req.body;

    if (!cliente_id || !Array.isArray(productos) || productos.length === 0) {
      return res.status(400).json({ error: 'Debe proporcionar cliente y al menos un producto' });
    }

    const [ordenResult] = await connection.query(
      'INSERT INTO ordenes (cliente_id) VALUES (?)',
      [cliente_id]
    );
    const ordenId = ordenResult.insertId;

    for (const prod of productos) {
      const {
        producto_id,
        tipo_producto,
        cpb_numero,
        monto,
        fecha_recepcion,
        fecha_ingreso_vuce,
        fecha_fin_proceso,
        observaciones,
        categoria1, categoria2,
        cambio_mayor, cambio_mayor_autorizado,
        cambio_menor, cambio_menor_autorizado,
        inscripcion, inscripcion_autorizado,
        renovacion, renovacion_autorizado,
        traduccion, traduccion_autorizado,
        clase1, clase1_autorizado,
        clase2, clase2_autorizado,
        clase3, clase3_autorizado,
        clase4, clase4_autorizado,
        vaccines_immunologicos, vaccines_immunologicos_autorizado,
        otros_biologicos_chk, otros_biologicos_autorizado,
        bioequivalente_chk, bioequivalente_autorizado,
        biotecnologico_chk, biotecnologico_autorizado
      } = prod;

      await connection.query(
        `INSERT INTO orden_productos (
          orden_id, producto_id, tipo_producto,
          cpb_numero, monto, fecha_recepcion, fecha_ingreso_vuce, fecha_fin_proceso, observaciones,
          categoria1, categoria2,
          cambio_mayor, cambio_mayor_autorizado, cambio_menor, cambio_menor_autorizado,
          inscripcion, inscripcion_autorizado, renovacion, renovacion_autorizado,
          traduccion, traduccion_autorizado,
          clase1, clase1_autorizado, clase2, clase2_autorizado,
          clase3, clase3_autorizado, clase4, clase4_autorizado,
          vaccines_immunologicos, vaccines_immunologicos_autorizado,
          otros_biologicos_chk, otros_biologicos_autorizado,
          bioequivalente_chk, bioequivalente_autorizado,
          biotecnologico_chk, biotecnologico_autorizado
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          ordenId, producto_id, tipo_producto,
          cpb_numero || null, monto || null, fecha_recepcion || null, fecha_ingreso_vuce || null, fecha_fin_proceso || null, observaciones || null,
          toBool(categoria1), toBool(categoria2),
          toBool(cambio_mayor), cambio_mayor_autorizado || null,
          toBool(cambio_menor), cambio_menor_autorizado || null,
          toBool(inscripcion), inscripcion_autorizado || null,
          toBool(renovacion), renovacion_autorizado || null,
          toBool(traduccion), traduccion_autorizado || null,
          toBool(clase1), clase1_autorizado || null,
          toBool(clase2), clase2_autorizado || null,
          toBool(clase3), clase3_autorizado || null,
          toBool(clase4), clase4_autorizado || null,
          toBool(vaccines_immunologicos), vaccines_immunologicos_autorizado || null,
          toBool(otros_biologicos_chk), otros_biologicos_autorizado || null,
          toBool(bioequivalente_chk), bioequivalente_autorizado || null,
          toBool(biotecnologico_chk), biotecnologico_autorizado || null
        ]
      );
    }

    await connection.commit();

    const [nuevaOrden] = await connection.query(`
      SELECT o.*, c.razon_social as cliente_nombre, c.ruc as cliente_ruc
      FROM ordenes o
      LEFT JOIN clientes c ON o.cliente_id = c.id
      WHERE o.id = ?
    `, [ordenId]);

    const orden = nuevaOrden[0];
    const [productosInsertados] = await connection.query(
      'SELECT * FROM orden_productos WHERE orden_id = ?',
      [ordenId]
    );
    orden.productos = productosInsertados;

    res.status(201).json(orden);
  } catch (error) {
    await connection.rollback();
    console.error('Error al crear orden:', error);
    res.status(500).json({ error: 'Error del servidor' });
  } finally {
    connection.release();
  }
});

// -------------------------------------------------------------------
// Actualizar orden completa (cabecera y productos)
// -------------------------------------------------------------------
router.put('/:id', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { id } = req.params;
    const { cliente_id, productos } = req.body;

    const [ordenExistente] = await connection.query('SELECT id FROM ordenes WHERE id = ?', [id]);
    if (ordenExistente.length === 0) {
      return res.status(404).json({ error: 'Orden no encontrada' });
    }

    if (!cliente_id || !Array.isArray(productos) || productos.length === 0) {
      return res.status(400).json({ error: 'Debe proporcionar cliente y al menos un producto' });
    }

    await connection.query('UPDATE ordenes SET cliente_id = ? WHERE id = ?', [cliente_id, id]);
    await connection.query('DELETE FROM orden_productos WHERE orden_id = ?', [id]);

    for (const prod of productos) {
      const {
        producto_id,
        tipo_producto,
        cpb_numero,
        monto,
        fecha_recepcion,
        fecha_ingreso_vuce,
        fecha_fin_proceso,
        observaciones,
        categoria1, categoria2,
        cambio_mayor, cambio_mayor_autorizado,
        cambio_menor, cambio_menor_autorizado,
        inscripcion, inscripcion_autorizado,
        renovacion, renovacion_autorizado,
        traduccion, traduccion_autorizado,
        clase1, clase1_autorizado,
        clase2, clase2_autorizado,
        clase3, clase3_autorizado,
        clase4, clase4_autorizado,
        vaccines_immunologicos, vaccines_immunologicos_autorizado,
        otros_biologicos_chk, otros_biologicos_autorizado,
        bioequivalente_chk, bioequivalente_autorizado,
        biotecnologico_chk, biotecnologico_autorizado
      } = prod;

      await connection.query(
        `INSERT INTO orden_productos (
          orden_id, producto_id, tipo_producto,
          cpb_numero, monto, fecha_recepcion, fecha_ingreso_vuce, fecha_fin_proceso, observaciones,
          categoria1, categoria2,
          cambio_mayor, cambio_mayor_autorizado, cambio_menor, cambio_menor_autorizado,
          inscripcion, inscripcion_autorizado, renovacion, renovacion_autorizado,
          traduccion, traduccion_autorizado,
          clase1, clase1_autorizado, clase2, clase2_autorizado,
          clase3, clase3_autorizado, clase4, clase4_autorizado,
          vaccines_immunologicos, vaccines_immunologicos_autorizado,
          otros_biologicos_chk, otros_biologicos_autorizado,
          bioequivalente_chk, bioequivalente_autorizado,
          biotecnologico_chk, biotecnologico_autorizado
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id, producto_id, tipo_producto,
          cpb_numero || null, monto || null, fecha_recepcion || null, fecha_ingreso_vuce || null, fecha_fin_proceso || null, observaciones || null,
          toBool(categoria1), toBool(categoria2),
          toBool(cambio_mayor), cambio_mayor_autorizado || null,
          toBool(cambio_menor), cambio_menor_autorizado || null,
          toBool(inscripcion), inscripcion_autorizado || null,
          toBool(renovacion), renovacion_autorizado || null,
          toBool(traduccion), traduccion_autorizado || null,
          toBool(clase1), clase1_autorizado || null,
          toBool(clase2), clase2_autorizado || null,
          toBool(clase3), clase3_autorizado || null,
          toBool(clase4), clase4_autorizado || null,
          toBool(vaccines_immunologicos), vaccines_immunologicos_autorizado || null,
          toBool(otros_biologicos_chk), otros_biologicos_autorizado || null,
          toBool(bioequivalente_chk), bioequivalente_autorizado || null,
          toBool(biotecnologico_chk), biotecnologico_autorizado || null
        ]
      );
    }

    await connection.commit();

    const [ordenActualizada] = await connection.query(`
      SELECT o.*, c.razon_social as cliente_nombre, c.ruc as cliente_ruc
      FROM ordenes o
      LEFT JOIN clientes c ON o.cliente_id = c.id
      WHERE o.id = ?
    `, [id]);

    const orden = ordenActualizada[0];
    const [productosInsertados] = await connection.query(
      'SELECT * FROM orden_productos WHERE orden_id = ?',
      [id]
    );
    orden.productos = productosInsertados;

    res.json(orden);
  } catch (error) {
    await connection.rollback();
    console.error('Error al actualizar orden:', error);
    res.status(500).json({ error: 'Error del servidor' });
  } finally {
    connection.release();
  }
});

// -------------------------------------------------------------------
// Eliminar orden
// -------------------------------------------------------------------
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM ordenes WHERE id = ?', [id]);
    res.json({ message: 'Orden eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar orden:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

module.exports = router;
