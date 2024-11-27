package com.kokogino.ogm.datamodel.entity;

import java.time.LocalDateTime;
import java.util.Set;

import com.kokogino.ogm.backend.genapi.business.dto.ImageHost;
import com.kokogino.ogm.datamodel.converter.ImageHostConverter;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
public class Gallery extends BaseEntity {
  private String name;

  private String editUrl;

  @Column(nullable = false)
  @Convert(converter = ImageHostConverter.class)
  private ImageHost host;

  @OneToMany(mappedBy = "gallery")
  private Set<GalleryMetadataEntry> galleryMetadataEntries;

  @OneToMany(mappedBy = "gallery")
  private Set<GalleryTag> galleryTags;

  @OneToMany(mappedBy = "gallery")
  private Set<Image> images;

  private LocalDateTime deletedAt;

  @ManyToOne
  @JoinColumn(name = "collection_id", nullable = false)
  private OGMCollection collection;
}
