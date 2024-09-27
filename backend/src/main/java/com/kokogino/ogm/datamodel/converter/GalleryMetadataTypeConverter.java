package com.kokogino.ogm.datamodel.converter;

import com.kokogino.ogm.backend.genapi.business.dto.GalleryMetadataType;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter
public class GalleryMetadataTypeConverter implements AttributeConverter<GalleryMetadataType, String> {

  @Override
  public String convertToDatabaseColumn(GalleryMetadataType metadataType) {
    return metadataType != null ? metadataType.getValue() : null;
  }

  @Override
  public GalleryMetadataType convertToEntityAttribute(String dbData) {
    return dbData != null ? GalleryMetadataType.fromValue(dbData) : null;
  }
}
