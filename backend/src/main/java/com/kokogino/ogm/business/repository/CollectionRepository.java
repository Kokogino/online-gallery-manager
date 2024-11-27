package com.kokogino.ogm.business.repository;

import java.util.Collection;

import com.kokogino.ogm.datamodel.entity.OGMCollection;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.Sort;

@Transactional
public interface CollectionRepository extends BaseEntityRepository<OGMCollection> {
  Collection<OGMCollection> findAllByDeletedAtIsNull(Sort sort);

  void deleteByDeletedAtIsNotNull();
}
