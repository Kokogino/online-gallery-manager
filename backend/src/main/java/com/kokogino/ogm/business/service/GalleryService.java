package com.kokogino.ogm.business.service;

import java.util.*;

import com.kokogino.ogm.backend.genapi.business.dto.*;
import com.kokogino.ogm.business.repository.*;
import com.kokogino.ogm.datamodel.entity.*;
import com.kokogino.ogm.exception.BusinessException;
import com.kokogino.ogm.exception.BusinessReason;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class GalleryService {
  private final GalleryRepository galleryRepository;
  private final ImageRepository imageRepository;
  private final TagRepository tagRepository;
  private final GalleryMetadataRepository galleryMetadataRepository;
  private final GalleryTagRepository galleryTagRepository;
  private final GalleryMetadataEntryRepository galleryMetadataEntryRepository;

  public void deleteGalleryById(Long id) {
    Gallery gallery = galleryRepository.findById(id)
      .orElseThrow(() -> new BusinessException(String.format("Gallery with id '%s' does not exist", id), BusinessReason.ERROR_GALLERY_NOT_EXISTENT));
    imageRepository.deleteAll(gallery.getImages());
    galleryRepository.deleteById(id);
  }

  public FindImagesResponse findImages(Long galleryId, FindImagesDto findImagesDto) {
    if (!galleryRepository.existsById(galleryId)) {
      throw new BusinessException(String.format("Gallery with id '%s' does not exist", galleryId), BusinessReason.ERROR_GALLERY_NOT_EXISTENT);
    }
    Collection<Image> images = imageRepository.findImagesOfGalleryByFilter(galleryId, findImagesDto);
    Long totalCount = imageRepository.countImagesOfGalleryByFilter(galleryId, findImagesDto);

    FindImagesResponse response = new FindImagesResponse();
    response.setImages(images.stream().map(ImageService::imageToResponse).toList());
    response.setTotalCount(totalCount);
    return response;
  }

  public List<GalleryResponse> findGalleries(FindGalleriesDto findGalleriesDto) {
    return galleryRepository.findGalleriesByFilter(findGalleriesDto).stream().map(GalleryService::galleryToResponse).toList();
  }

  public GalleryResponse getGalleryById(Long id) {
    return galleryRepository.findById(id)
      .map(GalleryService::galleryToResponse)
      .orElseThrow(() -> new BusinessException(String.format("Gallery with id '%s' does not exist", id), BusinessReason.ERROR_GALLERY_NOT_EXISTENT));
  }

  public GalleryResponse updateGallery(Long id, UpdateGalleryDto updateGalleryDto) {
    Gallery gallery = galleryRepository.findById(id)
      .orElseThrow(() -> new BusinessException(String.format("Gallery with id '%s' does not exist", id), BusinessReason.ERROR_GALLERY_NOT_EXISTENT));
    gallery.setName(updateGalleryDto.getName());
    gallery.setGalleryTags(upsertGalleryTags(gallery, updateGalleryDto.getTagIds()));
    gallery.setGalleryMetadataEntries(upsertGalleryMetadataEntries(gallery, updateGalleryDto.getGalleryMetadata()));

    return galleryToResponse(galleryRepository.save(gallery));
  }

  private Set<GalleryTag> upsertGalleryTags(Gallery gallery, Collection<Long> tagIds) {
    if (tagIds == null || tagIds.isEmpty()) {
      galleryTagRepository.deleteByGallery(gallery);
      return new HashSet<>();
    }
    galleryTagRepository.deleteByGalleryAndTagIdNotIn(gallery, tagIds);

    Set<GalleryTag> galleryTags = new HashSet<>();
    for (Long tagId : tagIds) {
      Tag tag = tagRepository.findById(tagId)
        .orElseThrow(() -> new BusinessException(String.format("Tag with id '%s' does not exist", tagId), BusinessReason.ERROR_TAG_NOT_EXISTENT));
      Optional<GalleryTag> galleryTag = galleryTagRepository.findByGalleryAndTag(gallery, tag);
      if (galleryTag.isPresent()) {
        galleryTags.add(galleryTag.get());
      } else {
        GalleryTag newGalleryTag = new GalleryTag();
        newGalleryTag.setGallery(gallery);
        newGalleryTag.setTag(tag);
        galleryTags.add(galleryTagRepository.save(newGalleryTag));
      }
    }
    return galleryTags;
  }

  private Set<GalleryMetadataEntry> upsertGalleryMetadataEntries(Gallery gallery, Collection<UpdateGalleryMetadataEntryDto> metadata) {
    if (metadata == null || metadata.isEmpty()) {
      galleryMetadataEntryRepository.deleteByGallery(gallery);
      return new HashSet<>();
    }
    List<Long> galleryMetadataIds = metadata.stream().map(UpdateGalleryMetadataEntryDto::getGalleryMetadataId).toList();
    galleryMetadataEntryRepository.deleteByGalleryAndGalleryMetadataIdNotIn(gallery, galleryMetadataIds);

    Set<GalleryMetadataEntry> galleryMetadataEntries = new HashSet<>();
    for (UpdateGalleryMetadataEntryDto entryDto : metadata) {
      GalleryMetadata galleryMetadata = galleryMetadataRepository.findById(entryDto.getGalleryMetadataId())
        .orElseThrow(() -> new BusinessException(String.format("GalleryMetadata with id '%s' does not exist", entryDto.getGalleryMetadataId()), BusinessReason.ERROR_GALLERY_METADATA_NOT_EXISTENT));
      Optional<GalleryMetadataEntry> galleryMetadataEntry = galleryMetadataEntryRepository.findByGalleryAndGalleryMetadata(gallery, galleryMetadata);
      if (galleryMetadataEntry.isPresent()) {
        GalleryMetadataEntry entry = galleryMetadataEntry.get();
        entry.setValue(entryDto.getValue());
        galleryMetadataEntries.add(galleryMetadataEntryRepository.save(entry));
      } else {
        GalleryMetadataEntry newGalleryMetadataEntry = new GalleryMetadataEntry();
        newGalleryMetadataEntry.setGallery(gallery);
        newGalleryMetadataEntry.setGalleryMetadata(galleryMetadata);
        newGalleryMetadataEntry.setValue(entryDto.getValue());
        galleryMetadataEntries.add(galleryMetadataEntryRepository.save(newGalleryMetadataEntry));
      }
    }
    return galleryMetadataEntries;
  }

  private static GalleryResponse galleryToResponse(Gallery gallery) {
    return new GalleryResponse()
      .id(gallery.getId())
      .name(gallery.getName())
      .editUrl(gallery.getEditUrl())
      .host(gallery.getHost())
      .tags(
        gallery.getGalleryTags()
          .stream()
          .map(GalleryService::galleryTagToResponse)
          .sorted(GalleryService::compareGalleryTagResponse)
          .toList())
      .metadata(
        gallery.getGalleryMetadataEntries()
          .stream()
          .map(GalleryService::galleryMetadataEntryToResponse)
          .sorted(GalleryService::compareGalleryMetadataEntryResponse)
          .toList()
      );
  }

  private static GalleryTagResponse galleryTagToResponse(GalleryTag galleryTag) {
    Tag tag = galleryTag.getTag();
    return new GalleryTagResponse()
      .id(galleryTag.getId())
      .tagId(tag.getId())
      .name(tag.getName())
      .showTag(tag.getShowTag());
  }

  private static GalleryMetadataEntryResponse galleryMetadataEntryToResponse(GalleryMetadataEntry galleryMetadataEntry) {
    GalleryMetadata galleryMetadata = galleryMetadataEntry.getGalleryMetadata();
    return new GalleryMetadataEntryResponse()
      .id(galleryMetadataEntry.getId())
      .galleryMetadataId(galleryMetadata.getId())
      .value(galleryMetadataEntry.getValue())
      .name(galleryMetadata.getName())
      .type(galleryMetadata.getType());
  }

  private static int compareGalleryMetadataEntryResponse(GalleryMetadataEntryResponse m1, GalleryMetadataEntryResponse m2) {
    return m1.getName().compareToIgnoreCase(m2.getName());
  }

  private static int compareGalleryTagResponse(GalleryTagResponse t1, GalleryTagResponse t2) {
    return t1.getName().compareToIgnoreCase(t2.getName());
  }
}
