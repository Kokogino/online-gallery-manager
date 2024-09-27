package com.kokogino.ogm.business.repository;

import com.kokogino.ogm.datamodel.entity.ImageTag;
import jakarta.transaction.Transactional;

@Transactional
public interface ImageTagRepository extends BaseEntityRepository<ImageTag> {
}
