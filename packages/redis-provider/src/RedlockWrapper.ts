import { ResultAsync } from "neverthrow";
import Redlock from "redlock";

import { IRedlockWrapper } from "@redis-provider/IRedlockWrapper";
import { RedisError } from "@redis-provider/RedisError";

export class RedlockWrapper implements IRedlockWrapper {
	constructor(protected lock: Redlock.Lock) {}

	public unlock<T>(val: T): ResultAsync<T, never> {
		return ResultAsync.fromSafePromise<void, never>(
			this.lock.unlock() as unknown as Promise<void>,
		).map(() => {
			return val;
		});
	}

	public extend(ttl: number): ResultAsync<RedlockWrapper, RedisError> {
		return ResultAsync.fromPromise(
			this.lock.extend(ttl) as unknown as Promise<Redlock.Lock>,
			(e) => {
				return new RedisError("Unable to extend lock", e);
			},
		).map((lock) => {
			return new RedlockWrapper(lock);
		});
	}
}
