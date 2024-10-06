package com.kokogino.ogm.business.controller;

import java.util.List;

import com.kokogino.ogm.backend.genapi.business.controller.GalleryApi;
import com.kokogino.ogm.backend.genapi.business.dto.*;
import com.kokogino.ogm.business.service.GalleryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class GalleryController implements GalleryApi {
  private final GalleryService galleryService;

  @Override
  public ResponseEntity<Void> deleteGalleryById(Long id) {
    galleryService.deleteGalleryById(id);
    return ResponseEntity.noContent().build();
  }

  @Override
  public ResponseEntity<FindImagesResponse> findImagesOfGallery(Long id, FindImagesDto findImagesDto) {
    return ResponseEntity.ok(galleryService.findImages(id, findImagesDto));
  }

  @Override
  public ResponseEntity<GalleryResponse> getGalleryById(Long id) {
    return ResponseEntity.ok(galleryService.getGalleryById(id));
  }

  @Override
  public ResponseEntity<GalleryResponse> updateGallery(Long id, UpdateGalleryDto updateGalleryDto) {
    return ResponseEntity.ok(galleryService.updateGallery(id, updateGalleryDto));
  }

  @Override
  public ResponseEntity<List<GalleryResponse>> findGalleries(FindGalleriesDto findGalleriesDto) {
    return ResponseEntity.ok(galleryService.findGalleries(findGalleriesDto));
  }
}
