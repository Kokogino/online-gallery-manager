package com.kokogino.ogm.business.repository;

import java.util.Collection;

import com.kokogino.ogm.backend.genapi.business.dto.*;
import com.kokogino.ogm.datamodel.entity.Gallery;
import com.kokogino.ogm.datamodel.entity.GalleryTag;
import com.kokogino.ogm.datamodel.entity.Tag;
import jakarta.persistence.EntityManager;
import jakarta.persistence.criteria.*;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public class CustomGalleryRepositoryImpl implements CustomGalleryRepository {
  private final EntityManager entityManager;

  @Override
  public Collection<Gallery> findGalleriesByFilter(FindGalleriesDto findGalleriesDto) {
    CriteriaBuilder cb = entityManager.getCriteriaBuilder();
    CriteriaQuery<Gallery> cq = cb.createQuery(Gallery.class);
    Root<Gallery> gallery = cq.from(Gallery.class);
    cq.select(gallery);

    Predicate filterPredicate = createPredicateWithFilter(findGalleriesDto.getFilter(), gallery, cb, cq);
    cq.where(filterPredicate);

    cq.orderBy(createOrder(findGalleriesDto.getRandomizeOrder(), gallery, cb));

    cq.groupBy(gallery.get("id"));

    return entityManager.createQuery(cq).getResultList();
  }

  private Predicate createPredicateWithFilter(FilterExpressionDto filter, Root<Gallery> gallery, CriteriaBuilder cb, CriteriaQuery<?> cq) {
    if (filter instanceof TagFilterExpressionDto tagFilter) {
      Join<Gallery, GalleryTag> galleryTag = gallery.join("galleryTags", JoinType.LEFT);
      Join<GalleryTag, Tag> galleryTagTag = galleryTag.join("tag", JoinType.LEFT);
      return cb.equal(galleryTagTag.get("id"), tagFilter.getTagId());
    }
    if (filter instanceof NotFilterExpressionDto notFilter) {
      Subquery<Gallery> subquery = cq.subquery(Gallery.class);
      Root<Gallery> subGallery = subquery.from(Gallery.class);
      subquery.select(subGallery);

      Predicate sameId = cb.equal(subGallery.get("id"), gallery.get("id"));
      Predicate subPredicate = createPredicateWithFilter(notFilter.getExpression(), subGallery, cb, cq);
      subquery.where(cb.and(sameId, subPredicate));
      return cb.not(cb.exists(subquery));
    }
    if (filter instanceof AndFilterExpressionDto andFilter) {
      Predicate first = createPredicateWithFilter(andFilter.getFirst(), gallery, cb, cq);
      Predicate second = createPredicateWithFilter(andFilter.getSecond(), gallery, cb, cq);
      return cb.and(first, second);
    }
    if (filter instanceof OrFilterExpressionDto orFilter) {
      Predicate first = createPredicateWithFilter(orFilter.getFirst(), gallery, cb, cq);
      Predicate second = createPredicateWithFilter(orFilter.getSecond(), gallery, cb, cq);
      return cb.or(first, second);
    }

    return cb.isTrue(cb.literal(true));
  }

  private Order createOrder(Boolean randomizeOrder, Root<Gallery> gallery, CriteriaBuilder cb) {
    if (Boolean.TRUE.equals(randomizeOrder)) {
      Expression<Double> random = cb.function("random", Double.class);
      return cb.asc(random);
    }
    return cb.desc(gallery.get("updatedAt"));
  }
}
