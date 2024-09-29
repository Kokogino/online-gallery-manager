import { Component, Input, OnInit } from '@angular/core';
import { NavItemComponent } from '@app/core/components/nav-item/nav-item.component';
import { MatDivider } from '@angular/material/divider';
import { MatIcon } from '@angular/material/icon';
import { map, Observable } from 'rxjs';
import { ThemeService } from '@app/core/services/theme.service';
import { MatTooltip } from '@angular/material/tooltip';
import { AsyncPipe } from '@angular/common';
import { MatIconButton } from '@angular/material/button';
import { MediaQueryService } from '@app/core/services/media-query.service';
import { MatSidenav } from '@angular/material/sidenav';
import { PAGES } from '@app/core/model/page';

@Component({
  selector: 'ogm-header',
  standalone: true,
  imports: [NavItemComponent, MatDivider, MatIcon, MatTooltip, AsyncPipe, MatIconButton],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent implements OnInit {
  @Input()
  sidenav: MatSidenav;

  isLightTheme: Observable<boolean>;

  pages = PAGES;

  constructor(
    public readonly mediaQueryService: MediaQueryService,
    private readonly themeService: ThemeService,
  ) {}

  ngOnInit(): void {
    this.isLightTheme = this.themeService.theme$.pipe(map((theme) => theme === 'light'));
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }
}
