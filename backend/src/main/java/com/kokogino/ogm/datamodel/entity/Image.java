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
public class Image extends BaseEntity {
  @Column(nullable = false)
  private String thumbnailUrl;

  @Column(nullable = false)
  private String imageUrl;

  private String editUrl;

  @Column(nullable = false)
  @Convert(converter = ImageHostConverter.class)
  private ImageHost host;

  @ManyToOne
  @JoinColumn(name = "gallery_id")
  private Gallery gallery;

  @OneToMany(mappedBy = "image")
  private Set<ImageTag> imageTags;

  private LocalDateTime deletedAt;
}
