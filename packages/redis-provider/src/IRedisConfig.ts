export interface IRedisConfig {
	redisHost: string;
	redisPort: number;

	/**
	 * The expected clock drift; for more details see http://redis.io/topics/distlock
	 */
	redlockDriftFactor?: number;

	/**
	 * The max number of times Redlock will attempt to lock a resource before erroring
	 */
	redlockRetryCount?: number;

	/**
	 * The time in ms between attempts
	 */
	redlockRetryDelay?: number;

	/**
	 * The max time in ms randomly added to retries to improve
	 * performance under high contention
	 * see https://www.awsarchitectureblog.com/2015/03/backoff.html
	 */
	redlockRetryJitter?: number;
}
