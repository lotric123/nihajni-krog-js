// app.js - uporablja Inducalc.js, integracija originalnih formul
import Inducalc from './Inducalc.js';

const inducalc = new Inducalc();
const resonanca = new Inducalc.Resonanca();

function LunitToFactor(u){
  switch(u){ case 'uH': return 1e-6; case 'mH': return 1e-3; case 'H': return 1; } return 1;
}
function CunitToFactor(u){
  switch(u){ case 'pF': return 1e-12; case 'uF': return 1e-6; case 'mF': return 1e-3; case 'F': return 1; } return 1;
}
function FunitToFactor(u){
  switch(u){ case 'Hz': return 1; case 'kHz': return 1e3; case 'MHz': return 1e6; } return 1;
}
function toMeters(value, unit){
  if (unit==='mm') return value*1e-3;
  if (unit==='cm') return value*1e-2;
  return value;
}

const Lval = document.getElementById('Lval');
const Lunit = document.getElementById('Lunit');
const Cval = document.getElementById('Cval');
const Cunit = document.getElementById('Cunit');
const Fval = document.getElementById('Fval');
const Funit = document.getElementById('Funit');

document.getElementById('calcL').addEventListener('click', ()=>{
  const f = parseFloat(Fval.value) * FunitToFactor(Funit.value);
  const C = parseFloat(Cval.value) * CunitToFactor(Cunit.value);
  const Lsi = resonanca.induktivnost(f,C);
  const out = Lsi / LunitToFactor(Lunit.value);
  Lval.value = isFinite(out) ? out : '';
});
document.getElementById('calcC').addEventListener('click', ()=>{
  const f = parseFloat(Fval.value) * FunitToFactor(Funit.value);
  const L = parseFloat(Lval.value) * LunitToFactor(Lunit.value);
  const Csi = resonanca.kapacitivnost(f,L);
  const out = Csi / CunitToFactor(Cunit.value);
  Cval.value = isFinite(out) ? out : '';
});
document.getElementById('calcF').addEventListener('click', ()=>{
  const L = parseFloat(Lval.value) * LunitToFactor(Lunit.value);
  const C = parseFloat(Cval.value) * CunitToFactor(Cunit.value);
  const fsi = resonanca.frekvenca(C,L);
  const out = fsi / FunitToFactor(Funit.value);
  Fval.value = isFinite(out) ? out : '';
});

const canvas = document.getElementById('graph');
const ctx = canvas.getContext('2d');
const gx = document.getElementById('gx');
const gy = document.getElementById('gy');

document.getElementById('drawGraph').addEventListener('click', ()=>{
  const xaxis = document.getElementById('xaxis').value;
  const yaxis = document.getElementById('yaxis').value;
  const N = 300;
  const xs = new Array(N);
  const ys = new Array(N);

  let Lcur = parseFloat(Lval.value) * LunitToFactor(Lunit.value) || 1e-6;
  let Ccur = parseFloat(Cval.value) * CunitToFactor(Cunit.value) || 1e-12;
  let Fcur = parseFloat(Fval.value) * FunitToFactor(Funit.value) || 1e3;

  ctx.fillStyle = '#fff';
  ctx.fillRect(0,0,canvas.width,canvas.height);

  for (let i=0;i<N;i++){
    let xsi = 0, ysi = 0;
    if (xaxis==='L') {
      xsi = resonanca.Map(i, 0, N-1, 0.05, Lcur*2);
    } else if (xaxis==='C') {
      xsi = resonanca.Map(i, 0, N-1, 0.05, Ccur*2);
    } else {
      xsi = resonanca.Map(i, 0, N-1, 0.05, Fcur*2);
    }

    if (yaxis === 'F') {
      let Ls = (xaxis==='L') ? xsi : Lcur;
      let Cs = (xaxis==='C') ? xsi : Ccur;
      ysi = resonanca.frekvenca(Cs, Ls);
    } else if (yaxis === 'L') {
      if (xaxis === 'F') ysi = resonanca.induktivnost(xsi, Ccur);
      else if (xaxis === 'C') ysi = resonanca.induktivnost(Fcur, xsi);
      else ysi = xsi;
    } else if (yaxis === 'C') {
      if (xaxis === 'F') ysi = resonanca.kapacitivnost(xsi, Lcur);
      else if (xaxis === 'L') ysi = resonanca.kapacitivnost(Fcur, xsi);
      else ysi = xsi;
    }

    xs[i] = xsi;
    ys[i] = isFinite(ysi) ? ysi : 0;
  }

  const maxy = Math.max(...ys);
  const miny = Math.min(...ys);
  ctx.fillStyle = '#000';
  for (let i=0;i<N;i++){
    const cx = i;
    const cy = Math.round(resonanca.Map(ys[i], maxy, miny, 0, canvas.height-1));
    const py = Math.min(Math.max(cy,0), canvas.height-1);
    ctx.fillRect(cx, py, 1, 1);
  }
  canvas._graph = {xs, ys};
});

canvas.addEventListener('mousemove', (ev)=>{
  const rect = canvas.getBoundingClientRect();
  const x = Math.floor(ev.clientX - rect.left);
  if (!canvas._graph) return;
  const {xs, ys} = canvas._graph;
  if (x < 0 || x >= xs.length) return;
  gx.textContent = Number(xs[x]).toFixed(6);
  gy.textContent = Number(ys[x]).toFixed(6);
});

document.getElementById('mv_calc').addEventListener('click', ()=>{
  const l = parseFloat(document.getElementById('mv_l').value) || 0;
  const lu = document.getElementById('mv_l_u').value;
  const D = parseFloat(document.getElementById('mv_d').value) || 0;
  const Du = document.getElementById('mv_d_u').value;
  const n = parseInt(document.getElementById('mv_n').value) || 1;
  const LoutUnit = document.getElementById('mv_result_u').value;

  const lm = toMeters(l,lu);
  const Dm = toMeters(D,Du);
  const a = Dm/2;
  const b = lm;

  const L = inducalc.IndCalc(a,b,n);
  const out = L / LunitToFactor(LoutUnit);
  document.getElementById('mv_result').value = isFinite(out) ? Number(out.toFixed(6)) : '';
});

document.getElementById('sv_calc').addEventListener('click', ()=>{
  const D = parseFloat(document.getElementById('sv_D').value) || 0;
  const Du = document.getElementById('sv_D_u').value;
  const wire = parseFloat(document.getElementById('sv_wire').value) || 0;
  const wu = document.getElementById('sv_wire_u').value;
  const outU = document.getElementById('sv_result_u').value;

  const Dm = toMeters(D,Du);
  const wm = toMeters(wire,wu);
  const p = Math.PI * Dm;
  const L = inducalc.RegLoopInd(p, wm, 0);
  const out = L / LunitToFactor(outU);
  document.getElementById('sv_result').value = isFinite(out) ? Number(out.toFixed(6)) : '';
});

document.getElementById('rv_calc').addEventListener('click', ()=>{
  const a = parseFloat(document.getElementById('rv_a').value) || 0;
  const au = document.getElementById('rv_a_u').value;
  const b = parseFloat(document.getElementById('rv_b').value) || 0;
  const bu = document.getElementById('rv_b_u').value;
  const w = parseFloat(document.getElementById('rv_w').value) || 0;
  const wu = document.getElementById('rv_w_u').value;
  const h = parseFloat(document.getElementById('rv_h').value) || 0;
  const hu = document.getElementById('rv_h_u').value;
  const outU = document.getElementById('rv_result_u').value;

  const am = toMeters(a,au);
  const bm = toMeters(b,bu);
  const wm = toMeters(w,wu);
  const hm = toMeters(h,hu);

  const L = inducalc.RectLoopIndRectWire(am, bm, wm, hm);
  const out = L / LunitToFactor(outU);
  document.getElementById('rv_result').value = isFinite(out) ? Number(out.toFixed(6)) : '';
});

document.getElementById('skin_calc').addEventListener('click', ()=>{
  const f = parseFloat(document.getElementById('skin_f').value) || 0;
  const fu = document.getElementById('skin_f_u').value;
  const matIdx = parseInt(document.getElementById('skin_material').value, 10);

  const fm = f * FunitToFactor(fu);
  const delta = inducalc.skinDepht(fm, matIdx);
  document.getElementById('skin_d63').value = isFinite(delta) ? delta.toExponential(6) : '';
  document.getElementById('skin_d98').value = isFinite(delta) ? (4*delta).toExponential(6) : '';
});

document.querySelectorAll('.tab-button').forEach(b=>{
  b.addEventListener('click', ()=>{
    document.querySelectorAll('.tab-button').forEach(x=>x.classList.remove('active'));
    b.classList.add('active');
    const target = b.getAttribute('data-tab');
    document.querySelectorAll('.tab').forEach(t=>{
      t.style.display = (t.id === target) ? 'block' : 'none';
    });
  });
});
