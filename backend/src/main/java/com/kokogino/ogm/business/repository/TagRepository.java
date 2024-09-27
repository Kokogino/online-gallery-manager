package com.kokogino.ogm.business.repository;

import java.util.Optional;

import com.kokogino.ogm.datamodel.entity.Tag;
import jakarta.transaction.Transactional;

@Transactional
public interface TagRepository extends BaseEntityRepository<Tag> {
  boolean existsByName(String name);

  Optional<Tag> findByName(String name);
}
