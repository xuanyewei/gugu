// ===== Service Worker =====

self.addEventListener('install', function(e){ 
  self.skipWaiting(); 
});

self.addEventListener('activate', function(e){ 
  e.waitUntil(self.clients.claim()); 
});

self.addEventListener('fetch', function(e){});

// 本地通知（原有的）
self.addEventListener("message", function(event){
  var d = event.data || {};
  if(d.type === "NOTIFY"){
    self.registration.showNotification(d.title || "新消息", {
      body: d.body || "",
      icon: d.icon || undefined,
      tag: d.tag || ("gg_msg_" + Date.now()),
      renotify: true,
      vibrate: [200, 100, 200],
      data: { friendId: d.friendId }
    });
  }
});

// ★ 新增：接收云端推送
self.addEventListener('push', function(event){
  if(!event.data) return;
  
  var data;
  try {
    data = event.data.json();
  } catch(e) {
    data = { title: '新消息', body: event.data.text() };
  }
  
  var options = {
    body: data.body || '',
    icon: data.icon || undefined,
    badge: data.badge || undefined,
    tag: data.tag || 'push_' + Date.now(),
    renotify: true,
    vibrate: [200, 100, 200],
    requireInteraction: false,
    data: { 
      friendId: data.friendId,
      url: data.url || './'
    }
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title || '新消息', options)
  );
});

// 点击通知
self.addEventListener("notificationclick", function(event){
  event.notification.close();
  var friendId = event.notification.data ? event.notification.data.friendId : null;
  var targetUrl = event.notification.data ? event.notification.data.url : './';
  
  event.waitUntil(
    self.clients.matchAll({type:"window", includeUncontrolled:true}).then(function(clients){
      if(clients.length > 0){
        var c = clients[0];
        c.focus();
        if(friendId) c.postMessage({type:"OPEN_CHAT", friendId: friendId});
        return;
      }
      return self.clients.openWindow(targetUrl);
    })
  );
});