# Trabajo Práctico 09: Actualización y Eliminación de Reservas de Salas (CRUD MongoDB)

Este proyecto corresponde a la **Unidad 9** del curso de Desarrollo Back-end con Node.js. Amplía la API REST y la aplicación web desarrollada en la Unidad 08, completando el ciclo CRUD para la gestión de reservas de salas mediante la implementación de reemplazos completos (`PUT`), actualizaciones parciales (`PATCH`) y borrado físico (`DELETE`).

---

## 1. Origen de la copia y estructura

El repositorio proviene de la base funcional del TP08 (`tp-08-salas-lectura-mongodb`), conservando la arquitectura por capas, el manifiesto de dependencias, la configuración de formato y análisis de código, y la vista Web/HTML preexistente.

Se mantiene la separación de responsabilidades para que la aplicación web y la API puedan trabajar sobre la misma lógica de persistencia en MongoDB.

### Versiones y tecnologías

- **Node.js:** 22.22.0
- **Sistema de módulos:** CommonJS
- **Express:** 5.2.1
- **Mongoose:** 9.10.3
- **EJS:** 6.0.1
- **express-ejs-layouts:** 2.5.1
- **Morgan:** 1.12.1
- **Prettier:** 3.9.9
- **ESLint:** 10.12.0
- **MongoDB Atlas:** base de datos en la nube.
- **Postman:** herramienta para probar los endpoints de la API.

---

## 2. Configuración del entorno y conexión a MongoDB Atlas

### Requisitos previos

Para ejecutar el proyecto se necesita:

- Node.js instalado.
- npm disponible.
- Una cuenta de MongoDB Atlas.
- Un clúster de MongoDB configurado.
- Acceso de red autorizado en Atlas.
- Postman para realizar las pruebas de la API.

### Configuración de MongoDB Atlas

El proyecto utiliza la base de datos:

`reservas_salas_u9`

Y la colección:

`reservas`

La conexión se realiza mediante una URI de MongoDB Atlas utilizando el esquema `mongodb+srv://`.

### Variables de entorno

En el archivo `.env.example` se proporciona una plantilla de configuración:

```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb+srv://USUARIO:CLAVE@HOST/reservas_salas_u9?retryWrites=true&w=majority
```

Para configurar el entorno local:

1. Crear un archivo `.env` en la raíz del proyecto.
2. Copiar el contenido de `.env.example`.
3. Reemplazar los valores de ejemplo por las credenciales y la URI reales de MongoDB Atlas.
4. Verificar que la base de datos indicada sea `reservas_salas_u9`.

**Importante:** el archivo `.env` contiene información sensible y no debe subirse al repositorio. Se debe mantener excluido mediante `.gitignore`.

### Configuración DNS y conexión

La conexión a MongoDB Atlas utiliza el esquema `mongodb+srv://`.

En `src/config/base-datos.js` se configura el ajuste DNS utilizado para resolver correctamente la dirección del clúster en el entorno local.

El servidor inicia la escucha únicamente después de establecer correctamente la conexión con MongoDB Atlas. De esta manera, se evita que la aplicación acepte solicitudes antes de disponer de acceso a la base de datos.

---

## 3. Instalación, comandos de inicio y calidad de código

### Clonar el repositorio

```bash
git clone https://github.com/Fidel272/tp-09-salas-crud-mongodb
```

Ingresar a la carpeta del proyecto:

```bash
cd tp-09-salas-crud-mongodb
```

### Instalar dependencias

```bash
npm install
```

### Configurar el entorno

Crear el archivo `.env` a partir de `.env.example` y completar los datos de conexión a MongoDB Atlas.

### Comprobar la conexión a Atlas

```bash
node --env-file=.env scripts/comprobar-conexion.js
```

### Comandos de calidad de código

Formatear el código:

```bash
npm run format
```

Comprobar el formato:

```bash
npm run format:check
```

Ejecutar el análisis estático y las verificaciones:

```bash
npm run check
```

Estos comandos permiten revisar la calidad y consistencia del código del proyecto.

### Iniciar el servidor

```bash
node --env-file=.env src/index.js
```

La aplicación utiliza el puerto configurado mediante la variable `PORT`. En caso de utilizar el valor predeterminado de la plantilla, se accede desde:

`http://localhost:3000`

---

## 4. Arquitectura por capas

La aplicación mantiene una separación de responsabilidades para facilitar el mantenimiento y la reutilización de la lógica de negocio.

1. **Rutas (`src/rutas/`):** definen las direcciones HTTP y organizan el encadenamiento de middlewares y controladores.

2. **Middlewares (`src/middleware/`):** reciben y validan las entradas HTTP. Rechazan peticiones malformadas o con campos no permitidos antes de realizar modificaciones en la base de datos.

3. **Controladores (`src/controladores/`):** reciben las solicitudes, invocan la capa de servicio y coordinan las respuestas HTTP, tanto para la API JSON como para las vistas HTML.

4. **Servicios MongoDB (`src/servicios/`):** encapsulan las operaciones de persistencia mediante Mongoose. Construyen explícitamente los datos permitidos para las operaciones de reemplazo y actualización, evitando enviar directamente `req.body` al modelo.

5. **Modelos (`src/modelos/`):** definen los esquemas de Mongoose y las validaciones correspondientes a los datos almacenados.

Esta organización permite reutilizar la lógica de persistencia y mantener separada la comunicación HTTP de las operaciones realizadas sobre MongoDB.

---

## 5. Esquema de datos y reglas de validación

La colección `reservas` contiene los siguientes campos:

| Campo | Tipo | Reglas de validación |
|---|---|---|
| `estudiante` | String | Obligatorio y con `trim`. |
| `email` | String | Obligatorio, con `trim` y debe incluir `@`. |
| `sala` | String | Enum: `Sala Norte`, `Sala Sur`, `Sala Multimedia`. |
| `fecha` | String | Obligatorio y con `trim`. |
| `turno` | String | Enum: `Mañana`, `Tarde`, `Noche`. |
| `personas` | Number | Entero entre 1 y 6. Acepta números o strings numéricos válidos. |
| `estado` | String | Enum: `pendiente` o `confirmada`. Por defecto, `pendiente` al crear una reserva. |

Las validaciones impiden almacenar valores fuera de las reglas establecidas para cada campo.

No se incorporan validaciones de disponibilidad, superposición de horarios, unicidad de reservas ni restricciones adicionales de calendario.

---

## 6. Contrato HTTP y definición de rutas API

La API permite crear, consultar, reemplazar, modificar parcialmente y eliminar reservas mediante los métodos HTTP correspondientes.

### 6.1. Creación de reservas: POST

**Endpoint:** `POST /api/reservas`

Crea una nueva reserva en MongoDB.

- Acepta los seis campos originales: `estudiante`, `email`, `sala`, `fecha`, `turno` y `personas`.
- No permite que el cliente envíe `estado` ni `_id`.
- Asigna automáticamente `estado: "pendiente"`.
- Devuelve `201 Created`.
- Incluye la cabecera `Location` con la ubicación del recurso creado.

### 6.2. Lectura de reservas: GET

**Obtener todas las reservas:**

`GET /api/reservas`

Devuelve un arreglo JSON con las reservas almacenadas.

Respuesta esperada: `200 OK`.

**Obtener una reserva por ID:**

`GET /api/reservas/:id`

Busca una reserva específica utilizando su identificador.

- Si existe, devuelve la reserva con `200 OK`.
- Si el ID tiene un formato inválido, devuelve `400 Bad Request`.
- Si el ID es válido pero no existe, devuelve `404 Not Found`.

### 6.3. Reemplazo completo: PUT

**Endpoint:** `PUT /api/reservas/:id`

Reemplaza completamente los campos editables de una reserva existente.

A diferencia de `PATCH`, requiere enviar todos los campos editables:

- `estudiante`
- `email`
- `sala`
- `fecha`
- `turno`
- `personas`
- `estado`

**Validaciones:**

- Los siete campos deben estar presentes.
- Rechaza campos desconocidos.
- Rechaza operadores de MongoDB, como `$set`.
- No permite modificar `_id`.
- Rechaza cuerpos ausentes, arrays y valores que no sean un objeto válido.
- Si falta algún campo o los datos no cumplen las validaciones, devuelve `400 Bad Request` sin modificar la reserva.

**Respuesta exitosa:** `200 OK`, con el documento actualizado y conservando el mismo ID.

### 6.4. Modificación parcial: PATCH

**Endpoint:** `PATCH /api/reservas/:id`

Permite modificar parcialmente una reserva sin reemplazar todos sus datos.

Los únicos campos permitidos son:

- `personas`
- `estado`

Se puede enviar uno de ellos o ambos en la misma solicitud.

**Validaciones:**

- Debe enviarse al menos uno de los campos permitidos.
- Rechaza objetos vacíos (`{}`).
- Rechaza campos no autorizados, como `estudiante` o `sala`.
- Rechaza operadores de MongoDB y la inclusión de `_id`.
- Rechaza cuerpos ausentes, arrays y valores que no sean un objeto válido.
- Valida que `personas` sea un número entero entre 1 y 6.
- Si los datos no son válidos, devuelve `400 Bad Request` sin modificar la reserva.

**Respuesta exitosa:** `200 OK`, con el documento actualizado. Los campos que no se enviaron conservan sus valores anteriores.

### 6.5. Eliminación física: DELETE

**Endpoint:** `DELETE /api/reservas/:id`

Elimina físicamente un documento de la colección `reservas` de MongoDB.

**Respuesta exitosa:** `204 No Content`, sin cuerpo de respuesta.

Comportamiento:

- Si el ID es inválido, devuelve `400 Bad Request`.
- Si el ID es válido pero la reserva no existe, devuelve `404 Not Found`.
- Si la reserva se elimina correctamente, devuelve `204 No Content`.
- Si se repite el DELETE sobre el mismo ID, devuelve `404 Not Found`.
- Un GET posterior sobre el ID eliminado también devuelve `404 Not Found`.

---

## 7. Diferencia entre borrado físico y cambio de estado

Es importante distinguir entre eliminar una reserva y modificar su estado.

**Borrado físico (`DELETE`):**

- El documento se elimina de MongoDB.
- La cantidad total de documentos disminuye.
- La reserva deja de estar disponible para consultas.
- No puede recuperarse mediante los endpoints de la API.

**Cambio de estado (`PUT` o `PATCH`):**

- Se modifica el campo `estado`.
- La reserva permanece almacenada en MongoDB.
- Conserva su identificador.
- Continúa apareciendo en los listados.

Por lo tanto, cambiar una reserva a `confirmada` no significa eliminarla. La eliminación real se realiza exclusivamente mediante `DELETE`.

---

## 8. Recorrido de pruebas en Postman

Para probar la API se utiliza Postman, configurando las solicitudes HTTP y sus respectivos cuerpos JSON.

### Configuración general

Para las solicitudes `POST`, `PUT` y `PATCH`, utilizar:

`Content-Type: application/json`

Para las solicitudes `GET` y `DELETE`, no es necesario enviar un cuerpo.

### 8.1. Crear una reserva

**Método:** `POST`

**URL:** `http://localhost:3000/api/reservas`

**Body → raw → JSON:**

```json
{
  "estudiante": "Ana Ejemplo",
  "email": "ana@example.com",
  "sala": "Sala Norte",
  "fecha": "2026-10-28",
  "turno": "Mañana",
  "personas": 2
}
```

**Resultado esperado:** `201 Created`.

Verificar que la respuesta incluya el ID generado y que el estado asignado sea `pendiente`. También comprobar la cabecera `Location`.

### 8.2. Consultar todas las reservas

**Método:** `GET`

**URL:** `http://localhost:3000/api/reservas`

**Resultado esperado:** `200 OK`, con un arreglo JSON.

### 8.3. Consultar una reserva por ID

**Método:** `GET`

**URL:** `http://localhost:3000/api/reservas/ID_DE_LA_RESERVA`

**Resultado esperado:** `200 OK`, si el recurso existe.

### 8.4. Reemplazar una reserva con PUT

**Método:** `PUT`

**URL:** `http://localhost:3000/api/reservas/ID_DE_LA_RESERVA`

**Body → raw → JSON:**

```json
{
  "estudiante": "Ana Ejemplo Editada",
  "email": "ana@example.com",
  "sala": "Sala Norte",
  "fecha": "2026-10-28",
  "turno": "Tarde",
  "personas": 4,
  "estado": "confirmada"
}
```

**Resultado esperado:** `200 OK`.

Verificar que los siete campos se hayan actualizado y que el ID siga siendo el mismo.

### 8.5. Modificar parcialmente con PATCH

**Método:** `PATCH`

**URL:** `http://localhost:3000/api/reservas/ID_DE_LA_RESERVA`

**Body → raw → JSON:**

```json
{
  "personas": 3
}
```

**Resultado esperado:** `200 OK`.

Verificar que `personas` cambie a `3` y que los demás campos, incluido `estado`, mantengan sus valores anteriores.

### 8.6. Eliminar una reserva con DELETE

**Método:** `DELETE`

**URL:** `http://localhost:3000/api/reservas/ID_DE_LA_RESERVA`

**Resultado esperado:** `204 No Content`, sin cuerpo de respuesta.

### 8.7. Comprobar la eliminación

Después de eliminar la reserva, realizar:

`GET /api/reservas/ID_DE_LA_RESERVA`

**Resultado esperado:** `404 Not Found`.

También se puede repetir la solicitud DELETE para verificar que el recurso ya no existe.

---

## 9. Matriz de pruebas y resultados observados

Completar esta matriz después de ejecutar las pruebas en Postman. Registrar el código HTTP obtenido y si el comportamiento fue correcto.

| Caso de prueba | Entrada o condición | Resultado obtenido | ¿Correcto? |
|---|---|---|---|
| POST válido | Se envían los seis campos obligatorios. | 201 Created, Location y estado pendiente | Sí |
| PUT completo | Se envían los siete campos editables. | 200 OK, mismo ID y siete campos actualizados | Sí |
| PUT incompleto | Se omite un campo obligatorio. | 400 Bad Request y recurso intacto | Sí |
| PATCH válido | Se modifica `personas` o `estado`. | 200 OK y campos omitidos conservados | Sí |
| PATCH inválido | Se envía `{}` o un campo no permitido. | 400 Bad Request sin modificación | Sí |
| Personas inválido | Se envía `0`, `7`, `2.5`, `true`, `[]` o `{}`. | 400 Bad Request sin modificación | Sí |
| Enum inválido | Se envía una sala, turno o estado no admitido. | 400 Bad Request sin modificación | Sí |
| ID mal formado | Se utiliza un ID inválido, por ejemplo `123`. | 400 Bad Request | Sí |
| ID inexistente | Se utiliza un ObjectId válido que no existe. | 404 Not Found sin creación | Sí |
| JSON inválido | Se envía un cuerpo con sintaxis incorrecta. | 400 Bad Request JSON | Sí |
| DELETE existente | Se elimina una reserva existente. | 204 No Content; una reserva menos en el listado | Sí |
| DELETE repetido | Se intenta eliminar nuevamente el mismo ID. | 404 Not Found | Sí |
| GET posterior al DELETE | Se consulta el ID eliminado. | 404 Not Found | Sí |
| Persistencia | Se reinicia el servidor y se consultan los datos. | Cambios persistidos correctamente en Atlas | Sí |
| Integridad Web | Se comprueban las vistas HTML, el formulario y `/estado`. | Contratos conservados y contador actualizado | Sí |
| Error inesperado | Se comprueba el tratamiento seguro de errores del servidor. | 500 Internal Server Error con JSON seguro sin trazas ni secretos | Sí |

---

## 10. Evidencia de persistencia y continuidad

### Prueba de reinicio del servidor

Esta prueba permite comprobar que las operaciones realizadas se guardan realmente en MongoDB Atlas y no solamente en la memoria de la aplicación.

**Procedimiento:**

1. Crear una reserva mediante POST.
2. Modificarla mediante PUT o PATCH.
3. Eliminar otra reserva mediante DELETE.
4. Detener el servidor.
5. Iniciar nuevamente la aplicación.
6. Consultar mediante GET las reservas modificadas y eliminadas.

**Resultado obtenido:**

- Modificaciones conservadas después del reinicio: Los cambios de PUT y PATCH se mantuvieron correctamente en MongoDB Atlas al reiniciar el servidor.
- Eliminación conservada después del reinicio: El documento eliminado mediante DELETE continuó ausente tras reiniciar el servidor y volver a consultar.
- Observaciones: La persistencia funciona de manera óptima y el estado general de la aplicación se conserva de forma íntegra.

### Continuidad de la aplicación web

Se debe comprobar que la aplicación HTML desarrollada en el TP08 continúe funcionando correctamente.

Verificar:

- Visualización del listado de reservas.
- Funcionamiento del formulario de reservas.
- Persistencia de los datos en MongoDB Atlas.
- Funcionamiento del endpoint `/estado`.
- Reflejo de la cantidad real de documentos almacenados en la colección `reservas`.

**Resultado de la comprobación:** Las vistas HTML, el formulario de creación, la persistencia en MongoDB Atlas y el endpoint `/estado` funcionan correctamente, reflejando de forma exacta y en tiempo real la cantidad real de documentos almacenados en la colección `reservas`.

---

## 11. Consideraciones finales

El TP09 amplía la funcionalidad del sistema de reservas desarrollado en la unidad anterior, incorporando operaciones de reemplazo completo, modificación parcial y eliminación física de documentos mediante una API REST conectada a MongoDB Atlas.

Se mantiene la arquitectura modular, la separación de responsabilidades y la reutilización de la lógica de persistencia entre la API y la aplicación web.

Las operaciones implementadas permiten administrar las reservas respetando las validaciones establecidas, diferenciando claramente las actualizaciones de datos de la eliminación definitiva de documentos.

El trabajo se centra en las operaciones CRUD y en la persistencia de información. No incluye autenticación, despliegue público ni consultas avanzadas, contenidos correspondientes a unidades posteriores.