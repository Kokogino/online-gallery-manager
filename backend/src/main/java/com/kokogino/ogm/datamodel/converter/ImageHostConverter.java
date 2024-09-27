package com.kokogino.ogm.datamodel.converter;

import com.kokogino.ogm.backend.genapi.business.dto.ImageHost;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter
public class ImageHostConverter implements AttributeConverter<ImageHost, String> {

  @Override
  public String convertToDatabaseColumn(ImageHost imageHost) {
    return imageHost != null ? imageHost.getValue() : null;
  }

  @Override
  public ImageHost convertToEntityAttribute(String dbData) {
    return dbData != null ? ImageHost.fromValue(dbData) : null;
  }
}
