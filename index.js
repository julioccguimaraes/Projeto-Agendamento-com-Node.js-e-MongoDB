const express = require("express")
const bodyParser = require("body-parser")
const mongoose = require("mongoose")
const AppointmentService = require("./services/AppointmentService")

const app = express()

app.use(express.static("public")) // arquivos estáticos

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.set("view engine", "ejs")

mongoose.connect("mongodb://localhost:27017/agendamento")

app.get("/", (req, res) => {
    res.render("index")
})

app.get("/form", (req, res) => {
    res.render("create")
})

app.post("/create", async (req, res) => {
    const status = await AppointmentService.create(req.body)

    if (status) {
        res.redirect("/")
    } else {
        res.send("Failed to save appointment")
    }
})

app.get("/getcalendar", async (req, res) => {
    const appointments = await AppointmentService.getAll(false)

    res.json(appointments)
})

app.get("/event/:id", async(req, res) => {
    const appointment = await AppointmentService.getById(req.params.id)
    res.render("edit", { appointment})
})

app.post("/edit", async(req, res) => {
    const status = await AppointmentService.finish(req.body.id)
    
    if (status) {
        res.redirect("/")
    } else {
        res.send("Failed to edit appointment")
    }
})

app.get("/list", async(req, res) => {
    var appointments = []
    
    if (req.query.search) {
        appointments = await AppointmentService.search(req.query.search)
    } else {
        appointments = await AppointmentService.getAll(true)
    }

    res.render("list", { appointments, search: req.query.search })
})

const interval = 1000 * 60 * 5 // 5 minutes

setInterval(async () => {
    await AppointmentService.sendNotification()
}, interval);

app.listen(8080, () => {
    console.log("Server is running")
})