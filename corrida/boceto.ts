// Boceto: volumen general con piezas simples (base, tronco, copa en paraguas).
import {Modelo, grilla} from '../taller/src/dsl.ts';

const m = new Modelo('jacaranda-boceto');

const vereda = m.sub('vereda');
const losa = vereda.poner('91405', 'Tan');
vereda.paso();
// franja de calle al frente (−Z) y cordón
vereda.poner('3034', 'Dark_Bluish_Grey', {sobre: losa, stud: [0, 0]});
vereda.poner('3034', 'Dark_Bluish_Grey', {sobre: losa, stud: [8, 0]});
vereda.poner('3034', 'Dark_Bluish_Grey', {sobre: losa, stud: [0, 2]});
vereda.poner('3034', 'Dark_Bluish_Grey', {sobre: losa, stud: [8, 2]});
vereda.paso();

const tronco = m.sub('tronco');
let t = tronco.poner('3941', 'Reddish_Brown');
for (let k = 0; k < 4; k++) t = tronco.poner('3941', 'Reddish_Brown', {sobre: t, stud: [0, 0]});
tronco.paso();

const copa = m.sub('copa');
// capas centradas: 4x4, 8x8, 12x12, 16x16, 12x12, 8x8, 4x4 (y en LDU, −Y arriba)
copa.poner('3031', 'Medium_Lilac');
for (const z of [-40, 40]) copa.poner('3035', 'Medium_Lilac', {en: [0, -8, z]});
for (const z of [-60, 60]) copa.poner('3028', 'Medium_Lavender', {en: [0, -16, z]});
copa.paso();
copa.poner('91405', 'Medium_Lavender', {en: [0, -24, 0]});
for (const z of [-60, 60]) copa.poner('3028', 'Lavender', {en: [0, -32, z]});
for (const z of [-40, 40]) copa.poner('3035', 'Lavender', {en: [0, -40, z]});
copa.poner('3031', 'Lavender', {en: [0, -48, 0]});
copa.paso();

m.raiz.colocar(vereda);
m.raiz.paso();
m.raiz.colocar(tronco, {en: [0, -24, 0]});
m.raiz.paso();
m.raiz.colocar(copa, {en: [0, -128, 0]});
m.raiz.paso();
m.guardar();
