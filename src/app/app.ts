import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

type StickerPoolItem = {
  src: string;
  alt: string;
};

type CollageImage = {
  src: string;
  alt: string;
  x: number;   // left px
  y: number;   // top px
  r: number;   // rotate deg
  o: number;   // opacity
  w: number;   // width px
};

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app.html',
  styleUrls: ['./app.css'],
})
export class AppComponent {
  // (obriši kasnije)
  debugMarker = 'APP.TS ACTIVE ✅ ' + Math.random();

  year = new Date().getFullYear();

  age = 33;
  dateText = 'Subota, 28. februar';
  timeText = '19:00';
  locationText = 'Neka lokacija (upiši)';
  rsvpByText = 'četvrtak';

  whatsappNumber = '0000000000';
  email = 'neko@email.com';

  // tvoji stikeri
  private stickerPool: StickerPoolItem[] = [
    { src: 'assets/collage/agenti.png', alt: 'agenti' },
    { src: 'assets/collage/alfa.png', alt: 'alfa' },
    { src: 'assets/collage/awp.png', alt: 'awp' },
    { src: 'assets/collage/bb.png', alt: 'bb' },
    { src: 'assets/collage/cs2.png', alt: 'cs2' },
    { src: 'assets/collage/rnr.png', alt: 'rnr' },
    { src: 'assets/collage/skate.png', alt: 'skate' },
    { src: 'assets/collage/moto1.png', alt: 'moto1' },
    { src: 'assets/collage/kugl.png', alt: 'kugl' },
    { src: 'assets/collage/hd.png', alt: 'hd' },
    { src: 'assets/collage/aw.png', alt: 'aw' },
    { src: 'assets/collage/barb.png', alt: 'barb' },
    { src: 'assets/collage/bus.png', alt: 'bus' },
  ];

  // honeycomb grid items
  collage: CollageImage[] = this.buildHoneycomb();

  get whatsappLink(): string {
    const text = encodeURIComponent(`Dolazim na ${this.age}. rođendan!`);
    return `https://wa.me/${this.whatsappNumber}?text=${text}`;
  }

  get mailLink(): string {
    const subject = encodeURIComponent(`RSVP ${this.age}`);
    const body = encodeURIComponent('Dolazim!');
    return `mailto:${this.email}?subject=${subject}&body=${body}`;
  }

  // Ako želiš dugme da “osvježi” raspored
  regenerateCollage(): void {
    this.collage = this.buildHoneycomb();
  }

  // ----------------------------
  // Honeycomb / brick-offset layout
  // ----------------------------
  private buildHoneycomb(): CollageImage[] {
    const vw = Math.max(window.innerWidth, 360);
    const vh = Math.max(window.innerHeight, 640);

    // “2 cm” na ekranu realno varira, ali ovo daje lep razmak
    // -> slobodno mijenjaj
    const gap = vw < 700 ? 18 : 26;

    // širina stikera (varijacija po ćeliji)
    const baseW = vw < 700 ? 92 : 112;
    const wJitter = vw < 700 ? 18 : 26;

    // ćelije (razmak redova/kolona)
    const cellW = baseW + wJitter + gap; // horizontalni korak
    const cellH = Math.round((baseW * 0.75) + gap); // vertikalni korak

    // pomjeraj svakog drugog reda (honeycomb)
    const rowOffset = Math.round(cellW * 0.5);

    // centralna “prazna” zona (gdje je kartica + fokus)
    // možeš pojačati/smanjiti
    const safeW = vw < 700 ? vw * 0.78 : vw * 0.62;
    const safeH = vw < 700 ? vh * 0.48 : vh * 0.56;

    const safeX1 = (vw - safeW) / 2;
    const safeX2 = safeX1 + safeW;
    const safeY1 = (vh - safeH) / 2;
    const safeY2 = safeY1 + safeH;

    // koliko redova/kolona da pokrije cijeli ekran
    const cols = Math.ceil((vw + cellW) / cellW);
    const rows = Math.ceil((vh + cellH) / cellH);

    // promiješaj pool da ne ponavlja uvijek isti redoslijed
    const pool = [...this.stickerPool].sort(() => Math.random() - 0.5);
    let poolIdx = 0;

    const out: CollageImage[] = [];

    for (let r = 0; r < rows; r++) {
      const y = r * cellH;

      const offsetX = (r % 2 === 0) ? 0 : rowOffset;

      for (let c = 0; c < cols; c++) {
        const x = c * cellW + offsetX;

        // preskoči ako je van ekrana (malo tolerancije)
        if (x < -cellW || x > vw + cellW || y < -cellH || y > vh + cellH) continue;

        // “centar” stickera, da provjerimo safe zonu
        const approxW = baseW;
        const approxH = Math.round(baseW * 0.7);

        const cx = x + approxW / 2;
        const cy = y + approxH / 2;

        // ako upada u centralnu zonu -> preskoči (prazno)
        if (cx >= safeX1 && cx <= safeX2 && cy >= safeY1 && cy <= safeY2) {
          continue;
        }

        const pick = pool[poolIdx % pool.length];
        poolIdx++;

        // varijacija veličine + mala rotacija
        const w = this.clamp(
          baseW + this.randInt(-wJitter, wJitter),
          vw < 700 ? 78 : 90,
          vw < 700 ? 140 : 170
        );

        // malo “ručno” pomjeri unutar ćelije da izgleda prirodnije
        const jitterX = this.randInt(-8, 8);
        const jitterY = this.randInt(-6, 6);

        out.push({
          src: pick.src,
          alt: pick.alt,
          x: Math.round(x + jitterX),
          y: Math.round(y + jitterY),
          r: this.randInt(-10, 10),
          o: this.randFloat(0.85, 1.0),
          w,
        });
      }
    }

    return out;
  }

  // ----------------------------
  // utils
  // ----------------------------
  private randInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  private randFloat(min: number, max: number): number {
    return +(min + Math.random() * (max - min)).toFixed(2);
  }

  private clamp(v: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, v));
  }
}