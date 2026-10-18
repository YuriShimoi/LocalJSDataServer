var FOLDERNAME   = "localJSDataServer";
var importScript = (src, format='js') => {
  let f_path   = document.querySelector(`[src*="${FOLDERNAME}/core.js"]`).getAttribute('src').split('/').slice(0,-1).join('/');
  let src_file = `${f_path}/${src}.${format}`;
  let src_tag  = format == "js"? `<script src="${src_file}"></script>`: `<link rel="stylesheet" href="${src_file}">`;
  document.writeln(src_tag);
};
importScript("class","js");
importScript("query","js");
importScript("viewer","js");

function localJSDataLoad(storageType) {
  let inSession       = storageType == "session";
  let loadedStorage   = inSession? sessionStorage: localStorage;
  let loadedDatabases = loadedStorage.getItem(localDBJSUtils._storageKeyName);
  loadedDatabases = loadedDatabases? loadedDatabases.split('-').filter(Boolean): [];
  loadedDatabases.forEach(ldb => {
    let loadedDb   = localDataServer(ldb, inSession);
    let loadedJSON = loadedStorage.getItem(`${localDBJSUtils._storageKeyName}-${ldb}`);
    if(loadedJSON) loadedDb.import(loadedJSON);
  });
}

// Lazy load before module imports (session databases too, they were never reloaded)
document.writeln(`
<script>localJSDataLoad(); localJSDataLoad("session");</script>
`);
