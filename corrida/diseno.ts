import {Modelo, grilla} from '../taller/src/dsl.ts';

// Acacia de sabana (Vachellia tortilis): tronco corto, cuatro ramas en abanico y copa plana como un paraguas.
// Sub-armados: base, rama-larga (x2), rama-corta (x2), tronco y copa; al final, dos nidos de tejedor.
const m = new Modelo('acacia');
const RB = 'Reddish_Brown';

// Apoyar placas (giradas o no) dando el centro en LDU: calcula el stud de la base y el anti-stud propio.
// Solo resuelve índices de grilla; el encastre lo hace `sobre`.
type Caja = {x: number; z: number; w: number; d: number; giro?: number; faltan?: string[]}; // centro, studs en X y Z sin girar
const cajas = new Map<unknown, Caja>();
const ESQUINA = ['1,0', '2,0', '3,0', '3,1', '3,2']; // anti-studs/studs que no tiene la 30565
// giro g alrededor del stud (eje -Y): x' = cos·x − sin·z, z' = sin·x + cos·z
const girar = (g: number, x: number, z: number): [number, number] => {
	const r = (g * Math.PI) / 180, c = Math.round(Math.cos(r)), s = Math.round(Math.sin(r));
	return [c * x - s * z, s * x + c * z];
};
function celda(c: Caja, x: number, z: number): [number, number] | null {
	// punto del mundo -> índice (i, j) en la grilla propia de la pieza
	const [lx, lz] = girar(-(c.giro ?? 0), x - c.x, z - c.z);
	const i = (lx + c.w * 10 - 10) / 20, j = (lz + c.d * 10 - 10) / 20;
	if (!Number.isInteger(i) || !Number.isInteger(j) || i < 0 || j < 0 || i >= c.w || j >= c.d) return null;
	if (c.faltan?.includes(`${i},${j}`)) return null;
	return [i, j];
}
function apoyar(sub: any, id: string, color: string, base: any, c: Caja, nombre?: string) {
	const bc = cajas.get(base)!;
	for (let j = 0; j < c.d; j++)
		for (let i = 0; i < c.w; i++) {
			if (c.faltan?.includes(`${i},${j}`)) continue;
			const [ox, oz] = girar(c.giro ?? 0, -c.w * 10 + 10 + 20 * i, -c.d * 10 + 10 + 20 * j);
			const b = celda(bc, c.x + ox, c.z + oz);
			if (!b) continue;
			const p = sub.poner(id, color, {sobre: base, stud: b, con: [i, j], giro: c.giro ?? 0, nombre});
			cajas.set(p, c);
			return p;
		}
	throw new Error(`${id} en (${c.x}, ${c.z}) no pisa la base`);
}
function sobreCapa(sub: any, id: string, color: string, capa: unknown[], c: Caja, nombre?: string) {
	for (const b of capa) {
		try {
			return apoyar(sub, id, color, b, c, nombre);
		} catch {}
	}
	throw new Error(`${id} en (${c.x}, ${c.z}) no pisa ninguna pieza de la capa`);
}
function libre(sub: any, id: string, color: string, c: Caja, y = 0) {
	const p = sub.poner(id, color, {en: [c.x, y, c.z], rot: c.giro ? `Y${-c.giro}` : ''});
	cajas.set(p, c);
	return p;
}

// Ángulos exactos (ternas pitagóricas) para que la punta de cada rama caiga en la grilla de studs.
const T345 = (Math.atan2(3, 4) * 180) / Math.PI; // 36.87°: avanza 6 studs, sube 160 LDU
const T5_12 = (Math.atan2(5, 12) * 180) / Math.PI; // 22.62°: avanza 2 studs, sube 96 LDU

// ---------- base ----------
// Suelo de sabana de 12 x 12 con esquinas redondeadas: más chico que la copa, para que se lea el paraguas.
// Capa 1 en y = 0, capa 2 en y = -8.
const base = m.sub('base');
const suelo = libre(base, '3029', 'Tan', {x: 0, z: 0, w: 12, d: 4}); // franja central
base.paso();
const filas = [-80, 80].flatMap((z) => {
	const fila = [
		libre(base, '3031', 'Tan', {x: 0, z, w: 4, d: 4}),
		...[-80, 80].map((x) => {
			const g = x > 0 ? (z < 0 ? 0 : 90) : z > 0 ? 180 : 270;
			return libre(base, '30565', 'Tan', {x, z, w: 4, d: 4, giro: g, faltan: ESQUINA});
		}),
	];
	return fila;
});
base.paso(); // las dos filas redondeadas, fondo y frente
// capa 2: dos trabas cosen las tres filas; en el centro, tierra pelada donde va el tronco
const suelo1 = [suelo, ...filas];
const traba1 = sobreCapa(base, '3832', 'Tan', suelo1, {x: 0, z: -40, w: 10, d: 2});
const traba2 = sobreCapa(base, '3832', 'Tan', suelo1, {x: 0, z: 40, w: 10, d: 2});
const centro = apoyar(base, '3795', 'Dark_Tan', suelo, {x: 0, z: 0, w: 6, d: 2});
base.paso();
// raíces: cuatro curvas en molinete alrededor del hueco del tronco
for (const [x, z, g] of [[40, 10, 90], [-10, 40, 0], [-40, -10, 270], [10, -40, 180]])
	sobreCapa(base, '11477', RB, [centro, traba1, traba2], {x, z, w: 1, d: 2, giro: g}, 'raíz');
base.paso();
// Pasto y piedras en dos tandas; cada una trae dos matas altas de pasto (sobre un terroncito, así las
// hojas caídas no rozan el suelo), una mata seca y algo de piedra.
function pasto(x: number, z: number, g: number) {
	const terron = sobreCapa(base, '85861', 'Dark_Tan', suelo1, {x, z, w: 1, d: 1}, 'terrón');
	apoyar(base, '7264', 'Sand_Green', terron, {x, z, w: 1, d: 1, giro: g}, `pasto ${x},${z}`);
}
const mata = (x: number, z: number) => sobreCapa(base, '32607', 'Pearl_Gold', suelo1, {x, z, w: 1, d: 1}, `mata ${x},${z}`);
pasto(-90, 90, 0);
pasto(-110, -10, 180);
mata(-50, 110);
mata(-90, -90);
sobreCapa(base, '85861', 'Light_Bluish_Grey', suelo1, {x: -70, z: -70, w: 1, d: 1}, 'piedra');
base.paso();
pasto(90, -90, 90);
pasto(70, 90, 180);
mata(110, -30);
mata(30, -110);
sobreCapa(base, '14769', 'Dark_Bluish_Grey', suelo1, {x: 100, z: 0, w: 2, d: 2}, 'piedra');
sobreCapa(base, '11477', 'Light_Bluish_Grey', suelo1, {x: 110, z: 60, w: 1, d: 2}, 'piedra');
base.paso();

// ---------- ramas ----------
// Cada rama se arma recta, como un sub-armado, y después se clava de costado en el tronco con un perno
// Technic. El perno deja girarla al ángulo exacto; arriba, otro perno endereza el "nudillo" donde apoya
// la copa. Dos tipos: larga (3-4-5) y corta (5-12-13); cada uno se usa dos veces, girado 180°.
type Tr = {r: number[]; t: number[]};
const componer = (a: Tr, b: Tr): Tr => ({
	r: [0, 1, 2].flatMap((i) => [0, 1, 2].map((j) => a.r[3 * i] * b.r[j] + a.r[3 * i + 1] * b.r[3 + j] + a.r[3 * i + 2] * b.r[6 + j])),
	t: [0, 1, 2].map((i) => a.r[3 * i] * b.t[0] + a.r[3 * i + 1] * b.t[1] + a.r[3 * i + 2] * b.t[2] + a.t[i]),
});
function subRama(nombre: string, cuerpo: string[], angulo: number) {
	const s = m.sub(nombre);
	const b0 = s.poner('6541', RB);
	s.poner('2780', 'Black', {conector: {de: b0, n: 0}, propio: 3}); // el perno que va al tronco
	let top = b0;
	for (const id of cuerpo) top = s.poner(id, RB, {sobre: top, stud: [0, 0]});
	s.paso();
	const b1 = s.poner('6541', RB, {sobre: top, stud: [0, 0]});
	const pin2 = s.poner('2780', 'Black', {conector: {de: b1, n: 0}, propio: 0});
	// el nudillo se gira al revés que la rama: queda derecho cuando la rama está inclinada
	const nudillo = s.poner('6541', RB, {conector: {de: pin2, n: 3}, propio: 0, giro: -angulo});
	const tope = s.poner('85861', RB, {sobre: nudillo, stud: [0, 0]});
	s.paso();
	return {s, b0, tope, angulo};
}
const LARGA = subRama('rama-larga', ['43888', '3062b', '85861'], T345);
const CORTA = subRama('rama-corta', ['3062b', '3062b', '3062b', '85861'], -T5_12);

// ---------- tronco ----------
const tr = m.sub('tronco');
const t1 = tr.poner('3941', RB);
const t2 = tr.poner('3941', RB, {sobre: t1, stud: [0, 0]});
tr.paso();
// Piso 1: dos ladrillos Technic (agujeros en Z) y dos redondos, trabados por una placa redonda
const pA = tr.poner('6541', RB, {sobre: t2, stud: [1, 1]});
const pB = tr.poner('6541', RB, {sobre: t2, stud: [0, 0], giro: 180});
tr.poner('3062b', RB, {sobre: t2, stud: [0, 1]});
tr.poner('3062b', RB, {sobre: t2, stud: [1, 0]});
const s1 = tr.poner('4032a', RB, {sobre: pB, stud: [0, 0]});
tr.paso();

// Clava una rama en el agujero de `desde`. Dónde queda se calcula encastrando en un modelo borrador
// (perno en el agujero, ladrillo de la rama girado `giro` grados alrededor del perno).
const nudillos: number[][] = [];
function clavar(desde: any, rotDesde: string, tipo: ReturnType<typeof subRama>, giro: number) {
	const b = new Modelo('borrador').sub('b');
	const ancla = b.poner('6541', RB, {en: desde.tr.t, rot: rotDesde});
	const perno = b.poner('2780', 'Black', {conector: {de: ancla, n: 0}, propio: 0});
	const b0 = b.poner('6541', RB, {conector: {de: perno, n: 3}, propio: 0, giro});
	const r = b0.tr.r;
	if ([r[2], r[5], r[6], r[7]].some((v) => Math.abs(v) > 1e-9)) throw new Error('la rama debe girar alrededor de Z');
	const y180 = Math.abs(r[8] + 1) < 1e-9;
	const z = (Math.atan2(y180 ? -r[3] : r[3], y180 ? -r[0] : r[0]) * 180) / Math.PI;
	tr.colocar(tipo.s, {en: b0.tr.t as any, rot: `${y180 ? 'Y180 ' : ''}Z${z}`});
	const k = componer(b0.tr, tipo.tope.tr);
	// el nudillo tiene que quedar derecho y con el stud en la grilla, si no la copa no encastra
	const derecho = [1, 3, 5, 7].every((i) => Math.abs(k.r[i]) < 1e-6) && Math.abs(Math.abs(k.r[4]) - 1) < 1e-6;
	const enGrilla = [k.t[0], k.t[2]].every((v) => Math.abs(((v - 10) / 20) - Math.round((v - 10) / 20)) < 1e-4);
	if (!derecho || !enGrilla) throw new Error(`${tipo.s.nombre}: la punta no cae derecha en la grilla (${k.t.join(', ')})`);
	nudillos.push(k.t);
}
clavar(pA, '', LARGA, LARGA.angulo);
clavar(pB, 'Y180', LARGA, LARGA.angulo);
tr.paso(); // las dos ramas largas, una a cada lado
// Piso 2, más arriba: las dos ramas cortas
const s2 = tr.poner('3941', RB, {sobre: s1, stud: [0, 0]});
const sep = tr.poner('4032a', RB, {sobre: s2, stud: [0, 0]});
tr.paso();
const pC = tr.poner('6541', RB, {sobre: sep, stud: [1, 0], giro: 180});
const pD = tr.poner('6541', RB, {sobre: sep, stud: [0, 1]});
tr.poner('3062b', RB, {sobre: sep, stud: [0, 0]});
tr.poner('3062b', RB, {sobre: sep, stud: [1, 1]});
tr.poner('4032a', RB, {sobre: pD, stud: [0, 0], con: [0, 1]});
tr.paso();
clavar(pC, 'Y180', CORTA, CORTA.angulo);
clavar(pD, '', CORTA, CORTA.angulo);
tr.paso(); // las dos ramas cortas

// ---------- copa ----------
// Cuatro capas que se achican hacia arriba: techo plano y borde en escalones con hojitas.
const copa = m.sub('copa');
const DG = 'Dark_Green';
// Capa 1 (14 x 6): la que se apoya en las cuatro puntas de rama.
const k1 = [libre(copa, '3036', DG, {x: 60, z: 0, w: 8, d: 6}), libre(copa, '3958', DG, {x: -80, z: 0, w: 6, d: 6})];
copa.paso();
// Capa 2 (16 x 12, esquinas redondeadas): el ala del paraguas
const k2 = [
	sobreCapa(copa, '3035', DG, k1, {x: 80, z: 0, w: 8, d: 4}),
	sobreCapa(copa, '3035', DG, k1, {x: -80, z: 0, w: 8, d: 4}),
	sobreCapa(copa, '3035', DG, k1, {x: 0, z: -80, w: 8, d: 4}),
	sobreCapa(copa, '3035', DG, k1, {x: 0, z: 80, w: 8, d: 4}),
];
for (const [x, z, g] of [[120, -80, 0], [120, 80, 90], [-120, 80, 180], [-120, -80, 270]])
	k2.push(sobreCapa(copa, '30565', DG, k1, {x, z, w: 4, d: 4, giro: g, faltan: ESQUINA}));
copa.paso();
// Hojitas (1 x 1 con 3 hojas): bordes festoneados en cada escalón y textura en el techo.
function hoja(capa: unknown[], x: number, z: number, color: string, giro = 0) {
	for (const p of capa) if (celda(cajas.get(p)!, x, z)) return apoyar(copa, '32607', color, p, {x, z, w: 1, d: 1, giro}, `hoja ${x},${z}`);
	return null;
}
// Cada hojita gira para que sus hojas apunten hacia afuera.
const haciaAfuera = (x: number, z: number) => (Math.abs(z) / 6 > Math.abs(x) / 7 ? (z > 0 ? 180 : 0) : x > 0 ? 90 : 270);
const TONOS = ['Green', 'Bright_Green', 'Sand_Green', 'Green', 'Bright_Green', 'Dark_Green', 'Green', 'Lime'];
let n = 0;
// anillo de cada capa (el stud que queda libre entre una capa y la de arriba), uno sí y uno no
function anillo(capa: unknown[], ax: number, az: number, maxX = ax) {
	const pts: [number, number][] = [];
	for (let x = -ax + 10; x <= ax - 10; x += 20) pts.push([x, -az + 10], [x, az - 10]);
	for (let z = -az + 30; z <= az - 30; z += 20) pts.push([-ax + 10, z], [ax - 10, z]);
	pts.sort((a, b) => Math.atan2(a[1], a[0]) - Math.atan2(b[1], b[0]));
	pts.forEach(([x, z], i) => {
		if (i % 2 === 0 && Math.abs(x) <= maxX && hoja(capa, x, z, TONOS[n % TONOS.length], haciaAfuera(x, z))) n++;
	});
}
anillo(k2, 160, 120, 130); // en las puntas del ala no van hojitas: el modelo no pasa de 16 studs
copa.paso();
// Capa 3 (14 x 10), verde
const k3 = [
	sobreCapa(copa, '3034', 'Green', k2, {x: -60, z: 0, w: 8, d: 2}),
	sobreCapa(copa, '3795', 'Green', k2, {x: 80, z: 0, w: 6, d: 2}),
	sobreCapa(copa, '3032', 'Green', k2, {x: 0, z: -60, w: 6, d: 4}),
	sobreCapa(copa, '3032', 'Green', k2, {x: 0, z: 60, w: 6, d: 4}),
];
for (const [x, z, g] of [[100, -60, 0], [100, 60, 90], [-100, 60, 180], [-100, -60, 270]])
	k3.push(sobreCapa(copa, '30565', 'Green', k2, {x, z, w: 4, d: 4, giro: g, faltan: ESQUINA}));
copa.paso();
anillo(k3, 140, 100);
copa.paso();
// Capa 4 (12 x 8): el techo plano
const k4 = [sobreCapa(copa, '3035', 'Green', k3, {x: 0, z: 0, w: 8, d: 4, giro: 90})];
for (const [x, z, g] of [[80, -40, 0], [80, 40, 90], [-80, 40, 180], [-80, -40, 270]])
	k4.push(sobreCapa(copa, '30565', 'Green', k3, {x, z, w: 4, d: 4, giro: g, faltan: ESQUINA}));
copa.paso();
// techo: hojitas en tresbolillo, en dos tandas (fondo y frente)
for (const mitad of [[-70, -30], [10, 50]]) {
	for (const z of mitad)
		for (let x = -110 + (((z + 70) / 40) % 2) * 20; x <= 110; x += 40) if (hoja(k4, x, z, TONOS[n % TONOS.length], haciaAfuera(x, z))) n++;
	copa.paso();
}

// ---------- modelo ----------
const Y_TRONCO = grilla(0, 4, 0)[1]; // el tronco (24 LDU) pisa la capa 2 de la base, que está en y = -8
const yNudillo = nudillos[0][1];
if (nudillos.some((k) => Math.abs(k[1] - yNudillo) > 1e-3)) throw new Error('las cuatro puntas de rama no quedan a la misma altura');
const Y_COPA = Y_TRONCO + yNudillo - 8; // la capa 1 de la copa (8 LDU) calza sobre los topes de las ramas
m.raiz.colocar(base, {rot: 'Y90'}); // girada: la franja central queda de frente y las filas la ensanchan
m.raiz.paso();
m.raiz.colocar(tr, {en: [0, Y_TRONCO, 0]});
m.raiz.paso();
m.raiz.colocar(copa, {en: [0, Y_COPA, 0]});
m.raiz.paso();
// Epílogo: dos nidos de tejedor cuelgan del ala de la copa (cono con la punta arriba y bolsa redonda abajo).
for (const [x, z] of [[-70, 90], [90, -90]]) {
	m.raiz.poner('4589', 'Tan', {en: [x, Y_COPA, z], nombre: `nido ${x},${z}`});
	m.raiz.poner('3062b', 'Tan', {en: [x, Y_COPA + 24, z], nombre: `nido ${x},${z}`});
}
m.raiz.paso();
m.guardar();
