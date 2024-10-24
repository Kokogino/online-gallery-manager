package com.kokogino.ogm.datamodel.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(uniqueConstraints = {@UniqueConstraint(columnNames = {"image_id", "tag_id"})})
@NamedEntityGraph(name = "ImageTag.tag", attributeNodes = @NamedAttributeNode("tag"))
public class ImageTag extends BaseEntity {
  @ManyToOne
  @JoinColumn(name = "image_id", nullable = false)
  private Image image;

  @ManyToOne
  @JoinColumn(name = "tag_id", nullable = false)
  private Tag tag;
}
