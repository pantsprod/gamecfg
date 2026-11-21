window.AimHub = window.AimHub || {};

/**
 * Чистый модуль расчётов чувствительности.
 * Не зависит от DOM — можно переиспользовать где угодно.
 */
window.AimHub.Calculator = {
  /**
   * Рассчитать eDPI = DPI * sensitivity
   */
  calcEdpi(dpi, sens) {
    return dpi * sens;
  },

  /**
   * Рассчитать см на 360 градусов:
   * cm/360 = (360 * 2.54) / (DPI * sens * yaw)
   */
  calcCm360(dpi, sens, yaw) {
    const denom = dpi * sens * yaw;
    if (!denom || denom <= 0) return 0;
    return (360 * 2.54) / denom;
  },

  /**
   * Перенести чувствительность из одной игры/DPI в другую с сохранением см/360°
   */
  convertSensitivity({ dpiFrom, sensFrom, yawFrom, dpiTo, yawTo }) {
    if (!dpiFrom || !sensFrom || !yawFrom || !dpiTo || !yawTo) {
      return null;
    }

    const sensTo = (sensFrom * dpiFrom * yawFrom) / (dpiTo * yawTo);
    const edpiFrom = this.calcEdpi(dpiFrom, sensFrom);
    const edpiTo = this.calcEdpi(dpiTo, sensTo);
    const cm360 = this.calcCm360(dpiFrom, sensFrom, yawFrom);

    return {
      sensTo,
      edpiFrom,
      edpiTo,
      cm360
    };
  }
};