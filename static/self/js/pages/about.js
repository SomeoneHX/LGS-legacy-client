async function pageAbout() {
  const el = document.getElementById('page-content');
  let articleCount = 0;
  let pasteCount = 0;
  try {
    const [a, p] = await Promise.all([api.get('/article/count'), api.get('/paste/count')]);
    articleCount = a.count || 0;
    pasteCount = p.count || 0;
  } catch (e) { /* ignore */ }
  el.innerHTML = `
    <div class="ui grid">
      <div class="sixteen wide column">
        <div class="card shadow">
          <h1 class="ui center aligned header"><span><i class="ui icon info circle colored"></i> 关于洛谷保存站</span></h1>
        </div>
      </div>
    </div>
    <div class="ui grid">
      <div class="sixteen wide column">
        <div class="card shadow outline">
          <h3 class="ui header">站点简介</h3>
          <p>本站点是洛谷保存站旧版前端的重开发，将旧版的前端界面连接上新版保存站的API，可以用于怀旧。因为新版保存站采用了前后端分离的模式，且提供了全面的API，因此得以实现本项目。</p>
          <h3 class="ui header">保存站简介</h3>
          <p>洛谷保存站（Luogu Saver）是一个对洛谷公开内容进行存档的开源项目。本站旨在保存洛谷平台上的专栏文章、剪贴板等内容，防止因源站内容删除或修改而导致信息丢失。</p>
          <h3 class="ui header">数据统计</h3>
          <div class="ui two column stackable grid">
            <div class="column"><div class="card shadow outline" style="text-align:center;"><i class="ui icon newspaper colored" style="font-size:2rem;"></i><div style="font-size:1.5rem;font-weight:550;">` + articleCount + `</div><div>已存档专栏</div></div></div>
            <div class="column"><div class="card shadow outline" style="text-align:center;"><i class="ui icon paste colored" style="font-size:2rem;"></i><div style="font-size:1.5rem;font-weight:550;">` + pasteCount + `</div><div>已存档剪贴板</div></div></div>
          </div>
          <h3 class="ui header">技术栈</h3>
          <p>jQuery · Semantic UI · KaTeX · Shiki · Font Awesome</p>
          <h3 class="ui header">链接</h3>
          <p><a href="https://github.com/SomeoneHX/LGS-legacy-client" target="_blank" class="footer-link"><i class="fab fa-github"></i> GitHub 仓库</a></p>
          <p><a href="https://github.com/laikit-dev/luogu-saver" target="_blank" class="footer-link"><i class="fab fa-github"></i> 旧版保存站 GitHub 仓库</a></p>
          <p><a href="https://github.com/Ark-Aak/luogu-saver-next" target="_blank" class="footer-link"><i class="fab fa-github"></i> 新版保存站 GitHub 仓库</a></p>
        </div>
      </div>
    </div>`;
}
