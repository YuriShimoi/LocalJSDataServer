var FOLDERNAME   = "localJSData";
var importScript = (src, format='js') => {
  let f_path   = document.querySelector(`[src*="${FOLDERNAME}"]`).getAttribute('src').split('/').slice(0,-1).join('/');
  let src_file = `${f_path}/${src}.${format}`;
  let src_tag  = format == "js"? `<script src="${src_file}"></script>`: `<link rel="stylesheet" href="${src_file}">`;
  document.writeln(src_tag);
};
importScript("class","js");
importScript("query","js");
importScript("viewer","js");

function localJSDataLoad(storageType) {
  let loadedStorage   = storageType == "session"? sessionStorage: localStorage;
  let loadedDatabases = loadedStorage.getItem(localDBJSUtils._storageKeyName);
  loadedDatabases = loadedDatabases? loadedDatabases.split('-'): [];
  loadedDatabases.forEach(ldb => {
    let loadedDb   = localDataServer(ldb);
    let loadedJSON = loadedStorage.getItem(`${localDBJSUtils._storageKeyName}-${ldb}`);
    loadedDb.import(loadedJSON);
  });
}