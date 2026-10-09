# 🍀 Plataforma Digital de Sorteos y Rifas

Plataforma profesional de sorteos en vivo y gestión de boletos inspirada en el flujo y estética de **Premios Lorenzo**, desarrollada con una arquitectura escalable en dos aplicaciones web separadas (**Web del Cliente** y **Panel del Administrador**), backend en Node/Express/TypeScript, **WebSockets (Socket.io)** para chat y notificaciones reactivas, **Lector OCR Antifraude (Tesseract.js)** para validar comprobantes de Yape/Plin sin duplicados, **Súper Compresión de imágenes en el cliente (Canvas API)** y **Exportación de Auditoría a Excel (.xlsx)**.

---

## 🎨 Paleta de Colores y Modo Oscuro (Web del Cliente)

* **Fondo Principal Claro:** `#FAF8FF` (Lila suave y relajante)
* **Fondo Modo Oscuro:** `#0C0817` (Oscuro profundo y elegante)
* **Primario Brand:** `#8442F2` / `#7C3AED` (Violeta vibrante y moderno)
* **Acentos Pasteles:** `#E7DCFF` / `#D5C2FE` (Lavanda pastel para tarjetas y podios)
* **Éxito / Participando:** `#10B981` (Verde esmeralda para tickets confirmados)
* **Alerta / Pendiente:** `#F59E0B` (Ámbar para el estado `PENDIENTE DE VERIFICACIÓN`)

---

## 🚀 Arquitectura del Proyecto (Monorepo)

```text
sorteos-web/
├── packages/
│   └── shared/       # Interfaces TypeScript, constantes, estados y validaciones comunes
│
├── apps/
│   ├── server/       # API REST + WebSockets + Motor OCR + Generador de Excel (.xlsx)
│   │                 # Puerto: 4005
│   │
│   ├── client/       # Web para Clientes (React + Vite + Tailwind + Socket.io)
│   │                 # Catálogo de sorteos dinámicos, Carrusel de Premios,
│   │                 # Modo Claro/Oscuro garantizado, Transmisiones en vivo,
│   │                 # Salón de la Fama de ganadores, Súper compresión de vouchers,
│   │                 # Lector OCR en vivo, Buscador "Mis Tickets" reactivo,
│   │                 # Páginas completas (Términos, Privacidad, Libro de Reclamaciones, Compra)
│   │                 # Puerto: 5180
│   │
│   └── admin/        # Panel del Administrador (React + Vite + Tailwind + Socket.io)
│                     # Dashboard métricas por sorteo, Bandeja de Verificación con OCR,
│                     # Chat estilo WhatsApp Web en tiempo real,
│                     # Gestión de Sorteos, Premios, Billeteras con QR,
│                     # Configuración de Marca y Descarga de reportes en Excel (.xlsx)
│                     # Puerto: 5190
```

---

## 🛡️ Mecánica Antifraude: Lector OCR y Control de Duplicados

1. **Súper Compresión Cliente:** Antes de subir cualquier imagen, el navegador la procesa mediante Canvas API para reducir comprobantes de 5MB a ~70KB al instante sin perder nitidez.
2. **Lectura Inteligente:** El motor OCR analiza el voucher y extrae de forma automática:
   * **N° de Operación** (ej. `#84920194`)
   * **Monto Pagado** (ej. `S/ 15.00`)
   * **Fecha y Hora**
3. **Validación Antiduplicados:** El sistema comprueba de inmediato si ese número de operación ya existe en la base de datos:
   * Si es repetido: Muestra alerta roja inmediata y bloquea el envío.
   * Si es nuevo: Marca el comprobante como validado por OCR.

---

## 🔄 El Flujo Digitalizado

| Paso | Acción del Cliente | Acción del Administrador |
| :--- | :--- | :--- |
| **1. Compra** | Paga por Yape/Plin/Banco, sube su captura y datos (DNI, Nombre, Celular). | Recibe alerta sonora y visual en tiempo real en el Panel Admin. |
| **2. Alivio Inmediato** | Su ticket aparece al instante como 🟡 **PENDIENTE DE VERIFICACIÓN** en *"Mis Tickets"*. | Revisa los datos escaneados por OCR y la captura ampliada. |
| **3. Aprobación en Vivo** | Su estado cambia automáticamente a 🟢 **PARTICIPANDO** con sus números correlativos sin recargar la página. | Da clic en **"Aprobar Pago"** con 1 solo toque. |
| **4. Soporte** | Puede abrir el **Chat en Vivo** en cualquier momento si tiene dudas. | Responde a múltiples clientes desde su bandeja tipo WhatsApp Web. |
| **5. Cierre y Excel** | Ve la transmisión en vivo del sorteo y a los ganadores en el Salón de la Fama. | Registra a los ganadores y descarga con 1 clic el **Excel Completo (.xlsx)** para archivo contable. |

---

## 💻 Instrucciones para Ejecutar en Desarrollo

### 1. Iniciar el Servidor Backend:
```bash
npm --workspace=@sorteos/server run dev
# Corre en http://localhost:4005
```

### 2. Iniciar la Web del Cliente:
```bash
npm --workspace=@sorteos/client run dev
# Abre http://localhost:5180
```

### 3. Iniciar el Panel del Administrador:
```bash
npm --workspace=@sorteos/admin run dev
# Abre http://localhost:5190
```

O para iniciar todos a la vez con un solo comando:
```bash
npm run dev
```

---

Desarrollado para alta escalabilidad, seguridad antifraude y experiencia de usuario fluida.
