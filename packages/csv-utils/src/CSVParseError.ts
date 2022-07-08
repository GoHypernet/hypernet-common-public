export class CSVParseError extends Error {
	constructor(message?: string, public src?: unknown) {
		super(message);
	}
}
