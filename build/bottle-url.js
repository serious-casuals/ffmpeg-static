#!/usr/bin/env node
'use strict'

const {isatty} = require('tty')

const OS_VERSION = 'high_sierra' // todo

if (isatty(process.stdin)) {
	process.stdout.write('Usage: brew info --json=v1 | build/bottles-url.js\n')
	process.exit(1)
}

const showError = (err) => {
	console.error(err)
	process.exit(1)
}

const readJSON = (cb) => {
	let input = ''
	process.stdin
	.on('data', (d) => {
		input += d.toString('utf8')
	})
	.once('end', () => {
		try {
			cb(null, JSON.parse(input))
		} catch (err) {
			cb(err)
		}
	})
}

readJSON((err, input) => {
	if (err) return showError(err.message)
	if (!Array.isArray(input)) return showError('invalid input')
	const info = input[0]
	if (!info || !info.bottle || !info.bottle.stable || !info.bottle.stable.files) {
		return showError('invalid input')
	}
	if (!info.bottle.stable.files[OS_VERSION]) {
		return showError(`no ${OS_VERSION} version available`)
	}

	process.stdout.write(info.bottle.stable.files[OS_VERSION].url + '\n')
})