class AppointmentFactory {
    build(simpleAppointment) {
        const month = simpleAppointment.date.getMonth()
        const year = simpleAppointment.date.getFullYear()
        const day = simpleAppointment.date.getDate() + 1
        const hour = Number.parseInt(simpleAppointment.time.split(":")[0])
        const minute = Number.parseInt(simpleAppointment.time.split(":")[1])

        //const start = new Date(Date.UTC(year, month, day, hour, minute, 0, 0))
        const start = new Date(year, month, day, hour, minute, 0, 0)

        const appointment = {
            id: simpleAppointment._id,
            title: simpleAppointment.name + ' - ' + simpleAppointment.description,
            start,
            end: start,
            notified: simpleAppointment.notified,
            email: simpleAppointment.email
        }

        return appointment
    }
}

module.exports = new AppointmentFactory()