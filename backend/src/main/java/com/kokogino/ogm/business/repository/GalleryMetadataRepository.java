package com.kokogino.ogm.business.repository;

import java.util.Optional;

import com.kokogino.ogm.datamodel.entity.GalleryMetadata;
import jakarta.transaction.Transactional;

@Transactional
public interface GalleryMetadataRepository extends BaseEntityRepository<GalleryMetadata> {
  boolean existsByName(String name);

  Optional<GalleryMetadata> findByName(String name);
}
