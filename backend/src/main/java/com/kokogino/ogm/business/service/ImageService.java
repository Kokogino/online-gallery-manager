package com.kokogino.ogm.business.service;

import com.kokogino.ogm.backend.genapi.business.dto.ImageResponse;
import com.kokogino.ogm.backend.genapi.business.dto.ImageTagResponse;
import com.kokogino.ogm.datamodel.entity.Image;
import com.kokogino.ogm.datamodel.entity.ImageTag;
import com.kokogino.ogm.datamodel.entity.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ImageService {

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
      .galleryId(image.getGallery().getId())
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
