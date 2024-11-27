package com.kokogino.ogm.datamodel.entity;

import java.time.LocalDateTime;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(uniqueConstraints = {@UniqueConstraint(columnNames = {"name", "collection_id"})})
public class Tag extends BaseEntity {
  @Column(nullable = false, unique = true, length = 50)
  private String name;

  private Boolean showTag;

  private LocalDateTime deletedAt;

  @ManyToOne
  @JoinColumn(name = "collection_id", nullable = false)
  private OGMCollection collection;
}
