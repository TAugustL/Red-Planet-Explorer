import { createSignal } from "solid-js";
import { invoke } from "@tauri-apps/api/tauri";


function App() {
  const [searchContent, setSearchContent] = createSignal([]);
  const [query, setQuery] = createSignal("");
  const [path, setPath] = createSignal("");

  const [rename, setRename] = createSignal("");
  const [copy, setCopy] = createSignal([]);
  const [cutfiles, setCutfiles] = createSignal([]);
  const [newfile, setNewfile] = createSignal("");

  /* Search options */
  const [resultLimit, setLimit] = createSignal(0);
  const [searchDepth, setDepth] = createSignal(0);
  const [ignoreCase, setIgnore] = createSignal(false);
  const [hiddenFiles, setHidden] = createSignal(false);
  const [strictSearch, setStrict] = createSignal(false);

  setLimit(256);
  setDepth(6);
  setIgnore(true);
  setHidden(true);
  setStrict(false);

  function searchOptions() {
    return (
      <div 
          class="dropdown"
      >
          <button class="dropbtn" disabled>...</button>
          <div class="dropdown-content">
              <label>
                  <input type="number" value="256" onChange={(e) => setLimit(parseInt(e.currentTarget.value))}/>
                  limit
              </label>
              <label>
                  <input type="number" value="6" onChange={(e) => setDepth(parseInt(e.currentTarget.value))}/>
                  depth
              </label>
              <br/>
              <label>
                  <input type="checkbox" checked="true" onChange={(e) => setIgnore(e.currentTarget.checked)}/>
                  ignore case
              </label>
              <br/>
              <label>
                  <input type="checkbox" checked="true" onChange={(e) => setHidden(e.currentTarget.checked)}/>
                  hidden files
              </label>
              <br/>
              <label>
                  <input type="checkbox" onChange={(e) => setStrict(e.currentTarget.checked)}/>
                  strict search
              </label>
          </div>
      </div>
    )
  }

  function reload() {
    clear("left-out");
    clear("output");
    filesInDir();
  }

  function currentPath() {
    invoke('current_path').then((path) => {
      var dir_path = document.getElementById("dir_path");
      dir_path.placeholder = String(path);
      dir_path.value = String(path);
    })
  }

  function openDirInWinExplorer() {
    invoke('open_dir_in_winexp', {fname: path});
  }

  function fileExtension(file) {
    var split = file.split(".").at(0);
    if (split.length == file.length) {
      return "dir";
    } else {
      return "file"
    }
  }

  function filesInDir() {
    invoke('list_files_in_dir').then((files) => {
      var file_output = document.getElementById("left-out");

      for (var i = 0; i < files.length; i++) {
        var file = document.createElement("button");
        file.classList.add("left-out-btn");
        file.innerHTML = files[i];
        
        var icon = document.createElement("p");
        icon.classList.add("file-type");
        var br = document.createElement("br");

        if (fileExtension(files[i]) == "dir") {
          icon.innerHTML = "▟ ";
          icon.classList.add("dir");
          if (i != 0) {
            file_output.appendChild(br);
          }
        } else {
          icon.innerHTML = "█ ";
          icon.classList.add("file");
          if (i != 0) {
            file_output.appendChild(br);
          }
        }
        file_output.appendChild(icon);

        //Super mega function caller!
        file.addEventListener('dblclick', openFile.bind(this, file.innerHTML));
        file.addEventListener('click', function (e) {
          if (e.ctrlKey || e.shiftKey || e.altKey) {
            selectFile(this, file);
          } else {
            deselectAll();
            selectFile(this, file);
          }
        })

        file_output.appendChild(file);
      }
    })
  }

  function moveUp() {
    invoke("move_up");
    currentPath();
    clear("left-out");
    filesInDir();
  }

  function clear(output_id) {
    let li_output = document.getElementById(output_id);
    li_output.innerHTML = "";
  }

  function deselectAll() {
    var c_files = document.getElementsByClassName("selected");
    while (c_files.length > 0) {
      c_files[0].classList.remove("selected");
    }
  }

  function renameFile() {
    var c_files = document.getElementsByClassName("selected");
    for (var i = 0; i < c_files.length; i++) {
      var file = c_files[i].innerHTML;
      var name = rename();
      if (i > 0) {
        if (fileExtension(file) == "dir") {
          name += String(i)
        } else {
          var pre = name.split(".").at(0);
          pre += String(i);
          name = pre + "." + file.split(".").at(1);
        }
      }
      invoke('rename_file', {file: c_files[i].firstChild.nodeValue, newname: name});
    }
    reload();
  }

  function copyFile() {
    invoke('current_path').then((path) => {
      var c_files = document.getElementsByClassName("selected");
      var targetedFiles = []
      for (var i = 0; i < c_files.length; i++) {
        var entry_path = String(path) + "/" + c_files[i].firstChild.nodeValue
        targetedFiles.push(entry_path);
      }
      setCopy(targetedFiles);
    })
  }

  function pasteFile() {
    var ding = copy();
    for (var i = 0; i < ding.length; i++) {
      var entry = ding.at(i);
      invoke('copy_file', {file: entry})
    }

    var dong = cutfiles();
    for (var i = 0; i < dong.length; i++) {
      var entry = dong.at(i);
      invoke('delete_file', {file: entry})
    }

    reload();
  }

  function deleteFile() {
    var c_files = document.getElementsByClassName("selected");
    while (c_files.length > 0) {
      invoke('delete_file', {file: c_files[0].innerHTML});
      c_files[0].classList.remove("selected");
    }
    reload();
  }

  function createFile() {
    invoke('create_file', {filename: newfile()});
    reload();
  }

  function cutFile() {
    invoke('current_path').then((path) => {
      var c_files = document.getElementsByClassName("selected");
      var targetedFiles = []
      for (var i = 0; i < c_files.length; i++) {
        var entry_path = String(path) + "/" + c_files[i].firstChild.nodeValue
        targetedFiles.push(entry_path);
      }
      setCutfiles(targetedFiles);
    })

    copyFile();
  }

  function array_to_ul(array, output_id) {
    for (var i = 0; i < array.length; i++) {
      var ul_item = document.createElement("li");
      ul_item.innerHTML = array.at(i);
      var li_output = document.getElementById(output_id);
      li_output.appendChild(ul_item);
    }
  }

  async function search() {
    setSearchContent(await invoke("search_for_query", { query: query(), resnum: resultLimit(), sdepth: searchDepth(), igcase: ignoreCase(), hidfiles: hiddenFiles(), strict: strictSearch() }));
  }

  async function newPath() {
    setPath(await invoke("change_path", { path: path() }));
  }

  const selectFile = (file) => {
    file.classList.add("selected");
  }

  //Super mega function!
  const openFile = (f_name) => {
    invoke('open_file', {fname: f_name});
    currentPath();
    clear("left-out");
    filesInDir();
  }

  return (
    <div class="main_container" onclick={(e) => {
      if (e.target != "[object HTMLButtonElement]" && e.target != "[object HTMLInputElement]") {
        deselectAll();
      }
    }}>

      <div class="container">
        <div class="top1">
          <button onclick={moveUp} class="menu_button">⇧</button>
          <button onclick={reload} class="menu_button">↻</button>
          <button onclick={copyFile} class="menu_button">Copy</button>
          <button onclick={pasteFile} class="menu_button">Paste</button>
          
          <div class="dropdown">
            <button onclick={renameFile} class="menu_button">Rename</button>
            <div class="dropdown-content">
                <label>
                    Rename to:
                    <input type="text" placeholder="file name" onChange={(e) => {
                      setRename(e.currentTarget.value);
                      renameFile();
                    }}/>
                </label>
            </div>
          </div>
    
          <button onclick={deleteFile} class="menu_button">Delete</button>

          <div class="dropdown">
            <button onclick={createFile} class="menu_button">New File</button>
            <div class="dropdown-content">
                <label>
                    New File:
                    <input type="text" placeholder="file name" onChange={(e) => {
                      setNewfile(e.currentTarget.value);
                      createFile();
                    }}/>
                </label>
            </div>
          </div>

          <button onclick={cutFile} class="menu_button">Cut</button>
          <button onclick={openDirInWinExplorer} class="menu_button">@Win-Explorer</button>
        </div>

        <div class="top2">
          <form
            class="row"
            onSubmit={(e) => {
              e.preventDefault();
              if (e.currentTarget.firstChild.value != e.currentTarget.firstChild.placeholder) {
                newPath();
              }
              clear("left-out");
              filesInDir();
              document.getElementById("dir_path").placeholder=currentPath();
            }}
          >
            <input
                  class="path_input"
                  id="dir_path"
                  onChange={(e) => setPath(e.currentTarget.value)}
                  placeholder={currentPath()}
              />
          </form>
        </div>

        <div class="left">
          <div id="left-out">{filesInDir()}</div>
        </div>

        <div class="right1">
          <form
              onSubmit={(e) => {
                  e.preventDefault();
                  search();
                  clear("output");
              }}
              >
              <input
                  class="input"
                  onChange={(e) => setQuery(e.currentTarget.value)}
                  placeholder="Enter a search query..."
              />
              <button type="submit">Search</button>
              {searchOptions}
          </form>
        </div>

        <div class="right2">
          <div class="search_results">
            <ul id="output">{array_to_ul(searchContent(), "output")}</ul>
          </div>
        </div>

        <div class="bottom">
          <p>Made by <a target="_blank" href="https://github.com/TAugustL">Toni A. Lobach</a> | ©2024</p>
        </div>

      </div>
    </div>
  );
}

export default App;
