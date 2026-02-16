// Password generation utility

/**
 * Generate a random alphanumeric password
 * @param length - Length of the password (default: 12)
 * @returns Random alphanumeric password
 */
export function generateRandomPassword(length: number = 12): string {
	const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
	const lowercase = "abcdefghijklmnopqrstuvwxyz";
	const numbers = "0123456789";
	const allChars = uppercase + lowercase + numbers;

	let password = "";

	// Ensure at least one uppercase, one lowercase, and one number
	password += uppercase[Math.floor(Math.random() * uppercase.length)];
	password += lowercase[Math.floor(Math.random() * lowercase.length)];
	password += numbers[Math.floor(Math.random() * numbers.length)];

	// Fill the rest with random characters
	for (let i = password.length; i < length; i++) {
		password += allChars[Math.floor(Math.random() * allChars.length)];
	}

	// Shuffle the password to randomize the position of guaranteed characters
	return password
		.split("")
		.sort(() => Math.random() - 0.5)
		.join("");
}
