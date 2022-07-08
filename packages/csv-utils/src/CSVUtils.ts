import { ICSVUtils, ICSVRowValidationOptions } from "@csv-utils/ICSVUtils";
import { CSVParseError } from "@csv-utils/CSVParseError";

import { parse } from "@fast-csv/parse";
import { injectable } from "inversify";
import { ResultAsync } from "neverthrow";
import { Readable } from "stream";

@injectable()
export class CSVUtils implements ICSVUtils {
	constructor() {}

	public parse<T>(
		csvContent: string,
		onRowParsed?: ((row: T) => void) | null,
		validationOptions?: ICSVRowValidationOptions<T>,
	): ResultAsync<T[], CSVParseError> {
		return ResultAsync.fromPromise(
			new Promise<T[]>((resolve, reject) => {
				const csv = Readable.from(csvContent);
				const parsedRowList: T[] = [];
				csv.pipe(
					parse<T, T>({ headers: true })
						.validate((row, rowValidateCallback) => {
							const isValid =
								validationOptions != null
									? validationOptions.validateRow(row)
									: true;

							setImmediate(() =>
								rowValidateCallback(null, isValid),
							);
						})
						.on("error", (error) => {
							reject(error);
						})
						.on("data", (row: T) => {
							parsedRowList.push(row);
							onRowParsed?.(row);
						})
						.on("data-invalid", (row: T) => {
							validationOptions?.onRowInvalid(row);
						})
						.on("end", () => {
							resolve(parsedRowList);
						}),
				);
			}),
			(e) => {
				return new CSVParseError("Failed to parse CSV", e);
			},
		);
	}
}
