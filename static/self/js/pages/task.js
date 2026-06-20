async function pageTask(params) {
  const id = params.id;
  const el = document.getElementById('page-content');
  el.innerHTML = `
    <div class="ui grid">
      <div class="sixteen wide column">
        <div class="card shadow">
          <h1 class="ui center aligned header"><span><i class="ui info icon colored"></i> 任务详情</span><div class="sub header" style="margin-top: 10px; font-family: monospace; font-size: 0.85rem;">` + id + `</div></h1>
        </div>
      </div>
    </div>
    <div class="ui grid">
      <div class="sixteen wide column">
        <div class="card shadow outline">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
            <div><strong>状态</strong> <span id="task-status" class="ui label blue">Pending</span></div>
            <div><strong>创建</strong> <span id="task-created-at" style="color: gray;">-</span></div>
            <div><strong>更新</strong> <span id="task-updated-at" style="color: gray;">-</span></div>
            <div>
              <button id="goto-btn" class="ui mini positive button" disabled><i class="ui icon paper plane"></i> 跳转</button>
              <button id="retry-btn" class="ui mini teal button" style="display:none;"><i class="ui icon redo alternate"></i> 重试</button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="ui grid">
      <div class="sixteen wide column">
        <div class="card shadow outline">
          <h3 class="ui dividing header"><i class="ui icon tasks colored"></i> 子任务</h3>
          <div id="task-subtasks" style="margin-top: 1em;"><div class="ui active centered inline loader"></div></div>
        </div>
      </div>
    </div>`;

  let targetType = null;
  let targetOid = null;

  try {
    const stored = sessionStorage.getItem('wt:' + id);
    if (stored) {
      const t = JSON.parse(stored);
      targetOid = t.targetId;
      targetType = t.type;
    }
  } catch (e) { /* ignore */ }

  function getStatusClass(status) {
    const s = (status || '').toLowerCase();
    if (s === 'pending' || s === 'created' || s === 'waiting-children' || s === 'inactive') return 'blue';
    if (s === 'processing' || s === 'running' || s === 'active') return 'yellow';
    if (s === 'completed' || s === 'success' || s === 'completed-children') return 'green';
    if (s === 'failed' || s === 'error') return 'red';
    return '';
  }

  function isTerminal(status) {
    const s = (status || '').toLowerCase();
    return s === 'completed' || s === 'success' || s === 'failed' || s === 'error';
  }

  function saveTaskCompleted(tasks) {
    if (!tasks || !Array.isArray(tasks)) return false;
    return tasks.some(function (t) {
      const name = t.jobName || t.name || '';
      const s = (t.status || '').toLowerCase();
      return name === 'save' && (s === 'completed' || s === 'success');
    });
  }

  async function fetchTask() {
    try {
      const data = await api.get('/workflow/query/' + id);
      document.getElementById('task-created-at').textContent = data.createdAt || '-';
      document.getElementById('task-updated-at').textContent = data.updatedAt || '-';

      const statusLabel = document.getElementById('task-status');
      statusLabel.className = 'ui label ' + getStatusClass(data.status);
      statusLabel.textContent = data.status || 'Pending';

      const tasks = data.tasks || [];

      let html = '';
      if (tasks.length === 0) {
        html = '<div style="text-align:center;padding:20px;color:gray;">暂无子任务信息</div>';
      } else {
        html = '<table class="ui very basic table"><thead><tr><th>任务</th><th>状态</th></tr></thead><tbody>';
        tasks.forEach(function (t) {
          const jobName = t.jobName || t.name || t.jobId || '?';
          const status = t.status || 'pending';
          html += '<tr><td><code>' + jobName + '</code></td><td><span class="ui mini label ' + getStatusClass(status) + '">' + status + '</span></td></tr>';
        });
        html += '</tbody></table>';
      }
      document.getElementById('task-subtasks').innerHTML = html;

      if (targetOid && saveTaskCompleted(tasks)) {
        document.getElementById('goto-btn').disabled = false;
      }

      if (isTerminal(data.status)) {
        document.getElementById('retry-btn').style.display = (data.status || '').toLowerCase() === 'failed' || (data.status || '').toLowerCase() === 'error' ? 'inline-block' : 'none';
        clearInterval(pollInterval);
      }
    } catch (err) {
      console.error('Task poll failed:', err);
    }
  }

  document.getElementById('goto-btn')?.addEventListener('click', function () {
    if (targetOid) {
      if (targetType === 'article') navigate('/article/' + targetOid);
      else if (targetType === 'paste') navigate('/paste/' + targetOid);
      else if (targetType === 'user') navigate('/user/' + targetOid);
      else navigate('/');
    }
  });

  document.getElementById('retry-btn')?.addEventListener('click', function () {
    const oid = targetOid;
    if (oid) {
      const template = targetType === 'article' ? 'article-save-pipeline' : targetType === 'paste' ? 'paste-save-pipeline' : 'article-save-pipeline';
      api.post('/workflow/create/template/' + template, { targetId: oid }).then(function (result) {
        sessionStorage.setItem('wt:' + result.workflowId, JSON.stringify({ targetId: oid, type: targetType }));
        Swal.fire('重试请求已入队', '新任务 ID: ' + result.workflowId, 'success');
      }).catch(function (err) {
        Swal.fire('重试失败', err.message, 'error');
      });
    }
  });

  await fetchTask();
  var pollInterval = setInterval(fetchTask, 1000);
}
