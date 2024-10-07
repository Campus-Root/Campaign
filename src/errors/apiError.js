/**
 * Represents an API error that can be handled.
 * @param {string} message - corresponding error message.
 * @param {number} statusCode - corresponding http status code.
 */
export class APIError extends Error {
  constructor(message, statusCode, data) {
    super(message);
    this.statusCode = statusCode;
    this.success = false;
    this.data = data
  }
}

/** Generates a custom api error with given message and status code. */
export const generateAPIError = (msg, statusCode, data) => new APIError(msg, statusCode, data)

