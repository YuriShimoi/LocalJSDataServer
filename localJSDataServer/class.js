window.LocalDBJSDataStoragerClass = class LocalDBJSDataStoragerClass {
  static _database = {};

  static database(db_name, inSession) {
    if(!(db_name in this._database)) {
      if(localDBJSUtils.checkValidName(db_name)) {
        this._database[db_name] = new LocalDBJSDatabaseClass(db_name, inSession);
      }
      else {
        console.error(`'${db_name}' is not a valid name.`);
        return false;
      }
    }
    return this._database[db_name];
  }

  static dropDatabase(db_name) {
    this._database[db_name].drop();
    delete this._database[db_name];
  }
}

window.LocalDBJSDatabaseClass = class LocalDBJSDatabaseClass {
  _autoSave = true;
  table = {};
  
  constructor(name, inSession) {
    this._name    = name;
    this._storage = inSession? sessionStorage: localStorage;
  };

  setAutoSave(autoSaveStat) {
    this._autoSave = autoSaveStat;
  }

  saveState() {
    // TASK: Thats actually on brute mode, drops and import everything,
    //       looking for some soft actualization with table changes specification
    let dataJSON   = this.export();
    let storedData = this._storage.getItem(localDBJSUtils._storageKeyName);
    let newStored  = storedData? storedData.split('-'): [];
    if(!newStored.includes(this._name)) newStored.push(this._name);
    this._storage.setItem(localDBJSUtils._storageKeyName, newStored.join('-'));
    this._storage.setItem(`${localDBJSUtils._storageKeyName}-${this._name}`, dataJSON);
  }

  drop() {
    this.table = {};
    this._storage.removeItem(`${localDBJSUtils._storageKeyName}-${this._name}`);
    let storedData = this._storage.getItem(localDBJSUtils._storageKeyName)?? "";
    if(storedData.includes(this._name)) {
      storedData = storedData.split('-').filter(db => db != this._name).join('-');
      this._storage.setItem(localDBJSUtils._storageKeyName, storedData);
    }
  }

  export() {
    return localDBJSUtils._convertFromObjectToJSON(this);
  }

  import(localDBJSDataJSON) {
    this.drop();
    let dataTables = localDBJSUtils._convertFromJSONToObject(localDBJSDataJSON);
    dataTables.forEach(t => {
      let importedTable = this.createTable(t.name, t.describe);
      importedTable.values = t.values;
    });
    this._checkForSave();
  }

  _checkForSave() {
    if(this._autoSave) this.saveState();
  }

  tables() {
    return Object.keys(this.table);
  }

  createTable(tname, obj) {
    if(!(tname in this.table)) {
      if(localDBJSUtils.checkValidName(tname)) {
        if(Object.keys(obj).every(k => localDBJSUtils.checkValidName(k))) {
          this.table[tname] = new LocalDBJSTableClass(tname, obj, this);
          this._checkForSave();
          return this.table[tname];
        }
        else {
          console.error(`Some column has a invalid name.`);
          return false;
        }
      }
      else {
        console.error(`'${tname}' is not a valid name.`);
        return false;
      }
    }
    console.warn(`Table '${tname}' already exists.`);
    return false;
  }

  dropTable(tname) {
    delete this.table[tname];
    this._checkForSave();
  }

  alterTable(tname) {
    return this.table[tname].alter();
  }

  insertInto(tname, vals, cols=null) {
    return this.table[tname].insert(vals, cols);
  }

  select(cols=null) {
    return new localDBJSQuery(cols, this._name);
  }

  deleteFrom(tname) {
    return this.table[tname].delete();
  }
}

window.LocalDBJSTableClass = class LocalDBJSTableClass {
  values       = [];
  _null_values = null;

  constructor(tname, obj, originDatabase) {
    this.name     = tname;
    this.describe = obj;
    this._origin  = originDatabase;
  }

  print() {
    console.table(this.values);
  }

  insert(vals, cols = null) {
    let insertRowValues = (row_vals, row_cols) => {
      if(row_cols.every(col => col in this.describe)){
        if(row_vals.every((_, i) => localDBJSUtils.checkType(row_vals[i], this.describe[row_cols[i]]))) {
          let row_data = Object.keys(this.describe);
          row_data = row_data.map(c => ({[c]: row_cols.includes(c)?row_vals[row_cols.indexOf(c)]: this._null_values}));
          row_data = row_data.reduce((acc, row) => row = {...acc, ...row}, {});
          this.values.push(row_data);
          return true;
        } else console.warn(`Type of values do not match: [${row_vals}] => [${row_cols}].`);
      } else console.warn(`Invalid columns: [${row_cols}] => [${Object.keys(this.describe)}]`);
      return false;
    };
    cols = cols?? Object.keys(this.describe);

    if(!(vals instanceof Array) && !(cols instanceof Array)) {
      let insertRes = insertRowValues([vals], [cols]);
      if(insertRes) this._origin._checkForSave();
      return insertRes;
    }
    else if(cols instanceof Array && vals instanceof Array && cols.length && vals.length) {
      if(vals.every(v => v instanceof Array)) {
        if(vals.every(v => v.length === cols.length)) {
          let res = [];
          vals.forEach(val => res.push(insertRowValues(val, cols)));
          this._origin._checkForSave();
          return res.every(r => r);
        } else console.warn(`Amount of given values[] and columns do not match.`);
      }
      else if(vals.length === cols.length) {
        let insertRes = insertRowValues(vals, cols);
        if(insertRes) this._origin._checkForSave();
        return insertRes;
      } else console.warn(`Amount of given values (${vals.length}) and columns (${cols.length}) do not match.`);
    } else console.warn(`Amount of given values and columns do not match.`);
    
    return false;
  }

  alter() {
    class LocalDBJSAlterTableInternalClass {
      constructor(table) {
        this._table = table;
      }
      add(cname, datatype) {
        if(!(cname in this._table.describe)) {
          this._table.describe[cname] = datatype;
          this._table.values.forEach(v => {
            v[cname] = this._table._null_values;
          });
          this._origin._checkForSave();
          return true;
        }
        else {
          console.warn(`Column '${cname}' already exists in '${this._table.name}'.`);
          return false;
        }
      }
      drop(cname) {
        if(cname in this._table.describe) {
          delete this._table.describe[cname];
          this._table.values.forEach(v => {
            delete v[cname];
          });
          this._origin._checkForSave();
          return true;
        }
        else {
          console.warn(`Column '${cname}' do not exists in '${this._table.name}'.`);
          return false;
        }
      }
      modify(cname, datatype) {
        if(cname in this._table.describe) {
          if(localDBJSUtils.tryParse(this._table, cname, datatype)) {
            this._table.describe[cname] = datatype;
            this._origin._checkForSave();
            return true;
          }
          else {
            console.warn(`Fail trying convert values on column '${cname}' from '${this._table.describe[cname]}' to '${datatype}'.`);
            return false;
          }
        }
        else {
          console.warn(`Column '${cname}' do not exists in '${this._table.name}'.`);
          return false;
        }
      }
    }

    return new LocalDBJSAlterTableInternalClass(this);
  }

  delete() {
    class LocalDBJSDeleteTableInternalClass {
      constructor(table) {
        this._table  = table;
        this._backup = JSON.parse(JSON.stringify(table.values));
        table.values = [];
        table._origin._checkForSave();
      }

      where(condition) {
        debugger;

        // get splitted condition
        let auxQueryable = new localDBJSQuery();
        auxQueryable.where(condition);
        let _varbag = auxQueryable._varbag;
        let _colbag = auxQueryable._colbag;
        condition   = auxQueryable._condition;

        // restore values
        this._table.values = this._backup;
        this._table._origin._checkForSave();
      }
    }

    return new LocalDBJSDeleteTableInternalClass(this);
  }
}



// Controller
window.localDataServer = function localDataServer(databasename, inSession=false) {
  return LocalDBJSDataStoragerClass.database(databasename, inSession);
}