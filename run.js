let MiScale = require('./mi_scale.js');
let request = require('request');

let miscale = new MiScale();
miscale.startScanning();
miscale.on('data', function (scale) {
  if (scale.isStabilized && !scale.loadRemoved) {
    // Don't need to print, push to Slack directly
    //console.log(scale);

    request.post(
      'https://hooks.slack.com/services/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',
      { json: { channel: '#tmp', username: 'Weight', icon_url: 'https://cdn2.iconfinder.com/data/icons/electronics-solid-icons-vol-2/48/084-512.png', text: 'Detected ' + scale.weight + 'kg'} },
      function (error, response, body) {
        if (!error || response.statusCode != 200) {
          // Print only when there is error
          console.log(body);
        }
      }
    );
  }
});
