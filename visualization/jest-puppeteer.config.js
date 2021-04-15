module.exports = {
	launch: {
		headless: true,
		//devtools : true,
		browserContext: "incognito",
		args: ["--allow-file-access-from-files", "--start-maximized"],
		defaultViewport: { width: 1920, height: 1080 },
		slowMo: 10
	}
}
