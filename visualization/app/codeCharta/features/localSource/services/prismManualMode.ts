// Prism reads these from the global it finds when it loads: without them it would colour every code element of
// the page by itself and listen to messages from any other window.
;(globalThis as unknown as { Prism: object }).Prism = { manual: true, disableWorkerMessageHandler: true }
