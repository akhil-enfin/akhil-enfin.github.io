(function() {
    var indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
    if (!indexedDB) {
      console.error('indexDB not supported');
      return;
    }
    var dbName = 'codel', storeName = 'state';
    var db, keyValue = { k: '', v: '' }, request = indexedDB.open(dbName, 1);
    request.onsuccess = function(evt) {
      db = this.result;
    };
    request.onerror = function(event) {
      console.error('indexedDB request error');
      console.log(event);
    };
  
    request.onupgradeneeded = function(event) {
      db = null;
      var store = event.target.result.createObjectStore(storeName, {
        keyPath: 'k'
      });
  
      store.transaction.oncomplete = function (e){
        db = e.target.db; 
      };
    };
  
    function getValue(key, callback) {
      if(!db) {
        setTimeout(function () {
          getValue(key, callback);
        }, 100);
        return;
      }
      var transaction = db.transaction(storeName);
      transaction.onerror = function(event) {
        callback("Error occured!")
      };
      transaction.objectStore(storeName).get(key).onsuccess = function(event) {
        var result = (event.target.result && event.target.result.v) || null;
        callback(null, result);
      };
    }
  
    // if using proxy mode comment this
  
    window['ldb'] = {
      get: function(key) { 
        return new Promise((resolve, reject) => {
          getValue(key, function(err, value) {
            if(err) { return reject(err) }
            resolve(value);
          }) 
        })
      },
      set: function(key, value) {
        // no callback for set needed because every next transaction will be anyway executed after this one
        keyValue.k = key;
        keyValue.v = value;
        db.transaction(storeName, 'readwrite').objectStore(storeName).put(keyValue);
      }
    }
  
    // Use only for apps that will only work on latest devices only
  
    // window.ldb = new Proxy({}, {
    //   get: function(func, key, callback) {
    //     return (key === 'get') ? getValue : function(callback) {
    //       return getValue(key, callback)
    //     };
    //   },
    //   set: function(func, key, value) {
    //     keyValue.k = key;
    //     keyValue.v = value;
    //     db.transaction(storeName, 'readwrite').objectStore(storeName).put(keyValue);
    //   }
    // });
  })();