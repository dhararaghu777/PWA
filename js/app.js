if('serviceWorker' in navigator){
    navigator.serviceWorker.register('/serviceWorker.js')
    .then((register)=>{
        console.log('ServiceWorker registed successfully', register);
    }).catch((err)=>{
        console.log('ServiceWorker not registed', err);
    })
}