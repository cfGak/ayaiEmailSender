const express = require("express");
const nodemailer = require("nodemailer");
const bodyParser = require("body-parser");
const cors = require("cors");
const cron = require("node-cron");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "ceferinoguajardo@gmail.com", // Reemplaza con tu correo
    pass: "aohy hzlz oamh bikx", // Reemplaza con tu contraseña
  },
});

const scheduledEmails = [];

app.post("/schedule-email", (req, res) => {

    const { email, alertType, alertDate, alertTime, alertContent } = req.body;

    const [year, month, day] = alertDate.split("-");
    const [hour, minute] = alertTime.split(":");

  const date = new Date(year, month - 1, day, hour, minute);

  if (date < new Date()) {
    return res.status(400).send("La fecha y hora deben estar en el futuro.");
  }

  const job = cron.schedule(
    `${minute} ${hour} ${day} ${month} *`,
    () => {
      const mailOptions = {
        from: "ceferinoguajardo@gmail.com", // Reemplaza con tu correo
        to: email,
        subject: `Nueva alerta: ${alertType}`,
        text: `Tipo de alerta: ${alertType}\nFecha: ${alertDate}\nContenido: ${alertContent}`,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error("Error al enviar el correo:", error);
        } else {
          console.log("Correo enviado:", info.response);
          job.stop(); // Detenemos el trabajo una vez enviado el correo
        }
      });
    },
    {
      scheduled: true,
      timezone: "America/Santiago", // Ajusta la zona horaria según tu ubicación
    }
  );

  scheduledEmails.push({ email, alertType, alertDate, alertTime, alertContent, job });

  res.status(200).send("Correo programado con éxito.");
});
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
