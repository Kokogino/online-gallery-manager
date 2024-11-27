package com.kokogino.ogm.business.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import com.kokogino.ogm.backend.genapi.business.dto.CreateTagDto;
import com.kokogino.ogm.backend.genapi.business.dto.TagResponse;
import com.kokogino.ogm.backend.genapi.business.dto.UpdateTagDto;
import com.kokogino.ogm.business.repository.CollectionRepository;
import com.kokogino.ogm.business.repository.TagRepository;
import com.kokogino.ogm.datamodel.entity.OGMCollection;
import com.kokogino.ogm.datamodel.entity.Tag;
import com.kokogino.ogm.exception.BusinessException;
import com.kokogino.ogm.exception.BusinessReason;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class TagService {
  private final TagRepository tagRepository;
  private final CollectionRepository collectionRepository;

  public TagResponse createTag(CreateTagDto createTagDto) {
    if (tagRepository.existsByName(createTagDto.getName())) {
      throw new BusinessException(String.format("Tag with name '%s' already exists", createTagDto.getName()), BusinessReason.ERROR_TAG_NAME_NOT_UNIQUE);
    }
    OGMCollection collection = collectionRepository.findById(createTagDto.getCollectionId())
      .orElseThrow(() -> new BusinessException(String.format("Collection with id '%s' does not exist", createTagDto.getCollectionId()), BusinessReason.ERROR_COLLECTION_NOT_EXISTENT));

    Tag tag = new Tag();
    tag.setCollection(collection);
    tag.setName(createTagDto.getName());
    tag.setShowTag(createTagDto.getShowTag());
    return entityToResponse(tagRepository.save(tag));
  }

  public void deleteTagById(Long id) {
    Tag tag = tagRepository.findById(id)
      .orElseThrow(() -> new BusinessException(String.format("Tag with id '%s' does not exist", id), BusinessReason.ERROR_TAG_NOT_EXISTENT));
    tag.setDeletedAt(LocalDateTime.now());
    tagRepository.save(tag);
  }

  public List<TagResponse> getAllTags(Long collectionId) {
    return tagRepository.findAllByCollectionIdAndDeletedAtIsNull(collectionId, Sort.by(new Sort.Order(Sort.Direction.ASC, "name")))
      .stream()
      .map(TagService::entityToResponse)
      .toList();
  }

  public TagResponse updateTag(Long id, UpdateTagDto updateTagDto) {
    Tag tag = tagRepository.findById(id)
      .orElseThrow(() -> new BusinessException(String.format("Tag with id '%s' does not exist", id), BusinessReason.ERROR_TAG_NOT_EXISTENT));
    Optional<Tag> tagWithSameName = tagRepository.findByName(updateTagDto.getName());
    if (tagWithSameName.isPresent() && !tagWithSameName.get().equals(tag)) {
      throw new BusinessException(String.format("Tag with name '%s' already exists", updateTagDto.getName()), BusinessReason.ERROR_TAG_NAME_NOT_UNIQUE);
    }
    tag.setName(updateTagDto.getName());
    tag.setShowTag(updateTagDto.getShowTag());
    return entityToResponse(tagRepository.save(tag));
  }

  @PostConstruct
  public void cleanUpDeletedTags() {
    tagRepository.deleteByDeletedAtIsNotNull();
  }

  private static TagResponse entityToResponse(Tag tag) {
    return new TagResponse().id(tag.getId()).name(tag.getName()).showTag(tag.getShowTag());
  }
}
