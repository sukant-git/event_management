frappe.pages['speaker-live'].on_page_load = function (wrapper) {
    const eventName = sessionStorage.getItem("event_name");
    const endTime = sessionStorage.getItem("event_end_time");
    const docname = sessionStorage.getItem("event_docname");

    if (!docname) {
        frappe.set_route("event-login");
        return;
    }

    frappe.ui.make_app_page({
        parent: wrapper,
        title: `Speaker Live – ${eventName}`,
        single_column: true
    });

    new frappe.event_management.SpeakerLive({
        wrapper: wrapper,
        eventName: eventName,
        endTime: endTime,
        docname: docname
    });
};
