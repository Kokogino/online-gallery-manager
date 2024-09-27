package com.kokogino.ogm.business.repository;

import com.kokogino.ogm.datamodel.entity.Image;
import jakarta.transaction.Transactional;

@Transactional
public interface ImageRepository extends BaseEntityRepository<Image>, CustomImageRepository {
}
