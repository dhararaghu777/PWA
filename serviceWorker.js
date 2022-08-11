const staticCacheName='static-cache-v1'
const dynamicCacheName='dynamic-cache'

const assets=[
    '/',
    '/index.html',
    '/pages/fallback.html',
    '/js/app.js',
    '/js/materialize.min.js',
    '/js/ui.js',
    '/css/materialize.min.css',
    '/css/styles.css',
    '/images/dish.png',
    "https://fonts.googleapis.com/icon?family=Material+Icons"
]

// control cache storage limit

const limitCacheStorage=(name, size)=>{
    caches.open(name).then(cache=>{
        cache.keys().then(keysList=>{
            if(keysList.length > size){
                cache.delete(keysList[0]).then(()=>{
                    limitCacheStorage(name, size)
                })
            }
        })
    })
}


//install service worker event

self.addEventListener('install', (e)=>{
    // console.log('Service worker has been installed', e)
    e.waitUntil(
        caches.open(staticCacheName).then(cache=>{
            return cache.addAll(assets)
        })
    )
})


// activate service worker event

self.addEventListener("activate", (e)=>{
    // console.log('Service worker has been activated', e);
    const set= new Set([staticCacheName, dynamicCacheName])
    e.waitUntil(
        caches.keys().then(cacheNames=>{
            return Promise.all(
                cacheNames.map(cacheName=>{
                    if(!set.has(cacheName)){
                        return caches.delete(cacheName)
                    }
                })
            )
        })
    )
})

//fetch event

self.addEventListener('fetch', (e)=>{
    // console.log('fetch request', e)
    e.respondWith(
        caches.match(e.request).then(response=>{
            if(response) return response

            return fetch(e.request).then(res=>{
                if(res.status < 400){
                   return caches.open(dynamicCacheName).then(cache=>{
                        cache.put(e.request, res.clone())
                        limitCacheStorage(dynamicCacheName, 15)
                        return res
                    })
                }
            }).catch(err=>{
                return caches.match('/pages/fallback.html').then(fallback=>{
                    return fallback
                })
            })
            
        })
    )
})

//app-install-banner

let defferedPromt;

self.addEventListener("beforeinstallprompt", (e)=>{
    e.preventDefault()
    
    const btn=self.document.querySelector('#btn');
    btn.style.display='block'

    defferedPromt=e
    btn.addEventListener('click', (e)=>{
        btn.style.display='none'
    
        defferedPromt.prompt()
        defferedPromt.userChoice.then((result) => {
            if(result.outcome === 'accepted'){
                console.log('user accepted to install');
            }
            else{
                console.log('user not accepted to install');
            }
        }).catch((err) => {
            console.log(err);
        });
    })
})
