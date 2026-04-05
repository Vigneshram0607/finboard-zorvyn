import { Directive, ElementRef, Input, OnChanges, SimpleChanges } from '@angular/core';

@Directive({ selector: '[countUp]' })
export class CountUpDirective implements OnChanges {
  @Input('countUp') target = 0;
  @Input() duration = 1200;
  @Input() prefix   = '';
  @Input() suffix   = '';
  @Input() decimals = 0;

  private animId?: number;

  constructor(private el: ElementRef<HTMLElement>) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['target']) this.animate(0, this.target);
  }

  private animate(from: number, to: number): void {
    if (this.animId) cancelAnimationFrame(this.animId);

    const start = performance.now();
    const step  = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / this.duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3); // ease-out-cubic
      const current = from + (to - from) * ease;

      this.el.nativeElement.textContent =
        `${this.prefix}${this.format(current)}${this.suffix}`;

      if (progress < 1) this.animId = requestAnimationFrame(step);
    };
    this.animId = requestAnimationFrame(step);
  }

  private format(n: number): string {
    return n.toLocaleString('en-IN', {
      minimumFractionDigits: this.decimals,
      maximumFractionDigits: this.decimals,
    });
  }
}
