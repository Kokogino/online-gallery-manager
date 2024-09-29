import { Component } from '@angular/core';
import { MatListItem, MatNavList } from '@angular/material/list';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { PAGES } from '@app/core/model/page';

@Component({
  selector: 'ogm-sidebar-navigation',
  standalone: true,
  imports: [MatNavList, MatListItem, RouterLink, RouterLinkActive, MatIcon],
  templateUrl: './sidebar-navigation.component.html',
  styleUrl: './sidebar-navigation.component.scss',
})
export class SidebarNavigationComponent {
  pages = PAGES;
}
