let statsData = null;
let statsSocket = null;

async function pageStatistic() {
  const el = document.getElementById('page-content');
  el.innerHTML = `
    <div class="ui grid">
      <div class="sixteen wide column">
        <div class="card shadow">
          <h1 class="ui center aligned header">
            <span><i class="ui chart bar icon colored"></i> 统计数据</span>
            <div class="sub header" style="margin-top: 10px;">REAL-TIME WORKER QUEUES</div>
          </h1>
        </div>
      </div>
    </div>
    <div class="ui stackable four column grid" id="stats-summary">
      <div class="column"><div class="card shadow outline padding-15" style="text-align:center;">
        <div class="meta gray small">连接状态</div>
        <div style="margin-top:8px;" id="stats-ws-status"><span class="ui grey label">初始化中</span></div>
        <div class="meta gray" style="margin-top:6px;font-size:12px;" id="stats-ws-hint"></div>
      </div></div>
      <div class="column"><div class="card shadow outline padding-15" style="text-align:center;">
        <div class="meta gray small">等待任务</div>
        <div style="font-size:2em;font-weight:700;margin-top:8px;color:#10233f;" id="stats-total-waiting">-</div>
        <div class="meta gray" style="margin-top:6px;font-size:12px;">等待 worker 处理的任务数</div>
      </div></div>
      <div class="column"><div class="card shadow outline padding-15" style="text-align:center;">
        <div class="meta gray small">运行任务</div>
        <div style="font-size:2em;font-weight:700;margin-top:8px;color:#10233f;" id="stats-total-active">-</div>
        <div class="meta gray" style="margin-top:6px;font-size:12px;">当前正在执行的任务数</div>
      </div></div>
      <div class="column"><div class="card shadow outline padding-15" style="text-align:center;">
        <div class="meta gray small">失败任务</div>
        <div style="font-size:2em;font-weight:700;margin-top:8px;" id="stats-total-failed">-</div>
        <div class="meta gray" style="margin-top:6px;font-size:12px;">BullMQ 保留的失败任务数</div>
      </div></div>
    </div>
    <div class="ui grid" id="stats-toolbar">
      <div class="sixteen wide column">
        <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;">
          <span class="meta gray" id="stats-last-updated">最后更新：-</span>
          <button class="ui basic button" onclick="manualRefresh()"><i class="ui icon refresh"></i> 手动刷新</button>
        </div>
      </div>
    </div>
    <div class="ui stackable three column grid" id="stats-queues">
      <div class="sixteen wide column" style="text-align:center;padding:40px 0;"><div class="ui active centered inline loader"></div></div>
    </div>`;
  statsData = null;
  await fetchStats();
  initSocket();
}

async function fetchStats() {
  try {
    statsData = await api.get('/stats/queues');
    updateUI();
  } catch (err) {
    document.getElementById('stats-queues').innerHTML = '<div class="sixteen wide column" style="text-align:center;padding:40px 0;"><i class="ui icon warning circle" style="font-size:2rem;color:red;"></i><div style="color:gray;margin-top:10px;">加载失败: ' + (err.message || '未知错误') + '</div></div>';
  }
}

function initSocket() {
  if (statsSocket) {
    statsSocket.emit('join', 'stats:queues');
    return;
  }
  const API_URL = window.__API_URL__ || '';
  statsSocket = io(API_URL, {
    path: '/websocket',
    transports: ['websocket'],
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 10000
  });
  statsSocket.on('connect', function () {
    statsSocket.emit('join', 'stats:queues');
    updateWsStatus(true);
  });
  statsSocket.on('disconnect', function () {
    updateWsStatus(false);
  });
  statsSocket.on('connect_error', function () {
    updateWsStatus(false);
  });
  statsSocket.on('reconnect_attempt', function (attempt) {
    updateWsStatus(false, '第 ' + attempt + ' 次重连');
  });
  statsSocket.on('stats:queues:update', function (data) {
    if (document.getElementById('stats-summary')) {
      statsData = data;
      updateUI();
    }
  });
}

function updateWsStatus(connected, hint) {
  var statusEl = document.getElementById('stats-ws-status');
  var hintEl = document.getElementById('stats-ws-hint');
  if (!statusEl) return;
  if (connected) {
    statusEl.innerHTML = '<span class="ui green label"><i class="ui icon check circle"></i> 已连接</span>';
    if (hintEl) hintEl.textContent = '实时通道';
  } else {
    statusEl.innerHTML = hint
      ? '<span class="ui yellow label"><i class="ui icon warning circle"></i> 重连中</span>'
      : '<span class="ui red label"><i class="ui icon remove circle"></i> 已断开</span>';
    if (hintEl) hintEl.textContent = hint || '断线后会自动重新订阅队列状态';
  }
}

function updateUI() {
  if (!statsData) return;
  var totals = { waiting: 0, active: 0, failed: 0 };
  statsData.queues.forEach(function (q) {
    totals.waiting += q.counts.waiting + q.counts.paused + q.counts.prioritized + q.counts.waitingChildren;
    totals.active += q.counts.active;
    totals.failed += q.counts.failed;
  });
  document.getElementById('stats-total-waiting').textContent = totals.waiting;
  document.getElementById('stats-total-active').textContent = totals.active;
  var failedEl = document.getElementById('stats-total-failed');
  failedEl.textContent = totals.failed;
  failedEl.style.color = totals.failed > 0 ? '#d03050' : '#10233f';
  document.getElementById('stats-last-updated').textContent = '最后更新：' + (statsData.generatedAt || '-') + '；队列池：' + (statsData.queuePoolSize || '-') + ' 个连接';
  renderQueueGrid(statsData.queues);
}

function renderQueueGrid(queues) {
  var container = document.getElementById('stats-queues');
  if (!container) return;
  if (!queues || queues.length === 0) {
    container.innerHTML = '<div class="sixteen wide column"><div class="card shadow outline" style="text-align:center;padding:40px 0;color:gray;">暂无队列数据</div></div>';
    return;
  }
  var labels = { save: '保存队列', llm: 'AI 队列', update: '更新队列', search: '搜索队列', read: '读取队列', rag: 'RAG 队列', discover: '发现队列' };
  var html = '';
  queues.forEach(function (q) {
    var st = queueStatus(q);
    html += '<div class="column"><div class="card shadow outline padding-15">';
    html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">';
    html += '<strong style="color:#10233f;">' + (labels[q.name] || q.label || q.name) + '</strong>';
    html += '<span class="ui ' + st.color + ' label">' + st.label + '</span>';
    html += '</div>';
    html += '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;">';
    html += metricCell('并发', q.concurrency);
    html += metricCell('等待', q.counts.waiting);
    html += metricCell('运行', q.counts.active);
    html += metricCell('延迟', q.counts.delayed);
    html += metricCell('依赖等待', q.counts.waitingChildren);
    html += metricCell('优先等待', q.counts.prioritized);
    html += metricCell('暂停等待', q.counts.paused);
    html += metricCell('失败', q.counts.failed, q.counts.failed > 0);
    html += metricCell('完成', q.counts.completed);
    html += '</div></div></div>';
  });
  container.innerHTML = html;
}

function metricCell(label, value, danger) {
  var c = danger ? ' style="color:#d03050;"' : '';
  return '<div style="display:flex;justify-content:space-between;align-items:center;padding:6px 8px;border:1px solid rgba(47,109,181,0.1);border-radius:6px;background:rgba(248,251,255,0.78);font-size:13px;color:#64748b;"><span>' + label + '</span><strong' + c + '>' + (value != null ? value : 0) + '</strong></div>';
}

function queueStatus(queue) {
  if (queue.isPaused || queue.counts.paused > 0) return { label: '暂停', color: 'yellow' };
  var pending = queue.counts.waiting + queue.counts.paused + queue.counts.prioritized + queue.counts.waitingChildren;
  if (pending > 0 || queue.counts.delayed > 0) return { label: '有堆积', color: 'yellow' };
  if (queue.counts.active > 0) return { label: '运行中', color: 'blue' };
  return { label: '正常', color: 'green' };
}

function manualRefresh() {
  var btn = document.querySelector('#stats-toolbar .ui.basic.button');
  if (btn) btn.classList.add('loading');
  fetchStats().finally(function () {
    if (btn) btn.classList.remove('loading');
  });
}
