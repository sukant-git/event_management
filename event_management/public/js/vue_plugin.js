frappe.provide('frappe.event_management');

frappe.event_management.SetVueGlobals = (app) => {
    app.config.globalProperties.__ = window.__;
    app.config.globalProperties.frappe = window.frappe;
};
