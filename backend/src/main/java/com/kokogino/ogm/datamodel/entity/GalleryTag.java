package com.kokogino.ogm.datamodel.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(uniqueConstraints = {@UniqueConstraint(columnNames = {"gallery_id", "tag_id"})})
@NamedEntityGraph(name = "GalleryTag.tag", attributeNodes = @NamedAttributeNode("tag"))
public class GalleryTag extends BaseEntity {
  @ManyToOne
  @JoinColumn(name = "gallery_id", nullable = false)
  private Gallery gallery;

  @ManyToOne
  @JoinColumn(name = "tag_id", nullable = false)
  private Tag tag;
}
