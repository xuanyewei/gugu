self.addEventListener("install", function(e){ self.skipWaiting(); });
self.addEventListener("activate", function(e){ e.waitUntil(self.clients.claim()); });
self.addEventListener("fetch", function(e){});

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

self.addEventListener("notificationclick", function(event){
  event.notification.close();
  var friendId = event.notification.data ? event.notification.data.friendId : null;
  event.waitUntil(
    self.clients.matchAll({type:"window", includeUncontrolled:true}).then(function(clients){
      if(clients.length > 0){
        var c = clients[0];
        c.focus();
        if(friendId) c.postMessage({type:"OPEN_CHAT", friendId: friendId});
        return;
      }
      return self.clients.openWindow("./");
    })
  );
});