package com.kokogino.ogm.datamodel.entity;

import java.time.LocalDateTime;
import java.util.Set;

import com.kokogino.ogm.backend.genapi.business.dto.GalleryMetadataType;
import com.kokogino.ogm.datamodel.converter.GalleryMetadataTypeConverter;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(uniqueConstraints = {@UniqueConstraint(columnNames = {"name", "collection_id"})})
public class GalleryMetadata extends BaseEntity {
  @Column(nullable = false, unique = true, length = 50)
  private String name;

  @Column(nullable = false)
  @Convert(converter = GalleryMetadataTypeConverter.class)
  private GalleryMetadataType type;

  @OneToMany(mappedBy = "galleryMetadata")
  private Set<GalleryMetadataEntry> galleryMetadataEntries;

  private LocalDateTime deletedAt;

  @ManyToOne
  @JoinColumn(name = "collection_id", nullable = false)
  private OGMCollection collection;
}
