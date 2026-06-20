async function pageRecent() {
  const el = document.getElementById('page-content');
  el.innerHTML = `
    <div class="ui grid">
      <div class="sixteen wide column">
        <div class="card shadow">
          <h1 class="ui center aligned header">
            <span><i class="ui history icon colored"></i> 最近更新</span>
            <div class="sub header" style="margin-top: 10px;">最新更新的文章（含置顶文章）</div>
          </h1>
        </div>
      </div>
    </div>
    <div class="ui grid" id="recent-list"></div>`;

  try {
    const data = await api.get('/article/recent?count=20');
    const articles = Array.isArray(data) ? data : (data.articles || data.data || []);
    const container = document.getElementById('recent-list');
    if (articles.length === 0) {
      container.innerHTML = '<div class="sixteen wide column"><div class="card shadow outline" style="text-align:center;padding:50px 0;"><i class="ui icon inbox" style="font-size:3rem;color:gray;"></i><div style="font-size:1.5rem;color:gray;margin-top:10px;">暂无文章</div></div></div>';
      return;
    }
    const catNames = { 1: '个人记录', 2: '题解', 3: '科技·工程', 4: '算法·理论', 5: '生活·游记', 6: '学习·文化课', 7: '休闲·娱乐', 8: '闲话' };
    let html = '';
    articles.forEach(function (a) {
      const author = a.author || {};
      html += '<div class="sixteen wide column"><div class="card shadow outline"><div style="display: flex; flex: 1;"><div><div style="width: 70px;" class="meta user"><img class="ui circular image" src="https://cdn.luogu.com.cn/upload/usericon/' + (author.id || 3) + '.png" alt="' + (author.name || '') + '"></div></div><div style="margin-left: 20px;"><a class="article-title" href="/article/' + a.id + '" style="color:#2c3e50;font-size:1.4em;font-weight:700;">' + (a.title || '无标题') + '</a><div class="article-author" style="margin-top:10px;font-size:1.15em;">@<a href="/user/' + (author.id || '') + '" class="user-' + (author.color || 'Gray') + '">' + (author.name || '未知') + '</a></div><div class="article-meta meta gray" style="margin-top:3px;"><i class="fas fa-calendar-alt"></i> <span>最后更新于 ' + (a.updated_at || '') + '</span></div>' + (a.summary ? '<div class="article-summary" style="margin-top:12px;">' + a.summary + '</div>' : '') + '<div class="article-tags" style="margin-top:10px;">' + (a.priority > 0 ? '<span class="ui red label"><i class="fas fa-angle-double-up"></i> 置顶</span> ' : '') + '<span class="ui orange label"><i class="fas fa-th"></i> ' + (catNames[a.category] || '未知分类') + '</span>' + (a.solution_for_pid ? ' <a href="https://www.luogu.com.cn/problem/' + a.solution_for_pid + '" class="ui green label"><i class="fas fa-paper-plane"></i> ' + a.solution_for_pid + '</a>' : '') + '</div></div></div></div></div>';
    });
    container.innerHTML = html;
  } catch (err) {
    document.getElementById('recent-list').innerHTML = '<div class="sixteen wide column"><div class="card shadow" style="text-align:center;padding:50px 0;"><i class="ui icon warning circle" style="font-size:3rem;color:red;"></i><div style="color:gray;margin-top:10px;">加载失败: ' + (err.message || '未知错误') + '</div></div></div>';
  }
}
