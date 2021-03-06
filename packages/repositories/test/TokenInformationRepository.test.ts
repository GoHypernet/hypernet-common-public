import { INonFungibleRegistryEnumerableUpgradeableContract } from "@hypernetlabs/governance-sdk";
import { NonFungibleRegistryContractError } from "@hypernetlabs/objects";
import { ILogUtils } from "@hypernetlabs/utils";
import {
	TokenInformationRepository,
	ITokenInformationRepository,
	INonFungibleRegistryContractFactory,
} from "@hypernetlabs/common-repositories";
import {
	tokenRegistryAddress,
	tokenRegistryId1,
	tokenRegistryId2,
	tokenRegistryEntry1,
	tokenRegistryEntry2,
	hyperTokenAddress,
	chainId,
} from "@mock/mocks";
import { okAsync, errAsync } from "neverthrow";
import td from "testdouble";

import { ContextProviderMock } from "@mock/utils";

// eslint-disable-next-line @typescript-eslint/no-var-requires
require("testdouble-jest")(td, jest);

class TokenInformationRepositoryMocks {
	public contractFactory = td.object<INonFungibleRegistryContractFactory>();
	public contextProviderMock = new ContextProviderMock();
	public logUtils = td.object<ILogUtils>();
	public contract =
		td.object<INonFungibleRegistryEnumerableUpgradeableContract>();

	constructor() {
		td.when(
			this.contractFactory.factoryNonFungibleRegistryEnumerableUpgradeableContract(
				this.contextProviderMock.context.governanceChainInformation
					.tokenRegistryAddress,
			),
		).thenReturn(okAsync(this.contract));

		td.when(this.contract.totalSupply()).thenReturn(okAsync(2));

		td.when(this.contract.tokenByIndex(0)).thenReturn(
			okAsync(tokenRegistryId1),
		);

		td.when(this.contract.tokenByIndex(1)).thenReturn(
			okAsync(tokenRegistryId2),
		);

		td.when(
			this.contract.getRegistryEntryByTokenId(tokenRegistryId1),
		).thenReturn(okAsync(tokenRegistryEntry1));

		td.when(
			this.contract.getRegistryEntryByTokenId(tokenRegistryId2),
		).thenReturn(okAsync(tokenRegistryEntry2));
	}

	public factoryTokenInformationRepository(): ITokenInformationRepository {
		return new TokenInformationRepository(
			this.contractFactory,
			this.logUtils,
		);
	}
}

describe("TokenInformationRepository tests", () => {
	test("initialize() returns without errors", async () => {
		// Arrange
		const mocks = new TokenInformationRepositoryMocks();
		const repo = mocks.factoryTokenInformationRepository();

		console.log(
			"ssss",
			mocks.contextProviderMock.context.governanceChainInformation
				.tokenRegistryAddress,
		);
		// Act
		const result = await repo.initialize(
			mocks.contextProviderMock.context.governanceChainInformation
				.tokenRegistryAddress,
		);

		// Assert
		expect(result).toBeDefined();
		expect(result.isErr()).toBeFalsy();
	});

	test("initialize() returns NonFungibleRegistryContractError when totalSupply() fails", async () => {
		// Arrange
		const mocks = new TokenInformationRepositoryMocks();

		const srcError = new NonFungibleRegistryContractError();
		td.when(mocks.contract.totalSupply()).thenReturn(errAsync(srcError));

		const repo = mocks.factoryTokenInformationRepository();

		// Act
		const result = await repo.initialize(
			mocks.contextProviderMock.context.governanceChainInformation
				.tokenRegistryAddress,
		);

		// Assert
		expect(result).toBeDefined();
		expect(result.isErr()).toBeTruthy();
		const error = result._unsafeUnwrapErr();
		expect(error).toBe(srcError);
	});

	test("initialize() returns NonFungibleRegistryContractError when tokenByIndex() fails", async () => {
		// Arrange
		const mocks = new TokenInformationRepositoryMocks();

		const srcError = new NonFungibleRegistryContractError();
		td.when(mocks.contract.tokenByIndex(1)).thenReturn(errAsync(srcError));

		const repo = mocks.factoryTokenInformationRepository();

		// Act
		const result = await repo.initialize(
			mocks.contextProviderMock.context.governanceChainInformation
				.tokenRegistryAddress,
		);

		// Assert
		expect(result).toBeDefined();
		expect(result.isErr()).toBeTruthy();
		const error = result._unsafeUnwrapErr();
		expect(error).toBe(srcError);
	});

	test("initialize() returns NonFungibleRegistryContractError when getRegistryEntryByTokenId() fails", async () => {
		// Arrange
		const mocks = new TokenInformationRepositoryMocks();

		const srcError = new NonFungibleRegistryContractError();
		td.when(
			mocks.contract.getRegistryEntryByTokenId(tokenRegistryId1),
		).thenReturn(errAsync(srcError));

		const repo = mocks.factoryTokenInformationRepository();

		// Act
		const result = await repo.initialize(
			mocks.contextProviderMock.context.governanceChainInformation
				.tokenRegistryAddress,
		);

		// Assert
		expect(result).toBeDefined();
		expect(result.isErr()).toBeTruthy();
		const error = result._unsafeUnwrapErr();
		expect(error).toBe(srcError);
	});

	test("getTokenInformation() returns without errors", async () => {
		// Arrange
		const mocks = new TokenInformationRepositoryMocks();
		const repo = mocks.factoryTokenInformationRepository();

		// Act
		const result = await repo
			.initialize(
				mocks.contextProviderMock.context.governanceChainInformation
					.tokenRegistryAddress,
			)
			.andThen(() => {
				return repo.getTokenInformation();
			});

		// Assert
		expect(result).toBeDefined();
		expect(result.isErr()).toBeFalsy();
		const chainInformation = result._unsafeUnwrap();

		expect(chainInformation.length).toBe(2);
	});

	test("getTokenInformationForChain() returns without errors", async () => {
		// Arrange
		const mocks = new TokenInformationRepositoryMocks();
		const repo = mocks.factoryTokenInformationRepository();

		// Act
		const result = await repo
			.initialize(
				mocks.contextProviderMock.context.governanceChainInformation
					.tokenRegistryAddress,
			)
			.andThen(() => {
				return repo.getTokenInformationForChain(chainId);
			});

		// Assert
		expect(result).toBeDefined();
		expect(result.isErr()).toBeFalsy();
		const chainInformation = result._unsafeUnwrap();

		expect(chainInformation.length).toBe(2);
	});

	test("getTokenInformationByAddress() returns without errors", async () => {
		// Arrange
		const mocks = new TokenInformationRepositoryMocks();
		const repo = mocks.factoryTokenInformationRepository();

		// Act
		const result = await repo
			.initialize(
				mocks.contextProviderMock.context.governanceChainInformation
					.tokenRegistryAddress,
			)
			.andThen(() => {
				return repo.getTokenInformationByAddress(hyperTokenAddress);
			});

		// Assert
		expect(result).toBeDefined();
		expect(result.isErr()).toBeFalsy();
		const chainInformation = result._unsafeUnwrap();

		expect(chainInformation?.address).toBe(hyperTokenAddress);
	});
});
