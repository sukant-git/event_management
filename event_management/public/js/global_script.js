frappe.provide('frappe.event_management');

const EventLoginTemplate = `
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
`;

const SpeakerLiveTemplate = `
<div style="padding: 30px; background: #fdfaf6; min-height: calc(100vh - 80px); border-radius: 8px;">
    <div class="row">
        <div class="col-md-8 mx-auto">
            <div class="card shadow-sm p-4" style="background: white; border-radius: 12px; border: 1px solid #f1e9db;">
                <h3 class="mb-4" style="color: #856404; font-weight: 600;">Type Live Message</h3>
                <div class="form-group mb-4">
                    <div class="input-group">
                        <input type="text" v-model="messageInput" class="form-control py-2" 
                               placeholder="Type message and press Enter" @keypress.enter="sendMessage">
                        <button class="btn btn-primary" @click="sendMessage">Send</button>
                    </div>
                </div>
                <div ref="messageContainer"
                     style="margin-top:20px; border:1px solid #f1e9db; background: #fffcf8;
                     padding:20px; height:400px; overflow:auto; border-radius: 8px;">
                    <div v-if="messages.length === 0" class="text-center text-muted" style="margin-top: 150px;">
                        No messages sent yet.
                    </div>
                    <div v-for="(msg, index) in messages" :key="index" 
                         style="margin-bottom: 15px; padding-bottom: 10px; border-bottom: 1px solid #f9f3e8;">
                        <div class="d-flex justify-content-between align-items-baseline mb-1">
                            <b :style="{ color: msg.sender === 'speaker' ? '#0056b3' : '#28a745', textTransform: 'capitalize' }">
                                {{ msg.sender }}
                            </b>
                            <small style="color:#999; font-size: 0.75em;">
                                {{ formatTime(msg.timestamp) }}
                            </small>
                        </div>
                        <div style="color: #444; word-wrap: break-word;">
                            {{ msg.message }}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
`;

const AttenderLiveTemplate = `
<div style="padding: 20px; background: #f5fdf5; min-height: calc(100vh - 80px); border-radius: 8px;">
    <div class="row">
        <div class="col-md-8 mx-auto">
            <div class="card shadow-sm p-4" style="background: white; border-radius: 12px; border: 1px solid #e1eedd;">
                <h3 class="mb-4" style="color: #2d5a27; font-weight: 600;">Live Messages from Speaker</h3>
                <div ref="messageContainer" style="
                    border: 1px solid #e1eedd; 
                    padding: 20px; 
                    height: 500px; 
                    overflow: auto;
                    background: #fbfdfb;
                    border-radius: 8px;
                ">
                    <div v-if="messages.length === 0" class="text-center text-muted" style="margin-top: 200px;">
                        Waiting for messages...
                    </div>
                    <div v-for="(msg, index) in messages" :key="index" 
                         style="margin-bottom: 15px; padding-bottom: 10px; border-bottom: 1px solid #f1f8f0;">
                        <div class="d-flex justify-content-between align-items-baseline mb-1">
                            <strong :style="{ color: msg.sender === 'speaker' ? '#0056b3' : '#28a745', textTransform: 'capitalize' }">
                                {{ msg.sender || 'Speaker' }}
                            </strong>
                            <small style="color:#999; font-size: 0.75em;">
                                {{ formatTime(msg.timestamp) }}
                            </small>
                        </div>
                        <div style="color: #444; word-wrap: break-word;">
                            {{ msg.message }}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
`;

frappe.event_management.EventLogin = class {
    constructor({ wrapper, eventName, username, pin } = {}) {
        this.wrapper = wrapper;
        this.event_name = eventName || '';
        this.username = username || '';
        this.pin = pin || '';
        this.make_body();
    }

    make_body() {
        const me = this;
        this.app = Vue.createApp({
            template: EventLoginTemplate,
            data() {
                return {
                    event_name: me.event_name,
                    username: me.username,
                    pin: me.pin,
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
        });
        frappe.event_management.SetVueGlobals(this.app);
        this.vue = this.app.mount(this.wrapper);
    }
};

frappe.event_management.SpeakerLive = class {
    constructor({ wrapper, eventName, endTime, docname } = {}) {
        this.wrapper = wrapper;
        this.eventName = eventName;
        this.endTime = endTime;
        this.docname = docname;
        this.make_body();
    }

    make_body() {
        const me = this;
        this.app = Vue.createApp({
            template: SpeakerLiveTemplate,
            data() {
                return {
                    eventName: me.eventName,
                    messageInput: '',
                    messages: [],
                    docname: me.docname
                }
            },
            mounted() {
                frappe.realtime.on('speaker_live_message', (data) => {
                    this.messages.push(data);
                    this.$nextTick(() => this.scrollToBottom());
                });
                this.checkEventEnd();
                this.interval = setInterval(this.checkEventEnd, 10000);
            },
            beforeUnmount() {
                clearInterval(this.interval);
                frappe.realtime.off('speaker_live_message');
            },
            methods: {
                sendMessage() {
                    const msg = this.messageInput.trim();
                    if (!msg) return;
                    frappe.call({
                        method: "event_management.api.send_live_message",
                        args: { docname: this.docname, message: msg, user_type: "speaker" },
                        callback: () => { this.messageInput = ''; }
                    });
                },
                formatTime(t) { return new Date(t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }); },
                scrollToBottom() {
                    const c = this.$refs.messageContainer;
                    if (c) c.scrollTop = c.scrollHeight;
                },
                checkEventEnd() {
                    if (me.endTime && new Date() >= new Date(me.endTime)) {
                        sessionStorage.clear();
                        frappe.msgprint("Event ended. Logged out.");
                        frappe.set_route("event-login");
                    }
                }
            }
        });
        frappe.event_management.SetVueGlobals(this.app);
        this.vue = this.app.mount(this.wrapper);
    }
};

frappe.event_management.AttenderLive = class {
    constructor({ wrapper, eventName } = {}) {
        this.wrapper = wrapper;
        this.eventName = eventName;
        this.make_body();
    }

    make_body() {
        this.app = Vue.createApp({
            template: AttenderLiveTemplate,
            data() { 
                return { 
                    messages: [] 
                } 
            },
            mounted() {
                frappe.realtime.on('speaker_live_message', (data) => {
                    if (data) {
                        this.messages.push(data);
                        this.$nextTick(() => this.scrollToBottom());
                    }
                });
            },
            beforeUnmount() { frappe.realtime.off('speaker_live_message'); },
            methods: {
                formatTime(t) { return t ? new Date(t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : ""; },
                scrollToBottom() {
                    const c = this.$refs.messageContainer;
                    if (c) c.scrollTop = c.scrollHeight;
                }
            }
        });
        frappe.event_management.SetVueGlobals(this.app);
        this.vue = this.app.mount(this.wrapper);
    }
};
