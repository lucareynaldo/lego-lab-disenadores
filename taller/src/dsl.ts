// API para escribir un modelo como script sin coordenadas a mano.
//
//   const m = new Modelo('arbol');
//   const tronco = m.sub('tronco');                                   // un submodelo = un sub-armado
//   const base = tronco.poner('3005', 'Reddish_Brown');               // en el origen del submodelo
//   tronco.poner('3005', 'Reddish_Brown', {sobre: base, stud: [0, 0], giro: 90});  // anti-stud (0,0) sobre stud (0,0)
//   tronco.poner('3024', 'Green', {debajo: base, antistud: [0, 0]});  // stud (0,0) dentro del anti-stud (0,0)
//   tronco.poner('4274', 'Light_Bluish_Grey', {conector: {de: base, n: 7}, propio: 3});   // índices de `piezas ver`
//   tronco.poner('2417', 'Green', {en: grilla(0, 9, 1), rot: 'X90 Y45'});                  // libre
//   tronco.paso('el tronco');                                         // etiqueta del paso (optativa)
//   m.raiz.colocar(tronco);  m.raiz.paso();
//   m.guardar();                                                      // modelo.mpd + modelo.mapa.json
//
// Grilla: stud (i, j) con i en +X y j en +Z, desde la esquina de menor X y Z (`con` elige el anti-stud o
// stud propio, por defecto (0,0)). `giro`: 0/90/180/270 alrededor del eje del conector. Unidades: 1 stud =
// 20 LDU, 1 placa = 8, −Y es arriba. `rot`: giros por eje en grados, de izquierda a derecha.
//
// Sub-armados encastrados: `colocar` acepta las mismas formas que `poner` (sobre/stud, debajo/antistud,
// conector/propio) más `ancla`, la pieza del sub-armado que hace el encastre. La pieza base puede estar en
// el submodelo o dentro de un sub-armado ya colocado en él; si ese sub-armado está colocado más de una vez,
// se elige cuál con la colocación que devuelve `colocar`:
//
//   const t = m.raiz.colocar(tronco, {sobre: suelo, stud: [3, 3], ancla: base});
//   m.raiz.colocar(copa, {sobre: t.pieza(punta), stud: [0, 0], ancla: centro, con: [1, 1]});
//
// Notas de armado (optativas, LDraw las ignora): `paso('etiqueta', {vista})` escribe `0 // PASO: etiqueta`
// y, con `vista` ('atras', 'debajo' o [x, y, z] en grados), `0 ROTSTEP` (el constructor gira el modelo:
// el verificador cambia qué es "abajo"). `revelar()` marca el paso en curso como la revelación
// (`0 // REVELAR`): el verificador avisa si no queda al final.

import {writeFileSync} from 'node:fs';
import {basename, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import type {Transform, Vec3} from '../../verificador/src/matematica.ts';
import {componer, IDENTIDAD, invertirRigida} from '../../verificador/src/matematica.ts';
import {esPieza} from '../../verificador/src/ldraw.ts';
import type {Color} from './colores.ts';
import {colorDe} from './colores.ts';
import {encastrar, limpiar, parsearRot} from './encastre.ts';
import {biblioteca} from './entorno.ts';
import {archivoDe, conectoresPieza, ficha, puntoGrilla} from './ficha.ts';

export const grilla = (x: number, capas: number, z: number): Vec3 => [20 * x, -8 * capas, 20 * z];

const ESTE_ARCHIVO = fileURLToPath(import.meta.url);

// "archivo.ts:línea" de quien llamó a la API (el script de diseño).
function llamador(): string {
	for (const l of (new Error().stack ?? '').split('\n').slice(1)) {
		const m = l.match(/\(?(?:file:\/\/\/?)?([^()\s]+?):(\d+):\d+\)?$/);
		if (!m) continue;
		const ruta = decodeURIComponent(m[1]);
		if (ruta.startsWith('node:') || resolve(ruta) === ESTE_ARCHIVO) continue;
		return `${basename(ruta)}:${m[2]}`;
	}
	return '?';
}

const conOrigen = <T>(origen: string, f: () => T): T => {
	try {
		return f();
	} catch (e) {
		throw new Error(`${origen}: ${(e as Error).message}`);
	}
};

const sanear = (s: string) => s.trim().toLowerCase().replace(/[^a-z0-9_-]+/g, '-').replace(/^-+|-+$/g, '') || 'sub';

// Una pieza vista desde un submodelo: la pieza misma, si está en él, o una `Referencia` (`c.pieza(p)`).
export type Base = PiezaColocada | Referencia;

type Encastre = {
	sobre?: Base;
	stud?: [number, number];
	debajo?: Base;
	antistud?: [number, number];
	con?: [number, number];
	giro?: number;
	conector?: {de: Base; n: number};
	propio?: number;
};

export type Opciones = Encastre & {nombre?: string; en?: Vec3; rot?: string};
export type OpcionesColocar = Encastre & {en?: Vec3; rot?: string; ancla?: Base};

export type Vista = 'atras' | 'debajo' | Vec3;
const VISTAS: Record<string, Vec3> = {atras: [0, 180, 0], debajo: [180, 0, 0]};

// Sin parameter properties: erasableSyntaxOnly (y el type stripping de Node) no los admiten.
export class PiezaColocada {
	readonly archivo: string;
	readonly color: Color;
	readonly tr: Transform;
	readonly origen: string;
	readonly sub: Submodelo;
	readonly nombre?: string;
	constructor(archivo: string, color: Color, tr: Transform, origen: string, sub: Submodelo, nombre?: string) {
		this.archivo = archivo;
		this.color = color;
		this.tr = tr;
		this.origen = origen;
		this.sub = sub;
		this.nombre = nombre;
	}
}

// Una pieza de un sub-armado colocado, con su ubicación en el sistema del submodelo `en`.
export class Referencia {
	readonly pieza: PiezaColocada;
	readonly tr: Transform;
	readonly en: Submodelo;
	constructor(pieza: PiezaColocada, tr: Transform, en: Submodelo) {
		this.pieza = pieza;
		this.tr = tr;
		this.en = en;
	}
	get archivo() {
		return this.pieza.archivo;
	}
}

// Lo que devuelve `colocar`: un sub-armado en un lugar del padre.
export class Colocacion {
	readonly sub: Submodelo;
	readonly tr: Transform;
	readonly origen: string;
	readonly padre: Submodelo;
	constructor(sub: Submodelo, tr: Transform, origen: string, padre: Submodelo) {
		this.sub = sub;
		this.tr = tr;
		this.origen = origen;
		this.padre = padre;
	}
	// La pieza `p` del sub-armado (o de uno colocado dentro de él), vista desde el padre.
	pieza(p: Base): Referencia {
		return conOrigen(llamador(), () => {
			const pieza = p instanceof Referencia ? p.pieza : p;
			return new Referencia(pieza, componer(this.tr, this.sub.poseDe(p)), this.padre);
		});
	}
}

type Item = {tipo: 'pieza'; p: PiezaColocada} | {tipo: 'sub'; c: Colocacion};
type Paso = {items: Item[]; etiqueta?: {texto: string; origen: string}; vista?: Vec3; revelar?: string};

const fmt = (n: number) => {
	const r = Number(n.toFixed(6));
	return Object.is(r, -0) ? '0' : String(r);
};
const lineaRef = (color: number, tr: Transform, archivo: string) => `1 ${color} ${[...tr.t, ...tr.r].map(fmt).join(' ')} ${archivo}`;

// `rotSinEn`: colocar admite `rot` solo (gira el sub-armado en el origen).
function validarForma(op: Encastre & {en?: Vec3; rot?: string}, rotSinEn = false) {
	const formas = [op.en, op.sobre, op.debajo, op.conector].filter((x) => x !== undefined).length;
	if (formas > 1) throw new Error('usá una sola forma de ubicar: en, sobre, debajo o conector');
	if (op.sobre && !op.stud) throw new Error('con "sobre" hay que indicar stud: [i, j]');
	if (op.debajo && !op.antistud) throw new Error('con "debajo" hay que indicar antistud: [i, j]');
	if (op.conector && op.propio === undefined) throw new Error('con "conector" hay que indicar propio: <n>');
	if (op.stud && !op.sobre) throw new Error('stud sin "sobre"');
	if (op.antistud && !op.debajo) throw new Error('antistud sin "debajo"');
	if (op.propio !== undefined && !op.conector) throw new Error('propio sin "conector"');
	if (op.con && !op.sobre && !op.debajo) throw new Error('con sin "sobre" ni "debajo"');
	if (op.rot !== undefined && !op.en && (!rotSinEn || formas > 0)) throw new Error('rot sin "en"');
	if (op.giro !== undefined && !op.sobre && !op.debajo && !op.conector) throw new Error('giro sin "sobre", "debajo" ni "conector"');
	if (op.giro !== undefined && (op.sobre || op.debajo) && ![0, 90, 180, 270].includes(op.giro)) throw new Error('giro debe ser 0, 90, 180 o 270');
}

function vistaDe(v: Vista): Vec3 {
	if (typeof v === 'string') {
		const r = VISTAS[v];
		if (!r) throw new Error(`vista desconocida: "${v}" (se espera 'atras', 'debajo' o [x, y, z] en grados)`);
		return r;
	}
	if (!Array.isArray(v) || v.length !== 3 || !v.every(Number.isFinite)) throw new Error('vista: se espera [x, y, z] en grados');
	return v;
}

export class Submodelo {
	readonly nombre: string;
	readonly archivo: string;
	private pasos: Paso[] = [];
	private actual: Item[] = [];
	private revelarActual?: string; // origen de revelar() para el paso en curso
	colocado = false;

	constructor(nombre: string) {
		this.nombre = nombre;
		this.archivo = `${nombre}.ldr`;
	}

	poner(id: string, color: string | number, op: Opciones = {}): PiezaColocada {
		const origen = llamador();
		return conOrigen(origen, () => {
			const bib = biblioteca();
			const archivo = archivoDe(id);
			const a = bib.archivo(archivo);
			if (!a || !esPieza(a)) throw new Error(`pieza inexistente: ${id}`);
			validarForma(op);
			const tr = this.encastre(archivo, op) ?? (op.en ? limpiar({r: parsearRot(op.rot ?? ''), t: op.en}) : IDENTIDAD);
			const p = new PiezaColocada(archivo, colorDe(bib, color), tr, origen, this, op.nombre);
			this.actual.push({tipo: 'pieza', p});
			return p;
		});
	}

	// Dónde iría la pieza `archivo` (en este submodelo) para encastrar según `op`; null si `op` no encastra.
	private encastre(archivo: string, op: Encastre): Transform | null {
		const bib = biblioteca();
		if (op.sobre && op.stud) {
			const base = puntoGrilla(ficha(bib, op.sobre.archivo).studs, op.stud, 'stud');
			const propio = puntoGrilla(ficha(bib, archivo).antistuds, op.con ?? [0, 0], 'anti-stud');
			return encastrar(this.poseDe(op.sobre), conectoresPieza(bib, op.sobre.archivo)[base.n], conectoresPieza(bib, archivo)[propio.n], op.giro ?? 0);
		}
		if (op.debajo && op.antistud) {
			const base = puntoGrilla(ficha(bib, op.debajo.archivo).antistuds, op.antistud, 'anti-stud');
			const propio = puntoGrilla(ficha(bib, archivo).studs, op.con ?? [0, 0], 'stud');
			return encastrar(this.poseDe(op.debajo), conectoresPieza(bib, op.debajo.archivo)[base.n], conectoresPieza(bib, archivo)[propio.n], op.giro ?? 0);
		}
		if (op.conector && op.propio !== undefined) {
			const cb = conectoresPieza(bib, op.conector.de.archivo)[op.conector.n];
			const cn = conectoresPieza(bib, archivo)[op.propio];
			if (!cb) throw new Error(`conector ${op.conector.n} inexistente en ${op.conector.de.archivo}`);
			if (!cn) throw new Error(`conector ${op.propio} inexistente en ${archivo}`);
			return encastrar(this.poseDe(op.conector.de), cb, cn, op.giro ?? 0);
		}
		return null;
	}

	// Ubicaciones de la pieza en el sistema de este submodelo: puesta acá o dentro de sub-armados colocados.
	private poses(p: PiezaColocada): Transform[] {
		const out: Transform[] = [];
		for (const it of [...this.pasos.flatMap((x) => x.items), ...this.actual]) {
			if (it.tipo === 'pieza') {
				if (it.p === p) out.push(p.tr);
			} else for (const t of it.c.sub.poses(p)) out.push(componer(it.c.tr, t));
		}
		return out;
	}

	// Ubicación de una pieza en el sistema de este submodelo. Una pieza suelta tiene que aparecer una sola vez
	// (si su sub-armado está colocado varias veces, se elige con `colocacion.pieza(p)`).
	poseDe(x: Base): Transform {
		if (x instanceof Referencia) {
			if (x.en !== this) throw new Error(`la referencia a ${x.archivo} es del submodelo "${x.en.nombre}", no de "${this.nombre}"`);
			return x.tr;
		}
		const poses = this.poses(x);
		if (poses.length === 1) return poses[0];
		if (poses.length === 0)
			throw new Error(
				`la pieza ${x.archivo} está en otro submodelo (${x.sub.nombre}) que no está colocado en "${this.nombre}": colocalo antes, o encastrá dentro del mismo sub-armado`,
			);
		throw new Error(
			`la pieza ${x.archivo} de "${x.sub.nombre}" aparece ${poses.length} veces en "${this.nombre}" (el sub-armado está colocado más de una vez): guardá la colocación (const c = ${this.nombre}.colocar(…)) y usá c.pieza(…)`,
		);
	}

	contiene(otro: Submodelo): boolean {
		return [...this.pasos.flatMap((x) => x.items), ...this.actual].some((it) => it.tipo === 'sub' && (it.c.sub === otro || it.c.sub.contiene(otro)));
	}

	colocar(sub: Submodelo, op: OpcionesColocar = {}): Colocacion {
		const origen = llamador();
		if (sub === this || sub.contiene(this)) throw new Error(`${origen}: ciclo: ${sub.nombre} no puede ir dentro de ${this.nombre}`);
		const tr = conOrigen(origen, () => {
			validarForma(op, true);
			const encastra = op.sobre ?? op.debajo ?? op.conector;
			if (encastra && !op.ancla) throw new Error('para encastrar un sub-armado hay que indicar ancla: <pieza del sub-armado que encastra>');
			if (op.ancla && !encastra) throw new Error('ancla sin "sobre", "debajo" ni "conector"');
			if (!op.ancla) return limpiar({r: parsearRot(op.rot ?? ''), t: op.en ?? [0, 0, 0]});
			// La ancla tiene que quedar donde quedaría encastrada como pieza suelta: colocación ∘ pose = encastre.
			const ancla = sub.poseDe(op.ancla);
			return limpiar(componer(this.encastre(op.ancla.archivo, op)!, invertirRigida(ancla)));
		});
		sub.colocado = true;
		const c = new Colocacion(sub, tr, origen, this);
		this.actual.push({tipo: 'sub', c});
		return c;
	}

	// Cierra el paso. `etiqueta`: qué se arma (mejor la función que la apariencia: "raíces", "copa").
	paso(etiqueta?: string, op: {vista?: Vista} = {}): void {
		const origen = llamador();
		conOrigen(origen, () => {
			const texto = etiqueta?.trim();
			if (etiqueta !== undefined && !texto) throw new Error('etiqueta vacía');
			if (texto && /[\r\n]/.test(texto)) throw new Error('la etiqueta tiene que ser de una línea');
			const vista = op.vista === undefined ? undefined : vistaDe(op.vista);
			if (this.actual.length === 0) {
				if (texto || vista || this.revelarActual) throw new Error('paso vacío: no hay piezas nuevas desde el paso anterior');
				return;
			}
			this.pasos.push({items: this.actual, etiqueta: texto ? {texto, origen} : undefined, vista, revelar: this.revelarActual});
			this.actual = [];
			this.revelarActual = undefined;
		});
	}

	// Marca el paso en curso (el que cierra el próximo `paso()`) como la revelación del modelo.
	revelar(): void {
		this.revelarActual = llamador();
	}

	// Líneas del bloque (sin "0 FILE") y mapa línea → origen, con la numeración de pasosDe (1 = primera).
	lineas(): {lineas: string[]; mapa: [number, string][]} {
		const lineas = [`0 ${this.nombre}`, `0 Name: ${this.archivo}`, '0 Author: taller'];
		const mapa: [number, string][] = [];
		if (this.revelarActual && this.actual.length === 0) throw new Error(`${this.revelarActual}: revelar() sin piezas después: llamalo antes de cerrar el paso`);
		const pasos = this.actual.length > 0 ? [...this.pasos, {items: this.actual, revelar: this.revelarActual}] : this.pasos;
		let girado = false;
		for (const paso of pasos) {
			for (const it of paso.items) {
				if (it.tipo === 'pieza') {
					lineas.push(lineaRef(it.p.color.codigo, it.p.tr, it.p.archivo));
					mapa.push([lineas.length, it.p.nombre ? `${it.p.origen} (${it.p.nombre})` : it.p.origen]);
				} else {
					lineas.push(lineaRef(16, it.c.tr, it.c.sub.archivo));
					mapa.push([lineas.length, `${it.c.origen} (${it.c.sub.nombre})`]);
				}
			}
			if (paso.etiqueta) {
				lineas.push(`0 // PASO: ${paso.etiqueta.texto}`);
				mapa.push([lineas.length, paso.etiqueta.origen]);
			}
			if (paso.revelar) {
				lineas.push('0 // REVELAR');
				mapa.push([lineas.length, paso.revelar]);
			}
			// ROTSTEP vale hasta el próximo ROTSTEP en otros visores: se vuelve a la vista normal con END.
			if (paso.vista) lineas.push(`0 ROTSTEP ${paso.vista.map(fmt).join(' ')} ABS`);
			else lineas.push(girado ? '0 ROTSTEP END' : '0 STEP');
			girado = paso.vista !== undefined;
		}
		return {lineas, mapa};
	}
}

export class Modelo {
	readonly nombre: string;
	readonly raiz: Submodelo;
	private subs = new Map<string, Submodelo>();

	constructor(nombre: string) {
		this.nombre = sanear(nombre);
		this.raiz = new Submodelo(this.nombre);
	}

	sub(nombre: string): Submodelo {
		const n = sanear(nombre);
		if (this.subs.has(n) || n === this.nombre) throw new Error(`${llamador()}: el submodelo "${n}" ya existe`);
		const s = new Submodelo(n);
		this.subs.set(n, s);
		return s;
	}

	texto(): {mpd: string; mapa: Record<string, string>} {
		const out: string[] = [];
		const mapa: Record<string, string> = {};
		for (const s of [this.raiz, ...this.subs.values()]) {
			if (s !== this.raiz && !s.colocado) console.error(`aviso: el submodelo "${s.nombre}" no se colocó en ningún lado`);
			const {lineas, mapa: m} = s.lineas();
			out.push(`0 FILE ${s.archivo}`, ...lineas, '0 NOFILE');
			for (const [n, origen] of m) mapa[`${s.archivo}:${n}`] = origen;
		}
		return {mpd: out.join('\n') + '\n', mapa};
	}

	guardar(ruta?: string): string {
		const destino = process.env.TALLER_SALIDA ?? ruta ?? 'modelo.mpd';
		const {mpd, mapa} = this.texto();
		writeFileSync(destino, mpd);
		writeFileSync(destino.replace(/\.mpd$/i, '') + '.mapa.json', JSON.stringify(mapa, null, 1));
		return destino;
	}
}
