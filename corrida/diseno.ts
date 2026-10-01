// Dragón «Guardián del tesoro»: un dragón rojo sentado sobre su tesoro, con las alas levantadas.
//
// Marco: el dragón mira hacia -X (la vista de frente lo muestra de perfil); -Z es su costado izquierdo, el que
// ve la cámara; las alturas van en capas (placas) sobre la mesa y la roca mide 2 placas. Cada sub-armado se arma
// en ese mismo marco y se coloca tal cual, salvo las alas, que se arman planas y se acoplan a sus bisagras.
//
// Sub-armados, en el orden del video: roca con el tesoro, patas delanteras, cuerpo con el cuello, cola,
// cabeza, ala derecha y, al final, ala izquierda (la revelación).
import {Modelo, grilla} from '../taller/src/dsl.ts';

const m = new Modelo('dragon');
type Sub = ReturnType<typeof m.sub>;
type Pieza = ReturnType<Sub['poner']>;
type V3 = [number, number, number];
type M3 = [number, number, number, number, number, number, number, number, number];

// ---------------------------------------------------------------------------------------------------------
// Herramientas
//
// Todo se encastra por conector. Estas funciones solo eligen el stud, el anti-stud y el giro a partir de una
// posición en la grilla (x, z en studs, capa en placas), para no contar índices a mano. La geometría de cada
// pieza se averigua con un modelo de prueba que no se guarda: se encastra la pieza sobre una placa conocida y
// se lee dónde quedó.

const sonda = new Modelo('sonda');
const placaSonda = sonda.raiz.poner('3958', 'Red'); // 6x6: su stud (0,0) está en (-50, 0, -50)
type Geo = {anti: [number, number, V3][]; studs: [number, number, V3][]};
const geos = new Map<string, Geo>();

function tamGrilla(f: () => void): [number, number] {
	try {
		f();
	} catch (e) {
		const r = (e as Error).message.match(/tiene (\d+)×(\d+)/);
		if (r) return [Number(r[1]), Number(r[2])];
		if (/no tiene/.test((e as Error).message)) return [0, 0];
		throw e;
	}
	throw new Error('sonda: se esperaba un error de rango');
}

function geo(id: string): Geo {
	let g = geos.get(id);
	if (g) return g;
	g = {anti: [], studs: []};
	const [ca, fa] = tamGrilla(() => sonda.raiz.poner(id, 'Red', {sobre: placaSonda, stud: [0, 0], con: [99, 99]}));
	for (let a = 0; a < ca; a++)
		for (let b = 0; b < fa; b++) {
			try {
				const p = sonda.raiz.poner(id, 'Red', {sobre: placaSonda, stud: [0, 0], con: [a, b]});
				g.anti.push([a, b, [-50 - p.tr.t[0], -p.tr.t[1], -50 - p.tr.t[2]]]);
			} catch {
				// hueco en la grilla
			}
		}
	const sola = sonda.raiz.poner(id, 'Red', {en: [0, 0, 0]});
	const [cs, fs] = tamGrilla(() => sonda.raiz.poner('3024', 'Red', {sobre: sola, stud: [99, 99]}));
	for (let i = 0; i < cs; i++)
		for (let j = 0; j < fs; j++) {
			try {
				const p = sonda.raiz.poner('3024', 'Red', {sobre: sola, stud: [i, j]});
				g.studs.push([i, j, [p.tr.t[0], p.tr.t[1] + 8, p.tr.t[2]]]);
			} catch {
				// hueco en la grilla
			}
		}
	geos.set(id, g);
	return g;
}

// Giro alrededor del eje vertical, como lo aplica el encastre por stud (0, 90, 180, 270).
function rotar(giro: number, v: V3): V3 {
	const [x, y, z] = v;
	switch (((giro % 360) + 360) % 360) {
		case 0:
			return [x, y, z];
		case 90:
			return [-z, y, x];
		case 180:
			return [-x, y, -z];
		case 270:
			return [z, y, -x];
	}
	throw new Error(`giro ${giro}`);
}
const clave = (v: V3) => v.map((n) => Math.round(n * 10) / 10 + 0).join(',');
const suma = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];

type Punto = {p: Pieza; i: number; j: number};

// Una obra = un sub-armado con registro de los studs y anti-studs de sus piezas verticales.
class Obra {
	readonly s: Sub;
	private studs = new Map<string, Punto>();
	private antis = new Map<string, Punto>();
	constructor(nombre: string) {
		this.s = m.sub(nombre);
	}

	// `nivel`: altura local de los anti-studs que apoyan (por defecto, los de más abajo; la garra 27261, por
	// ejemplo, apoya con los de su placa y deja colgar las uñas).
	private origen(id: string, x: number, z: number, capa: number, giro: number, nivel?: number): V3 {
		const g = geo(id);
		const ref = g.anti.length > 0 ? g.anti : g.studs;
		const rot = ref.map(([, , l]) => rotar(giro, l));
		const minX = Math.min(...rot.map((v) => v[0])) - 10;
		const minZ = Math.min(...rot.map((v) => v[2])) - 10;
		const alto = nivel ?? (g.anti.length > 0 ? Math.max(...g.anti.map(([, , l]) => l[1])) : ref[0][2][1]);
		return [20 * x - minX, -8 * capa - alto, 20 * z - minZ];
	}

	// Pieza con la esquina (menor x, menor z) de su grilla en (x, z) y sus anti-studs a la altura `capa`
	// (si no tiene anti-studs, sus studs). Se encastra en un stud libre de abajo o en un anti-stud de arriba.
	pon(id: string, color: string, x: number, z: number, capa: number, giro = 0, nivel?: number): Pieza {
		const g = geo(id);
		const origen = this.origen(id, x, z, capa, giro, nivel);
		let p: Pieza | undefined;
		for (const [a, b, l] of g.anti) {
			const hit = this.studs.get(clave(suma(origen, rotar(giro, l))));
			if (hit) {
				p = this.s.poner(id, color, {sobre: hit.p, stud: [hit.i, hit.j], con: [a, b], giro});
				break;
			}
		}
		if (!p)
			for (const [i, j, l] of g.studs) {
				const hit = this.antis.get(clave(suma(origen, rotar(giro, l))));
				if (hit) {
					p = this.s.poner(id, color, {debajo: hit.p, antistud: [hit.i, hit.j], con: [i, j], giro});
					break;
				}
			}
		if (!p) throw new Error(`${id} en (${x}, ${z}, capa ${capa}): no encastra en nada de "${this.s.nombre}"`);
		if (clave(p.tr.t) !== clave(origen)) throw new Error(`${id}: quedó en ${p.tr.t} y no en ${origen}`);
		this.registrar(p, giro);
		return p;
	}

	// Primera pieza del sub-armado: libre, en la grilla.
	inicio(id: string, color: string, x: number, z: number, capa: number, giro = 0): Pieza {
		const p = this.s.poner(id, color, {en: this.origen(id, x, z, capa, giro), rot: giro ? `Y${-giro}` : ''});
		this.registrar(p, giro);
		return p;
	}

	// Anota studs y anti-studs de una pieza vertical (girada solo alrededor del eje vertical).
	registrar(p: Pieza, giro: number) {
		const g = geo(p.archivo.replace(/\.dat$/, ''));
		for (const [i, j, l] of g.studs) this.studs.set(clave(suma(p.tr.t, rotar(giro, l))), {p, i, j});
		for (const [i, j, l] of g.anti) this.antis.set(clave(suma(p.tr.t, rotar(giro, l))), {p, i, j});
	}

	paso() {
		this.s.paso();
	}
}

// Púa centrada: saltador 1x2 (un stud al medio) y encima una pendiente 1x1 que baja hacia `baja` (giro).
// `x`, `z`: esquina del saltador; `aLoLargoX`: el saltador va a lo largo de X (si no, de Z).
function pua(o: Obra, x: number, z: number, capa: number, aLoLargoX: boolean, baja: number) {
	o.pon('15573', ROJO, x, z, capa, aLoLargoX ? 0 : 90);
	o.pon('54200', PANZA, aLoLargoX ? x + 0.5 : x, aLoLargoX ? z : z + 0.5, capa + 1, baja);
}

// Matrices 3x3 por filas, como en LDraw.
const mul = (a: M3, b: M3): M3 => {
	const r = new Array(9).fill(0) as M3;
	for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) for (let k = 0; k < 3; k++) r[3 * i + j] += a[3 * i + k] * b[3 * k + j];
	return r;
};
const tras = (a: M3): M3 => [a[0], a[3], a[6], a[1], a[4], a[7], a[2], a[5], a[8]];
const apl = (a: M3, v: V3): V3 => [a[0] * v[0] + a[1] * v[1] + a[2] * v[2], a[3] * v[0] + a[4] * v[1] + a[5] * v[2], a[6] * v[0] + a[7] * v[1] + a[8] * v[2]];

// Rotación como texto "X.. Y.. Z.." (la API aplica los giros de izquierda a derecha: R = Rz·Ry·Rx).
function euler(r: M3): string {
	const b = Math.asin(Math.max(-1, Math.min(1, -r[6])));
	let a: number;
	let c: number;
	if (Math.abs(Math.cos(b)) > 1e-9) {
		a = Math.atan2(r[7], r[8]);
		c = Math.atan2(r[3], r[0]);
	} else {
		a = Math.atan2(-r[5], r[4]);
		c = 0;
	}
	const g = (x: number) => ((x * 180) / Math.PI).toFixed(6);
	return `X${g(a)} Y${g(b)} Z${g(c)}`;
}

// Dónde quedaría una pieza encastrada por conector a otra que está en otro sub-armado (se calcula en la
// sonda, con la base copiada en su lugar).
function dondeIria(base: Pieza, id: string, n: number, propio: number, giro: number) {
	const copia = sonda.raiz.poner(base.archivo.replace(/\.dat$/, ''), 'Red', {en: base.tr.t as V3, rot: euler(base.tr.r as M3)});
	return sonda.raiz.poner(id, 'Red', {conector: {de: copia, n}, propio, giro}).tr;
}

// Coloca un sub-armado (armado en su propio marco) de modo que su pieza `pieza` quede en `destino`.
function acoplar(sub: Sub, pieza: Pieza, destino: {r: number[]; t: number[]}) {
	const r = mul(destino.r as M3, tras(pieza.tr.r as M3));
	const t = apl(r, pieza.tr.t as V3);
	m.raiz.colocar(sub, {en: [destino.t[0] - t[0], destino.t[1] - t[1], destino.t[2] - t[2]], rot: euler(r)});
}

// Encastra `id` por su conector `propio` en el conector `n` de `base` (mismo sub-armado), con el giro (0, 90,
// 180 o 270) que deja el eje X propio de la pieza apuntando hacia `dirX`. Sirve para SNOT y bisagras.
function lateral(s: Sub, base: Pieza, n: number, id: string, color: string, propio: number, dirX: V3, nombre?: string): Pieza {
	for (const giro of [0, 90, 180, 270]) {
		const tr = dondeIria(base, id, n, propio, giro);
		const x = apl(tr.r as M3, [1, 0, 0]);
		if (x[0] * dirX[0] + x[1] * dirX[1] + x[2] * dirX[2] > 0.99) return s.poner(id, color, {conector: {de: base, n}, propio, giro, nombre});
	}
	throw new Error(`${id}: ningún giro deja su eje X hacia ${dirX}`);
}

// Como `lateral`, pero para uniones que admiten cualquier ángulo (clip en barra, bisagra): prueba giros de 5° y
// se queda con el que deja el eje `eje` propio de la pieza más cerca de la dirección `dir`.
function orientar(s: Sub, base: Pieza, n: number, id: string, color: string, propio: number, eje: V3, dir: V3): Pieza {
	let mejor = 0;
	let max = -2;
	const largo = Math.hypot(...dir);
	for (let giro = 0; giro < 360; giro += 5) {
		const v = apl(dondeIria(base, id, n, propio, giro).r as M3, eje);
		const c = (v[0] * dir[0] + v[1] * dir[1] + v[2] * dir[2]) / largo;
		if (c > max) [max, mejor] = [c, giro];
	}
	return s.poner(id, color, {conector: {de: base, n}, propio, giro: mejor});
}

// ---------------------------------------------------------------------------------------------------------
// Pendientes: el lado alto (con studs) queda en +Z y bajan hacia -Z; con giro 90 bajan hacia +X (atrás), con
// 270 hacia -X (adelante).
const BAJA_ATRAS = 90;
const BAJA_ADELANTE = 270;
const ROJO = 'Red';
const PANZA = 'Tan';
const ROCA = 'Dark_Bluish_Grey';
const MEMB = 'Dark_Red';

// ---- roca con el tesoro
const ORO = 'Pearl_Gold';
const ROCA2 = 'Light_Bluish_Grey';
const roca = new Obra('roca');
const R = (id: string, color: string, x: number, z: number, capa: number, giro = 0) => roca.pon(id, color, x, z, capa, giro);
// Piezas cuyo encastre inferior apunta hacia abajo (baldosa redonda, copa): se apoyan libres sobre el stud
// de la celda (x, z) a la altura `capa`; `fondo` es la altura local de su base.
const sobreStud = (id: string, color: string, x: number, z: number, capa: number, fondo: number) => {
	const [px, py, pz] = grilla(x + 0.5, capa, z + 0.5);
	return roca.s.poner(id, color, {en: [px, py - fondo, pz]});
};
// cimiento de 22 x 14 en dos capas trabadas: primero la mitad de adelante, después la de atrás
roca.inicio('92438', ROCA, -11, -8, 0);
R('3456', ROCA, -11, -8, 1, 90);
R('3027', ROCA, -11, 0, 0);
roca.paso();
R('92438', ROCA, -5, -8, 1);
R('3456', ROCA, 5, -8, 0, 90);
R('3027', ROCA, -5, 0, 1);
R('3040b', ROCA, 10, -7, 2); // una piedra en la esquina, donde dobla la cola
roca.paso();
// tesoro: montículo de oro; después copa, monedas y gemas
R('2450', ORO, -10, -7, 2);
R('3022', ORO, -7, -6, 2);
R('3022', ORO, -9, -6, 3);
roca.paso();
sobreStud('2343', ORO, -8, -6, 4, 40);
for (const [x, z] of [[-9, -6], [-8, -5]]) sobreStud('98138', ORO, x, z, 4, 8);
for (const [x, z] of [[-11, -5], [-6, -7], [-9, -8], [-11, -8]]) R('6141', ORO, x, z, 2);
const gemas: [number, number, number, string][] = [[-6, -6, 3, 'Trans_Red'], [-11, -7, 2, 'Trans_Dark_Blue']];
for (const [x, z, capa, c] of gemas) {
	const j = R('15573', ORO, x, z, capa, 90);
	roca.s.poner('30153', c, {conector: {de: j, n: 4}, propio: 0});
}
roca.paso();
// cofre entre las patas delanteras, con la bisagra hacia el dragón y la tapa entreabierta
const cofre = R('4738b', 'Reddish_Brown', -11, -2, 2, 270);
roca.s.poner('4739a', ORO, {conector: {de: cofre, n: 0}, propio: 0, giro: 340});
// y una roca a la derecha
R('3002', ROCA, -10, 4, 2);
R('3039', ROCA2, -10, 4, 5, BAJA_ADELANTE);
R('3040b', ROCA, -8, 4, 5);
roca.paso();

// ---- patas delanteras: las dos sobre una losa del color de la roca, que las une en un solo sub-armado
const patas = new Obra('patas delanteras');
patas.inicio('3032', ROCA, -7, -3, 2, 90);
for (const z of [1, -3]) patas.pon('27261', PANZA, -8, z, 3, 270, 8); // garras al frente, las uñas cuelgan
// columnas redondas: primero dos hiladas, después las tres que faltan
for (const c of [3, 6]) for (const z of [1, -3]) patas.pon('3941', ROJO, -6, z, c);
patas.paso();
for (const c of [9, 12, 15]) for (const z of [1, -3]) patas.pon('3941', ROJO, -6, z, c);
patas.paso();

// ---- cuerpo
const cuerpo = new Obra('cuerpo');
const P = (id: string, color: string, x: number, z: number, capa: number, giro = 0, nivel?: number) => cuerpo.pon(id, color, x, z, capa, giro, nivel);
const paso = () => cuerpo.paso();
// Panza: ladrillo 1x4 con studs al frente (-X) y una baldosa tostada encima; cada hilada es una escama.
function escama(x: number, capa: number) {
	const b = P('30414', ROJO, x, -2, capa, 270);
	lateral(cuerpo.s, b, 8, '2431', PANZA, 0, [0, 0, -1]);
}
// Lomo: al final de cada hilada, pendiente de 45° que baja hacia atrás (alto en x, baja en x+1).
function lomo(x: number, capa: number, ancho6 = false) {
	if (ancho6) P('3040b', ROJO, x, 2, capa, BAJA_ATRAS);
	P('3037', ROJO, x, -2, capa, BAJA_ATRAS);
	if (ancho6) P('3040b', ROJO, x, -3, capa, BAJA_ATRAS);
}

cuerpo.inicio('3033', ROJO, -3, -5, 2, 90); // cadera 6x10, atravesada: llega a los pies traseros
// pies traseros, abiertos hacia afuera: empeine curvo y garras al frente (primero el de atrás)
for (const z of [3, -5]) {
	P('15068', ROJO, -2, z, 3, BAJA_ADELANTE);
	P('27261', PANZA, -4, z, 3, 270, 8);
}
paso();
// ancas, hilada 1: el núcleo con la primera escama; después la culata (con una placa debajo, porque sobresale
// de la cadera)
for (const z of [1, -1, -3]) P('3001', ROJO, 0, z, 3);
for (const z of [2, -3]) P('3005', ROJO, -1, z, 3);
escama(-1, 3);
paso();
P('3032', ROJO, 3, -3, 2, 90);
for (const z of [1, -1, -3]) P('3002', ROJO, 4, z, 3);
paso();
// hilada 2: atrás, después el medio (con los ladrillos de studs laterales para los muslos) y la escama
P('3622', ROJO, 4, 2, 6);
for (const z of [0, -2]) P('3002', ROJO, 4, z, 6);
P('3622', ROJO, 4, -3, 6);
paso();
const muslos: Pieza[] = [P('30414', ROJO, 0, 2, 6, 180)];
for (const z of [0, -2]) P('3001', ROJO, 0, z, 6);
muslos.push(P('30414', ROJO, 0, -3, 6));
for (const z of [2, -3]) P('3005', ROJO, -1, z, 6);
escama(-1, 6);
paso();
// hilada 3: arranque del lomo
lomo(5, 9, true);
for (const z of [2, -3]) {
	muslos.push(P('30414', ROJO, 0, z, 9, z > 0 ? 180 : 0));
	P('3005', ROJO, 4, z, 9);
}
for (const z of [0, -2]) P('3001', ROJO, 0, z, 9);
P('3010', ROJO, 4, -2, 9, 90);
// muslos: pendientes curvas dobles de costado en los studs laterales, un bulto redondeado en cada anca
for (const s of muslos) orientar(cuerpo.s, s, 8, '93273', ROJO, 2, [0, 0, 1], s.tr.r[0] > 0 ? [1, 0, 0] : [-1, 0, 0]);
paso();
for (const z of [2, -3]) P('3005', ROJO, -1, z, 9);
escama(-1, 9);
// borde redondeado de las ancas: pendientes 1x1 que bajan hacia afuera
for (let x = 4; x >= -1; x--) {
	P('54200', ROJO, x, 2, 12, 180);
	P('54200', ROJO, x, -3, 12, 0);
}
paso();
// torso, hiladas 4 y 5: cada una un stud más adelante; el frente es la barriga tostada
for (const z of [0, -2]) P('3001', ROJO, 0, z, 12);
lomo(4, 12);
P('3001', PANZA, -2, -2, 12, 90);
paso();
for (const z of [0, -2]) P('3001', ROJO, -1, z, 15);
paso();
lomo(3, 15);
P('3001', PANZA, -3, -2, 15, 90);
paso();
// placa del pecho: sostiene el voladizo y recibe las patas delanteras por debajo
P('3036', ROJO, -5, -3, 18);
P('3710', ROJO, 3, -2, 18, 90);
paso();
// pecho y hombros (6 de ancho): hilada 6
lomo(2, 19, true);
for (const z of [0, -2]) P('3003', ROJO, 0, z, 19);
paso();
for (const z of [2, -3]) P('3622', ROJO, -1, z, 19);
for (const z of [0, -2]) P('3001', ROJO, -4, z, 19);
for (const z of [2, -3]) P('3622', ROJO, -4, z, 19);
for (const z of [2, -3]) P('3005', ROJO, -5, z, 19);
escama(-5, 19);
paso();
// hilada 7: hombros con studs al costado para las bisagras de las alas
lomo(1, 22, true);
P('3010', ROJO, 0, -2, 22, 90);
paso();
for (const z of [0, -2]) P('3001', ROJO, -4, z, 22);
const hombros: Pieza[] = [];
for (const [z, giro] of [[2, 180], [-3, 0]]) {
	P('3005', ROJO, -4, z, 22);
	hombros.push(P('30414', ROJO, -3, z, 22, giro));
}
const bisagraD = cuerpo.s.poner('3937', ROJO, {conector: {de: hombros[0], n: 9}, propio: 0, giro: 180});
const bisagraI = cuerpo.s.poner('3937', ROJO, {conector: {de: hombros[1], n: 9}, propio: 0});
for (const z of [2, -3]) P('3005', ROJO, -5, z, 22);
escama(-5, 22);
paso();
// hilada 8: base del cuello; baldosas sobre los hombros y púas en la cruz
lomo(0, 25);
for (const z of [0, -2]) P('3001', ROJO, -4, z, 25);
paso();
escama(-5, 25);
for (const z of [2, -3]) P('6636', ROJO, -5, z, 25);
for (const z of [1, -2]) P('3069b', ROJO, -1, z, 28);
for (const x of [0, -1]) pua(cuerpo, x, -1, 28, false, BAJA_ATRAS);
paso();
// Cuello: tres tramos que avanzan un stud cada uno; adelante la garganta de escamas, atrás una pendiente.
// Entre tramo y tramo, una placa 4x4 que sobresale hacia adelante; sobre el último se apoya la cabeza.
function tramo(x: number, capa: number, placa: boolean) {
	escama(x, capa);
	P('3010', ROJO, x + 1, -2, capa, 90);
	P('3037', ROJO, x + 2, -2, capa, BAJA_ATRAS);
	if (placa) P('3031', ROJO, x - 1, -2, capa + 3);
	paso();
}
tramo(-5, 28, true);
tramo(-6, 32, true);
tramo(-7, 36, false);

// ---- cola: sale de la culata, dobla hacia el costado cercano (-Z) y vuelve hacia adelante por el piso
const cola = new Obra('cola');
const K = (id: string, color: string, x: number, z: number, capa: number, giro = 0) => cola.pon(id, color, x, z, capa, giro);
// raíz y primer codo: placas de apoyo trabadas por ladrillos atravesados
cola.inicio('3021', ROJO, 7, -1, 2);
K('3002', ROJO, 8, -2, 3, 90);
K('3020', ROJO, 8, -5, 2, 90);
K('3003', ROJO, 8, -4, 3);
K('3004', ROJO, 7, -1, 3, 90);
K('3004', ROJO, 7, -1, 6, 90);
K('3039', ROJO, 8, -1, 6, BAJA_ATRAS);
cola.paso();
// segundo codo, tramo que vuelve hacia adelante, punta en forma de pala y púas inclinadas hacia la punta
K('3002', ROJO, 8, -7, 3, 90);
K('3020', ROJO, 6, -7, 2);
K('3002', ROJO, 5, -7, 3);
K('3021', ROJO, 3, -7, 2);
K('43719', MEMB, 2, -8, 3, 270);
pua(cola, 7, -1, 9, false, BAJA_ATRAS);
for (const z of [-4, -6]) pua(cola, 8, z, 6, true, 0);
for (const x of [7, 5]) pua(cola, x, -7, 6, false, BAJA_ADELANTE);
cola.paso();

// ---- cabeza
const cabeza = new Obra('cabeza');
const C = (id: string, color: string, x: number, z: number, capa: number, giro = 0) => cabeza.pon(id, color, x, z, capa, giro);
// Cabeza grande (6 de ancho, 4 ladrillos de alto): mandíbula tostada de 4, hocico de 4 y cráneo de 6x6.
cabeza.inicio('3032', ROJO, -6, -3, 39, 90); // piso del cráneo
C('3032', ROJO, -8, -3, 40, 90); // la placa de arriba lo traba con la mandíbula
C('3032', PANZA, -12, -2, 39); // mandíbula
cabeza.paso();
// línea de la boca, mejillas y hocico, con las narinas al frente (ladrillo SNOT)
C('3795', ROJO, -4, -3, 40, 90);
C('3031', MEMB, -12, -2, 40);
for (const x of [-4, -6, -8]) C('2456', ROJO, x, -3, 41, 90);
cabeza.paso();
C('3001', ROJO, -10, -2, 41, 90);
C('3010', ROJO, -11, -2, 41, 90);
const narinas = C('30414', ROJO, -12, -2, 41, 270);
for (const n of [8, 11]) cabeza.s.poner('6141', 'Black', {conector: {de: narinas, n}, propio: 0});
cabeza.paso();
// cráneo con los ladrillos de faro para los ojos; puente del hocico en pendiente
for (const x of [-4, -6]) C('2456', ROJO, x, -3, 44, 90);
const ojos = [C('4070', ROJO, -7, 2, 44, 180), C('4070', ROJO, -7, -3, 44)];
C('3010', ROJO, -7, -2, 44, 90);
C('3009', ROJO, -8, -3, 44, 90);
cabeza.paso();
C('3010', ROJO, -9, -2, 44, 90);
C('3297', ROJO, -12, -2, 44, BAJA_ADELANTE);
C('87079', ROJO, -10, -2, 47, 90);
cabeza.paso();
// ojos (plato 3x3 amarillo encastrado en el faro, con pupila negra), frente redondeada y coronilla lisa
for (const f of ojos) {
	const d = cabeza.s.poner('43898', 'Yellow', {conector: {de: f, n: 1}, propio: 1});
	cabeza.s.poner('6141', 'Black', {conector: {de: d, n: 0}, propio: 1});
}
C('3032', ROJO, -6, -3, 47, 90);
for (const z of [1, -1, -3]) C('15068', ROJO, -8, z, 47, BAJA_ADELANTE);
for (const z of [1, -1, -3]) C('3068b', ROJO, -6, z, 48);
cabeza.paso();
// atrás, dos placas con asa para los cuernos y dos púas
const asas = [C('60478', ROJO, -4, 2, 48), C('60478', ROJO, -4, -3, 48)];
C('3020', ROJO, -4, -2, 48, 90);
for (const x of [-3, -4]) pua(cabeza, x, -1, 49, false, BAJA_ATRAS);
// cuernos: garra ancha tostada enganchada en el asa, girada para que apunte hacia atrás y arriba
for (const a of asas) orientar(cabeza.s, a, 2, '16770', PANZA, 0, [0, 0, -1], [1, -0.6, 0]);
cabeza.paso();

// ---- alas: se arman planas (studs arriba; +X hacia atrás, +Z hacia la punta) y se acoplan a la bisagra.
// Brazo rojo desde la bisagra hasta la muñeca y, en la muñeca, cuatro cuñas en abanico (los dedos con la
// membrana) que pivotan sobre un solo stud a distintos ángulos; los huecos en V entre cuña y cuña forman el
// borde festoneado del ala. Un separador 1x1 entre cuñas evita que sus anti-studs choquen con los studs de abajo.
// `abanico`: giros de las cuatro cuñas (90 = horizontal hacia atrás, menos = más hacia abajo).
// `cortes`: después de qué cuñas va un paso (las cuñas que quedarían tapadas de perfil van con la siguiente).
function ala(nombre: string, lado: 1 | -1, abanico: number[], cortes: number[]) {
	const a = new Obra(nombre);
	const tapa = a.s.poner('6134', ROJO, {en: [0, 0, 10]});
	a.registrar(tapa, 0);
	const xb = lado > 0 ? 0 : -1; // columna del brazo
	a.pon('4477', ROJO, xb, 0, 0, 90); // brazo 1x10
	a.pon('3710', ROJO, -1 - xb, 0, 0, 90); // refuerzo 1x4
	if (cortes.includes(-1)) a.paso();
	// muñeca: placa con diente (la garrita del pulgar, hacia adelante) que hace de primer separador
	let pivote = a.pon('49668', PANZA, xb, 9, 1, lado > 0 ? 270 : 90);
	let nStud = 1;
	const dedos: [string, number, number][] = [
		// pieza (izq / der), anti-stud y stud del pivote
		[lado > 0 ? '47397' : '47398', 19, 24],
		[lado > 0 ? '47397' : '47398', 19, 24],
		[lado > 0 ? '50305' : '50304', 13, 30],
		[lado > 0 ? '54384' : '54383', 9, -1],
	];
	dedos.forEach(([id, anti, stud], k) => {
		if (k > 0) pivote = a.s.poner('3024', ROJO, {conector: {de: pivote, n: nStud}, propio: 0});
		if (k > 0) nStud = 2;
		const d = a.s.poner(id, MEMB, {conector: {de: pivote, n: nStud}, propio: anti, giro: lado * abanico[k]});
		if (cortes.includes(k)) a.paso();
		pivote = d;
		nStud = stud;
	});
	return {a, tapa};
}
// Las alas no son espejo exacto: los dedos de la derecha (la de atrás en la vista de frente) caen entre los de la
// izquierda, así de perfil se ven los dos abanicos y la pose tiene movimiento.
const alaD = ala('ala derecha', -1, [105, 75, 45, 15], [-1, 0, 1, 3]);
const alaI = ala('ala izquierda', 1, [120, 90, 60, 30], [0, 1, 3]);
const APERTURA = 20; // grados que se abre cada ala hacia afuera

// ---- modelo: roca, patas, cuerpo, cola, cabeza; las alas al final (la de atrás primero)
for (const o of [roca, patas, cuerpo, cola, cabeza]) {
	m.raiz.colocar(o.s);
	m.raiz.paso();
}
// Con bisagras, el giro es absoluto alrededor del eje: 90 (izq.) y 270 (der.) dejan la tapa en su posición de
// fábrica, a la que se suma la apertura.
acoplar(alaD.a.s, alaD.tapa, dondeIria(bisagraD, '6134', 2, 0, 270 + APERTURA));
m.raiz.paso();
acoplar(alaI.a.s, alaI.tapa, dondeIria(bisagraI, '6134', 2, 0, 90 + APERTURA));
m.raiz.paso();
m.guardar();
