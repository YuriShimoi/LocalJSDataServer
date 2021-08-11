_documentready = setInterval((f)=>{if(document.readyState === "complete"){clearInterval(_documentready);delete _documentready;f();}}, 1, () => {
  localJSDataLoad();
  localJSDataViewerRun();
});

function searchDatabase(inp) {
  let myTable = document.getElementById("search-database-table");
  myTable.setAttribute("localjsdata-database", inp.value);
  localJSDataViewerRun();
}

function searchTable(inp) {
  let myTable = document.getElementById("search-table-table");
  myTable.setAttribute("localjsdata-table", inp.value);
  localJSDataViewerRun();
}

function describeTable(inp) {
  let myTable = document.getElementById("describe-table-table");
  myTable.setAttribute("localjsdata-describe", inp.value);
  localJSDataViewerRun();
}