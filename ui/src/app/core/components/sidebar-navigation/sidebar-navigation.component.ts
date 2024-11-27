import { Component, input } from '@angular/core';
import { MatListItem, MatNavList } from '@angular/material/list';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { PAGES } from '@app/core/model/page';
import { MatSidenav } from '@angular/material/sidenav';
import { CollectionSelectComponent } from '@app/core/components/collection-select/collection-select.component';

@Component({
  selector: 'ogm-sidebar-navigation',
  imports: [MatNavList, MatListItem, RouterLink, RouterLinkActive, MatIcon, CollectionSelectComponent],
  templateUrl: './sidebar-navigation.component.html',
  styleUrl: './sidebar-navigation.component.scss',
})
export class SidebarNavigationComponent {
  readonly sidenav = input<MatSidenav>();

  pages = PAGES;
}
