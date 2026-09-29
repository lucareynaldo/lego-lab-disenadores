// Boceto: la forma general con piezas simples (placas y ladrillos).
import {Modelo, grilla} from '../taller/src/dsl.ts';

const m = new Modelo('boceto');

// Base: dos placas 6x12 unidas por el montículo 6x8 que cruza la junta.
const base = m.sub('base');
const a = base.poner('3028', 'Green');
const monticulo = base.poner('3036', 'Bright_Green', {sobre: a, stud: [2, 3]});
base.poner('3028', 'Green', {debajo: monticulo, antistud: [0, 3], con: [2, 0]});
base.paso();

// Tronco: columna 2x2 de 4 ladrillos.
const tronco = m.sub('tronco');
let t = tronco.poner('3003', 'Reddish_Brown');
for (let k = 0; k < 3; k++) t = tronco.poner('3003', 'Reddish_Brown', {sobre: t, stud: [0, 0]});
tronco.paso();

// Ramas: dos placas 2x10 cruzadas (4 brazos de 4 studs) y una columna central.
const copa = m.sub('copa');
const ramaX = copa.poner('3832', 'Reddish_Brown');
const ramaZ = copa.poner('3832', 'Reddish_Brown', {sobre: ramaX, stud: [4, 0], con: [4, 0], giro: 90});
const guia = copa.poner('3003', 'Reddish_Brown', {sobre: ramaZ, stud: [4, 0]});
copa.paso();

// Nubes: una en cada punta de rama (4x4 + 2x4 + 2x2) y una más alta en el centro.
const nube = (sobre: typeof ramaX, stud: [number, number], color: string) => {
	const p = copa.poner('3031', color, {sobre, stud, con: [1, 1]});
	const b = copa.poner('3001', color, {sobre: p, stud: [0, 1]});
	copa.poner('3003', 'White', {sobre: b, stud: [1, 0]});
};
nube(ramaX, [0, 0], 'Bright_Pink');
nube(ramaX, [9, 1], 'Bright_Pink');
nube(ramaZ, [0, 0], 'White');
nube(ramaZ, [9, 1], 'White');
copa.paso();
const g2 = copa.poner('3003', 'Reddish_Brown', {sobre: guia, stud: [0, 0]});
const cima = copa.poner('3958', 'Bright_Pink', {sobre: g2, stud: [0, 0], con: [2, 2]});
const cb = copa.poner('3001', 'Bright_Pink', {sobre: cima, stud: [1, 2]});
copa.poner('3003', 'White', {sobre: cb, stud: [1, 0]});
copa.paso();

// Montaje: el montículo está centrado en (x 0, z 60) LDU del sub base; el tronco apoya en su tapa (y -8)
// y la copa en la tapa del tronco (y -104).
m.raiz.colocar(base);
m.raiz.paso();
m.raiz.colocar(tronco, {en: grilla(0, 4, 3)});
m.raiz.paso();
m.raiz.colocar(copa, {en: grilla(0, 14, 3)});
m.raiz.paso();
m.guardar();
