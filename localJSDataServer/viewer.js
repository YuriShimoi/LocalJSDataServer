function localJSDataViewerTable(el, obj) {
  el.innerHTML = ""; // clear el

  let elTableHeader = [];
  let elTableBody   = [];
  if(obj.constructor == Object) { // Dict
    elTableHeader = ['(index)','Value'];
    elTableBody   = Object.entries(obj);
  }
  else { // Array
    if(obj.length > 0 && obj[0].constructor == Object) {
      elTableHeader = ['(index)'];
      obj.forEach((v,i) => {
        elTableBody.push([i].concat(Object.values(v)));
        elTableHeader = Array.from(new Set(elTableHeader.concat(Object.keys(v))));
      });
    }
    else {
      elTableHeader = ['(index)','Value'];
      elTableBody   = obj.map((v,i) => [i, v]);
    }
  }

  let elHeader = document.createElement("thead");
  let elHRow   = document.createElement("tr");
  elTableHeader.forEach(th => {
    let elHRData = document.createElement("th");
      elHRData.innerHTML = th;
      elHRow.appendChild(elHRData);
  });
  elHeader.appendChild(elHRow);
  el.appendChild(elHeader);
  
  let elBody = document.createElement("tbody");
  elTableBody.forEach(tb => {
    let elBRow = document.createElement("tr");
    tb.forEach(tbd => {
      let elBRData = document.createElement("td");
      elBRData.innerHTML = tbd;
      elBRow.appendChild(elBRData);
    });
    elBody.appendChild(elBRow);
  });
  el.appendChild(elBody);
}

function localJSDataViewerRun() {
  // Server Databases
  let ljdServers = document.querySelectorAll("table[localjsdata-server]");
  ljdServers.forEach(s => {
    let sAttr    = s.getAttribute("localjsdata-server");
    let sStorage = sAttr == "session"? sessionStorage: localStorage;
    let sDataObj = sStorage.getItem(localDBJSUtils._storageKeyName);

    sDataObj = sDataObj? sDataObj.split('-'): [];
    localJSDataViewerTable(s, sDataObj);
  });

  // Database Tables
  let ljdDatabases = document.querySelectorAll("table[localjsdata-database]");
  ljdDatabases.forEach(d => {
    let dAttr = d.getAttribute("localjsdata-database");
    if(dAttr) {
      let dDataObj = localDataServer(dAttr).table;
      if(dDataObj) {
        localJSDataViewerTable(d, Object.keys(dDataObj));
      }
    }
  });

  // Table Describe
  let ljdDescribe = document.querySelectorAll("table[localjsdata-describe]");
  ljdDescribe.forEach(t => {
    let dAttr = "";
    let tAttr = t.getAttribute("localjsdata-describe");
    if(tAttr.includes('.')) {
      [dAttr, tAttr] = tAttr.split('.');
      let tDataObj   = localDataServer(dAttr).table;
      if(tAttr in tDataObj) {
        localJSDataViewerTable(t, tDataObj[tAttr].describe);
      }
    }
  });

  // Table Values
  let ljdTables = document.querySelectorAll("table[localjsdata-table]");
  ljdTables.forEach(t => {
    let dAttr = "";
    let tAttr = t.getAttribute("localjsdata-table");
    if(tAttr.includes('.')) {
      [dAttr, tAttr] = tAttr.split('.');
      let tDataObj   = localDataServer(dAttr).table;
      if(tAttr in tDataObj) {
        localJSDataViewerTable(t, tDataObj[tAttr].values);
      }
    }
  });
};