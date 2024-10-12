import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { GalleriesService } from '@app/galleries/services/galleries.service';
import { Subscription } from 'rxjs';
import { GalleryDetailsComponent } from '@app/galleries/components/gallery-details/gallery-details.component';
import { NgClass } from '@angular/common';

@Component({
  selector: 'ogm-gallery',
  standalone: true,
  imports: [RouterOutlet, GalleryDetailsComponent, NgClass],
  templateUrl: './gallery.component.html',
  styleUrl: './gallery.component.scss',
})
export class GalleryComponent implements OnInit, OnDestroy {
  showOutlet = false;

  private routeSubscription: Subscription;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly galleriesService: GalleriesService,
    private readonly router: Router,
    private readonly changeDetectorRef: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.routeSubscription = this.route.paramMap.subscribe((params) => {
      const galleryId = parseInt(params.get(GalleriesService.GALLERY_ID_PARAM));
      if (isNaN(galleryId)) {
        void this.router.navigateByUrl('galleries');
      } else if (this.galleriesService.getSelectedGalleryIdValue() !== galleryId) {
        this.galleriesService.changeSelectedGalleryId(galleryId);
      }
    });
  }

  ngOnDestroy(): void {
    this.routeSubscription?.unsubscribe();
  }

  toggleOutletVisibility(showOutlet: boolean): void {
    this.showOutlet = showOutlet;
    this.changeDetectorRef.detectChanges();
  }
}
