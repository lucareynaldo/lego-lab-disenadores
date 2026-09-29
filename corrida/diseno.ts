// Cerezo en flor (sakura, tipo 'Kanzan', forma en vaso).
import {Modelo, grilla} from '../taller/src/dsl.ts';

type Sub = ReturnType<Modelo['sub']>;
type Pieza = ReturnType<Sub['poner']>;
type Tr = {r: number[]; t: number[]};

// ---------- utilidades: ubicar un submodelo donde encastraría su pieza raíz ----------
// Se arma una copia descartable del sub-armado de destino, se encastra ahí la pieza raíz del submodelo
// que se quiere colocar y se lee su transformación. Así ningún submodelo se ubica con coordenadas a mano.
const sonda = new Modelo('sonda');
let nSonda = 0;
function sondear(construir: (s: Sub) => Pieza, id: string, color: string, op: object): Tr {
	const s = sonda.sub(`s${nSonda++}`);
	const ref = construir(s);
	const p = s.poner(id, color, {...op, sobre: ref} as never);
	return {r: [...p.tr.r], t: [...p.tr.t]};
}
const mulR = (a: number[], b: number[]) => [0, 1, 2].flatMap((i) => [0, 1, 2].map((j) => a[3 * i] * b[j] + a[3 * i + 1] * b[3 + j] + a[3 * i + 2] * b[6 + j]));
const mulV = (a: number[], v: number[]) => [0, 1, 2].map((i) => a[3 * i] * v[0] + a[3 * i + 1] * v[1] + a[3 * i + 2] * v[2]);
const componer = (a: Tr, b: Tr): Tr => ({r: mulR(a.r, b.r), t: mulV(a.r, b.t).map((x, i) => x + a.t[i])});
const rad = Math.PI / 180;
const rx = (a: number) => [1, 0, 0, 0, Math.cos(a), -Math.sin(a), 0, Math.sin(a), Math.cos(a)];
const ry = (a: number) => [Math.cos(a), 0, Math.sin(a), 0, 1, 0, -Math.sin(a), 0, Math.cos(a)];
const rz = (a: number) => [Math.cos(a), -Math.sin(a), 0, Math.sin(a), Math.cos(a), 0, 0, 0, 1];

// Rotaciones como las calcula el taller al encastrar (Rodrigues, por filas).
function rotEje(e: number[], grados: number) {
	const n = Math.hypot(e[0], e[1], e[2]);
	const [x, y, z] = e.map((v) => v / n);
	const a = grados * rad, c = Math.cos(a), s = Math.sin(a), k = 1 - c;
	return [c + x * x * k, x * y * k - z * s, x * z * k + y * s, y * x * k + z * s, c + y * y * k, y * z * k - x * s, z * x * k - y * s, z * y * k + x * s, c + z * z * k];
}
const cruz = (a: number[], b: number[]) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
function rotEntre(a: number[], b: number[]) {
	const c = a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
	if (c > 1 - 1e-12) return [1, 0, 0, 0, 1, 0, 0, 0, 1];
	if (c < -1 + 1e-12) return rotEje(cruz(a, Math.abs(a[0]) < 0.9 ? [1, 0, 0] : [0, 1, 0]), 180);
	const k = cruz(a, b);
	const s = Math.hypot(k[0], k[1], k[2]);
	return rotEje(k, (Math.atan2(s, c) * 180) / Math.PI);
}
const trasp = (a: number[]) => [a[0], a[3], a[6], a[1], a[4], a[7], a[2], a[5], a[8]];
// El "giro" de un encastre por conector se mide desde la rotación mínima, no desde la pieza base.
// Para las bisagras 44301a/44302a (eje del dedo = z local en las dos) esto devuelve el giro que deja la
// placa nueva plegada `angulo` grados respecto de la placa base.
function giroBisagra(a: Pieza, angulo: number) {
	const eje = mulV(a.tr.r, [0, 0, 1]);
	const rel = mulR(trasp(a.tr.r), rotEntre([0, 0, 1], eje));
	return angulo - (Math.atan2(rel[3], rel[0]) * 180) / Math.PI;
}

// La rotación como "X a Y b Z c" (el taller aplica X, después Y, después Z).
function eulerDe(R: number[], quien: string) {
	const b = -Math.asin(Math.max(-1, Math.min(1, R[6])));
	const a = Math.atan2(R[7], R[8]);
	const c = Math.atan2(R[3], R[0]);
	const rec = mulR(rz(c), mulR(ry(b), rx(a)));
	const err = Math.max(...rec.map((x, i) => Math.abs(x - R[i])));
	if (err > 1e-4) throw new Error(`${quien}: no pude descomponer la rotación (error ${err})`);
	const g = (x: number) => (x / rad).toFixed(6);
	return `X${g(a)} Y${g(b)} Z${g(c)}`;
}
function colocarEn(padre: Sub, sub: Sub, tr: Tr) {
	padre.colocar(sub, {en: tr.t as [number, number, number], rot: eulerDe(tr.r, sub.nombre)});
}

// ---------- colores ----------
const MADERA = 'Reddish_Brown';
const OSCURO = 'Dark_Brown';
const PASTO = 'Green';
const TIERRA = 'Dark_Tan';
const ROSA = 'Bright_Pink';

// ---------- base: pradera redondeada de 16 × 16 ----------
// Una placa de la base con su tamaño en studs; sirve para encontrar qué stud cae en la celda (x, z).
type Anfitrion = [Pieza, number, number];
function sobreCelda(s: Sub, anfitriones: Anfitrion[], id: string, color: string, x: number, z: number, op: object = {}): Pieza {
	for (const [h, W, D] of anfitriones) {
		const l = mulV(trasp(h.tr.r), [20 * x + 10 - h.tr.t[0], 0, 20 * z + 10 - h.tr.t[2]]);
		const i = (l[0] + (W - 1) * 10) / 20;
		const j = (l[2] + (D - 1) * 10) / 20;
		if (Math.abs(i - Math.round(i)) > 1e-6 || Math.abs(j - Math.round(j)) > 1e-6 || i < -0.5 || j < -0.5 || i > W - 0.5 || j > D - 0.5) continue;
		try {
			return s.poner(id, color, {...op, sobre: h, stud: [Math.round(i), Math.round(j)]} as never);
		} catch {
			continue;
		}
	}
	throw new Error(`no hay stud libre de la base en (${x}, ${z})`);
}
// Dos capas trabadas: abajo tierra (centro 16 × 8, dos 8 × 4 y cuatro cuartos de círculo), arriba pasto
// (cuatro esquinas redondeadas de 6 × 6 que puentean, dos bandas 8 × 4 y dos 4 × 6).
function construirBase(s: Sub) {
	const centro = s.poner('92438', TIERRA, {en: grilla(8, 0, 8)}); // x 0..15, z 4..11
	s.paso();
	const bandaO = s.poner('3035', PASTO, {sobre: centro, stud: [0, 2]}); // x 0..7, z 6..9
	const bandaE = s.poner('3035', PASTO, {sobre: centro, stud: [8, 2]}); // x 8..15, z 6..9
	const sendaS = s.poner('3032', PASTO, {sobre: centro, stud: [9, 0], con: [4, 0], giro: 90}); // x 6..9, z 0..5
	const sendaN = s.poner('3032', PASTO, {sobre: centro, stud: [9, 6], giro: 90}); // x 6..9, z 10..15
	const esqSO = s.poner('6003', PASTO, {sobre: centro, stud: [0, 1], giro: 270});
	const esqSE = s.poner('6003', PASTO, {sobre: centro, stud: [10, 0], con: [0, 4]});
	const esqNE = s.poner('6003', PASTO, {sobre: centro, stud: [15, 6], giro: 90});
	const esqNO = s.poner('6003', PASTO, {sobre: centro, stud: [5, 7], con: [0, 4], giro: 180});
	// Por debajo: la tierra que traba las esquinas y los extremos de las sendas.
	s.poner('3035', TIERRA, {debajo: sendaS, antistud: [0, 0], con: [5, 0]}); // x 4..11, z 0..3
	s.poner('3035', TIERRA, {debajo: sendaN, antistud: [2, 0], con: [5, 0]}); // x 4..11, z 12..15
	s.poner('30565', TIERRA, {debajo: esqSO, antistud: [4, 1], con: [2, 1], giro: 270});
	s.poner('30565', TIERRA, {debajo: esqSE, antistud: [3, 1], con: [1, 1]});
	s.poner('30565', TIERRA, {debajo: esqNE, antistud: [3, 1], con: [1, 1], giro: 90});
	s.poner('30565', TIERRA, {debajo: esqNO, antistud: [4, 2], con: [2, 2], giro: 180});
	s.paso();
	const pasto: Anfitrion[] = [...[esqSO, esqSE, esqNE, esqNO].map((p) => [p, 6, 6] as Anfitrion), [bandaO, 8, 4], [bandaE, 8, 4], [sendaS, 6, 4], [sendaN, 6, 4]];
	return {centro, bandaO, pasto};
}
// Detalles de la base: piedras de paso (tobi-ishi) que llevan al tronco, matas de pasto y flores caídas
// de cinco pétalos, como la flor del cerezo.
const PETALOS: [number, number, string][] = [
	[4, 7, ROSA], [11, 9, 'White'], [12, 5, ROSA], [6, 12, ROSA], [10, 12, 'White'],
	[3, 10, 'White'], [13, 10, ROSA], [2, 6, ROSA], [7, 1, 'White'], [11, 3, ROSA],
];
function detallesBase(s: Sub, pasto: Anfitrion[]) {
	for (const [x, z] of [[3, 0], [5, 2], [8, 3]]) sobreCelda(s, pasto, '14769', 'Light_Bluish_Grey', x, z);
	for (const [x, z, c] of [[1, 4, 'Bright_Green'], [14, 3, 'Green'], [13, 13, 'Bright_Green'], [2, 12, 'Green'], [11, 1, 'Bright_Green']] as const) sobreCelda(s, pasto, '32607', c, x, z);
	for (const [x, z, c] of PETALOS) sobreCelda(s, pasto, '24866', c, x, z);
	s.paso();
}

// ---------- tronco ----------
// Ladrillos redondos 2 × 2 separados por bandas oscuras (las lenticelas horizontales de la corteza del
// cerezo). Cada banda son dos jumpers 1 × 2: corren el ladrillo de arriba medio stud y el tronco se inclina.
function construirTronco(s: Sub) {
	const alcorque = s.poner('11213', OSCURO); // 6 × 6 redondo: la tierra alrededor del tronco
	let t = s.poner('3941', MADERA, {sobre: alcorque, stud: [2, 2]});
	// El ensanche de la base: cuatro curvas que bajan hacia la tierra, como raíces en molinete.
	s.poner('11477', MADERA, {sobre: alcorque, stud: [2, 0]});
	s.poner('11477', MADERA, {sobre: alcorque, stud: [3, 4]});
	s.poner('11477', MADERA, {sobre: alcorque, stud: [1, 3], giro: 90});
	s.poner('11477', MADERA, {sobre: alcorque, stud: [4, 2], giro: 270});
	s.paso();
	for (const giro of [0, 90]) {
		const j = s.poner('15573', OSCURO, {sobre: t, stud: [0, 0], giro});
		s.poner('15573', OSCURO, {sobre: t, stud: [1, 1], con: [1, 0], giro});
		t = s.poner('3941', MADERA, {sobre: j, stud: [0, 0]});
		s.paso();
	}
	return t;
}

// ---------- ramas ----------
// Cada rama: una bisagra que se pliega sobre el tronco y la inclina hacia afuera, un tramo de ladrillos
// redondos 1 × 1 y una horquilla (placa 1 × 2 con dos bisagras más) que la abre en dos ramas menores.
// En la punta de cada rama menor, otra bisagra vuelve a nivelar: gira lo justo para compensar la
// inclinación acumulada y deja una placa horizontal donde se apoya el racimo.
type ParamRama = {inclinacion: number; tramos: number; plano: number; abre: number[]; tramosH: number[]};
const dot = (a: number[], b: number[]) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const norm = (a: number[]) => {
	const n = Math.hypot(a[0], a[1], a[2]);
	return a.map((x) => x / n);
};
function nivelar(s: Sub, punta: Pieza): Pieza {
	const arriba = [0, -1, 0];
	const u = norm(mulV(punta.tr.r, [0, -1, 0])); // hacia donde apunta el stud de la punta
	const inclinacion = (Math.acos(Math.max(-1, Math.min(1, dot(u, arriba)))) * 180) / Math.PI;
	if (inclinacion < 8) return punta; // casi vertical: el racimo va directo sobre la punta
	// La placa con un dedo se orienta para que su dedo quede del lado "de arriba" del plano inclinado.
	const cuesta = norm(arriba.map((x, i) => x - dot(arriba, u) * u[i]));
	const x0 = mulV(mulR(rotEje(u, 0), rotEntre([0, -1, 0], u)), [1, 0, 0]);
	const giro = (Math.atan2(dot(u, cruz(x0, cuesta)), dot(x0, cuesta)) * 180) / Math.PI;
	const a = s.poner('44301a', MADERA, {conector: {de: punta, n: 2}, propio: 0, giro, nombre: 'nivela-a'});
	const b = s.poner('44302a', MADERA, {conector: {de: a, n: 5}, propio: 2, giro: giroBisagra(a, inclinacion), nombre: 'nivela-b'});
	// Una placa de alza: la esquina de la bisagra inclinada queda por debajo del plato del racimo.
	return orientar(s, '35480', MADERA, b, STUD00_44302A, 0, mulV(b.tr.r, [1, 0, 0]));
}
// Encastra `id` por su anti-stud `propio` en el stud `n` de `base`, girado para que su +X local apunte
// lo más posible hacia `dirX` (sobre/debajo solo admiten giros de 90°; acá hacen falta ángulos libres).
function orientar(s: Sub, id: string, color: string, base: Pieza, n: number, propio: number, dirX: number[]): Pieza {
	const eje = norm(mulV(base.tr.r, [0, -1, 0]));
	const x0 = mulV(rotEntre([0, -1, 0], eje), [1, 0, 0]);
	const obj = norm(dirX.map((x, i) => x - dot(dirX, eje) * eje[i]));
	const giro = (Math.atan2(dot(eje, cruz(x0, obj)), dot(x0, obj)) * 180) / Math.PI;
	return s.poner(id, color, {conector: {de: base, n}, propio, giro});
}
const STUD_3062B = 2;
const STUD00_44302A = 5;
const STUDS_LATERALES_4733 = [4, 5, 6, 7];
const ANTISTUD_24866 = 1;
// Apila `n` tramos de rama redondos sobre `base`. El tramo `florido` (si existe) es un ladrillo con studs
// en los cuatro lados que lleva flores de cinco pétalos: el cerezo florece sobre la rama desnuda.
let nFlor = 0;
function apilar(s: Sub, base: Pieza, n: number, florido = -1): {punta: Pieza; florido?: Pieza} {
	let r = base;
	let f: Pieza | undefined;
	for (let k = 0; k < n; k++) {
		if (k !== florido) {
			r = s.poner('3062b', MADERA, {sobre: r, stud: [0, 0]});
			continue;
		}
		r = f = s.poner('4733', MADERA, {sobre: r, stud: [0, 0]});
		for (const n4 of STUDS_LATERALES_4733) {
			const lado = ladoDe(r, n4);
			if (lado[1] > 0.3) continue; // no hacia abajo
			const adentro = norm([-r.tr.t[0], 0, -r.tr.t[2]]); // hacia el eje del tronco (origen de la rama)
			if (dot(lado, adentro) > 0.5) continue; // ni hacia donde se juntan las otras ramas
			s.poner('24866', nFlor++ % 3 ? ROSA : 'White', {conector: {de: r, n: n4}, propio: ANTISTUD_24866});
		}
	}
	return {punta: r, florido: f};
}
const STUDS_35480 = [4, 3]; // (0,0) y (1,0)
const ladoDe = (p: Pieza, n4: number) => mulV(p.tr.r, [[1, 0, 0], [0, 0, -1], [-1, 0, 0], [0, 0, 1]][n4 - 4]);

function construirRama(s: Sub, p: ParamRama): Pieza[] {
	// 1. La bisagra que inclina la rama.
	const a = s.poner('44301a', MADERA);
	const b = s.poner('44302a', MADERA, {conector: {de: a, n: 5}, propio: 2, giro: giroBisagra(a, p.inclinacion), nombre: 'abre-b'});
	// ... y el tramo principal. 2. La horquilla. La horquilla se orienta respecto de hacia dónde se inclina la
	// rama: plano 0 = abre en el mismo plano (una rama menor sigue hacia afuera y la otra se endereza),
	// plano 90 = abre de costado.
	const r = apilar(s, b, p.tramos, p.tramos >= 3 ? 1 : -1).punta;
	s.paso();
	const u = norm(mulV(r.tr.r, [0, -1, 0]));
	const afuera = norm([u[0], 0, u[2]]);
	const horq = orientar(s, '35480', MADERA, r, STUD_3062B, 0, mulV(rotEje([0, -1, 0], p.plano), afuera));
	const xh = mulV(horq.tr.r, [1, 0, 0]);
	const hb = p.abre.map((abre, lado) => {
		const ha = orientar(s, '44301a', MADERA, horq, STUDS_35480[lado], 0, lado ? xh : xh.map((x) => -x));
		return s.poner('44302a', MADERA, {conector: {de: ha, n: 5}, propio: 2, giro: giroBisagra(ha, abre), nombre: `horquilla-b${lado}`});
	});
	s.paso();
	// 3. Las ramas menores. 4. Las bisagras que nivelan sus puntas (si la rama no se abre en dos, va todo
	// en un paso: es corto).
	const puntas = hb.map((h, lado) => apilar(s, h, p.tramosH[lado], p.tramosH[lado] >= 4 ? 1 : -1).punta);
	if (puntas.length > 1) s.paso();
	const planos = puntas.map((pt) => nivelar(s, pt));
	s.paso();
	return planos;
}

// ---------- racimos de flor ----------
// Grande: plato redondo 6 × 6 blanco, cinco domos en cruz con el del centro alzado (blanco, como un
// brillo) y flores en las cuatro diagonales. Chico: plato 4 × 4 con cuatro domos, uno alzado. Alto: un
// grande con un chico encima.
const RACIMOS = {
	grande: {id: '11213', color: 'White', con: [2, 2] as [number, number]},
	chico: {id: '60474', color: ROSA, con: [1, 1] as [number, number]},
	alto: {id: '11213', color: 'White', con: [2, 2] as [number, number]},
};
type TipoRacimo = keyof typeof RACIMOS;
// Con `pasos` se arma de a poco (la primera vez que aparece cada racimo); sin, en un solo paso.
function construirRacimo(s: Sub, tipo: 'grande' | 'chico', pasos: boolean): {raiz: Pieza; cima: Pieza} {
	const paso = () => pasos && s.paso();
	const r = RACIMOS[tipo];
	const b = s.poner(r.id, r.color);
	let cima: Pieza;
	if (tipo === 'grande') {
		// Cuatro brazos en cruz con un domo arriba; tres de ellos llevan además un domo invertido colgando
		// abajo, y quedan como bolas. El cuarto brazo (-x) queda libre abajo para la bisagra que sostiene
		// el racimo.
		for (const [i, j] of [[2, 0], [5, 2], [3, 5]] as const) s.poner('15395', ROSA, {debajo: b, antistud: [i, j], nombre: `colgante ${i},${j}`});
		paso();
		for (const [i, j] of [[2, 0], [0, 2], [4, 2], [2, 4]] as const) s.poner('30367c', ROSA, {sobre: b, stud: [i, j]});
		paso();
		const alto = s.poner('3941', ROSA, {sobre: b, stud: [2, 2]});
		cima = s.poner('30367c', 'White', {sobre: alto, stud: [0, 0]});
		// Flores sueltas de cinco pétalos, como la flor del cerezo.
		for (const [i, j] of [[1, 1], [4, 1], [1, 4], [4, 4]] as const) s.poner('24866', ROSA, {sobre: b, stud: [i, j]});
	} else {
		s.poner('30367c', ROSA, {sobre: b, stud: [1, 1], con: [1, 1]});
		s.poner('30367c', 'White', {sobre: b, stud: [2, 1], con: [0, 1]});
		s.poner('30367c', ROSA, {sobre: b, stud: [1, 2], con: [1, 0]});
		paso();
		const alto = s.poner('3941', ROSA, {sobre: b, stud: [2, 2]});
		cima = s.poner('30367c', ROSA, {sobre: alto, stud: [0, 0]});
	}
	s.paso();
	return {raiz: b, cima};
}

// ---------- armado ----------
const m = new Modelo('cerezo');

// Base: la pradera con su sendero.
const base = m.sub('base');
detallesBase(base, construirBase(base).pasto);
m.raiz.colocar(base);
m.raiz.paso();

// Tronco, sobre el centro de la pradera.
const tronco = m.sub('tronco');
construirTronco(tronco);
const trTronco = sondear((s) => construirBase(s).bandaO, '11213', OSCURO, {stud: [7, 1], con: [2, 2]});
colocarEn(m.raiz, tronco, trTronco);
m.raiz.paso();

// Ramas: cuatro, una por stud del tope del tronco, en molinete. Los ángulos y largos salen de una
// búsqueda que acercó cada racimo a una copa en domo: un anillo de seis racimos alrededor y el alto en
// el centro. Orden de colocación: fondo, frente, este, oeste; así cada rama entra en línea recta.
const RAMAS: {stud: [number, number]; giro: number; p: ParamRama; racimos: TipoRacimo[]}[] = [
	{stud: [0, 0], giro: 180, p: {inclinacion: 30, tramos: 2, plano: 90, abre: [45, 25], tramosH: [2, 1]}, racimos: ['grande', 'chico']}, // oeste
	{stud: [1, 0], giro: 270, p: {inclinacion: 25, tramos: 3, plano: 90, abre: [30], tramosH: [2]}, racimos: ['grande']}, // frente
	{stud: [1, 1], giro: 0, p: {inclinacion: 25, tramos: 1, plano: 90, abre: [45, 10], tramosH: [3, 3]}, racimos: ['chico', 'alto']}, // este
	{stud: [0, 1], giro: 90, p: {inclinacion: 15, tramos: 3, plano: 0, abre: [35, 10], tramosH: [4, 3]}, racimos: ['alto', 'chico']}, // fondo
];
const ORDEN_RAMAS = [3, 1, 2, 0];
const puntas: {tr: Tr; tipo: TipoRacimo}[] = [];
for (const k of ORDEN_RAMAS) {
	const def = RAMAS[k];
	const rama = m.sub(`rama-${ORDEN_RAMAS.indexOf(k) + 1}`);
	construirRama(rama, def.p);
	const trRama = componer(trTronco, sondear(construirTronco, '44301a', MADERA, {stud: def.stud, giro: def.giro}));
	colocarEn(m.raiz, rama, trRama);
	m.raiz.paso();
	def.racimos.forEach((tipo, i) => {
		const r = RACIMOS[tipo];
		const punta = (s: Sub) => construirRama(s, def.p)[i];
		// El racimo grande deja libre abajo su lado -x. La placa niveladora que lo sostiene se extiende,
		// desde el stud donde se apoya el racimo, hacia su propio -x: el racimo se gira (de a 90°) para que
		// su lado libre quede encima. Para cada giro se usa el anti-stud central que deja el centro del
		// racimo en el mismo lugar.
		let op: object = {stud: [0, 0], con: r.con};
		if (tipo !== 'chico') {
			const s0 = sonda.sub(`s${nSonda++}`);
			const placa = punta(s0);
			const R = mulR(trRama.r, placa.tr.r);
			const hacia = [R[0], R[6]]; // el +x de la placa en el mundo (x, z)
			const giro = [0, 90, 180, 270].reduce((mejor, g) => {
				const d = mulV(rotEje([0, -1, 0], g), [-1, 0, 0]);
				const v = -(d[0] * hacia[0] + d[2] * hacia[1]);
				return v > mejor.v ? {g, v} : mejor;
			}, {g: 0, v: -Infinity}).g;
			const con = {0: [2, 2], 90: [2, 3], 180: [3, 3], 270: [3, 2]}[giro as 0 | 90 | 180 | 270];
			op = {stud: [0, 0], con, giro};
		}
		puntas.push({tipo, tr: componer(trRama, sondear(punta, r.id, r.color, op))});
	});
}

// Racimos. El primero de cada tipo se arma paso a paso; los demás llegan ya armados. Se colocan de atrás
// hacia adelante según la vista 3/4 (la cámara mira desde -x, -z), para que ninguno tape al que sigue.
// El racimo alto del centro, la cima de la copa, va al final: es la revelación.
const detallado = {grande: m.sub('racimo-grande'), chico: m.sub('racimo-chico')};
const copia = {grande: m.sub('racimo-grande-armado'), chico: m.sub('racimo-chico-armado')};
for (const tipo of ['grande', 'chico'] as const) {
	construirRacimo(detallado[tipo], tipo, true);
	construirRacimo(copia[tipo], tipo, false);
}
// El alto: un racimo grande con uno chico encima, sobre el domo blanco del centro.
const alto = m.sub('racimo-alto');
alto.colocar(copia.grande);
alto.paso();
colocarEn(alto, copia.chico, sondear((s) => construirRacimo(s, 'grande', false).cima, RACIMOS.chico.id, RACIMOS.chico.color, {stud: [0, 0], con: RACIMOS.chico.con}));
alto.paso();
// Orden: el más lejano primero, salvo que tenga debajo (y solapado en planta) otro racimo pendiente;
// así cada uno baja en línea recta sin chocar con los ya puestos.
const radio = {grande: 64, alto: 64, chico: 44};
const pendientes = [...puntas];
puntas.length = 0;
while (pendientes.length > 0) {
	const libres = pendientes.filter((p) => !pendientes.some((q) => q !== p && q.tr.t[1] > p.tr.t[1] && Math.hypot(q.tr.t[0] - p.tr.t[0], q.tr.t[2] - p.tr.t[2]) < radio[p.tipo] + radio[q.tipo]));
	const profundidad = (p: {tr: Tr; tipo: TipoRacimo}) => (p.tipo === 'alto' ? -Infinity : p.tr.t[0] + p.tr.t[2]);
	const elegido = libres.reduce((a, b) => (profundidad(b) > profundidad(a) ? b : a));
	puntas.push(elegido);
	pendientes.splice(pendientes.indexOf(elegido), 1);
}
const usado = {grande: false, chico: false};
for (const p of puntas) {
	if (p.tipo === 'alto') colocarEn(m.raiz, alto, p.tr);
	else {
		colocarEn(m.raiz, usado[p.tipo] ? copia[p.tipo] : detallado[p.tipo], p.tr);
		usado[p.tipo] = true;
	}
	m.raiz.paso();
}

m.guardar();
