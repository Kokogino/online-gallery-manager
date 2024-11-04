package com.kokogino.ogm.business.repository;

import com.kokogino.ogm.datamodel.entity.Gallery;
import jakarta.transaction.Transactional;

@Transactional
public interface GalleryRepository extends BaseEntityRepository<Gallery>, CustomGalleryRepository {
  void deleteByDeletedAtIsNotNull();
}
