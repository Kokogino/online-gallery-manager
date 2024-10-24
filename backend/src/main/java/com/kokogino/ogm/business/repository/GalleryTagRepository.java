package com.kokogino.ogm.business.repository;

import java.util.Collection;
import java.util.Optional;

import com.kokogino.ogm.datamodel.entity.Gallery;
import com.kokogino.ogm.datamodel.entity.GalleryTag;
import com.kokogino.ogm.datamodel.entity.Tag;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.EntityGraph;

@Transactional
public interface GalleryTagRepository extends BaseEntityRepository<GalleryTag> {
  void deleteByGallery(Gallery gallery);

  void deleteByGalleryAndTagIdNotIn(Gallery gallery, Collection<Long> tagIds);

  Optional<GalleryTag> findByGalleryAndTag(Gallery gallery, Tag tag);

  @EntityGraph("GalleryTag.tag")
  Collection<GalleryTag> findAllByGalleryAndTagDeletedAtIsNullOrderByTagName(Gallery gallery);
}
