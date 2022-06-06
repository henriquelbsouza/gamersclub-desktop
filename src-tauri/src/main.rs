#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]
use tauri::{ WindowUrl, WindowBuilder };
use std::fs;
mod menu;

fn main() {
  let menu = menu::create_menu();
  tauri::Builder::default().setup(|app| {
    let level_bar = fs::read_to_string("./src/js/general/barraDeLevel.js").expect("Unable to read file");
    let my_matches = fs::read_to_string("./src/js/my-matches/index.js").expect("Unable to read file");
    let lobby = fs::read_to_string("./src/js/lobby/index.js").expect("Unable to read file");
    let data = level_bar + &my_matches + &lobby;
    WindowBuilder::new(app, "core", WindowUrl::App("https://www.gamersclub.com.br".into()))
      .initialization_script(&data)
      .title("Gamersclub Booster Desktop")
      .maximized(true)
      .build()?;
    Ok(())
  })
    // .menu(menu)
    // .on_menu_event(menu::menu_events)
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
