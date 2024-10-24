package com.kokogino.ogm.business.repository;

import java.util.Collection;
import java.util.Optional;

import com.kokogino.ogm.datamodel.entity.Tag;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.Sort;

@Transactional
public interface TagRepository extends BaseEntityRepository<Tag> {
  boolean existsByName(String name);

  Optional<Tag> findByName(String name);

  Collection<Tag> findAllByDeletedAtIsNull(Sort sort);
}
