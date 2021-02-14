/* global Module */

/* Magic Mirror
 * Module: MagicMirror-Modules-Thingiverse
 *
 * By
 * MIT Licensed.
 */

Module.register('MagicMirror-Modules-Thingiverse', {
  defaults: {
    appToken: '',
    updateInterval: 60000,
    retryDelay: 5000,
  },

  requiresVersion: '2.1.0',

  start: function () {
    var self = this;
    var dataRequest = null;
    var dataNotification = null;

    this.loaded = false;

    this.getData();
    setInterval(function () {
      self.updateDom();
    }, this.config.updateInterval);
  },

  getData: function () {
    var self = this;

    var urlApi = `https://api.thingiverse.com/search/?sort=popular&access_token=${appToken}`;
    var retry = true;

    var dataRequest = new XMLHttpRequest();
    dataRequest.open('GET', urlApi, true);
    dataRequest.onreadystatechange = function () {
      console.log(this.readyState);
      if (this.readyState === 4) {
        console.log(this.status);
        if (this.status === 200) {
          self.processData(JSON.parse(this.response));
        } else if (this.status === 401) {
          self.updateDom(self.config.animationSpeed);
          Log.error(self.name, this.status);
          retry = false;
        } else {
          Log.error(self.name, 'Could not load data.');
        }
        if (retry) {
          self.scheduleUpdate(self.loaded ? -1 : self.config.retryDelay);
        }
      }
    };
    dataRequest.send();
  },

  scheduleUpdate: function (delay) {
    // var nextLoad = this.config.updateInterval;
    // if (typeof delay !== 'undefined' && delay >= 0) {
    //   nextLoad = delay;
    // }
    // nextLoad = nextLoad;
    // var self = this;
    // setTimeout(function () {
    //   self.getData();
    // }, nextLoad);
  },

  getDom: function () {
    var self = this;

    var wrapper = document.createElement('div');
    if (this.dataRequest) {
      var wrapperDataRequest = document.createElement('div');
      wrapperDataRequest.innerHTML = this.dataRequest.title;

      var labelDataRequest = document.createElement('label');
      labelDataRequest.innerHTML = this.translate('TITLE');

      wrapper.appendChild(labelDataRequest);
      wrapper.appendChild(wrapperDataRequest);
    }

    if (this.dataNotification) {
      var wrapperDataNotification = document.createElement('div');

      wrapperDataNotification.innerHTML =
        this.translate('UPDATE') + ': ' + this.dataNotification.date;

      wrapper.appendChild(wrapperDataNotification);
    }
    return wrapper;
  },

  getScripts: function () {
    return [];
  },

  getStyles: function () {
    return ['MagicMirror-Modules-Thingiverse.css'];
  },

  getTranslations: function () {
    return {
      en: 'translations/en.json',
    };
  },

  processData: function (data) {
    var self = this;
    this.dataRequest = data;
    if (this.loaded === false) {
      self.updateDom(self.config.animationSpeed);
    }
    this.loaded = true;

    this.sendSocketNotification(
      'MagicMirror-Modules-Thingiverse-NOTIFICATION_TEST',
      data,
    );
  },

  socketNotificationReceived: function (notification, payload) {
    if (notification === 'MagicMirror-Modules-Thingiverse-NOTIFICATION_TEST') {
      this.dataNotification = payload;
      this.updateDom();
    }
  },
});
