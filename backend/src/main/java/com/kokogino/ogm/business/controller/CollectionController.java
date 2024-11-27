package com.kokogino.ogm.business.controller;

import java.util.List;

import com.kokogino.ogm.backend.genapi.business.controller.CollectionApi;
import com.kokogino.ogm.backend.genapi.business.dto.CollectionResponse;
import com.kokogino.ogm.backend.genapi.business.dto.CreateCollectionDto;
import com.kokogino.ogm.backend.genapi.business.dto.UpdateCollectionDto;
import com.kokogino.ogm.business.service.CollectionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class CollectionController implements CollectionApi {
  private final CollectionService collectionService;

  @Override
  public ResponseEntity<CollectionResponse> createCollection(CreateCollectionDto createCollectionDto) {
    return new ResponseEntity<>(collectionService.createCollection(createCollectionDto), HttpStatus.CREATED);
  }

  @Override
  public ResponseEntity<Void> deleteCollectionById(Long id) {
    collectionService.deleteCollectionById(id);
    return ResponseEntity.noContent().build();
  }

  @Override
  public ResponseEntity<List<CollectionResponse>> getAllCollections() {
    return ResponseEntity.ok(collectionService.getAllCollections());
  }

  @Override
  public ResponseEntity<CollectionResponse> updateCollection(Long id, UpdateCollectionDto updateCollectionDto) {
    return ResponseEntity.ok(collectionService.updateCollection(id, updateCollectionDto));
  }
}
