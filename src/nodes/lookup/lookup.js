const Util = require('../../Util')
const NodeUtil = require('../../NodeUtil')
const {LookupResource} = require('@seven.io/client')

module.exports = function (RED) {
    'use strict'

    function Sms77LookupNode(config) {
        RED.nodes.createNode(this, config)

        const node = this
        const nodeUtil = new NodeUtil(node, config)
        const client = Util.initClient(RED, config)
        const resource = new LookupResource(client)

        this.on('input', async function onInput(msg, send, done) {
            if (!send) send = () => node.send.apply(node, [msg, send, done]) // If this is pre-1.0, 'send' will be undefined, so fallback to node.send

            const type = config.lookupType

            try {
                const response = await resource[type]({
                    numbers: [nodeUtil.emptyStringFallback('numbers', msg.topic)],
                })
                nodeUtil.status(`Lookup of type "${type}" performed.`)
                send({...msg, payload: response})
                if (done) done() // Check done exists (1.0+)
            } catch (e) {
                nodeUtil.errorHandler(done, msg)(e)
            }
        })
    }

    RED.nodes.registerType('sms77-lookup', Sms77LookupNode)
}
