const appointment = require("../models/Appointment")
const mongoose = require("mongoose")
const AppointmentFactory = require("../factories/AppointmentFactory")
const mailer = require("nodemailer")

const Appointment = mongoose.model("Appointment", appointment)

class AppointmentService {
    async create(appointment) {
        const newAppointment = new Appointment({ ...appointment, finished: false, notified: false })

        try {
            await newAppointment.save()
            return true
        } catch (err) {
            console.log(err)
            return false
        }
    }

    async getAll(showFinished) {

        var results
        if (showFinished) {
            results = await Appointment.find({})
            return results
        } else {
            results = await Appointment.find({ finished: showFinished })
        }

        const appointments = []

        results.forEach(appointment => {
            if (appointment.date != undefined) {
                appointments.push(AppointmentFactory.build(appointment))
            }
        })

        return appointments
    }

    async getById(id) {
        try {
            const result = await Appointment.findOne({ '_id': id })
            return result
        } catch (err) {
            console.log(err)
            return undefined
        }
    }

    async finish(id) {
        try {
            await Appointment.findByIdAndUpdate(id, { finished: true })
            return true
        } catch (err) {
            console.log(err)
            return false
        }
    }

    async search(query) {
        try {
            const results = await Appointment.find().or([{ email: query }, { cpf: query }])
            return results
        } catch (err) {
            console.log(err)
            return []
        }
    }

    async sendNotification() {
        try {
            const results = await this.getAll(false)

            const transporter = mailer.createTransport({
                host: "smtp.mailtrap.io",
                port: 2525,
                auth: {
                    user: "f2f35d7e04324e",
                    pass: "86d09b2ccdd1e7"
                }
            })

            results.forEach(async result => {
                if (!result.notified) {
                    const date = result.start.getTime()
                    const hour = 1000 * 60 * 60
                    const gap = date - Date.now()

                    if (gap <= hour) {
                        await Appointment.findByIdAndUpdate(result.id, { notified: true })

                        // enviando o email
                        transporter.sendMail({
                            from: "Júlio <temp@julio.com>",
                            to: result.email, // pode colocar qualquer email que vai cair na caixa do mailtrap
                            subject: "Lembre de consulta",
                            text: result.title
                        }).then(res => {
                            console.log(res)
                        }).catch(err => {
                            console.log(err)
                        })
                    }
                }
            })
        } catch (err) {
            console.log(err)
        }
    }
}

module.exports = new AppointmentService()