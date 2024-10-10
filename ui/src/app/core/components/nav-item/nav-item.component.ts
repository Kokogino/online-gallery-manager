import { booleanAttribute, Component, Input } from '@angular/core';
import { MatAnchor } from '@angular/material/button';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'ogm-nav-item',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, MatIcon, MatAnchor],
  templateUrl: './nav-item.component.html',
  styleUrl: './nav-item.component.scss',
})
export class NavItemComponent {
  @Input({ required: true })
  path: string;

  @Input({ required: true })
  text: string;

  @Input({ required: true })
  icon: string;

  @Input({ transform: booleanAttribute })
  exactMatch: boolean;
}
