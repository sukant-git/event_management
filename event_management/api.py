import frappe
from frappe.utils import now

@frappe.whitelist()
def event_login(event_name, username, pin):
    username = username.strip().lower()
    pin = str(pin).strip()

    events = frappe.get_all(
        "Event Manager Doc",
        filters={"event_name": event_name},
        fields=["name", "event_name", "end_time"]
    )
    if not events:
        return {"status": "error", "message": "Event not found"}

    doc = frappe.get_doc("Event Manager Doc", events[0].name)

    user_name = None
    next_page = None

    for sp in doc.speaker_table:
        if sp.speaker_email.strip().lower() == username and str(sp.pin_s) == pin:
            user_name = sp.speaker_name
            next_page = "speaker-live"
            break

    if not next_page:
        for at in doc.attender_table:
            if at.attender_email.strip().lower() == username and str(at.pin_a) == pin:
                user_name = at.attender_name
                next_page = "attender-live"
                break

    if not next_page:
        return {"status": "error", "message": "Invalid username or PIN"}

    return {
        "status": "success",
        "name": user_name,
        "event_name": doc.event_name,
        "end_time": doc.end_time,
        "docname": doc.name,
        "next_page": next_page
    }


@frappe.whitelist()
def send_live_message(docname, message, user_type="speaker"):
  
    frappe.publish_realtime(
        event="speaker_live_message",
        message={
            "docname": docname,
            "sender": user_type,
            "message": message,
            "timestamp": str(now())
        },
        user=None
    )

    return {
        "status": "success",
        "docname": docname,
        "sender": user_type,
        "message": message,
        "timestamp": str(now())
    }
