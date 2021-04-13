const nodemailer = require("nodemailer");
const ejs = require('ejs');
const fs = require('fs').promises
require('dotenv').config()




class MailService {
    constructor() {
        this.user = process.env.MAIL_SERVICE_USER
        this.password = process.env.MAIL_SERVICE_PASSWORD
        this.transport = null;
    }

    initTransport() {
        this.transport = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: this.user,
                pass: this.password
            }
        })
    }

    async sendPurchaseMail(user,product,order) {
        try {
 
            this.initTransport()
            let subject = `Bid: Sending your purchase about order ${order._id}`
            let body = await ejs.renderFile(__dirname+'\\views\\mails\\purchase.ejs',{user,product,order})
            let options = {
                from: this.user,
                // replyto: 'no-reply@bid.com',
                to:'dimtzilopoylos@gmail.com',
                subject:subject,
                html:body
            }
            await this.transport.sendMail(options)
             
        } catch (error) {
            await fs.appendFile('./mailServicePurchaseErrorLog.txt',`Email for order ${order._id} failed to be sent at ${new Date().toUTCString()}\n`,'utf8')
            console.log(error)
        }
    }

}

module.exports = MailService