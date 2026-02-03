<template>
<div style="max-width:420px; margin:100px auto; padding: 30px; border-radius: 12px; background: #f0f4f8; box-shadow: 0 10px 25px rgba(0,0,0,0.05); border: 1px solid #d1d9e6;">
    <h3 class="text-center mb-4" style="color: #2c3e50; font-weight: 600;">Event Login</h3>
    <div class="form-group mb-3">
        <label class="form-label" style="font-size: 0.9em; color: #5c6873;">Event Name</label>
        <input v-model="event_name" class="form-control" placeholder="Enter Event Name" @keyup.enter="handleLogin">
    </div>
    <div class="form-group mb-3">
        <label class="form-label" style="font-size: 0.9em; color: #5c6873;">User Email</label>
        <input v-model="username" class="form-control" placeholder="Enter your email" @keyup.enter="handleLogin">
    </div>
    <div class="form-group mb-4">
        <label class="form-label" style="font-size: 0.9em; color: #5c6873;">PIN</label>
        <input v-model="pin" type="password" class="form-control" placeholder="Enter PIN" @keyup.enter="handleLogin">
    </div>
    <button class="btn btn-primary btn-block w-100 py-2" @click="handleLogin" :disabled="loading" style="font-weight: 500;">
        <span v-if="loading">Logging in...</span>
        <span v-else>Login</span>
    </button>
    <div v-if="error" style="color:#e74c3c; margin-top:15px; font-size: 0.9em;" class="text-center">
        {{ error }}
    </div>
</div>
</template>

<script>
export default {
    props: ['initialEventName', 'initialUsername', 'initialPin'],
    data() {
        return {
            event_name: this.initialEventName || '',
            username: this.initialUsername || '',
            pin: this.initialPin || '',
            loading: false,
            error: ''
        }
    },
    methods: {
        handleLogin() {
            if (!this.event_name || !this.username || !this.pin) {
                this.error = "All fields are required!";
                return;
            }
            this.loading = true;
            this.error = "";
            frappe.call({
                method: "event_management.api.event_login",
                args: {
                    event_name: this.event_name.trim(),
                    username: this.username.trim(),
                    pin: this.pin.trim()
                },
                callback: (r) => {
                    this.loading = false;
                    if (r.message && r.message.status === "success") {
                        sessionStorage.setItem("event_user", r.message.name);
                        sessionStorage.setItem("event_name", r.message.event_name);
                        sessionStorage.setItem("event_end_time", r.message.end_time);
                        sessionStorage.setItem("event_docname", r.message.docname);
                        frappe.set_route(r.message.next_page);
                    } else {
                        this.error = r.message ? r.message.message : "Invalid credentials";
                    }
                }
            });
        }
    }
};
</script>
