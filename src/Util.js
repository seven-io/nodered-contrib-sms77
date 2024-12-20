const {Client} = require('@seven.io/client')
const globalThis = require('globalthis')()
if (!globalThis.fetch) globalThis.fetch = require('node-fetch')

module.exports = class Util {
    static initClient(RED, config) {
        const apiKey = RED.nodes.getNode(config.config).credentials.apiKey
        return new Client({apiKey, sentWith: 'node-red'})
    }

    static stringify(value) {
        if (typeof value === 'string') return value
        if (typeof value.toString === 'function') return value.toString()
        return JSON.stringify(value)
    }
}
