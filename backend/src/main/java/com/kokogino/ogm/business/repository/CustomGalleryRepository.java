package com.kokogino.ogm.business.repository;

import java.util.Collection;

import com.kokogino.ogm.backend.genapi.business.dto.FindGalleriesDto;
import com.kokogino.ogm.datamodel.entity.Gallery;

public interface CustomGalleryRepository {
  Collection<Gallery> findGalleriesByFilter(FindGalleriesDto findGalleriesDto);
}
