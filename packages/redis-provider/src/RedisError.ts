export class RedisError extends Error {
	constructor(message?: string, public src?: unknown) {
		super(message);
	}
}
