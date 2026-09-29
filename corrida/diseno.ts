// Jacarandá en flor — diseño para video vertical de armado.
//
// Sub-armados: cantero (base con tierra y raíces) y tronco (tronco múltiple con sus ramas altas).
// En el modelo principal se enchufan las ramas bajas y después florece la copa, racimo por racimo,
// mientras caen flores al pasto.
// Técnica: las ramas son cuellos de dragón (67361), que se afinan y curvan como una rama de verdad,
// y secciones de cola (40378) que arquean hacia afuera; en sus puntas, conos con eje (11610) hacen de
// pedúnculo de cada racimo. La copa de paraguas se cierra arriba con dos brazos cruzados.

import {Modelo, grilla} from '../taller/src/dsl.ts';

type V = [number, number, number];
type Sub = ReturnType<Modelo['sub']>;
type Pieza = ReturnType<Sub['poner']>;

// ---------------------------------------------------------------------------------------------
// Geometría mínima para lo que el DSL no encastra solo:
//  - una pieza con pin que entra en la boca del cuello: el eje de ese agujero apunta hacia afuera y
//    `conector` metería el pin al revés;
//  - una pieza del modelo principal que encastra en un conector de un sub-armado (fuera de la grilla).
// Los datos de conectores salen de `piezas ver`; nada se ubica a ojo.
const ap = (r: readonly number[], v: V): V => [r[0] * v[0] + r[1] * v[1] + r[2] * v[2], r[3] * v[0] + r[4] * v[1] + r[5] * v[2], r[6] * v[0] + r[7] * v[1] + r[8] * v[2]];
const mundo = (p: Pieza, v: V): V => ap(p.tr.r, v).map((x, i) => x + p.tr.t[i]) as V;
const sumar = (a: V, b: V): V => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const grados = (x: number) => Number(((x * 180) / Math.PI).toFixed(6));
// Matriz → "X a Y b Z c" (el DSL compone los giros de izquierda a derecha: R = Rz·Ry·Rx).
function aRot(r: readonly number[]): string {
	const b = Math.asin(Math.max(-1, Math.min(1, -r[6])));
	return `X${grados(Math.atan2(r[7], r[8]))} Y${grados(b)} Z${grados(Math.atan2(r[3], r[0]))}`;
}

// Cuello 67361: la boca del agujero de la punta está en (0,-144,54) y el agujero baja a 45° hacia el
// cuerpo. Un pin que entra ahí queda girado X±45 respecto del cuello (según hacia dónde apunte el pin).
const BOCA: V = [0, -144, 54];
// El cuello se curva hacia +Z local; con giro g del DSL se curva hacia el azimut g + 90 (azimut medido
// desde +X hacia +Z; −Z es el frente del modelo).
const giroCuello = (azimut: number) => azimut - 90;
const rotCuello = (azimut: number) => `Y${-giroCuello(azimut)}`;

// Dónde queda `id` si su conector `propio` encastra en el conector n de `de` (que está en un sub-armado
// colocado en `desplaz`). Se calcula con un modelo auxiliar que no se guarda.
function encastreExterno(de: Pieza, n: number, id: string, propio: number, giro: number, desplaz: V): {en: V; rot: string; r: readonly number[]} {
	const aux = new Modelo('aux').raiz;
	const copia = aux.poner(de.archivo, 16, {en: de.tr.t as V, rot: aRot(de.tr.r)});
	const p = aux.poner(id, 16, {conector: {de: copia, n}, propio, giro});
	return {en: sumar(p.tr.t as V, desplaz), rot: aRot(p.tr.r), r: p.tr.r};
}

// ---------------------------------------------------------------------------------------------
const m = new Modelo('jacaranda');
const TIERRA = 'Brown';

// CANTERO: césped de 16 × 16 con esquinas redondeadas, un círculo de tierra que ata todo y raíces.
const cantero = m.sub('cantero');
{
	const c = cantero;
	// Piso: ocho placas lado a lado (sin encastre entre ellas), ubicadas en la grilla. El redondeo del
	// 6003 y del 30565 está en +X−Z local.
	c.poner('6003', 'Green', {en: grilla(5, 0, 5), rot: 'Y-90', nombre: 'esquina SE'});
	c.poner('6003', 'Green', {en: grilla(-5, 0, 5), rot: 'Y180', nombre: 'esquina SO'});
	c.poner('6003', 'Green', {en: grilla(-5, 0, -5), rot: 'Y90', nombre: 'esquina NO'});
	c.poner('6003', 'Green', {en: grilla(5, 0, -5), rot: 'Y0', nombre: 'esquina NE'});
	const fajaN = c.poner('3035', 'Green', {en: grilla(0, 0, -4), rot: 'Y90', nombre: 'faja N'});
	const fajaS = c.poner('3035', 'Green', {en: grilla(0, 0, 4), rot: 'Y90', nombre: 'faja S'});
	c.poner('3032', 'Green', {en: grilla(5, 0, 0), nombre: 'lado E'});
	c.poner('3032', 'Green', {en: grilla(-5, 0, 0), nombre: 'lado O'});
	c.paso();
	// Tierra: cuatro cuartos redondeados forman un círculo de 8 × 8 que ata las ocho placas del piso.
	// Cada cuarto apoya su anti-stud interior (0,3) junto al centro, sobre las fajas.
	const tierraNE = c.poner('30565', TIERRA, {sobre: fajaN, stud: [0, 2], con: [0, 3], giro: 0, nombre: 'tierra NE'});
	const tierraSE = c.poner('30565', TIERRA, {sobre: fajaS, stud: [7, 2], con: [0, 3], giro: 90, nombre: 'tierra SE'});
	c.poner('30565', TIERRA, {sobre: fajaS, stud: [7, 1], con: [0, 3], giro: 180, nombre: 'tierra SO'});
	const tierraNO = c.poner('30565', TIERRA, {sobre: fajaN, stud: [0, 1], con: [0, 3], giro: 270, nombre: 'tierra NO'});
	// Raíces: placas con garras al borde de la tierra; las garras bajan al pasto (tienen anti-studs abajo).
	c.poner('27261', 'Dark_Brown', {sobre: tierraNE, stud: [0, 0], con: [1, 1], giro: 0, nombre: 'raíz frente'});
	c.poner('27261', 'Dark_Brown', {sobre: tierraSE, stud: [0, 0], con: [1, 1], giro: 90, nombre: 'raíz derecha'});
	c.poner('27261', 'Dark_Brown', {sobre: tierraSE, stud: [3, 3], con: [0, 1], giro: 180, nombre: 'raíz atrás'});
	c.poner('27261', 'Dark_Brown', {sobre: tierraNO, stud: [0, 0], con: [1, 1], giro: 270, nombre: 'raíz izquierda'});
	c.paso();
}

// TRONCO: cuatro cuellos en molinete alrededor de una columna central acanalada.
const tronco = m.sub('tronco');
type Rama = {celda: [number, number]; azimut: number; nombre: string};
// Celda (stud de la esquina del 2 × 2 sobre el plato 6 × 6) y hacia dónde se curva cada cuello: en
// molinete, cada uno se abre corrido 30–45° de su lado, todos en el mismo sentido (el tronco parece
// retorcido).
const RAMAS: Rama[] = [
	{celda: [0, 2], azimut: 150, nombre: 'izquierda'}, // se abre hacia atrás-izquierda
	{celda: [4, 2], azimut: 315, nombre: 'derecha'}, // hacia adelante-derecha
	{celda: [2, 4], azimut: 45, nombre: 'atrás'}, // hacia atrás-derecha
	{celda: [2, 0], azimut: 225, nombre: 'frente'}, // hacia adelante-izquierda
];
type Soporte = {pieza: Pieza; stud: number; enTronco: boolean; nombre: string};
const soportes: Soporte[] = [];
let collar: Pieza, brazo1: Pieza, brazo2: Pieza, tope: Pieza;
{
	const t = tronco;
	const plato = t.poner('11213', 'Dark_Brown', {nombre: 'plato del tronco'});
	// Corazón del tronco: cuatro columnas redondas 1 × 1 × 6 (se ve acanalado, como corteza).
	const cols = ([[2, 2], [3, 2], [2, 3], [3, 3]] as [number, number][]).map(([i, j]) => t.poner('43888', 'Reddish_Brown', {sobre: plato, stud: [i, j], nombre: 'columna'}));
	t.paso();
	// Los cuatro cuellos, de a dos por paso (uno que se abre a cada lado).
	const cuellos = RAMAS.map((r, k) => {
		const tocon = t.poner('3941', 'Reddish_Brown', {sobre: plato, stud: r.celda, nombre: `tocón ${r.nombre}`});
		const pie = t.poner('18674', 'Reddish_Brown', {sobre: tocon, stud: [0, 0], nombre: `pie del cuello ${r.nombre}`});
		const cuello = t.poner('67361', 'Reddish_Brown', {conector: {de: pie, n: 6}, propio: 4, giro: giroCuello(r.azimut), nombre: `cuello ${r.nombre}`});
		if (k % 2) t.paso();
		return cuello;
	});
	// Guía central: una pieza redonda ata las cuatro columnas; encima, el collar con un agujero de pin
	// por lado (de ahí salen las ramas bajas) y la guía que sostiene el racimo más alto.
	const atadura = t.poner('3941', 'Reddish_Brown', {sobre: cols[0], stud: [0, 0], nombre: 'atadura'});
	collar = t.poner('6222', 'Reddish_Brown', {sobre: atadura, stud: [0, 0], con: [1, 1], nombre: 'collar'});
	let c = t.poner('3941', 'Reddish_Brown', {sobre: collar, stud: [1, 1], nombre: 'guía'});
	for (let k = 0; k < 2; k++) c = t.poner('3941', 'Reddish_Brown', {sobre: c, stud: [0, 0], nombre: 'guía'});
	t.paso();
	// Dos brazos cruzados (placas 2 × 12) sostienen los racimos altos de los cuatro costados.
	brazo1 = t.poner('2445', 'Reddish_Brown', {sobre: c, stud: [0, 0], con: [5, 0], nombre: 'brazo 1'});
	c = t.poner('3941', 'Reddish_Brown', {sobre: brazo1, stud: [5, 0], nombre: 'guía'});
	t.paso();
	brazo2 = t.poner('2445', 'Reddish_Brown', {sobre: c, stud: [0, 0], con: [5, 0], giro: 90, nombre: 'brazo 2'});
	c = t.poner('3941', 'Reddish_Brown', {sobre: brazo2, stud: [5, 0], giro: 90, nombre: 'guía'});
	tope = t.poner('18674', 'Reddish_Brown', {sobre: c, stud: [0, 0], nombre: 'tope'});
	t.paso();
	// Ramas altas: una sección de cola en la boca de cada cuello, con un cono en la punta.
	RAMAS.forEach((r, k) => {
		const s = t.poner('40378', 'Reddish_Brown', {en: mundo(cuellos[k], BOCA), rot: `X45 ${rotCuello(r.azimut)}`, nombre: `rama ${r.nombre}`});
		soportes.push({pieza: t.poner('11610', 'Lavender', {conector: {de: s, n: 1}, propio: 1, nombre: `cono ${r.nombre}`}), stud: 2, enTronco: true, nombre: `cuello ${r.nombre}`});
		if (k % 2) t.paso();
	});
}

// ---------------------------------------------------------------------------------------------
// MODELO PRINCIPAL
const EN_TRONCO = grilla(0, 2, 0);
const R = m.raiz;

// Paso 1: el tronco va al centro del cantero y se le enchufan las cuatro ramas bajas en el collar.
R.colocar(cantero);
R.colocar(tronco, {en: EN_TRONCO});
// Agujeros del collar (6222): 12 al frente (−Z), 13 atrás, 14 a la derecha (+X), 15 a la izquierda.
([[12, 'frente'], [13, 'atrás'], [14, 'derecha'], [15, 'izquierda']] as [number, string][]).forEach(([h, lado]) => {
	const u = encastreExterno(collar, h, '40378', 0, 0, EN_TRONCO);
	const s = R.poner('40378', 'Reddish_Brown', {en: u.en, rot: u.rot, nombre: `rama baja ${lado}`});
	soportes.push({pieza: R.poner('11610', 'Lavender', {conector: {de: s, n: 1}, propio: 1, nombre: `cono bajo ${lado}`}), stud: 2, enTronco: false, nombre: `rama baja ${lado}`});
});
// Puntas de los brazos (2445): el conector 47 es el stud (0,0) y el 24 el (11,1).
soportes.push({pieza: brazo1, stud: 47, enTronco: true, nombre: 'brazo izquierda'});
soportes.push({pieza: brazo1, stud: 24, enTronco: true, nombre: 'brazo derecha'});
soportes.push({pieza: brazo2, stud: 47, enTronco: true, nombre: 'brazo frente'});
soportes.push({pieza: brazo2, stud: 24, enTronco: true, nombre: 'brazo atrás'});
R.paso();

// Racimo: base redonda con stud central y cuatro hojas apiladas, cada una corrida y girada respecto de
// la anterior (borde irregular), de lila oscuro abajo a lavanda claro arriba.
type Hoja = {id: string; color: string; sobre?: number; stud?: [number, number]; con?: [number, number]; giro?: number};
const HOJAS: Hoja[] = [
	{id: '2417', color: 'Medium_Lilac'},
	{id: '2417', color: 'Medium_Lavender', sobre: 1, stud: [0, 3], con: [2, 3], giro: 90},
	{id: '2417', color: 'Medium_Lavender', sobre: 2, stud: [4, 3], con: [2, 3], giro: 180},
	{id: '2417', color: 'Lavender', sobre: 3, stud: [2, 3], con: [2, 3], giro: 270},
	{id: '24866', color: 'Lavender', sobre: 4, stud: [2, 3]},
	{id: '24866', color: 'Lavender', sobre: 4, stud: [0, 5]},
	{id: '24866', color: 'White', sobre: 4, stud: [4, 4]},
	{id: '24866', color: 'Medium_Lavender', sobre: 4, stud: [2, 0]},
];
// Centro de las hojas en coordenadas del racimo (para girarlo con el grueso hacia el tronco).
const centroRacimo: V = (() => {
	const aux = new Modelo('aux').raiz;
	const ps = [aux.poner('18674', 16)];
	HOJAS.forEach((h, k) => ps.push(k === 0 ? aux.poner(h.id, 16, {conector: {de: ps[0], n: 6}, propio: 5}) : aux.poner(h.id, 16, {sobre: ps[h.sobre!], stud: h.stud!, con: h.con, giro: h.giro})));
	const hojas = ps.slice(1, 5).map((p) => p.tr.t as V);
	return hojas.reduce((a, b) => sumar(a, b)).map((x) => x / hojas.length) as V;
})();
// Flores caídas: 1 × 1 en el pasto, debajo de cada racimo, en studs libres del piso. El piso está en otro
// sub-armado, así que se ubican en su grilla (el cantero está en el origen).
const ocupados = new Set<string>();
const clave = (i: number, j: number) => `${i},${j}`;
// Studs del piso (i, j de -8 a 7, centro del stud en (i + 0.5) × 20): se evita la tierra, las raíces y
// las esquinas redondeadas.
function libre(i: number, j: number) {
	const x = i + 0.5, z = j + 0.5;
	if (Math.abs(x) > 7.5 || Math.abs(z) > 7.5) return false;
	if (Math.hypot(x, z) < 4.6) return false; // tierra
	if ((Math.abs(x) < 1.1 && Math.abs(z) < 5.6) || (Math.abs(z) < 1.1 && Math.abs(x) < 5.6)) return false; // raíces
	const ex = Math.abs(x) - 3.5, ez = Math.abs(z) - 3.5; // redondeo de radio 4 en las esquinas
	if (ex > 0 && ez > 0 && Math.hypot(ex, ez) > 3.9) return false;
	return !ocupados.has(clave(i, j));
}
const FLORES: [string, string][] = [['24866', 'Lavender'], ['98138', 'Medium_Lavender'], ['24866', 'Medium_Lavender'], ['98138', 'Lavender']];
let nFlor = 0;
function florCaida(x: number, z: number) {
	// El stud libre más cercano a (x, z) (en LDU).
	let mejor: [number, number] | null = null;
	let dm = Infinity;
	for (let i = -8; i < 8; i++)
		for (let j = -8; j < 8; j++) {
			if (!libre(i, j)) continue;
			const d = Math.hypot((i + 0.5) * 20 - x, (j + 0.5) * 20 - z);
			if (d < dm) (dm = d), (mejor = [i, j]);
		}
	if (!mejor) return;
	ocupados.add(clave(mejor[0], mejor[1]));
	const [id, color] = FLORES[nFlor++ % FLORES.length];
	R.poner(id, color, {en: grilla(mejor[0] + 0.5, 1, mejor[1] + 0.5), nombre: 'flor caída'});
}

// Coloca un racimo sobre el soporte; `cortes` dice después de qué piezas se cierra un paso. El giro del
// racimo alrededor de su stud es el que deja el grueso de las hojas más cerca del eje del árbol (en los
// brazos, más lejos: ahí la guía está pegada).
function racimo(s: Soporte, cortes: number[]) {
	let mejor: {en: V; rot: string; d: number} | null = null;
	for (let g = 0; g < 360; g += 15) {
		const u = encastreExterno(s.pieza, s.stud, '18674', 0, g, s.enTronco ? EN_TRONCO : [0, 0, 0]);
		const c = sumar(u.en, ap(u.r, centroRacimo));
		// Los racimos de los brazos, pegados a la guía, van con el grueso hacia afuera.
		const d = Math.hypot(c[0], c[2]) * (s.nombre.startsWith('brazo') ? -1 : 1);
		if (!mejor || d < mejor.d) mejor = {en: u.en, rot: u.rot, d};
	}
	const ps = [R.poner('18674', 'Medium_Lilac', {en: mejor!.en, rot: mejor!.rot, nombre: `base ${s.nombre}`})];
	HOJAS.forEach((h, k) => {
		ps.push(k === 0 ? R.poner(h.id, h.color, {conector: {de: ps[0], n: 6}, propio: 5, nombre: `hoja ${s.nombre}`}) : R.poner(h.id, h.color, {sobre: ps[h.sobre!], stud: h.stud!, con: h.con, giro: h.giro, nombre: `hoja ${s.nombre}`}));
		if (k === HOJAS.length - 1) {
			// Dos flores caen al pasto debajo del racimo.
			florCaida(mejor!.en[0], mejor!.en[2]);
			florCaida(mejor!.en[0] + 15, mejor!.en[2] - 15);
		}
		if (cortes.includes(k + 1)) R.paso();
	});
}

// Orden de floración: de atrás hacia adelante (visto desde la cámara 3/4, que está adelante a la derecha)
// y el racimo de la guía al final.
const lejania = (s: Soporte) => {
	const p = sumar(s.pieza.tr.t as V, s.enTronco ? EN_TRONCO : [0, 0, 0]);
	return p[2] - p[0];
};
// Por capas, de abajo hacia arriba (así cada racimo entra desde arriba sin chocar con los que ya están):
// ramas bajas, brazo 1, cuellos, brazo 2; dentro de cada capa, de atrás hacia adelante.
const capa = (s: Soporte) => ['rama baja', 'brazo izquierda', 'brazo derecha', 'cuello', 'brazo frente', 'brazo atrás'].findIndex((p) => s.nombre.startsWith(p));
const nivel = (s: Soporte) => [0, 1, 1, 2, 3, 3][capa(s)];
const orden = [...soportes].sort((a, b) => nivel(a) - nivel(b) || lejania(b) - lejania(a));
racimo(orden[0], [2, HOJAS.length]); // el primero se muestra en dos pasos
// Uno por paso; los dos de la capa más alta (frente y atrás de un mismo brazo) van juntos: desde el
// frente, el de atrás casi no cambia la silueta.
for (let k = 1; k < orden.length; k++) racimo(orden[k], k === orden.length - 2 ? [] : [HOJAS.length]);
racimo({pieza: tope, stud: 6, enTronco: true, nombre: 'guía'}, [HOJAS.length]);
m.guardar();
