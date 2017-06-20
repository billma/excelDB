var fs = require('fs');
var SCHEMA_PATH = "schema.json";
var Schema = {};

function loadFile(file, cb) {
  fs.readFile(file, function (err, content) {
    if (typeof cb === 'function') {
      cb(JSON.parse(content));
      return;
    }
  });
}

Schema.init = function() {
  Schema.update({
    current:'',
    db: {}
  }); 
}

Schema.load = function (cb) {
  loadFile(SCHEMA_PATH, cb);
}

Schema.update = function(schema) {
  fs.writeFile(SCHEMA_PATH);
  fs.writeFile(SCHEMA_PATH, JSON.stringify(schema));
}

module.exports = Schema;
