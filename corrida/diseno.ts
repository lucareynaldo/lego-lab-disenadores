// Jacarandá porteño en flor, sobre una vereda de Buenos Aires.
// Sub-armados: vereda (base), tronco (tierra, raíces y pivote), ramas (horqueta y seis ramas desnudas) y seis
// pompones de flor. Cada rama se arma derecha y se dobla con bisagras 3937/3938 (inclinación y codo); los pompones
// se arman aparte y se encastran en la punta de cada rama. El video muestra primero el árbol desnudo (invierno),
// después florece pompón por pompón y al final caen las flores sobre la vereda.
import {Modelo, grilla} from '../taller/src/dsl.ts';

// ---------- transformaciones: para ubicar un sub-armado sobre un stud de una pieza ya colocada ----------
type V3 = [number, number, number];
type M3 = number[];
type Tr = {r: M3; t: V3};
type ConTr = {tr: {r: number[]; t: number[]}};
const rad = (g: number) => (g * Math.PI) / 180;
const rotY = (g: number): M3 => [Math.cos(rad(g)), 0, Math.sin(rad(g)), 0, 1, 0, -Math.sin(rad(g)), 0, Math.cos(rad(g))];
const mv = (a: M3, v: V3): V3 => [a[0] * v[0] + a[1] * v[1] + a[2] * v[2], a[3] * v[0] + a[4] * v[1] + a[5] * v[2], a[6] * v[0] + a[7] * v[1] + a[8] * v[2]];
const mm = (a: M3, b: M3): M3 => {
	const o: M3 = [];
	for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) o.push(a[3 * i] * b[j] + a[3 * i + 1] * b[3 + j] + a[3 * i + 2] * b[6 + j]);
	return o;
};
const sum = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const res = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const IDENT: Tr = {r: [1, 0, 0, 0, 1, 0, 0, 0, 1], t: [0, 0, 0]};
const deg = (x: number) => Math.round(((x * 180) / Math.PI) * 1e4) / 1e4;
// r = Rz(c)·Ry(b)·Rx(a)  ->  "Xa Yb Zc" (el DSL aplica los giros de izquierda a derecha)
const euler = (r: M3) => `X${deg(Math.atan2(r[7], r[8]))} Y${deg(Math.asin(Math.max(-1, Math.min(1, -r[6]))))} Z${deg(Math.atan2(r[3], r[0]))}`;
// Sub-armado cuya pieza raíz apoya su anti-stud `q` (local del sub) sobre el stud `s` (local de la pieza `p`,
// que está en un sub-armado ubicado en `padre`), girado `giro` alrededor del eje del stud.
function sobreStud(padre: Tr, p: ConTr, s: V3, q: V3, giro = 0) {
	const W: Tr = {r: mm(padre.r, p.tr.r), t: sum(mv(padre.r, p.tr.t as V3), padre.t)};
	const r = mm(W.r, rotY(-giro));
	const t = res(sum(mv(W.r, s), W.t), mv(r, q));
	return {en: t, rot: euler(r), T: {r, t} as Tr};
}

const m = new Modelo('jacaranda');

// ---------- vereda ----------
// Base 16x16 sobre dos placas 8x16. Adelante (-Z): calle (tiles gris oscuro) y cordón (tiles gris claro). El resto
// es vereda: placas tan con los studs a la vista, que acá son las "vainillas" de la baldosa porteña. En el centro
// queda el hueco 6x6 de la cazuela, que llena la tierra del tronco. Coordenadas de stud en la base: a (x) y b (z), 0..15.
const vereda = m.sub('vereda');
const pA = vereda.poner('92438', 'Dark_Bluish_Grey', {en: grilla(0, 0, -4), nombre: 'base-frente'}); // b 0..7
const pB = vereda.poner('92438', 'Dark_Bluish_Grey', {en: grilla(0, 0, 4), nombre: 'base-fondo'}); // b 8..15
vereda.paso();
for (const a of [0, 4, 8, 12]) vereda.poner('87079', 'Dark_Bluish_Grey', {sobre: pA, stud: [a, 0], nombre: `calle-${a}`});
for (const a of [0, 8]) vereda.poner('4162', 'Light_Bluish_Grey', {sobre: pA, stud: [a, 2], nombre: `cordon-${a}`});
vereda.poner('4282', 'Tan', {sobre: pA, stud: [0, 3], nombre: 'vereda-frente'}); // b 3..4
vereda.poner('3032', 'Tan', {sobre: pA, stud: [3, 5], giro: 90, nombre: 'vereda-izq'}); // a 0..3, b 5..10
vereda.poner('3666', 'Tan', {sobre: pA, stud: [4, 5], giro: 90, nombre: 'vereda-izq2'}); // a 4
vereda.poner('3666', 'Tan', {sobre: pA, stud: [11, 5], giro: 90, nombre: 'vereda-der2'}); // a 11
vereda.poner('3032', 'Tan', {sobre: pA, stud: [15, 5], giro: 90, nombre: 'vereda-der'}); // a 12..15
for (const a of [0, 8]) vereda.poner('3460', 'Tan', {sobre: pB, stud: [a, 3], nombre: `vereda-fondo1-${a}`}); // b 11
for (const a of [0, 8]) vereda.poner('3035', 'Tan', {sobre: pB, stud: [a, 4], nombre: `vereda-fondo-${a}`}); // b 12..15
vereda.paso();

// ---------- tronco ----------
const tronco = m.sub('tronco');
const tierra = tronco.poner('3958', 'Dark_Brown', {en: grilla(0, 1, 0), nombre: 'tierra'});
tronco.poner('11477', 'Reddish_Brown', {sobre: tierra, stud: [2, 1], giro: 180, nombre: 'raiz-frente'});
tronco.poner('11477', 'Reddish_Brown', {sobre: tierra, stud: [3, 4], nombre: 'raiz-fondo'});
tronco.poner('11477', 'Reddish_Brown', {sobre: tierra, stud: [4, 2], giro: 270, nombre: 'raiz-der'});
tronco.poner('11477', 'Reddish_Brown', {sobre: tierra, stud: [1, 3], giro: 90, nombre: 'raiz-izq'});
tronco.poner('32607', 'Bright_Green', {sobre: tierra, stud: [0, 0], nombre: 'pasto-1'});
tronco.poner('32607', 'Green', {sobre: tierra, stud: [5, 4], giro: 180, nombre: 'pasto-2'});
tronco.poner('24866', 'Lavender', {sobre: tierra, stud: [1, 1], nombre: 'caida-cazuela-1'});
tronco.poner('25269', 'Medium_Lavender', {sobre: tierra, stud: [4, 0], giro: 90, nombre: 'caida-cazuela-2'});
tronco.paso();
const t1 = tronco.poner('3941', 'Reddish_Brown', {sobre: tierra, stud: [2, 2], nombre: 't1'});
const t2 = tronco.poner('3941', 'Reddish_Brown', {sobre: t1, stud: [0, 0], nombre: 't2'});
tronco.paso();
const t3 = tronco.poner('3941', 'Reddish_Brown', {sobre: t2, stud: [0, 0], nombre: 't3'});
// placa redonda con un solo stud al centro: ahí apoya la horqueta, que queda girada 45° (ramas hacia las diagonales)
const pivote = tronco.poner('18674', 'Reddish_Brown', {sobre: t3, stud: [0, 0], nombre: 'pivote'});
tronco.paso();

// ---------- ramas desnudas ----------
// Cada rama se arma en su propio marco (base de bisagra en el origen) en un modelo borrador que no se guarda:
// bisagra 3937 + tapa 3938 inclinada theta1 + ladrillos redondos 1x1 + codo (otra bisagra, que vuelve a theta2)
// + tronco 1x2. Después sus piezas se trasplantan al sub-armado 'ramas' con la posición calculada por el encastre.
const borrador = new Modelo('borrador');
function ramaBorrador(nombre: string, theta1: number, n1: number, theta2: number, n2: number) {
	const r = borrador.sub(nombre);
	const pasos: ReturnType<typeof r.poner>[][] = [[]];
	const poner = (...a: Parameters<typeof r.poner>) => {
		const x = r.poner(...a);
		pasos[pasos.length - 1].push(x);
		return x;
	};
	const b = poner('3937', 'Reddish_Brown', {nombre: `${nombre}-bisagra`});
	const tapa = poner('3938', 'Reddish_Brown', {conector: {de: b, n: 2}, propio: 0, giro: theta1, nombre: `${nombre}-tapa`});
	let ult = poner('3062b', 'Reddish_Brown', {sobre: tapa, stud: [0, 0], nombre: `${nombre}-tramo1`});
	for (let k = 2; k <= n1; k++) ult = poner('3062b', 'Reddish_Brown', {sobre: ult, stud: [0, 0], nombre: `${nombre}-tramo${k}`});
	if (n2 > 0) {
		pasos.push([]);
		// codo girado 180°: así el doblez relativo es positivo (con giro negativo la punta choca con la base del codo)
		const codo = poner('3937', 'Reddish_Brown', {sobre: ult, stud: [0, 0], giro: 180, con: [1, 0], nombre: `${nombre}-codo`});
		const tapa2 = poner('3938', 'Reddish_Brown', {conector: {de: codo, n: 2}, propio: 0, giro: 180 - theta2, nombre: `${nombre}-codo-tapa`});
		ult = poner('30136', 'Reddish_Brown', {sobre: tapa2, stud: [0, 0], nombre: `${nombre}-punta1`});
		for (let k = 2; k <= n2; k++) ult = poner('30136', 'Reddish_Brown', {sobre: ult, stud: [0, 0], nombre: `${nombre}-punta${k}`});
	}
	return {pasos, punta: ult};
}
const comp = (A: Tr, B: Tr): Tr => ({r: mm(A.r, B.r), t: sum(mv(A.r, B.t), A.t)});
const trDe = (p: ConTr): Tr => ({r: [...p.tr.r], t: [p.tr.t[0], p.tr.t[1], p.tr.t[2]]});

// ---------- pompón de flores: placas redondas escalonadas (6x6, 4x4, 2x2) con flores y hojitas ----------
const ANILLO6: [number, number][] = [[2, 0], [3, 0], [1, 1], [4, 1], [0, 2], [5, 2], [0, 3], [5, 3], [1, 4], [4, 4], [2, 5], [3, 5]];
const ANILLO4: [number, number][] = [[1, 0], [2, 0], [0, 1], [3, 1], [0, 2], [3, 2], [1, 3], [2, 3]];
// giro de la hojita 32607 (sus hojas apuntan hacia +X/-Z) para que mire hacia afuera según el cuadrante del stud
function giroHojita(i: number, j: number, n: number) {
	const x = i - (n - 1) / 2, z = j - (n - 1) / 2;
	if (x >= 0 && z < 0) return 0;
	if (x >= 0 && z >= 0) return 90;
	if (x < 0 && z >= 0) return 180;
	return 270;
}
// giro de la hoja 4x3 (se extiende hacia -Z desde su tallo) para que apunte hacia afuera
function giroFleco(i: number, j: number, n: number) {
	const x = i - (n - 1) / 2, z = j - (n - 1) / 2;
	if (Math.abs(x) > Math.abs(z)) return x > 0 ? 90 : 270;
	return z > 0 ? 180 : 0;
}
// Anillo 6x6 (índices): 0,1 = -Z · 2,3 = esquinas -Z · 4..7 = costados (-X par, +X impar) · 8,9 = esquinas +Z · 10,11 = +Z
type Tipo = 'flor' | 'hoja' | 'fleco' | 'vacio';
// hojitas: casi todas lila medio; algunas lila oscuro (sombra) y unas pocas verdes (el jacarandá florece casi sin hojas)
const HOJAS_VERDES = new Set(['flor-w-hoj0', 'flor-e-hoj10', 'flor-s-hoj1']);
function colorHoja(nombre: string, k: number) {
	if (HOJAS_VERDES.has(`${nombre}-hoj${k}`)) return 'Bright_Green';
	return (k + nombre.length) % 5 === 0 ? 'Medium_Lilac' : 'Medium_Lavender';
}
type OpPompon = {alto?: boolean; anillo?: Tipo[]; vacios4?: number[]; detalle?: boolean};
function pompon(nombre: string, op: OpPompon = {}) {
	const s = m.sub(nombre);
	const anillo = op.anillo ?? ANILLO6.map((): Tipo => 'flor');
	const vacios4 = op.vacios4 ?? [2, 5, 7];
	const p6 = s.poner('11213', 'Medium_Lavender', {nombre: `${nombre}-p6`});
	ANILLO6.forEach(([i, j], k) => {
		const t = anillo[k];
		if (t === 'fleco') s.poner('2423', 'Medium_Lavender', {sobre: p6, stud: [i, j], con: [0, 3], giro: giroFleco(i, j, 6), nombre: `${nombre}-fleco${k}`});
		else if (t === 'hoja') s.poner('32607', colorHoja(nombre, k), {sobre: p6, stud: [i, j], giro: giroHojita(i, j, 6), nombre: `${nombre}-hoj${k}`});
		else if (t === 'flor') s.poner('24866', 'Lavender', {sobre: p6, stud: [i, j], nombre: `${nombre}-f6-${k}`});
	});
	if (op.detalle) s.paso(); // el primer pompón se muestra en dos pasos; los demás, enteros
	let p4;
	if (op.alto) {
		const sep = s.poner('3941', 'Lavender', {sobre: p6, stud: [2, 2], nombre: `${nombre}-sep`});
		p4 = s.poner('60474', 'Medium_Lavender', {sobre: sep, stud: [0, 0], con: [1, 1], nombre: `${nombre}-p4`});
	} else p4 = s.poner('60474', 'Medium_Lavender', {sobre: p6, stud: [2, 2], con: [1, 1], nombre: `${nombre}-p4`});
	ANILLO4.forEach(([i, j], k) => {
		if (!vacios4.includes(k)) s.poner('24866', 'Lavender', {sobre: p4, stud: [i, j], nombre: `${nombre}-f4-${k}`});
	});
	const tope = s.poner('18674', 'Lavender', {sobre: p4, stud: [1, 1], nombre: `${nombre}-tope`});
	s.poner('33291', 'Lavender', {sobre: tope, stud: [0, 0], nombre: `${nombre}-flor-tope`});
	s.paso();
	return s;
}

// Qué va en cada stud del anillo según hacia dónde mira en el mundo: flores hacia el borde de la base (no
// sobresalen), un fleco hacia el hueco con el pompón vecino (sentido antihorario), hojitas hacia el otro hueco
// y nada hacia el tronco. Las hojitas nunca van en las esquinas del anillo (tocan la placa 4x4 redonda).
const LIMITE = 158;
const CENTROS_ALTOS: V3[] = [];
const TODOS: Tr[] = []; // ubicación de todos los pompones, para no rozar al vecino
// ¿el punto q queda metido en el volumen de otro pompón (disco de radio ~3,5 studs y ~2 ladrillos de alto)?
function cercaDeOtro(q: V3, propio: Tr) {
	return TODOS.some((U) => {
		if (U === propio) return false;
		const v = res(q, U.t);
		const n = mv(U.r, [0, -1, 0]);
		const h = v[0] * n[0] + v[1] * n[1] + v[2] * n[2];
		const radial = Math.hypot(v[0] - h * n[0], v[1] - h * n[1], v[2] - h * n[2]);
		return radial < 78 && h > -24 && h < 56;
	});
}
function anilloSegun(T: Tr, central: boolean): Tipo[] {
	const c = T.t;
	const r = Math.hypot(c[0], c[2]);
	const fi = Math.atan2(c[2], c[0]);
	const hueco: V3 = [r * Math.cos(fi + Math.PI / 4) - c[0], 0, r * Math.sin(fi + Math.PI / 4) - c[2]];
	const ejeFleco: V3 = Math.abs(hueco[0]) > Math.abs(hueco[2]) ? [Math.sign(hueco[0]), 0, 0] : [0, 0, Math.sign(hueco[2])];
	const haciaCentro: V3 = [-c[0] / (r || 1), 0, -c[2] / (r || 1)];
	let flecoPuesto = false;
	const tipos = ANILLO6.map(([i, j]): Tipo => {
		const x = i - 2.5, z = j - 2.5;
		const esquina = Math.abs(x) === Math.abs(z);
		const d: V3 = esquina ? [Math.sign(x) * Math.SQRT1_2, 0, Math.sign(z) * Math.SQRT1_2] : Math.abs(x) > Math.abs(z) ? [Math.sign(x), 0, 0] : [0, 0, Math.sign(z)];
		const w = mv(T.r, d);
		const adentro = w[0] * haciaCentro[0] + w[2] * haciaCentro[2];
		const pStud = sum(T.t, mv(T.r, [-50 + 20 * i, -8, -50 + 20 * j]));
		const puntaHoja = sum(pStud, mv(T.r, [Math.sign(x) * 30, 0, Math.sign(z) * 30]));
		if (central) return esquina ? 'flor' : cercaDeOtro(puntaHoja, T) || cercaDeOtro(pStud, T) ? 'flor' : 'hoja';
		if (esquina) return adentro > 0.8 ? 'vacio' : 'flor';
		if (adentro > 0.8) return 'vacio';
		// posición del stud en el mundo y alcance de la pieza (fleco ~3,6 studs hacia afuera; hojita ~1,4 studs en
		// diagonal hacia su cuadrante): no debe salir de la huella de la base (16x16)
		const p = sum(T.t, mv(T.r, [-50 + 20 * i, 0, -50 + 20 * j]));
		const dentro = (o: V3) => Math.abs(p[0] + o[0]) <= LIMITE && Math.abs(p[2] + o[2]) <= LIMITE;
		const alFleco = w[0] * ejeFleco[0] + w[2] * ejeFleco[2];
		// el fleco no debe meterse debajo de los pompones altos del centro
		const tramoFleco = [0.4, 0.7, 1].map((f) => sum(p, mv(T.r, [d[0] * 72 * f, 0, d[2] * 72 * f])));
		const lejosDelEje = tramoFleco.every((q) => CENTROS_ALTOS.every((c) => Math.hypot(q[0] - c[0], q[2] - c[2]) > 80));
		if (alFleco > 0.9 && !flecoPuesto && lejosDelEje && dentro(mv(T.r, [d[0] * 72, 0, d[2] * 72]))) {
			flecoPuesto = true;
			return 'fleco';
		}
		return dentro(mv(T.r, [Math.sign(x) * 30, 0, Math.sign(z) * 30])) && !cercaDeOtro(puntaHoja, T) ? 'hoja' : 'flor';
	});
	return tipos;
}

// ---------- montaje ----------
// Un sub-armado por paso del modelo principal (si un paso trae dos, el visor funde el último paso de uno con el
// primero del otro). El visor muestra primero todos los pasos de los sub-armados y al final los del principal.

// sub-armado 'ramas': la horqueta (placa redonda 4x4) y las seis ramas desnudas
const ramasSub = m.sub('ramas');
const hub = ramasSub.poner('60474', 'Dark_Brown', {nombre: 'horqueta'});
// 3937: anti-stud (0,0) en local (-10, 24, 0). Studs de la horqueta 4x4: local (-30 + 20i, 0, -30 + 20j).
const hs = (i: number, j: number): V3 => [-30 + 20 * i, 0, -30 + 20 * j];
const q3937: V3 = [-10, 24, 0];
const GIRO_POMPON = -45; // compensa el giro de 45° de la horqueta: cada pompón queda alineado con la base
// paso: en qué paso del video entra cada tramo de la rama ([tramo inclinado, codo y punta])
type DefRama = {n: string; t1: number; n1: number; t2: number; n2: number; stud: [number, number]; giro: number; pompon: OpPompon; pasos: number[]};
const RAMAS: DefRama[] = [
	{n: 'n', t1: 44, n1: 3, t2: 30, n2: 1, stud: [1, 0], giro: 0, pompon: {alto: true, detalle: true}, pasos: [0, 1]},
	{n: 'e', t1: 46, n1: 3, t2: 32, n2: 1, stud: [3, 1], giro: 90, pompon: {alto: true}, pasos: [2, 3]},
	{n: 's', t1: 40, n1: 3, t2: 26, n2: 1, stud: [2, 3], giro: 180, pompon: {alto: true}, pasos: [4, 4]},
	{n: 'w', t1: 42, n1: 3, t2: 28, n2: 1, stud: [0, 2], giro: 270, pompon: {alto: true}, pasos: [5, 5]},
	{n: 'cn', t1: 14, n1: 6, t2: 0, n2: 0, stud: [1, 1], giro: 0, pompon: {alto: true}, pasos: [6]},
	{n: 'cs', t1: 10, n1: 7, t2: 0, n2: 0, stud: [2, 2], giro: 180, pompon: {alto: true}, pasos: [6]},
];
const pasosRamas: {tr: Tr; archivo: string; color: number; nombre?: string}[][] = [];
const ramas = RAMAS.map((d) => {
	const {pasos, punta} = ramaBorrador(`rama-${d.n}`, d.t1, d.n1, d.t2, d.n2);
	const Tb = sobreStud(IDENT, hub, hs(...d.stud), q3937, d.giro).T; // marco de la rama dentro de 'ramas'
	pasos.forEach((paso, k) => {
		const destino = (pasosRamas[d.pasos[k]] ??= []);
		for (const p of paso) destino.push({tr: comp(Tb, trDe(p)), archivo: p.archivo, color: p.color.codigo, nombre: p.nombre});
	});
	return {d, Tb, punta};
});
for (const paso of pasosRamas) {
	for (const p of paso) ramasSub.poner(p.archivo, p.color, {en: p.tr.t, rot: euler(p.tr.r), nombre: p.nombre});
	ramasSub.paso();
}
// la horqueta apoya su anti-stud central (0, 8, 0) en el stud único del pivote, girada 45°
const uRamas = sobreStud(IDENT, pivote, [0, 0, 0], [0, 8, 0], 45);

// pompones: anti-stud central (0, 8, 0) de la placa 6x6 sobre el stud (0,0) del tronco 1x2 de la punta (local (-10, 0, 0))
const ubic = ramas.map(({Tb, punta}) => sobreStud(comp(uRamas.T, Tb), punta, [-10, 0, 0], [0, 8, 0], GIRO_POMPON));
ramas.forEach(({d}, k) => {
	if (d.n.startsWith('c')) CENTROS_ALTOS.push(ubic[k].T.t);
	TODOS.push(ubic[k].T);
});
const flores = ramas.map(({d}, k) => pompon(`flor-${d.n}`, {...d.pompon, anillo: d.pompon.anillo ?? anilloSegun(ubic[k].T, d.n.startsWith('c'))}));

// Un paso del principal por sub-armado. Las piezas propias de un paso del principal aparecen junto con el último paso del
// sub-armado que ese paso trae; por eso el epílogo va en un paso final que solo tiene piezas.
m.raiz.colocar(vereda);
m.raiz.paso();
m.raiz.colocar(tronco);
m.raiz.paso();
m.raiz.colocar(ramasSub, {en: uRamas.en, rot: uRamas.rot});
m.raiz.paso();
// orden de floración: de atrás hacia adelante (vista 3/4): el pompón 'w', que mira de frente a la cámara, cierra la copa
for (const n of ['n', 'e', 's', 'cn', 'cs', 'w']) {
	const k = RAMAS.findIndex((d) => d.n === n);
	m.raiz.colocar(flores[k], {en: ubic[k].en, rot: ubic[k].rot});
	m.raiz.paso();
}
// Epílogo: las flores caídas sobre las "vainillas" de la vereda. Como están en el modelo principal y no en el
// sub-armado de la vereda, se ubican por coordenada de stud: a (x) y b (z), de 0 a 15; la cara de la vereda está a 1 placa.
const CAIDAS: [number, number, string, string][] = [
	[4, 3, '24866', 'Lavender'], [6, 4, '24866', 'Medium_Lavender'], [9, 3, '24866', 'Lavender'], [11, 4, '24866', 'Lavender'], [13, 3, '25269', 'Medium_Lavender'],
	[2, 6, '24866', 'Lavender'], [4, 8, '24866', 'Medium_Lavender'], [1, 9, '25269', 'Lavender'], [3, 10, '24866', 'Lavender'],
	[12, 6, '24866', 'Lavender'], [11, 9, '24866', 'Lavender'], [14, 8, '25269', 'Medium_Lavender'], [13, 10, '24866', 'Medium_Lavender'],
	[5, 11, '24866', 'Lavender'], [9, 12, '24866', 'Medium_Lavender'], [3, 13, '24866', 'Lavender'], [12, 12, '25269', 'Lavender'], [7, 14, '24866', 'Lavender'],
	[7, 4, '25269', 'Lavender'], [10, 11, '24866', 'Lavender'],
];
for (const [a, b, id, color] of CAIDAS) m.raiz.poner(id, color, {en: grilla(a - 7.5, 2, b - 7.5), rot: `Y${((a * 3 + b) % 4) * 90}`, nombre: `caida-${a}-${b}`});
m.raiz.paso();
m.guardar();
