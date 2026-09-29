import {Modelo, grilla} from '../taller/src/dsl.ts';

// ---------------------------------------------------------------------------------------------
// Ayudas de grilla: cada pieza de referencia sabe dónde cae su esquina (menor X, menor Z) en la
// grilla del sub-armado y con qué giro está. `pon` elige el stud/anti-stud correcto para que la
// pieza nueva ocupe el rectángulo pedido, así todo se encastra por conector.
// ---------------------------------------------------------------------------------------------
type Sub = ReturnType<Modelo['sub']>;
type Pieza = ReturnType<Sub['poner']>;
type Ref = {p: Pieza; x: number; z: number; g: number; W: number; D: number};

// (i, j) local de una pieza de W×D girada g → desplazamiento dentro de su huella girada.
function aHuella(i: number, j: number, g: number, W: number, D: number): [number, number] {
	if (g === 90) return [D - 1 - j, i];
	if (g === 180) return [W - 1 - i, D - 1 - j];
	if (g === 270) return [j, W - 1 - i];
	return [i, j];
}
function deHuella(di: number, dj: number, g: number, W: number, D: number): [number, number] {
	if (g === 90) return [dj, D - 1 - di];
	if (g === 180) return [W - 1 - di, D - 1 - dj];
	if (g === 270) return [W - 1 - dj, di];
	return [di, dj];
}

// x, z: esquina de la huella; o bien ax, az: celda donde cae el conector `con`.
type Pon = {x?: number; z?: number; ax?: number; az?: number; g?: number; W: number; D: number; con?: [number, number]; nombre?: string};
function pon(sub: Sub, id: string, color: string, ref: Ref, modo: 'sobre' | 'debajo', o: Pon): Ref {
	const g = o.g ?? 0;
	const con = o.con ?? [0, 0];
	const [di, dj] = aHuella(con[0], con[1], g, o.W, o.D);
	const x = o.x ?? o.ax! - di;
	const z = o.z ?? o.az! - dj;
	const gx = x + di - ref.x;
	const gz = z + dj - ref.z;
	const [i, j] = deHuella(gx, gz, ref.g, ref.W, ref.D);
	const p =
		modo === 'sobre'
			? sub.poner(id, color, {sobre: ref.p, stud: [i, j], con, giro: g, nombre: o.nombre})
			: sub.poner(id, color, {debajo: ref.p, antistud: [i, j], con, giro: g, nombre: o.nombre});
	return {p, x, z, g, W: o.W, D: o.D};
}

// Sonda: dónde quedaría una pieza, sin dejarla en el sub-armado.
function sonda(sub: Sub, id: string, color: string, op: Parameters<Sub['poner']>[2]) {
	const p = sub.poner(id, color, op);
	(sub as unknown as {actual: unknown[]}).actual.pop();
	return p.tr;
}
// Matriz de rotación (por filas) → texto "X a Y b Z c" que entiende `rot`.
function rotTexto(r: number[]): string {
	const b = Math.asin(Math.max(-1, Math.min(1, -r[6])));
	const bloqueo = Math.abs(r[6]) > 0.9999; // Y = ±90: X y Z giran sobre el mismo eje
	const a = bloqueo ? 0 : Math.atan2(r[7], r[8]);
	const c = bloqueo ? Math.atan2(-r[1], r[4]) : Math.atan2(r[3], r[0]);
	const g = (x: number) => Math.round(((x * 180) / Math.PI) * 1e4) / 1e4;
	return `X${g(a)} Y${g(b)} Z${g(c)}`;
}

// Colores
const TIERRA = 'Dark_Tan';
const PASTO = 'Green';
const CORTEZA = 'Dark_Brown';
const BANDA = 'Reddish_Brown';
const ROSA = 'Bright_Pink';
const BLANCO = 'White';

const m = new Modelo('cerezo');

// =============================================================================================
// BASE: jardín de 12×12 con borde de tierra, pasto y pétalos caídos. Grilla x, z ∈ [0, 12);
// N = −Z es el frente (el lado que mira a la cámara).
// =============================================================================================
const base = m.sub('base');
// El sub-armado de la base arranca por la 6×6 de tierra del noreste (x 6..12, z 0..6), sin giro.
const ORIGEN_BASE = {x: 9, z: 3};
{
	const s = base;
	// Mitad del frente: dos cuartos de tierra atados por una 2×4 de pasto.
	const ne: Ref = {p: s.poner('6003', TIERRA), x: 6, z: 0, g: 0, W: 6, D: 6};
	const pn = pon(s, '3020', PASTO, ne, 'sobre', {x: 5, z: 1, g: 90, W: 4, D: 2, con: [0, 0]});
	const no = pon(s, '6003', TIERRA, pn, 'debajo', {x: 0, z: 0, g: 270, W: 6, D: 6, con: [3, 5]});
	s.paso();
	// La franja central de pasto ata la mitad de atrás.
	const franja = pon(s, '3832', PASTO, ne, 'sobre', {x: 1, z: 5, W: 10, D: 2, con: [5, 0]});
	const se = pon(s, '6003', TIERRA, franja, 'debajo', {x: 6, z: 6, g: 90, W: 6, D: 6, con: [0, 5]});
	const so = pon(s, '6003', TIERRA, franja, 'debajo', {x: 0, z: 6, g: 180, W: 6, D: 6, con: [0, 5]});
	const ps = pon(s, '3020', PASTO, so, 'sobre', {x: 5, z: 7, g: 90, W: 4, D: 2, con: [0, 1]});
	s.paso();
	// Pasto de esquinas redondas y pétalos caídos: cuartos de círculo y tejas de punta redonda,
	// rosas y blancos, que tienen la forma de un pétalo.
	const pasto = [
		pon(s, '30565', PASTO, ne, 'sobre', {x: 7, z: 1, g: 0, W: 4, D: 4, con: [0, 0]}),
		pon(s, '30565', PASTO, se, 'sobre', {x: 7, z: 7, g: 90, W: 4, D: 4, con: [0, 0]}),
		pon(s, '30565', PASTO, so, 'sobre', {x: 1, z: 7, g: 180, W: 4, D: 4, con: [0, 0]}),
		pon(s, '30565', PASTO, no, 'sobre', {x: 1, z: 1, g: 270, W: 4, D: 4, con: [0, 3]}),
	];
	const petalos: [Ref, number, number, string, string, number][] = [
		[pasto[3], 2, 3, '25269', ROSA, 0],
		[pasto[3], 4, 2, '25269', BLANCO, 90],
		[pn, 6, 2, '24246', ROSA, 0],
		[pasto[0], 8, 2, '25269', ROSA, 180],
		[pasto[0], 9, 4, '25269', ROSA, 270],
		[franja, 10, 5, '24246', BLANCO, 0],
		[pasto[1], 8, 9, '25269', BLANCO, 0],
		[pasto[2], 2, 8, '25269', ROSA, 90],
		[ps, 5, 10, '25269', ROSA, 180],
		[franja, 1, 6, '25269', BLANCO, 270],
	];
	for (const [ref, x, z, id, color, g] of petalos) pon(s, id, color, ref, 'sobre', {x, z, g, W: 1, D: 1});
	s.paso();
}

// Giro para que una pendiente curva 11477 (sin giro baja hacia −Z) baje hacia cada lado.
const MIRA = {N: 0, E: 90, S: 180, O: 270};

// =============================================================================================
// TRONCO: montículo con raíces, fuste corto con bandas, horqueta, líder y tres ramas en vaso.
// Grilla igual que la base (el montículo 6×6 ocupa x, z 3..9). El sub-armado se coloca girado
// 180°: la bisagra solo se inclina sin chocar hacia su lado libre y, con el giro, la rama que en
// esta grilla sale hacia −Z queda atrás; "izq" y "der" están nombradas ya como se ven de frente.
// =============================================================================================
const tronco = m.sub('tronco');
type Rama = {nombre: string; tope: Pieza; con: [number, number]; tono: number};
const ramas: Rama[] = [];
{
	const s = tronco;
	const monte: Ref = {p: s.poner('11213', PASTO), x: 3, z: 3, g: 0, W: 6, D: 6};
	let t = pon(s, '3003', CORTEZA, monte, 'sobre', {x: 5, z: 5, W: 2, D: 2});
	s.paso();
	// Raíces en molinete: cada una nace alta contra el tronco y baja hacia el pasto.
	pon(s, '11477', CORTEZA, monte, 'sobre', {x: 6, z: 3, g: MIRA.N, W: 1, D: 2});
	pon(s, '11477', CORTEZA, monte, 'sobre', {x: 7, z: 6, g: MIRA.E, W: 1, D: 2});
	pon(s, '11477', CORTEZA, monte, 'sobre', {x: 5, z: 7, g: MIRA.S, W: 1, D: 2});
	pon(s, '11477', CORTEZA, monte, 'sobre', {x: 3, z: 5, g: MIRA.O, W: 1, D: 2});
	s.paso();
	// Fuste corto con bandas horizontales (las lenticelas del cerezo) y la horqueta redonda.
	t = pon(s, '3022', BANDA, t, 'sobre', {x: 5, z: 5, W: 2, D: 2});
	t = pon(s, '3003', CORTEZA, t, 'sobre', {x: 5, z: 5, W: 2, D: 2});
	s.paso();
	const copa = pon(s, '60474', CORTEZA, t, 'sobre', {x: 4, z: 4, W: 4, D: 4, con: [1, 1]});
	s.paso();
	// Líder central: sostiene el cúmulo de la cima. Arriba pasa a 1×2: el tronco se afina.
	// [pieza, color, x, W, D, giro]: la 1×2 va a lo largo de Z para verse fina de frente.
	const lider: [string, string, number, number, number, number][][] = [
		[['3003', CORTEZA, 5, 2, 2, 0], ['3003', CORTEZA, 5, 2, 2, 0], ['3022', BANDA, 5, 2, 2, 0]],
		[['3004', CORTEZA, 6, 2, 1, 90], ['3004', CORTEZA, 6, 2, 1, 90], ['3004', CORTEZA, 6, 2, 1, 90], ['3004', CORTEZA, 6, 2, 1, 90]],
	];
	let l = copa;
	for (const tramo of lider) {
		for (const [id, color, x, W, D, g] of tramo) l = pon(s, id, color, l, 'sobre', {x, z: 5, W, D, g});
		s.paso();
	}
	ramas.push({nombre: 'cima', tope: l.p, con: [0, 3], tono: 0});
	// Ramas con bisagra doble: la primera inclina la rama, la segunda vuelve a nivelar la punta
	// para que la nube quede derecha. `detalle` parte la primera rama en dos pasos para el video.
	const rama = (nombre: string, bx: number, bz: number, g: number, angulo: number, largo: number, con: [number, number], tono: number, detalle = false, cerrar = true) => {
		const b = pon(s, '3937', BANDA, copa, 'sobre', {x: bx, z: bz, g, W: 2, D: 1, nombre: `${nombre}-bisagra`});
		const top = s.poner('3938', BANDA, {conector: {de: b.p, n: 2}, propio: 0, giro: angulo, nombre: `${nombre}-tapa`});
		if (detalle) s.paso();
		let r = s.poner('3004', CORTEZA, {sobre: top, stud: [0, 0], giro: g, nombre: `${nombre}-1`});
		for (let k = 1; k < largo; k++) r = s.poner('3004', CORTEZA, {sobre: r, stud: [0, 0], giro: g, nombre: `${nombre}-${k + 1}`});
		const b2 = s.poner('3937', BANDA, {sobre: r, stud: [0, 0], giro: g, nombre: `${nombre}-bisagra2`});
		const top2 = s.poner('3938', BANDA, {conector: {de: b2, n: 2}, propio: 0, giro: 0, nombre: `${nombre}-tapa2`});
		// Punta de extremos redondos: separa la nube del nudillo de la bisagra.
		const punta = s.poner('35480', BANDA, {sobre: top2, stud: [0, 0], giro: g, nombre: `${nombre}-punta`});
		ramas.push({nombre, tope: punta, con, tono});
		if (cerrar) s.paso();
	};
	// La izquierda se inclina más y queda más baja y afuera que la derecha: el árbol no es simétrico.
	rama('izq', 7, 5, 90, 55, 2, [1, 1], 0, true);
	// Derecha y atrás van juntas: es el mismo grupo repetido (y la de atrás no se ve de frente).
	rama('der', 4, 5, 270, 35, 2, [4, 1], 1, false, false);
	rama('atras', 5, 4, 0, 35, 2, [2, 4], 2);
}

// =============================================================================================
// NUBES de flor. Cada nube: placa redonda 6×6 rosa oscuro (la sombra de abajo) y cuatro cuartos
// de cúpula 3×3×2 que forman media esfera; los studs de las cúpulas quedan juntos en el centro y
// reciben flores de cinco pétalos. Una de las nubes es blanca (Yoshino: flor entre rosa y blanco).
// =============================================================================================
const CUARTOS: [number, number, number][] = [[3, 0, 0], [3, 3, 90], [0, 3, 180], [0, 0, 270]];
const FLOR = [BLANCO, 'Dark_Pink', BLANCO, ROSA];
// Racimo colgante: la flor del cerezo sale en ramilletes de pedúnculos largos. Un clip bajo el
// borde de la nube sostiene una ramita de seis tallos (19119) con una flor en cada uno. En la
// grilla de la nube (girada 180° como el tronco) el frente es +Z, "afuera" es +X para la izquierda
// y −Z para la de atrás; el giro apunta el clip hacia ese lado. La rama baja de la izquierda lo
// cuelga hacia afuera (se recorta contra el cielo); la derecha, adelante, para no ensanchar más.
type Racimo = {ax: number; az: number; g: number};
const RACIMO: Record<string, Racimo> = {
	izq: {ax: 5, az: 2, g: 90},
	der: {ax: 3, az: 5, g: 180},
	atras: {ax: 3, az: 0, g: 0},
};
const racimo = (s: Sub, placa: Ref, rc: Racimo) => {
	const clip = pon(s, '61252', CORTEZA, placa, 'debajo', {ax: rc.ax, az: rc.az, g: rc.g, W: 1, D: 1});
	const ramita = s.poner('19119', CORTEZA, {conector: {de: clip.p, n: 1}, propio: 0});
	for (let n = 1; n <= 6; n++) s.poner('4367', n % 2 ? BLANCO : 'Dark_Pink', {conector: {de: ramita, n}, propio: 1});
};
const nube = (nombre: string, tono: number, detalle: boolean) => {
	const s = m.sub(`nube-${nombre}`);
	const color = tono === 1 ? BLANCO : ROSA;
	const flores = tono === 1 ? [ROSA, 'Dark_Pink'] : FLOR;
	const placa: Ref = {p: s.poner('11213', 'Dark_Pink'), x: 0, z: 0, g: 0, W: 6, D: 6};
	CUARTOS.forEach(([x, z, g], k) => {
		const c = pon(s, '88293', color, placa, 'sobre', {x, z, g, W: 3, D: 3, con: k === 3 ? [0, 2] : [0, 0]});
		s.poner('24866', flores[(k + tono) % flores.length], {sobre: c.p, stud: [0, 0]});
		if (detalle && k === 1) s.paso();
	});
	s.paso();
	racimo(s, placa, RACIMO[nombre]);
	s.paso();
	return s;
};

// Cúmulo de la cima (8×8): base de cuatro esquinas redondas, relleno en cruz, cuatro lóbulos bajos
// (entre lóbulo y lóbulo queda una muesca) y una media esfera más alta corrida un stud.
const cumulo = (nombre: string) => {
	const s = m.sub(`nube-${nombre}`);
	// La primera 4×4 (sin giro) es la del noreste, la que encastra en el líder.
	const ne: Ref = {p: s.poner('30565', 'Dark_Pink'), x: 4, z: 0, g: 0, W: 4, D: 4};
	const centro0 = pon(s, '3003', ROSA, ne, 'sobre', {x: 3, z: 3, W: 2, D: 2, con: [1, 0]});
	const cuad: Ref[] = [
		pon(s, '30565', 'Dark_Pink', centro0, 'debajo', {x: 0, z: 0, g: 270, W: 4, D: 4, con: [0, 3]}),
		ne,
		pon(s, '30565', 'Dark_Pink', centro0, 'debajo', {x: 4, z: 4, g: 90, W: 4, D: 4, con: [0, 3]}),
		pon(s, '30565', 'Dark_Pink', centro0, 'debajo', {x: 0, z: 4, g: 180, W: 4, D: 4, con: [0, 3]}),
	];
	s.paso();
	// Relleno en cruz: centro de dos ladrillos y brazos que no llegan al borde; arriba de cada brazo
	// una pendiente mira hacia afuera y suaviza la muesca entre lóbulos.
	const centro = pon(s, '3003', ROSA, centro0, 'sobre', {x: 3, z: 3, W: 2, D: 2});
	const brazos: [number, number, number, number][] = [[3, 1, 0, 0], [5, 3, 1, 90], [3, 5, 3, 180], [1, 3, 0, 270]];
	for (const [x, z, q, g] of brazos) {
		const b = pon(s, '3003', ROSA, cuad[q], 'sobre', {x, z, W: 2, D: 2});
		pon(s, '3039', ROSA, b, 'sobre', {x, z, g, W: 2, D: 2});
	}
	s.paso();
	const lob: [number, number, number, number][] = [[5, 0, 0, 1], [5, 5, 90, 2], [0, 5, 180, 3], [0, 0, 270, 0]];
	lob.forEach(([x, z, g, q], k) => {
		pon(s, '88293', ROSA, cuad[q], 'sobre', {x, z, g, W: 3, D: 3, con: [0, 2]});
		if (k === 1) s.paso();
	});
	// Un racimo cuelga del lóbulo de adelante a la izquierda (visto de frente).
	racimo(s, cuad[2], {ax: 4, az: 7, g: 180});
	s.paso();
	// Media esfera alta, corrida un stud: la copa no queda como una torta de pisos.
	const [ax, az] = [0, 1];
	const alta = pon(s, '11213', 'Dark_Pink', centro, 'sobre', {x: ax, z: az, W: 6, D: 6, con: [3 - ax, 3 - az]});
	CUARTOS.forEach(([x, z, g], k) => {
		const c = pon(s, '88293', ROSA, alta, 'sobre', {x: x + ax, z: z + az, g, W: 3, D: 3, con: k === 3 ? [0, 2] : [0, 0]});
		s.poner('24866', FLOR[k % FLOR.length], {sobre: c.p, stud: [0, 0]});
		if (k === 1) s.paso();
	});
	s.paso();
	return s;
};

// =============================================================================================
// MODELO: base, árbol desnudo de invierno y, al final, la floración nube por nube.
// =============================================================================================
m.raiz.colocar(base);
m.raiz.paso();
// El montículo del tronco (centro en x 6, z 6) va sobre el pasto, dos placas sobre la tierra.
const alturaMonte = grilla(6 - ORIGEN_BASE.x, 2, 6 - ORIGEN_BASE.z);
const GIRO_TRONCO = [-1, 0, 0, 0, 1, 0, 0, 0, -1]; // Y180, por filas
m.raiz.colocar(tronco, {en: alturaMonte, rot: 'Y180'});
m.raiz.paso();
// Nubes laterales primero; el cúmulo de la cima, la revelación, al final.
const orden = ['izq', 'der', 'atras', 'cima'];
for (const r of orden.map((n) => ramas.find((x) => x.nombre === n)!)) {
	const s = r.nombre === 'cima' ? cumulo(r.nombre) : nube(r.nombre, r.tono, r.nombre === 'izq');
	// La primera placa de la nube encastra en los studs del tope de su rama.
	const tr =
		r.nombre === 'cima'
			? sonda(tronco, '30565', 'Dark_Pink', {sobre: r.tope, stud: [0, 0], con: r.con})
			: sonda(tronco, '11213', 'Dark_Pink', {sobre: r.tope, stud: [0, 0], con: r.con});
	// De la grilla del tronco a la del modelo: girar 180° y subir al montículo.
	const G = GIRO_TRONCO;
	const [x, y, z] = tr.t;
	const en = [G[0] * x + G[1] * y + G[2] * z, G[3] * x + G[4] * y + G[5] * z, G[6] * x + G[7] * y + G[8] * z].map((v, k) => v + alturaMonte[k]) as [number, number, number];
	const rw = [0, 1, 2].flatMap((f) => [0, 1, 2].map((c) => G[3 * f] * tr.r[c] + G[3 * f + 1] * tr.r[3 + c] + G[3 * f + 2] * tr.r[6 + c]));
	m.raiz.colocar(s, {en, rot: rotTexto(rw)});
	m.raiz.paso();
}

m.guardar();
