package com.kokogino.ogm.business.controller;

import java.util.List;

import com.kokogino.ogm.backend.genapi.business.controller.TagApi;
import com.kokogino.ogm.backend.genapi.business.dto.CreateTagDto;
import com.kokogino.ogm.backend.genapi.business.dto.TagResponse;
import com.kokogino.ogm.backend.genapi.business.dto.UpdateTagDto;
import com.kokogino.ogm.business.service.TagService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class TagController implements TagApi {
  private final TagService tagService;

  @Override
  public ResponseEntity<TagResponse> createTag(CreateTagDto createTagDto) {
    return new ResponseEntity<>(tagService.createTag(createTagDto), HttpStatus.CREATED);
  }

  @Override
  public ResponseEntity<Void> deleteTagById(Long id) {
    tagService.deleteTagById(id);
    return ResponseEntity.noContent().build();
  }

  @Override
  public ResponseEntity<List<TagResponse>> getAllTags(Long collectionId) {
    return ResponseEntity.ok(tagService.getAllTags(collectionId));
  }

  @Override
  public ResponseEntity<TagResponse> updateTag(Long id, UpdateTagDto updateTagDto) {
    return ResponseEntity.ok(tagService.updateTag(id, updateTagDto));
  }
}
