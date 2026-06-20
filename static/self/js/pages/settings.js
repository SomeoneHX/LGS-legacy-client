async function pageSettings() {
  const el = document.getElementById('page-content');
  el.innerHTML = `
    <div class="ui grid">
      <div class="sixteen wide column">
        <div class="card shadow">
          <h1 class="ui center aligned header"><span><i class="ui settings icon colored"></i> 设置</span></h1>
        </div>
      </div>
    </div>
    <div class="ui grid">
      <div class="sixteen wide column">
        <div class="card shadow outline">
          <h3 class="ui header"><i class="ui icon user colored"></i> 用户信息</h3>
          <div id="settings-user-info" style="padding: 10px;">
            <div class="ui active inverted dimmer" style="position:relative;min-height:100px;">
              <div class="ui text loader">加载中...</div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="ui grid">
      <div class="sixteen wide column">
        <div class="card shadow outline">
          <h3 class="ui header"><i class="fas fa-sign-out-alt colored"></i> 退出登录</h3>
          <p style="color:gray;">点击下方按钮清除登录凭据并退出</p>
          <button id="settings-logout-btn" class="ui red button"><i class="fas fa-sign-out-alt"></i> 退出登录</button>
        </div>
      </div>
    </div>`;

  document.getElementById('settings-logout-btn')?.addEventListener('click', function () {
    Swal.fire({ title: '确认退出', text: '确定要退出登录吗？', icon: 'warning', showCancelButton: true, confirmButtonText: '确定退出', cancelButtonText: '取消' }).then(function (result) {
      if (result.isConfirmed) logout();
    });
  });

  if (!isLoggedIn()) {
    document.getElementById('settings-user-info').innerHTML = '<p style="color:gray;text-align:center;padding:30px;">未登录 - <a href="javascript:void(0)" onclick="login()">点击登录</a></p>';
    return;
  }

  try {
    const user = await api.get('/auth/me');
    const info = user.registeredUser || user;
    const avatarUrl = user.registeredUser?.avatarUrl || '/static/self/img/default-avatar.svg';
    document.getElementById('settings-user-info').innerHTML = '<div class="meta user"><img class="ui mini circular image" src="' + avatarUrl + '" alt="avatar"><span style="margin-left:10px;font-weight:550;">洛谷UID: ' + (info.luoguUid || 'N/A') + '</span></div><p style="margin-top:10px;">权限值: ' + (user.role !== undefined ? user.role : 'N/A') + '<br/>注册用户: ' + (info.name || 'N/A') + '</p>';
  } catch (err) {
    document.getElementById('settings-user-info').innerHTML = '<p style="color:red;">获取用户信息失败: ' + (err.message || '未知错误') + '</p>';
  }
}
