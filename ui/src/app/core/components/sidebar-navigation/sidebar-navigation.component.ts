import { Component, Input } from '@angular/core';
import { MatListItem, MatNavList } from '@angular/material/list';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { PAGES } from '@app/core/model/page';
import { MatSidenav } from '@angular/material/sidenav';

@Component({
  selector: 'ogm-sidebar-navigation',
  standalone: true,
  imports: [MatNavList, MatListItem, RouterLink, RouterLinkActive, MatIcon],
  templateUrl: './sidebar-navigation.component.html',
  styleUrl: './sidebar-navigation.component.scss',
})
export class SidebarNavigationComponent {
  @Input()
  sidenav: MatSidenav;

  pages = PAGES;
}
