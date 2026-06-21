async function pageToken() {
  const el = document.getElementById('page-content');
  const loggedIn = isLoggedIn();
  let userHtml = '';

  if (loggedIn) {
    try {
      const user = await api.get('/auth/me');
      const name = user.registeredUser?.name || '用户 ' + user.uid;
      userHtml = '<div class="ui positive message"><div class="header"><i class="check circle icon"></i> 已登录</div><p>当前登录账号：' + name + '</p><p>你的 Token 已保存在浏览器本地存储中，无需重复获取。</p></div>';
    } catch {
      userHtml = '<div class="ui warning message"><div class="header"><i class="exclamation triangle icon"></i> Token 可能已失效</div><p>未能验证你的登录状态，请重新获取 Token 并登录。</p></div>';
    }
  } else {
    userHtml = '<div class="ui info message"><div class="header"><i class="info circle icon"></i> 未登录</div><p>你尚未登录，请按照上方步骤获取 Token 后，点击左侧侧栏的「登录账号」并粘贴 Token 完成登录。</p></div>';
  }

  el.innerHTML = `
    <div class="ui grid">
      <div class="sixteen wide column">
        <div class="card shadow">
          <h1 class="ui center aligned header">
            <span><i class="ui search icon colored"></i> Token 申请</span>
            <div class="sub header" style="margin-top:10px;">获取在洛谷保存站的唯一识别凭据</div>
          </h1>
        </div>
      </div>
    </div>
    <div class="ui grid">
      <div class="sixteen wide column">
        <div class="card shadow outline">
          <h3 class="ui header"><i class="fas fa-list-ol colored"></i> 获取 Token 步骤</h3>
          <div class="ui ordered list">
            <div class="item" style="padding:8px 0;">打开浏览器，访问 <a href="https://www.luogu.me" target="_blank">www.luogu.me</a> 并登录你的账号。</div>
            <div class="item" style="padding:8px 0;">按下键盘上的 <code>F12</code> 打开开发者工具。</div>
            <div class="item" style="padding:8px 0;">切换到 <strong>「应用」(Application)</strong> 标签页（Chrome/Edge）或 <strong>「存储」(Storage)</strong> 标签页（Firefox）。</div>
            <div class="item" style="padding:8px 0;">在左侧导航中找到 <strong>「本地存储」(Local Storage)</strong>，展开后点击 <code>www.luogu.me</code>。</div>
            <div class="item" style="padding:8px 0;">在右侧键值列表中找到键名为 <code>auth_token</code> 的条目。</div>
            <div class="item" style="padding:8px 0;">双击 <strong>「值」(Value)</strong> 列全选复制，或右键 → 复制值。</div>
          </div>
        </div>
      </div>
    </div>
    <div class="ui grid">
      <div class="sixteen wide column">
        <div class="card shadow outline">
          <h3 class="ui header"><i class="fas fa-exclamation-triangle colored"></i> 注意事项</h3>
          <div class="ui bulleted list">
            <div class="item" style="padding:4px 0;">Token 是你的身份凭据，<strong>请勿泄露给他人</strong>。</div>
            <div class="item" style="padding:4px 0;">Token 会过期，过期后需在 <code>www.luogu.me</code> 重新登录并再次获取。</div>
            <div class="item" style="padding:4px 0;">如果发现 Token 泄露或异常，请联系保存站管理员使 Token 失效后重新生成。</div>
            <div class="item" style="padding:4px 0;">已登录状态下侧栏会显示你的头像，点击可退出登录。</div>
          </div>
        </div>
      </div>
    </div>
    <div class="ui grid">
      <div class="sixteen wide column">
        <div class="card shadow outline">
          <h3 class="ui header"><i class="fas fa-user-circle colored"></i> 当前状态</h3>
          ` + userHtml + `
        </div>
      </div>
    </div>`;
}
