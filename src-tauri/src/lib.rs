use std::{fs, process::Command};
use opener::open;
use rust_search::SearchBuilder;

pub fn list_dir(dir_path: String) -> Vec<String> {
    const INVALID_PERMISSIONS: [&str; 8] = [" 9238 ", " 28 ", " 38 ", " 39 ", " 8230 ", " 8214 ", " 22 ", " 6 "];

    let mut results: Vec<String> = Vec::new();
    let dir_path = fs::read_dir(dir_path).unwrap();
    for path in dir_path {
        match path {
            Ok(path_ok) => {
                if let Ok(metadata) = path_ok.metadata() {
                    let check = format!("{:?}", metadata.permissions());
                    let mut has_permission: bool = true;
                    for permission in INVALID_PERMISSIONS {
                        if check.contains(permission) {
                            has_permission = false;
                        }
                    }
                    if has_permission {
                        results.push(String::from(path_ok.file_name().into_string().unwrap()))
                    }
                }
            },
            Err(err) => eprintln!("{err}: Failed to list directory!")
        }
    }
    results
}

pub fn check_file_type(file_path: &String) -> String {
    if let Ok(data) = fs::metadata(file_path) {
        let file_type = data.file_type();
        if file_type.is_file() {
            return String::from("file");
        } else if file_type.is_dir() {
            return String::from("dir");
        }
    }
    return "".to_string();
}

pub fn delete_file(file_path: &String) -> () {
    if check_file_type(file_path) == "file".to_string() {
        match fs::remove_file(&file_path) {
            Ok(()) => (),
            Err(err) => eprintln!("{err}: Failed to delete file!"), 
        }
    } else if check_file_type(file_path) == "dir".to_string() {
        match fs::remove_dir(&file_path) {
            Ok(()) => (),
            Err(err) => eprintln!("{err}: Failed to delete directory!"),
        }
    }
}

pub fn create_file(file_name: &String) {
    let mut path = current_path();
    path.push_str(format!("/{}", file_name).as_str());
    
    if file_name.contains(".") && !file_name.starts_with(".") {
        match fs::File::create(path) {
            Ok(_file) => (),
            Err(err) => eprintln!("{err}: Failed to create file!"),
        }
    } else {
        match fs::create_dir_all(path) {
            Ok(_dir) => (),
            Err(err) => eprintln!("{err}: Failed to create directory!"),
        }
    }
}

pub fn rename_file(file_path: &String, new_name: &str) -> () {
    let mut path = current_path();
    let mut target = current_path();
    path.push_str(format!("/{}", file_path).as_str());
    target.push_str(format!("/{}", new_name).as_str());
    match fs::rename(path, &target) {
        Ok(()) => (),
        Err(err) => eprintln!("{err}: Failed to rename file!"),
    }
}

pub fn open_file(file_path: &String) -> () {
    match open(file_path) {
        Ok(()) => (),
        Err(err) => eprintln!("{err}: Failed to open {file_path}"),
    }
}

pub fn copy_file(file_path: &String) -> () {
    let file_path = file_path.replace("/", "\\");
    let cur_path = current_path().replace("/", "\\");
    let mut cmd = Command::new("cmd");

    cmd.args(&["/C", "copy", &file_path, &cur_path]);
    match cmd.output() {
        Ok(_o) => (),
        Err(err) => eprintln!("{err}"),
    }
}

pub fn change_dir(path: &String) -> () {
    if fs::metadata(path).is_ok() {
        match fs::write("path.txt", path) {
            Ok(()) => (),
            Err(err) => eprintln!("{err}: Failed to change directory!")
        }
    } else {
        eprintln!("Directory does not exist!");
    }
}

pub fn current_path() -> String {
    if let Ok(mut path) = fs::read_to_string("path.txt") {
        if path.ends_with("/") && path.len() > 3 {
            return match path.pop() {
                Some(_a) => path,
                None => path
            }
        }
        let path = path.replace("//", "/");
        return path;
    } else {
        return String::from("C:/");
    }
}

pub fn move_up(amount: i32) -> () {
    let mut above_path = String::new();
    if let Ok(path) = fs::read_to_string("path.txt") {
        let mut path_parts: Vec<&str> = path.split('/').collect();

        for i in 0..amount {
            if !path.ends_with("/") {
                match path_parts.pop() {
                    Some(_a) => (),
                    None => ()
            }}
            if path.ends_with("/") {
                for _i in 0..(2 - i) {
                    match path_parts.pop() {
                        Some(_a) => (),
                        None => ()
                    }
                }
            }
        }
        for s_slice in &path_parts {
            above_path.push_str(s_slice);
            above_path.push_str("/");
        }
        change_dir(&above_path);
    }
}

pub fn search(query: &String, result_num: usize, search_depth: usize, ignore_case: bool, hidden_files: bool, strict: bool) -> Vec<String> {
    let mut results: Vec<String> = Vec::new();

    let mut search = SearchBuilder::default()
        .location(current_path())
        .search_input(query)
        .limit(result_num) // results to return
        .depth(search_depth);

    if ignore_case {
        search = search.ignore_case();
    }
    if hidden_files {
        search = search.hidden();
    }
    if strict {
        search = search.strict();
    }

    let search: Vec<String> = search.build().collect();

    for path in &search {
        let path = path.replace("\\", "/");
        results.push(path.to_string());
    }
    if search.is_empty() {results.push("No results!".to_string())}
    else {results.push(format!("{} result(s)", results.len()))}
    results
}
