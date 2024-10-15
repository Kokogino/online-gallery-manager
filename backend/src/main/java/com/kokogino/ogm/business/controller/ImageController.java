package com.kokogino.ogm.business.controller;

import java.util.List;

import com.kokogino.ogm.backend.genapi.business.controller.ImageApi;
import com.kokogino.ogm.backend.genapi.business.dto.*;
import com.kokogino.ogm.business.service.ImageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class ImageController implements ImageApi {
  private final ImageService imageService;

  @Override
  public ResponseEntity<List<ImageResponse>> createImages(CreateImagesDto createImagesDto) {
    return new ResponseEntity<>(imageService.createImages(createImagesDto), HttpStatus.CREATED);
  }

  @Override
  public ResponseEntity<Void> deleteImageById(Long id) {
    imageService.deleteImageById(id);
    return ResponseEntity.noContent().build();
  }

  @Override
  public ResponseEntity<FindImagesResponse> findImages(FindImagesDto findImagesDto) {
    return ResponseEntity.ok(imageService.findImages(findImagesDto));
  }

  @Override
  public ResponseEntity<ImageResponse> getImageById(Long id) {
    return ResponseEntity.ok(imageService.getImageById(id));
  }

  @Override
  public ResponseEntity<ImageResponse> updateImage(Long id, UpdateImageDto updateImageDto) {
    return ResponseEntity.ok(imageService.updateImage(id, updateImageDto));
  }

  @Override
  public ResponseEntity<List<ImageResponse>> addTagsToImages(AddTagsToImagesDto addTagsToImagesDto) {
    return ResponseEntity.ok(imageService.addTagsToImages(addTagsToImagesDto));
  }
}
