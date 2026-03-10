/* * Inducalc.js — JavaScript prevod razreda Inducalc (iz C# iz nihajni_krog)
 * Original C# avtor: Claudio Girardi (2001-2008)
 * Licence: GNU GPL (kot v izvorni kodi)
 *
 * Prevedel: ChatGPT (JS ES module)
 * Dopolnjeno za polno podporo izračunov z jedrom.
 */

const Mu0 = 4 * Math.PI * 1e-7;

// Definicije materialov za realni izračun
export const CoreMaterial = {
  Air: 'Air',
  Steel: 'Steel',
  StainlessSteel: 'StainlessSteel',
  Copper: 'Copper',
  Aluminum: 'Aluminum',
  Brass: 'Brass'
};

export default class Inducalc {
  f1(x) {
    return (1 + x * (0.383901 + 0.017108 * x)) / (1 + 0.258952 * x);
  }

  f2(x) {
    return x * (0.093842 + x * (0.002029 - x * 0.000801));
  }

  getMaterialProperties(mat) {
    switch (mat) {
      case CoreMaterial.Steel: return { MuR: 800, Conductivity: 6e6 };
      case CoreMaterial.StainlessSteel: return { MuR: 1.05, Conductivity: 1.4e6 };
      case CoreMaterial.Copper: return { MuR: 0.999, Conductivity: 5.8e7 };
      case CoreMaterial.Aluminum: return { MuR: 1.00002, Conductivity: 3.5e7 };
      case CoreMaterial.Brass: return { MuR: 1.0, Conductivity: 1.6e7 };
      default: return { MuR: 1.0, Conductivity: 0 };
    }
  }

  indCalcReal(coilRadius, coilLength, turns, frequency, rodDiameter, gap, material) {
    const props = this.getMaterialProperties(material);
    const mur = props.MuR;
    const sigma = props.Conductivity;
    const shape_ratio = (2 * coilRadius) / coilLength;

    let Lair = 0;
    if (shape_ratio <= 1) {
      Lair = (Mu0 * turns * turns * Math.PI * coilRadius * coilRadius *
             (this.f1(shape_ratio * shape_ratio) - (4 / (3 * Math.PI)) * shape_ratio)) / coilLength;
    } else {
      Lair = Mu0 * turns * turns * coilRadius *
             ((Math.log(4 * shape_ratio) - 0.5) * this.f1(1 / (shape_ratio * shape_ratio)) +
             this.f2(1 / (shape_ratio * shape_ratio)));
    }

    let L = Lair;

    if (material !== CoreMaterial.Air) {
      const mu = Mu0 * mur;
      const omega = 2 * Math.PI * frequency;
      const delta = Math.sqrt(2 / (omega * mu * sigma)); // vdorna globina
      const rodRadius = rodDiameter / 2.0;

      const coupling = Math.exp(-(gap / coilRadius)) * Math.pow(rodRadius / coilRadius, 2);
      const skinFactor = Math.min(1.0, delta / rodRadius);

      if (mur > 5) { // feromagnetni materiali (npr. jeklo)
        L *= (1 + coupling * mur * skinFactor * 0.2);
      } else { // nemagnetni materiali (npr. baker, aluminij)
        L *= (1 - coupling * (1 - skinFactor) * 0.3);
      }
    }
    return L;
  }

  IndCalc(a, b, n) {
    let u0 = 0.4 * Math.PI * 1e-06;
    let shape_ratio = (2 * a) / b;
    let l = 0;

    if (shape_ratio <= 1) {
      l = (u0 * n * n * Math.PI * a * a * (this.f1(shape_ratio * shape_ratio) - (4 / (3 * Math.PI)) * shape_ratio)) / b;
    } else {
      l = u0 * n * n * a * ((Math.log(4 * shape_ratio) - 0.5) * this.f1(1 / (shape_ratio * shape_ratio)) + this.f2(1 / (shape_ratio * shape_ratio)));
    }
    return l;
  }

  MutIndConc(a1, a2, b1, b2, n1, n2) {
    if (b2 > b1) {
      let b_tmp = b1;
      b1 = b2;
      b2 = b_tmp;
    }
    const g = Math.sqrt(a1 * a1 + (b1 * b1) / 4);

    const M = 1.972441e-06 * a2 * a2 * n1 * n2 * (1 +
      (a1 * a1 * a2 * a2 / (8 * g * g * g * g)) * (3 - (b2 * b2) / (a2 * a2)) +
      (a1 * a1 * a1 * a1 * a2 * a2 * a2 * a2) * (3 - (b1 * b1) / (a1 * a1)) *
      (2.5 - 2.5 * (b2 * b2) / (a2 * a2) + (b2 * b2 * b2 * b2) / (4 * a2 * a2 * a2 * a2)) /
      (32 * g * g * g * g * g * g * g * g)
    ) / g;

    return M;
  }

  MutIndCoax(a1, a2, b1, b2, n1, n2, D) {
    if (b2 > b1) {
      let b_tmp = b1;
      b1 = b2;
      b2 = b_tmp;
    }

    const x1 = D - b1 / 2;
    const x2 = D + b1 / 2;
    const r1 = Math.sqrt(x1 * x1 + a1 * a1);
    const r2 = Math.sqrt(x2 * x2 + a1 * a1);

    const K1 = (2 / (a1 * a1)) * (x2 / r2 - x1 / r1);
    const k1 = b2;

    const K3 = -0.5 * (x1 / (Math.pow(r1, 5)) - x2 / (Math.pow(r2, 5)));
    const k3 = 0.5 * a2 * a2 * b2 * (3 - (b2 * b2) / (a2 * a2));

    const K5 = -0.125 * a1 * a1 * (
      (x1 / Math.pow(r1, 9)) * (3 - 4 * x1 * x1 / (a1 * a1)) -
      (x2 / Math.pow(r2, 9)) * (3 - 4 * x2 * x2 / (a1 * a1))
    );
    const k5 = 0.5 * a2 * a2 * a2 * a2 * b2 * (2.5 - 2.5 * (b2 * b2) / (a2 * a2) + (b2 * b2 * b2 * b2) / (4 * a2 * a2 * a2 * a2));

    const M = 0.9862205e-06 * a1 * a1 * a2 * a2 * n1 * n2 * (K1 * k1 + K3 * k3 + K5 * k5) / (b1 * b2);

    return M;
  }

  CoilQ(a, b, f) {
    const Q = Math.sqrt(f) / (0.069 / a + 0.054 / b);
    return Q;
  }

  RectLoopIndRoundWire(a, b, d) {
    const g = Math.sqrt(a * a + b * b);
    const l = 0.4 * ((a + b) * Math.log((4.0 * a * b) / d) - a * Math.log(a + g) - b * Math.log(b + g)) + 0.4 * (2.0 * g + d - 2.0 * (a + b));
    return l;
  }

  RectLoopIndRectWire(a, b, s1, s2) {
    const g = Math.sqrt(a * a + b * b);
    const l = 0.4 * ((a + b) * Math.log((2.0 * a * b) / (s1 + s2)) - a * Math.log(a + g) - b * Math.log(b + g)) + 0.4 * (2.0 * g + 0.447 * (s1 + s2) - (a + b) / 2.0);
    return l;
  }

  RegLoopInd(p, d, idx) {
    let theta;
    switch (idx) {
      case 0:
        theta = 2.451; // circle
        break;
      case 1:
        theta = 2.561; // regular octagon
        break;
      case 2:
        theta = 2.636; // regular hexagon
        break;
      case 3:
        theta = 2.712; // regular pentagon
        break;
      case 4:
        theta = 2.853; // square
        break;
      case 5:
        theta = 3.197; // equilateral triangle
        break;
      case 6:
        theta = 3.332; // isosceles right-angled triangle
        break;
      default:
        theta = 100; // error
        break;
    }

    const l = 2.0e-07 * p * (Math.log((4.0 * p) / d) - theta);
    return l;
  }

  toPrec(x) {
    return 3 - Math.log(x) / 2.302585092994046;
  }

  skinDepht(frekvenca, material) {
    if (frekvenca <= 0) return 0;

    let s_d;
    let r;
    let mi;
    const mi_0 = Mu0;

    switch (material) {
      case 0:
        r = 1e-8; mi = mi_0; break;
      case 1:
        r = 1.59e-8; mi = 0.99998 * mi_0; break;
      case 2:
        r = 1.68e-8; mi = 1.256629e-6; break;
      case 3:
        r = 1.72e-8; mi = 1.256629e-6; break;
      case 4:
        r = 2.44e-8; mi = 1.256e-6; break;
      case 5:
        r = 2.82e-8; mi = 1.256665e-6; break;
      case 6:
        r = 5.6e-8; mi = 6.8e-5; break;
      case 7:
        r = 9.71e-8; mi = 6.3e-3; break;
      case 8:
        r = 1.43e-7; mi = 1.26e-4; break;
      case 9:
        r = 2.2e-7; mi = 0.999983 * mi_0; break;
      case 10:
        r = 4.2e-7; mi = 1.0001 * mi_0; break;
      case 11:
        r = 6.9e-7; mi = 9.42e-4; break;
      case 12:
        r = 5e-6; mi = mi_0; break;
      case 13:
        r = 12.5e5; mi = mi_0 * 130; break;
      case 14:
        r = 0.5e5; mi = mi_0 * 55; break;
      case 15:
        r = 15e5; mi = mi_0 * 18; break;
      default:
        return 0;
    }

    s_d = Math.sqrt((2 * r) / (2 * Math.PI * frekvenca * mi));
    return s_d;
  }

  static Resonanca = class {
    induktivnost(f, c) { return 1 / (4 * Math.PI * Math.PI * f * f * c); }
    kapacitivnost(f, l) { return 1 / (4 * Math.PI * Math.PI * f * f * l); }
    frekvenca(c, l) { return 1 / (2 * Math.PI * Math.sqrt(c * l)); }
    Map(value, fromSource, toSource, fromTarget, toTarget) {
      if (Math.abs(toSource - fromSource) < Number.EPSILON) return fromTarget;
      return ((value - fromSource) / (toSource - fromSource)) * (toTarget - fromTarget) + fromTarget;
    }
  };
}
