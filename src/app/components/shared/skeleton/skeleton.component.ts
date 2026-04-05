import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-skeleton',
  template: `
    <div class="skeleton" [style.width]="width" [style.height]="height" [class.round]="round"></div>
  `,
  styles: [`
    .skeleton {
      background: linear-gradient(90deg,
        var(--bg-elevated) 25%,
        var(--bg-hover) 50%,
        var(--bg-elevated) 75%
      );
      background-size: 400px 100%;
      animation: shimmer 1.4s infinite linear;
      border-radius: var(--radius-sm);

      &.round { border-radius: 50%; }
    }

    @keyframes shimmer {
      0%   { background-position: -400px 0; }
      100% { background-position:  400px 0; }
    }
  `]
})
export class SkeletonComponent {
  @Input() width  = '100%';
  @Input() height = '16px';
  @Input() round  = false;
}
