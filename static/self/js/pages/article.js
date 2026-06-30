async function pageArticle(params) {
  const id = params.id;
  const el = document.getElementById('page-content');
  el.innerHTML = `
    <input type="hidden" id="url" value="article/` + id + `">
    <input type="hidden" id="markdown-content" value="">
    <div class="ui grid">
      <div class="sixteen wide column">
        <div class="card shadow outline">
          <h1 class="ui header" id="article-title">加载中...</h1>
          <span class="meta gray" id="article-meta"><i class="ui icon calendar colored"></i> </span>
          <div class="ui grid">
            <div class="eight wide column">
              <div class="card shadow outline padding-15" style="height: 90%;">
                <span class="meta gray small">作者</span>
                <div class="meta user" style="margin-top: 5px;">
                  <img class="ui mini circular image" id="article-avatar" src="https://cdn.luogu.com.cn/upload/usericon/3.png" alt="user_icon">
                  <a id="article-author"  style="margin-left: 5px; font-weight: 550;"></a>
                </div>
              </div>
            </div>
            <div class="eight wide column">
              <div class="card shadow outline padding-15" style="height: 90%; display: flex; flex-direction: column;">
                <span class="meta gray small">分类</span>
                <span style="margin-top: 5px; display: flex; flex: 1; align-items: center;" id="article-category"></span>
              </div>
            </div>
            <div class="sixteen wide column">
              <a  id="article-original-link" class="ui button" style="display:none;">
                <i class="ui icon share square"></i> 查看原专栏
              </a>
              <a  onclick="copyMarkdown()" class="ui button" id="article-copy-btn" style="display:none;">
                <i class="ui icon copy"></i> 复制原文
              </a>
              <a  id="save-btn" class="ui positive button">
                <i class="ui icon sync alternate"></i> 更新内容
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
    const data = await api.get('/article/query/' + id);
    document.getElementById('article-title').textContent = data.title || '无标题';
    document.getElementById('article-meta').innerHTML = '<i class="ui icon calendar colored"></i> 最后更新于 ' + (data.updatedAt || '');
    const avatar = document.getElementById('article-avatar');
    if (data.author) {
      avatar.src = 'https://cdn.luogu.com.cn/upload/usericon/' + (data.author.id || 3) + '.png';
      const authorEl = document.getElementById('article-author');
      authorEl.href = '/user/' + data.author.id;
      authorEl.className = 'user-' + (data.author.color || 'Gray');
      authorEl.textContent = data.author.name || '未知用户';
    }
    const catMap = { 1: ['fas fa-user', '个人记录'], 2: ['fas fa-lightbulb', '题解'], 3: ['fas fa-cogs', '科技·工程'], 4: ['fas fa-brain', '算法·理论'], 5: ['fas fa-camera', '生活·游记'], 6: ['fas fa-graduation-cap', '学习·文化课'], 7: ['fas fa-gamepad', '休闲·娱乐'], 8: ['fas fa-comments', '闲话'] };
    const cat = catMap[data.category] || ['fas fa-question', '未知分类'];
    document.getElementById('article-category').innerHTML = '<i class="' + cat[0] + '" style="margin-right: 6px; color: #667eea;"></i>' + cat[1];

    if (data.content) {
      document.getElementById('markdown-content').value = data.content;
      document.getElementById('article-original-link').style.display = '';
      document.getElementById('article-original-link').href = 'https://www.luogu.com/article/' + id;
      document.getElementById('article-copy-btn').style.display = '';
      document.getElementById('render-content').innerHTML = data.renderedContent || '<div style="text-align:center;padding:50px 0;"><i class="ui icon info circle" style="font-size:3rem;color:gray;"></i><div style="font-size:1.5rem;color:gray;margin-top:10px;">暂无渲染内容</div></div>';
    } else {
      document.getElementById('render-content').innerHTML = '<div style="text-align: center; padding: 50px 0;"><i class="ui icon info circle" style="font-size: 3rem; color: gray;"></i><div style="font-size: 1.5rem; color: gray; margin-top: 10px;">尚未保存内容</div><div style="margin-top: 10px;">请点击上方的"更新内容"按钮以保存专栏内容</div></div>';
    }
    showRenderContent();
  } catch (err) {
    if (err.code === 404) {
      document.getElementById('article-title').textContent = '文章 ' + id;
      document.getElementById('render-content').innerHTML = '<div style="text-align: center; padding: 50px 0;"><i class="ui icon info circle" style="font-size: 3rem; color: gray;"></i><div style="font-size: 1.5rem; color: gray; margin-top: 10px;">尚未保存内容</div><div style="margin-top: 10px;">请点击上方的"更新内容"按钮以保存专栏内容</div></div>';
      showRenderContent();
    } else {
      el.innerHTML = '<div class="ui grid"><div class="sixteen wide column"><div class="card shadow" style="text-align:center;padding:80px 30px;"><i class="ui icon warning circle" style="font-size:3rem;color:red;"></i><h1 style="color:gray;margin-top:20px;">加载失败</h1><p style="color:gray;">' + (err.message || '未知错误') + '</p></div></div></div>';
    }
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
      const result = await api.post('/workflow/create/template/article-save-pipeline', { targetId: id });
      sessionStorage.setItem('wt:' + result.workflowId, JSON.stringify({ targetId: id, type: 'article' }));
      Swal.fire({ title: '请求已入队', text: '任务 ID: ' + result.workflowId, icon: 'success', confirmButtonText: '查看进度', showCancelButton: true, cancelButtonText: '继续操作' }).then((r) => {
        if (r.isConfirmed) navigate('/task/' + encodeURIComponent(result.workflowId));
      });
    } catch (err) {
      Swal.fire('请求失败', err.message || '网络错误', 'error');
    }
  });

  setTimeout(function () {
    const t = document.getElementById('loader-text');
    if (t) t.textContent = '如果长时间未加载完成，请尝试 Ctrl+F5 刷新浏览器缓存。';
  }, 10000);
}
