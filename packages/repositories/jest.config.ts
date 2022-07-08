import type { Config } from "@jest/types";
import { pathsToModuleNameMapper } from "ts-jest/utils";

// In the following statement, replace `./tsconfig` with the path to your `tsconfig` file
// which contains the path mapping (ie the `compilerOptions.paths` option):
import { compilerOptions } from "../../tsconfig.build.json";

const moduleNames = pathsToModuleNameMapper(compilerOptions.paths, {
	prefix: "<rootDir>/src",
});

const config: Config.InitialOptions = {
	preset: "ts-jest",
	testEnvironment: "node",
	// Ignore lib folder, use this or root property include paths but not both https://medium.com/swlh/jest-with-typescript-446ea996cc68
	modulePathIgnorePatterns: ["<rootDir>/dist/"],
	moduleNameMapper: moduleNames,
	globals: {
		"ts-jest": {
			tsconfig: "test/tsconfig.json",
		},
		window: {},
	},
};

export default config;
