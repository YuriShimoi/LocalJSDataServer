window.localDBJSUtils = class localDBJSUtils {
  static _storageKeyName = "localDBJSStorageSection";

  static checkValidName(checkName, canProps={}) {
    let defaultCanProps = {
      'symbol': false,
      'number': true,
      'ban': ['-','.',',','=',`'`,`"`,'{','}','||','&&','==','!=','>=','<=','>','<','(',')','[',']'] // list of crucial symbols that cant be used
    };
    for(let prop in canProps) {
      if(prop in defaultCanProps) {
        if(prop == 'ban')
          defaultCanProps.ban = defaultCanProps.ban.concat(canProps[prop].ban);
        else
          defaultCanProps[prop] = canProps[prop];
      }
    }
    
    if(checkName == "") {
      return false;
    }

    let auxCheckName = checkName;
    if(!defaultCanProps.symbol) {
      auxCheckName = auxCheckName.replace(/[^\w\s]/gi, '');
    }
    if(!defaultCanProps.number) {
      auxCheckName = auxCheckName.replace(/\d+/g, '');
    }
    defaultCanProps.ban.forEach(bch => {
      auxCheckName = auxCheckName.replaceAll(bch, "");
    });

    return checkName === auxCheckName;
  }

  static checkType(value, type) {
    switch(type) {
      case 'text':
        return typeof value === "string";
      case 'number':
        return typeof value === "number";
      case 'boolean':
        return typeof value === "boolean";
      case 'date':
        return typeof value === "object" && value instanceof Date;
      default:
        console.warn("Not recognized type.");
    }
    return false;
  }

  static tryParse(table, column, type) {
    let copyOfValues = [];
    table.values.forEach(v => {
      copyOfValues.push({...v});
    });

    let tryres = true;
    try {
      copyOfValues.forEach(v => {
        switch(type) {
          case 'text':
            v[column] = String(v[column]);
            break;
          case 'number':
            v[column] = parseFloat(v[column]);
            break;
          case 'boolean':
            v[column] = Boolean(v[column]);
            break;
          case 'date':
            v[column] = new Date(v[column]);
            break;
          default:
            throw false;
        }
      });
    }
    catch {
      tryres = false;
    }

    if(tryres) table.values = copyOfValues;
    return tryres;
  }

  static _dumbHash(epoch) {
    let hashMess = "vltkdocpsh"; // vltkdocpsh == 0123456789
    let hashEpch = String(epoch);
    hashMess.split('').forEach((h, i) => {
      hashEpch = hashEpch.replaceAll(i, h);
    });
    return hashEpch;
  }

  static _convertFromObjectToJSON(dataObj) {
    let epoch   = Math.floor(new Date().getTime()/1000.0);
    let epcHash = this._dumbHash(epoch);
    let dataTables = "";
    for(let t in dataObj.table) {
      if(dataTables !== "") dataTables += epcHash;
      dataTables += `${dataObj.table[t].name}-${JSON.stringify(dataObj.table[t].describe)}-${JSON.stringify(dataObj.table[t].values)}`;
    }

    return `${epoch}-${dataTables}`;
  }

  static _convertFromJSONToObject(dataJSON) {
    let epoch      = dataJSON.slice(0, dataJSON.indexOf('-'));
    let epcHash    = this._dumbHash(epoch);
    let dataTables = dataJSON.slice(dataJSON.indexOf('-') + 1).split(epcHash);

    let dataObj    = [];
    dataTables.forEach(t => {
      let firstDivider  = t.indexOf('-');
      let secondDivider = t.indexOf('-', firstDivider + 1);

      let singleTable = {
        'name'    : t.slice(0, firstDivider),
        'describe': JSON.parse(t.slice(firstDivider  + 1, secondDivider)),
        'values'  : JSON.parse(t.slice(secondDivider + 1))
      };
      dataObj.push(singleTable);
    });

    return dataObj;
  }
}



window.localDBJSQuery = class localDBJSQuery {
  constructor(obj, db_name) {
    this._format = obj;
    this._db     = db_name;
    this._tables = [];
    this._cols   = []; // List with obligatory use of format <table>.<column>

    this._varbag    = [];
    this._colbag    = [];
    this._condition = "";
  }

  fetch(printAtEnd=false) {
    let colbag = [...this._colbag];
    let varbag = [...this._varbag].reverse(); // Reverse varbag to match with reverse var_index

    let colmap = {};
    // Array Copy to avoid mess up with the original array, reverse to respect order priority
    [...this._tables].reverse().forEach(t => {
      // Map all coluns from output tables
      let columns = Object.keys(localDataServer(this._db).table[t].describe);
      columns.forEach(c => colmap[c] = t);
    });

    let remove_later = [];
    colbag.forEach((c, ci) => {
      // Assert '*.' references
      if(c.includes("*.")) {
        let column = c.split(".")[1]; 
        if (column in colmap) colbag[ci] = `${colmap[column]}.${column}`;
        else remove_later.push(ci);
      }

      // Add prefix 'reference_bag.' for future treatments
      colbag[ci] = `reference_bag.${colbag[ci]}`;
    });
    // Remove problematic references, reverse to dont mess with index references
    remove_later.reverse().forEach(i => colbag.splice(i, 1));

    let values = [];
    // Parser ReGex
    let col_regex = /\[([0-9]+)\]/;
    let var_regex = /{([0-9]+)}/;
    let iterate_table = (reference_bag, table_list) => {
      if(table_list.length !== 0) {
        let ref_table = table_list.shift();
        localDataServer(this._db).table[ref_table].values.forEach(v => {
          reference_bag[ref_table] = {...v};
          iterate_table(reference_bag, [...table_list]);
        });
      }
      else {
        let condition = this._condition;
        let matches   = condition.match(col_regex);

        // Replace columns from bag
        while(matches) {
          condition = condition.replace(matches[0], colbag[matches[1]]);
          matches   = condition.match(col_regex);
        }

        // Replace variables from bag
        let var_index = [];
        matches = condition.match(var_regex);
        while(matches) {
          var_index.push(matches.index);
          condition = condition.replace(matches[0], "");
          matches   = condition.match(var_regex);
        }
        
        var_index.reverse().forEach((ci, vi) => {
          condition = condition.substring(0, ci) + varbag[vi] + condition.substr(ci);
        });

        // Insert in output values with this._cols format
        if(condition === "" || eval(condition)) {
          let value_line = {};
          this._cols.forEach(c => {
            let [table, column] = c.split('.');
            value_line[column]  = reference_bag[table][column];
          });
          values.push(value_line);
        }
      }
    };

    iterate_table({}, [...this._tables]);

    if(printAtEnd) console.table(values);
    return values;
  }

  from(table) {
    if(table instanceof Array) {
      table = table.map(t => typeof t === "string"? localDataServer(this._db).table[t]: t);
    }
    else {
      table = typeof table === "string"? [localDataServer(this._db).table[table]]: [table];
    }
    if(table.includes(undefined)) {
      console.warn("Some column do not exists on Database.");
      return false;
    }
    this._tables = table.map(t => t.name);

    this._cols = [];
    table.forEach(t => {
      let cols     = this._format?? Object.keys(t.describe);
      let is_array = cols instanceof Array;

      if(is_array) {
        cols = cols.map(c => c.includes('.')? c: `${t.name}.${c}`);
      }
      else {
        cols = cols.includes('.')? cols: `${t.name}.${cols}`;
      }
      
      // Check if the specified column is on iterated table
      if(is_array) {
        cols = cols.filter(c => c.split('.')[0] === t.name);
        if(cols.length == 0) return;
      }
      else if(cols.split('.')[0] !== t.name) {
        return;
      }
      this._cols = [...this._cols, ...cols]; // Save wanted cols in output
    });

    return this;
  }

  where(condition) {
    // Replaces double quotes to single quotes to workaround some issues with the var_bag
    condition = condition.replaceAll(`"`, `'`);
    condition = condition.replaceAll("(", " ( ").replaceAll(")", " ) ");

    // Replaces strings with single quotes, numbers and booleans to {i} and save properly
    let var_bag    = [];
    let val_regex  = / '([^']+)' | [+-]?([0-9]*[.])?[0-9]+ | True | False /;
    let matches    = ` ${condition} `.match(val_regex);
    let while_runs = 10000; // iterator rule to dont crash // debug purpoises
    while(matches && while_runs-- > 0) {
      condition     = condition.substring(0, matches.index) + `{${var_bag.length}}` + condition.substr(matches.index + matches[0].length -2);
      let var_value = matches[1]? `"${matches[1]}"`: matches[0].slice(1,-1);
      var_value     = var_value.replaceAll(" ( ", "(").replaceAll(" ) ", ")"); // revert extra spacing from inner string values
      var_bag.push(var_value);
      matches = ` ${condition} `.match(val_regex);
    }

    // Treat Boolean
    var_bag.map(v => v == "True"? "true": v == "False"? "false": v);

    // Prepare condition string putting spaces besides conditionals
    let conditionals = ['=', '==', '!='];
    conditionals.forEach(c => condition = condition.replaceAll(c, ` ${c} `));
    condition = condition.replaceAll("> =", ">=");
    condition = condition.replaceAll("< =", "<=");
    
    // Make sure equals comparison are using double equals symbol
    condition = condition.replaceAll(" = ", " == ");
    // Removing double equals duplication caused by conversion of single to double
    condition = condition.replaceAll(" ==  == ", " == ");

    // Splits OR/AND cases
    let cond_split = [];
    while(condition.includes(" OR ")) {
      let or_index = condition.indexOf(" OR ");
      cond_split.push(condition.substring(0,or_index));
      cond_split.push("||");
      condition = condition.substring(or_index + 4);
    }
    while(condition.includes(" AND ")) {
      let and_index = condition.indexOf(" AND ");
      cond_split.push(condition.substring(0,and_index));
      cond_split.push("&&");
      condition = condition.substring(and_index + 5);
    }
    cond_split.push(condition);

    // Search for columns and add * to table specification if has no one
    let col_bag = [];
    cond_split.forEach((cond, ci) => {
      let splited_cond = cond.split(" ");
      let cond_var     = ['{','}','||','&&','==','!=','>=','<=','>','<','(',')'];
      splited_cond.forEach((s, si) => {
        // Ignores if its a conditional, a variable or an empty set
        if(!cond_var.some(c => s.includes(c)) && s.length) {
          let specificated = !s.includes('.')? `*.${s}`: s;
          cond_split[ci] = cond_split[ci].replace(s, `[${col_bag.length}]`);
          col_bag.push(specificated);
        }
      });
    });

    // Save rules and vars
    this._varbag    = var_bag;
    this._colbag    = col_bag;
    this._condition = cond_split.join(" ");

    return this;
  }
}