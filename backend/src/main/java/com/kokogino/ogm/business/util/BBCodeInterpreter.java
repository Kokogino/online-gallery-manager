package com.kokogino.ogm.business.util;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class BBCodeInterpreter {
  private static final String thumbnailUrlGroup = "thumbnailUrl";
  private static final String imageUrlGroup = "imageUrl";
  private static final Pattern imagesPattern = Pattern.compile(
    "\\[url=(?<" + imageUrlGroup + ">.+?)].*?\\[img](?<" + thumbnailUrlGroup + ">.+?)\\[/img].*?\\[/url]",
    Pattern.CASE_INSENSITIVE | Pattern.DOTALL
  );

  private BBCodeInterpreter() {
  }

  public static List<BBCodeImage> extractImages(String bbCode) {
    List<BBCodeImage> images = new ArrayList<>();

    Matcher matcher = imagesPattern.matcher(bbCode);
    while (matcher.find()) {
      String thumbnailUrl = matcher.group(thumbnailUrlGroup);
      String imageUrl = matcher.group(imageUrlGroup);
      images.add(new BBCodeImage(thumbnailUrl, imageUrl));
    }

    return images;
  }
}
