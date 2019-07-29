module.exports = {
    info: (msg) => console.log(`\n==> ${msg}\n`),
    error: (msg) => console.log(`\n==ERROR==> ${msg}\n`),
    code: (msg) => console.log(`\n## START ##\n${msg}\n## END ##\n`)
}