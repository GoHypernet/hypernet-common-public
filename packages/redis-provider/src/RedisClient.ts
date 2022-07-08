import { errAsync, ResultAsync } from "neverthrow";
import redis from "redis";
import Redlock from "redlock";

import { IRedisClient } from "@redis-provider/IRedisClient";
import { IRedisConfig } from "@redis-provider/IRedisConfig";
import { IRedlockWrapper } from "@redis-provider/IRedlockWrapper";
import { RedisError } from "@redis-provider/RedisError";
import { RedlockWrapper } from "@redis-provider/RedlockWrapper";

export class RedisClient implements IRedisClient {
	protected redlock: Redlock;
	public constructor(
		protected redisClient: redis.RedisClient,
		protected config: IRedisConfig,
	) {
		this.redlock = new Redlock([redisClient], {
			// the expected clock drift; for more details
			// see http://redis.io/topics/distlock
			driftFactor: config.redlockDriftFactor || 0.01, // multiplied by lock ttl to determine drift time

			// the max number of times Redlock will attempt
			// to lock a resource before erroring
			retryCount: config.redlockRetryCount || 10,

			// the time in ms between attempts
			retryDelay: config.redlockRetryDelay || 200, // time in ms

			// the max time in ms randomly added to retries
			// to improve performance under high contention
			// see https://www.awsarchitectureblog.com/2015/03/backoff.html
			retryJitter: config.redlockRetryJitter || 200, // time in ms
		});

		// Report any errors from the redis locking mechanism
		this.redlock.on("clientError", (err) => {
			console.error(err);
		});
	}

	public get(key: string): ResultAsync<string | null, RedisError> {
		return ResultAsync.fromPromise(
			new Promise((resolve, reject) => {
				this.redisClient.get(key, (error, val) => {
					if (error != null) {
						reject(error);
					} else {
						resolve(val);
					}
				});
			}),
			(e) => {
				return new RedisError(`Cannot get key ${key} from Redis`, e);
			},
		);
	}

	public del(key: string): ResultAsync<void, RedisError> {
		return ResultAsync.fromPromise(
			new Promise((resolve, reject) => {
				this.redisClient.del(key, (error) => {
					if (error != null) {
						reject(error);
					} else {
						resolve();
					}
				});
			}),
			(e) => {
				return new RedisError(`Cannot del key ${key} from Redis`, e);
			},
		);
	}

	public set(
		key: string,
		value: string,
		duration: number,
	): ResultAsync<void, RedisError> {
		return ResultAsync.fromPromise(
			new Promise((resolve, reject) => {
				this.redisClient.set(
					key,
					value,
					"EX",
					duration,
					(error, val) => {
						if (error != null) {
							reject(error);
						} else {
							resolve(undefined);
						}
					},
				);
			}),
			(e) => {
				return new RedisError(`Cannot set key ${key} in Redis`, e);
			},
		);
	}

	public sendCommand<T>(
		command: string,
		args: unknown[],
	): ResultAsync<T, RedisError> {
		return ResultAsync.fromPromise(
			new Promise<T>((resolve, reject) => {
				this.redisClient.sendCommand(command, args, (err, val) => {
					if (err == null) {
						resolve(val);
					} else {
						reject(err);
					}
				});
			}),
			(e) => {
				return new RedisError(
					`Cannot add event to stream ${command}`,
					e,
				);
			},
		);
	}

	public lock(
		lockNames: string | string[],
		ttl: number,
	): ResultAsync<IRedlockWrapper, RedisError> {
		return ResultAsync.fromPromise(
			this.redlock.lock(
				lockNames,
				ttl,
			) as unknown as Promise<Redlock.Lock>,
			(e) => {
				return new RedisError(`Unable to aquire locks ${lockNames}`, e);
			},
		).map((lock) => {
			return new RedlockWrapper(lock);
		});
	}

	public duplicate(): IRedisClient {
		return new RedisClient(this.redisClient.duplicate(), this.config);
	}

	public getClient(): redis.RedisClient {
		return this.redisClient;
	}

	// TODO: need to handle func calls in a queue
	/* public rateLimit<T, E>(
		key: string,
		maxLimitPerSecond: number,
		func: () => ResultAsync<T, E>,
	): ResultAsync<T, E | RedisError> {
		return this.get(key).andThen((counterString) => {
			if (counterString == null) {
				return this.set(key, "1", 1000).andThen(() => {
					return func();
				});
			}

			let counter = Number(counterString);
			if (counter < maxLimitPerSecond) {
				return this.set(key, (++counter).toString(), 1000).andThen(
					() => {
						return func();
					},
				);
			} else {
				return errAsync(
					new RedisError("Throttle method limit exceeded"),
				);
			}
		});
	} */
}
