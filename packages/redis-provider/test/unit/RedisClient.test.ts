import redis from "redis-mock";

import { IRedisConfig } from "@redis-provider/IRedisConfig";
import { RedisClient } from "@redis-provider/RedisClient";
import { IRedisClient } from "@redis-provider/IRedisClient";

class RedisClientMocks {
	public constructor() {}

	public factoryRedisClient(): IRedisClient {
		const client = redis.createClient();
		return new RedisClient(client, {} as IRedisConfig);
	}
}

describe("RedisClient tests", () => {
	test("get returns saved value for key1 within the duration", async () => {
		// Arrange
		const mocks = new RedisClientMocks();
		const utils = mocks.factoryRedisClient();
		const redisKey = "key1";
		const redisValue = "value1";
		const duration = 1;

		// Act
		await utils.del(redisKey);
		await utils.set(redisKey, redisValue, duration);
		const result = await utils.get(redisKey);

		// Assert
		expect(result).toBeDefined();
		expect(result.isErr()).toBeFalsy();
		const redisValueResult = result._unsafeUnwrap();
		expect(redisValueResult).toBe(redisValue);
	});

	test("get returns null value for key2 outside the duration", async () => {
		// Arrange
		const mocks = new RedisClientMocks();
		const utils = mocks.factoryRedisClient();
		const redisKey = "key2";
		const redisValue = "value2";
		const duration = 1;

		// Act
		await utils.del(redisKey);
		await utils.set(redisKey, redisValue, duration);

		await new Promise((r) => setTimeout(r, 2000));

		const result = await utils.get(redisKey);

		// Assert
		expect(result).toBeDefined();
		expect(result.isErr()).toBeFalsy();
		const redisValueResult = result._unsafeUnwrap();
		expect(redisValueResult).toBe(null);
	});

	test("del returns null value for keydel", async () => {
		// Arrange
		const mocks = new RedisClientMocks();
		const utils = mocks.factoryRedisClient();
		const redisKey = "keydel";
		const redisValue = "keydelValue";
		const duration = 3;

		// Act
		await utils.set(redisKey, redisValue, duration);

		await new Promise((r) => setTimeout(r, 1000));

		await utils.del(redisKey);

		const result = await utils.get(redisKey);

		// Assert
		expect(result).toBeDefined();
		expect(result.isErr()).toBeFalsy();
		const redisValueResult = result._unsafeUnwrap();
		expect(redisValueResult).toBe(null);
	});
});
