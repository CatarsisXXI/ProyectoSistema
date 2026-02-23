# Sistema de Gestión de Reportes - SPEC.md

## 1. Project Overview

**Project Name:** Sistema de Gestión de Reportes (SGR)
**Project Type:** Web Application (React + Node.js + MySQL)
**Core Functionality:** Sistema integral para el registro de clientes, productos farmacéuticos/dispositivos médicos/productos biológicos, generación de órdenes de servicio y documentos contables con reportes para contabilidad.
**Target Users:** Empresas del sector salud en Perú que requieren gestionar registros sanitarios y trámites ante DIGEMID/VUCE.

---

## 2. Technology Stack

- **Frontend:** React 18 con Vite, JSX, Tailwind CSS
- **Backend:** Node.js con Express.js
- **Database:** MySQL (XAMPP)
- **Authentication:** JWT tokens
- **File Handling:** Multer para uploads de PDF

---

## 3. UI/UX Specification

### Layout Structure
- **Sidebar Navigation:** Fijo a la izquierda (240px width)
- **Main Content:** Área principal con padding de 24px
- **Header:** Barra superior con usuario logueado y cerrar sesión
- **Responsive:** Breakpoint principal en 1024px

### Color Palette
- **Primary:** #1E3A5F (Azul oscuro profesional)
- **Secondary:** #2E7D32 (Verde éxito)
- **Accent:** #FF6F00 (Naranja para acciones importantes)
- **Background:** #F5F7FA (Gris claro)
- **Surface:** #FFFFFF (Blanco para cards)
- **Text Primary:** #1A1A2E
- **Text Secondary:** #64748B
- **Error:** #DC2626
- **Warning:** #F59E0B

### Typography
- **Font Family:** 'Inter', system-ui, sans-serif
- **Headings:** 
  - H1: 28px, font-weight 700
  - H2: 22px, font-weight 600
  - H3: 18px, font-weight 600
- **Body:** 14px, font-weight 400
- **Small:** 12px, font-weight 400

### Components
- **Buttons:** 
  - Primary: bg-primary, texto blanco, border-radius 8px
  - Secondary: bg-transparent, border primary
  - States: hover (darken 10%), active (darken 15%)
- **Form Inputs:** border-radius 8px, border #E2E8F0, focus ring primary
- **Cards:** bg-white, shadow-sm, border-radius 12px, padding 24px
- **Tables:** striped rows, hover highlight
- **Checkboxes:** Custom styled, primary color when checked
- **Modals:** Overlay con center-aligned content

---

## 4. Database Schema

### Tabla: usuarios
```
sql
CREATE TABLE usuarios (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  nombre_completo VARCHAR(100) NOT NULL,
  rol ENUM('admin', 'usuario') DEFAULT 'usuario',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Tabla: clientes
```
sql
CREATE TABLE clientes (
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
);
```

### Tabla: productos_farmaceuticos
```
sql
CREATE TABLE productos_farmaceuticos (
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
);
```

### Tabla: dispositivos_medicos
```
sql
CREATE TABLE dispositivos_medicos (
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
);
```

### Tabla: productos_biologicos
```
sql
CREATE TABLE productos_biologicos (
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
);
```

### Tabla: ordenes_servicio
```
sql
CREATE TABLE ordenes_servicio (
  id INT PRIMARY KEY AUTO_INCREMENT,
  tipo_producto ENUM('farmaceutico', 'dispositivo_medico', 'biologico') NOT NULL,
  cliente_id INT NOT NULL,
  producto_id INT NOT NULL,
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
  clase1 BOOLEAN DEFAULT FALSE,
  clase1_autorizado VARCHAR(100),
  clase2 BOOLEAN DEFAULT FALSE,
  clase2_autorizado VARCHAR(100),
  clase3 BOOLEAN DEFAULT FALSE,
  clase3_autorizado VARCHAR(100),
  clase4 BOOLEAN DEFAULT FALSE,
  clase4_autorizado VARCHAR(100),
  vaccines_immunologicos BOOLEAN DEFAULT FALSE,
  vaccines_immunologicos_autorizado VARCHAR(100),
  otros_biologicos_chk BOOLEAN DEFAULT FALSE,
  otros_biologicos_autorizado VARCHAR(100),
  bioequivalente_chk BOOLEAN DEFAULT FALSE,
  bioequivalente_autorizado VARCHAR(100),
  biotecnologico_chk BOOLEAN DEFAULT FALSE,
  biotecnologico_autorizado VARCHAR(100),
  cpb_numero VARCHAR(50),
  monto DECIMAL(10,2),
  fecha_recepcion DATE,
  fecha_ingreso_vuce DATE,
  fecha_fin_proceso DATE,
  observaciones TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (cliente_id) REFERENCES clientes(id)
);
```

### Tabla: documentos_contables
```
sql
CREATE TABLE documentos_contables (
  id INT PRIMARY KEY AUTO_INCREMENT,
  tipo_producto ENUM('farmaceutico', 'dispositivo_medico', 'biologico') NOT NULL,
  cliente_id INT NOT NULL,
  producto_id INT NOT NULL,
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
);
```

---

## 5. Functionality Specification

### 5.1 Authentication
- Login con username y password
- JWT token almacenamiento en localStorage
- Ruta protegida para todas las páginas excepto /login
- Cerrar sesión limpia el token

### 5.2 Cliente Registration
- Formulario con todos los campos especificados
- Código de cliente auto-generado (SE-001, SE-002, etc.)
- Checkboxes para categoría y solicitud (múltiple selección)
- Campo "Otros" se habilita solo si se selecciona "Otros" en solicitud
- Auto-guardar usuario logueado

### 5.3 Producto Registration

#### Farmacéutico
- Fecha auto-generada (fecha actual)
- Usuario auto-cargado del session
- Código registro: EE00301, EE00302, etc. (correlativo único)
- Checkboxes: Categoría 1, Categoría 2
- Campos: Fabricante, País de Origen
- Checkbox PAVS (Si/No)

#### Dispositivo Médico
- Fecha auto-generada
- Usuario auto-cargado
- Código registro: DM00301, DM00302, etc.
- Checkboxes: Clase 1, Clase 2, Clase 3, Clase 4

#### Producto Biológico
- Fecha auto-generada
- Usuario auto-cargado
- Código registro: PB00301, PB00302, etc.
- Checkboxes: Vacunas e Inmunológicos, Otros Biológicos, Bioequivalente, Biotecnológico
- Campos: Fabricante, País de Origen
- Checkbox PAVS (Si/No)

### 5.4 Órdenes de Servicio

#### Para Farmacéuticos
- Búsqueda de cliente por RUC (autocomplete)
- Búsqueda de producto por nombre (autocomplete)
- Carga automática de datos relacionados
- Checkboxes: Cambio Mayor, Cambio Menor, Inscripción, Renovación, Traducción
- Si se marca checkbox, se habilita campo "Autorizado por" (obligatorio)
- Campos: CPB N°, Fechas, Observaciones

#### Para Dispositivos Médicos
- Similar estructura
- Checkboxes: Clase 1-4, Traducción
- Campo: Monto S/.

#### Para Productos Biológicos
- Checkboxes: Vacunas e Inmunológicos, Otros Biológicos, Bioequivalente, Biotecnológico, Traducción
- Cada checkbox tiene "Autorizado por"

### 5.5 Documentos Contables

#### Estructura General
- Cliente por RUC (autocomplete)
- Producto (autocomplete)
- Por cada opción: checkbox + campo costo + selector moneda (Soles/Dólares)
- Total calculado automáticamente (suma de costos)
- Derecho de Trámite: CPB N° + Monto S/.
- Adjunto PDF opcional

### 5.6 Reportes Contabilidad
- Lista de documentos contables
- Ver detalle en formato requerido:
  - Cliente, RUC
  - Descripción del servicio con registro sanitario
  - Derecho de Tramite (Tasa de Salud) con monto

---

## 6. Page Structure

1. **/login** - Login de acceso
2. **/dashboard** - Panel principal ( después del login)
3. **/clientes** - Listado y registro de clientes
4. **/clientes/nuevo** - Formulario nuevo cliente
5. **/productos** - Menú de productos
6. **/productos/farmaceuticos** - Listado farmaceuticos
7. **/productos/farmaceuticos/nuevo** - Nuevo farmaceutico
8. **/productos/dispositivos** - Listado dispositivos
9. **/productos/dispositivos/nuevo** - Nuevo dispositivo
10. **/productos/biologicos** - Listado biologicos
11. **/productos/biologicos/nuevo** - Nuevo biologico
12. **/ordenes** - Menú órdenes de servicio
13. **/ordenes/nuevo** - Nueva orden (seleccionar tipo)
14. **/documentos** - Menú documentos contables
15. **/documentos/nuevo** - Nuevo documento
16. **/reportes** - Reportes contables

---

## 7. API Endpoints

### Auth
- POST /api/auth/login
- POST /api/auth/logout

### Clientes
- GET /api/clientes
- GET /api/clientes/:id
- POST /api/clientes
- PUT /api/clientes/:id
- GET /api/clientes/buscar/:ruc

### Productos
- GET /api/productos/farmaceuticos
- POST /api/productos/farmaceuticos
- GET /api/productos/dispositivos
- POST /api/productos/dispositivos
- GET /api/productos/biologicos
- POST /api/productos/biologicos
- GET /api/productos/buscar/:tipo/:nombre

### Órdenes
- GET /api/ordenes
- POST /api/ordenes

### Documentos
- GET /api/documentos
- POST /api/documentos
- POST /api/documentos/upload (para PDF)

---

## 8. Acceptance Criteria

1. ✅ Usuario puede hacer login con credenciales válidas
2. ✅ Sistema genera código correlativo para clientes (SE-001, SE-002...)
3. ✅ Sistema genera código correlativo para productos por tipo
4. ✅ Checkboxes de categoría y solicitud permiten selección múltiple
5. ✅ Campo "Otros" se habilita condicionalmente
6. ✅ Búsqueda por RUC autocompleta datos del cliente
7. ✅ Búsqueda por nombre autocompleta datos del producto
8. ✅ Campos "Autorizado por" se habilitan condicionalmente al marcar checkbox
9. ✅ Cálculo automático de total en documentos contables
10. ✅ Sistema genera reportes con estructura requerida
11. ✅ Interfaz profesional y responsiva
12. ✅ Base de datos MySQL funcionando con XAMPP
