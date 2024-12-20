const Util = require('../../Util')
const NodeUtil = require('../../NodeUtil')
const {RcsResource} = require('@seven.io/client')

module.exports = function (RED) {
    'use strict'

    function SevenRcsNode(config) {
        RED.nodes.createNode(this, config)

        const node = this
        const nodeUtil = new NodeUtil(node, config)
        const client = Util.initClient(RED, config)
        const resource = new RcsResource(client)

        this.on('input', async function onInput(msg, send, done) {
            if (!send) send = () => node.send.apply(node, [msg, send, done]) // If this is pre-1.0, 'send' will be undefined, so fallback to node.send

            try {
                const response = await resource.dispatch({
                    delay: nodeUtil.emptyStringFallback('delay'),
                    foreign_id: nodeUtil.emptyStringFallback('foreign_id'),
                    from: nodeUtil.emptyStringFallback('from'),
                    label: nodeUtil.emptyStringFallback('label'),
                    performance_tracking: 'true' === config.performance_tracking,
                    text: nodeUtil.emptyStringFallback('message', msg.payload),
                    to: nodeUtil.emptyStringFallback('recipients', msg.topic),
                })
                const code = response.success
                const succeeded = [100, 101].includes(Number(code))

                if (!succeeded) return nodeUtil.onDone(done, JSON.stringify(response), msg)

                let failed = 0
                let sent = 1

                sent = 0

                for (const msg of response.messages) true === msg.success ? sent++ : failed++

                nodeUtil.status(`${sent} sent | ${failed} failed`)
                nodeUtil.onSuccess(send, msg, response, done)
            } catch (e) {
                nodeUtil.errorHandler(done, msg)(e)
            }
        })
    }

    RED.nodes.registerType('seven-rcs', SevenRcsNode)
}
