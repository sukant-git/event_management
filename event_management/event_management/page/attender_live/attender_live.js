frappe.pages['attender-live'].on_page_load = function (wrapper) {
    const eventName = sessionStorage.getItem("event_name");

    frappe.ui.make_app_page({
        parent: wrapper,
        title: eventName ? `Attender Live – ${eventName}` : 'Attender Live Panel',
        single_column: true
    });

    new frappe.event_management.AttenderLive({
        wrapper: wrapper,
        eventName: eventName
    });
};
 