# Opal Overlay

A Hypixel Bedwars overlay.

## Installation

1. Download latest release from [here](https://github.com/AnotherPillow/opal-overlay/releases).
2. Unzip the file.
3. Run `Opal Overlay.exe`.

## Usage

1. Run `Opal Overlay.exe`.
2. If prompted, enter your Hypixel API key. (Optained from running `/api` in-game.)
3. When in a bedwars game or queue, type `/who` in the chat to populate the overlay.

## Features

- There is an opacity slider on the overlay to change the opacity of the overlay.
- You can reset the player list by pressing the reset button or running `/who` again.
- Adjusts for prestige colour, username colour (Paid ranks, youtube and admin) and if their FKDR is above 2 (stat turns red).
- Automatically populates when you run `/who` in chat.
- Displays the currently in use resource pack (only works if you change it while overlay is open).

## Development/Contributing

1. Fork the repository.
2. Clone your fork.
3. Run `npm install`.
4. Make your changes, the preload script is `payload.js`, the main electron script is `index.js` and the renderer code is in `renderer/`.
5. To test your changes, run `npm run dev` and the overlay will open in a window.
6. To test if your changes work when built, run `npm run build` and run the `Opal Overlay.exe` in the `dist` folder.
7. Create a pull request.
