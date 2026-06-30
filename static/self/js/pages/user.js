async function pageUser(params) {
  const id = params.id;
  const el = document.getElementById('page-content');
  el.innerHTML = `
    <input type="hidden" id="url" value="/user/` + id + `">
    <input type="hidden" id="markdown-content" value="">
    <div class="ui grid">
      <div class="sixteen wide column">
        <div class="card shadow outline">
          <h1 class="ui header" id="user-title">加载中...</h1>
          <span class="meta gray" id="user-meta"><i class="ui icon calendar colored"></i> </span>
          <div class="ui grid">
            <div class="sixteen wide column">
              <div class="card shadow outline padding-15" style="height: 90%;">
                <span class="meta gray small">用户信息</span>
                <div class="meta user" style="margin-top: 5px;">
                  <img class="ui mini circular image" id="user-avatar" src="https://cdn.luogu.com.cn/upload/usericon/3.png" alt="user_icon">
                  <a id="user-link"  style="margin-left: 5px; font-weight: 550;"></a>
                </div>
              </div>
            </div>
            <div class="sixteen wide column">
              <a  id="user-original-link" class="ui button" style="display:none;">
                <i class="ui icon share square"></i> 查看原主页
              </a>
              <a  onclick="copyMarkdown()" class="ui button" id="user-copy-btn" style="display:none;">
                <i class="ui icon copy"></i> 复制原文
              </a>
              <a  id="save-btn" class="ui positive button">
                <i class="ui icon sync alternate"></i> 更新资料
              </a>
            </div>
          </div>
        </div>
        <div class="card shadow outline md-container" id="render-container" style="min-height: 200px; position: relative;">
          <div class="ui active inverted dimmer" id="render-loader">
            <div class="ui text loader" id="loader-text">等待网页内容加载完成...</div>
          </div>
          <div id="render-content" class="ui transition hidden" style="display: none;"></div>
        </div>
      </div>
    </div>`;

  try {
    const data = await api.get('/user/query/' + id);
    document.getElementById('user-title').textContent = (data.name || '用户 ' + id) + ' 的个人主页';
    document.getElementById('user-meta').innerHTML = '<i class="ui icon calendar colored"></i> 最后更新于 ' + (data.updatedAt || '');
    const avatar = document.getElementById('user-avatar');
    avatar.src = 'https://cdn.luogu.com.cn/upload/usericon/' + (data.uid || id || 3) + '.png';
    const linkEl = document.getElementById('user-link');
    linkEl.href = 'https://www.luogu.com.cn/user/' + (data.uid || id);
    linkEl.className = 'user-' + (data.color || 'Gray');
    linkEl.textContent = data.name || '用户 ' + id;
    document.getElementById('user-original-link').href = 'https://www.luogu.com.cn/user/' + (data.uid || id);
    document.getElementById('user-original-link').style.display = '';
    if (data.introduction) {
      document.getElementById('markdown-content').value = data.introduction;
      document.getElementById('user-copy-btn').style.display = '';
      document.getElementById('render-content').innerHTML = data.renderedIntroduction || '<div style="text-align:center;padding:50px 0;">暂无介绍</div>';
    } else {
      document.getElementById('render-content').innerHTML = '<div style="text-align: center; padding: 50px 0;"><i class="ui icon info circle" style="font-size: 3rem; color: gray;"></i><div style="font-size: 1.5rem; color: gray; margin-top: 10px;">尚未保存内容</div><div style="margin-top: 10px;">请点击上方的"更新资料"按钮以保存用户资料</div></div>';
    }
    showRenderContent();
  } catch (err) {
    el.innerHTML = '<div class="ui grid"><div class="sixteen wide column"><div class="card shadow" style="text-align:center;padding:80px 30px;"><i class="ui icon warning circle" style="font-size:3rem;color:red;"></i><h1 style="color:gray;margin-top:20px;">加载失败</h1><p style="color:gray;">' + (err.message || '未知错误') + '</p></div></div></div>';
  }

  function showRenderContent() {
    const loader = document.getElementById('render-loader');
    const content = document.getElementById('render-content');
    const container = document.getElementById('render-container');
    if (loader) loader.classList.remove('active');
    content.style.display = 'block';
    container.style.minHeight = 'auto';
    if (window.$ && $(content).transition) $(content).transition('fade in');
    if (typeof renderAll === 'function') renderAll();
  }

  document.getElementById('save-btn')?.addEventListener('click', async function () {
    try {
      Swal.fire({ title: '正在提交...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
      await api.post('/user/' + id + '/refresh');
      Swal.fire({ icon: 'success', title: '已加入队列', text: '用户资料正在后台刷新，稍后刷新页面即可查看', timer: 3000, showConfirmButton: true });
    } catch (err) {
      Swal.fire('请求失败', err.message || '网络错误', 'error');
    }
  });

  setTimeout(function () {
    const t = document.getElementById('loader-text');
    if (t) t.textContent = '如果长时间未加载完成，请尝试 Ctrl+F5 刷新浏览器缓存。';
  }, 10000);
}
