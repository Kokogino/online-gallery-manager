package com.kokogino.ogm.business.repository;

import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.NoRepositoryBean;
import org.springframework.data.repository.PagingAndSortingRepository;

@NoRepositoryBean
public interface BaseEntityRepository<T> extends CrudRepository<T, Long>, PagingAndSortingRepository<T, Long> {
}
