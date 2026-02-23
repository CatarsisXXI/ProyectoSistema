const mysql = require('mysql2/promise');

const runMigrations = async () => {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'sgr_db'
  });

  try {
    console.log('🔄 Ejecutando migraciones...');

    // Agregar columnas categoria1 y categoria2 a ordenes_servicio si no existen
    await connection.query(`
      ALTER TABLE ordenes_servicio 
      ADD COLUMN IF NOT EXISTS categoria1 BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS categoria2 BOOLEAN DEFAULT FALSE
    `);
    console.log('✅ Columnas categoria1 y categoria2 agregadas a ordenes_servicio');

    // Verificar que documentos_contables tenga las columnas correctas
    await connection.query(`
      ALTER TABLE documentos_contables 
      ADD COLUMN IF NOT EXISTS categoria1 BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS categoria2 BOOLEAN DEFAULT FALSE
    `);
    console.log('✅ Columnas categoria1 y categoria2 verificadas en documentos_contables');

    console.log('✅ Migraciones completadas exitosamente');
  } catch (error) {
    console.error('❌ Error en migraciones:', error);
  } finally {
    await connection.end();
    process.exit(0);
  }
};

runMigrations();
