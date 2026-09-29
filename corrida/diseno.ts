import {Modelo, grilla} from '../taller/src/dsl.ts';

// Cerezo japonés (Somei-Yoshino) en plena floración.
// Sub-armados: base (pasto, montículo, raíces, pétalos) · tronco (tronco, ramas madre en bisagra, guía) ·
// racimo (tres hojas 6x5 giradas 60° sobre un mismo eje) · copa (piso alto y los racimos de arriba).

const m = new Modelo('cerezo');
const RB = 'Reddish_Brown';
const ROSA = 'Bright_Pink';

type Pieza = ReturnType<typeof m.raiz.poner>;
type Vec = [number, number, number];
type Giro90 = 0 | 90 | 180 | 270;

// ---------- utilidades para anclar un sub-armado a una pieza de otro sub-armado ----------
// Rotación (por filas, como LDraw) → giros "X.. Y.. Z.." que el DSL rearma igual (Rz·Ry·Rx).
function rotTexto(r: readonly number[]): string {
	const b = Math.asin(Math.max(-1, Math.min(1, -r[6])));
	const recta = Math.abs(Math.cos(b)) > 1e-9;
	const a = recta ? Math.atan2(r[7], r[8]) : Math.atan2(-r[5], r[4]);
	const c = recta ? Math.atan2(r[3], r[0]) : 0;
	const g = (x: number) => Number(((x * 180) / Math.PI).toFixed(6));
	return `X${g(a)} Y${g(b)} Z${g(c)}`;
}
function rotY(grados: number): number[] {
	const a = (grados * Math.PI) / 180;
	return [Math.cos(a), 0, Math.sin(a), 0, 1, 0, -Math.sin(a), 0, Math.cos(a)];
}
function multiplicar(a: readonly number[], b: readonly number[]): number[] {
	const r: number[] = [];
	for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) r.push(a[3 * i] * b[j] + a[3 * i + 1] * b[3 + j] + a[3 * i + 2] * b[6 + j]);
	return r;
}
const suma = (a: readonly number[], b: readonly number[]): Vec => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];

// Copia de `base` en un modelo auxiliar (nunca se guarda), para encastrar ahí la primera pieza de otro sub-armado.
function copiaAux(base: Pieza) {
	const aux = new Modelo('aux').raiz;
	const copia = aux.poner(base.archivo, base.color.codigo, {en: [...base.tr.t] as Vec, rot: rotTexto(base.tr.r)});
	const d = Math.max(...copia.tr.r.map((x, i) => Math.abs(x - base.tr.r[i])));
	if (d > 1e-5) throw new Error(`rotTexto no reproduce la rotación de ${base.archivo}`);
	return {aux, copia};
}
type Encastre =
	| {stud: [number, number]; con?: [number, number]; giro?: Giro90}
	| {antistud: [number, number]; con?: [number, number]; giro?: Giro90}
	| {n: number; propio: number; giro?: number};
// Dónde colocar un sub-armado para que su primera pieza (`id`, en el origen del sub-armado) encastre en `base`
// como indica `e`. `giroExtra` gira todo alrededor del eje vertical local de esa primera pieza (sirve cuando
// el encastre está en su origen, como el centro de la hoja 6x5). `en`: dónde está el sub-armado de `base`.
function anclaje(base: Pieza, id: string, e: Encastre, giroExtra = 0, en: Vec = [0, 0, 0]) {
	const {aux, copia} = copiaAux(base);
	const p =
		'stud' in e
			? aux.poner(id, 0, {sobre: copia, stud: e.stud, con: e.con ?? [0, 0], giro: e.giro ?? 0})
			: 'antistud' in e
				? aux.poner(id, 0, {debajo: copia, antistud: e.antistud, con: e.con ?? [0, 0], giro: e.giro ?? 0})
				: aux.poner(id, 0, {conector: {de: copia, n: e.n}, propio: e.propio, giro: e.giro ?? 0});
	const r = giroExtra === 0 ? p.tr.r : multiplicar(p.tr.r, rotY(giroExtra));
	return {en: suma(p.tr.t, en), rot: rotTexto(r)};
}
// Stud (i, j) de `pieza` que cae en la posición x, z (LDU, en el sistema de su sub-armado).
function studEn(pieza: Pieza, x: number, z: number): [number, number] {
	const {aux, copia} = copiaAux(pieza);
	for (let j = 0; j < 16; j++)
		for (let i = 0; i < 16; i++) {
			try {
				const p = aux.poner('6141', 0, {sobre: copia, stud: [i, j]});
				if (Math.abs(p.tr.t[0] - x) < 0.5 && Math.abs(p.tr.t[2] - z) < 0.5) return [i, j];
			} catch {
				// fuera de la grilla
			}
		}
	throw new Error(`${pieza.archivo} no tiene stud en ${x}, ${z}`);
}
// Posición (LDU) del stud (i, j) de la placa 16x16 de la base.
const XZ = (i: number, j: number): [number, number] => [-150 + 20 * i, -150 + 20 * j];

// ================= BASE =================
const base = m.sub('base');
const pasto = base.poner('91405', 'Green', {nombre: 'pasto'});
base.paso();
// Montículo redondo 8x8: cuatro placas 4x4 con esquina redonda; el tronco las traba en el centro.
const cuartos = [
	base.poner('30565', 'Bright_Green', {sobre: pasto, stud: [8, 7], con: [0, 3], giro: 0, nombre: 'monticulo-NE'}),
	base.poner('30565', 'Bright_Green', {sobre: pasto, stud: [8, 8], con: [0, 3], giro: 90, nombre: 'monticulo-SE'}),
	base.poner('30565', 'Bright_Green', {sobre: pasto, stud: [7, 8], con: [0, 3], giro: 180, nombre: 'monticulo-SO'}),
	base.poner('30565', 'Bright_Green', {sobre: pasto, stud: [7, 7], con: [0, 3], giro: 270, nombre: 'monticulo-NO'}),
];
// Pétalos caídos (tejas de cuarto de círculo): la sombra rosa de la copa sobre el pasto. Aparecen de a poco
// mientras se arma la base y anticipan lo que va a ser el árbol.
const PETALOS: [number, number, Giro90, string][] = [
	[3, 6, 0, ROSA], [2, 9, 90, ROSA], [4, 13, 180, 'White'], [6, 14, 270, ROSA], [9, 13, 0, ROSA], [12, 12, 90, 'White'],
	[13, 8, 180, ROSA], [14, 5, 270, ROSA], [11, 2, 0, 'White'], [8, 2, 90, ROSA], [7, 0, 180, ROSA], [12, 5, 0, ROSA],
];
const petalos = (desde: number, hasta: number) => {
	for (const [i, j, g, c] of PETALOS.slice(desde, hasta)) base.poner('25269', c, {sobre: pasto, stud: [i, j], giro: g, nombre: `petalo-${i}-${j}`});
};
petalos(0, 4);
base.paso();
// Pone `id` sobre el cuarto de montículo que tenga el stud (i, j) de la base.
function sobreMonticulo(id: string, color: string, i: number, j: number, giro: Giro90, nombre: string) {
	const [x, z] = XZ(i, j);
	for (const c of cuartos) {
		let s: [number, number];
		try {
			s = studEn(c, x, z);
		} catch {
			continue;
		}
		return base.poner(id, color, {sobre: c, stud: s, giro, nombre});
	}
	throw new Error(`sin montículo en ${i}, ${j}`);
}
// Raíces: curvas 2x1 en molinete, con el lado alto contra el tronco (ensanche de la base).
sobreMonticulo('11477', RB, 5, 7, 270, 'raiz-O');
sobreMonticulo('11477', RB, 8, 5, 0, 'raiz-N');
sobreMonticulo('11477', RB, 10, 8, 90, 'raiz-E');
sobreMonticulo('11477', RB, 7, 10, 180, 'raiz-S');
for (const [i, j, g] of [[5, 9, 90], [10, 5, 0], [9, 10, 180]] as const) sobreMonticulo('25269', ROSA, i, j, g, `petalo-m-${i}-${j}`);
base.paso();
// Jardín: caminito de piedras hacia la cámara 3/4 (esquina de menor X y Z), matas de pasto y más pétalos.
for (const [i, j] of [[1, 0], [3, 1], [5, 2]] as const) base.poner('14769', 'Light_Bluish_Grey', {sobre: pasto, stud: [i, j], nombre: `piedra-${i}${j}`});
for (const [i, j, g] of [[12, 2, 0], [1, 12, 90], [14, 13, 180]] as const) base.poner('32607', 'Bright_Green', {sobre: pasto, stud: [i, j], giro: g, nombre: `mata-${i}${j}`});
petalos(4, PETALOS.length);
base.paso();

// ================= TRONCO =================
const tronco = m.sub('tronco');
const t1 = tronco.poner('3941', RB, {nombre: 't1'});
const t2 = tronco.poner('3941', RB, {sobre: t1, stud: [0, 0], nombre: 't2'});
tronco.paso();
const horqueta = tronco.poner('3031', RB, {sobre: t2, stud: [0, 0], con: [1, 1], nombre: 'horqueta'});
// Pliegues de corteza bajo la horqueta: el tronco engorda donde se abren las ramas.
for (const [i, j] of [[1, 0], [3, 1], [2, 3], [0, 2]] as const) tronco.poner('3062b', RB, {debajo: horqueta, antistud: [i, j], nombre: `pliegue-${i}${j}`});
tronco.paso();

// Ramas madre en molinete. Cada una: bisagra base en una esquina de la horqueta (el dedo mira hacia adentro),
// placa-bisagra que sube `alfa` grados hacia afuera, leño 1x4, segunda bisagra que devuelve la punta casi a
// horizontal (cae `CAIDA` grados hacia afuera, como las ramas largas del cerezo) y un brazo 1x4 para el racimo.
const RAMAS = {E: {stud: [3, 0], g: 180}, S: {stud: [3, 3], g: 270}, O: {stud: [0, 3], g: 0}, N: {stud: [0, 0], g: 90}} as const;
const CAIDA = 15;
function rama(dir: keyof typeof RAMAS, alfa: number, pasoIntermedio: boolean) {
	const {stud, g} = RAMAS[dir];
	const b1 = tronco.poner('44302a', RB, {sobre: horqueta, stud: [...stud] as [number, number], con: [1, 0], giro: g, nombre: `bisagra-${dir}`});
	const r1 = tronco.poner('44301a', RB, {conector: {de: b1, n: 2}, propio: 5, giro: alfa, nombre: `rama-${dir}`});
	const leno = tronco.poner('30137', RB, {sobre: r1, stud: [0, 0], con: [3, 0], giro: g, nombre: `leno-${dir}`});
	if (pasoIntermedio) tronco.paso();
	const g2 = ((g + 180) % 360) as Giro90;
	const b2 = tronco.poner('44302a', RB, {sobre: leno, stud: [0, 0], con: [0, 0], giro: g2, nombre: `bisagra2-${dir}`});
	const r2 = tronco.poner('44301a', RB, {conector: {de: b2, n: 2}, propio: 5, giro: CAIDA, nombre: `punta-${dir}`});
	// El brazo va una placa más arriba (sobre dos placas 1x1) para pasar por encima de los dedos de la
	// bisagra y dejarla caer sin rozar.
	const s0 = tronco.poner('3024', RB, {sobre: r2, stud: [0, 0], nombre: `calza-${dir}0`});
	tronco.poner('3024', RB, {sobre: r2, stud: [1, 0], nombre: `calza-${dir}1`});
	return tronco.poner('3710', RB, {sobre: s0, stud: [0, 0], con: [0, 0], giro: g2, nombre: `brazo-${dir}`});
}
// Primero las de atrás (vistas desde la cámara 3/4), después las de adelante. La primera se muestra en dos
// pasos; las otras dos de adelante, juntas.
const ramas = {E: rama('E', 30, true)} as Record<'E' | 'S' | 'O' | 'N', Pieza>;
tronco.paso();
ramas.S = rama('S', 22, false);
tronco.paso();
ramas.O = rama('O', 34, false);
ramas.N = rama('N', 26, false);
tronco.paso();
// Guía central: más delgada que el tronco (regla de Leonardo), sale del centro de la horqueta.
const guia0 = tronco.poner('3941', RB, {sobre: horqueta, stud: [1, 1], nombre: 'guia0'});
const guia = tronco.poner('43888', RB, {sobre: guia0, stud: [0, 0], nombre: 'guia'});
tronco.paso();

// ================= RACIMO =================
// Tres hojas 6x5 apiladas en un mismo eje, giradas 60° entre sí y separadas por placas redondas 1x1: un
// pompón de flor. `detallado`: se arma en pasos (la primera vez). `colgante`: una hoja 4x3 rosa oscuro
// debajo, al costado del brazo, que le da sombra y cuerpo a la nube.
function hacerRacimo(nombre: string, detallado: boolean, colgante: boolean) {
	const r = m.sub(nombre);
	const hojaA = r.poner('2417', ROSA, {nombre: 'hojaA'});
	if (colgante) r.poner('2423', 'Dark_Pink', {debajo: hojaA, antistud: [4, 3], con: [1, 0], nombre: 'colgante'});
	const sep1 = r.poner('6141', ROSA, {sobre: hojaA, stud: [2, 3], nombre: 'sep1'});
	if (detallado) r.paso();
	const hojaB = r.poner('2417', 'White', {conector: {de: sep1, n: 1}, propio: 5, giro: 60, nombre: 'hojaB'});
	const sep2 = r.poner('6141', ROSA, {sobre: hojaB, stud: [2, 3], nombre: 'sep2'});
	if (detallado) r.paso();
	const hojaC = r.poner('2417', ROSA, {conector: {de: sep2, n: 1}, propio: 5, giro: 120, nombre: 'hojaC'});
	r.poner('24866', 'White', {sobre: hojaC, stud: [2, 3], nombre: 'flor'});
	r.paso();
	return r;
}
const racimoPasoAPaso = hacerRacimo('racimo', true, true);
const racimoBajo = hacerRacimo('racimo-bajo', false, true);
const racimo = hacerRacimo('racimo-armado', false, false);
const CENTRO_HOJA = {stud: [0, 0] as [number, number], con: [2, 3] as [number, number]};

// ================= COPA (piso alto) =================
// Una 2x2 que entra por su tubo central en el stud único de la guía (así puede girar lo que quiera) y dos 2x8
// cruzadas: los racimos de arriba quedan entre los de abajo. Todo rosa: dentro de la copa no se ve estructura.
const copa = m.sub('copa');
const cruz0 = copa.poner('3022', ROSA, {nombre: 'cruz0'});
const cruzA = copa.poner('3034', ROSA, {conector: {de: cruz0, n: 8}, propio: 6, nombre: 'cruzA'});
const cruzB = copa.poner('3034', ROSA, {conector: {de: cruzA, n: 28}, propio: 7, giro: 90, nombre: 'cruzB'});
// Las puntas de la 2x8 de abajo suben dos placas para que sus racimos pasen por encima de la otra 2x8.
function alzar(desde: Pieza, stud: [number, number], alto: string[], nombre: string) {
	let p = desde;
	alto.forEach((id, k) => (p = copa.poner(id, ROSA, {sobre: p, stud: k === 0 ? stud : [0, 0], nombre: `${nombre}${k}`})));
	return p;
}
const alzaA0 = alzar(cruzA, [0, 0], ['6141', '6141'], 'alzaA0-');
const alzaA7 = alzar(cruzA, [7, 1], ['6141', '6141'], 'alzaA7-');
const copete = alzar(cruzB, [3, 0], ['3062b', '3062b'], 'copete');
copa.paso();
// Giro de cada racimo: su hoja colgante queda de costado a la 2x8 que lo sostiene.
const PISO_ALTO: [Pieza, [number, number], number][] = [[alzaA7, [0, 0], 90], [cruzB, [0, 1], 90], [cruzB, [7, 0], 270], [alzaA0, [0, 0], 270]];
for (const [pieza, stud, giro] of PISO_ALTO) {
	copa.colocar(racimoBajo, anclaje(pieza, '2417', {...CENTRO_HOJA, stud}, giro));
	copa.paso();
}
// La revelación: el último racimo, arriba de todo.
copa.colocar(racimo, anclaje(copete, '2417', CENTRO_HOJA, 25));
copa.paso();

// ================= MODELO =================
m.raiz.colocar(base);
m.raiz.paso();
const enTronco = anclaje(cuartos[3], '3941', {stud: studEn(cuartos[3], ...XZ(7, 7)), con: [0, 0]});
m.raiz.colocar(tronco, enTronco);
m.raiz.paso();
// Floración: un racimo por rama, de atrás hacia adelante. Cada racimo gira con su rama, así la hoja colgante
// queda siempre al costado del brazo.
(['E', 'S', 'O', 'N'] as const).forEach((dir, k) => {
	m.raiz.colocar(k === 0 ? racimoPasoAPaso : racimoBajo, anclaje(ramas[dir], '2417', {...CENTRO_HOJA, stud: [1, 0]}, 90 + 90 * k, enTronco.en));
	m.raiz.paso();
});
// La copa entra por el tubo central de su 2x2 en el stud de la guía, girada 30°: sus racimos no quedan
// alineados con los de abajo ni tapados entre sí en las vistas de frente y de lado.
m.raiz.colocar(copa, anclaje(guia, '3022', {n: 1, propio: 4, giro: 30}, 0, enTronco.en));
m.raiz.paso();
m.guardar();
void grilla;
