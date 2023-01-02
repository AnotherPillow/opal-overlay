# Opal Overlay

A Hypixel Bedwars overlay.

## Installation

1. Download latest release from [here](https://github.com/AnotherPillow/opal-overlay/releases).
2. Unzip the file.

## Usage

1. Run `Opal Overlay.exe`.
2. If prompted, enter your Hypixel API key. (Optained from running `/api` in-game.)
3. If you have autowho enabled, don't move for a few hundred milliseconds after joining a bedwars game, otherwise run `/who` in chat to populate the overlay.

## Features

- There is an opacity slider on the overlay to change the opacity of the overlay.
- You can reset the player list by pressing the reset button or running `/who` again.
- Adjusts for prestige colour, username colour (Paid ranks, youtube and admin) and if their FKDR is above 2 (stat turns red).
- Displays the currently in use resource pack (only works if you change it while overlay is open).
- Automatically checks for updates and notifies you if there is one.
- Discord RPC support.
- Choose between Minecraft font and Inconsolata font for the table.
- Automatically runs `/who` when you join a bedwars game and populates the overlay.
- Tracks current session stats

## Commands

- `/who` - Populates the overlay with the players in the game.
- `/w c` resets the table.
- `/w s` resets the current session stats.
- `/w ![IGN]` adds a user to the overlay who is not in the game.

## Development/Contributing

1. Fork the repository.
2. Clone your fork.
3. Run `npm install`.
4. Make your changes, the preload script is `src/payload.js`, the main electron script is `index.js` and the renderer code is in `renderer/`.
5. To test your changes, run `npm run dev` and the overlay will open in a window.
6. Install Python so that it can be used in the build script.
7. To test if your changes work when built, run `npm run build` and run the `Opal Overlay.exe` in the `dist` folder.
8. Create a pull request.

## Credits

![Abyss Overlay](https://github.com/Chit132/abyss-overlay) for the star colour code and the autowho script.

## Images

### Overlay

![Image of overlay](https://i.imgur.com/ykNYsZD.png)

### Opacity Slider

![GIF of opacity slider](https://i.imgur.com/XWMCTc6.gif)
