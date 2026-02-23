export default class HttpError extends Error {
    constructor(message, status = 500) {
        super(message);
        this.name = 'HttpError';
        this.status = status;
        if (Error.captureStackTrace) Error.captureStackTrace(this, HttpError);
    }
}
