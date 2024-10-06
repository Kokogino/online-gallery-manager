import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { GalleriesService } from '@app/galleries/services/galleries.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'ogm-gallery',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './gallery.component.html',
  styleUrl: './gallery.component.scss',
})
export class GalleryComponent implements OnInit, OnDestroy {
  private routeSubscription: Subscription;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly galleriesService: GalleriesService,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    this.routeSubscription = this.route.paramMap.subscribe((params) => {
      const projectId = parseInt(params.get(GalleriesService.GALLERY_ID_PARAM));
      if (isNaN(projectId)) {
        void this.router.navigateByUrl('galleries');
      } else if (this.galleriesService.getSelectedGalleryIdValue() !== projectId) {
        this.galleriesService.changeSelectedGalleryId(projectId);
      }
    });
  }

  ngOnDestroy(): void {
    this.routeSubscription?.unsubscribe();
  }
}
