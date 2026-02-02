import frappe
import random
from frappe.model.document import Document


class EventManagerDoc(Document):

    def after_insert(self):
        self.set_pins_and_send_emails()

    def generate_pin(self):
        return str(random.randint(100000, 999999))

    def set_pins_and_send_emails(self):
        emails_to_send = []

        for row in self.speaker_table:
            if row.speaker_email and not row.pin_s:
                row.pin_s = self.generate_pin()

                frappe.logger().info(
                    f"Speaker PIN generated: {row.speaker_email} → {row.pin_s}"
                )

                emails_to_send.append({
                    "email": row.speaker_email,
                    "name": row.speaker_name,
                    "role": "Speaker",
                    "pin": row.pin_s
                })

        for row in self.attender_table:
            if row.attender_email and not row.pin_a:
                row.pin_a = self.generate_pin()

                frappe.logger().info(
                    f"Attender PIN generated: {row.attender_email} → {row.pin_a}"
                )

                emails_to_send.append({
                    "email": row.attender_email,
                    "name": row.attender_name,
                    "role": "Attender",
                    "pin": row.pin_a
                })

        if emails_to_send:
            self.save(ignore_permissions=True)
            # frappe.db.commit()

        for user in emails_to_send:
            frappe.sendmail(
                recipients=[user["email"]],
                subject=f"Your PIN for {self.event_name}",
                message=f"""
                <p>Hi {user['name']},</p>
                <p>You are registered as a <b>{user['role']}</b>
                for <b>{self.event_name}</b>.</p>
                <b>{self.start_time}</b> to <b>{self.end_time}</b></p>
                <p>
                <b>Username:</b> {user['email']}<br>
                <b>PIN:</b> {user['pin']}
                <a href="http://test.site:8000/app/event-login">Click here</a>
                </p>
                <p>Thanks,<br>Event Team</p>
                """
            )
