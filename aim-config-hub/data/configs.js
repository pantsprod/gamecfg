window.AimHub = window.AimHub || {};

/**
 * Профили оптимизации, доступные в выпадающем списке.
 */
window.AimHub.CONFIG_PRESETS = [
  {
    id: 'max_fps',
    name: 'Макс FPS / Киберспорт',
    description: 'Минимум визуального шума, упор в максимальный отклик и стабильность в замесах.'
  },
  {
    id: 'balanced',
    name: 'Баланс FPS и читаемости',
    description: 'Комфортная картинка с чёткими тенями/контрастом без лишней нагрузки на систему.'
  },
  {
    id: 'frametime',
    name: 'Ровный фреймтайм (без статтеров)',
    description: 'Ограничение FPS чуть выше герцовки монитора для максимально ровного графика времени кадра и меньшего нагрева.'
  }
];

/**
 * Генераторы конфигов по ID игры.
 * КАК ДОБАВИТЬ КОНФИГ ДЛЯ НОВОЙ ИГРЫ:
 * Добавьте ключ с id игры (из data/games.js) и функцию (params) => string.
 */
window.AimHub.CONFIG_TEMPLATES = {
  cs2({ sens, hz, presetId }) {
    const fpsLimit = presetId === 'frametime'
      ? Math.round(hz * 1.15)
      : (presetId === 'balanced' ? Math.max(hz * 2, 300) : 0);

    const presetTitle = presetId === 'max_fps'
      ? 'Макс FPS / Киберспорт'
      : (presetId === 'balanced' ? 'Баланс' : 'Ровный фреймтайм');

    return [
      `// ===================================================`,
      `// Aim & Config Hub — Counter-Strike 2 (${presetTitle})`,
      `// ===================================================`,
      ``,
      `// --- Ввод и чувствительность ---`,
      `sensitivity "${sens}"                 // Рассчитанная чувствительность мыши`,
      `zoom_sensitivity_ratio "1.0"          // Множитель в прицеле (база 1.0, часто ставят 0.818933)`,
      ``,
      `// --- Производительность и кадры ---`,
      `fps_max "${fpsLimit}"                        // Лимит FPS (0 = без лимита, для ${hz}Hz)`,
      `fps_max_ui "120"                      // Лимит FPS в меню (не греет GPU в лобби)`,
      `engine_low_latency_sleep_after_client_tick "true" // Стабильнее темп кадров`,
      ``,
      `// --- Сеть и телеметрия ---`,
      `rate "786432"                         // Максимальная пропускная способность`,
      `cl_hud_telemetry_frametime_show "2"   // Показывать фреймтайм при просадках`,
      `cl_hud_telemetry_net_misdelivery_show "2" // Показывать потери пакетов при лагах`,
      `cl_hud_telemetry_ping_show "2"        // Показывать пинг`,
      ``,
      `// --- Звук и интерфейс ---`,
      `snd_mute_losefocus "0"                // Не глушить звук при сворачивании (по желанию 1)`,
      `cl_autohelp "0"                       // Отключить всплывающие подсказки`,
      `gameinstructor_enable "0"             // Отключить игрового инструктора`,
      `r_drawtracers_firstperson "${presetId === 'max_fps' ? '0' : '1'}"         // Трассеры от 1-го лица`,
      ``,
      `host_writeconfig`,
      `echo ">>> Aim & Config Hub CS2 config loaded! Sens: ${sens} <<<"`
    ].join('\n');
  },

  valorant({ sens, hz, presetId }) {
    const fpsCap = presetId === 'frametime' ? `${Math.round(hz * 1.1)} FPS` : 'Без лимита (или 2x Hz)';
    return [
      `=== Aim & Config Hub — Памятка настроек Valorant ===`,
      ``,
      `[Мышь]`,
      `Чувствительность прицела: ${sens}`,
      `Буфер прямого ввода (RawInputBuffer): ВКЛ`,
      ``,
      `[Графика — ${presetId.toUpperCase()}]`,
      `Режим экрана: Полноэкранный`,
      `Многопоточный рендеринг: ВКЛ`,
      `Качество материалов / текстур / деталей: ${presetId === 'balanced' ? 'Среднее' : 'Низкое'}`,
      `Виньетка и V-Sync: ВЫКЛ`,
      `NVIDIA Reflex: Вкл + Ускорение (если нет упора в 99% GPU — просто Вкл)`,
      `Ограничение FPS в игре: ${fpsCap} (под монитор ${hz} Hz)`,
      `Повышение чёткости: ВЫКЛ (снижает лишнюю задержку рендера)`
    ].join('\n');
  },

  fortnite({ sens, hz, presetId }) {
    const fpsLimit = presetId === 'frametime' ? hz : Math.max(hz, 240);
    return [
      `; === Aim & Config Hub — Fortnite (${presetId}) ===`,
      `; Рекомендуемый блок параметров для GameUserSettings.ini`,
      ``,
      `[/Script/FortniteGame.FortGameUserSettings]`,
      `FrameRateLimit=${fpsLimit}.000000`,
      `bUseVSync=False`,
      `bMotionBlur=False`,
      `bShowGrass=False`,
      `PreferredRHI=${presetId === 'balanced' ? 'DX12' : 'PerformanceMode'}`,
      ``,
      `; Чувствительность (выставьте в меню игры):`,
      `; X-Axis / Y-Axis Sensitivity = ${sens}%`
    ].join('\n');
  },

  apex({ sens, hz, presetId }) {
    const fpsMax = presetId === 'frametime' ? Math.min(Math.round(hz * 1.05), 300) : 0;
    return [
      `// === Aim & Config Hub — Apex Legends (${presetId}) ===`,
      `mouse_sensitivity "${sens}"           // Рассчитанная чувствительность`,
      `m_rawinput "1"                        // Прямой ввод мыши`,
      `m_acceleration "0"                    // Без акселерации`,
      `fps_max "${fpsMax}"                        // Лимит FPS (0 = без лимита)`,
      `mat_vsync "0"                         // Отключить V-Sync`,
      `cl_showfps "4"                        // Компактный счётчик FPS/пинга`
    ].join('\n');
  }
};