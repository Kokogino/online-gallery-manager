package com.kokogino.ogm.exception;

public enum BusinessReason implements Reason {

	// general Exception when you can not find a better one
	ERROR_IMPLEMENTATION("res.error.impl", 1000),

	// use this reason if you got into troubles because of bad input from anywhere
	ERROR_INPUT_VALIDATION_FAILED("res.error.input.validation.failed", 6000),
	ERROR_INPUT_REQUIRED("res.error.input.required", 6001),
	ERROR_TAG_NAME_NOT_UNIQUE("res.error.tag.name.not.unique", 6002),
	ERROR_GALLERY_METADATA_NAME_NOT_UNIQUE("res.error.gallery.metadata.name.not.unique", 6003),

	// these reasons are special cases where the bad input is an identifier for a resource which can not be found by the system
	ERROR_TAG_NOT_EXISTENT("res.error.tag.not.existent", 6500),
	ERROR_GALLERY_METADATA_NOT_EXISTENT("res.error.gallery.metadata.not.existent", 6501),
	ERROR_GALLERY_NOT_EXISTENT("res.error.gallery.not.existent", 6502),
	ERROR_IMAGE_NOT_EXISTENT("res.error.image.not.existent", 6503);

	private final String reason;

	private final int errorCode;

	BusinessReason(String reason, int errorCode) {
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
