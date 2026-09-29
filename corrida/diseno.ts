// Acacia paraguas (Vachellia tortilis) — copa plana en dos pisos sobre tres ramas escalonadas con jumpers.
// Unidades: 1 stud = 20 LDU, 1 placa = 8, −Y es arriba. Mundo: centro del tronco en (0, 0), suelo en y = 0.
import {Modelo, grilla} from '../taller/src/dsl.ts';

const m = new Modelo('acacia');
const RB = 'Reddish_Brown';
type P = ReturnType<typeof m.raiz.poner>;

// ---------------------------------------------------------------- suelo (sabana seca)
// Studs del suelo: x = -110 + 20 i, z = -110 + 20 j (i, j = 0..11); el tronco ocupa i, j = 5..6.
const suelo = m.sub('suelo');
const s = (i: number, j: number, capas = 0) => grilla(-5.5 + i, capas, -5.5 + j);
const placaFrente = suelo.poner('3028', 'Tan', {en: [0, 0, -60], nombre: 'placa frente'});
suelo.paso();
// la segunda placa y las manchas de tierra más oscura que cosen las dos placas
const placaFondo = suelo.poner('3028', 'Tan', {en: [0, 0, 60], nombre: 'placa fondo'});
// (centro de una placa de n x n cuyo primer stud es (i, j)): x = -110 + 20 (i + (n - 1) / 2)
const c = (i: number, j: number, n: number): [number, number, number] => [-110 + 20 * (i + (n - 1) / 2), -8, -110 + 20 * (j + (n - 1) / 2)];
suelo.poner('30357', 'Dark_Tan', {sobre: placaFondo, stud: [11, 0], giro: 180, nombre: 'mancha der'});
suelo.poner('30357', 'Dark_Tan', {sobre: placaFrente, stud: [0, 4], nombre: 'mancha izq'});
suelo.poner('4032a', 'Dark_Tan', {en: c(5, 9, 2), nombre: 'mancha fondo'});
suelo.poner('4032a', 'Dark_Tan', {en: c(2, 1, 2), nombre: 'mancha frente'});
suelo.paso();
// raíces en molinete: pendientes 45 que bajan del tronco hacia afuera
suelo.poner('3040b', RB, {sobre: placaFrente, stud: [7, 5], giro: 270, nombre: 'raiz +x'});
suelo.poner('3040b', RB, {sobre: placaFondo, stud: [4, 0], giro: 90, nombre: 'raiz -x'});
suelo.paso();
suelo.poner('3040b', RB, {sobre: placaFondo, stud: [6, 1], giro: 0, nombre: 'raiz +z'});
suelo.poner('3040b', RB, {sobre: placaFrente, stud: [5, 4], giro: 180, nombre: 'raiz -z'});
suelo.paso();
// una piedra
const piedra = suelo.poner('3022', 'Dark_Bluish_Grey', {sobre: placaFrente, stud: [9, 2], nombre: 'piedra'});
suelo.poner('54200', 'Dark_Bluish_Grey', {sobre: piedra, stud: [0, 0], nombre: 'piedra punta'});
suelo.poner('54200', 'Dark_Bluish_Grey', {sobre: piedra, stud: [1, 1], giro: 180, nombre: 'piedra punta 2'});
suelo.paso();
// pasto seco
suelo.poner('15279', 'Pearl_Gold', {sobre: placaFondo, stud: [2, 3], nombre: 'pasto 1'});
suelo.poner('15279', 'Pearl_Gold', {sobre: placaFondo, stud: [3, 4], giro: 90, nombre: 'pasto 2'});
suelo.poner('15279', 'Pearl_Gold', {sobre: placaFrente, stud: [9, 1], giro: 180, nombre: 'pasto 3'});
suelo.paso();

// ---------------------------------------------------------------- tronco y ramas
const tronco = m.sub('tronco');
const t1 = tronco.poner('3941', RB, {nombre: 'tronco 1'});
const t2 = tronco.poner('3941', RB, {sobre: t1, stud: [0, 0], nombre: 'tronco 2'});
tronco.paso();
// Una rama sube por tramos: J<giro> = jumper 1x2 (corre medio stud: 0 → +X, 90 → +Z, 180 → −X, 270 → −Z),
// B = ladrillo 1x1 redondo (3 placas), P = placa 1x1. Todas suman 15 placas para que la copa apoye plana.
function rama(nombre: string, desde: P, stud: [number, number], tramos: string[], pasoCada: number[]) {
	let prev = desde;
	let st: [number, number] = stud;
	tramos.forEach((t, k) => {
		const nom = `${nombre} ${k + 1}`;
		if (t[0] === 'J') prev = tronco.poner('15573', RB, {sobre: prev, stud: st, giro: Number(t.slice(1)), nombre: nom});
		else if (t === 'B') prev = tronco.poner('3062b', RB, {sobre: prev, stud: st, nombre: nom});
		else prev = tronco.poner('3024', RB, {sobre: prev, stud: st, nombre: nom});
		st = [0, 0];
		if (pasoCada.includes(k + 1)) tronco.paso();
	});
	return prev;
}
// rama derecha: la más larga y tendida (+3 studs en X)
rama('rama der', t2, [1, 0], ['J0', 'J0', 'J0', 'B', 'J0', 'J0', 'J0', 'B', 'B'], [3, 7, 9]);
// rama izquierda (−3 studs en X)
rama('rama izq', t2, [0, 1], ['J180', 'J180', 'J180', 'B', 'J180', 'J180', 'J180', 'B', 'B'], [4, 9]);
// rama del frente: se inclina hacia la cámara y se tuerce a la derecha (−2 en Z, +1 en X)
rama('rama frente', t2, [0, 0], ['B', 'J270', 'J270', 'B', 'J0', 'J270', 'J270', 'J0', 'B'], [9]);

// ---------------------------------------------------------------- copa
// Coordenadas locales de la copa: centro del disco bajo en (0, 0). Se coloca con su centro en z = −20.
// Puntas de las ramas (local): der (70, 10), izq (−70, 30), frente (10, −30). La cámara 3/4 mira desde −Z.
const copa = m.sub('copa');
const cuarto = (x: number, z: number, rot: string, nombre: string) =>
	copa.poner('6003', 'Dark_Green', {en: [x, 0, z], rot, nombre});
// piso bajo: disco de 12 con cuatro placas 6x6 de esquina redonda (la esquina redonda hacia afuera)
cuarto(60, -60, '', 'cuarto 1');
cuarto(60, 60, 'Y270', 'cuarto 2');
copa.paso();
cuarto(-60, 60, 'Y180', 'cuarto 3');
cuarto(-60, -60, 'Y90', 'cuarto 4');
copa.paso();
const puente = copa.poner('3958', 'Dark_Green', {en: [0, -8, 0], nombre: 'puente'});
copa.paso();
// Hojas 6x5 ancladas por el tallo. La punta del tallo queda en (x, z); apunta según dir.
const ROT: Record<string, string> = {'+z': '', '+x': 'Y90', '-z': 'Y180', '-x': 'Y270'};
const DESPL: Record<string, [number, number]> = {'+z': [0, 60], '+x': [60, 0], '-z': [0, -60], '-x': [-60, 0]};
const hoja = (color: string, x: number, z: number, y: number, dir: string, nombre: string) =>
	copa.poner('2417', color, {en: [x + DESPL[dir][0], y, z + DESPL[dir][1]], rot: ROT[dir], nombre});
// fleco de abajo, en sombra (colgado del disco)
hoja('Dark_Green', 50, 50, 8, '+x', 'fleco bajo 1');
hoja('Dark_Green', -50, -50, 8, '-x', 'fleco bajo 2');
hoja('Dark_Green', -30, 50, 8, '+z', 'fleco bajo 3');
hoja('Dark_Green', 50, -50, 8, '-z', 'fleco bajo 4');
copa.paso();
// textura del borde del disco bajo: placas redondas con 3 hojas
const brote = (color: string, x: number, z: number, y: number, nombre: string) =>
	copa.poner('32607', color, {en: [x, y, z], nombre});
[
	[-110, -70], [-110, -30], [-110, 10], [-110, 90], [-70, -110], [-70, -70], [-70, -30], [-70, 10], [-70, 50], [-70, 90], [-30, -110], [-30, -70], [-30, 70], [-30, 110], [10, -110], [10, -70], [10, 70], [10, 110], [50, -110], [50, -70], [50, 70], [50, 110], [70, -30], [70, 10], [90, -70], [90, 50], [110, -30], [110, 10],
]
	// primero la mitad izquierda, después la derecha
	.sort(([xa, za], [xb, zb]) => xa - xb || zb - za)
	.forEach(([x, z], k) => {
		brote(k % 2 ? 'Green' : 'Sand_Green', x, z, -8, `brote bajo ${k + 1}`);
		if (k + 1 === 14) copa.paso();
	});
copa.paso();
// fleco de arriba, más claro (sobre el puente)
hoja('Sand_Green', 50, 30, -16, '+x', 'fleco 1');
hoja('Sand_Green', -50, -10, -16, '-x', 'fleco 2');
hoja('Sand_Green', 10, 50, -16, '+z', 'fleco 3');
hoja('Sand_Green', -30, -50, -16, '-z', 'fleco 4');
copa.paso();
// piso alto: cuatro ramitas y un disco de 8, corrido hacia el frente a la derecha
copa.poner('3062b', RB, {sobre: puente, stud: [1, 3], nombre: 'ramita 1'});
copa.poner('3062b', RB, {sobre: puente, stud: [4, 3], nombre: 'ramita 2'});
copa.poner('3062b', RB, {sobre: puente, stud: [5, 1], nombre: 'ramita 3'});
copa.poner('3062b', RB, {sobre: puente, stud: [3, 0], nombre: 'ramita 4'});
copa.paso();
const cuarto2 = (x: number, z: number, rot: string, nombre: string) =>
	copa.poner('30565', 'Green', {en: [x + 20, -40, z - 20], rot, nombre});
cuarto2(40, -40, '', 'alto 1');
cuarto2(40, 40, 'Y270', 'alto 2');
cuarto2(-40, 40, 'Y180', 'alto 3');
cuarto2(-40, -40, 'Y90', 'alto 4');
copa.paso();
const puenteAlto = copa.poner('3031', 'Green', {en: [20, -48, -20], nombre: 'puente alto'});
copa.paso();
// fleco del piso alto: hojas 4x3 que salen del puente hacia los cuatro lados
const hojita = (stud: [number, number], giro: number, color: string, nombre: string) =>
	copa.poner('2423', color, {sobre: puenteAlto, stud, con: [0, 0], giro, nombre});
hojita([3, 1], 270, 'Green', 'hojita 1');
hojita([0, 2], 90, 'Green', 'hojita 2');
hojita([2, 3], 0, 'Sand_Green', 'hojita 3');
hojita([1, 0], 180, 'Sand_Green', 'hojita 4');
copa.paso();
[
	[-50, -50], [-50, 30], [-10, -90], [-10, 30], [30, -90], [30, 30], [70, -50], [70, 30],
].forEach(([x, z], k) => brote(k % 2 ? 'Sand_Green' : 'Lime', x, z, -48, `brote alto ${k + 1}`));
copa.paso();

// ---------------------------------------------------------------- armado final
m.raiz.colocar(suelo);
m.raiz.paso();
m.raiz.colocar(tronco, {en: [0, -24, 0]});
m.raiz.paso();
m.raiz.colocar(copa, {en: [0, -176, -20]});
m.raiz.paso();
// el último toque: un pájaro se posa en el piso alto
m.raiz.poner('41835', 'Dark_Tan', {en: [-10, -176 - 56, -20 + 50], rot: 'Y90', nombre: 'pajaro'});
m.raiz.paso();
m.guardar();
