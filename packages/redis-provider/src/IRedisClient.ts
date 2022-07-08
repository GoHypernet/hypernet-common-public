import { ResultAsync } from "neverthrow";
import redis from "redis";

import { IRedlockWrapper } from "@redis-provider/IRedlockWrapper";
import { RedisError } from "@redis-provider/RedisError";

export interface IRedisClient {
	get(key: string): ResultAsync<string | null, RedisError>;
	set(
		key: string,
		value: string,
		duration: number,
	): ResultAsync<void, RedisError>;
	del(key: string): ResultAsync<void, RedisError>;

	sendCommand<T = unknown[]>(
		command: string,
		args: unknown[],
	): ResultAsync<T, RedisError>;

	lock(
		lockNames: string | string[],
		ttl: number,
	): ResultAsync<IRedlockWrapper, RedisError>;

	duplicate(): IRedisClient;
	getClient(): redis.RedisClient;
}
