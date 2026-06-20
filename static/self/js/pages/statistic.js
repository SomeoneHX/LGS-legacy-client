async function pageStatistic() {
  const el = document.getElementById('page-content');
  el.innerHTML = `
    <div class="ui center aligned grid">
      <div class="four wide column">
        <div class="card outline shadow padding-10" style="text-align: center;">
          <div style="margin-top: 12px;"><i class="ui icon newspaper colored"></i>专栏文章</div>
          <div id="stat-article-total" class="number" style="font-size:2.3rem;font-weight:520;margin-top:25px;">-</div>
        </div>
      </div>
      <div class="four wide column">
        <div class="card outline shadow padding-10" style="text-align: center;">
          <div style="margin-top: 12px;"><i class="ui icon paste colored"></i>剪贴板内容</div>
          <div id="stat-paste-total" class="number" style="font-size:2.3rem;font-weight:520;margin-top:25px;">-</div>
        </div>
      </div>
      <div class="four wide column">
        <div class="card outline shadow padding-10" style="text-align: center;">
          <div style="margin-top: 12px;"><i class="ui icon database colored"></i>数据总量</div>
          <div id="stat-grand-total" class="number" style="font-size:2.3rem;font-weight:520;margin-top:25px;">-</div>
        </div>
      </div>
    </div>`;

  try {
    const [articleData, pasteData] = await Promise.all([
      api.get('/article/count'),
      api.get('/paste/count')
    ]);
    const aCount = articleData.count || 0;
    const pCount = pasteData.count || 0;
    document.getElementById('stat-article-total').textContent = aCount;
    document.getElementById('stat-paste-total').textContent = pCount;
    document.getElementById('stat-grand-total').textContent = aCount + pCount;
  } catch (err) {
    document.getElementById('stat-article-total').textContent = '错误';
    document.getElementById('stat-paste-total').textContent = '错误';
    document.getElementById('stat-grand-total').textContent = '错误';
  }
}
