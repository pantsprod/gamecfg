window.AimHub = window.AimHub || {};

/**
 * Модуль проверки Pro-подписки по Telegram User ID.
 *
 * КАК ПЕРЕВЕСТИ НА ПРОДАКШН (Vercel + Supabase / JSON-API):
 * 1. Создайте серверный эндпоинт, например /api/check-subscription
 * 2. Пропишите URL в API_ENDPOINT ниже
 * 3. Передавайте туда window.Telegram.WebApp.initData для серверной валидации подписи бота.
 */
window.AimHub.Subscription = {
  // Оставьте null для локального/демо-режима; для продакшна укажите '/api/check-subscription'
  API_ENDPOINT: null,

  // Локальная демо-база для тестирования всех трёх состояний (активна / истекла / нет)
  // НЕ храните здесь реальных платных клиентов в продакшне — переносите на сервер!
  DEMO_DB: {
    '111111111': { plan: 'PRO', expiresAt: '2027-12-31' },
    '222222222': { plan: 'PRO', expiresAt: '2025-01-15' }
  },

  /**
   * Проверяет статус подписки пользователя.
   * Возвращает: { active: boolean, status: 'active'|'expired'|'none', expiresAt: string|null, plan: string|null }
   */
  async checkSubscription(telegramId, rawInitData = '') {
    const idStr = String(telegramId || '').trim();
    if (!idStr) {
      return { active: false, status: 'none', expiresAt: null, plan: null };
    }

    // --- ЗАДЕЛ ПОД РЕАЛЬНЫЙ СЕРВЕР (Vercel Serverless / Supabase) ---
    if (this.API_ENDPOINT) {
      try {
        const res = await fetch(this.API_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ telegramId: idStr, initData: rawInitData })
        });
        if (!res.ok) throw new Error('API error');
        return await res.json();
      } catch (err) {
        console.error('Ошибка проверки подписки через API:', err);
        return { active: false, status: 'none', expiresAt: null, plan: null };
      }
    }

    // --- ЛОКАЛЬНАЯ ПРОВЕРКА (для старта и тестов) ---
    const record = this.DEMO_DB[idStr];
    if (!record) {
      return { active: false, status: 'none', expiresAt: null, plan: null };
    }

    const now = new Date();
    const exp = new Date(record.expiresAt + 'T23:59:59');
    const isActive = exp.getTime() >= now.getTime();

    return {
      active: isActive,
      status: isActive ? 'active' : 'expired',
      expiresAt: record.expiresAt,
      plan: record.plan
    };
  }
};