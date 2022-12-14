# Opal Overlay

A Hypixel Bedwars overlay.

## Installation

1. Download the current source code from the page you're on right now.
2. Install [Node.js](https://nodejs.org/en/download/).
3. Open a terminal in the folder you downloaded the source code to and run `npm install`.
4. Run `npm run build` to build the project.
5. The built project will be in the `dist` folder.

## Usage

1. Open the `dist` folder and run `Opal Overlay.exe`.
2. If prompted, enter your Hypixel API key. (Optained from running `/api` in-game.)
3. When in a bedwars game or queue, type `/who` in the chat to populate the overlay.

## Features

- There is an opacity slider on the overlay to change the opacity of the overlay.
- You can reset the player list by pressing the reset button or running `/who` again.
- Adjusts for prestige colour, username colour (Paid ranks, youtube and admin) and if their FKDR is above 2 (stat turns red).
- Automatically populates when you run `/who` in chat.

## Development/Contributing

1. Fork the repository.
2. Clone your fork.
3. Make your changes, the preload script is `payload.js`, the main electron script is `index.js` and the renderer code is in `renderer/`.
4. To test your changes, run `npm run dev` and the overlay will open in a window.
5. To test if your changes work when built, run `npm run build` and run the `Opal Overlay.exe` in the `dist` folder.
6. Create a pull request.
