import {
	ChainId,
	EthereumContractAddress,
	NonFungibleRegistryContractError,
	TokenInformation,
} from "@hypernetlabs/objects";
import { ResultAsync } from "neverthrow";

export interface ITokenInformationRepository {
	initialize(
		tokenRegistryAddress: EthereumContractAddress,
	): ResultAsync<void, NonFungibleRegistryContractError>;

	getTokenInformation(): ResultAsync<TokenInformation[], never>;

	getTokenInformationForChain(
		chainId: ChainId,
	): ResultAsync<TokenInformation[], never>;

	getTokenInformationByAddress(
		tokenAddress: EthereumContractAddress,
	): ResultAsync<TokenInformation | null, never>;
}

export const ITokenInformationRepositoryType = Symbol.for(
	"ITokenInformationRepository",
);
