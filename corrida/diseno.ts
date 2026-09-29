// Acacia de sabana (Vachellia tortilis): tronco corto que se abre en vaso y copa plana en dos pisos.
import {Modelo, grilla} from '../taller/src/dsl.ts';

const m = new Modelo('acacia');
const TR = 'Reddish_Brown';
const OSC = 'Dark_Brown';

// ---------- Base: suelo de sabana ----------
const base = m.sub('base');
const suelo = base.poner('91405', 'Tan');
base.paso();
// manchas de tierra más oscura y pasto seco (el centro 6..9 queda libre para el tronco)
base.poner('3021', 'Dark_Tan', {sobre: suelo, stud: [1, 11]});
base.poner('3022', 'Dark_Tan', {sobre: suelo, stud: [12, 2]});
base.poner('3022', 'Dark_Tan', {sobre: suelo, stud: [11, 12]});
base.poner('3024', 'Dark_Tan', {sobre: suelo, stud: [3, 3]});
base.paso();
for (const [i, j] of [[2, 2], [13, 4], [4, 13], [14, 13], [10, 1], [1, 7]] as [number, number][])
	base.poner('6141', 'Lime', {sobre: suelo, stud: [i, j]});
for (const [i, j] of [[3, 2], [9, 14], [5, 14], [14, 5]] as [number, number][])
	base.poner('6141', 'Green', {sobre: suelo, stud: [i, j]});
base.paso();

// ---------- Tronco: ensanche de raíces, fuste y horqueta en vaso ----------
const tronco = m.sub('tronco');
const raiz = tronco.poner('3031', TR); // 4x4, ensanche de la base
for (const [i, j] of [[0, 0], [3, 0], [0, 3], [3, 3]] as [number, number][])
	tronco.poner('6141', OSC, {sobre: raiz, stud: [i, j]});
tronco.paso();
const f1 = tronco.poner('3941', TR, {sobre: raiz, stud: [1, 1]});
tronco.paso();
const f2 = tronco.poner('3941', TR, {sobre: f1, stud: [0, 0]});
tronco.paso();
// horqueta: placa 2x6 que reparte el tronco en tres ramas
const yugo = tronco.poner('3795', TR, {sobre: f2, stud: [0, 0], con: [2, 0]});
tronco.paso();

// rama izquierda: escalera que sale 1 stud por piso
const iz1 = tronco.poner('3003', TR, {sobre: yugo, stud: [0, 0]});
const iz2 = tronco.poner('3021', TR, {sobre: iz1, stud: [0, 0], con: [1, 0]});
tronco.paso();
const iz3 = tronco.poner('3003', TR, {sobre: iz2, stud: [0, 0]});
const izTope = tronco.poner('3021', TR, {sobre: iz3, stud: [0, 0], con: [1, 0]});
tronco.paso();
// rama derecha (espejo)
const de1 = tronco.poner('3003', TR, {sobre: yugo, stud: [4, 0]});
const de2 = tronco.poner('3021', TR, {sobre: de1, stud: [0, 0]});
const de3 = tronco.poner('3003', TR, {sobre: de2, stud: [1, 0]});
const deTope = tronco.poner('3021', TR, {sobre: de3, stud: [0, 0]});
tronco.paso();
// líder central: más fino (1x1 redondos), sube más alto y atraviesa el piso bajo de la copa
const c1 = tronco.poner('3062b', TR, {sobre: yugo, stud: [2, 0]});
const c2 = tronco.poner('3062b', TR, {sobre: c1, stud: [0, 0]});
const c3 = tronco.poner('3062b', TR, {sobre: yugo, stud: [3, 1]});
const c4 = tronco.poner('3062b', TR, {sobre: c3, stud: [0, 0]});
const c5 = tronco.poner('3024', TR, {sobre: c2, stud: [0, 0]});
const c6 = tronco.poner('3024', TR, {sobre: c4, stud: [0, 0]});
tronco.poner('3024', TR, {sobre: c5, stud: [0, 0]});
tronco.poner('3024', TR, {sobre: c6, stud: [0, 0]});
tronco.paso();

// ---------- Copa baja: el paraguas ancho ----------
const copa = m.sub('copa');
const pa = copa.poner('3027', 'Dark_Green'); // 6x16
// hojas colgando del borde, clavadas por debajo: la copa "gotea" como una acacia real
copa.poner('2417', 'Dark_Green', {debajo: pa, antistud: [0, 1], con: [2, 3]});
copa.poner('2417', 'Dark_Green', {debajo: pa, antistud: [15, 4], con: [2, 3]});
copa.paso();
const pb1 = copa.poner('3029', 'Green', {sobre: pa, stud: [2, 0], con: [0, 2]});
const pb2 = copa.poner('2445', 'Green', {sobre: pa, stud: [2, 2]});
const pb3 = copa.poner('3029', 'Green', {sobre: pa, stud: [2, 4]});
copa.paso();
copa.poner('2417', 'Green', {debajo: pb1, antistud: [3, 0], con: [1, 5]});
copa.poner('2417', 'Green', {debajo: pb3, antistud: [8, 3], con: [2, 0]});
copa.paso();
// puntas redondeadas y textura en los extremos del paraguas
copa.poner('4032a', 'Green', {sobre: pa, stud: [0, 2]});
copa.poner('4032a', 'Green', {sobre: pa, stud: [14, 2]});
for (const [p, i, j] of [[pb1, 0, 0], [pb1, 11, 0], [pb3, 0, 3], [pb3, 11, 3], [pb1, 5, 0], [pb3, 6, 3]] as const)
	copa.poner('6141', 'Lime', {sobre: p, stud: [i, j]});
copa.paso();
// ramitas que atraviesan: separadores que dejan ver cielo entre los dos pisos
const pilares = ([[pb1, 2, 3], [pb1, 9, 3], [pb3, 2, 0], [pb3, 9, 0]] as const).map(([p, i, j]) =>
	copa.poner('3062b', TR, {sobre: p, stud: [i, j]}));
copa.paso();

// ---------- Copa alta: segundo piso, más chico (la revelación) ----------
const alta = m.sub('copa-alta');
const qa = alta.poner('3033', 'Green'); // 6x10
alta.poner('3034', 'Green', {debajo: qa, antistud: [1, 0], con: [0, 1]});
alta.poner('3034', 'Green', {debajo: qa, antistud: [1, 5], con: [0, 0]});
alta.paso();
const qb = alta.poner('3032', 'Bright_Green', {sobre: qa, stud: [2, 1]}); // 4x6
alta.paso();
for (const [i, j] of [[0, 0], [5, 3], [2, 2], [4, 0], [1, 3]] as [number, number][])
	alta.poner('6141', 'Lime', {sobre: qb, stud: [i, j]});
for (const [i, j] of [[0, 0], [9, 0], [0, 5], [9, 5], [0, 2], [9, 3]] as [number, number][])
	alta.poner('4032a', 'Dark_Green', {sobre: qa, stud: [i, j], con: [0, 0]});
alta.paso();

// ---------- Modelo principal ----------
const PLACA = 8;
const yTronco = -PLACA; // sobre el suelo
m.raiz.colocar(base);
m.raiz.paso();
// tronco centrado: el 4x4 ocupa los studs 6..9 del suelo
m.raiz.colocar(tronco, {en: [0, yTronco, 0]});
m.raiz.paso();
const yCopa = yTronco + izTope.tr.t[1] - PLACA;
m.raiz.colocar(copa, {en: [0, yCopa, 0]});
m.raiz.paso();
const yAlta = yCopa + pilares[0].tr.t[1] - PLACA;
m.raiz.colocar(alta, {en: [0, yAlta, 0]});
m.raiz.paso();
void deTope; void grilla;
m.guardar();
