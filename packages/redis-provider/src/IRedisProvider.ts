import { ResultAsync } from "neverthrow";

import { IRedisClient } from "@redis-provider/IRedisClient";

export interface IRedisProvider {
	getRedisClient(): ResultAsync<IRedisClient, never>;
}

export const IRedisProviderType = Symbol.for("IRedisProvider");
