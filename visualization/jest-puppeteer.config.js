module.exports = {
	launch: {
		headless: false,
		args: ["--allow-file-access-from-files", "--start-maximized"],
		defaultViewport: { width: 1920, height: 1080 },
<<<<<<< HEAD
		slowMo: process.env.SLOWMO ? process.env.SLOWMO : 50
=======
		slowMo: process.env.SLOWMO ? process.env.SLOWMO : 50,
		devtools: false
>>>>>>> fix/1632/reset-street-layout-global-config
	}
}
