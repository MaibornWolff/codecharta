export function extractCcJsonVersion(projectKtContents: string): string {
	const major = projectKtContents.match(/\bconst\s+val\s+API_VERSION_MAJOR\s*=\s*"(\d+)"/);
	const minor = projectKtContents.match(/\bconst\s+val\s+API_VERSION_MINOR\s*=\s*"(\d+)"/);
	if (!major || !minor) throw new Error('Cannot determine the cc.json API version from Project.kt');

	return `${major[1]}.${minor[1]}`;
}
