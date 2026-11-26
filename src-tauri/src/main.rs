#![windows_subsystem = "windows"]

use std::path::Path;
use std::process::Command;

fn find_browser() -> Option<String> {
    if let Ok(local_app_data) = std::env::var("LOCALAPPDATA") {
        let cent = format!(r"{}\CentBrowser\Application\chrome.exe", local_app_data);
        if Path::new(&cent).exists() {
            return Some(cent);
        }
    }
    let candidates = [
        r"C:\Program Files\Google\Chrome\Application\chrome.exe",
        r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
        r"C:\Program Files\BraveSoftware\Brave-Browser\Application\brave.exe",
        r"C:\Program Files\CocCoc\Browser\Application\browser.exe",
        r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
        r"C:\Program Files\Microsoft\Edge\Application\msedge.exe",
    ];
    for path in &candidates {
        if Path::new(path).exists() {
            return Some(path.to_string());
        }
    }
    None
}

fn main() {
    if let Some(browser) = find_browser() {
        let _ = Command::new(&browser)
            .arg("--app=http://localhost:3000/admin/studio")
            .arg("--window-size=1440,920")
            .spawn();
    } else {
        #[cfg(target_os = "windows")]
        {
            let _ = Command::new("cmd")
                .args(["/c", "start", "http://localhost:3000/admin/studio"])
                .spawn();
        }
    }
}
