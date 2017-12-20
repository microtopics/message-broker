const EventEmitter = require('events');
const events = require('app-events').MessageBroker;
const Logger = require('logger');

const {
    handleConnection,
    createChannel,
} = require('./lib/actions');

const {
    CONNECTING,
    CONNECTED,
    PUBLISH,
} = events;

const logger = new Logger('Message Broker');

class MessageBroker extends EventEmitter {
    constructor() {
        super();
        this.on(CONNECTING, handleConnection.bind(this));
        this.on(CONNECTED, createChannel.bind(this));
    }

    static getInstance() {
        if (!this.instance) {
            this.instance = new MessageBroker();
            return this.instance;
        }
        return this.instance;
    }

    emit(event, value) {
        logger.logEvent(event, value);
        EventEmitter.prototype.emit.call(this, event, value);
    }

    connect(connectionString) {
        this.connectionString = connectionString;
        this.emit(CONNECTING, connectionString);
    }

    publish(channelName, message) {
        if (!this.connection) {
            logger.logD('publish', 'connection to message service lost... Trying to reconnect...');
            return this.emit(CONNECTING, this.connectionString);
        }

        if (!this.channel) {
            return this.emit(CONNECTED, this.connection);
        }

        return this.emit(PUBLISH, { channelName, message });
    }
}

module.exports = MessageBroker.getInstance();
