package com.kokogino.ogm.exception;

public class BusinessException extends ReasonBasedException {
  public BusinessException(String message, BusinessReason reason, Throwable cause) {
    super(message, reason, cause);
  }

  public BusinessException(String message, BusinessReason reason) {
    super(message, reason);
  }
}
