package com.kokogino.ogm.exception;

import org.springframework.http.HttpStatus;

public class ErrorMapUtils {

  private ErrorMapUtils() {
  }

  public static HttpStatus getResponseStatusCodeForException(String errorCode) {
    if (errorCode.startsWith("45")) {
      return HttpStatus.FORBIDDEN;
    }
    if (errorCode.startsWith("65")) {
      return HttpStatus.NOT_FOUND;
    }
    if (errorCode.startsWith("4") || errorCode.startsWith("6") || errorCode.startsWith("8")) {
      return HttpStatus.BAD_REQUEST;
    }
    if (errorCode.startsWith("2") || errorCode.startsWith("3") || errorCode.startsWith("7") || errorCode.startsWith("5")) {
      return HttpStatus.INTERNAL_SERVER_ERROR;
    }
    if (errorCode.startsWith("1")) {
      return HttpStatus.NOT_IMPLEMENTED;
    }
    return HttpStatus.INTERNAL_SERVER_ERROR;
  }
}
