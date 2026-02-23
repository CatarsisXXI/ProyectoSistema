# Sistema de Gestión de Reportes (SGR)

Sistema integral para el registro de clientes, productos farmacéuticos/dispositivos médicos/productos biológicos, generación de órdenes de servicio y documentos contables.

## Requisitos

- Node.js 18+
- XAMPP (MySQL)
- Navegador web moderno

## Instalación

### 1. Instalar dependencias del backend
```
bash
cd backend
npm install
```

### 2. Instalar dependencias del frontend
```
bash
cd frontend
npm install
```

## Configuración de MySQL (XAMPP)

1. Asegúrate de que Apache y MySQL estén corriendo en XAMPP
2. La base de datos se creará automáticamente al iniciar el servidor

## Ejecución

### Opción 1: Manual

1. **Iniciar el backend** (terminal 1):
```
bash
cd backend
npm start
```
El backendcorrerá en http://localhost:3001

2. **Iniciar el frontend** (terminal 2):
```
bash
cd frontend
npm run dev
```
El frontendcorrerá en http://localhost:5173

### Opción 2: Usar scripts.bat (Windows)

1. Edita el archivo `iniciar.bat` y asegurate de que las rutas sean correctas
2. Ejecuta:
```
bash
iniciar.bat
```

## Credenciales por defecto

- **Usuario:** admin
- **Contraseña:** admin123

## Características

### Módulos del sistema:
- ✅ Login de acceso
- ✅ Registro de clientes (con RUC, categoría, solicitud)
- ✅ Registro de productos:
  - Farmacéuticos
  - Dispositivos Médicos
  - Productos Biológicos
- ✅ Órdenes de servicio por tipo de producto
- ✅ Documentos contables con costos
- ✅ Reportes para contabilidad

### Códigos correlativos automáticos:
- Clientes: SE-001, SE-002, ...
- Productos Farmacéuticos: EE00301, EE00302, ...
- Dispositivos Médicos: DM00301, DM00302, ...
- Productos Biológicos: PB00301, PB00302, ...

## Estructura del proyecto

```
PROYECTO SISTEMA/
├── backend/
│   ├── database.js      # Configuración de MySQL
│   ├── server.js       # Servidor Express
│   ├── routes/         # Rutas API
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── pages/      # Componentes React
│   │   ├── context/    # Contextos (Auth)
│   │   └── components/
│   └── package.json
└── README.md
```

## Solución de problemas

### Error "ECONNREFUSED" al iniciar
- Asegúrate de que MySQL esté corriendo en XAMPP
- Asegúrate de que el backend esté corriendo (npm start en la carpeta backend)

### Error de base de datos
- Verifica que XAMPP MySQL esté activo
- El usuario de MySQL por defecto es "root" con contraseña vacía

### Error de CORS
- El backend está configurado para permitir CORS desde el frontend
