const send = require('./request.js');
const run = require('./run.js');
const schemaFactory = require('./schema.js');
const _ = require('underscore');
const db = {};


// initialize db schema
db.init = () => {
  schemaFactory.init();
}

// select database to query
db.select = (name) => {
  schemaFactory.load((schema) => {
    if (schema.db[name]) {
      schema.current = name;
      schemaFactory.update(schema);
      return;
    }
    console.log("ERROR: db <" + db + "> doesn't exist!");
  })
}

// create new sheet
db.create = function(name) {
  run((authClient) => {
    var request = {
      resource: {
        properties: {
          title: name
        }
      },
      auth: authClient
    };
    send(request, 'create', (db) => {
      schemaFactory.load((schema) => {
        schema.db[name] = {
          id: db.spreadsheetId,
          tables: {
            Sheet1: {
              id: 0,
              gid:0,
              maxRowIndex: 1, // prime ID starting from 1
              colMap: {}
            } 
          }
        }
        schemaFactory.update(schema);
      })
    });
  });
}

function mapCol(columns, colIndex = 65) {
  let colMap = {};
  if (columns.length > 26 && colIndex <= 90) {
    throw "There can not be more than 26 columns";
  }
  _.each(columns, (col) => {
    colMap[col] = String.fromCharCode(colIndex);
    colIndex ++;
  });
  return {
    colMap,
    colIndex
  };
}

// add new tabble
db.addTable = (name, columns=[]) => {
  run((authClient) => {
    schemaFactory.load((schema) => {
      const currentDB = schema.db[schema.current];
      const map = mapCol(columns);
      const request = {
        spreadsheetId: currentDB.id,  
        resource: {
          requests: [
            {
              addSheet: {
                properties: {
                  title: name,
                }
              }
            }
          ],
        },
        auth: authClient
      };

      send(request, 'batchUpdate', (db) => {
        console.log(db)
        currentDB.tables[name] = {
          id: db.spreadsheetId,
          gid: db.replies[0].addSheet.properties.sheetId,
          maxRowIndex: 0, // prime ID starting from 0
          maxColIndex: map.colIndex,  // starting from A to 90 or Z
          colMap: map.colMap
        };
        schemaFactory.update(schema);
      });
    });
  });
}

// migrate new columns to a table
db.addColumn = (name, columns=[]) => {
  schemaFactory.load((schema) => {
    const table = schema.db[schema.current].tables[name];
    const map = mapCol(columns, table.colIndex);
    table.colMap = Object.assign({}, table.colMap, map.colMap);
    schemaFactory.update(schema);
  });
}


db.getRow = (tableName, rowIndex, cb) => {
  run((authClient) => {
    schemaFactory.load((schema) => {
      const row = {};
      const currentDB = schema.db[schema.current];
      const table = currentDB.tables[tableName];
      const colMap = table.colMap;
      const request = {
        spreadsheetId: currentDB.id,  
        range: `${tableName}!A${rowIndex}:Z`,
        auth: authClient
      };

      send(request, 'values.get', (db) => {
        if(!db.values) {
          throw `record id ${rowIndex} not found in table ${tableName}`;
          return;
        }
        _.each(colMap, (v,k)=> {
          row[k] = db.values[0][v.charCodeAt()-65];
          row.id = rowIndex;
        }) 
        console.log(row)
        if (typeof cb === 'function') {
          cb(row);
          return
        }
        return row;
      });
    });
  });
}

function composeCells(colMap, values, oldValues = {}) {
  const combinedValues = Object.assign({}, oldValues, values);
  let cells = [];
  console.log(combinedValues)
  _.each(combinedValues, (v,k) => {
    if(k === "id") { return; }
    if(!colMap[k]) {
      throw `Column ${k} does not exist, please use db.addColumn to add.`;
    }
    cells[colMap[k].charCodeAt() - 65] = v;
  });

  return cells;
}

// add a row to a table
db.updateRow = (tableName, values = {}, rowIndex, cb) => {
  run((authClient) => {
    schemaFactory.load((schema) => {
      db.getRow(tableName, rowIndex, (oldValues) => {
        const currentDB = schema.db[schema.current];
        const table = currentDB.tables[tableName];
        const colMap = table.colMap;
        const maxColIndex = _.values(colMap).sort().pop();
        const maxRowIndex = table.maxRowIndex;
        const cellData = composeCells(table.colMap, values, oldValues);
        const request = {
          spreadsheetId: currentDB.id,  
          range: `${tableName}!A1:${maxColIndex}${maxRowIndex || 1}`,
          resource: {
            values: [cellData]
          },
          valueInputOption: "USER_ENTERED",
          auth: authClient
        };
        send(request, 'values.update', (db) => {
          if (typeof cb === 'function') {
            cb(row);
            return
          }
        });
      });
    });
  });
}

db.addRow = (tableName, values={}, cb) => {
  run((authClient) => {
    schemaFactory.load((schema) => {
      const currentDB = schema.db[schema.current];
      const table = currentDB.tables[tableName];
      const colMap = table.colMap;
      const maxColIndex = _.values(colMap).sort().pop();
      const maxRowIndex = table.maxRowIndex;
      const cellData = composeCells(table.colMap, values);
      const request = {
        spreadsheetId: currentDB.id,  
        range: `${tableName}!A1:${maxColIndex}${maxRowIndex || 1}`,
        resource: {
          values: [cellData]
        },
        valueInputOption: "USER_ENTERED",
        auth: authClient
      };

      send(request, 'values.append', (db) => {
        table.maxRowIndex += 1;
        schemaFactory.update(schema);
      });
    });
  });
}

module.exports = db;
