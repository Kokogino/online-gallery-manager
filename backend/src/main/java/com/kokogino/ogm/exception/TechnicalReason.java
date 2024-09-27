package com.kokogino.ogm.exception;

public enum TechnicalReason implements Reason {

  // Exception for "something did not work". Like DB not available or out of memory.
  ERROR_TECHNICAL("res.error.technical", 1),
  ERROR_CONNECTIVITY("res.error.connectivity", 2);

  private final String reason;

  private final int errorCode;

  TechnicalReason(String reason, int errorCode) {
    this.reason = reason;
    this.errorCode = errorCode;
  }

  @Override
  public String getReason() {
    return reason;
  }

  @Override
  public int getErrorCode() {
    return errorCode;
  }

  @Override
  public String toString() {
    return this.getClass().getSimpleName() + "[errorCode=" +
      getErrorCode() +
      ",reason=" +
      getReason() +
      "]";
  }
}
