import { CSVParseError } from "@csv-utils/CSVParseError";
import { ResultAsync } from "neverthrow";

export interface ICSVRowValidationOptions<T> {
	validateRow: (row: T) => boolean;
	onRowInvalid: (row: T) => void;
}

export interface ICSVUtils {
	/**
	 * This method is used to parse a CSV based on a given csvContent as a string
	 * and returns a list of parsed rows as type
	 * @typeParam T: Each row will be converted to an object in given type.

	 * @param csvContent CSV content as a string.
	 * @param onRowParsed This function will be triggered for each line.
	 * @param validationOptions validatRow will be triggered for each row and if the row is invalid, onRowInvalid gets called.
	 * @returns Array of parsed rows in given type.
	 */
	parse<T>(
		csvContent: string,
		onRowParsed?: ((row: T) => void) | null,
		validationOptions?: ICSVRowValidationOptions<T>,
	): ResultAsync<T[], CSVParseError>;
}

export const ICSVUtilsType = Symbol.for("ICSVUtils");
