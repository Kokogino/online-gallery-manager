package com.kokogino.ogm.business.controller;

import java.util.List;

import com.kokogino.ogm.backend.genapi.business.controller.GalleryMetadataApi;
import com.kokogino.ogm.backend.genapi.business.dto.CreateGalleryMetadataDto;
import com.kokogino.ogm.backend.genapi.business.dto.GalleryMetadataResponse;
import com.kokogino.ogm.backend.genapi.business.dto.UpdateGalleryMetadataDto;
import com.kokogino.ogm.business.service.GalleryMetadataService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class GalleryMetadataController implements GalleryMetadataApi {
  private final GalleryMetadataService galleryMetadataService;

  @Override
  public ResponseEntity<GalleryMetadataResponse> createGalleryMetadata(CreateGalleryMetadataDto createGalleryMetadataDto) {
    return new ResponseEntity<>(galleryMetadataService.createGalleryMetadata(createGalleryMetadataDto), HttpStatus.CREATED);
  }

  @Override
  public ResponseEntity<Void> deleteGalleryMetadataById(Long id) {
    galleryMetadataService.deleteGalleryMetadataById(id);
    return ResponseEntity.noContent().build();
  }

  @Override
  public ResponseEntity<List<GalleryMetadataResponse>> getAllGalleryMetadata(Long collectionId) {
    return ResponseEntity.ok(galleryMetadataService.getAllGalleryMetadata(collectionId));
  }

  @Override
  public ResponseEntity<GalleryMetadataResponse> updateGalleryMetadata(Long id, UpdateGalleryMetadataDto updateGalleryMetadataDto) {
    return ResponseEntity.ok(galleryMetadataService.updateGalleryMetadata(id, updateGalleryMetadataDto));
  }
}
