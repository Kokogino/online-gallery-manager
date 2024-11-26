import { booleanAttribute, Component, input } from '@angular/core';
import { MatAnchor } from '@angular/material/button';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'ogm-nav-item',
  imports: [RouterLink, RouterLinkActive, MatIcon, MatAnchor],
  templateUrl: './nav-item.component.html',
  styleUrl: './nav-item.component.scss',
})
export class NavItemComponent {
  readonly path = input.required<string>();

  readonly text = input.required<string>();

  readonly icon = input.required<string>();

  readonly exactMatch = input<boolean, unknown>(false, { transform: booleanAttribute });
}
