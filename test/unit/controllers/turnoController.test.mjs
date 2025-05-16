import { expect } from 'chai';
import sinon from 'sinon';
import turnoController from '../../../src/controllers/turnoController.js';
import Turno from '../../../src/models/Turno.js';

describe('TurnoController', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      body: {},
      io: {
        emit: sinon.stub()
      }
    };
    res = {
      status: sinon.stub().returns({ json: sinon.stub() }),
      json: sinon.stub()
    };
    next = sinon.stub();
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('generarTurno', () => {
    it('debería crear un nuevo turno con nombre válido', async () => {
      req.body.nombre = 'Juan';
      const turnoStub = { codigo: 'A1B2', nombre: 'Juan', estado: 'en espera' };
      sinon.stub(Turno, 'create').resolves(turnoStub);

      await turnoController.generarTurno(req, res, next);

      expect(Turno.create.calledOnce).to.be.true;
      expect(req.io.emit.calledWith('nuevoTurno', turnoStub)).to.be.true;
      expect(res.status.calledWith(201)).to.be.true;
      expect(res.status().json.calledWith(turnoStub)).to.be.true;
    });

    it('debería devolver error con nombre inválido', async () => {
      req.body.nombre = 'A';

      await turnoController.generarTurno(req, res, next);

      expect(res.status.calledWith(400)).to.be.true;
      expect(res.status().json.calledWith(sinon.match({ error: sinon.match.string }))).to.be.true;
    });

    it('debería llamar a next con el error si ocurre una excepción', async () => {
      req.body.nombre = 'Juan';
      const error = new Error('DB Error');
      sinon.stub(Turno, 'create').rejects(error);

      await turnoController.generarTurno(req, res, next);

      expect(next.calledWith(error)).to.be.true;
    });
  });

  describe('obtenerTurnosEnEspera', () => {
    it('debería devolver todos los turnos en espera', async () => {
      const turnosEnEspera = [{ codigo: 'A1B2', nombre: 'Juan', estado: 'en espera' }];
      sinon.stub(Turno, 'findAll').resolves(turnosEnEspera);

      await turnoController.obtenerTurnosEnEspera(req, res, next);

      expect(Turno.findAll.calledWith({ where: { estado: 'en espera' } })).to.be.true;
      expect(res.json.calledWith(turnosEnEspera)).to.be.true;
    });

    it('debería llamar a next con el error si ocurre una excepción', async () => {
      const error = new Error('DB Error');
      sinon.stub(Turno, 'findAll').rejects(error);

      await turnoController.obtenerTurnosEnEspera(req, res, next);

      expect(next.calledWith(error)).to.be.true;
    });
  });

  describe('verTurnosLlamados', () => {
    it('debería devolver todos los turnos llamados', async () => {
      const turnosLlamados = [{ codigo: 'C3D4', nombre: 'María', estado: 'llamado' }];
      sinon.stub(Turno, 'findAll').resolves(turnosLlamados);

      await turnoController.verTurnosLlamados(req, res, next);

      expect(Turno.findAll.calledWith({ where: { estado: 'llamado' } })).to.be.true;
      expect(res.json.calledWith(turnosLlamados)).to.be.true;
    });

    it('debería llamar a next con el error si ocurre una excepción', async () => {
      const error = new Error('DB Error');
      sinon.stub(Turno, 'findAll').rejects(error);

      await turnoController.verTurnosLlamados(req, res, next);

      expect(next.calledWith(error)).to.be.true;
    });
  });

  describe('avanzarTurno', () => {
    it('debería avanzar el primer turno en espera a llamado', async () => {
      const turno = { estado: 'en espera', save: sinon.stub() };
      sinon.stub(Turno, 'findOne').resolves(turno);
      sinon.stub(Turno, 'findAll').resolves([]);

      await turnoController.avanzarTurno(req, res, next);

      expect(turno.estado).to.equal('llamado');
      expect(turno.save.calledOnce).to.be.true;
      expect(req.io.emit.calledWith('nuevoTurno', turno)).to.be.true;
      expect(req.io.emit.calledWith('turnosEnEspera', [])).to.be.true;
      expect(res.json.calledWith(turno)).to.be.true;
    });

    it('debería devolver error si no hay turnos en espera', async () => {
      sinon.stub(Turno, 'findOne').resolves(null);

      await turnoController.avanzarTurno(req, res, next);

      expect(res.status.calledWith(404)).to.be.true;
      expect(res.status().json.calledWith({ error: 'No hay turnos en espera' })).to.be.true;
    });

    it('debería llamar a next con el error si ocurre una excepción', async () => {
      const error = new Error('DB Error');
      sinon.stub(Turno, 'findOne').rejects(error);

      await turnoController.avanzarTurno(req, res, next);

      expect(next.calledWith(error)).to.be.true;
    });
  });

  describe('atenderTurno', () => {
    it('debería cambiar el estado del primer turno llamado a atendiendo', async () => {
      const turno = { estado: 'llamado', save: sinon.stub() };
      sinon.stub(Turno, 'findOne').resolves(turno);

      await turnoController.atenderTurno(req, res, next);

      expect(turno.estado).to.equal('atendiendo');
      expect(turno.save.calledOnce).to.be.true;
      expect(req.io.emit.calledWith('nuevoTurno', turno)).to.be.true;
      expect(res.json.calledWith(turno)).to.be.true;
    });

    it('debería devolver error si no hay turnos llamados', async () => {
      sinon.stub(Turno, 'findOne').resolves(null);

      await turnoController.atenderTurno(req, res, next);

      expect(res.status.calledWith(404)).to.be.true;
      expect(res.status().json.calledWith({ error: 'No hay turnos llamados' })).to.be.true;
    });

    it('debería llamar a next con el error si ocurre una excepción', async () => {
      const error = new Error('DB Error');
      sinon.stub(Turno, 'findOne').rejects(error);

      await turnoController.atenderTurno(req, res, next);

      expect(next.calledWith(error)).to.be.true;
    });
  });

  describe('finalizarTurno', () => {
    it('debería finalizar y eliminar el turno que está siendo atendido', async () => {
      const turno = {
        estado: 'atendiendo',
        get: () => ({ codigo: 'E5F6', nombre: 'Pedro' }),
        destroy: sinon.stub()
      };
      sinon.stub(Turno, 'findOne').resolves(turno);

      await turnoController.finalizarTurno(req, res, next);

      expect(turno.destroy.calledOnce).to.be.true;
      expect(req.io.emit.calledWith('nuevoTurno', sinon.match({ mensaje: 'Turno finalizado y eliminado' }))).to.be.true;
      expect(res.json.calledWith(sinon.match({ mensaje: 'Turno eliminado correctamente' }))).to.be.true;
    });

    it('debería devolver error si no hay turnos atendiendo', async () => {
      sinon.stub(Turno, 'findOne').resolves(null);

      await turnoController.finalizarTurno(req, res, next);

      expect(res.status.calledWith(404)).to.be.true;
      expect(res.status().json.calledWith({ error: 'No hay turnos atendiendo' })).to.be.true;
    });

    it('debería llamar a next con el error si ocurre una excepción', async () => {
      const error = new Error('DB Error');
      sinon.stub(Turno, 'findOne').rejects(error);

      await turnoController.finalizarTurno(req, res, next);

      expect(next.calledWith(error)).to.be.true;
    });
  });

  describe('obtenerEstadoPanel', () => {
    it('debería devolver el estado atendiendo si hay un turno atendiendo', async () => {
      const turnoAtendiendo = { estado: 'atendiendo' };
      sinon.stub(Turno, 'findOne').resolves(turnoAtendiendo);

      await turnoController.obtenerEstadoPanel(req, res, next);

      expect(res.json.calledWith({ estado: 'atendiendo', turnoActual: turnoAtendiendo })).to.be.true;
    });

    it('debería devolver el estado llamado si hay un turno llamado', async () => {
      const turnoLlamado = { estado: 'llamado' };
      sinon.stub(Turno, 'findOne')
        .onFirstCall().resolves(null)
        .onSecondCall().resolves(turnoLlamado);

      await turnoController.obtenerEstadoPanel(req, res, next);

      expect(res.json.calledWith({ estado: 'llamado', turnoActual: turnoLlamado })).to.be.true;
    });

    it('debería devolver el estado espera si hay turnos en espera', async () => {
      sinon.stub(Turno, 'findOne')
        .onFirstCall().resolves(null)
        .onSecondCall().resolves(null)
        .onThirdCall().resolves({ estado: 'en espera' });

      await turnoController.obtenerEstadoPanel(req, res, next);

      expect(res.json.calledWith({ estado: 'espera', turnoActual: null })).to.be.true;
    });

    it('debería devolver el estado sin_turnos si no hay turnos', async () => {
      sinon.stub(Turno, 'findOne').resolves(null);

      await turnoController.obtenerEstadoPanel(req, res, next);

      expect(res.json.calledWith({ estado: 'sin_turnos', turnoActual: null })).to.be.true;
    });

    it('debería llamar a next con el error si ocurre una excepción', async () => {
      const error = new Error('DB Error');
      sinon.stub(Turno, 'findOne').rejects(error);

      await turnoController.obtenerEstadoPanel(req, res, next);

      expect(next.calledWith(error)).to.be.true;
    });
  });
});
