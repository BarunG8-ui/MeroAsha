const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: Number(process.env.MAIL_PORT),
  secure: process.env.MAIL_SECURE === "true",

  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASSWORD,
  },
});

/**
 * Verify SMTP connection when the backend starts
 */
transporter.verify((error) => {
  if (error) {
    console.error("❌ SMTP connection failed:");
    console.error(error.message);
  } else {
    console.log("✅ SMTP server is ready to send emails");
  }
});

/**
 * Send appointment confirmation email
 */
const sendAppointmentConfirmationEmail = async ({
  patientEmail,
  patientName,
  appointment,
}) => {
  if (!patientEmail) {
    throw new Error("Patient email address is missing");
  }

  if (!appointment) {
    throw new Error("Appointment information is missing");
  }

  const doctorName =
    appointment?.doctorId?.userId?.name || "Assigned Doctor";

  const departmentName =
    appointment?.departmentId?.name || "Hospital Department";

  const appointmentDate = new Date(
    appointment.appointmentDate
  ).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const mailOptions = {
    from: process.env.MAIL_FROM,
    to: patientEmail,

    subject: "MeroAsha Hospital - Appointment Confirmation",

    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8" />

          <title>
            MeroAsha Hospital - Appointment Confirmation
          </title>
        </head>

        <body
          style="
            margin: 0;
            padding: 0;
            background-color: #f4f7fb;
            font-family: Arial, Helvetica, sans-serif;
          "
        >

          <div
            style="
              max-width: 650px;
              margin: 30px auto;
              background: #ffffff;
              border-radius: 12px;
              overflow: hidden;
              box-shadow: 0 4px 15px rgba(0,0,0,0.08);
            "
          >

            <!-- Header -->

            <div
              style="
                background: #2563eb;
                color: #ffffff;
                padding: 25px;
                text-align: center;
              "
            >

              <h1
                style="
                  margin: 0;
                  font-size: 28px;
                "
              >
                MeroAsha Hospital
              </h1>

              <p
                style="
                  margin: 8px 0 0;
                  font-size: 14px;
                "
              >
                Healthcare Management System
              </p>

            </div>


            <!-- Content -->

            <div style="padding: 30px;">

              <h2
                style="
                  color: #1f2937;
                  margin-top: 0;
                "
              >
                Appointment Confirmed ✓
              </h2>

              <p
                style="
                  color: #374151;
                  font-size: 16px;
                "
              >
                Dear
                <strong>${patientName || "Patient"}</strong>,
              </p>

              <p
                style="
                  color: #4b5563;
                  line-height: 1.6;
                "
              >
                Your appointment has been successfully booked
                with MeroAsha Hospital.
              </p>


              <!-- Appointment Token -->

              <div
                style="
                  background: #eff6ff;
                  border: 1px solid #bfdbfe;
                  border-radius: 10px;
                  padding: 20px;
                  text-align: center;
                  margin: 25px 0;
                "
              >

                <p
                  style="
                    margin: 0 0 8px;
                    color: #6b7280;
                    font-size: 14px;
                  "
                >
                  APPOINTMENT TOKEN
                </p>

                <h2
                  style="
                    margin: 0;
                    color: #2563eb;
                    font-size: 28px;
                    letter-spacing: 1px;
                  "
                >
                  ${appointment.appointmentId}
                </h2>

              </div>


              <!-- Appointment Details -->

              <h3
                style="
                  color: #1f2937;
                  border-bottom: 1px solid #e5e7eb;
                  padding-bottom: 10px;
                "
              >
                Appointment Details
              </h3>

              <table
                width="100%"
                cellpadding="10"
                cellspacing="0"
                style="
                  border-collapse: collapse;
                  margin-top: 15px;
                "
              >

                <tr>
                  <td
                    style="
                      color: #6b7280;
                      font-weight: bold;
                    "
                  >
                    Doctor
                  </td>

                  <td
                    style="
                      color: #111827;
                    "
                  >
                    ${doctorName}
                  </td>
                </tr>

                <tr>
                  <td
                    style="
                      color: #6b7280;
                      font-weight: bold;
                    "
                  >
                    Department
                  </td>

                  <td
                    style="
                      color: #111827;
                    "
                  >
                    ${departmentName}
                  </td>
                </tr>

                <tr>
                  <td
                    style="
                      color: #6b7280;
                      font-weight: bold;
                    "
                  >
                    Date
                  </td>

                  <td
                    style="
                      color: #111827;
                    "
                  >
                    ${appointmentDate}
                  </td>
                </tr>

                <tr>
                  <td
                    style="
                      color: #6b7280;
                      font-weight: bold;
                    "
                  >
                    Time
                  </td>

                  <td
                    style="
                      color: #111827;
                    "
                  >
                    ${appointment.timeSlot}
                  </td>
                </tr>

                <tr>
                  <td
                    style="
                      color: #6b7280;
                      font-weight: bold;
                    "
                  >
                    Status
                  </td>

                  <td
                    style="
                      color: #16a34a;
                      font-weight: bold;
                    "
                  >
                    ${appointment.status}
                  </td>
                </tr>

              </table>


              <!-- Important Note -->

              <div
                style="
                  background: #fefce8;
                  border: 1px solid #fde68a;
                  border-radius: 8px;
                  padding: 15px;
                  margin-top: 25px;
                "
              >

                <p
                  style="
                    margin: 0;
                    color: #854d0e;
                    line-height: 1.5;
                  "
                >
                  <strong>Important:</strong>
                  Please keep your appointment token
                  <strong>${appointment.appointmentId}</strong>
                  for future reference.
                </p>

              </div>


              <p
                style="
                  color: #4b5563;
                  line-height: 1.6;
                  margin-top: 25px;
                "
              >
                Please arrive at the hospital a few minutes
                before your scheduled appointment time.
              </p>


              <p
                style="
                  color: #374151;
                  margin-top: 30px;
                "
              >
                Regards,<br />

                <strong>
                  MeroAsha Hospital
                </strong>
              </p>

            </div>


            <!-- Footer -->

            <div
              style="
                background: #f9fafb;
                border-top: 1px solid #e5e7eb;
                padding: 18px;
                text-align: center;
              "
            >

              <p
                style="
                  margin: 0;
                  color: #9ca3af;
                  font-size: 12px;
                "
              >
                This is an automated email from
                MeroAsha Hospital.
                Please do not reply to this email.
              </p>

            </div>

          </div>

        </body>
      </html>
    `,
  };

  const info = await transporter.sendMail(mailOptions);

  console.log(
    `✅ Appointment confirmation email sent to ${patientEmail}`
  );

  console.log(`📧 Message ID: ${info.messageId}`);

  return info;
};


module.exports = {
  sendAppointmentConfirmationEmail,
};