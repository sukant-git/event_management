frappe.pages['event-login'].on_page_load = function (wrapper) {
    new frappe.event_management.EventLogin({
        wrapper: wrapper
    });
};
 