let context = '';
let apiKey = '';
let history = [];
let historyIdx = -1;

const messages = document.getElementById('messages');
const input = document.getElementById('input');
// const status = document.getElementById('status');

marked.setOptions({ breaks: true });

function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function scrollBottom() {
    messages.scrollTop = messages.scrollHeight;
}

/* ── DOM helpers ──────────────────────────────────────────────── */

function addDivider() {
    // const sep = document.createElement('div');
    // sep.setAttribute('is-', 'separator');
    // sep.setAttribute('cap-', 'bisect');
    // messages.appendChild(sep);
    scrollBottom();
}

/** Meta row: ◻ ask · Anas MiniMax M2.5 · <dur> */
function addMeta(text) {
    const div = document.createElement('div');
    div.className = 'msg-meta';
    div.innerHTML =
        '<span class="meta-icon">◻</span>' +
        '<span is-="badge" cap-="square" variant-="background0" class="badge-mode">ask</span>' +
        '<span class="meta-sep">·</span>' +
        '<span is-="badge" cap-="square" variant-="background0" class="badge-profile">Anas</span>' +
        '<span class="meta-provider">MiniMax M2.5</span>' +
        '<span class="meta-sep">·</span>' +
        '<span class="dur">' + escapeHtml(text) + '</span>';
    messages.appendChild(div);
    scrollBottom();
    return div;
}

/** User message: left-blue-border row */
function addUserMessage(text) {
    const div = document.createElement('div');
    div.className = 'msg user';
    div.innerHTML =
        '<span class="text">' + escapeHtml(text) + '</span>';
    messages.appendChild(div);
    scrollBottom();
}

/** "Thinking…" indicator line */
function addThoughtLine(text) {
    const div = document.createElement('div');
    div.className = 'thought-line';
    div.textContent = text;
    messages.appendChild(div);
    scrollBottom();
    return div;
}

/** Bot message container with streaming .text div */
function addBotMessage() {
    const div = document.createElement('div');
    div.className = 'msg bot';
    div.dataset.raw = '';
    div.innerHTML =
        '<div is-="typography-block" class="text"></div>';
    messages.appendChild(div);
    scrollBottom();
    return div;
}

function appendToMessage(msg, raw) {
    msg.dataset.raw += raw;
    const textEl = msg.querySelector('.text');
    if (textEl) {
        textEl.innerHTML = marked.parse(msg.dataset.raw);
        scrollBottom();
    }
}

/** System / error notice */
function addSystemMessage(text) {
    const div = document.createElement('div');
    div.className = 'caveat-block system';
    div.innerHTML =
        '<span is-="badge" cap-="square" variant-="background0" class="badge-sys">System</span>' +
        '<p>' + escapeHtml(text) + '</p>';
    messages.appendChild(div);
    scrollBottom();
}

/* ── Data loading (unchanged) ─────────────────────────────────── */

async function loadEnv() {
    try {
        const res = await fetch('/.env');
        const text = await res.text();
        for (const line of text.split('\n')) {
            const trimmed = line.trim();
            if (trimmed && !trimmed.startsWith('#')) {
                const [key, ...rest] = trimmed.split('=');
                if (key === 'OPENROUTER_API_KEY') {
                    apiKey = rest.join('=').trim().replace(/^['"]|['"]$/g, '');
                }
            }
        }
    } catch {}
}

async function loadContext() {
    try {
        const res = await fetch('../aboutme.md');
        context = await res.text();
    } catch {
        context = 'No context available.';
    }
}

/* ── Send message (request logic unchanged, display updated) ─────── */

async function sendMessage(text) {
    if (!text || !apiKey) return;

    const startTime = Date.now();

    // Show meta row, divider, user 
    addDivider();
    addUserMessage(text);
    const thoughtLine = addThoughtLine('Thinking...');
    input.value = '';
    input.disabled = true;
    // status.textContent = 'Thinking...';

    let elapsed;
    try {
        const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + apiKey,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'minimax/minimax-m2.5:free',
                messages: [
                    { role: 'system', content: 'You are a helpful assistant. Answer questions based on the provided context.' },
                    { role: 'user', content: 'Context:\n' + context + '\n\nQuestion: ' + text },
                ],
                max_tokens: 300,
                temperature: 0.7,
                stream: true,
            }),
        });

        if (!res.ok) {
            const err = await res.text();
            throw new Error('API error ' + res.status + ': ' + err);
        }

        // Update elapsed time on meta row
        elapsed = ((Date.now() - startTime) / 1000).toFixed(1) + 's';

        // Replace thought line with streaming bot message
        thoughtLine.remove();
        const botMsg = addBotMessage();

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });

            const lines = buffer.split('\n');
            buffer = lines.pop() || '';
            for (const line of lines) {
                if (line.startsWith('data: ') && line !== 'data: [DONE]') {
                    const data = JSON.parse(line.slice(6));
                    const token = data.choices[0]?.delta?.content || '';
                    if (token) appendToMessage(botMsg, token);
                }
            }
        }

        // status.textContent = 'Ready';
    } catch (err) {
        thoughtLine.remove();
        addDivider();
        addSystemMessage('Error: ' + err.message);
        // status.textContent = 'Ready';
    }
    const metaDiv = addMeta('Thinking...');
    
    // Final elapsed update
    elapsed = ((Date.now() - startTime) / 1000).toFixed(1) + 's';
    const durEl = metaDiv.querySelector('.dur');
    if (durEl) durEl.textContent = elapsed;

    addDivider();

    input.disabled = false;
    input.focus();
}

/* ── Key bindings (unchanged) ─────────────────────────────────── */

input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        const text = input.value.trim();
        if (text) {
            history.push(text);
            historyIdx = history.length;
            sendMessage(text);
        }
    } else if (e.key === 'Escape') {
        input.value = '';
    } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (history.length) {
            historyIdx = Math.max(0, historyIdx - 1);
            input.value = history[historyIdx];
        }
    } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (historyIdx < history.length - 1) {
            historyIdx++;
            input.value = history[historyIdx];
        } else {
            historyIdx = history.length;
            input.value = '';
        }
    }
});

document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'l') {
        e.preventDefault();
        const els = messages.querySelectorAll('.msg, .caveat-block, .msg-meta, [is-="separator"], .thought-line');
        els.forEach(el => el.remove());
        // status.textContent = 'Cleared';
        // setTimeout(() => status.textContent = 'Ready', 1000);
    }
});

input.focus();
loadEnv();
loadContext();
