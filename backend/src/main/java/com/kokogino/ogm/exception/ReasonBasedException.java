package com.kokogino.ogm.exception;

import java.util.UUID;

import lombok.Getter;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Getter
public abstract class ReasonBasedException extends RuntimeException {

	// generated unique ID to identify the exception
	private final String id;

	private final Reason reason;

	protected ReasonBasedException(String message, Reason reason, Throwable cause) {
		super(message, cause);
		this.reason = reason;
		if (cause instanceof ReasonBasedException reasonBasedException) {
			id = reasonBasedException.getId();
		}
		else {
			id = generateErrorId();
			log.info("caused by:", cause);
		}
	}

	protected ReasonBasedException(String message, Reason reason) {
		super(message);
		this.reason = reason;
		id = generateErrorId();
	}

	public int getErrorCode() {
		return reason.getErrorCode();
	}

	/**
	 * Creates information where this exception was thrown.
	 */
	private static String whereAmI() {
		int maxDepth = 6;
		StackTraceElement[] stack = Thread.currentThread().getStackTrace();
		StringBuilder msg = new StringBuilder();
		int depth = Math.min(stack.length, maxDepth);
		for (int currentDepth = 0; currentDepth < depth; currentDepth++) {
			StackTraceElement currentStack = stack[currentDepth];
			String fileName = currentStack.getFileName();

			if (fileName == null) {
				fileName = "Unknown Source";
			}
			else {
				fileName += ":" + currentStack.getLineNumber();
			}

			msg.append(currentStack.getClassName()).append(".").append(currentStack.getMethodName()).append("(").append(fileName)
					.append(") ");
		}

		return msg.toString();
	}

	/**
	 * Generates a new errorId and logs it (and the place it was created) to the logfile
	 *
	 * @return the errorId
	 */
	private String generateErrorId() {
		String tid = UUID.randomUUID().toString();
		String stackTrace = whereAmI();

		String stringForIdGeneration = toStringForIdGeneration(tid);
		log.info(stringForIdGeneration);
		log.info("at {}", stackTrace);

		return tid;
	}

	@Override
	public String toString() {
    return this.getClass().getSimpleName() + "[id=" +
      getId() +
      ",reason=" +
      getReason() +
      ",message=" +
      getMessage() +
      "]";
	}

	/**
	 * this toString like method lets us pass the tid instead of reading from the member-variable.
	 * At the time this method is called, id has not yet been assigned. As it is only possible to assign id (because
	 * it is declared final) in static{}-block or a constructor, this little workaround is necessary.
	 */
	private String toStringForIdGeneration(String tid) {
    return this.getClass().getSimpleName() + "[id=" +
      tid +
      ",reason=" +
      getReason() +
      ",message=" +
      getMessage() +
      "]";
	}
}
