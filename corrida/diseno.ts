import {Modelo, grilla} from '../taller/src/dsl.ts';

const m = new Modelo('abeto');
const DG = 'Dark_Green', RB = 'Reddish_Brown', W = 'White';

// --- base + tronco
const base = m.sub('base');
const suelo = base.poner('41539', W);
base.paso();
let t = base.poner('3941', RB, {sobre: suelo, stud: [3, 3]});
// raíces: el tronco se ensancha al tocar el suelo
for (const [i, j, g] of [[2, 3, 180], [2, 4, 180], [5, 3, 0], [5, 4, 0], [3, 2, 270], [4, 2, 270], [3, 5, 90], [4, 5, 90]] as [number, number, number][])
	base.poner('54200', RB, {sobre: suelo, stud: [i, j], giro: g});
base.paso();
// piedras asomando en la nieve
for (const [i, j, c] of [[0, 6, 'Light_Bluish_Grey'], [1, 7, 'Dark_Bluish_Grey'], [6, 0, 'Light_Bluish_Grey'], [7, 1, 'Dark_Bluish_Grey']] as [number, number, string][])
	base.poner('6141', c, {sobre: suelo, stud: [i, j]});
const t2 = base.poner('3941', RB, {sobre: t, stud: [0, 0]});
base.paso();

// --- copa: pisos en cruz
const copa = m.sub('copa');
let eje = copa.poner('3941', RB);
// tres verticilos de hojas (en molinete, como los pisos de un abeto)
const ramas: ReturnType<typeof copa.poner>[] = [];
for (let k = 0; k < 3; k++) {
	const giros = [[0, 0, 180], [1, 0, 270], [1, 1, 0], [0, 1, 90]];
	const hojas = giros.map(([i, j, g]) => copa.poner('2417', k === 1 ? 'Green' : DG, {sobre: eje, stud: [i, j], con: [2, 0], giro: g}));
	ramas.push(...hojas);
	copa.paso();
	eje = copa.poner('3941', RB, {sobre: hojas[0], stud: [2, 0]});
	copa.paso();
}
// pisos en cruz que se achican hacia la punta
const puntas: ReturnType<typeof copa.poner>[] = [];
for (const [id, n] of [['3795', 6], ['3020', 4]] as const) {
	const c = n / 2 - 1;
	const a = copa.poner(id, DG, {sobre: eje, stud: [0, 0], con: [c, 0]});
	const b = copa.poner(id, DG, {sobre: a, stud: [c, 0], con: [c, 0], giro: 90});
	puntas.push(a, b);
	copa.paso();
	eje = copa.poner('3941', RB, {sobre: b, stud: [c, 0]});
	copa.paso();
}
const top = copa.poner('3022', 'Green', {sobre: eje, stud: [0, 0]});
copa.poner('4589', 'Green', {sobre: top, stud: [0, 0]});
copa.paso();
// nieve: la revelación
for (const h of ramas) for (const st of [[0, 5], [4, 5]] as [number, number][]) copa.poner('6141', W, {sobre: h, stud: st});
copa.paso();

m.raiz.colocar(base);
m.raiz.paso();
m.raiz.colocar(copa, {en: [t2.tr.t[0], t2.tr.t[1] - 24, t2.tr.t[2]]});
m.raiz.paso();
m.guardar();
