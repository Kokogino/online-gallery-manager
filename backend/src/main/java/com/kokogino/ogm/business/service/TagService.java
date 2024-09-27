package com.kokogino.ogm.business.service;

import java.util.List;
import java.util.Optional;

import com.kokogino.ogm.backend.genapi.business.dto.CreateTagDto;
import com.kokogino.ogm.backend.genapi.business.dto.TagResponse;
import com.kokogino.ogm.backend.genapi.business.dto.UpdateTagDto;
import com.kokogino.ogm.business.repository.TagRepository;
import com.kokogino.ogm.datamodel.entity.Tag;
import com.kokogino.ogm.exception.BusinessException;
import com.kokogino.ogm.exception.BusinessReason;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class TagService {
  private final TagRepository tagRepository;

  public TagResponse createTag(CreateTagDto createTagDto) {
    if (tagRepository.existsByName(createTagDto.getName())) {
      throw new BusinessException(String.format("Tag with name '%s' already exists", createTagDto.getName()), BusinessReason.ERROR_TAG_NAME_NOT_UNIQUE);
    }
    Tag tag = new Tag();
    tag.setName(createTagDto.getName());
    tag.setShowTag(createTagDto.getShowTag());
    return entityToResponse(tagRepository.save(tag));
  }

  public void deleteTagById(Long id) {
    if (!tagRepository.existsById(id)) {
      throw new BusinessException(String.format("Tag with id '%s' does not exist", id), BusinessReason.ERROR_TAG_NOT_EXISTENT);
    }
    tagRepository.deleteById(id);
  }

  public List<TagResponse> getAllTags() {
    return tagRepository.findAll().stream().map(TagService::entityToResponse).toList();
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

  private static TagResponse entityToResponse(Tag tag) {
    return new TagResponse().id(tag.getId()).name(tag.getName()).showTag(tag.getShowTag());
  }
}
