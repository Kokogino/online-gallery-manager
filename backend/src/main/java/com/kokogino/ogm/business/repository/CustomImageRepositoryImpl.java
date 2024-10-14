package com.kokogino.ogm.business.repository;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.Collection;
import java.util.List;

import com.kokogino.ogm.backend.genapi.business.dto.*;
import com.kokogino.ogm.datamodel.entity.*;
import jakarta.persistence.EntityManager;
import jakarta.persistence.Query;
import jakarta.persistence.criteria.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RequiredArgsConstructor
public class CustomImageRepositoryImpl implements CustomImageRepository {
  private final EntityManager entityManager;

  @Override
  public Collection<Image> findImagesOfGalleryByFilter(Long galleryId, FindImagesDto findImagesDto) {
    CriteriaBuilder cb = entityManager.getCriteriaBuilder();
    CriteriaQuery<Image> cq = cb.createQuery(Image.class);
    Root<Image> image = cq.from(Image.class);

    cq.select(image);
    cq.where(createWhereClause(findImagesDto, galleryId, image, cb, cq));
    cq.orderBy(createOrder(findImagesDto.getRandomnessSeed(), image, cb));
    cq.groupBy(image.get("id"));

    setSeed(findImagesDto.getRandomnessSeed());

    return entityManager.createQuery(cq)
      .setFirstResult(findImagesDto.getSkip())
      .setMaxResults(findImagesDto.getLimit())
      .getResultList();
  }

  @Override
  public Collection<Image> findImagesByFilter(FindImagesDto findImagesDto) {
    CriteriaBuilder cb = entityManager.getCriteriaBuilder();
    CriteriaQuery<Image> cq = cb.createQuery(Image.class);
    Root<Image> image = cq.from(Image.class);

    cq.select(image);
    cq.where(createWhereClause(findImagesDto, image, cb, cq));
    cq.orderBy(createOrder(findImagesDto.getRandomnessSeed(), image, cb));
    cq.groupBy(image.get("id"));

    setSeed(findImagesDto.getRandomnessSeed());

    return entityManager.createQuery(cq)
      .setFirstResult(findImagesDto.getSkip())
      .setMaxResults(findImagesDto.getLimit())
      .getResultList();
  }

  @Override
  public Long countImagesOfGalleryByFilter(Long galleryId, FindImagesDto findImagesDto) {
    CriteriaBuilder cb = entityManager.getCriteriaBuilder();
    CriteriaQuery<Long> cq = cb.createQuery(Long.class);
    Root<Image> image = cq.from(Image.class);

    cq.select(cb.countDistinct(image));
    cq.where(createWhereClause(findImagesDto, galleryId, image, cb, cq));

    return entityManager.createQuery(cq).getSingleResult();
  }

  @Override
  public Long countImagesByFilter(FindImagesDto findImagesDto) {
    CriteriaBuilder cb = entityManager.getCriteriaBuilder();
    CriteriaQuery<Long> cq = cb.createQuery(Long.class);
    Root<Image> image = cq.from(Image.class);

    cq.select(cb.countDistinct(image));
    cq.where(createWhereClause(findImagesDto, image, cb, cq));

    return entityManager.createQuery(cq).getSingleResult();
  }

  private Predicate createWhereClause(FindImagesDto findImagesDto, Long galleryId, Root<Image> image, CriteriaBuilder cb, CriteriaQuery<?> cq) {
    Join<Image, Gallery> gallery = image.join("gallery");
    Predicate galleryPredicate = cb.equal(gallery.get("id"), galleryId);
    Predicate createdAtPredicate = cb.lessThan(image.get("createdAt"), findImagesDto.getStartingDate());

    Predicate filterPredicate = createPredicateWithFilter(findImagesDto.getFilter(), image, gallery, cb, cq);
    return cb.and(galleryPredicate, createdAtPredicate, filterPredicate);
  }

  private Predicate createWhereClause(FindImagesDto findImagesDto, Root<Image> image, CriteriaBuilder cb, CriteriaQuery<?> cq) {
    Join<Image, Gallery> gallery = image.join("gallery", JoinType.LEFT);
    Predicate createdAtPredicate = cb.lessThan(image.get("createdAt"), findImagesDto.getStartingDate());

    Predicate filterPredicate = createPredicateWithFilter(findImagesDto.getFilter(), image, gallery, cb, cq);
    return cb.and(createdAtPredicate, filterPredicate);
  }

  private Predicate createPredicateWithFilter(FilterExpressionDto filter, Root<Image> image, Join<Image, Gallery> gallery, CriteriaBuilder cb, CriteriaQuery<?> cq) {
    if (filter instanceof TagFilterExpressionDto tagFilter) {
      Join<Image, ImageTag> imageTag = image.join("imageTags", JoinType.LEFT);
      Join<ImageTag, Tag> imageTagTag = imageTag.join("tag", JoinType.LEFT);
      Predicate imageHasTag = cb.equal(imageTagTag.get("id"), tagFilter.getTagId());

      Join<Gallery, GalleryTag> galleryTag = gallery.join("galleryTags", JoinType.LEFT);
      Join<GalleryTag, Tag> galleryTagTag = galleryTag.join("tag", JoinType.LEFT);
      Predicate galleryHasTag = cb.equal(galleryTagTag.get("id"), tagFilter.getTagId());
      return cb.or(imageHasTag, galleryHasTag);
    }
    if (filter instanceof NotFilterExpressionDto notFilter) {
      Subquery<Image> subquery = cq.subquery(Image.class);
      Root<Image> subImage = subquery.from(Image.class);
      Join<Image, Gallery> subGallery = subImage.join("gallery", JoinType.LEFT);
      subquery.select(subImage);

      Predicate sameId = cb.equal(subImage.get("id"), image.get("id"));
      Predicate subPredicate = createPredicateWithFilter(notFilter.getExpression(), subImage, subGallery, cb, cq);
      subquery.where(cb.and(sameId, subPredicate));
      return cb.not(cb.exists(subquery));
    }
    if (filter instanceof AndFilterExpressionDto andFilter) {
      Predicate first = createPredicateWithFilter(andFilter.getFirst(), image, gallery, cb, cq);
      Predicate second = createPredicateWithFilter(andFilter.getSecond(), image, gallery, cb, cq);
      return cb.and(first, second);
    }
    if (filter instanceof OrFilterExpressionDto orFilter) {
      Predicate first = createPredicateWithFilter(orFilter.getFirst(), image, gallery, cb, cq);
      Predicate second = createPredicateWithFilter(orFilter.getSecond(), image, gallery, cb, cq);
      return cb.or(first, second);
    }

    return cb.isTrue(cb.literal(true));
  }

  private List<Order> createOrder(BigDecimal seed, Root<Image> image, CriteriaBuilder cb) {
    if (isValidSeed(seed)) {
      Expression<Double> random = cb.function("random", Double.class);
      return Arrays.asList(cb.asc(random), cb.asc(image.get("id")));
    }
    return Arrays.asList(cb.desc(image.get("createdAt")), cb.asc(image.get("id")));
  }

  private void setSeed(BigDecimal seed) {
    if (!isValidSeed(seed)) {
      return;
    }
    String setSeedSql = "select cast(setseed(" + seed + ") as text)";
    Query seedQuery = entityManager.createNativeQuery(setSeedSql);
    seedQuery.getSingleResult();
  }

  private boolean isValidSeed(BigDecimal seed) {
    if (seed == null) {
      return false;
    }
    // seed must be in range [-1,1]
    if (seed.compareTo(BigDecimal.ONE) > 0 || seed.compareTo(BigDecimal.ONE.negate()) < 0) {
      log.warn("Seed {} is out of range [-1,1]", seed);
      return false;
    }
    return true;
  }
}
