package com.kokogino.ogm.exception;

import com.fasterxml.jackson.databind.exc.InvalidFormatException;
import com.kokogino.ogm.backend.genapi.business.dto.ReasonBasedExceptionDto;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@Slf4j
@RestControllerAdvice
@ApiResponses( value = {
		@ApiResponse( responseCode = "400", description = "Client Error",
				content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE,
						schema = @Schema(implementation = ReasonBasedExceptionDto.class))),
		@ApiResponse( responseCode = "403", description = "Request refused",
				content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE,
						schema = @Schema(implementation = ReasonBasedExceptionDto.class))),
		@ApiResponse( responseCode = "404", description = "Resource not found",
				content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE,
						schema = @Schema(implementation = ReasonBasedExceptionDto.class))),
		@ApiResponse( responseCode = "500", description = "Server Error",
				content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE,
						schema = @Schema(implementation = ReasonBasedExceptionDto.class))),
		@ApiResponse( responseCode = "501", description = "Implementation Error",
				content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE,
						schema = @Schema(implementation = ReasonBasedExceptionDto.class)))})
public class ErrorHandler {

	@ExceptionHandler(value = { TechnicalException.class})
	public ResponseEntity<ReasonBasedExceptionDto> handleTechnicalException(TechnicalException e) {
		ReasonBasedExceptionDto dto = new ReasonBasedExceptionDto();
		dto.setErrorCode(e.getErrorCode());
		dto.setReason(e.getReason().getReason());
		dto.setMessage(e.getMessage());
		return new ResponseEntity<>(dto, HttpStatus.INTERNAL_SERVER_ERROR);
	}

	@ExceptionHandler(value = { BusinessException.class})
	public ResponseEntity<ReasonBasedExceptionDto> handleBusinessException(BusinessException e) {
		ReasonBasedExceptionDto dto = new ReasonBasedExceptionDto();
		dto.setErrorCode(e.getErrorCode());
		dto.setReason(e.getReason().getReason());
		dto.setMessage(e.getMessage());
		return generateResponseForBusinessException(dto);
	}

	@ExceptionHandler(value = { MethodArgumentNotValidException.class})
	public ResponseEntity<ReasonBasedExceptionDto> dtoValidationFailed(MethodArgumentNotValidException e) {
		ReasonBasedExceptionDto dto = new ReasonBasedExceptionDto();
		Reason reason = BusinessReason.ERROR_INPUT_VALIDATION_FAILED;
		dto.setErrorCode(reason.getErrorCode());
		dto.setReason(reason.getReason());

		// Consider only the first failure (even if there are multiple)
		FieldError fieldError = e.getBindingResult().getFieldError();
		assert fieldError != null;
		dto.setMessage(String.format("Field '%s' %s", fieldError.getField(), fieldError.getDefaultMessage()));
		return new ResponseEntity<>(dto, HttpStatus.BAD_REQUEST);
	}

	@ExceptionHandler(value = { HttpMessageNotReadableException.class})
	public ResponseEntity<ReasonBasedExceptionDto> dtoEnumValidationFailed(HttpMessageNotReadableException e) {
		ReasonBasedExceptionDto dto = new ReasonBasedExceptionDto();
		Reason reason = BusinessReason.ERROR_INPUT_VALIDATION_FAILED;
		dto.setErrorCode(reason.getErrorCode());
		dto.setReason(reason.getReason());

		if (e.getCause() instanceof InvalidFormatException formatException){
			dto.setMessage(String.format("Value '%s' is not valid for field %s", formatException.getValue(),
					formatException.getPath().getFirst().getFieldName()));
		}
		else {
			log.error("Received invalid request. Underlying exception is: {}", e.getMessage(), e);
			dto.setMessage("Invalid request. See log for details.");
		}
		return new ResponseEntity<>(dto, HttpStatus.BAD_REQUEST);
	}

  private static ResponseEntity<ReasonBasedExceptionDto> generateResponseForBusinessException(ReasonBasedExceptionDto dto) {
    String errorCode = dto.getErrorCode().toString();
    return new ResponseEntity<>(dto, ErrorMapUtils.getResponseStatusCodeForException(errorCode));
  }
}
