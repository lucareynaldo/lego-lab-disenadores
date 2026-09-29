// Cerezo en flor (sakura). Ver ficha.md.
import {Modelo, grilla} from '../taller/src/dsl.ts';

type P = ReturnType<InstanceType<typeof Modelo>['raiz']['poner']>;
type S = InstanceType<typeof Modelo>['raiz'];

// ---------- utilidades ----------

// Ángulos "X a Y b Z c" de una matriz por filas (R = Rz·Ry·Rx, como parsearRot).
function euler(r: readonly number[]): string {
	const d = (x: number) => (x * 180) / Math.PI;
	const sb = -r[6];
	let a: number, b: number, c: number;
	if (Math.abs(sb) > 0.999999) {
		b = Math.sign(sb) * 90;
		a = d(Math.atan2(-r[5], r[4]));
		c = 0;
	} else {
		b = d(Math.asin(sb));
		a = d(Math.atan2(r[7], r[8]));
		c = d(Math.atan2(r[3], r[0]));
	}
	const f = (x: number) => Number(x.toFixed(4));
	return `X${f(a)} Y${f(b)} Z${f(c)}`;
}

// Registro de piezas con studs, para encastrar por posición y entre sub-armados.
type Reg = {p: P; studs: Map<string, number>};
const registro: Reg[] = [];
const clave = (x: number, z: number) => `${Math.round(x)},${Math.round(z)}`;
let nScratch = 0;

function fantasma(p: P): {s: S; g: P} {
	const s = new Modelo(`scratch${nScratch++}`).raiz;
	const g = s.poner(p.archivo, 'Black', {en: [...p.tr.t] as any, rot: euler(p.tr.r)});
	return {s, g};
}

function registrar(p: P): P {
	const {s, g} = fantasma(p);
	const studs = new Map<string, number>();
	for (let i = 0; i < 16; i++)
		for (let j = 0; j < 16; j++) {
			try {
				const q = s.poner('3024', 'Black', {sobre: g, stud: [i, j]});
				studs.set(clave(q.tr.t[0], q.tr.t[2]), q.tr.t[1] + 8);
			} catch {
				/* fuera de la grilla */
			}
		}
	if (studs.size) registro.push({p, studs});
	return p;
}

// Stud más alto en la posición global (I, J) de la grilla de la base (0..11, centro entre 5 y 6).
const W = (I: number) => -110 + 20 * I;
function studEn(I: number, J: number, bajoY = Infinity, exacta?: number): {p: P; i: number; j: number} {
	const k = clave(W(I), W(J));
	let mejor: Reg | undefined;
	let y = Infinity;
	for (const r of registro) {
		const yy = r.studs.get(k);
		if (exacta !== undefined && (yy === undefined || Math.abs(yy - exacta) > 0.5)) continue;
		if (yy !== undefined && yy < y && yy < bajoY) {
			y = yy;
			mejor = r;
		}
	}
	if (!mejor) throw new Error(`no hay stud en (${I}, ${J})`);
	// índice local del stud
	const {s, g} = fantasma(mejor.p);
	for (let i = 0; i < 16; i++)
		for (let j = 0; j < 16; j++) {
			try {
				const q = s.poner('3024', 'Black', {sobre: g, stud: [i, j]});
				if (clave(q.tr.t[0], q.tr.t[2]) === k) return {p: mejor.p, i, j};
			} catch {
				/* */
			}
		}
	throw new Error('stud no encontrado');
}

type Op = {giro?: number; con?: [number, number]; nombre?: string; bajoY?: number; y?: number};

// Pone una pieza con su anti-stud `con` sobre el stud más alto en (I, J), aunque ese stud sea de otro sub-armado.
function pon(sub: S, id: string, color: string, I: number, J: number, op: Op = {}): P {
	const {p: base, i, j} = studEn(I, J, op.bajoY, op.y);
	if (op.giro !== undefined) op = {...op, giro: ((op.giro % 360) + 360) % 360};
	let p: P;
	if (base.sub === sub) {
		p = sub.poner(id, color, {sobre: base, stud: [i, j], giro: op.giro, con: op.con, nombre: op.nombre});
	} else {
		const {s, g} = fantasma(base);
		const q = s.poner(id, color, {sobre: g, stud: [i, j], giro: op.giro, con: op.con});
		p = sub.poner(id, color, {en: [...q.tr.t] as any, rot: euler(q.tr.r), nombre: op.nombre});
	}
	return registrar(p);
}

// Altura (y del plano de apoyo) del stud más alto en (I, J).
function alturaEn(I: number, J: number, bajoY = Infinity): number {
	const k = clave(W(I), W(J));
	let y = Infinity;
	for (const r of registro) {
		const yy = r.studs.get(k);
		if (yy !== undefined && yy < y && yy < bajoY) y = yy;
	}
	if (y === Infinity) throw new Error(`no hay stud en (${I}, ${J})`);
	return y;
}

// Como pon, pero la celda (I, J) del anti-stud `con` puede no tener stud debajo: se apoya a la altura y.
// Sirve para piezas que apoyan solo parte de su base; el validador confirma que queden encastradas.
function ponY(sub: S, id: string, color: string, I: number, J: number, y: number, op: Op = {}): P {
	const s = new Modelo(`scratch${nScratch++}`).raiz;
	const plano = s.poner('91405', 'Black', {en: [W(I) - 10, y, W(J) - 10] as any});
	const giro = op.giro === undefined ? undefined : ((op.giro % 360) + 360) % 360;
	const q = s.poner(id, color, {sobre: plano, stud: [8, 8], giro, con: op.con});
	return registrar(sub.poner(id, color, {en: [...q.tr.t] as any, rot: euler(q.tr.r), nombre: op.nombre}));
}

// Instancias de sub-armados: el sub se arma en una posición "canónica" lejana y se coloca con la pose que
// tendría su primera pieza encastrada en el stud más alto de (I, J).
type Instanciable = {sub: S; primera: P; piezas: P[]};
function instanciar(dest: S, inst: Instanciable, I: number, J: number, op: Op = {}) {
	const {p: base, i, j} = studEn(I, J, op.bajoY);
	const {s, g} = fantasma(base);
	const giro = op.giro === undefined ? undefined : ((op.giro % 360) + 360) % 360;
	const q = s.poner(inst.primera.archivo, 'Black', {sobre: g, stud: [i, j], giro, con: op.con});
	const R = q.tr.r as readonly number[];
	const t0 = inst.primera.tr.t as readonly number[];
	const ap = (r: readonly number[], v: readonly number[]) => [0, 1, 2].map((k) => r[3 * k] * v[0] + r[3 * k + 1] * v[1] + r[3 * k + 2] * v[2]);
	const Rt0 = ap(R, t0);
	const en = q.tr.t.map((x: number, k: number) => x - Rt0[k]);
	dest.colocar(inst.sub, {en: en as any, rot: euler(R)});
	// registrar las piezas de la instancia en coordenadas del modelo
	const mul = (a: readonly number[], b: readonly number[]) => [0, 1, 2].flatMap((f) => [0, 1, 2].map((c) => a[3 * f] * b[c] + a[3 * f + 1] * b[3 + c] + a[3 * f + 2] * b[6 + c]));
	for (const p of inst.piezas) {
		const t = ap(R, p.tr.t as any).map((x, k) => x + en[k]);
		registrar({archivo: p.archivo, tr: {r: mul(R, p.tr.r as any), t}, sub: null} as any);
	}
}

// Cuelga una pieza: su stud `con` entra en el anti-stud (i, j) de `base` (de cualquier sub-armado).
function colgar(dest: S, id: string, color: string, base: P, antistud: [number, number], op: Op = {}): P {
	const {s, g} = fantasma(base);
	const giro = op.giro === undefined ? undefined : ((op.giro % 360) + 360) % 360;
	const q = s.poner(id, color, {debajo: g, antistud, giro, con: op.con});
	return registrar(dest.poner(id, color, {en: [...q.tr.t] as any, rot: euler(q.tr.r), nombre: op.nombre}));
}

// ---------- modelo ----------

const m = new Modelo('cerezo');
const MADERA = 'Dark_Brown';
const ROSA = 'Bright_Pink';
const PASTO = 'Bright_Green';

// ===== BASE: tierra, pasto, camino de piedras y pétalos caídos =====
const base = m.sub('base');
for (const [x, z] of [[-3, -3], [3, -3], [-3, 3], [3, 3]]) registrar(base.poner('3958', 'Dark_Tan', {en: grilla(x, 0, z)}));
base.paso();
pon(base, '3031', PASTO, 4, 4);
pon(base, '30357', PASTO, 8, 8, {giro: 0});
pon(base, '30357', PASTO, 3, 8, {giro: 90});
pon(base, '30357', PASTO, 3, 3, {giro: 180});
pon(base, '30357', PASTO, 8, 3, {giro: 270});
pon(base, '3020', PASTO, 4, 1);
pon(base, '3710', PASTO, 4, 3);
pon(base, '3710', PASTO, 4, 8);
pon(base, '3020', PASTO, 4, 9);
pon(base, '3020', PASTO, 2, 4, {giro: 90});
pon(base, '3710', PASTO, 3, 4, {giro: 90});
pon(base, '3710', PASTO, 8, 4, {giro: 90});
pon(base, '3020', PASTO, 10, 4, {giro: 90});
base.paso();
// camino de piedras hacia el tronco y matas de pasto
const PASTO_Y = -8;
pon(base, '14769', 'Light_Bluish_Grey', 7, 1, {y: PASTO_Y});
pon(base, '14769', 'Light_Bluish_Grey', 9, 3, {y: PASTO_Y});
for (const [I, J] of [[2, 1], [10, 9], [1, 8]]) pon(base, '32607', 'Green', I, J, {y: PASTO_Y});
base.paso();
// ===== TRONCO: raíces, tronco en vaso y ramas (el árbol "en invierno") =====
const tronco = m.sub('tronco');
// raíces: dos placas cruzadas
pon(tronco, '3795', MADERA, 3, 5);
pon(tronco, '3795', MADERA, 6, 5, {giro: 90, con: [2, 0]});
tronco.paso();
// tronco con el ensanche de la base
pon(tronco, '3003', MADERA, 5, 5);
pon(tronco, '3040b', MADERA, 5, 3, {giro: 0});
pon(tronco, '3040b', MADERA, 8, 5, {giro: 90});
pon(tronco, '3040b', MADERA, 6, 8, {giro: 180});
pon(tronco, '3040b', MADERA, 3, 6, {giro: 270});
tronco.paso();
// la horqueta: cuatro pendientes invertidas en molinete
pon(tronco, '2449', MADERA, 5, 5, {giro: 270});
pon(tronco, '2449', MADERA, 6, 6, {giro: 90});
pon(tronco, '2449', MADERA, 6, 5, {giro: 0});
pon(tronco, '2449', MADERA, 5, 6, {giro: 180});
tronco.paso();
// ramas principales (oeste, este, sur, norte)
const RAMAS: P[] = [];
RAMAS.push(pon(tronco, '3460', MADERA, 5, 5, {giro: 180}));
RAMAS.push(pon(tronco, '3460', MADERA, 6, 6, {giro: 0}));
RAMAS.push(pon(tronco, '3460', MADERA, 6, 5, {giro: 270}));
RAMAS.push(pon(tronco, '3460', MADERA, 5, 6, {giro: 90}));
tronco.paso();
// ramas secundarias hacia las cuatro nubes, a alturas distintas
pon(tronco, '3666', MADERA, 6, 2, {giro: 180});
pon(tronco, '3666', MADERA, 8, 6, {giro: 270});
pon(tronco, '3710', MADERA, 5, 8, {giro: 0});
pon(tronco, '3710', MADERA, 2, 5, {giro: 90});
for (const [I, J, n] of [[8, 2, 1], [2, 8, 3], [8, 8, 4]]) for (let k = 0; k < n; k++) pon(tronco, '6141', MADERA, I, J);
tronco.paso();
// líder central que sostiene la nube de arriba
for (let k = 0; k < 3; k++) pon(tronco, '3003', MADERA, 5, 5);
tronco.paso();

// ===== NUBE (se arma una vez y se coloca cinco) =====
const nubeSub = m.sub('nube');
const N0 = 100;
const nubePiezas: P[] = [];
const poste = ponY(nubeSub, '3062b', MADERA, N0, N0, 0);
nubePiezas.push(poste);
nubePiezas.push(pon(nubeSub, '60474', ROSA, N0, N0, {con: [1, 1]}));
{
	const I = N0 - 2, J = N0 - 2;
	const y = alturaEn(I + 2, J + 2);
	// mitad izquierda (-X), después la derecha
	nubePiezas.push(ponY(nubeSub, '88293', ROSA, I, J + 2, y, {giro: 270}));
	nubePiezas.push(ponY(nubeSub, '88293', ROSA, I + 2, J + 5, y, {giro: 180}));
	nubeSub.paso();
	nubePiezas.push(ponY(nubeSub, '88293', ROSA, I + 3, J, y, {giro: 0}));
	nubePiezas.push(ponY(nubeSub, '88293', ROSA, I + 5, J + 3, y, {giro: 90}));
	// flores arriba
	for (const [k, c] of [[2, 'White'], [3, ROSA], [4, 'White'], [5, ROSA]] as [number, string][]) nubePiezas.push(nubeSub.poner('24866', c, {sobre: nubePiezas[k], stud: [0, 0]}));
	nubeSub.paso();
}
const NUBE: Instanciable = {sub: nubeSub, primera: poste, piezas: nubePiezas};

// ===== RAMILLETE (tallo de 6 puntas con flores) =====
const PUNTAS: [number[], number[], number][] = [
	[[-6.5, -10.0624, 0], [-0.5, -0.866025, 0], 25.5],
	[[3.25, -10.0624, 5.62866], [0.25, -0.866025, 0.433014], 25.5],
	[[-3.75853, -5.73657, -6.50965], [-0.469847, -0.342019, -0.813798], 24.5],
	[[3.25, -10.0624, -5.62866], [0.25, -0.866025, -0.433014], 25.5],
	[[-3.75853, -5.73657, 6.50965], [-0.469847, -0.342019, 0.813798], 24.5],
	[[7.51706, -5.73656, 0], [0.939693, -0.342019, 0], 24.5],
];
const ap3 = (r: readonly number[], v: readonly number[]) => [0, 1, 2].map((i) => r[3 * i] * v[0] + r[3 * i + 1] * v[1] + r[3 * i + 2] * v[2]);
// Flor 3742 en la punta k del tallo: el agujero de la flor abraza los últimos 4 LDU de la barra.
function flor(sub: S, tallo: P, k: number, color: string): P {
	const [b, e, L] = PUNTAS[k];
	const a = ap3(tallo.tr.r, e);
	const p = ap3(tallo.tr.r, b).map((x, i) => x + tallo.tr.t[i] + a[i] * (L - 4));
	const incl = (Math.acos(-a[1]) * 180) / Math.PI;
	const az = (Math.atan2(-a[2], a[0]) * 180) / Math.PI;
	return sub.poner('3742', color, {en: p as any, rot: `Z${incl.toFixed(3)} Y${az.toFixed(3)}`});
}
const COLORES_FLOR = ['White', ROSA, ROSA, 'White', ROSA, ROSA];
// Ramillete: placa con stud central, tallo de 6 puntas y una flor en cada punta.
function ramillete(dest: S, I: number, J: number, giro: number) {
	const jumper = pon(dest, '15573', MADERA, I, J, {con: [1, 0], giro});
	const tallo = dest.poner('19119', MADERA, {conector: {de: jumper, n: 4}, propio: 0});
	for (let k = 0; k < 6; k++) flor(dest, tallo, k, COLORES_FLOR[k]);
}

// ===== MODELO PRINCIPAL =====
m.raiz.colocar(base);
// pétalos caídos, más densos bajo la copa
const PETALOS: [number, number, string][] = [
	[2, 3, ROSA], [1, 6, 'White'], [3, 10, ROSA], [7, 10, 'White'], [10, 7, ROSA],
	[9, 6, 'White'], [4, 2, 'White'], [6, 9, ROSA], [0, 3, ROSA], [11, 10, 'White'],
];
for (const [I, J, c] of PETALOS) pon(m.raiz, '24866', c, I, J, {y: I === 0 || I === 11 || J === 0 || J === 11 ? 0 : PASTO_Y});
m.raiz.paso();

m.raiz.colocar(tronco);
// primavera: hojas rosas colgando de las puntas de las ramas
for (const [k, g] of [[0, 0], [1, 180], [2, 90], [3, 270]]) colgar(m.raiz, '2417', ROSA, RAMAS[k], [5, 0], {con: [2, 3], giro: g});
m.raiz.paso();
// ramilletes en flor en las puntas de las ramas, de a dos
ramillete(m.raiz, 0, 5, 90);
ramillete(m.raiz, 6, 0, 0);
m.raiz.paso();
ramillete(m.raiz, 11, 6, 90);
ramillete(m.raiz, 5, 11, 0);
m.raiz.paso();
// las nubes de flores: primero las de adelante (más bajas), después las de atrás
instanciar(m.raiz, NUBE, 2, 2);
instanciar(m.raiz, NUBE, 8, 2);
m.raiz.paso();
instanciar(m.raiz, NUBE, 2, 8);
instanciar(m.raiz, NUBE, 8, 8);
m.raiz.paso();
// la corona
instanciar(m.raiz, NUBE, 5, 5);
m.raiz.paso();
m.guardar();
