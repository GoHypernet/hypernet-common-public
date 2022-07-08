import "reflect-metadata";
import { EOL } from "os";

import { CSVUtils } from "@crypto-utils/CSVUtils";
import { ICSVUtils } from "@crypto-utils/ICSVUtils";

type MockRowType = {
	col1: number;
	col2: string;
};

class CSVUtilsMocks {
	public csvString = ["col1,col2", "1,a", "2,b", "3,c"].join(EOL);

	public invalidCsvString = ["col1,col2", "1,,,a", "2,b", "3,c"].join(EOL);

	public constructor() {}

	public factoryCSVUtils(): ICSVUtils {
		return new CSVUtils();
	}
}

describe("CSV Utils tests", () => {
	test("parse returns a list of all parsed rows when there is no validation", async () => {
		// Arrange
		const mocks = new CSVUtilsMocks();
		const utils = mocks.factoryCSVUtils();
		const parsedRowList: MockRowType[] = [];
		// Act
		const result = await utils.parse(
			mocks.csvString,
			(row: MockRowType) => {
				parsedRowList.push(row);
			},
		);
		// Assert
		expect(result).toBeDefined();
		expect(result.isErr()).toBeFalsy();
		const resultRowList = result._unsafeUnwrap();
		expect(parsedRowList.length).toBe(resultRowList.length);
	});

	test("parse returns a list of valid rows when validation options provided", async () => {
		// Arrange
		const mocks = new CSVUtilsMocks();
		const utils = mocks.factoryCSVUtils();
		const invalidRowList: MockRowType[] = [];
		// Act
		const result = await utils.parse(mocks.csvString, null, {
			validateRow: (row: MockRowType) => {
				return row.col1 > 2;
			},
			onRowInvalid: (invalidRow: MockRowType) => {
				invalidRowList.push(invalidRow);
			},
		});
		// Assert
		expect(result).toBeDefined();
		expect(result.isErr()).toBeFalsy();
		const parsedRowList = result._unsafeUnwrap();
		expect(parsedRowList.length).toBe(1);
		expect(invalidRowList.length).toBe(2);
	});

	test("parse returns error when an invalid csv string passed", async () => {
		// Arrange
		const mocks = new CSVUtilsMocks();
		const utils = mocks.factoryCSVUtils();
		// Act
		const result = await utils.parse(mocks.invalidCsvString);
		// Assert
		expect(result).toBeDefined();
		expect(result.isErr()).toBe(true);
	});
});
