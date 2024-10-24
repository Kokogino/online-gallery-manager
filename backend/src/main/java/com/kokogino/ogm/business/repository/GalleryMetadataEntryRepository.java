package com.kokogino.ogm.business.repository;

import java.util.Collection;
import java.util.Optional;

import com.kokogino.ogm.datamodel.entity.Gallery;
import com.kokogino.ogm.datamodel.entity.GalleryMetadata;
import com.kokogino.ogm.datamodel.entity.GalleryMetadataEntry;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.EntityGraph;

@Transactional
public interface GalleryMetadataEntryRepository extends BaseEntityRepository<GalleryMetadataEntry> {
  void deleteByGallery(Gallery gallery);

  void deleteByGalleryAndGalleryMetadataIdNotIn(Gallery gallery, Collection<Long> galleryMetadataIds);

  Optional<GalleryMetadataEntry> findByGalleryAndGalleryMetadata(Gallery gallery, GalleryMetadata galleryMetadata);

  @EntityGraph("GalleryMetadataEntry.galleryMetadata")
  Collection<GalleryMetadataEntry> findAllByGalleryAndGalleryMetadataDeletedAtIsNullOrderByGalleryMetadataName(Gallery gallery);
}
