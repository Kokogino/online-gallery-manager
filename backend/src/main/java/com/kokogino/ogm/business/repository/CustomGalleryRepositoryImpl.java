package com.kokogino.ogm.business.repository;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.List;

import com.kokogino.ogm.backend.genapi.business.dto.*;
import com.kokogino.ogm.datamodel.entity.*;
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
    cq.where(createWhereClause(findGalleriesDto, gallery, cb, cq));
    cq.orderBy(createOrder(findGalleriesDto.getRandomizeOrder(), gallery, cb));
    cq.groupBy(gallery.get("id"));

    optimizeQuery(cq, gallery, cb);

    return entityManager.createQuery(cq).getResultList();
  }

  private Predicate createWhereClause(FindGalleriesDto findGalleriesDto, Root<Gallery> gallery, CriteriaBuilder cb, CriteriaQuery<?> cq) {
    Predicate createdAtPredicate = cb.lessThan(gallery.get("createdAt"), findGalleriesDto.getStartingDate());
    Predicate deletedAtPredicate = cb.or(
      cb.isNull(gallery.get("deletedAt")),
      cb.greaterThan(gallery.get("deletedAt"), findGalleriesDto.getStartingDate())
    );

    Predicate filterPredicate = createPredicateWithFilter(findGalleriesDto.getFilter(), gallery, cb, cq);
    return cb.and(deletedAtPredicate, createdAtPredicate, filterPredicate);
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

  private List<Order> createOrder(Boolean randomizeOrder, Root<Gallery> gallery, CriteriaBuilder cb) {
    if (Boolean.TRUE.equals(randomizeOrder)) {
      Expression<Double> random = cb.function("random", Double.class);
      return Arrays.asList(cb.asc(random), cb.asc(gallery.get("id")));
    }
    return Arrays.asList(cb.desc(gallery.get("createdAt")), cb.asc(gallery.get("id")));
  }

  /**
   * This fetches tags and metadata to avoid N+1 problem.
   */
  private void optimizeQuery(CriteriaQuery<Gallery> cq, Root<Gallery> gallery, CriteriaBuilder cb) {
    Join<Gallery, GalleryTag> galleryTag = (Join<Gallery, GalleryTag>) gallery.<Gallery, GalleryTag>fetch("galleryTags", JoinType.LEFT);
    Join<GalleryTag, Tag> tag = (Join<GalleryTag, Tag>) galleryTag.<GalleryTag, Tag>fetch("tag", JoinType.LEFT);
    Join<Gallery, GalleryMetadataEntry> galleryMetadataEntry = (Join<Gallery, GalleryMetadataEntry>) gallery.<Gallery, GalleryMetadataEntry>fetch("galleryMetadataEntries", JoinType.LEFT);
    Join<GalleryMetadataEntry, GalleryMetadata> galleryMetadata = (Join<GalleryMetadataEntry, GalleryMetadata>) galleryMetadataEntry.<GalleryMetadataEntry, GalleryMetadata>fetch("galleryMetadata", JoinType.LEFT);

    Predicate tagIsNotDeleted = cb.isNull(tag.get("deletedAt"));
    Predicate galleryMetadataIsNotDeleted = cb.isNull(galleryMetadata.get("deletedAt"));

    List<Expression<?>> groupByList = new ArrayList<>(cq.getGroupList());
    groupByList.add(galleryTag.get("id"));
    groupByList.add(tag.get("id"));
    groupByList.add(galleryMetadataEntry.get("id"));
    groupByList.add(galleryMetadata.get("id"));

    cq.where(cb.and(cq.getRestriction(), tagIsNotDeleted, galleryMetadataIsNotDeleted));
    cq.groupBy(groupByList);
  }
}
