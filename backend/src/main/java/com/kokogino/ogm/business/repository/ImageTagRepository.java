package com.kokogino.ogm.business.repository;

import java.util.Collection;
import java.util.Optional;

import com.kokogino.ogm.datamodel.entity.Image;
import com.kokogino.ogm.datamodel.entity.ImageTag;
import com.kokogino.ogm.datamodel.entity.Tag;
import jakarta.transaction.Transactional;

@Transactional
public interface ImageTagRepository extends BaseEntityRepository<ImageTag> {
  void deleteByImage(Image image);

  void deleteByImageAndTagIdNotIn(Image image, Collection<Long> tagIds);

  Optional<ImageTag> findByImageAndTag(Image image, Tag tag);

  Collection<ImageTag> findAllByImageAndTagDeletedAtIsNull(Image image);
}
