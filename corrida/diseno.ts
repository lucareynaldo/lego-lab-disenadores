import {Modelo, grilla} from '../taller/src/dsl.ts';

// Cerezo en flor (sakura): tronco corto, copa extendida rosa, pétalos caídos en el pasto.
const m = new Modelo('cerezo');

// ---- Base: pasto con ensanche de raíces
const base = m.sub('base');
const pasto = base.poner('91405', 'Green');
base.paso();
const raiz = base.poner('3031', 'Reddish_Brown', {sobre: pasto, stud: [6, 6]});
base.paso();
for (const [i, j] of [[1, 3], [13, 3], [1, 13], [12, 14], [15, 11], [6, 3]]) base.poner('32607', 'Bright_Green', {sobre: pasto, stud: [i, j]});
base.paso();

// ---- Tronco: columna de ladrillos redondos
const tronco = m.sub('tronco');
let t = tronco.poner('3941', 'Reddish_Brown');
for (let k = 0; k < 4; k++) {
	tronco.paso();
	t = tronco.poner('3941', 'Reddish_Brown', {sobre: t, stud: [0, 0]});
}
tronco.paso();

// ---- Copa: pisos de placas que se abren y cierran, con flores arriba
const copa = m.sub('copa');
const nudo = copa.poner('3022', 'Reddish_Brown');
copa.paso();
const p1 = copa.poner('3958', 'Dark_Pink', {sobre: nudo, stud: [0, 0], con: [2, 2]});
copa.paso();
const p2 = copa.poner('41539', 'Bright_Pink', {sobre: p1, stud: [0, 0], con: [1, 1]});
copa.paso();
const p3 = copa.poner('41539', 'Bright_Pink', {sobre: p2, stud: [0, 0]});
copa.paso();
const p4 = copa.poner('3958', 'Bright_Pink', {sobre: p3, stud: [1, 1]});
copa.paso();
const p5 = copa.poner('3031', 'White', {sobre: p4, stud: [1, 1]});
copa.paso();
// flores en el borde de cada piso, cada 2 studs para que no se toquen (grupo repetido)
const borde = (n: number, paso: number) => {
	const r: number[][] = [];
	for (let k = 0; k < n; k += paso) r.push([k, 0], [n - 1 - k, n - 1]);
	for (let k = paso; k < n - 1; k += paso) r.push([0, n - 1 - k], [n - 1, k]);
	return r;
};
for (const [i, j] of borde(8, 2)) copa.poner('32607', 'Bright_Pink', {sobre: p3, stud: [i, j]});
copa.paso();
for (const [i, j] of borde(6, 2)) copa.poner('32607', 'White', {sobre: p4, stud: [i, j]});
copa.paso();
for (const [i, j] of [[0, 0], [2, 0], [0, 2], [2, 2], [1, 3], [3, 1]]) copa.poner('32607', 'Bright_Pink', {sobre: p5, stud: [i, j]});
copa.paso();

// ---- Pétalos caídos (revelación del pasto): placas redondas 1x1 encastradas en la base
const pe = [[3, 5], [5, 11], [10, 12], [11, 4], [8, 1], [14, 9], [1, 8], [6, 14], [14, 14], [4, 2], [10, 7], [3, 10], [12, 1], [8, 11], [15, 5]];
pe.forEach(([i, j], k) => base.poner('6141', k % 3 ? 'Bright_Pink' : 'White', {sobre: pasto, stud: [i, j]}));
base.paso();

m.raiz.colocar(base);
m.raiz.paso();
m.raiz.colocar(tronco, {en: [0, -32, 0]});
m.raiz.paso();
m.raiz.colocar(copa, {en: [0, -136, 0]});
m.raiz.paso();
m.guardar();
