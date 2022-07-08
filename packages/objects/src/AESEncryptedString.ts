import { EncryptedString } from "@objects/EncryptedString";
import { InitializationVector } from "@objects/InitializationVector";

export class AESEncryptedString {
	public constructor(
		public data: EncryptedString,
		public initializationVector: InitializationVector,
	) {}
}
