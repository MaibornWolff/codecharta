module.exports = {
	launch: {
		headless: true,
		args: ["--allow-file-access-from-files", "--start-maximized"],
		defaultViewport: { width: 1920, height: 1080 }
		// slowMo: process.env.SLOWMO ? process.env.SLOWMO : 25
	}
}
