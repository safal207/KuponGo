const WebSocket = require('ws');
const cbor = require('cbor');

/**
 * LiminalDB WebSocket Client для KuponGo
 * Поддерживает JSON и CBOR форматы
 */
class LiminalClient {
  constructor(url = 'ws://127.0.0.1:8787', options = {}) {
    this.url = url;
    this.ws = null;
    this.authenticated = false;
    this.namespace = options.namespace || 'alpha';
    this.keyId = options.keyId || 'kupongo-api';
    this.secret = options.secret || 'changeme';
    this.format = options.format || 'json'; // 'json' или 'cbor'

    this.eventHandlers = new Map();
    this.pendingRequests = new Map();
    this.requestId = 0;

    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 10;
    this.reconnectDelay = 1000;
  }

  /**
   * Подключиться к LiminalDB
   */
  async connect() {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.url);

      this.ws.on('open', () => {
        console.log('[LiminalDB] Connected to', this.url);
        this.reconnectAttempts = 0;
        this._authenticate().then(resolve).catch(reject);
      });

      this.ws.on('message', (data) => {
        this._handleMessage(data);
      });

      this.ws.on('close', () => {
        console.log('[LiminalDB] Connection closed');
        this.authenticated = false;
        this._reconnect();
      });

      this.ws.on('error', (error) => {
        console.error('[LiminalDB] WebSocket error:', error);
        reject(error);
      });

      this.ws.on('ping', () => {
        this.ws.pong();
      });
    });
  }

  /**
   * Аутентификация
   */
  async _authenticate() {
    const authMsg = {
      cmd: 'auth',
      key_id: this.keyId,
      secret: this.secret,
      ns: this.namespace
    };

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Authentication timeout'));
      }, 5000);

      this.once('auth', (event) => {
        clearTimeout(timeout);
        if (event.ok) {
          this.authenticated = true;
          console.log(`[LiminalDB] Authenticated as ${event.role} in namespace ${event.ns}`);
          resolve(event);
        } else {
          reject(new Error(`Authentication failed: ${event.err}`));
        }
      });

      this._send(authMsg);
    });
  }

  /**
   * Переподключение
   */
  _reconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('[LiminalDB] Max reconnect attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

    console.log(`[LiminalDB] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);

    setTimeout(() => {
      this.connect().catch(err => {
        console.error('[LiminalDB] Reconnect failed:', err);
      });
    }, delay);
  }

  /**
   * Отправить сообщение
   */
  _send(message) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket is not connected');
    }

    let data;
    if (this.format === 'cbor') {
      data = cbor.encode(message);
    } else {
      data = JSON.stringify(message);
    }

    this.ws.send(data);
  }

  /**
   * Обработать входящее сообщение
   */
  _handleMessage(data) {
    let message;

    try {
      if (this.format === 'cbor') {
        message = cbor.decode(data);
      } else {
        message = JSON.parse(data.toString());
      }
    } catch (err) {
      console.error('[LiminalDB] Failed to parse message:', err);
      return;
    }

    // Обработать события
    if (message.ev) {
      this.emit(message.ev, message);

      // Также вызвать общий обработчик событий
      this.emit('event', message);
    }

    // Обработать метрики
    if (message.metrics) {
      this.emit('metrics', message.metrics);
    }

    // Обработать ошибки
    if (message.err) {
      this.emit('error', message);
    }
  }

  /**
   * Отправить импульс
   */
  async push(impulse) {
    if (!this.authenticated) {
      throw new Error('Not authenticated');
    }

    const cmd = {
      cmd: 'impulse',
      data: {
        pattern: impulse.p,
        kind: this._getKind(impulse.k),
        strength: impulse.s,
        ttl: impulse.t || 0,
        tags: impulse.tg || [],
        meta: impulse.meta || {}
      }
    };

    this._send(cmd);
  }

  /**
   * Отправить импульс и получить результат
   */
  async pushAndPull(impulse, timeout = 5000) {
    await this.push(impulse);

    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.off('event', handler);
        reject(new Error('Request timeout'));
      }, timeout);

      const handler = (event) => {
        // Простая эвристика - ждем первое событие после импульса
        clearTimeout(timer);
        this.off('event', handler);
        resolve(event);
      };

      this.on('event', handler);
    });
  }

  /**
   * Выполнить LQL запрос
   */
  async lql(query) {
    if (!this.authenticated) {
      throw new Error('Not authenticated');
    }

    const cmd = {
      cmd: 'lql',
      q: query
    };

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('LQL query timeout'));
      }, 10000);

      this.once('lql', (event) => {
        clearTimeout(timeout);
        resolve(event.meta);
      });

      this._send(cmd);
    });
  }

  /**
   * Подписаться на паттерн
   */
  async subscribe(pattern, options = {}) {
    const {
      where = '',
      window = 60000,
      every = 5000
    } = options;

    let query = `SUBSCRIBE ${pattern}`;

    if (where) {
      query += ` WHERE ${where}`;
    }

    query += ` WINDOW ${window} EVERY ${every}`;

    return this.lql(query);
  }

  /**
   * Отписаться от представления
   */
  async unsubscribe(viewId) {
    return this.lql(`UNSUBSCRIBE ${viewId}`);
  }

  /**
   * Создать namespace
   */
  async createNamespace(ns) {
    this._send({ cmd: 'ns.create', ns });
  }

  /**
   * Переключить namespace
   */
  async switchNamespace(ns) {
    return new Promise((resolve, reject) => {
      this.once('ns_switch', (event) => {
        if (event.ok) {
          this.namespace = ns;
          resolve(event);
        } else {
          reject(new Error(`Failed to switch namespace: ${event.err}`));
        }
      });

      this._send({ cmd: 'ns.switch', ns });
    });
  }

  /**
   * Установить квоту для namespace
   */
  async setQuota(ns, quota) {
    this._send({
      cmd: 'quota.set',
      ns,
      q: quota
    });
  }

  /**
   * Добавить API ключ
   */
  async addKey(key) {
    this._send({
      cmd: 'key.add',
      key
    });
  }

  /**
   * Отключить API ключ
   */
  async disableKey(keyId) {
    this._send({
      cmd: 'key.disable',
      id: keyId
    });
  }

  /**
   * Добавить рефлекс
   */
  async addReflex(reflex) {
    this._send({
      cmd: 'reflex.add',
      data: reflex
    });
  }

  /**
   * Запустить цикл сновидений
   */
  async triggerDream() {
    this._send({ cmd: 'dream.now' });
  }

  /**
   * Настроить конфигурацию сна
   */
  async configureDream(config) {
    this._send({
      cmd: 'dream.set',
      cfg: config
    });
  }

  /**
   * Event emitter методы
   */
  on(event, handler) {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event).push(handler);
  }

  once(event, handler) {
    const wrapper = (...args) => {
      this.off(event, wrapper);
      handler(...args);
    };
    this.on(event, wrapper);
  }

  off(event, handler) {
    if (!this.eventHandlers.has(event)) return;

    const handlers = this.eventHandlers.get(event);
    const index = handlers.indexOf(handler);

    if (index > -1) {
      handlers.splice(index, 1);
    }
  }

  emit(event, ...args) {
    if (!this.eventHandlers.has(event)) return;

    this.eventHandlers.get(event).forEach(handler => {
      try {
        handler(...args);
      } catch (err) {
        console.error(`[LiminalDB] Error in event handler for '${event}':`, err);
      }
    });
  }

  /**
   * Утилиты
   */
  _getKind(k) {
    const kinds = { 0: 'affect', 1: 'query', 2: 'write' };
    return kinds[k] || 'query';
  }

  /**
   * Закрыть соединение
   */
  close() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
      this.authenticated = false;
    }
  }

  /**
   * Проверить соединение
   */
  isConnected() {
    return this.ws && this.ws.readyState === WebSocket.OPEN && this.authenticated;
  }
}

module.exports = LiminalClient;
