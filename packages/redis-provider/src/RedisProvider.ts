import { ILogUtils, ILogUtilsType } from "@hypernetlabs/utils";
import { inject, injectable } from "inversify";
import { ResultAsync } from "neverthrow";
import redis from "redis";

import { IRedisClient } from "@redis-provider/IRedisClient";
import {
	IRedisConfigProvider,
	IRedisConfigProviderType,
} from "@redis-provider/IRedisConfigProvider";
import { IRedisProvider } from "@redis-provider/IRedisProvider";
import { RedisClient } from "@redis-provider/RedisClient";

@injectable()
export class RedisProvider implements IRedisProvider {
	protected redisClientResult: ResultAsync<IRedisClient, never> | undefined;

	constructor(
		@inject(IRedisConfigProviderType)
		protected configProvider: IRedisConfigProvider,
		@inject(ILogUtilsType) protected logUtils: ILogUtils,
	) {}

	public getRedisClient(): ResultAsync<IRedisClient, never> {
		return this.init();
	}

	protected init(): ResultAsync<IRedisClient, never> {
		if (this.redisClientResult == null) {
			this.redisClientResult = this.configProvider
				.getConfig()
				.andThen((config) => {
					return ResultAsync.fromSafePromise<IRedisClient, never>(
						new Promise((resolve) => {
							const redisClient = redis.createClient({
								host: config.redisHost,
								port: config.redisPort,
							});

							redisClient.on("ready", () => {
								this.logUtils.info(
									`Connected to Redis at ${config.redisHost} on port ${config.redisPort} `,
								);
								resolve(new RedisClient(redisClient, config));
							});

							redisClient.on("error", (e) => {
								this.logUtils.error(e);
							});
						}) as Promise<IRedisClient>,
					);
				});
		}
		return this.redisClientResult;
	}
}
