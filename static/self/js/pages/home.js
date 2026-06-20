async function pageHome() {
  const el = document.getElementById('page-content');
  el.innerHTML = `
    <div class="ui grid">
      <div class="sixteen wide column">
        <div class="card shadow" style="background: linear-gradient(135deg, #e0e8ff 0%, #d6e3ff 100%);">
          <h1 class="ui center aligned header" style="font-size: 2.5em; color: #667eea;"><i class="ui icon bookmark"></i> 洛谷保存站</h1>
          <p style="color: gray; font-size: 1.2em; text-align: center;">
            Save everything, keep it alive.<br/>保存一切，让记忆常在。
          </p>
        </div>
      </div>
    </div>
    <div class="ui grid" style="margin-top: -20px;">
      <div class="eleven wide column">
        <div id="announcement-container"></div>
        <div class="card outline shadow">
          <h3 class="ui header"><i class="ui icon search colored"></i> 搜索专栏</h3>
          <div class="ui icon fluid input">
            <input type="text" id="search-input" placeholder="标题 / 内容 / 作者 UID">
            <i class="inverted circular search link icon" id="search-btn"></i>
          </div>
        </div>
        <div class="card outline shadow">
          <h3 class="ui header"><i class="ui icon newspaper colored"></i> 专栏 / 剪贴板 / 个人主页保存</h3>
          <div class="ui fluid left icon input">
            <i class="ui icon linkify"></i>
            <input type="text" id="url" placeholder="请输入洛谷专栏、剪贴板或个人主页链接">
            <button class="ui teal button" id="save-btn" style="margin-left: 10px;">保存</button>
            <button class="ui blue button" id="view-btn">查看</button>
          </div>
        </div>
      </div>
      <div class="five wide column">
        <div class="ui grid">
          <div class="row">
            <div class="card outline shadow" style="text-align: center; width: 100%;">
              <i class="ui icon newspaper colored" style="font-size: 3rem;"></i>
              <div id="home-article-count" style="font-size: 2.5rem; font-weight: 550; margin-top: 8px;">-</div>
              <div style="font-size: 1.2rem; margin-top: 12px;">专栏文章</div>
            </div>
          </div>
          <div class="row">
            <div class="card outline shadow" style="text-align: center; width: 100%;">
              <i class="ui icon paste colored" style="font-size: 3rem;"></i>
              <div id="home-paste-count" style="font-size: 2.5rem; font-weight: 550; margin-top: 8px;">-</div>
              <div style="font-size: 1.2rem; margin-top: 12px;">剪贴板</div>
            </div>
          </div>
        </div>
      </div>
    </div>`;

  document.getElementById('search-btn')?.addEventListener('click', function () {
    const q = document.getElementById('search-input').value.trim();
    if (q) navigate('/search?q=' + encodeURIComponent(q));
  });
  document.getElementById('search-input')?.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') document.getElementById('search-btn')?.click();
  });

  const urlInput = document.getElementById('url');
  document.getElementById('save-btn')?.addEventListener('click', handleSaveClick);
  document.getElementById('view-btn')?.addEventListener('click', function () {
    const url = urlInput.value.trim();
    if (!url) { Swal.fire('提示', '请输入链接', 'info'); return; }
    try {
      const { type, id } = parseUrl(url);
      navigate('/' + type + '/' + encodeURIComponent(id));
    } catch (err) {
      Swal.fire('跳转失败', err.message, 'error');
    }
  });
  urlInput?.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') document.getElementById('view-btn')?.click();
  });

  try {
    const [articleCount, pasteCount, announcement] = await Promise.all([
      api.get('/article/count'),
      api.get('/paste/count'),
      api.get('/announcement/current').catch(() => null),
    ]);
    document.getElementById('home-article-count').textContent = articleCount.count;
    document.getElementById('home-paste-count').textContent = pasteCount.count;
    const anncEl = document.getElementById('announcement-container');
    if (announcement && announcement.enabled !== false) {
      anncEl.innerHTML = '<div class="card shadow"><h3 class="ui header"><i class="ui icon bullhorn colored"></i> 公告</h3><div>' + (announcement.content || '') + '</div></div>';
    }
  } catch (err) {
    console.error('Home data fetch failed:', err);
  }
}

async function handleSaveClick() {
  const url = document.getElementById('url').value.trim();
  if (!url) { Swal.fire('提示', '请输入链接', 'info'); return; }
  try {
    const { type, id } = parseUrl(url);
    const confirmResult = await Swal.fire({ title: '确认保存', text: '确定要保存这个' + (type === 'article' ? '文章' : type === 'paste' ? '剪贴板' : '用户资料') + '吗？', icon: 'question', showCancelButton: true, confirmButtonText: '确定', cancelButtonText: '取消' });
    if (!confirmResult.isConfirmed) return;
    Swal.fire({ title: '正在保存...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
    if (type === 'user') {
      await api.post('/user/' + id + '/refresh');
      Swal.fire({ icon: 'success', title: '已加入队列', text: '用户资料正在后台刷新', timer: 3000, showConfirmButton: true });
    } else {
      const template = type === 'article' ? 'article-save-pipeline' : 'paste-save-pipeline';
      const result = await api.post('/workflow/create/template/' + template, { targetId: id });
      sessionStorage.setItem('wt:' + result.workflowId, JSON.stringify({ targetId: id, type: type }));
      Swal.fire({ title: '请求已入队', text: '任务 ID: ' + result.workflowId, icon: 'success', confirmButtonText: '查看进度', showCancelButton: true, cancelButtonText: '继续保存' }).then((r) => {
        if (r.isConfirmed) navigate('/task/' + encodeURIComponent(result.workflowId));
      });
    }
  } catch (err) {
    Swal.fire('保存失败', err.message || '网络错误', 'error');
  }
}
