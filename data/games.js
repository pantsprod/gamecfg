window.AimHub = window.AimHub || {};

/**
 * База игр для калькулятора чувствительности.
 * yaw — сколько градусов камера поворачивается на 1 отсчёт сенсора (dot/count) при sensitivity = 1.
 *
 * КАК ДОБАВИТЬ НОВУЮ ИГРУ:
 * Просто добавьте новый объект в массив ниже — интерфейс подхватит её автоматически.
 */
window.AimHub.GAMES = [
  {
    id: 'cs2',
    name: 'Counter-Strike 2',
    shortName: 'CS2',
    yaw: 0.022,
    decimals: 3,
    defaultSens: 1.0,
    supportsCfgFile: true,
    cfgFilename: 'autoexec.cfg',
    installPath: 'Путь установки: Steam\\steamapps\\common\\Counter-Strike Global Offensive\\game\\csgo\\cfg\\autoexec.cfg (+ параметр запуска +exec autoexec.cfg)'
  },
  {
    id: 'valorant',
    name: 'Valorant',
    shortName: 'Valorant',
    yaw: 0.07,
    decimals: 3,
    defaultSens: 0.314,
    supportsCfgFile: false,
    cfgFilename: 'valorant_profile.txt',
    installPath: 'В Valorant нет прямого .cfg — скопируйте или сохраните памятку и примените параметры в меню «Настройки → Общие / Видео».'
  },
  {
    id: 'fortnite',
    name: 'Fortnite (% X/Y)',
    shortName: 'Fortnite',
    yaw: 0.005555,
    decimals: 2,
    defaultSens: 3.96,
    supportsCfgFile: true,
    cfgFilename: 'GameUserSettings_snippet.ini',
    installPath: 'Блок параметров для %LOCALAPPDATA%\\FortniteGame\\Saved\\Config\\WindowsClient\\GameUserSettings.ini (перед заменой сделайте бэкап файла).'
  },
  {
    id: 'apex',
    name: 'Apex Legends',
    shortName: 'Apex',
    yaw: 0.022,
    decimals: 3,
    defaultSens: 1.0,
    supportsCfgFile: true,
    cfgFilename: 'autoexec.cfg',
    installPath: 'Путь установки: папка игры Apex\\cfg\\autoexec.cfg (+ параметр запуска +exec autoexec)'
  }
];