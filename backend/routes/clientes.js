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

// Obtener todos los clientes
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT c.*, u.nombre_completo as usuario_nombre 
      FROM clientes c 
      LEFT JOIN usuarios u ON c.usuario_id = u.id 
      ORDER BY c.created_at DESC
    `);
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener clientes:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// Obtener cliente por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT * FROM clientes WHERE id = ?', [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error('Error al obtener cliente:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// Buscar cliente por RUC
router.get('/buscar/:ruc', async (req, res) => {
  try {
    const { ruc } = req.params;
    const [rows] = await pool.query(
      'SELECT * FROM clientes WHERE ruc = ?',
      [ruc]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error('Error al buscar cliente:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// Crear nuevo cliente
router.post('/', async (req, res) => {
  try {
    const {
      ruc,
      razon_social,
      representante_legal,
      email1,
      email2,
      email3,
      celular1,
      celular2,
      celular3,
      categoria,
      solicitud,
      otros_solicitud,
      usuario_id
    } = req.body;

    // Generar código correlativo
    const [countResult] = await pool.query('SELECT COUNT(*) as count FROM clientes');
    const correlativo = String(countResult[0].count + 1).padStart(3, '0');
    const codigo_cliente = `SE-${correlativo}`;

    // Parsear categoría y solicitud a JSON
    const categoriaJSON = JSON.stringify(categoria || []);
    const solicitudJSON = JSON.stringify(solicitud || []);

    const [result] = await pool.query(
      `INSERT INTO clientes (codigo_cliente, ruc, razon_social, usuario_id, representante_legal, 
        email1, email2, email3, celular1, celular2, celular3, categoria, solicitud, otros_solicitud)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [codigo_cliente, ruc, razon_social, usuario_id, representante_legal,
       email1, email2, email3, celular1, celular2, celular3, 
       categoriaJSON, solicitudJSON, otros_solicitud]
    );

    const [nuevoCliente] = await pool.query('SELECT * FROM clientes WHERE id = ?', [result.insertId]);
    res.status(201).json(nuevoCliente[0]);
  } catch (error) {
    console.error('Error al crear cliente:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// Actualizar cliente
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      ruc,
      razon_social,
      representante_legal,
      email1,
      email2,
      email3,
      celular1,
      celular2,
      celular3,
      categoria,
      solicitud,
      otros_solicitud
    } = req.body;

    const categoriaJSON = JSON.stringify(categoria || []);
    const solicitudJSON = JSON.stringify(solicitud || []);

    await pool.query(
      `UPDATE clientes SET 
        ruc = ?, razon_social = ?, representante_legal = ?,
        email1 = ?, email2 = ?, email3 = ?,
        celular1 = ?, celular2 = ?, celular3 = ?,
        categoria = ?, solicitud = ?, otros_solicitud = ?
       WHERE id = ?`,
      [ruc, razon_social, representante_legal,
       email1, email2, email3,
       celular1, celular2, celular3,
       categoriaJSON, solicitudJSON, otros_solicitud, id]
    );

    const [updatedCliente] = await pool.query('SELECT * FROM clientes WHERE id = ?', [id]);
    res.json(updatedCliente[0]);
  } catch (error) {
    console.error('Error al actualizar cliente:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// Eliminar cliente
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM clientes WHERE id = ?', [id]);
    res.json({ message: 'Cliente eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar cliente:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

module.exports = router;
