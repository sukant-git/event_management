
import frappe
@frappe.whitelist()
def getpage(name=None):
    if not name:
        return {
            "status": "ok",
            "message": "No page name provided"
        }

