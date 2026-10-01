// Dragón "Centinela del tesoro": dragón occidental sentado como un gato sobre su roca, alas en V.
// Todo se encastra por conector: las piezas apiladas con `sobre` / `debajo` (el planificador de abajo busca
// qué stud del mismo sub-armado queda debajo), las articulaciones con `conector`, y cada sub-armado se monta
// en el modelo principal calculando su ubicación con una sonda que encastra su primera pieza en el stud de destino.

import {Modelo, grilla} from '../taller/src/dsl.ts';

type Sub = ReturnType<Modelo['sub']>;
type Pieza = ReturnType<Sub['poner']>;
type Celda = [number, number, number, number, number]; // i, j de la grilla de la pieza; dx, dz (studs) y dh (placas) desde la referencia
type Ficha = {r: number[]; a: Celda[]; s: Celda[]};
type Tr = {r: number[]; t: [number, number, number]};

// <TABLA> generada a partir de los conectores de cada pieza (lo mismo que muestra `piezas ver`): posición del
// conector de referencia (anti-stud (0,0), o stud (0,0) si no tiene anti-studs) y, para cada anti-stud y stud,
// su índice en la grilla de la pieza, su celda relativa a la referencia y su altura relativa en placas.
const T: Record<string, Ficha> = {
'11477': {r: [0, 0, -10], a: [[0,0,0,0,0],[0,1,0,1,1]], s: []}, // Slope Brick Curved 2 x 1
'15068': {r: [-10, 0, -10], a: [[0,0,0,0,0],[1,0,1,0,0],[0,1,0,1,1],[1,1,1,1,1]], s: []}, // Slope Brick Curved 2 x 2 x 0.667
'15070': {r: [0, 8, 0], a: [[0,0,0,0,0]], s: [[0,0,0,0,1]]}, // Plate 1 x 1 with Tooth Perpendicular
'27261': {r: [-10, 16, -20], a: [[0,0,0,0,0],[1,0,1,0,0],[0,1,0,1,1],[1,1,1,1,1]], s: [[0,0,0,1,1],[1,0,1,1,1]]}, // Plate 1 x 2 with 3 Rocky Claws
'27925': {r: [0, 8, -20], a: [[0,0,0,0,0],[1,1,1,1,0]], s: []}, // Tile 2 x 2 Corner Round
'3001': {r: [-30, 24, -10], a: [[0,0,0,0,0],[1,0,1,0,0],[2,0,2,0,0],[3,0,3,0,0],[0,1,0,1,0],[1,1,1,1,0],[2,1,2,1,0],[3,1,3,1,0]], s: [[0,0,0,0,3],[1,0,1,0,3],[2,0,2,0,3],[3,0,3,0,3],[0,1,0,1,3],[1,1,1,1,3],[2,1,2,1,3],[3,1,3,1,3]]}, // Brick 2 x 4
'3002': {r: [-20, 24, -10], a: [[0,0,0,0,0],[1,0,1,0,0],[2,0,2,0,0],[0,1,0,1,0],[1,1,1,1,0],[2,1,2,1,0]], s: [[0,0,0,0,3],[1,0,1,0,3],[2,0,2,0,3],[0,1,0,1,3],[1,1,1,1,3],[2,1,2,1,3]]}, // Brick 2 x 3
'3003': {r: [-10, 24, -10], a: [[0,0,0,0,0],[1,0,1,0,0],[0,1,0,1,0],[1,1,1,1,0]], s: [[0,0,0,0,3],[1,0,1,0,3],[0,1,0,1,3],[1,1,1,1,3]]}, // Brick 2 x 2
'3004': {r: [-10, 24, 0], a: [[0,0,0,0,0],[1,0,1,0,0]], s: [[0,0,0,0,3],[1,0,1,0,3]]}, // Brick 1 x 2
'3010': {r: [-30, 24, 0], a: [[0,0,0,0,0],[1,0,1,0,0],[2,0,2,0,0],[3,0,3,0,0]], s: [[0,0,0,0,3],[1,0,1,0,3],[2,0,2,0,3],[3,0,3,0,3]]}, // Brick 1 x 4
'3020': {r: [-30, 8, -10], a: [[0,0,0,0,0],[1,0,1,0,0],[2,0,2,0,0],[3,0,3,0,0],[0,1,0,1,0],[1,1,1,1,0],[2,1,2,1,0],[3,1,3,1,0]], s: [[0,0,0,0,1],[1,0,1,0,1],[2,0,2,0,1],[3,0,3,0,1],[0,1,0,1,1],[1,1,1,1,1],[2,1,2,1,1],[3,1,3,1,1]]}, // Plate 2 x 4
'3021': {r: [-20, 8, -10], a: [[0,0,0,0,0],[1,0,1,0,0],[2,0,2,0,0],[0,1,0,1,0],[1,1,1,1,0],[2,1,2,1,0]], s: [[0,0,0,0,1],[1,0,1,0,1],[2,0,2,0,1],[0,1,0,1,1],[1,1,1,1,1],[2,1,2,1,1]]}, // Plate 2 x 3
'3022': {r: [-10, 8, -10], a: [[0,0,0,0,0],[1,0,1,0,0],[0,1,0,1,0],[1,1,1,1,0]], s: [[0,0,0,0,1],[1,0,1,0,1],[0,1,0,1,1],[1,1,1,1,1]]}, // Plate 2 x 2
'3024': {r: [0, 8, 0], a: [[0,0,0,0,0]], s: [[0,0,0,0,1]]}, // Plate 1 x 1
'3031': {r: [-30, 8, -30], a: [[0,0,0,0,0],[1,0,1,0,0],[2,0,2,0,0],[3,0,3,0,0],[0,1,0,1,0],[1,1,1,1,0],[2,1,2,1,0],[3,1,3,1,0],[0,2,0,2,0],[1,2,1,2,0],[2,2,2,2,0],[3,2,3,2,0],[0,3,0,3,0],[1,3,1,3,0],[2,3,2,3,0],[3,3,3,3,0]], s: [[0,0,0,0,1],[1,0,1,0,1],[2,0,2,0,1],[3,0,3,0,1],[0,1,0,1,1],[1,1,1,1,1],[2,1,2,1,1],[3,1,3,1,1],[0,2,0,2,1],[1,2,1,2,1],[2,2,2,2,1],[3,2,3,2,1],[0,3,0,3,1],[1,3,1,3,1],[2,3,2,3,1],[3,3,3,3,1]]}, // Plate 4 x 4
'3032': {r: [-50, 8, -30], a: [[0,0,0,0,0],[1,0,1,0,0],[2,0,2,0,0],[3,0,3,0,0],[4,0,4,0,0],[5,0,5,0,0],[0,1,0,1,0],[1,1,1,1,0],[2,1,2,1,0],[3,1,3,1,0],[4,1,4,1,0],[5,1,5,1,0],[0,2,0,2,0],[1,2,1,2,0],[2,2,2,2,0],[3,2,3,2,0],[4,2,4,2,0],[5,2,5,2,0],[0,3,0,3,0],[1,3,1,3,0],[2,3,2,3,0],[3,3,3,3,0],[4,3,4,3,0],[5,3,5,3,0]], s: [[0,0,0,0,1],[1,0,1,0,1],[2,0,2,0,1],[3,0,3,0,1],[4,0,4,0,1],[5,0,5,0,1],[0,1,0,1,1],[1,1,1,1,1],[2,1,2,1,1],[3,1,3,1,1],[4,1,4,1,1],[5,1,5,1,1],[0,2,0,2,1],[1,2,1,2,1],[2,2,2,2,1],[3,2,3,2,1],[4,2,4,2,1],[5,2,5,2,1],[0,3,0,3,1],[1,3,1,3,1],[2,3,2,3,1],[3,3,3,3,1],[4,3,4,3,1],[5,3,5,3,1]]}, // Plate 4 x 6
'3034': {r: [-70, 8, -10], a: [[0,0,0,0,0],[1,0,1,0,0],[2,0,2,0,0],[3,0,3,0,0],[4,0,4,0,0],[5,0,5,0,0],[6,0,6,0,0],[7,0,7,0,0],[0,1,0,1,0],[1,1,1,1,0],[2,1,2,1,0],[3,1,3,1,0],[4,1,4,1,0],[5,1,5,1,0],[6,1,6,1,0],[7,1,7,1,0]], s: [[0,0,0,0,1],[1,0,1,0,1],[2,0,2,0,1],[3,0,3,0,1],[4,0,4,0,1],[5,0,5,0,1],[6,0,6,0,1],[7,0,7,0,1],[0,1,0,1,1],[1,1,1,1,1],[2,1,2,1,1],[3,1,3,1,1],[4,1,4,1,1],[5,1,5,1,1],[6,1,6,1,1],[7,1,7,1,1]]}, // Plate 2 x 8
'3036': {r: [-70, 8, -50], a: [[0,0,0,0,0],[1,0,1,0,0],[2,0,2,0,0],[3,0,3,0,0],[4,0,4,0,0],[5,0,5,0,0],[6,0,6,0,0],[7,0,7,0,0],[0,1,0,1,0],[1,1,1,1,0],[2,1,2,1,0],[3,1,3,1,0],[4,1,4,1,0],[5,1,5,1,0],[6,1,6,1,0],[7,1,7,1,0],[0,2,0,2,0],[1,2,1,2,0],[2,2,2,2,0],[3,2,3,2,0],[4,2,4,2,0],[5,2,5,2,0],[6,2,6,2,0],[7,2,7,2,0],[0,3,0,3,0],[1,3,1,3,0],[2,3,2,3,0],[3,3,3,3,0],[4,3,4,3,0],[5,3,5,3,0],[6,3,6,3,0],[7,3,7,3,0],[0,4,0,4,0],[1,4,1,4,0],[2,4,2,4,0],[3,4,3,4,0],[4,4,4,4,0],[5,4,5,4,0],[6,4,6,4,0],[7,4,7,4,0],[0,5,0,5,0],[1,5,1,5,0],[2,5,2,5,0],[3,5,3,5,0],[4,5,4,5,0],[5,5,5,5,0],[6,5,6,5,0],[7,5,7,5,0]], s: [[0,0,0,0,1],[1,0,1,0,1],[2,0,2,0,1],[3,0,3,0,1],[4,0,4,0,1],[5,0,5,0,1],[6,0,6,0,1],[7,0,7,0,1],[0,1,0,1,1],[1,1,1,1,1],[2,1,2,1,1],[3,1,3,1,1],[4,1,4,1,1],[5,1,5,1,1],[6,1,6,1,1],[7,1,7,1,1],[0,2,0,2,1],[1,2,1,2,1],[2,2,2,2,1],[3,2,3,2,1],[4,2,4,2,1],[5,2,5,2,1],[6,2,6,2,1],[7,2,7,2,1],[0,3,0,3,1],[1,3,1,3,1],[2,3,2,3,1],[3,3,3,3,1],[4,3,4,3,1],[5,3,5,3,1],[6,3,6,3,1],[7,3,7,3,1],[0,4,0,4,1],[1,4,1,4,1],[2,4,2,4,1],[3,4,3,4,1],[4,4,4,4,1],[5,4,5,4,1],[6,4,6,4,1],[7,4,7,4,1],[0,5,0,5,1],[1,5,1,5,1],[2,5,2,5,1],[3,5,3,5,1],[4,5,4,5,1],[5,5,5,5,1],[6,5,6,5,1],[7,5,7,5,1]]}, // Plate 6 x 8
'3039': {r: [-10, 24, -20], a: [[0,0,0,0,0],[1,0,1,0,0],[0,1,0,1,0],[1,1,1,1,0]], s: [[0,0,0,1,3],[1,0,1,1,3]]}, // Slope Brick 45 2 x 2
'3040b': {r: [0, 24, -20], a: [[0,0,0,0,0],[0,1,0,1,0]], s: [[0,0,0,1,3]]}, // Slope Brick 45 2 x 1
'3062b': {r: [0, 24, 0], a: [[0,0,0,0,0]], s: [[0,0,0,0,3]]}, // Brick 1 x 1 Round with Hollow Stud
'3068b': {r: [-10, 8, -10], a: [[0,0,0,0,0],[1,0,1,0,0],[0,1,0,1,0],[1,1,1,1,0]], s: []}, // Tile 2 x 2 with Groove
'3069b': {r: [-10, 8, 0], a: [[0,0,0,0,0],[1,0,1,0,0]], s: []}, // Tile 1 x 2 with Groove
'32803': {r: [-10, 0, 0], a: [], s: [[0,0,0,0,0],[1,0,1,0,0],[0,1,0,1,-1],[1,1,1,1,-1]]}, // Slope Brick Curved 2 x 2 Inverted
'3460': {r: [-70, 8, 0], a: [[0,0,0,0,0],[1,0,1,0,0],[2,0,2,0,0],[3,0,3,0,0],[4,0,4,0,0],[5,0,5,0,0],[6,0,6,0,0],[7,0,7,0,0]], s: [[0,0,0,0,1],[1,0,1,0,1],[2,0,2,0,1],[3,0,3,0,1],[4,0,4,0,1],[5,0,5,0,1],[6,0,6,0,1],[7,0,7,0,1]]}, // Plate 1 x 8
'35480': {r: [-10, 8, 0], a: [[0,0,0,0,0],[1,0,1,0,0]], s: [[0,0,0,0,1],[1,0,1,0,1]]}, // Plate 1 x 2 with Round Ends and 2 Open Studs
'3622': {r: [-20, 24, 0], a: [[0,0,0,0,0],[1,0,1,0,0],[2,0,2,0,0]], s: [[0,0,0,0,3],[1,0,1,0,3],[2,0,2,0,3]]}, // Brick 1 x 3
'3666': {r: [-50, 8, 0], a: [[0,0,0,0,0],[1,0,1,0,0],[2,0,2,0,0],[3,0,3,0,0],[4,0,4,0,0],[5,0,5,0,0]], s: [[0,0,0,0,1],[1,0,1,0,1],[2,0,2,0,1],[3,0,3,0,1],[4,0,4,0,1],[5,0,5,0,1]]}, // Plate 1 x 6
'3794b': {r: [-10, 8, 0], a: [[0,0,0,0,0],[1,0,1,0,0]], s: [[0,0,1,0,1]]}, // Plate 1 x 2 with Groove with 1 Centre Stud
'3795': {r: [-50, 8, -10], a: [[0,0,0,0,0],[1,0,1,0,0],[2,0,2,0,0],[3,0,3,0,0],[4,0,4,0,0],[5,0,5,0,0],[0,1,0,1,0],[1,1,1,1,0],[2,1,2,1,0],[3,1,3,1,0],[4,1,4,1,0],[5,1,5,1,0]], s: [[0,0,0,0,1],[1,0,1,0,1],[2,0,2,0,1],[3,0,3,0,1],[4,0,4,0,1],[5,0,5,0,1],[0,1,0,1,1],[1,1,1,1,1],[2,1,2,1,1],[3,1,3,1,1],[4,1,4,1,1],[5,1,5,1,1]]}, // Plate 2 x 6
'39262': {r: [0, 8, 0], a: [[0,0,0,0,0]], s: [[0,0,0,0,1]]}, // Minifig Crown with 5 Points
'3933': {r: [-30, 8, -70], a: [[0,0,0,0,0],[0,1,0,1,0],[0,2,0,2,0],[1,2,1,2,0],[0,3,0,3,0],[1,3,1,3,0],[0,4,0,4,0],[1,4,1,4,0],[2,4,2,4,0],[0,5,0,5,0],[1,5,1,5,0],[2,5,2,5,0],[0,6,0,6,0],[1,6,1,6,0],[2,6,2,6,0],[0,7,0,7,0],[1,7,1,7,0],[2,7,2,7,0]], s: [[0,0,0,0,1],[0,1,0,1,1],[0,2,0,2,1],[1,2,1,2,1],[0,3,0,3,1],[1,3,1,3,1],[0,4,0,4,1],[1,4,1,4,1],[2,4,2,4,1],[0,5,0,5,1],[1,5,1,5,1],[2,5,2,5,1],[0,6,0,6,1],[1,6,1,6,1],[2,6,2,6,1],[0,7,0,7,1],[1,7,1,7,1],[2,7,2,7,1]]}, // Wing 4 x 8 Left
'4032a': {r: [-10, 8, -10], a: [[0,0,0,0,0],[1,0,1,0,0],[0,1,0,1,0],[1,1,1,1,0]], s: [[0,0,0,0,1],[1,0,1,0,1],[0,1,0,1,1],[1,1,1,1,1]]}, // Plate 2 x 2 Round with Axlehole
'44301a': {r: [-10, 8, 0], a: [[0,0,0,0,0],[1,0,1,0,0]], s: [[0,0,0,0,1],[1,0,1,0,1]]}, // Hinge Plate 1 x 2 Locking with Groove with Single Finger on End Vertical
'44302a': {r: [-10, 8, 0], a: [[0,0,0,0,0],[1,0,1,0,0]], s: [[0,0,0,0,1],[1,0,1,0,1]]}, // Hinge Plate 1 x 2 Locking with Dual Finger on End Vertical with Groove on Short Side
'4738b': {r: [-30, 32, -10], a: [[0,0,0,0,0],[1,0,1,0,0],[2,0,2,0,0],[3,0,3,0,0],[0,1,0,1,0],[1,1,1,1,0],[2,1,2,1,0],[3,1,3,1,0]], s: []}, // Container Treasure Chest without Slots
'4739a': {r: [-30, 0, 0], a: [], s: [[0,0,0,0,0],[1,0,1,0,0],[2,0,2,0,0],[3,0,3,0,0]]}, // Container Treasure Chest with Slots Lid
'4740': {r: [0, 8, 0], a: [[0,0,0,0,0]], s: [[0,0,0,0,1]]}, // Dish 2 x 2 Inverted
'49668': {r: [0, 8, 0], a: [[0,0,0,0,0]], s: [[0,0,0,0,1]]}, // Plate 1 x 1 with Tooth In-line
'54200': {r: [0, 0, 0], a: [[0,0,0,0,0]], s: []}, // Slope Brick 31 1 x 1 x 0.667
'6003': {r: [-50, 8, -50], a: [[0,0,0,0,0],[1,0,1,0,0],[2,0,2,0,0],[0,1,0,1,0],[1,1,1,1,0],[2,1,2,1,0],[3,1,3,1,0],[4,1,4,1,0],[0,2,0,2,0],[1,2,1,2,0],[2,2,2,2,0],[3,2,3,2,0],[4,2,4,2,0],[0,3,0,3,0],[1,3,1,3,0],[2,3,2,3,0],[3,3,3,3,0],[4,3,4,3,0],[5,3,5,3,0],[0,4,0,4,0],[1,4,1,4,0],[2,4,2,4,0],[3,4,3,4,0],[4,4,4,4,0],[5,4,5,4,0],[0,5,0,5,0],[1,5,1,5,0],[2,5,2,5,0],[3,5,3,5,0],[4,5,4,5,0],[5,5,5,5,0]], s: [[0,0,0,0,1],[1,0,1,0,1],[2,0,2,0,1],[0,1,0,1,1],[1,1,1,1,1],[2,1,2,1,1],[3,1,3,1,1],[4,1,4,1,1],[0,2,0,2,1],[1,2,1,2,1],[2,2,2,2,1],[3,2,3,2,1],[4,2,4,2,1],[0,3,0,3,1],[1,3,1,3,1],[2,3,2,3,1],[3,3,3,3,1],[4,3,4,3,1],[5,3,5,3,1],[0,4,0,4,1],[1,4,1,4,1],[2,4,2,4,1],[3,4,3,4,1],[4,4,4,4,1],[5,4,5,4,1],[0,5,0,5,1],[1,5,1,5,1],[2,5,2,5,1],[3,5,3,5,1],[4,5,4,5,1],[5,5,5,5,1]]}, // Plate 6 x 6 with 4 x 4 Round Corner
'6141': {r: [0, 8, 0], a: [[0,0,0,0,0]], s: [[0,0,0,0,0.63]]}, // Plate 1 x 1 Round
'65426': {r: [10, 8, -10], a: [[1,0,0,0,0],[1,1,0,1,0],[0,2,-1,2,0],[1,2,0,2,0]], s: [[0,0,0,1,1],[0,1,0,2,1]]}, // Wing 2 x 4 Right with Truncated Tip
'6636': {r: [-50, 8, 0], a: [[0,0,0,0,0],[1,0,1,0,0],[2,0,2,0,0],[3,0,3,0,0],[4,0,4,0,0],[5,0,5,0,0]], s: []}, // Tile 1 x 6
'85984': {r: [-10, 0, 0], a: [[0,0,0,0,0],[1,0,1,0,0]], s: []}, // Slope Brick 31 1 x 2 x 0.667
'87087': {r: [0, 24, 0], a: [[0,0,0,0,0]], s: [[0,0,0,0,3]]}, // Brick 1 x 1 with Stud on 1 Side
'87580': {r: [-10, 8, -10], a: [[0,0,0,0,0],[1,0,1,0,0],[0,1,0,1,0],[1,1,1,1,0]], s: [[0,0,1,1,1]]}, // Plate 2 x 2 with Groove with 1 Centre Stud
};
// </TABLA>

// ---------- Planificador: celdas del mundo (x a la derecha, z hacia atrás, h en placas hacia arriba) ----------
// Cada sub-armado alineado con la grilla registra sus studs y anti-studs libres por celda; `pon` busca qué stud del
// mismo sub-armado queda debajo de la pieza nueva y la encastra con `sobre` (o `debajo` en `cuelga`).

const girar = (g: number, dx: number, dz: number): [number, number] => {
	switch (((g % 360) + 360) % 360) {
		case 0: return [dx, dz];
		case 90: return [-dz, dx];
		case 180: return [-dx, -dz];
		case 270: return [dz, -dx];
	}
	throw new Error(`giro inválido ${g}`);
};
const clave = (x: number, z: number, h: number) => `${x},${z},${Math.round(h * 100) / 100}`;
type Punto = {p: Pieza; i: number; j: number};

// Matrices por filas, como LDraw.
const IDENT: Tr = {r: [1, 0, 0, 0, 1, 0, 0, 0, 1], t: [0, 0, 0]};
const mulR = (a: number[], b: number[]) => [0, 1, 2].flatMap((f) => [0, 1, 2].map((c) => a[f * 3] * b[c] + a[f * 3 + 1] * b[3 + c] + a[f * 3 + 2] * b[6 + c]));
const mulV = (a: number[], v: number[]): [number, number, number] => [0, 1, 2].map((f) => a[f * 3] * v[0] + a[f * 3 + 1] * v[1] + a[f * 3 + 2] * v[2]) as [number, number, number];
const componer = (a: Tr, b: Tr): Tr => {
	const t = mulV(a.r, b.t);
	return {r: mulR(a.r, b.r), t: [t[0] + a.t[0], t[1] + a.t[1], t[2] + a.t[2]]};
};
const invertir = (a: Tr): Tr => {
	const r = [a.r[0], a.r[3], a.r[6], a.r[1], a.r[4], a.r[7], a.r[2], a.r[5], a.r[8]];
	const t = mulV(r, a.t);
	return {r, t: [-t[0], -t[1], -t[2]]};
};
// Matriz → "X a Y b Z c" (R = Rz·Ry·Rx, el orden en que la DSL aplica los giros).
const grados = (x: number) => ((x * 180) / Math.PI).toFixed(6);
function rotTexto(r: number[]): string {
	const b = Math.asin(Math.max(-1, Math.min(1, -r[6])));
	const gimbal = Math.abs(Math.cos(b)) < 1e-6;
	const a = gimbal ? 0 : Math.atan2(r[7], r[8]);
	const c = gimbal ? Math.atan2(-r[1], r[4]) : Math.atan2(r[3], r[0]);
	return `X${grados(a)} Y${grados(b)} Z${grados(c)}`;
}
const trDe = (p: Pieza): Tr => ({r: [...p.tr.r], t: [...p.tr.t] as [number, number, number]});

const m = new Modelo('dragon centinela');
const sonda = new Modelo('sonda').raiz; // nunca se guarda: sirve para calcular dónde cae una pieza
const marcos = new Map<Sub, Tr>(); // ubicación de cada sub-armado en el modelo principal

const STUDS = new Map<string, Punto>();
const ANTIS = new Map<string, Punto>();

function ficha(id: string): Ficha {
	const f = T[id];
	if (!f) throw new Error(`falta ${id} en la tabla`);
	return f;
}
const idDe = (p: Pieza) => p.archivo.replace(/\.dat$/, '');

class Plano {
	sub: Sub;
	studs: Map<string, Punto>;
	antis: Map<string, Punto>;
	primera?: {p: Pieza; x: number; z: number; h: number; giro: number};
	constructor(nombre: string, local = false) {
		this.sub = m.sub(nombre);
		// Los sub-armados que se montan girados (alas) llevan su propio registro.
		this.studs = local ? new Map() : STUDS;
		this.antis = local ? new Map() : ANTIS;
	}
	registrar(p: Pieza, f: Ficha, ax: number, az: number, h: number, giro: number) {
		for (const [i, j, dx, dz, dh] of f.a) {
			const [rx, rz] = girar(giro, dx, dz);
			this.antis.set(clave(ax + rx, az + rz, h + dh), {p, i, j});
		}
		for (const [i, j, dx, dz, dh] of f.s) {
			const [rx, rz] = girar(giro, dx, dz);
			this.studs.set(clave(ax + rx, az + rz, h + dh), {p, i, j});
		}
	}
	// Celdas giradas y celda de la referencia para que la esquina mínima quede en (x, z).
	private huella(celdas: Celda[], giro: number, x: number, z: number) {
		const rot = celdas.map(([i, j, dx, dz, dh]) => [i, j, ...girar(giro, dx, dz), dh] as Celda);
		return {rot, ax: x - Math.min(...rot.map((c) => c[2])), az: z - Math.min(...rot.map((c) => c[3]))};
	}
	private nombre(id: string, x: number, z: number, h: number, n?: string) {
		return n ?? `${this.sub.nombre}/${id}@${x},${z},h${h}`;
	}
	// Primera pieza del sub-armado, en su origen; (x, z, h) dice dónde cae en el mundo.
	base(id: string, color: string, x: number, z: number, h: number, giro = 0, nombre?: string): Pieza {
		const f = ficha(id);
		const {ax, az} = this.huella(f.a, giro, x, z);
		const n = this.nombre(id, x, z, h, nombre);
		const p = giro ? this.sub.poner(id, color, {en: [0, 0, 0], rot: `Y${-giro}`, nombre: n}) : this.sub.poner(id, color, {nombre: n});
		this.primera = {p, x: ax, z: az, h, giro};
		this.registrar(p, f, ax, az, h, giro);
		return p;
	}
	// Pieza apoyada en studs del mismo sub-armado: (x, z) es la esquina mínima de su huella y h la altura de su base.
	pon(id: string, color: string, x: number, z: number, h: number, giro = 0, nombre?: string): Pieza {
		const f = ficha(id);
		const {rot, ax, az} = this.huella(f.a, giro, x, z);
		for (const [i, j, dx, dz, dh] of rot) {
			const pt = this.studs.get(clave(ax + dx, az + dz, h + dh));
			if (pt && pt.p.sub === this.sub) {
				const p = this.sub.poner(id, color, {sobre: pt.p, stud: [pt.i, pt.j], con: [i, j], giro, nombre: this.nombre(id, x, z, h, nombre)});
				this.registrar(p, f, ax, az, h, giro);
				return p;
			}
		}
		// En la primera capa del sub-armado puede ir apoyada en la mesa y unirse después.
		if (this.primera && h === this.primera.h) return this.suelta(id, color, x, z, h, giro, nombre);
		throw new Error(`${this.sub.nombre}: ${id} en (${x}, ${z}, h${h}) no tiene stud debajo`);
	}
	// Pieza colgada bajo anti-studs del mismo sub-armado: (x, z) esquina mínima de sus studs, htope la altura de esos studs.
	cuelga(id: string, color: string, x: number, z: number, htope: number, giro = 0, nombre?: string): Pieza {
		const f = ficha(id);
		const {rot, ax, az} = this.huella(f.s, giro, x, z);
		for (const [i, j, dx, dz, dh] of rot) {
			const pt = this.antis.get(clave(ax + dx, az + dz, htope));
			if (pt && pt.p.sub === this.sub) {
				const h = htope - dh; // altura de la referencia
				const p = this.sub.poner(id, color, {debajo: pt.p, antistud: [pt.i, pt.j], con: [i, j], giro, nombre: this.nombre(id, x, z, h, nombre)});
				this.registrar(p, f, ax, az, h, giro);
				return p;
			}
		}
		throw new Error(`${this.sub.nombre}: ${id} colgada en (${x}, ${z}, h${htope}) no tiene anti-stud encima`);
	}
	// Pieza suelta sobre la mesa, ubicada en la grilla del sub-armado a partir de su primera pieza.
	suelta(id: string, color: string, x: number, z: number, h: number, giro = 0, nombre?: string): Pieza {
		const f = ficha(id);
		const b = this.primera!;
		const rb = mulV(b.p.tr.r, ficha(idDe(b.p)).r);
		const {ax, az} = this.huella(f.a, giro, x, z);
		const destino = [rb[0] + b.p.tr.t[0] + 20 * (ax - b.x), rb[1] + b.p.tr.t[1] - 8 * (h - b.h), rb[2] + b.p.tr.t[2] + 20 * (az - b.z)];
		const th = (-giro * Math.PI) / 180;
		const R = [Math.cos(th), 0, Math.sin(th), 0, 1, 0, -Math.sin(th), 0, Math.cos(th)].map((v) => Math.round(v * 1e9) / 1e9);
		const rr = mulV(R, f.r);
		const p = this.sub.poner(id, color, {en: [destino[0] - rr[0], destino[1] - rr[1], destino[2] - rr[2]], rot: `Y${-giro}`, nombre: this.nombre(id, x, z, h, nombre)});
		this.registrar(p, f, ax, az, h, giro);
		return p;
	}
	// Por conector numerado (studs laterales, bisagras, piezas raras): no se registra en la grilla.
	conecta(id: string, color: string, de: Pieza, n: number, propio: number, giro = 0, nombre?: string): Pieza {
		return this.sub.poner(id, color, {conector: {de, n}, propio, giro, nombre: nombre ?? `${this.sub.nombre}/${id}#${n}`});
	}
	paso() {
		this.sub.paso();
	}
}

// Monta un sub-armado en el modelo principal: su primera pieza encastra en un stud libre de otro sub-armado ya
// montado. La sonda repite ese encastre y de ahí sale la ubicación del sub-armado.
function montar(pl: Plano) {
	const b = pl.primera!;
	for (const [i, j, dx, dz, dh] of ficha(idDe(b.p)).a) {
		const [rx, rz] = girar(b.giro, dx, dz);
		const pt = STUDS.get(clave(b.x + rx, b.z + rz, b.h + dh));
		if (!pt || pt.p.sub === pl.sub || !marcos.has(pt.p.sub)) continue;
		const copia = sonda.poner(pt.p.archivo, pt.p.color.codigo, {en: pt.p.tr.t, rot: rotTexto(pt.p.tr.r)});
		const prueba = sonda.poner(b.p.archivo, b.p.color.codigo, {sobre: copia, stud: [pt.i, pt.j], con: [i, j], giro: b.giro});
		const tr = componer(componer(marcos.get(pt.p.sub)!, trDe(prueba)), invertir(trDe(b.p)));
		m.raiz.colocar(pl.sub, {en: tr.t, rot: rotTexto(tr.r)});
		marcos.set(pl.sub, tr);
		return;
	}
	throw new Error(`no encuentro dónde montar ${pl.sub.nombre}`);
}

// Monta un sub-armado por un conector cualquiera (bisagra, stud lateral), con giro libre alrededor de su eje.
function montarPor(sub: Sub, propia: Pieza, nPropio: number, destino: Pieza, nDestino: number, giro = 0) {
	const copia = sonda.poner(destino.archivo, destino.color.codigo, {en: destino.tr.t, rot: rotTexto(destino.tr.r)});
	const prueba = sonda.poner(propia.archivo, propia.color.codigo, {conector: {de: copia, n: nDestino}, propio: nPropio, giro});
	const tr = componer(componer(marcos.get(destino.sub)!, trDe(prueba)), invertir(trDe(propia)));
	m.raiz.colocar(sub, {en: tr.t, rot: rotTexto(tr.r)});
	marcos.set(sub, tr);
}

// ---------- Modelo ----------
const R = 'Red', DR = 'Dark_Red', TAN = 'Tan', DBG = 'Dark_Bluish_Grey', LBG = 'Light_Bluish_Grey', PG = 'Pearl_Gold';
// giros: una pendiente mira a −z (frente) con 0, a +x con 90, a +z con 180 y a −x con 270.
const FRENTE = 0, DER = 90, ATRAS = 180, IZQ = 270;
const NAR = 'Orange'; // membranas de las alas y punta de la cola

// ===== Roca: suelo redondeado de 14 × 14, losa de 8 × 8 (tope en h5) y el tesoro =====
const roca = new Plano('roca');
// Se arma de atrás hacia adelante para que la cámara 3/4 (frente-izquierda) vea cada pieza nueva.
roca.base('6003', DBG, 1, 1, 0, 90);
roca.pon('6003', DBG, 1, -7, 0);
roca.paso();
roca.pon('6003', DBG, -7, 1, 0, 180);
roca.pon('6003', DBG, -7, -7, 0, 270);
roca.paso();
roca.pon('3795', DBG, -1, 1, 0, 90);
roca.pon('3034', DBG, -1, -7, 0, 90);
roca.pon('3795', DBG, -7, -1, 0);
roca.pon('3795', DBG, 1, -1, 0);
roca.pon('3036', DBG, -3, -4, 1, 90); // la losa ata los cuatro cuartos
roca.pon('3460', DBG, -4, -4, 1, 90);
roca.pon('3460', DBG, 3, -4, 1, 90);
roca.paso();
for (const [x, z, c] of [[2, 0, LBG], [2, -4, LBG], [0, 0, LBG], [0, -4, DBG]] as const) roca.pon('3001', c, x, z, 2, 90);
roca.paso();
for (const [x, z, c] of [[-2, 0, LBG], [-2, -4, LBG], [-4, 0, DBG], [-4, -4, LBG]] as const) roca.pon('3001', c, x, z, 2, 90);
roca.paso();
// rocas al pie de la losa y el tesoro desparramado
roca.pon('3039', DBG, 2, 4, 1, ATRAS);
roca.pon('3040b', LBG, 1, 4, 1, ATRAS);
roca.pon('3040b', DBG, 4, 4, 1, DER);
roca.pon('3039', LBG, 4, 2, 1, DER);
roca.pon('4032a', PG, 5, 0, 1);
const pila = roca.pon('4740', PG, 5, 0, 2);
roca.conecta('39262', PG, pila, 2, 0, 20, 'corona');
roca.pon('6141', PG, 4, 0, 1);
roca.pon('6141', PG, 4, -4, 1);
roca.pon('3062b', PG, 5, -6, 1);
roca.pon('6141', 'Trans_Red', 5, -6, 4);
roca.pon('6141', 'Trans_Clear', 3, -7, 1);
roca.paso();
// el cofre abierto
const cofre = roca.pon('4738b', 'Reddish_Brown', 5, -4, 1, 270);
roca.conecta('4739a', 'Reddish_Brown', cofre, 0, 0, -60, 'tapa');
roca.paso();
m.raiz.colocar(roca.sub);
marcos.set(roca.sub, IDENT);
m.raiz.paso();

// ===== Cola: sale de atrás de la cadera, da la vuelta por la izquierda y termina adelante, junto al tesoro =====
const col = new Plano('cola');
// cresta: placa 2 × 2 con un stud al centro y una púa encima, centrada en la cola
function crestaCola(x: number, z: number, h: number, giro: number) {
	const j = col.pon('87580', R, x, z, h);
	col.conecta('49668', DR, j, 10, 0, giro, `cresta@${x},${z}`);
}
col.base('3020', R, -3, 4, 1);
col.pon('3021', R, -6, 4, 1);
col.pon('3003', R, -1, 4, 2); // raíz
col.pon('3021', R, -4, 4, 2);
col.pon('3022', R, -1, 4, 5);
col.pon('15068', R, -1, 4, 6, ATRAS);
col.paso();
col.pon('3795', R, -6, -2, 1, 90);
col.pon('3020', R, -6, 2, 2, 90);
col.pon('3022', R, -6, 0, 2);
col.pon('3020', R, -6, -6, 1, 90);
col.pon('3020', R, -6, -4, 2, 90);
col.pon('3020', R, -4, -6, 1);
col.pon('3020', R, -6, -6, 2);
col.pon('3022', R, 0, -6, 1);
col.pon('3022', R, -1, -6, 2);
col.pon('65426', NAR, 1, -6, 2, 90); // punta de la cola
col.pon('3069b', R, -2, -6, 2, 90);
col.paso();
// lomo: curvas que caen hacia afuera y una cresta de púas centrada
col.pon('15068', R, -6, 4, 3, ATRAS);
col.pon('15068', R, -4, 4, 3, ATRAS);
col.pon('11477', R, -2, 4, 3, ATRAS);
col.pon('3068b', R, -6, 2, 3);
crestaCola(-6, 0, 3, ATRAS);
col.pon('3068b', R, -6, -2, 3);
crestaCola(-6, -4, 3, ATRAS);
col.pon('27925', R, -6, -6, 3, 270);
crestaCola(-4, -6, 3, IZQ);
col.paso();
montar(col);
m.raiz.paso();

// ===== Cadera y patas traseras (sobre la losa, h5) =====
const cad = new Plano('cadera');
cad.base('3032', R, -2, -2, 5, 90); // plato de la cadera 4 × 6
cad.pon('3795', R, 2, -3, 5, 90); // plantas de los pies
cad.pon('3795', R, -4, -3, 5, 90);
cad.paso();
cad.pon('27261', DR, 2, -4, 5); // garras: agarran la losa
cad.pon('27261', DR, -4, -4, 5);
// h6: pelvis y muslos (atan la planta con el plato)
cad.pon('3001', R, -1, -1, 6, 90);
cad.pon('3001', R, 1, -2, 6, 90);
cad.pon('3010', R, 3, -2, 6, 90);
cad.pon('3622', R, 1, 2, 6);
cad.paso();
cad.pon('3001', R, -3, -2, 6, 90);
cad.pon('3010', R, -4, -2, 6, 90);
cad.pon('3622', R, -4, 2, 6);
cad.paso();
// h9: parte alta del muslo y rodilla curva
cad.pon('3001', R, -1, -1, 9, 90);
cad.pon('3010', R, 1, -1, 9, 90);
cad.pon('3002', R, 2, 0, 9, 90);
cad.pon('15068', R, 2, -2, 9, FRENTE);
cad.paso();
cad.pon('3010', R, -2, -1, 9, 90);
cad.pon('3002', R, -4, 0, 9, 90);
cad.pon('15068', R, -4, -2, 9, FRENTE);
cad.paso();
// h12: lomo de los muslos y bajada hacia la cola
for (const x of [2, -4]) {
	cad.pon('15068', R, x, 0, 12, FRENTE);
	cad.pon('85984', R, x, 2, 12, ATRAS);
}
for (const x of [0, -2]) cad.pon('3039', R, x, 2, 12, ATRAS);
cad.paso();
// plato del pecho: asoma adelante y de él cuelgan las patas delanteras (el sub-armado se da vuelta)
cad.pon('3032', R, -2, -4, 12, 90);
for (const [x, nPata] of [[1, 6], [-2, 7]] as const) {
	cad.cuelga('3004', R, x, -4, 12, 90); // codo
	const pierna = cad.cuelga('3062b', R, x, -4, 9);
	cad.conecta('27261', DR, pierna, 0, nPata); // la pata agarra el borde de la roca
}
cad.cuelga('32803', TAN, -1, -4, 12, FRENTE); // panza redondeada entre las patas
cad.paso();
montar(cad);
m.raiz.paso();

// ===== Torso y cuello =====
function pua(pl: Plano, x: number, z: number, h: number) {
	const j = pl.pon('3794b', R, x, z, h);
	pl.conecta('49668', DR, j, 3, 0, 180, `pua@${z},h${h}`);
}

const tor = new Plano('torso');
// Capas trabadas: la del medio cruza las juntas de las otras dos (y la panza tan se envuelve un poco a los lados).
tor.base('3010', R, -2, 1, 13);
tor.pon('3001', R, -2, -1, 13);
tor.pon('3001', R, -2, -3, 13);
tor.pon('3010', TAN, -2, -4, 13);
tor.pon('3001', R, -2, 0, 16);
tor.pon('3001', R, -2, -2, 16);
tor.pon('3001', TAN, -2, -4, 16);
tor.paso();
tor.pon('3010', R, -2, 1, 19);
tor.pon('3001', R, -2, -1, 19);
tor.pon('3001', R, -2, -3, 19);
tor.pon('3010', TAN, -2, -4, 19);
tor.paso();
// pecho, hombros redondeados y lomo
tor.pon('85984', TAN, -2, -4, 22, FRENTE);
tor.pon('85984', TAN, 0, -4, 22, FRENTE);
for (const x of [1, -2]) tor.pon('11477', R, x, -3, 22, FRENTE);
tor.pon('3069b', R, -1, -1, 22);
pua(tor, -1, 0, 22);
tor.pon('3069b', R, -1, 1, 22);
// bisagras de las alas sobre los hombros (el dedo doble mira al frente)
const bisagras: Pieza[] = [];
for (const x of [-2, 1]) {
	tor.pon('35480', R, x, 0, 22, 90);
	bisagras.push(tor.pon('44302a', R, x, 0, 23, 270));
}
tor.paso();
// cuello: sube en escalones hacia adelante; en cada escalón asoma una púa
tor.pon('3003', R, -1, -3, 22);
tor.pon('3003', R, -1, -4, 25);
pua(tor, -1, -2, 25);
tor.paso();
tor.pon('3003', R, -1, -5, 28);
tor.cuelga('3004', TAN, -1, -5, 28); // garganta
pua(tor, -1, -3, 28);
tor.paso();
tor.pon('3003', R, -1, -5, 31);
tor.paso();
montar(tor);
m.raiz.paso();

// ===== Cabeza =====
const cab = new Plano('cabeza');
const hb = 34;
cab.base('3795', R, -1, -9, hb, 90); // mandíbula: abraza los dos studs de fondo del cuello
cab.pon('3022', R, -1, -6, hb + 1);
cab.pon('3022', R, -1, -6, hb + 2);
cab.pon('35480', DR, -1, -7, hb + 1); // fondo de la boca
cab.pon('3020', R, -1, -9, hb + 3, 90); // maxilar
cab.pon('3022', R, -1, -10, hb + 4); // hocico
for (const x of [-1, 0]) cab.cuelga('15070', 'White', x, -10, hb + 4); // colmillos
cab.paso();
cab.pon('3031', R, -2, -8, hb + 4); // cráneo
for (const x of [-2, 1]) {
	cab.cuelga('49668', DR, x, -6, hb + 4, x < 0 ? IZQ : DER); // aletas de las mejillas
	cab.cuelga('49668', DR, x, -5, hb + 4, ATRAS);
}
cab.paso();
cab.pon('85984', R, -1, -10, hb + 5, FRENTE); // nariz
cab.pon('35480', R, -1, -9, hb + 5); // los studs abiertos son las fosas nasales
const ojos: Pieza[] = [];
for (const x of [-2, 1]) ojos.push(cab.pon('87087', R, x, -8, hb + 5));
cab.pon('3004', R, -1, -8, hb + 5);
for (const o of ojos) cab.conecta('6141', 'Yellow', o, 2, 0, 0, 'ojo');
cab.pon('3001', R, -2, -7, hb + 5);
const nuca: Pieza[] = [];
for (const x of [-2, 1]) nuca.push(cab.pon('87087', R, x, -5, hb + 5, 180));
cab.pon('3004', R, -1, -5, hb + 5);
cab.paso();
cab.pon('85984', R, -2, -8, hb + 8, FRENTE); // cejas
cab.pon('85984', R, 0, -8, hb + 8, FRENTE);
cab.pon('15068', R, -2, -7, hb + 8, ATRAS);
cab.pon('15068', R, 0, -7, hb + 8, ATRAS);
cab.pon('54200', R, -2, -5, hb + 8, ATRAS);
cab.pon('54200', R, 1, -5, hb + 8, ATRAS);
pua(cab, -1, -5, hb + 8);
// cuernos: bananas doradas encastradas por la barra en el agujero del stud lateral
for (const [k, n] of nuca.entries()) cab.conecta('33085', PG, n, 1, 0, k ? 300 : 240, 'cuerno');
cab.paso();
montar(cab);
m.raiz.paso();

// ===== Alas: brazo y abanico de dedos que giran sobre un solo stud =====
// Cada dedo es una membrana en cuña con un hueso de tejas sobre su borde recto; el dedo siguiente gira sobre un
// "nudillo" (placa 1 × 1) apilado en el mismo eje, como las varillas de un abanico.
const PHI = 25; // inclinación del brazo desde la vertical, hacia afuera
const DEDOS = [40, 72, 104, 136]; // dirección de cada dedo (grados desde la vertical, hacia afuera)
// `cortes`: después de qué dedos se cierra un paso (la primera ala muestra cada dedo; la segunda los agrupa).
function ala(lado: -1 | 1, A: Pieza, theta: number, cortes: number[]) {
	const w = new Plano(lado < 0 ? 'ala izquierda' : 'ala derecha', true);
	const der = lado > 0;
	const B = w.base('44301a', R, 0, 0, 0);
	// Todo cuelga hacia atrás de la bisagra: cada pieza mete su stud en el anti-stud de la anterior, así las caras
	// con studs (y los huesos) miran al frente.
	const gBrazo = der ? 180 - PHI : 180 + PHI;
	const sep = w.conecta('3024', R, B, 0, 2, gBrazo, 'hombro');
	const brazo = w.conecta('3666', R, sep, 0, 11, gBrazo, 'brazo');
	let piv = w.conecta('3024', R, brazo, 5, 2, gBrazo, 'muneca');
	w.conecta('49668', TAN, brazo, 16, 0, der ? 270 - PHI : 270 + PHI, 'garra del ala');
	w.paso();
	for (const [k, psi] of DEDOS.entries()) {
		const g = der ? 270 - psi : 270 + psi;
		const memb = w.conecta(der ? '3934' : '3933', NAR, piv, 0, der ? 21 : 19, g, `membrana${k}`);
		w.conecta('6636', R, memb, 36, 0, g + 90, `hueso${k}`);
		if (k < DEDOS.length - 1) piv = w.conecta('3024', R, memb, 7, 2, g, `nudillo${k}`);
		if (cortes.includes(k)) w.paso();
	}
	w.paso();
	montarPor(w.sub, B, 5, A, 2, theta);
	m.raiz.paso();
}
const THETA = 70; // las alas se inclinan 20° hacia atrás
ala(-1, bisagras[0], THETA, [0, 1]);
ala(1, bisagras[1], THETA, [1]);

m.guardar();
