# excelDB
An experimentation of implementing a relational database by using google sheet API


#### Config: `client_secret.json`

```javascript
{
  "installed": {
    "client_id":"993332670043-3fl5lboj571fi02581fo7gedethhfd02.apps.googleusercontent.com",
    "project_id":"smooth-drive-170602",
    "auth_uri":"https://accounts.google.com/o/oauth2/auth",
    "token_uri":"https://accounts.google.com/o/oauth2/token",
    "auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs",
    "client_secret":"D0J52W6rlfZwAtf8NaFPFhQL",
    "redirect_uris":["urn:ietf:wg:oauth:2.0:oob","http://localhost"]
  }
}
```
#### Installation
`npm install`

#### Usage

```javascript
const db=require("./db.js");

db.init(); // initialize schema file

db.create("database1"); // create 

db.select("database1"); // select the database

db.addTable("table1"); // create a table called `table1`

db.addColumn("table1", ["col1", "col2" ...]) // "migrate" columns to schema

db.addRow("table1", {col1: "val1", col2: "val2"}) // append a row

db.updateRow("table1", {col2: "change to val3"}) // change the value of col2 only

db.getRow("table1", 1) // get the first row record

```

#### Authentication Flow
ExcelDB impplement Google oauth2 before each function call. 
If user is not logged in, there will be a prompt to ask the user to follow
login link to login to their google drive account. Once authenticated, a file
`sheets.googleapis.com-credentials.json` will be created to hold token
and refresh token. 


#### TODOs: 

##### Method: 

```javascript
db.deleteRow()   // deleting a row
db.where()   // search base on a attribute
db.deleteTable // deleting a table
db.getColumn() // the value for a given column of data
db.all() // get all the record 



```

##### Reserved Columns

* `id` // primary Id 
* `created_at`
* `updated_at`


