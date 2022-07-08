import { ResultAsync } from "neverthrow";

import { IRedisConfig } from "@redis-provider/IRedisConfig";

export interface IRedisConfigProvider {
	getConfig(): ResultAsync<IRedisConfig, never>;
}

export const IRedisConfigProviderType = Symbol.for("IRedisConfigProvider");
