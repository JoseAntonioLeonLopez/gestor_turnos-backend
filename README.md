# Sistema de Gestión de Turnos - Backend

Este repositorio contiene el backend para el Sistema de Gestión de Turnos, una aplicación diseñada para manejar eficientemente los turnos en entornos médicos o de servicio al cliente.

## Requisitos Previos

- Docker
- Node.js (versión 14 o superior)
- npm (normalmente viene con Node.js)

## Configuración del Entorno

1. Clonar el repositorio:
   ```
   git clone https://github.com/JoseAntonioLeonLopez/gestor_turnos-backend
   cd sistema-turnos-backend
   ```

2. Crear un archivo `.env` en la raíz del proyecto con el siguiente contenido:
   ```
   DB_HOST=localhost
   DB_USER=turnos_user
   DB_PASSWORD=turnos_password
   DB_NAME=turnos_db
   DB_PORT=3306
   PORT=3000
   ```

## Instalación y Ejecución

1. Iniciar la base de datos con Docker:
   ```
   docker-compose up -d
   ```

2. Instalar las dependencias:
   ```
   npm install
   ```

3. Iniciar el servidor de desarrollo:
   ```
   npm run dev
   ```

El servidor estará corriendo en `http://localhost:3000`.
