async function pageAdmin() {
  const el = document.getElementById('page-content');
  el.innerHTML = `
    <div class="ui grid">
      <div class="sixteen wide column">
        <div class="card shadow">
          <h1 class="ui center aligned header"><span><i class="ui cog icon colored"></i>管理后台</span><div class="sub header" style="margin-top: 10px;">系统管理控制面板</div></h1>
        </div>
      </div>
    </div>
    <div class="ui grid">
      <div class="eight wide column">
        <div class="card shadow">
          <h3 class="ui header"><i class="ui icon tasks colored"></i> 队列状态</h3>
          <div id="queue-stats" style="text-align:center;padding:20px;">加载中...</div>
        </div>
      </div>
      <div class="eight wide column">
        <div class="card shadow">
          <h3 class="ui header"><i class="ui icon bullhorn colored"></i> 公告管理</h3>
          <div style="margin-bottom:10px;">
            <textarea id="admin-announcement-content" class="ui fluid input" style="width:100%;min-height:100px;padding:10px;border:1px solid #e2e8f0;border-radius:8px;font-family:inherit;" placeholder="公告内容（支持 HTML）"></textarea>
          </div>
          <div class="ui toggle checkbox" style="margin-bottom:10px;display:block;">
            <input type="checkbox" id="admin-announcement-enabled">
            <label>启用公告</label>
          </div>
          <button id="admin-save-announcement" class="ui primary button"><i class="ui icon save"></i> 保存公告</button>
        </div>
      </div>
    </div>
    <div class="ui grid">
      <div class="sixteen wide column">
        <div class="card shadow">
          <h3 class="ui header"><i class="ui icon users colored"></i> 用户信息</h3>
          <div id="admin-user-info" style="padding:10px;">
            <button id="admin-refresh-user" class="ui button"><i class="ui icon refresh"></i> 刷新用户信息</button>
          </div>
        </div>
      </div>
    </div>`;

  try {
    const queues = await api.get('/stats/queues');
    const q = queues.queues || queues;
    const qArr = Array.isArray(q) ? q : Object.values(q);
    let qHtml = '';
    qArr.forEach(function (queue) {
      qHtml += '<div style="margin:10px 0;padding:10px;background:#f8fafc;border-radius:8px;"><strong>' + (queue.name || queue.queue || 'default') + '</strong><br/><span>等待: ' + (queue.waiting || 0) + ' | 活跃: ' + (queue.active || 0) + ' | 已完成: ' + (queue.completed || 0) + ' | 失败: ' + (queue.failed || 0) + '</span></div>';
    });
    document.getElementById('queue-stats').innerHTML = qHtml || '<p>暂无队列数据</p>';
  } catch (err) {
    document.getElementById('queue-stats').innerHTML = '<p style="color:red;">加载失败: ' + (err.message || '未知错误') + '</p>';
  }

  try {
    const announcement = await api.get('/admin/announcement').catch(() => null);
    if (announcement) {
      document.getElementById('admin-announcement-content').value = announcement.content || '';
      document.getElementById('admin-announcement-enabled').checked = announcement.enabled !== false;
    }
  } catch (e) { /* noop */ }

  document.getElementById('admin-save-announcement')?.addEventListener('click', async function () {
    const content = document.getElementById('admin-announcement-content').value;
    const enabled = document.getElementById('admin-announcement-enabled').checked;
    try {
      await api.put('/admin/announcement', { content, enabled });
      Swal.fire('成功', '公告更新成功', 'success');
    } catch (err) {
      Swal.fire('失败', err.message || '更新失败', 'error');
    }
  });

  document.getElementById('admin-refresh-user')?.addEventListener('click', async function () {
    try {
      const user = await api.get('/auth/me');
      document.getElementById('admin-user-info').innerHTML = '<p>UID: ' + (user.uid || 'N/A') + '<br/>Role: ' + (user.role !== undefined ? user.role : 'N/A') + '</p><button id="admin-refresh-user" class="ui button"><i class="ui icon refresh"></i> 刷新用户信息</button>';
    } catch (err) {
      Swal.fire('获取失败', err.message, 'error');
    }
  });
}
