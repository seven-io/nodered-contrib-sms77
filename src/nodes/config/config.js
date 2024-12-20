module.exports = function (RED) {
    function SevenConfigNode(config) {
        RED.nodes.createNode(this, config);

        this.apiKey = config.apiKey;
        this.name = config.name;
    }

    RED.nodes.registerType('seven-config', SevenConfigNode, {
        credentials: {
            apiKey: {
                type: 'password',
            },
        },
    });
};