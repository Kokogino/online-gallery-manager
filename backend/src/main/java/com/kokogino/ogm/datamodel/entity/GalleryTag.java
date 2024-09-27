package com.kokogino.ogm.datamodel.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(uniqueConstraints = {@UniqueConstraint(columnNames = {"gallery_id", "tag_id"})})
public class GalleryTag extends BaseEntity {
  @ManyToOne
  @JoinColumn(name = "gallery_id", nullable = false)
  private Gallery gallery;

  @ManyToOne(fetch = FetchType.EAGER)
  @JoinColumn(name = "tag_id", nullable = false)
  private Tag tag;
}
