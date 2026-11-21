(function () {
  const { GAMES, CONFIG_PRESETS, CONFIG_TEMPLATES, MANUAL_DATA, Calculator, Subscription } = window.AimHub;

  const state = {
    isTelegram: false,
    tg: null,
    telegramId: '111111111', // Дефолтный демо-ID для браузера
    rawInitData: '',
    lastConvertedSens: 0.314,
    lastTargetGameId: 'valorant',
    activeManualSection: 'restore'
  };

  // --- Утилиты ---
  const $ = (id) => document.getElementById(id);

  function showToast(message) {
    const toast = $('toast');
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(showToast._timer);
    showToast._timer = setTimeout(() => toast.classList.remove('show'), 2200);
  }

  async function copyText(text, successMsg) {
    try {
      await navigator.clipboard.writeText(text);
      showToast(successMsg);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      showToast(successMsg);
    }
  }

  function downloadFile(filename, content) {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function getGameById(id) {
    return GAMES.find((g) => g.id === id) || GAMES[0];
  }

  // --- 1. Инициализация Telegram WebApp SDK + Fallback ---
  function initTelegram() {
    const tg = window.Telegram && window.Telegram.WebApp;
    const tgUser = tg && tg.initDataUnsafe && tg.initDataUnsafe.user;

    if (tg && tgUser && tgUser.id) {
      state.isTelegram = true;
      state.tg = tg;
      state.telegramId = String(tgUser.id);
      state.rawInitData = tg.initData || '';

      tg.ready();
      tg.expand();

      const username = tgUser.username ? `@${tgUser.username}` : tgUser.first_name;
      $('env-badge').textContent = `Telegram Mini App • ${username}`;
      $('demo-panel').classList.add('hidden');
    } else {
      state.isTelegram = false;
      $('env-badge').textContent = 'Браузерный тест-режим (без Telegram)';
      $('demo-id-input').value = state.telegramId;
    }

    updateDisplayedId();
  }

  function updateDisplayedId() {
    $('tg-id-display').textContent = state.telegramId || '—';
    $('paywall-tg-id').textContent = state.telegramId || '—';
  }

  // --- 2. Навигация по вкладкам ---
  function initTabs() {
    document.querySelectorAll('.tab-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const target = btn.dataset.tab;
        document.querySelectorAll('.tab-btn').forEach((b) => b.classList.toggle('active', b === btn));
        document.querySelectorAll('.tab-panel').forEach((p) => p.classList.toggle('active', p.id === `tab-${target}`));
      });
    });
  }

  // --- 3. Калькулятор сенсы и eDPI ---
  function initCalculator() {
    const fromSelect = $('game-from');
    const toSelect = $('game-to');

    GAMES.forEach((game) => {
      fromSelect.add(new Option(game.name, game.id));
      toSelect.add(new Option(game.name, game.id));
    });

    fromSelect.value = 'cs2';
    toSelect.value = 'valorant';

    const recalc = () => {
      const gameFrom = getGameById(fromSelect.value);
      const gameTo = getGameById(toSelect.value);
      const dpiFrom = parseFloat($('dpi-from').value);
      const sensFrom = parseFloat($('sens-from').value);
      const dpiTo = parseFloat($('dpi-to').value);

      const res = Calculator.convertSensitivity({
        dpiFrom,
        sensFrom,
        yawFrom: gameFrom.yaw,
        dpiTo,
        yawTo: gameTo.yaw
      });

      $('result-game-name').textContent = gameTo.shortName;

      if (!res) {
        $('result-sens').textContent = '—';
        $('stat-edpi-from').textContent = '—';
        $('stat-edpi-to').textContent = '—';
        $('stat-cm360').textContent = '—';
        return;
      }

      const formattedSens = res.sensTo.toFixed(gameTo.decimals);
      state.lastConvertedSens = formattedSens;
      state.lastTargetGameId = gameTo.id;

      $('result-sens').textContent = formattedSens;
      $('stat-edpi-from').textContent = Math.round(res.edpiFrom);
      $('stat-edpi-to').textContent = res.edpiTo.toFixed(1);
      $('stat-cm360').textContent = `${res.cm360.toFixed(2)} см`;
    };

    ['game-from', 'game-to', 'dpi-from', 'sens-from', 'dpi-to'].forEach((id) => {
      $(id).addEventListener('input', recalc);
      $(id).addEventListener('change', recalc);
    });

    $('swap-games-btn').addEventListener('click', () => {
      const tmp = fromSelect.value;
      fromSelect.value = toSelect.value;
      toSelect.value = tmp;
      if (state.lastConvertedSens) {
        $('sens-from').value = state.lastConvertedSens;
      }
      recalc();
    });

    $('sync-dpi-btn').addEventListener('click', () => {
      $('dpi-to').value = $('dpi-from').value;
      recalc();
      showToast('Целевой DPI синхронизирован');
    });

    $('copy-sens-btn').addEventListener('click', () => {
      copyText(String(state.lastConvertedSens), `Сенса ${state.lastConvertedSens} скопирована`);
    });

    $('apply-to-cfg-btn').addEventListener('click', () => {
      $('cfg-game').value = state.lastTargetGameId;
      $('cfg-sens').value = state.lastConvertedSens;
      renderConfig();
      document.querySelector('.tab-btn[data-tab="config"]').click();
      showToast('Сенса перенесена в генератор конфига');
    });

    recalc();
  }

  // --- 4. Генератор конфигов и экспорт .cfg ---
  function initConfigGenerator() {
    const gameSelect = $('cfg-game');
    const presetSelect = $('cfg-preset');

    GAMES.forEach((game) => gameSelect.add(new Option(game.name, game.id)));
    CONFIG_PRESETS.forEach((p) => presetSelect.add(new Option(p.name, p.id)));

    gameSelect.value = 'cs2';
    presetSelect.value = 'max_fps';

    ['cfg-game', 'cfg-preset', 'cfg-sens', 'cfg-hz'].forEach((id) => {
      $(id).addEventListener('input', renderConfig);
      $(id).addEventListener('change', renderConfig);
    });

    $('download-cfg-btn').addEventListener('click', () => {
      const game = getGameById($('cfg-game').value);
      const content = $('cfg-preview').textContent;
      downloadFile(game.cfgFilename, content);
      showToast(`Файл ${game.cfgFilename} скачан`);
    });

    $('copy-cfg-btn').addEventListener('click', () => {
      copyText($('cfg-preview').textContent, 'Конфиг скопирован в буфер');
    });

    $('send-tg-cfg-btn').addEventListener('click', () => {
      const game = getGameById($('cfg-game').value);
      const content = $('cfg-preview').textContent;
      const payload = JSON.stringify({
        action: 'send_config',
        game: game.id,
        filename: game.cfgFilename,
        sens: $('cfg-sens').value,
        preset: $('cfg-preset').value,
        content
      });

      // Отправка боту работает при открытии Mini App через KeyboardButton;
      // при открытии из меню/браузера делаем автоматический fallback-скачивание.
      if (state.isTelegram && state.tg && typeof state.tg.sendData === 'function') {
        try {
          state.tg.sendData(payload);
          showToast('Конфиг отправлен боту');
          return;
        } catch (err) {
          console.warn('sendData недоступен в этом режиме запуска:', err);
        }
      }

      downloadFile(game.cfgFilename, content);
      showToast('Вне режима бота-кнопки: файл скачан напрямую');
    });

    renderConfig();
  }

  function renderConfig() {
    const game = getGameById($('cfg-game').value);
    const preset = CONFIG_PRESETS.find((p) => p.id === $('cfg-preset').value) || CONFIG_PRESETS[0];
    const sens = $('cfg-sens').value || game.defaultSens;
    const hz = parseInt($('cfg-hz').value, 10) || 144;

    $('cfg-preset-desc').textContent = preset.description;
    $('cfg-filename-label').textContent = game.cfgFilename;
    $('cfg-support-tag').textContent = game.supportsCfgFile ? 'Экспорт .cfg / .ini' : 'Текстовый пресет';
    $('cfg-install-path').textContent = game.installPath;

    const builder = CONFIG_TEMPLATES[game.id];
    const output = builder
      ? builder({ sens, hz, presetId: preset.id })
      : `// Шаблон для ${game.name} ещё не добавлен в data/configs.js`;

    $('cfg-preview').textContent = output;
  }

  // --- 5. Pro-подписка и мануал ---
  async function refreshSubscription() {
    const result = await Subscription.checkSubscription(state.telegramId, state.rawInitData);
    const pill = $('sub-status-pill');
    const title = $('sub-status-title');
    const meta = $('sub-status-meta');
    const paywall = $('pro-paywall');
    const manualContent = $('pro-manual-content');

    if (result.active) {
      title.textContent = 'Pro-доступ активен';
      meta.textContent = `Тариф: ${result.plan || 'PRO'} • Действует до ${result.expiresAt}`;
      pill.textContent = 'Активна';
      pill.className = 'status-pill active';
      paywall.classList.add('hidden');
      manualContent.classList.remove('hidden');
      renderManualSection(state.activeManualSection);
    } else if (result.status === 'expired') {
      title.textContent = 'Подписка истекла';
      meta.textContent = `Срок действия закончился ${result.expiresAt}. Продлите доступ по вашему Telegram ID.`;
      pill.textContent = 'Истекла';
      pill.className = 'status-pill inactive';
      paywall.classList.remove('hidden');
      manualContent.classList.add('hidden');
    } else {
      title.textContent = 'Базовый доступ';
      meta.textContent = 'Калькулятор и генератор конфигов бесплатны. Для мануала нужна Pro-подписка.';
      pill.textContent = 'Нет PRO';
      pill.className = 'status-pill inactive';
      paywall.classList.remove('hidden');
      manualContent.classList.add('hidden');
    }
  }

  function renderManualSection(sectionKey) {
    state.activeManualSection = sectionKey;
    const section = MANUAL_DATA[sectionKey];
    if (!section) return;

    document.querySelectorAll('.subtab-btn').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.section === sectionKey);
    });

    $('manual-banner').innerHTML = `
      <div class="banner ${section.bannerType}">
        <strong>${section.badge}:</strong> ${section.bannerText}
      </div>
    `;

    $('manual-articles').innerHTML = section.items
      .map((item) => {
        const warningHtml = item.warning
          ? `<div class="manual-block warning"><strong>Внимание:</strong> ${item.warning}</div>`
          : '';
        return `
          <article class="manual-card">
            <div class="manual-card-head">
              <h4>${item.title}</h4>
              <span class="risk-tag ${sectionKey}">${section.badge}</span>
            </div>
            ${warningHtml}
            <div class="manual-block"><strong>Что делать:</strong> ${item.doSteps}</div>
            <div class="manual-block"><strong>Проверка:</strong> ${item.verify}</div>
            <div class="manual-block rollback"><strong>Откат:</strong> ${item.rollback}</div>
          </article>
        `;
      })
      .join('');
  }

  function initProSection() {
    $('copy-id-btn').addEventListener('click', () => {
      copyText(state.telegramId, `ID ${state.telegramId} скопирован`);
    });

    $('paywall-copy-btn').addEventListener('click', () => {
      copyText(state.telegramId, `ID ${state.telegramId} скопирован`);
    });

    $('demo-check-btn').addEventListener('click', () => {
      state.telegramId = $('demo-id-input').value.trim();
      updateDisplayedId();
      refreshSubscription();
    });

    document.querySelectorAll('.chip[data-demo-id]').forEach((chip) => {
      chip.addEventListener('click', () => {
        state.telegramId = chip.dataset.demoId;
        $('demo-id-input').value = state.telegramId;
        updateDisplayedId();
        refreshSubscription();
      });
    });

    document.querySelectorAll('.subtab-btn').forEach((btn) => {
      btn.addEventListener('click', () => renderManualSection(btn.dataset.section));
    });

    refreshSubscription();
  }

  // --- Старт приложения ---
  document.addEventListener('DOMContentLoaded', () => {
    initTelegram();
    initTabs();
    initCalculator();
    initConfigGenerator();
    initProSection();
  });
})();