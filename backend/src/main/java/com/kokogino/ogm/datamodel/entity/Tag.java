package com.kokogino.ogm.datamodel.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
public class Tag extends BaseEntity {
  @Column(nullable = false, unique = true, length = 50)
  private String name;

  private Boolean showTag;
}
