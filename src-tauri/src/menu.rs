use tauri::{CustomMenuItem, Menu, Submenu, WindowMenuEvent, Wry, WindowBuilder, WindowUrl};
pub fn create_menu() -> Menu {
    let config = CustomMenuItem::new("config".to_string(), "Configurações");
    let quit = CustomMenuItem::new("quit".to_string(), "Quit");
    let submenu = Submenu::new("File", Menu::new().add_item(config).add_item(quit));
    return Menu::new()
        .add_submenu(submenu);
}
pub fn menu_events(event: WindowMenuEvent<Wry>) {
    match event.menu_item_id() {
        "quit" => {
            std::process::exit(0);
        }
        "config" => {
            tauri::Builder::default().setup(|app| {
                WindowBuilder::new(app, "config", WindowUrl::App("index.html".into()))
                    .resizable(false)
                    .inner_size(610.0, 550.0)
                    .title("Gamersclub Booster Config")
                    .build()?;
                Ok(())
            })
                .run(tauri::generate_context!())
                .expect("error while running tauri application");
        }
        _ => {}
    }
}