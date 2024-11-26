import { Component } from '@angular/core';
import { HeaderComponent } from '@app/core/components/header/header.component';
import { MatSidenav, MatSidenavContainer, MatSidenavContent } from '@angular/material/sidenav';
import { SidebarNavigationComponent } from '@app/core/components/sidebar-navigation/sidebar-navigation.component';

@Component({
  selector: 'ogm-core',
  imports: [HeaderComponent, MatSidenavContainer, MatSidenavContent, MatSidenav, SidebarNavigationComponent],
  templateUrl: './core.component.html',
  styleUrl: './core.component.scss',
})
export class CoreComponent {}
