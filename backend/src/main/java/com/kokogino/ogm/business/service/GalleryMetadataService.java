package com.kokogino.ogm.business.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import com.kokogino.ogm.backend.genapi.business.dto.CreateGalleryMetadataDto;
import com.kokogino.ogm.backend.genapi.business.dto.GalleryMetadataResponse;
import com.kokogino.ogm.backend.genapi.business.dto.UpdateGalleryMetadataDto;
import com.kokogino.ogm.business.repository.CollectionRepository;
import com.kokogino.ogm.business.repository.GalleryMetadataRepository;
import com.kokogino.ogm.datamodel.entity.GalleryMetadata;
import com.kokogino.ogm.datamodel.entity.OGMCollection;
import com.kokogino.ogm.exception.BusinessException;
import com.kokogino.ogm.exception.BusinessReason;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class GalleryMetadataService {
  private final GalleryMetadataRepository galleryMetadataRepository;
  private final CollectionRepository collectionRepository;

  public GalleryMetadataResponse createGalleryMetadata(CreateGalleryMetadataDto createGalleryMetadataDto) {
    if (galleryMetadataRepository.existsByName(createGalleryMetadataDto.getName())) {
      throw new BusinessException(String.format("GalleryMetadata with name '%s' already exists", createGalleryMetadataDto.getName()), BusinessReason.ERROR_GALLERY_METADATA_NAME_NOT_UNIQUE);
    }
    OGMCollection collection = collectionRepository.findById(createGalleryMetadataDto.getCollectionId())
      .orElseThrow(() -> new BusinessException(String.format("Collection with id '%s' does not exist", createGalleryMetadataDto.getCollectionId()), BusinessReason.ERROR_COLLECTION_NOT_EXISTENT));

    GalleryMetadata galleryMetadata = new GalleryMetadata();
    galleryMetadata.setCollection(collection);
    galleryMetadata.setName(createGalleryMetadataDto.getName());
    galleryMetadata.setType(createGalleryMetadataDto.getType());
    return entityToResponse(galleryMetadataRepository.save(galleryMetadata));
  }

  public void deleteGalleryMetadataById(Long id) {
    GalleryMetadata galleryMetadata = galleryMetadataRepository.findById(id)
      .orElseThrow(() -> new BusinessException(String.format("GalleryMetadata with id '%s' does not exist", id), BusinessReason.ERROR_GALLERY_METADATA_NOT_EXISTENT));
    galleryMetadata.setDeletedAt(LocalDateTime.now());
    galleryMetadataRepository.save(galleryMetadata);
  }

  public List<GalleryMetadataResponse> getAllGalleryMetadata(Long collectionId) {
    return galleryMetadataRepository.findAllByCollectionIdAndDeletedAtIsNull(collectionId, Sort.by(new Sort.Order(Sort.Direction.ASC, "name")))
      .stream()
      .map(GalleryMetadataService::entityToResponse)
      .toList();
  }

  public GalleryMetadataResponse updateGalleryMetadata(Long id, UpdateGalleryMetadataDto updateGalleryMetadataDto) {
    GalleryMetadata galleryMetadata = galleryMetadataRepository.findById(id)
      .orElseThrow(() -> new BusinessException(String.format("GalleryMetadata with id '%s' does not exist", id), BusinessReason.ERROR_GALLERY_METADATA_NOT_EXISTENT));
    Optional<GalleryMetadata> galleryMetadataWithSameName = galleryMetadataRepository.findByName(updateGalleryMetadataDto.getName());
    if (galleryMetadataWithSameName.isPresent() && !galleryMetadataWithSameName.get().equals(galleryMetadata)) {
      throw new BusinessException(String.format("GalleryMetadata with name '%s' already exists", updateGalleryMetadataDto.getName()), BusinessReason.ERROR_GALLERY_METADATA_NAME_NOT_UNIQUE);
    }
    galleryMetadata.setName(updateGalleryMetadataDto.getName());
    return entityToResponse(galleryMetadataRepository.save(galleryMetadata));
  }

  @PostConstruct
  public void cleanUpDeletedGalleryMetadata() {
    galleryMetadataRepository.deleteByDeletedAtIsNotNull();
  }

  private static GalleryMetadataResponse entityToResponse(GalleryMetadata galleryMetadata) {
    return new GalleryMetadataResponse().id(galleryMetadata.getId()).name(galleryMetadata.getName()).type(galleryMetadata.getType());
  }
}
