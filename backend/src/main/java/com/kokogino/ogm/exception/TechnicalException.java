package com.kokogino.ogm.exception;

public class TechnicalException extends ReasonBasedException {
  public TechnicalException(String message, TechnicalReason reason, Throwable cause) {
    super(message, reason, cause);
  }

  public TechnicalException(String message, TechnicalReason reason) {
    super(message, reason);
  }
}
