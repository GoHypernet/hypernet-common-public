import { ResultAsync } from "neverthrow";

import { RedisError } from "@redis-provider/RedisError";

export interface IRedlockWrapper {
	/**
	 * @param val A value to return when the lock completes. This is provided for easy chaining and cleanup inside a .andThen() chain. You can easily return a value after unlocking is complete.
	 */
	unlock<T>(val: T): ResultAsync<T, never>;
	extend(ttl: number): ResultAsync<IRedlockWrapper, RedisError>;
}

export const IRedlockWrapperType = Symbol.for("IRedlockWrapper");
