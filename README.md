Red Planet Explorer is a file explorer that uses HTML, CSS and JavaScript as frontent and Rust as backend. It is made using <a href="https://tauri.app/">Tauri</a>.
<h2>Features:</h2>
<ul>
  <li>Fast search: finds files in a matter of seconds with some search options</li>
  <li>Simplistic design: the UI is very easy to navigate</li>
  <li>Basic actions like Copy, Rename, Delete, Create</li>
</ul>

![alt text](https://github.com/TAugustL/Red-Planet-Explorer/blob/main/github_pictures/explorer1.png?raw=true)

<h2>Usage:</h2>
<p>The entire explorer is contained within this 800x600 window. It is build up of 5 main areas.</p>

![alt text](https://github.com/TAugustL/Red-Planet-Explorer/blob/main/github_pictures/explorer2.png?raw=true)

<p>You can select files with left-click or multiple files with Ctrl/Shift/Alt + left-click. All file actions can be performed on multiple selected files (also rename!).</p>
<p>Here are is an explanation for the actions:</p>
<ol>
  <li>The first action simply moves you one folder up</li>
  <li>The second action refreshes the page</li>
  <li>Copy copies all selected files</li>
  <li>Paste pastes the copied files to the current directory</li>
  <li>Rename will rename all selected files to the specified name*</li>
  <li>Delete will delete a file, however it won't delete an unempty directory</li>
  <li>New file creates a new file (no extension for folder)</li>
  <li>Cut copies the files and deletes them as soon as they are pasted</li>
  <li>@Win-Explorer opens the current directory in the Windows Explorer (bruh)</li>
</ol>

<p>When hovering over the field right of 'search' you will see the options for the file search.</p>
<ul>
  <li>limit sets the limit for shown results (default 256)</li>
  <li>depth sets the depth to which sub-folders are scanned (default 6)</li>
  <li>ignore case lets the search ignore capitalisation</li>
  <li>hidden files lets the search also include hidden files</li>
  <li>strict makes the search look for an exact match</li>
</ul>

<p>Multiple files are renamed in the following way:</p>
<p>hello.txt  ->  example.txt</p>
<p>fooba.txt  ->  example1.txt</p>
<p>test1.txt  ->  example2.txt</p>

<hr>

I know this is <u>not</u> a replacement for file explorers like the windows explorer (although the search is faster). This is my first desktop app I ever created, so please don't expect something too extraordinary ;) I probably wont update this project, however you can still leave issues or tips for improvement.
