package com.kokogino.ogm.business.repository;

import java.util.Collection;

import com.kokogino.ogm.backend.genapi.business.dto.FindImagesDto;
import com.kokogino.ogm.datamodel.entity.Image;

public interface CustomImageRepository {
  Collection<Image> findImagesOfGalleryByFilter(Long galleryId, FindImagesDto findImagesDto);

  Collection<Image> findImagesByFilter(FindImagesDto findImagesDto);

  Long countImagesOfGalleryByFilter(Long galleryId, FindImagesDto findImagesDto);

  Long countImagesByFilter(FindImagesDto findImagesDto);
}
