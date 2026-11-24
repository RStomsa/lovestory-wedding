// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
struct SystemInfo {
    os: String,
    app_version: String,
    realtime_sync: bool,
}

#[tauri::command]
fn get_system_info() -> SystemInfo {
    SystemInfo {
        os: "Windows 64-bit".to_string(),
        app_version: "2.0.0".to_string(),
        realtime_sync: true,
    }
}

#[tauri::command]
fn open_local_prints_folder() -> Result<String, String> {
    let prints_dir = std::path::Path::new("public/assets/prints");
    if prints_dir.exists() {
        #[cfg(target_os = "windows")]
        {
            let _ = std::process::Command::new("explorer").arg(prints_dir).spawn();
        }
        Ok("Đã mở thư mục in ấn".to_string())
    } else {
        Err("Thư mục in ấn chưa tồn tại".to_string())
    }
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            get_system_info,
            open_local_prints_folder
        ])
        .run(tauri::generate_context!())
        .expect("error while running LoveStory Studio desktop application");
}
