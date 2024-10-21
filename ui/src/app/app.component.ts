import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { map, Observable } from 'rxjs';
import { ThemeService } from '@app/shared/services/theme.service';
import { OverlayContainer } from '@angular/cdk/overlay';
import { CoreComponent } from '@app/core/core.component';
import { AsyncPipe, NgClass } from '@angular/common';

@Component({
  selector: 'ogm-root',
  standalone: true,
  imports: [RouterOutlet, CoreComponent, NgClass, AsyncPipe],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  isLightTheme: Observable<boolean>;

  constructor(
    private readonly themeService: ThemeService,
    private readonly overlayContainer: OverlayContainer,
  ) {}

  ngOnInit(): void {
    this.isLightTheme = this.themeService.theme$.pipe(map((theme) => theme === 'light'));

    this.isLightTheme.subscribe((isLightTheme) => {
      if (isLightTheme) {
        this.overlayContainer.getContainerElement().classList.add('light-theme');
      } else {
        this.overlayContainer.getContainerElement().classList.remove('light-theme');
      }
    });
  }
}
