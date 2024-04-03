// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use explorer;

#[tauri::command]
fn search_for_query(query: &str, resnum: usize, sdepth: usize, igcase: bool, hidfiles: bool, strict: bool) -> Vec<String> {
    explorer::search(&query.to_string(), resnum, sdepth, igcase, hidfiles, strict)
}

#[tauri::command]
fn list_files_in_dir() -> Vec<String> {
    explorer::list_dir(explorer::current_path())
}

#[tauri::command]
fn change_path(path: &str) -> String {
    explorer::change_dir(&path.to_string());
    explorer::current_path()
}

#[tauri::command]
fn current_path() -> String {
    (explorer::current_path()).into()
}

#[tauri::command]
fn move_up() -> () {
    explorer::move_up(1);
}

#[tauri::command]
fn rename_file(file: &str, newname: &str) {
    explorer::rename_file(&file.to_string(), newname);
}

#[tauri::command]
fn open_file(fname: &str) -> () {
    let mut path: String = explorer::current_path();
    path.push('/');
    path.push_str(&fname);

    let file_type: String = explorer::check_file_type(&path);
    match file_type.as_str() {
        "dir" => explorer::change_dir(&path.to_string()),
        _ => explorer::open_file(&path.to_string()),
    }
}

#[tauri::command]
fn open_dir_in_winexp() -> () {
    explorer::open_file(&current_path());
}

#[tauri::command]
fn copy_file(file: &str) -> () {
    explorer::copy_file(&file.to_string());
}

#[tauri::command]
fn delete_file(file: &str) -> () {
    if !file.starts_with("C:/") {
        let mut path = explorer::current_path();
        path.push_str(format!("/{}", file).as_str());
        explorer::delete_file(&path.to_string());
    } else {
        explorer::delete_file(&file.to_string());
    }
} 

#[tauri::command]
fn create_file(filename: &str) -> () {
    explorer::create_file(&filename.to_string());
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            search_for_query, 
            change_path,
            list_files_in_dir,
            current_path,
            open_file,
            move_up,
            rename_file,
            copy_file,
            delete_file,
            create_file,
            open_dir_in_winexp,
            ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
