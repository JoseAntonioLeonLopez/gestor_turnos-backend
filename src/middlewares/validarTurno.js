const { body, validationResult } = require('express-validator');

const validarTurno = [
  // Validación del campo "nombre"
  body('nombre')
    .trim()  // Elimina espacios en blanco al inicio y final
    .notEmpty().withMessage('El nombre es obligatorio.')  // Verifica que no esté vacío
    .isLength({ min: 3, max: 50 }).withMessage('El nombre debe tener entre 3 y 50 caracteres.')  // Longitud permitida
    .matches(/^[a-zA-Z\s]+$/).withMessage('El nombre solo puede contener letras y espacios.'),  // Evita caracteres no permitidos

  // Manejo de errores
  (req, res, next) => {
    const errors = validationResult(req);

    // Si hay errores, responder con un JSON detallando los errores encontrados
    if (!errors.isEmpty()) {
      return res.status(400).json({ errores: errors.array() });
    }

    // Si no hay errores, continuar con la siguiente función del controlador
    next();
  },
];

module.exports = validarTurno;
