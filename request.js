var google = require('googleapis');
var sheets = google.sheets('v4');

function send(request, action, cb) {
  const actions = action.split('.');
  const handleRequest = (err, db) => {
    console.log(JSON.stringify(db, null, 2));
    if (err) {
      console.log(err);
      return;
    }

    if (typeof cb === 'function') {
      cb(db);
      return;
    }
    return(db);
  };
  if (actions.length > 1) {
    sheets.spreadsheets[actions[0]][actions[1]](request, handleRequest);
    return;
  }
  sheets.spreadsheets[action](request, handleRequest);
}

module.exports = send;
