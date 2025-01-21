const express = require('express');
const TurnoController = require('../controllers/turnoController');
const validarTurno = require('../middlewares/validarTurno');

const router = express.Router();

router.post('/generar', validarTurno, TurnoController.generarTurno);
router.get('/llamados', TurnoController.verTurnosLlamados);
router.get('/en-espera', TurnoController.obtenerTurnosEnEspera);
router.post('/avanzar', TurnoController.avanzarTurno);
router.post('/atender', TurnoController.atenderTurno);
router.post('/finalizar', TurnoController.finalizarTurno); 

module.exports = router;
