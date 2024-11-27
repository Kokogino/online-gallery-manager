package com.kokogino.ogm.datamodel.entity;

import java.time.LocalDateTime;
import java.util.Set;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "collection")
public class OGMCollection extends BaseEntity {
  @Column(nullable = false)
  private String name;

  private LocalDateTime deletedAt;

  @OneToMany(mappedBy = "collection")
  private Set<Tag> tags;

  @OneToMany(mappedBy = "collection")
  private Set<GalleryMetadata> galleryMetadata;

  @OneToMany(mappedBy = "collection")
  private Set<Image> images;

  @OneToMany(mappedBy = "collection")
  private Set<Gallery> galleries;
}
