const NodeUtil = require('../../NodeUtil')
const Util = require('../../Util')

module.exports = function (RED) {
    'use strict'

    function Sms77VoiceNode(config) {
        RED.nodes.createNode(this, config)

        const node = this
        const nodeUtil = new NodeUtil(node, config)
        const client = Util.initClient(RED, config)

        this.on('input', async function onInput(msg, send, done) {
            if (!send) send = () => node.send.apply(node, [msg, send, done]) // If this is pre-1.0, 'send' will be undefined, so fallback to node.send

            const params = {
                from: nodeUtil.emptyStringFallback('from'),
                json: true,
                ringtime: nodeUtil.emptyStringFallback('ringtime'),
                text: nodeUtil.emptyStringFallback('message', msg.payload),
            }
            const recipients = nodeUtil.emptyStringFallback('recipients', msg.topic)

            for (const to of recipients.split(',')) {
                try {
                    const response = await client.voice({...params, to})
                    const code = response.success
                    const succeeded = [100, 101].includes(Number(code))

                    if (!succeeded) return nodeUtil.onDone(done, JSON.stringify(response), msg)

                    let failed = 0
                    let sent = 1

                    sent = 0

                    for (const msg of response.messages) true === msg.success ? sent++ : failed++

                    nodeUtil.status(`${sent} calls | ${failed} failed`)
                    nodeUtil.onSuccess(send, msg, response, done)
                } catch (e) {
                    nodeUtil.errorHandler(done, msg)(e)
                }
            }
        })
    }

    RED.nodes.registerType('sms77-voice', Sms77VoiceNode)
}
