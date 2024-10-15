package com.kokogino.ogm.business.repository;

import java.util.Collection;

import jakarta.annotation.Nonnull;
import org.springframework.data.domain.Sort;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.NoRepositoryBean;
import org.springframework.data.repository.PagingAndSortingRepository;

@NoRepositoryBean
public interface BaseEntityRepository<T> extends CrudRepository<T, Long>, PagingAndSortingRepository<T, Long> {
  @Override
  @Nonnull
  Collection<T> findAll();

  @Override
  @Nonnull
  Collection<T> findAll(@Nonnull Sort sort);

  @Override
  @Nonnull
  Collection<T> findAllById(@Nonnull Iterable<Long> ids);

  @Override
  @Nonnull
  <S extends T> Collection<S> saveAll(@Nonnull Iterable<S> entities);
}
