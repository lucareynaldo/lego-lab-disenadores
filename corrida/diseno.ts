import {Modelo, grilla} from '../taller/src/dsl.ts';

// Acacia paraguas (Vachellia tortilis) en microescala.
// Marco global: tronco centrado en x = z = 0, −Y arriba, 1 stud = 20 LDU, 1 placa = 8 LDU.
// Los tres sub-armados se colocan en el origen, así que comparten ese marco.
const m = new Modelo('acacia');
type S = ReturnType<typeof m.sub>;
type P = ReturnType<S['poner']>;
type Base = [P, number, number]; // pieza y coordenada local (x, z) de su stud (0,0)

// Índice de stud (i, j) de la pieza `b` que cae en (x, z) del mundo (giros solo alrededor de Y).
function studDe([p, minX, minZ]: Base, x: number, z: number): [number, number] {
	const [a, , c, , , , g, , i] = p.tr.r;
	const dx = x - p.tr.t[0];
	const dz = z - p.tr.t[2];
	return [Math.round((a * dx + g * dz - minX) / 20), Math.round((c * dx + i * dz - minZ) / 20)];
}
// Encastra la pieza sobre el stud que haya en (x, z), buscando en cuál de las `bases` cae.
function sobreEn(s: S, id: string, color: string, bases: Base[], x: number, z: number, op: {con?: [number, number]; giro?: number} = {}): P {
	for (const b of bases) {
		let stud: [number, number];
		try {
			stud = studDe(b, x, z);
			return s.poner(id, color, {sobre: b[0], stud, ...op});
		} catch (e) {
			if (!/fuera de rango/.test((e as Error).message)) throw e;
		}
	}
	throw new Error(`no hay stud en (${x}, ${z})`);
}
// Anti-stud propio que cae en (x, z) si la pieza queda con centro en (cx, cz) (min: stud (0,0) medido desde el centro) y girada `giro` (giro 90: (x,z) → (−z,x)).
function conPara(x: number, z: number, cx: number, cz: number, giro: number, minX: number, minZ: number): [number, number] {
	let [lx, lz] = [x - cx, z - cz];
	for (let k = 0; k < giro / 90; k++) [lx, lz] = [lz, -lx];
	return [Math.round((lx - minX) / 20), Math.round((lz - minZ) / 20)];
}
// Cuatro placas de esquina redonda forman un disco (esquinas redondas hacia afuera).
const CUADRANTES = [[1, -1, ''], [-1, -1, 'Y90'], [-1, 1, 'Y180'], [1, 1, 'Y270']] as const;
// Mismo reparto, con giro de encastre (la esquina redonda de fábrica está en +x −z).
const GIRO_CUADRANTE: [number, number, number][] = [[1, -1, 0], [1, 1, 90], [-1, 1, 180], [-1, -1, 270]];

// ================= BASE: suelo de sabana =================
const base = m.sub('base');
const suelo: Base[] = CUADRANTES.map(([sx, sz, rot]) => [base.poner('6003', 'Dark_Tan', {en: [60 * sx, 0, 60 * sz], rot}), -50, -50]);
base.paso();
const tierra = base.poner('41539', 'Tan', {en: [0, -8, 0]});
base.paso();
// Ensanche de la raíz: cuatro curvas en molinete alrededor del pie del tronco (2x2 en el centro).
// La parte alta de la curva queda contra el tronco; cada raíz sale 2 studs hacia afuera.
for (const [i, j, giro] of [[1, 3, 270], [4, 1, 0], [6, 4, 90], [3, 6, 180]] as const) {
	base.poner('11477', 'Dark_Brown', {sobre: tierra, stud: [i, j], giro});
}
base.paso();

// Pasto seco y piedras en el anillo exterior.
const PASTO: [number, number, string][] = [
	[-90, -70, 'Lime'], [-50, -90, 'Yellow'], [-110, -30, 'Lime'],
	[90, 70, 'Lime'], [110, 30, 'Bright_Light_Orange'], [30, 110, 'Lime'],
	[-90, 50, 'Yellow'], [-110, 10, 'Lime'],
	[110, -30, 'Bright_Light_Orange'],
	[-50, 30, 'Lime'], [50, -30, 'Yellow'],
];
for (const [x, z, color] of PASTO) sobreEn(base, '32607', color, [[tierra, -70, -70], ...suelo], x, z);
sobreEn(base, '3040b', 'Dark_Bluish_Grey', suelo, 70, -90, {giro: 90});
sobreEn(base, '6141', 'Light_Bluish_Grey', suelo, 90, -90);
sobreEn(base, '6141', 'Dark_Bluish_Grey', suelo, -70, 90);
base.paso();

// ================= TRONCO =================
const tronco = m.sub('tronco');
// Corteza surcada: cuatro columnas de ladrillos redondos 1x1 atadas por placas redondas 2x2.
const pie = tronco.poner('4032a', 'Dark_Brown', {en: [0, -16, 0]});
const columna = (sobre: P, stud: [number, number]) => tronco.poner('3062b', 'Dark_Brown', {sobre, stud});
let col = [[0, 0], [1, 0], [1, 1], [0, 1]].map((st) => columna(pie, st as [number, number]));
tronco.paso();
col = col.map((c) => columna(c, [0, 0]));
const nudo = tronco.poner('4032a', 'Dark_Brown', {sobre: col[0], stud: [0, 0]});
col = [[0, 0], [1, 0], [1, 1], [0, 1]].map((st) => columna(nudo, st as [number, number]));
tronco.paso();

// Ramas en diagonal: J = jumper 1x2 (sube una placa y corre medio stud hacia afuera), P = placa 1x1 (solo sube).
// Todas suben 16 placas; cuántos J tiene cada una define cuánto se abre. J par: la punta cae en la grilla.
// Cada rama sale de una columna y se abre hacia su lado: las cuatro giran en molinete y no se tocan.
// Orden de armado: primero las de atrás (la cámara 3/4 mira desde −x −z), así ninguna tapa a la siguiente.
const RAMAS: {columna: number; giro: number; patron: string}[] = [
	{columna: 2, giro: 0, patron: 'JJJPJJPJPJJPJPPJ'}, //   +x, se abre 5 studs
	{columna: 3, giro: 90, patron: 'JPJPPJPPJPPJPPPJ'}, //  +z, 3 studs
	{columna: 1, giro: 270, patron: 'JJPJPJPPJPJPJPPJ'}, // −z, 4 studs
	{columna: 0, giro: 180, patron: 'JJPJJPJJPJJPJPPJ'}, // −x, 5 studs
];
const puntas: P[] = [];
RAMAS.forEach(({columna, giro, patron}, n) => {
	if (patron.length !== 16 || (patron.match(/J/g) ?? []).length % 2) throw new Error(`patrón inválido: ${patron}`);
	let p = col[columna];
	[...patron].forEach((c, k) => {
		p = c === 'J' ? tronco.poner('15573', 'Dark_Brown', {sobre: p, stud: [0, 0], giro}) : tronco.poner('3024', 'Dark_Brown', {sobre: p, stud: [0, 0]});
		// La primera rama se muestra en dos pasos, para que se entienda la técnica.
		if (n === 0 && k === 5) tronco.paso();
	});
	puntas.push(p);
	tronco.paso();
});

// ================= COPA =================
const copa = m.sub('copa');
const yPuntas = puntas[0].tr.t[1]; // cara de arriba de las puntas de las ramas
const Y = (capa: number) => yPuntas - 8 * capa;

// Capa 1: disco 12x12 verde oscuro, cara de abajo plana (apoya en las cuatro puntas).
const capa1: Base[] = CUADRANTES.map(([sx, sz, rot]) => [copa.poner('6003', 'Dark_Green', {en: [60 * sx, Y(1), 60 * sz], rot}), -50, -50]);
copa.paso();

// Capa 2: placa 4x4 que ata el disco y cuatro hojas 6x5 hacia +x y −x (tallo adentro, hoja afuera).
const centro2: Base = [sobreEn(copa, '3031', 'Green', capa1, -30, -30), -30, -30];
const TALLOS: [number, number][] = [[-50, 50], [50, 50], [50, -50], [-50, -50]];
const hojas2 = TALLOS.map(([x, z], k) => {
	const h = sobreEn(copa, '2417', 'Dark_Green', capa1, x, z, {con: [2, 0], giro: x > 0 ? 270 : 90});
	if (k === 0) copa.paso(); // la primera hoja sola: se ve cómo se abre
	return h;
});
copa.paso();

// Capa 3: otras cuatro hojas hacia +z y −z, cada una con el tallo encastrado en el tallo de la de abajo.
// Las esquinas quedan vacías: la copa es un octógono redondeado de 16 studs.
TALLOS.forEach(([x, z], k) => copa.poner('2417', 'Dark_Green', {sobre: hojas2[k], stud: [2, 0], con: [2, 0], giro: z > 0 ? 0 : 180}));
const centro3: Base = [copa.poner('3031', 'Green', {sobre: centro2[0], stud: [0, 0]}), -30, -30];
copa.paso();

// Capa 4: cuerpo 8x8 de esquinas redondas.
const capa4: Base[] = GIRO_CUADRANTE.map(([sx, sz, giro]) => [
	sobreEn(copa, '30565', 'Green', [centro3], 10 * sx, 10 * sz, {con: conPara(10 * sx, 10 * sz, 40 * sx, 40 * sz, giro, -30, -30), giro}),
	-30,
	-30,
]);
copa.paso();

// Capa 5: molinete de hojas de 14 studs, más una 2x2 al centro.
const centro5: Base = [sobreEn(copa, '3022', 'Green', capa4, -10, -10), -10, -10];
const MOLINETE5: [number, number, number][] = [[-30, 30, 0], [30, 30, 270], [30, -30, 180], [-30, -30, 90]];
MOLINETE5.forEach(([x, z, giro]) => sobreEn(copa, '2417', 'Green', capa4, x, z, {con: [2, 0], giro}));
copa.paso();

// Capa 6: cuerpo 6x6 de esquinas redondas (la esquina redonda de fábrica de la 3x3 está en +x +z).
const capa6: Base[] = [[1, 1, 0], [-1, 1, 90], [-1, -1, 180], [1, -1, 270]].map(([sx, sz, giro]) => [
	sobreEn(copa, '30357', 'Green', [centro5], 10 * sx, 10 * sz, {con: conPara(10 * sx, 10 * sz, 30 * sx, 30 * sz, giro, -20, -20), giro}),
	0, // el origen de la 3x3 está en su stud (0,0)
	0,
]);
copa.paso();

// Capa 7: tercer molinete, 12 studs, verde claro: la copa se escalona como una sombrilla.
const MOLINETE7: [number, number, number][] = [[-50, 10, 0], [10, 50, 270], [50, -10, 180], [-10, -50, 90]];
const hojas7 = MOLINETE7.map(([x, z, giro]) => sobreEn(copa, '2417', 'Bright_Green', capa6, x, z, {con: [2, 0], giro}));
copa.paso();

// Capa 8: brotes al sol sobre el techo plano.
for (const h of hojas7) {
	for (const st of [[2, 3], [0, 5]] as [number, number][]) copa.poner('32607', 'Lime', {sobre: h, stud: st});
	copa.poner('32607', 'Bright_Green', {sobre: h, stud: [4, 4]});
}
copa.paso();

// ================= MODELO =================
m.raiz.colocar(base);
m.raiz.paso();
m.raiz.colocar(tronco);
m.raiz.paso();
m.raiz.colocar(copa);
m.raiz.paso();
m.guardar();
