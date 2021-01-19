module.exports = {
	launch: {
		headless: false,
		args: ["--allow-file-access-from-files", "--start-maximized"],
		defaultViewport: { width: 1920, height: 1080 },
		slowMo: process.env.SLOWMO ? process.env.SLOWMO : 0,
		devtools: false
	}
}
