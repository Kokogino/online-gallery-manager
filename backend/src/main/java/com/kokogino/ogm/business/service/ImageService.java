package com.kokogino.ogm.business.service;

import java.util.*;

import com.kokogino.ogm.backend.genapi.business.dto.*;
import com.kokogino.ogm.business.repository.GalleryRepository;
import com.kokogino.ogm.business.repository.ImageRepository;
import com.kokogino.ogm.business.repository.ImageTagRepository;
import com.kokogino.ogm.business.repository.TagRepository;
import com.kokogino.ogm.business.util.BBCodeImage;
import com.kokogino.ogm.business.util.BBCodeInterpreter;
import com.kokogino.ogm.datamodel.entity.Gallery;
import com.kokogino.ogm.datamodel.entity.Image;
import com.kokogino.ogm.datamodel.entity.ImageTag;
import com.kokogino.ogm.datamodel.entity.Tag;
import com.kokogino.ogm.exception.BusinessException;
import com.kokogino.ogm.exception.BusinessReason;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ImageService {
  private final ImageRepository imageRepository;
  private final GalleryRepository galleryRepository;
  private final ImageTagRepository imageTagRepository;
  private final TagRepository tagRepository;

  public List<ImageResponse> createImages(CreateImagesDto createImagesDto) {
    Gallery gallery = null;
    switch (createImagesDto.getGalleryChoice()) {
      case ADD_TO_GALLERY -> gallery = galleryRepository.findById(createImagesDto.getGalleryId())
        .orElseThrow(() -> new BusinessException(String.format("Gallery with id '%s' does not exist", createImagesDto.getGalleryId()), BusinessReason.ERROR_GALLERY_NOT_EXISTENT));
      case NEW_GALLERY -> {
        gallery = new Gallery();
        gallery.setName(createImagesDto.getNewGalleryName());
        gallery.setEditUrl(createImagesDto.getEditUrl());
        gallery.setHost(createImagesDto.getHost());
        gallery.setImages(new HashSet<>());
        galleryRepository.save(gallery);
      }
    }

    List<Image> images = new ArrayList<>();
    List<BBCodeImage> bbCodeImages = BBCodeInterpreter.extractImages(createImagesDto.getBbCode());
    for (BBCodeImage bbCodeImage : bbCodeImages) {
      Image image = new Image();
      image.setThumbnailUrl(bbCodeImage.getThumbnailUrl());
      image.setImageUrl(bbCodeImage.getImageUrl());
      image.setEditUrl(createImagesDto.getEditUrl());
      image.setHost(createImagesDto.getHost());
      image.setGallery(gallery);
      image.setImageTags(new HashSet<>());
      if (gallery != null) {
        gallery.getImages().add(image);
      }
      images.add(image);
    }

    imageRepository.saveAll(images);

    return images.stream().map(ImageService::imageToResponse).toList();
  }

  public void deleteImageById(Long id) {
    if (!imageRepository.existsById(id)) {
      throw new BusinessException(String.format("Image with id '%s' does not exist", id), BusinessReason.ERROR_IMAGE_NOT_EXISTENT);
    }
    imageRepository.deleteById(id);
  }

  public FindImagesResponse findImages(FindImagesDto findImagesDto) {
    Collection<Image> images = imageRepository.findImagesByFilter(findImagesDto);
    Long totalCount = imageRepository.countImagesByFilter(findImagesDto.getFilter());

    FindImagesResponse response = new FindImagesResponse();
    response.setImages(images.stream().map(ImageService::imageToResponse).toList());
    response.setTotalCount(totalCount);
    return response;
  }

  public ImageResponse getImageById(Long id) {
    return imageRepository.findById(id)
      .map(ImageService::imageToResponse)
      .orElseThrow(() -> new BusinessException(String.format("Image with id '%s' does not exist", id), BusinessReason.ERROR_IMAGE_NOT_EXISTENT));
  }

  public ImageResponse updateImage(Long id, UpdateImageDto updateImageDto) {
    Image image = imageRepository.findById(id)
      .orElseThrow(() -> new BusinessException(String.format("Image with id '%s' does not exist", id), BusinessReason.ERROR_IMAGE_NOT_EXISTENT));
    Gallery gallery = null;
    if (updateImageDto.getGalleryId() != null) {
      gallery = galleryRepository.findById(updateImageDto.getGalleryId())
        .orElseThrow(() -> new BusinessException(String.format("Gallery with id '%s' does not exist", updateImageDto.getGalleryId()), BusinessReason.ERROR_GALLERY_NOT_EXISTENT));
    }
    image.setGallery(gallery);
    image.setImageTags(upsertImageTags(image, updateImageDto.getTagIds()));

    return imageToResponse(imageRepository.save(image));
  }

  private Set<ImageTag> upsertImageTags(Image image, Collection<Long> tagIds) {
    imageTagRepository.deleteByImageAndTagIdNotIn(image, tagIds);

    Set<ImageTag> imageTags = new HashSet<>();
    for (Long tagId : tagIds) {
      Tag tag = tagRepository.findById(tagId)
        .orElseThrow(() -> new BusinessException(String.format("Tag with id '%s' does not exist", tagId), BusinessReason.ERROR_TAG_NOT_EXISTENT));
      Optional<ImageTag> imageTag = imageTagRepository.findByImageAndTag(image, tag);
      if (imageTag.isPresent()) {
        imageTags.add(imageTag.get());
      } else {
        ImageTag newImageTag = new ImageTag();
        newImageTag.setImage(image);
        newImageTag.setTag(tag);
        imageTags.add(imageTagRepository.save(newImageTag));
      }
    }
    return imageTags;
  }

  public static String createPureImageUrl(Image image) {
    switch (image.getHost()) {
      case IMGBOX -> {
        return image.getThumbnailUrl().replace("thumbs2", "images2").replace("_t.", "_o.");
      }
    }
    return null;
  }

  public static ImageResponse imageToResponse(Image image) {
    return new ImageResponse()
      .id(image.getId())
      .galleryId(Optional.ofNullable(image.getGallery()).map(Gallery::getId).orElse(null))
      .thumbnailUrl(image.getThumbnailUrl())
      .pureImageUrl(createPureImageUrl(image))
      .imageUrl(image.getImageUrl())
      .host(image.getHost())
      .editUrl(image.getEditUrl())
      .tags(image.getImageTags().stream().map(ImageService::imageTagToResponse).toList());
  }

  public static ImageTagResponse imageTagToResponse(ImageTag imageTag) {
    Tag tag = imageTag.getTag();
    return new ImageTagResponse()
      .id(imageTag.getId())
      .tagId(tag.getId())
      .name(tag.getName())
      .showTag(tag.getShowTag());
  }
}
