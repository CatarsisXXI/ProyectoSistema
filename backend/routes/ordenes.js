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

// Obtener todas las órdenes de servicio
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT os.*, 
             c.razon_social as cliente_nombre, c.ruc as cliente_ruc,
             CASE 
               WHEN os.tipo_producto = 'farmaceutico' THEN pf.nombre_producto
               WHEN os.tipo_producto = 'dispositivo_medico' THEN dm.nombre_producto
               WHEN os.tipo_producto = 'biologico' THEN pb.nombre_producto
             END as producto_nombre,
             CASE 
               WHEN os.tipo_producto = 'farmaceutico' THEN pf.codigo_registro
               WHEN os.tipo_producto = 'dispositivo_medico' THEN dm.codigo_registro
               WHEN os.tipo_producto = 'biologico' THEN pb.codigo_registro
             END as producto_registro
      FROM ordenes_servicio os
      LEFT JOIN clientes c ON os.cliente_id = c.id
      LEFT JOIN productos_farmaceuticos pf ON os.tipo_producto = 'farmaceutico' AND os.producto_id = pf.id
      LEFT JOIN dispositivos_medicos dm ON os.tipo_producto = 'dispositivo_medico' AND os.producto_id = dm.id
      LEFT JOIN productos_biologicos pb ON os.tipo_producto = 'biologico' AND os.producto_id = pb.id
      ORDER BY os.created_at DESC
    `);
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener órdenes:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// Obtener orden por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT * FROM ordenes_servicio WHERE id = ?', [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Orden no encontrada' });
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error('Error al obtener orden:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// Crear nueva orden de servicio
router.post('/', async (req, res) => {
  try {
    const {
      tipo_producto,
      cliente_id,
      producto_id,
      categoria1,
      categoria2,
      cambio_mayor,
      cambio_mayor_autorizado,
      cambio_menor,
      cambio_menor_autorizado,
      inscripcion,
      inscripcion_autorizado,
      renovacion,
      renovacion_autorizado,
      traduccion,
      traduccion_autorizado,
      clase1,
      clase1_autorizado,
      clase2,
      clase2_autorizado,
      clase3,
      clase3_autorizado,
      clase4,
      clase4_autorizado,
      vaccines_immunologicos,
      vaccines_immunologicos_autorizado,
      otros_biologicos_chk,
      otros_biologicos_autorizado,
      bioequivalente_chk,
      bioequivalente_autorizado,
      biotecnologico_chk,
      biotecnologico_autorizado,
      cpb_numero,
      monto,
      fecha_recepcion,
      fecha_ingreso_vuce,
      fecha_fin_proceso,
      observaciones
    } = req.body;

    const [result] = await pool.query(
      `INSERT INTO ordenes_servicio 
        (tipo_producto, cliente_id, producto_id, categoria1, categoria2,
         cambio_mayor, cambio_mayor_autorizado, cambio_menor, cambio_menor_autorizado,
         inscripcion, inscripcion_autorizado, renovacion, renovacion_autorizado,
         traduccion, traduccion_autorizado, clase1, clase1_autorizado,
         clase2, clase2_autorizado, clase3, clase3_autorizado,
         clase4, clase4_autorizado, vaccines_immunologicos, vaccines_immunologicos_autorizado,
         otros_biologicos_chk, otros_biologicos_autorizado, bioequivalente_chk, bioequivalente_autorizado,
         biotecnologico_chk, biotecnologico_autorizado, cpb_numero, monto,
         fecha_recepcion, fecha_ingreso_vuce, fecha_fin_proceso, observaciones)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [tipo_producto, cliente_id, producto_id, categoria1 || false, categoria2 || false,
       cambio_mayor || false, cambio_mayor_autorizado, cambio_menor || false, cambio_menor_autorizado,
       inscripcion || false, inscripcion_autorizado, renovacion || false, renovacion_autorizado,
       traduccion || false, traduccion_autorizado, clase1 || false, clase1_autorizado,
       clase2 || false, clase2_autorizado, clase3 || false, clase3_autorizado,
       clase4 || false, clase4_autorizado, vaccines_immunologicos || false, vaccines_immunologicos_autorizado,
       otros_biologicos_chk || false, otros_biologicos_autorizado, bioequivalente_chk || false, bioequivalente_autorizado,
       biotecnologico_chk || false, biotecnologico_autorizado, cpb_numero, monto,
       fecha_recepcion, fecha_ingreso_vuce, fecha_fin_proceso, observaciones]
    );

    const [nuevaOrden] = await pool.query('SELECT * FROM ordenes_servicio WHERE id = ?', [result.insertId]);
    res.status(201).json(nuevaOrden[0]);
  } catch (error) {
    console.error('Error al crear orden:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// Actualizar orden
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const fields = req.body;
    
    const updates = Object.keys(fields).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(fields), id];
    
    await pool.query(`UPDATE ordenes_servicio SET ${updates} WHERE id = ?`, values);
    
    const [updatedOrden] = await pool.query('SELECT * FROM ordenes_servicio WHERE id = ?', [id]);
    res.json(updatedOrden[0]);
  } catch (error) {
    console.error('Error al actualizar orden:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// Eliminar orden
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM ordenes_servicio WHERE id = ?', [id]);
    res.json({ message: 'Orden eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar orden:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

module.exports = router;
