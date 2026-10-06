// Notas de armado del diseñador: del DSL al .mpd, de ahí a pasosDe y al aviso intencion-revelar.

import assert from 'node:assert/strict';
import {mkdtempSync, readFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {test} from 'node:test';
import {pasosDe} from '../../verificador/src/ldraw.ts';
import {verificar} from '../../verificador/src/verificar.ts';
import {grilla, Modelo} from '../src/dsl.ts';
import {nuevaBiblioteca} from '../src/entorno.ts';

function guardar(m: Modelo) {
	const ruta = join(mkdtempSync(join(tmpdir(), 'taller intencion ')), 'modelo.mpd');
	m.guardar(ruta);
	const bib = nuevaBiblioteca();
	return {bib, principal: bib.cargarModelo(ruta, 'modelo.mpd'), ruta};
}

test('pasosDe lee etiqueta y revelación', () => {
	const m = new Modelo('x');
	m.raiz.poner('3001', 4);
	m.raiz.paso('la base');
	m.raiz.poner('3001', 4, {en: grilla(0, 3, 0)});
	m.raiz.revelar();
	m.raiz.paso('el techo');
	const {bib, principal} = guardar(m);
	const pasos = pasosDe(bib.archivo(principal)!);
	assert.deepEqual(
		pasos.map((p) => [p.etiqueta, p.revelar !== undefined, p.refs.length]),
		[
			['la base', false, 1],
			['el techo', true, 1],
		],
	);
});

test('intencion-revelar: la revelación lejos del final da un aviso con la línea del script', () => {
	for (const [k, avisa] of [
		[0, true],
		[3, false],
	] as const) {
		const m = new Modelo('torre');
		let abajo = m.raiz.poner('3001', 4);
		for (let i = 0; i < 4; i++) {
			if (i > 0) abajo = m.raiz.poner('3001', 4, {sobre: abajo, stud: [0, 0]});
			if (i === k) m.raiz.revelar();
			m.raiz.paso();
		}
		const {bib, principal, ruta} = guardar(m);
		const mapa = JSON.parse(readFileSync(ruta.replace(/\.mpd$/, '.mapa.json'), 'utf8'));
		const avisos = verificar(bib, principal).hallazgos.filter((h) => h.regla === 'intencion-revelar');
		assert.equal(avisos.length, avisa ? 1 : 0, `revelación en el paso ${k + 1}`);
		if (avisa) assert.match(mapa[avisos[0].piezas![0]], /^intencion\.test\.ts:\d+$/);
	}
});
