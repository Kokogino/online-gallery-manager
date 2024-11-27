package com.kokogino.ogm.business.service;

import java.time.LocalDateTime;
import java.util.List;

import com.kokogino.ogm.backend.genapi.business.dto.CollectionResponse;
import com.kokogino.ogm.backend.genapi.business.dto.CreateCollectionDto;
import com.kokogino.ogm.backend.genapi.business.dto.UpdateCollectionDto;
import com.kokogino.ogm.business.repository.CollectionRepository;
import com.kokogino.ogm.datamodel.entity.OGMCollection;
import com.kokogino.ogm.exception.BusinessException;
import com.kokogino.ogm.exception.BusinessReason;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CollectionService {
  private final CollectionRepository collectionRepository;

  public CollectionResponse createCollection(CreateCollectionDto createCollectionDto) {
    OGMCollection collection = new OGMCollection();
    collection.setName(createCollectionDto.getName());
    return entityToResponse(collectionRepository.save(collection));
  }

  public void deleteCollectionById(Long id) {
    OGMCollection collection = collectionRepository.findById(id)
      .orElseThrow(() -> new BusinessException(String.format("Collection with id '%s' does not exist", id), BusinessReason.ERROR_COLLECTION_NOT_EXISTENT));
    collection.setDeletedAt(LocalDateTime.now());
    collectionRepository.save(collection);
  }

  public List<CollectionResponse> getAllCollections() {
    return collectionRepository.findAllByDeletedAtIsNull(Sort.by(new Sort.Order(Sort.Direction.ASC, "name")))
      .stream()
      .map(CollectionService::entityToResponse)
      .toList();
  }

  public CollectionResponse updateCollection(Long id, UpdateCollectionDto updateCollectionDto) {
    OGMCollection collection = collectionRepository.findById(id)
      .orElseThrow(() -> new BusinessException(String.format("Collection with id '%s' does not exist", id), BusinessReason.ERROR_COLLECTION_NOT_EXISTENT));
    collection.setName(updateCollectionDto.getName());
    return entityToResponse(collectionRepository.save(collection));
  }

  @PostConstruct
  public void cleanUpDeletedCollections() {
    collectionRepository.deleteByDeletedAtIsNotNull();
  }

  private static CollectionResponse entityToResponse(OGMCollection collection) {
    return new CollectionResponse().id(collection.getId()).name(collection.getName());
  }
}
