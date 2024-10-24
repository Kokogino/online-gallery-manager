package com.kokogino.ogm.datamodel.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(uniqueConstraints = {@UniqueConstraint(columnNames = {"gallery_id", "gallery_metadata_id"})})
@NamedEntityGraph(name = "GalleryMetadataEntry.galleryMetadata", attributeNodes = @NamedAttributeNode("galleryMetadata"))
public class GalleryMetadataEntry extends BaseEntity {
  private String value;

  @ManyToOne
  @JoinColumn(name = "gallery_id", nullable = false)
  private Gallery gallery;

  @ManyToOne
  @JoinColumn(name = "gallery_metadata_id", nullable = false)
  private GalleryMetadata galleryMetadata;
}
