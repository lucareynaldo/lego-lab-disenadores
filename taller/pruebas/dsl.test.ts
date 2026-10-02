import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {mkdtempSync, readFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {test} from 'node:test';
import {verificar} from '../../verificador/src/verificar.ts';
import type {Transform} from '../../verificador/src/matematica.ts';
import {IDENTIDAD} from '../../verificador/src/matematica.ts';
import {grilla, Modelo} from '../src/dsl.ts';
import {nuevaBiblioteca} from '../src/entorno.ts';

function construirFixture(nombre: string) {
	const dir = mkdtempSync(join(tmpdir(), 'taller dsl '));
	const salida = join(dir, 'modelo.mpd');
	const r = spawnSync(process.execPath, ['--no-warnings', join(import.meta.dirname, 'fixtures', nombre)], {env: {...process.env, TALLER_SALIDA: salida}, encoding: 'utf8'});
	return {r, salida};
}

test('dos 3001 encastrados pasan el verificador sin errores ni avisos', () => {
	const {r, salida} = construirFixture('dos-ladrillos.ts');
	assert.equal(r.status, 0, r.stderr);
	const bib = nuevaBiblioteca();
	const principal = bib.cargarModelo(salida, 'modelo.mpd');
	assert.equal(principal, 'dos-ladrillos.ldr');
	const rep = verificar(bib, principal);
	assert.deepEqual(rep.hallazgos, []);
	assert.equal(rep.piezas, 2);
	const mapa = JSON.parse(readFileSync(salida.replace(/\.mpd$/, '.mapa.json'), 'utf8'));
	assert.match(Object.values(mapa).join('\n'), /dos-ladrillos\.ts:\d+ \(arriba\)/);
});

test('texto: cabecera, STEP y mapa con la numeración de pasosDe', () => {
	const m = new Modelo('x');
	const s = m.sub('s');
	s.poner('3001', 4, {en: grilla(0, 0, 0)});
	s.paso();
	m.raiz.colocar(s);
	const {mpd, mapa} = m.texto();
	const bloqueS = mpd.split('0 FILE s.ldr\n')[1].split('0 NOFILE')[0].split('\n');
	const clave = Object.keys(mapa).find((k) => k.startsWith('s.ldr:'))!;
	const n = Number(clave.split(':')[1]);
	assert.match(bloqueS[n - 1], /^1 4 0 0 0 1 0 0 0 1 0 0 0 1 3001\.dat$/);
	assert.ok(mpd.startsWith('0 FILE x.ldr\n'));
});

test('ids con mayúsculas y .dat; colores por nombre con espacios', () => {
	const m = new Modelo('x');
	const p = m.raiz.poner('3001.DAT', 'reddish brown');
	assert.equal(p.archivo, '3001.dat');
	assert.equal(p.color.codigo, 70);
});

test('errores con la línea del script', () => {
	const m = new Modelo('x');
	const a = m.raiz.poner('3001', 4);
	assert.throws(() => m.raiz.poner('3001', 4, {sobre: a, stud: [9, 9]}), /dsl\.test\.ts:\d+: stud \(9,9\) fuera de rango/);
	assert.throws(() => m.raiz.poner('noexiste', 4), /dsl\.test\.ts:\d+: pieza inexistente: noexiste/);
	const t = m.raiz.poner('3069b', 4, {en: [0, -24, 0]});
	assert.throws(() => m.raiz.poner('3001', 4, {sobre: t, stud: [0, 0]}), /no tiene studs/);
	assert.throws(() => m.raiz.poner('3001', 4, {sobre: a}), /hay que indicar stud/);
	assert.throws(() => m.raiz.poner('3001', 4, {sobre: a, stud: [0, 0], en: [0, 0, 0]}), /una sola forma/);
});

test('nombres saneados, duplicados y ciclos', () => {
	const m = new Modelo('x');
	const s = m.sub('Copa Alta');
	assert.equal(s.archivo, 'copa-alta.ldr');
	assert.throws(() => m.sub('copa alta'), /ya existe/);
	const t = m.sub('t');
	t.colocar(s);
	assert.throws(() => s.colocar(t), /ciclo/);
	assert.throws(() => s.colocar(s), /ciclo/);
});

test('sobre exige que la base esté en el submodelo o en un sub-armado colocado en él', () => {
	const m = new Modelo('x');
	const a = m.sub('a').poner('3001', 4);
	assert.throws(() => m.sub('b').poner('3001', 4, {sobre: a, stud: [0, 0]}), /otro submodelo/);
});

test('opciones huérfanas o incoherentes se rechazan', () => {
	const m = new Modelo('x');
	const a = m.raiz.poner('3001', 4);
	assert.throws(() => m.raiz.poner('3001', 4, {stud: [0, 0]}), /dsl\.test\.ts:\d+: stud sin "sobre"/);
	assert.throws(() => m.raiz.poner('3001', 4, {antistud: [0, 0]}), /antistud sin "debajo"/);
	assert.throws(() => m.raiz.poner('3001', 4, {propio: 0}), /propio sin "conector"/);
	assert.throws(() => m.raiz.poner('3001', 4, {con: [0, 0]}), /con sin/);
	assert.throws(() => m.raiz.poner('3001', 4, {rot: 'Y90'}), /rot sin "en"/);
	assert.throws(() => m.raiz.poner('3001', 4, {en: [0, 0, 0], giro: 90}), /giro sin/);
	assert.throws(() => m.raiz.poner('3001', 4, {sobre: a, stud: [0, 0], giro: 45}), /giro debe ser 0, 90, 180 o 270/);
});

test('con conector se admite cualquier giro', () => {
	const m = new Modelo('x');
	const a = m.raiz.poner('3001', 4);
	const b = m.raiz.poner('3001', 4, {conector: {de: a, n: 0}, propio: 0, giro: 45});
	assert.ok(b);
});

test('colocar con rot inválido lleva la línea del script', () => {
	const m = new Modelo('x');
	const s = m.sub('s');
	assert.throws(() => m.raiz.colocar(s, {rot: 'Q9'}), /dsl\.test\.ts:\d+: /);
});

// --- Sub-armados encastrados por conector ---

const cerca = (a: Transform, b: Transform) => [...a.r, ...a.t].every((x, i) => Math.abs(x - [...b.r, ...b.t][i]) < 1e-6);
const igualTr = (a: Transform, b: Transform) => assert.ok(cerca(a, b), `${JSON.stringify(a)} ≠ ${JSON.stringify(b)}`);

test('colocar por conector da lo mismo que la cuenta a mano de r18 (acacia)', () => {
	const m = new Modelo('acacia');
	const base = m.sub('base');
	const suelo = base.poner('91405', 'Tan');
	const flare = base.poner('60474', 'Dark_Brown', {sobre: suelo, stud: [7, 7], con: [1, 1]});
	base.paso();
	m.raiz.colocar(base);
	const tronco = m.sub('tronco');
	const pie = tronco.poner('3941', 'Reddish_Brown');
	let top = pie;
	for (let k = 0; k < 2; k++) top = tronco.poner('3941', 'Reddish_Brown', {sobre: top, stud: [0, 0]});
	const p1 = tronco.poner('3795', 'Reddish_Brown', {sobre: top, stud: [0, 0], con: [2, 0]});
	const rA = tronco.poner('3062b', 'Reddish_Brown', {sobre: p1, stud: [0, 0]});
	const rA2 = tronco.poner('3062b', 'Reddish_Brown', {sobre: rA, stud: [0, 0]});
	const p2 = tronco.poner('3832', 'Reddish_Brown', {sobre: rA2, stud: [0, 0], con: [2, 0]});
	const tipA = tronco.poner('3062b', 'Reddish_Brown', {sobre: p2, stud: [0, 0]});
	tronco.paso();
	const copa = m.sub('copa');
	const A = copa.poner('3029', 'Dark_Green');
	copa.paso();

	// Como lo hizo r18: una réplica auxiliar para sacar coordenadas y sumarlas.
	const aux = new Modelo('aux').raiz;
	const sueloA = aux.poner('91405', 'Tan');
	const flareA = aux.poner('60474', 'Dark_Brown', {sobre: sueloA, stud: [7, 7], con: [1, 1]});
	const t0 = aux.poner('3941', 'Reddish_Brown', {sobre: flareA, stud: [1, 1]});
	const t = t0.tr.t;
	const puntaA = aux.poner('3062b', 'Reddish_Brown', {en: [t[0] + tipA.tr.t[0], t[1] + tipA.tr.t[1], t[2] + tipA.tr.t[2]]});
	const anclaCopa = aux.poner('3029', 'Dark_Green', {sobre: puntaA, stud: [0, 0], con: [1, 1]});

	const ct = m.raiz.colocar(tronco, {sobre: flare, stud: [1, 1], ancla: pie});
	const cc = m.raiz.colocar(copa, {sobre: tipA, stud: [0, 0], ancla: A, con: [1, 1]});
	igualTr(ct.tr, {r: IDENTIDAD.r, t: t0.tr.t});
	igualTr(cc.tr, {r: IDENTIDAD.r, t: anclaCopa.tr.t});
	igualTr(ct.pieza(tipA).tr, puntaA.tr);
});

test('la ancla queda donde quedaría como pieza suelta, también girada y fuera del origen', () => {
	for (const giro of [0, 90, 180, 270]) {
		const m = new Modelo('x');
		const base = m.raiz.poner('3001', 4);
		const s = m.sub('s');
		s.poner('3001', 1);
		const ancla = s.poner('3022', 2, {debajo: s.poner('3001', 1, {en: grilla(3, 0, 1)}), antistud: [1, 0]});
		const c = m.raiz.colocar(s, {sobre: base, stud: [2, 0], ancla, con: [0, 1], giro});
		const suelta = m.raiz.poner('3022', 2, {sobre: base, stud: [2, 0], con: [0, 1], giro});
		igualTr(c.pieza(ancla).tr, suelta.tr);
	}
	const m = new Modelo('x');
	const base = m.raiz.poner('3001', 4);
	const s = m.sub('s');
	const ancla = s.poner('3001', 1, {en: grilla(1, 3, 2), rot: 'Y90'});
	const c = m.raiz.colocar(s, {conector: {de: base, n: 0}, ancla, propio: 0, giro: 45});
	igualTr(c.pieza(ancla).tr, m.raiz.poner('3001', 1, {conector: {de: base, n: 0}, propio: 0, giro: 45}).tr);
	igualTr(m.raiz.poseDe(ancla), c.pieza(ancla).tr);
});

test('debajo/antistud con ancla; sub-armados anidados con referencias', () => {
	const m = new Modelo('x');
	const techo = m.raiz.poner('3001', 4, {en: grilla(0, 9, 0)});
	const rama = m.sub('rama');
	const r0 = rama.poner('3001', 1);
	const hoja = m.sub('hoja');
	const h0 = hoja.poner('3024', 2);
	const ch = rama.colocar(hoja, {sobre: r0, stud: [1, 1], ancla: h0});
	const cr = m.raiz.colocar(rama, {debajo: techo, antistud: [0, 0], ancla: r0});
	igualTr(cr.tr, m.raiz.poner('3001', 1, {debajo: techo, antistud: [0, 0]}).tr);
	const desdeRaiz = cr.pieza(ch.pieza(h0));
	igualTr(desdeRaiz.tr, m.raiz.poseDe(h0));
	assert.throws(() => m.raiz.poseDe(ch.pieza(h0)), /es del submodelo "rama"/);
});

test('sub-armado colocado dos veces: la pieza suelta es ambigua; la referencia, no', () => {
	const m = new Modelo('x');
	const base = m.raiz.poner('3001', 4);
	const ala = m.sub('ala');
	const a0 = ala.poner('3001', 1);
	const izq = m.raiz.colocar(ala, {sobre: base, stud: [0, 0], ancla: a0});
	m.raiz.poner('3001', 4, {sobre: a0, stud: [0, 0]}); // colocado una sola vez: vale la pieza suelta
	const der = m.raiz.colocar(ala, {sobre: base, stud: [2, 0], ancla: a0});
	assert.throws(() => m.raiz.poner('3001', 4, {sobre: a0, stud: [0, 0]}), /dsl\.test\.ts:\d+: .*aparece 2 veces en "x".*c\.pieza/);
	const arriba = m.raiz.poner('3001', 4, {sobre: der.pieza(a0), stud: [0, 0]});
	assert.ok(!cerca(izq.tr, der.tr));
	igualTr(arriba.tr, m.raiz.poner('3001', 4, {sobre: m.raiz.poner('3001', 1, {sobre: base, stud: [2, 0]}), stud: [0, 0]}).tr);
});

test('colocar: ancla obligatoria con encastre, y solo con encastre', () => {
	const m = new Modelo('x');
	const base = m.raiz.poner('3001', 4);
	const s = m.sub('s');
	const a = s.poner('3001', 1);
	assert.throws(() => m.raiz.colocar(s, {sobre: base, stud: [0, 0]}), /dsl\.test\.ts:\d+: .*ancla/);
	assert.throws(() => m.raiz.colocar(s, {ancla: a}), /ancla sin/);
	assert.throws(() => m.raiz.colocar(s, {sobre: base, stud: [0, 0], ancla: base}), /otro submodelo/);
	assert.throws(() => m.raiz.colocar(s, {sobre: base, stud: [0, 0], ancla: a, rot: 'Y90'}), /rot sin "en"/);
	m.raiz.colocar(s, {rot: 'Y90'}); // como antes: girado en el origen
});

// --- Notas de armado ---

test('paso con etiqueta, vista y revelación; el mapa apunta a la línea del script', () => {
	const m = new Modelo('x');
	const s = m.sub('s');
	s.poner('3001', 4);
	s.paso('la base');
	s.poner('3001', 4, {en: grilla(0, 3, 0)});
	s.paso('por abajo', {vista: 'debajo'});
	s.poner('3001', 4, {en: grilla(0, 6, 0)});
	s.revelar();
	s.paso();
	m.raiz.colocar(s);
	const {mpd, mapa} = m.texto();
	const bloque = mpd.split('0 FILE s.ldr\n')[1].split('0 NOFILE')[0].trim().split('\n');
	assert.deepEqual(bloque.filter((l) => l.startsWith('0 ') && !/^0 (s|Name:|Author:)/.test(l)), [
		'0 // PASO: la base',
		'0 STEP',
		'0 // PASO: por abajo',
		'0 ROTSTEP 180 0 0 ABS',
		'0 // REVELAR',
		'0 ROTSTEP END',
	]);
	const n = bloque.indexOf('0 // REVELAR') + 1;
	assert.match(mapa[`s.ldr:${n}`], /^dsl\.test\.ts:\d+$/);
	assert.match(mpd.split('0 FILE x.ldr\n')[1], /^0 x\n0 Name: x\.ldr\n0 Author: taller\n1 16 [^\n]+\n0 STEP\n0 NOFILE/);
});

test('notas mal usadas se rechazan con la línea del script', () => {
	const m = new Modelo('x');
	const s = m.sub('s');
	assert.throws(() => s.paso('nada'), /dsl\.test\.ts:\d+: paso vacío/);
	s.poner('3001', 4);
	assert.throws(() => s.paso('  '), /etiqueta vacía/);
	assert.throws(() => s.paso('a\nb'), /una línea/);
	assert.throws(() => s.paso('a', {vista: 'arriba' as 'atras'}), /vista desconocida/);
	s.paso('ok', {vista: [0, 90, 0]});
	s.poner('3001', 4, {en: grilla(0, 3, 0)});
	s.paso();
	s.revelar();
	m.raiz.colocar(s);
	assert.throws(() => m.texto(), /dsl\.test\.ts:\d+: revelar\(\) sin piezas después/);
});
