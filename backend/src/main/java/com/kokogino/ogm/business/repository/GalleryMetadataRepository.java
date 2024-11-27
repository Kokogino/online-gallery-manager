package com.kokogino.ogm.business.repository;

import java.util.Collection;
import java.util.Optional;

import com.kokogino.ogm.datamodel.entity.GalleryMetadata;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.Sort;

@Transactional
public interface GalleryMetadataRepository extends BaseEntityRepository<GalleryMetadata> {
  boolean existsByName(String name);

  Optional<GalleryMetadata> findByName(String name);

  Collection<GalleryMetadata> findAllByCollectionIdAndDeletedAtIsNull(Long collectionId, Sort sort);

  void deleteByDeletedAtIsNotNull();
}
