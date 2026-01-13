/**
 * Cloud-Clipboard
 */

const CONFIG = {
  name: "云端剪贴板",
  logo: "📋",
};

// --- 1. 全局工具函数 ---
function escapeHtml(s) {
  const m = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
  return s ? String(s).replace(/[&<>"']/g, k => m[k]) : "";
}

// 格式化北京时间 (UTC+8)
function formatBeijingTime(ts) {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    timeZone: 'Asia/Shanghai',
    hour12: false
  }).format(new Date(ts));
}

// --- 2. HTML 模板生成器 ---
const HTML = (data = {}, mode = "index") => {
  const isView = mode === "view";
  const title = data.title || "无标题内容";
  const content = data.content || "";
  const isBurn = !!data.isBurn;
  const tsValue = Number(data.ts) || Date.now();
  const timeStr = formatBeijingTime(tsValue);
  const id = data.id || ""; 

  return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>${isView ? '[' + id + '] ' + escapeHtml(title) : CONFIG.name}</title>
    <link href="https://cdn.bootcdn.net/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
    <style>
        :root {
            --primary: #2563eb; --primary-hover: #1d4ed8; --bg: #f1f5f9; --card: #ffffff;
            --text-main: #1e293b; --text-sub: #64748b; --danger: #ef4444; --danger-hover: #dc2626;
            --danger-bg: #fef2f2; --success: #10b981; --border: #e2e8f0;
        }
        * { box-sizing: border-box; transition: all 0.2s ease; }
        body { font-family: 'PingFang SC', system-ui, sans-serif; background: var(--bg); color: var(--text-main); margin: 0; line-height: 1.6; padding-bottom: 40px; }
        .navbar { background: var(--card); border-bottom: 1px solid var(--border); padding: 0 24px; height: 65px; display: flex; align-items: center; justify-content: space-between; position: sticky; top: 0; z-index: 1000; box-shadow: 0 2px 4px rgba(0,0,0,0.02); }
        .brand { font-size: 1.2rem; font-weight: 800; color: var(--primary); display: flex; align-items: center; gap: 8px; text-decoration: none; flex-shrink: 1; min-width: 0; }
        .container { max-width: 900px; margin: 20px auto; padding: 0 15px; }
        .card { background: var(--card); border-radius: 16px; border: 1px solid var(--border); box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05); overflow: hidden; }
        .burn-banner { background: var(--danger); color: white; padding: 12px; text-align: center; font-weight: bold; font-size: 0.85rem; display: flex; align-items: center; justify-content: center; gap: 10px; }
        .content-header { padding: 25px 25px 0 25px; }
        .meta-info { display: flex; align-items: center; gap: 12px; margin-top: 10px; font-size: 0.8rem; color: var(--text-sub); flex-wrap: wrap; }
        .content-body { padding: 20px 25px 25px 25px; }
        pre { background: #1e293b; color: #f8fafc; padding: 20px; border-radius: 12px; overflow: auto; white-space: pre-wrap; word-break: break-all; font-family: 'Fira Code', monospace; font-size: 14px; line-height: 1.6; min-height: 150px; max-height: 65vh; border: 1px solid #334155; box-shadow: inset 0 2px 10px rgba(0,0,0,0.2); }
        .input-group { margin-bottom: 15px; position: relative; }
        label { display: block; margin-bottom: 6px; font-weight: 600; font-size: 0.9rem; }
        .t-input { width: 100%; padding: 12px; border: 1px solid var(--border); border-radius: 10px; outline: none; font-size: 1rem; background: #fff; }
        .t-input:focus { border-color: var(--primary); box-shadow: 0 0 0 3px rgba(37,99,235,0.1); }
        .editor-container { position: relative; margin-bottom: 8px; }
        textarea { width: 100%; min-height: 380px; padding: 18px; padding-bottom: 45px; border: 1px solid var(--border); border-radius: 12px; font-family: monospace; resize: vertical; outline: none; font-size: 15px; }
        .editor-footer-info { position: absolute; right: 15px; bottom: 15px; display: flex; align-items: center; gap: 15px; font-size: 0.75rem; color: var(--text-sub); background: rgba(255,255,255,0.9); padding: 4px 10px; border-radius: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        .helper-btns { display: flex; gap: 10px; margin-bottom: 15px; flex-wrap: wrap; }
        #result-box { margin-top: 25px; padding: 20px; border-radius: 12px; background: #ecfdf5; border: 1px solid var(--success); display: none; }
        .result-link-wrapper { display: flex; flex-direction: column; gap: 10px; margin-top: 10px; }
        @media (min-width: 640px) { .result-link-wrapper { flex-direction: row; } }
        .toolbar { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; margin-top: 20px; padding-top: 20px; border-top: 1px solid var(--border); }
        .btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 10px 20px; border-radius: 10px; cursor: pointer; font-weight: 600; font-size: 0.9rem; border: none; text-decoration: none; }
        .btn-primary { background: var(--primary); color: white; }
        .btn-primary:hover { background: var(--primary-hover); transform: translateY(-1px); }
        .btn-outline { background: white; border: 1px solid var(--border); color: var(--text-main); }
        .btn-outline:hover { background: var(--bg); }
        .btn-danger-solid { background: var(--danger); color: white; padding: 8px 15px; font-size: 0.8rem; flex-shrink: 0; }
        .history-item { background: var(--card); padding: 18px; border-radius: 12px; margin-bottom: 12px; display: flex; flex-direction: column; gap: 15px; border: 1px solid var(--border); }
        @media (min-width: 640px) { .history-item { flex-direction: row; justify-content: space-between; align-items: center; } }
        .history-item.expired { background: #f1f5f9; border-style: dashed; opacity: 0.6; }
        .h-info { flex: 1; min-width: 0; }
        .h-title-row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-bottom: 4px; }
        .h-id-badge { background: #e0e7ff; color: var(--primary); font-size: 0.7rem; font-family: monospace; padding: 2px 6px; border-radius: 4px; font-weight: bold; }
        .h-title-text { font-weight: 700; font-size: 1rem; color: var(--text-main); word-break: break-all; }
        .tag { font-size: 0.7rem; padding: 2px 8px; border-radius: 5px; font-weight: bold; }
        .tag-burn { background: var(--danger-bg); color: var(--danger); border: 1px solid #fee2e2; }
        @media (max-width: 480px) {
            .navbar { padding: 0 12px; }
            .btn-danger-solid .admin-btn-text { display: none; }
            .toolbar { flex-direction: column; align-items: stretch; }
            .toolbar .btn { width: 100%; }
            .history-header { flex-direction: column; align-items: flex-start !important; gap: 10px; }
            .history-header .manage-btn-group { width: 100%; display: grid; grid-template-columns: 1fr 1fr; gap: 5px; }
            .history-header .btn-full-width { grid-column: span 2; }
            .h-actions { width: 100%; display: flex; flex-direction: row; flex-wrap: wrap; gap: 5px; }
            .h-actions .btn { flex: 1 1 45%; padding: 8px 5px; font-size: 0.8rem; }
            .h-actions .btn-danger-link { flex: 1 1 100%; }
        }
    </style>
</head>
<body>
    <nav class="navbar">
        <a href="/" class="brand"><span>${CONFIG.logo}</span> <span>${CONFIG.name}</span></a>
        <button class="btn btn-danger-solid" id="adminClearBtn" onclick="clearAllCloud()">
            <i class="fas fa-trash-can"></i> <span class="admin-btn-text">清除云端</span>
        </button>
    </nav>

    <div class="container">
        ${isView ? `
            <div class="card">
                ${isBurn ? `<div class="burn-banner"><i class="fas fa-fire-alt"></i> 阅后即焚模式：此内容已被销毁，关闭此页后将无法再次查看</div>` : ''}
                <div class="content-header">
                    <div style="margin-bottom: 8px;"><span class="h-id-badge" style="font-size: 0.85rem; padding: 4px 8px;">文本 ID: ${id}</span></div>
                    <h2 style="margin:0; font-size: 1.4rem; word-break: break-all;">${escapeHtml(title)}</h2>
                    <div class="meta-info">
                        <span><i class="far fa-calendar-alt"></i> 发布时间: ${timeStr} (UTC+8)</span>
                        ${isBurn ? '<span class="tag tag-burn"><i class="fas fa-bolt"></i> 阅后即焚</span>' : ''}
                    </div>
                </div>
                <div class="content-body">
                    <pre><code id="pCode">${escapeHtml(content)}</code></pre>
                    <div class="toolbar">
                        <button class="btn btn-primary" onclick="copyContent()"><i class="far fa-copy"></i> 复制全文内容</button>
                        <a href="/" class="btn btn-outline"><i class="fas fa-plus"></i> 创建新剪贴</a>
                    </div>
                </div>
            </div>
        ` : `
            <div class="card edit-area" style="padding: 20px;">
                <div class="input-group">
                    <label>标题 (选填)</label>
                    <input type="text" id="pTitle" class="t-input" placeholder="输入标题便于记录识别...">
                </div>
                <div class="input-group">
                    <label>正文内容 (必填)</label>
                    <div class="editor-container">
                        <textarea id="pEditor" placeholder="粘贴文本或代码..."></textarea>
                        <div class="editor-footer-info">
                            <label style="margin:0; cursor:pointer; display:flex; align-items:center; gap:5px; font-weight:600; color:var(--primary);">
                                <input type="checkbox" id="autoClear" style="width:14px;height:14px;" checked> 发布后清空
                            </label>
                            <span><i class="fas fa-fingerprint"></i> ID: <b id="pendingId">......</b></span>
                        </div>
                    </div>
                    <div class="helper-btns">
                        <button class="btn btn-outline" onclick="clearTitle()">清空标题</button>
                        <button class="btn btn-outline" onclick="clearEditor()">清空正文</button>
                        <button class="btn btn-outline" onclick="clearForm()">全部清空</button>
                    </div>
                </div>
                
                <div id="result-box">
                    <div style="font-weight:bold; color:var(--success); font-size: 0.9rem; margin-bottom:10px;"><i class="fas fa-check-circle"></i> 发布成功！</div>
                    <div class="result-link-wrapper">
                        <input type="text" id="sUrl" class="t-input" style="background:#fff;" readonly>
                        <button class="btn btn-primary" onclick="copyLink()">复制链接</button>
                    </div>
                    <div style="margin-top:8px; font-size:0.75rem; color:var(--text-sub);">
                        文本 ID: <span id="resId" style="font-family:monospace; font-weight:bold; color:var(--primary);"></span>
                    </div>
                </div>

                <div class="toolbar">
                    <div style="display:flex; align-items:center; gap:10px;">
                        <span style="font-size:0.9rem; font-weight:600;">保留:</span>
                        <select id="pExpire" class="t-input" style="width:auto; padding:6px 12px;">
                            <option value="3600">1 小时</option>
                            <option value="86400" selected>1 天</option>
                            <option value="604800">7 天</option>
                            <option value="1296000">15 天</option>
                            <option value="2592000">30 天</option>
                        </select>
                    </div>
                    <label style="display:flex; align-items:center; gap:10px; cursor:pointer; color:var(--danger); font-weight:bold; padding:10px 15px; border-radius:10px; background:var(--danger-bg); margin:0; font-size: 0.9rem;">
                        <input type="checkbox" id="pBurn"> 阅后即焚
                    </label>
                    <button class="btn btn-primary" id="sBtn" onclick="doSave()" style="margin-left: auto;">
                        <i class="fas fa-paper-plane"></i> 立即发布
                    </button>
                </div>
            </div>
            
            <div style="margin-top:40px">
                <div class="history-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
                    <h3 style="color:var(--text-sub); margin:0; font-size:1.1rem;"><i class="fas fa-history"></i> 本地记录</h3>
                    <div class="manage-btn-group" style="display:flex; gap:8px;">
                        <button class="btn btn-outline" onclick="revokeAllLinks()">一键撤销</button>
                        <button class="btn btn-outline" onclick="deleteExpiredLocal()">删除失效链接</button>
                        <button class="btn btn-outline btn-full-width" onclick="clearLocalHistory()">清空历史</button>
                    </div>
                </div>
                <div id="hList"></div>
            </div>
        `}
    </div>

    <script>
        const DB_KEY = 'pastes_v4';
        function escapeHtml(s) { const m = {'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#039;'}; return s ? String(s).replace(/[&<>"']/g, k => m[k]) : ""; }
        function genId() { return Math.random().toString(36).substring(2, 9); }
        let currentId = genId();
        if(document.getElementById('pendingId')) document.getElementById('pendingId').innerText = currentId;

        function clearTitle() { const t = document.getElementById('pTitle'); if(t.value && confirm("💡 确定清空标题？")) t.value=''; }
        function clearEditor() { const e = document.getElementById('pEditor'); if(e.value && confirm("💡 确定清空正文？")) e.value=''; }
        function clearForm() { if(confirm("⚠️ 确定全部清空吗？")){ document.getElementById('pTitle').value=''; document.getElementById('pEditor').value=''; } }

        async function doSave() {
            const title = document.getElementById('pTitle').value.trim() || '无标题内容';
            const content = document.getElementById('pEditor').value.trim();
            if(!content) return alert("内容不能为空！");
            const btn = document.getElementById('sBtn');
            btn.disabled = true;
            try {
                const res = await fetch('/', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: currentId, title, content, expire: parseInt(document.getElementById('pExpire').value), isBurn: document.getElementById('pBurn').checked })
                });
                const data = await res.json();
                if(data.id) {
                    document.getElementById('result-box').style.display = 'block';
                    document.getElementById('sUrl').value = window.location.origin + '/' + data.id;
                    document.getElementById('resId').innerText = data.id;
                    let list = JSON.parse(localStorage.getItem(DB_KEY) || '[]');
                    list.unshift({ id: data.id, title, url: window.location.origin + '/' + data.id, isBurn: document.getElementById('pBurn').checked, time: new Date().toLocaleString('zh-CN', {timeZone:'Asia/Shanghai'}) });
                    localStorage.setItem(DB_KEY, JSON.stringify(list.slice(0, 50)));
                    renderHistory();
                    document.getElementById('result-box').scrollIntoView({ behavior: 'smooth' });
                    currentId = genId(); if(document.getElementById('pendingId')) document.getElementById('pendingId').innerText = currentId;
                    if(document.getElementById('autoClear').checked) { document.getElementById('pTitle').value=''; document.getElementById('pEditor').value=''; }
                }
            } catch(e) { alert("发布失败"); }
            btn.disabled = false;
        }

        async function renderHistory() {
            const box = document.getElementById('hList');
            if(!box) return;
            const list = JSON.parse(localStorage.getItem(DB_KEY) || '[]');
            if(!list.length) { box.innerHTML = '<div style="text-align:center; padding:30px; color:var(--text-sub);">暂无本地记录</div>'; return; }
            let aliveMap = {};
            try {
                const ids = list.map(i => i.id);
                const checkRes = await fetch('/api/check', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ids }) });
                aliveMap = await checkRes.json();
            } catch (e) {}

            box.innerHTML = list.map(i => {
                const isAlive = aliveMap[i.id] !== false;
                return \`
                <div class="history-item \${!isAlive ? 'expired' : ''}">
                    <div class="h-info">
                        <div class="h-title-row">
                            <span class="h-id-badge">\${i.id}</span>
                            <span class="h-title-text">\${escapeHtml(i.title)}</span>
                            \${i.isBurn ? '<span class="tag tag-burn">阅后即焚</span>' : ''}
                            \${!isAlive ? '<span class="tag">已失效</span>' : ''}
                        </div>
                        <div style="font-size:0.75rem; color:#64748b;">\${i.time}</div>
                    </div>
                    <div class="h-actions">
                        \${isAlive ? \`
                            <button onclick="safeView('\${i.url}', \${i.isBurn})" class="btn btn-outline">查看内容</button>
                            <button onclick="copyToClipboard('\${i.url}', '链接')" class="btn btn-outline">复制链接</button>
                        \` : ''}
                        <button onclick="delRemote('\${i.id}')" class="btn btn-outline" style="color:var(--danger); border-color:var(--danger-bg);">删除链接</button>
                    </div>
                </div>
            \`}).join('');
        }

        async function deleteExpiredLocal() {
            if(!confirm("💡 确定清理本地所有「已失效」的记录吗？")) return;
            const list = JSON.parse(localStorage.getItem(DB_KEY) || '[]');
            try {
                const ids = list.map(i => i.id);
                const checkRes = await fetch('/api/check', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ids }) });
                const aliveMap = await checkRes.json();
                const newList = list.filter(item => aliveMap[item.id] !== false);
                localStorage.setItem(DB_KEY, JSON.stringify(newList));
                renderHistory();
            } catch(e) { alert("清理失败"); }
        }

        async function revokeAllLinks() {
            const list = JSON.parse(localStorage.getItem(DB_KEY) || '[]');
            if (!list.length || !confirm("⚠️ 确定从服务器彻底撤销这些分享链接吗？")) return;
            await Promise.all(list.map(i => fetch('/' + i.id, { method: 'DELETE' })));
            renderHistory(); alert("✅ 已撤销分享");
        }

        function safeView(url, isBurn) {
            if (isBurn) { if (confirm("⚠️ 阅后即焚提醒：进入后即刻销毁。确定查看？")) window.location.href = url; } 
            else { window.location.href = url; }
        }

        // --- 核心修复：清空云端流程控制 ---
        async function clearAllCloud() {
            if (!confirm("🚨 警告：此操作将永久清除云端服务器上的【所有】剪贴板数据！确定要继续吗？")) return;
            const pw = prompt("请输入管理员密码：");
            if (!pw) return;
            if (!confirm("😱 最后确认：您真的要清空所有云端内容吗？此操作无法恢复！")) return;

            const btn = document.getElementById('adminClearBtn');
            btn.disabled = true;
            const originalText = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 清理中...';

            try {
                const res = await fetch('/api/clear-all', { method: 'DELETE', headers: { 'Authorization': pw } });
                if(res.ok){ 
                    alert("✅ 云端数据已全部清空！"); 
                    renderHistory(); 
                } else {
                    alert("❌ 授权失败或清空过程中断");
                }
            } catch(e) { alert("❌ 网络异常"); }
            btn.disabled = false;
            btn.innerHTML = originalText;
        }

        function clearLocalHistory() { if(confirm("🧼 确定清空本地浏览器记录吗？")) { localStorage.removeItem(DB_KEY); renderHistory(); } }
        
        async function delRemote(id) { 
            if(!confirm("确定彻底删除此链接及其本地记录吗？")) return; 
            try { await fetch('/' + id, { method: 'DELETE' }); let list = JSON.parse(localStorage.getItem(DB_KEY) || '[]').filter(item => item.id !== id); localStorage.setItem(DB_KEY, JSON.stringify(list)); renderHistory(); } catch (e) {} 
        }

        function copyContent() { copyToClipboard(document.getElementById('pCode').innerText, '内容'); }
        function copyLink() { copyToClipboard(document.getElementById('sUrl').value, '分享链接'); }
        function copyToClipboard(str, type) {
            const el = document.createElement('textarea'); el.value = str; document.body.appendChild(el); el.select();
            document.execCommand('copy'); document.body.removeChild(el); alert("✅ " + type + "已成功复制");
        }
        renderHistory();
    </script>
</body>
</html>
`;
};

// --- 3. 后端处理 ---
export default {
    async fetch(request, env) {
        if (!env.PASTE_KV) return new Response("PASTE_KV 变量未绑定", { status: 500 });
        const url = new URL(request.url);
        const path = url.pathname.substring(1);

        try {
            // --- 核心优化：彻底的分页清理逻辑 ---
            if (path === "api/clear-all" && request.method === "DELETE") {
                const auth = request.headers.get("Authorization");
                if (auth !== (env.ADMIN_PASSWORD || "admin")) return new Response("Unauthorized", { status: 401 });
                
                let listComplete = false;
                let cursor = undefined;

                // 循环列出并删除，解决 1000 条限制和同步问题
                while (!listComplete) {
                    const list = await env.PASTE_KV.list({ cursor });
                    const deletePromises = list.keys.map(key => env.PASTE_KV.delete(key.name));
                    await Promise.all(deletePromises);
                    
                    listComplete = list.list_complete;
                    cursor = list.cursor;
                }
                
                return new Response("Cleared", { status: 200 });
            }

            // 存活检查
            if (path === "api/check" && request.method === "POST") {
                const { ids } = await request.json();
                const results = {};
                await Promise.all(ids.map(async (id) => {
                    const val = await env.PASTE_KV.get(id, "stream");
                    results[id] = val !== null;
                }));
                return new Response(JSON.stringify(results));
            }

            // 单条删除
            if (path && request.method === "DELETE") {
                await env.PASTE_KV.delete(path);
                return new Response("Deleted", { status: 200 });
            }

            // 查看页面
            if (path && request.method === "GET") {
                const raw = await env.PASTE_KV.get(path);
                if (!raw) return new Response("内容已失效", { status: 404 });
                let data;
                try { data = JSON.parse(raw); } catch (e) { data = { title: "兼容记录", content: raw, isBurn: false, ts: Date.now() }; }
                data.id = path;
                if (data.isBurn) await env.PASTE_KV.delete(path);
                return new Response(HTML(data, "view"), { headers: { "Content-Type": "text/html;charset=UTF-8" } });
            }

            // 发布
            if (request.method === "POST") {
                const body = await request.json();
                const id = body.id || Math.random().toString(36).substring(2, 9);
                const payload = JSON.stringify({
                    title: body.title || "无标题内容",
                    content: body.content,
                    isBurn: !!body.isBurn,
                    ts: Date.now()
                });
                await env.PASTE_KV.put(id, payload, { expirationTtl: Math.max(body.expire || 86400, 60) });
                return new Response(JSON.stringify({ id }), { headers: { "Content-Type": "application/json" } });
            }

            return new Response(HTML({}, "index"), { headers: { "Content-Type": "text/html;charset=UTF-8" } });

        } catch (err) { return new Response("Error: " + err.message, { status: 500 }); }
    }
};