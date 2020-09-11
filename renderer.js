// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off. Use `preload.js` to
// selectively enable features needed in the rendering
// process.
const { remote } = require('electron');

function refresh(node) {
    var times = 3000; // gap in Milli Seconds;

    (function startRefresh() {
        var address;
        if (node.src.indexOf('?') > -1)
            address = node.src.split('?')[ 0 ];
        else
            address = node.src;
        node.src = address + "?time=" + new Date().getTime();
        console.log(node.src)
        setTimeout(startRefresh, times);

    })();
}

window.onload = function () {
    const data = remote.getGlobal('sharedObject');
    console.log(data);
    const node1 = document.getElementById('img1');
    const node2 = document.getElementById('img2');
    if (data.priceUrl) {
        node1.src = data.priceUrl
    }
    if (data.stockUrl) {
        node2.src = data.stockUrl
    }
    refresh(node1);
    refresh(node2);
    // you can refresh as many images you want just repeat above steps
}