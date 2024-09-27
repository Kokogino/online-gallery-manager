package com.kokogino.ogm.exception;

import java.io.Serializable;

public interface Reason extends Serializable {

  /**
   * returns the reason (like "res.error.impl") which is describes which entry in a message-file to display the user.
   *
   * @return the reason.
   */
  String getReason();

  /**
   * describes the type of error that occurred. This code is used to decide how to handle the error, how the flow is supposed
   * to work.
   *
   * @return the error-code
   */
  int getErrorCode();
}
