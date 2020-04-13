const accountSid = 'AC89e55055b5aed5f77fdc2ebfd3ba0533';
const authToken = 'e0789e913a440a57cc227e92046e5d67';

const client = require('twilio')(accountSid, authToken);

class Twilio {
    constructor() {
        this.client = client;
    }

    /**
     * Send a single message to a single number.
     * 
     * @param {string} toNumber The number to send the message.
     * @param {string} body The message itself, can contain emojis,links and breaklines.
     * 
     * @return {Promisse} A promisse filled with the Twilio response object.
     */
    sendSingleSMS(toNumber, body) {
        return new Promise((resolve, reject) => {
            this.client.messages.create({
                from: "+12029521682",
                to: toNumber,
                body
            }).then((response) => {
                resolve(response);
            })
        })
    }

    /**
     * Send a single message to a array of numbers.
     * 
     * If you send multiple messages at once from a single Twilio sender (number or Alphanumeric Sender ID),
     * Twilio will queue them up for delivery. Your messages may experience differing rate limits based on the
     * sender you are using. For messages from a US or Canada long code number, the limit is one message segment
     * per second (MPS). If you're sending messages from a non-US or Canada long code number, or an Alphanumeric Sender ID,
     * the upper limit is 10 MPS.
     * 
     * @param {Array<string>} toList A array of numbers to send the message.
     * @param {string} body The message itself, can contain emojis,links and breaklines.
     * 
     * @return {Promise} A promisse filled with a array and all Twilio response objects.
     */
    sendMultipleSMS(toList, body) {
        return new Promise(async (resolve, reject) => {
            let response = [];
            for (const toNumber of toList) {
                await this.client.messages.create({
                    from: "+12029521682",
                    to: toNumber,
                    body
                }).then((res) => {
                    response.push(res)
                })
            }
            resolve(response);
        })
    }
}
module.exports = Twilio;