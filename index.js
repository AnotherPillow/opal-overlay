const {app, BrowserWindow, screen, ipcMain} = require('electron');
const path = require('path');
const url = require('url');
const Tail = require('tail').Tail;
const fetch = require('node-fetch');
const fs = require('fs');
const configPath = path.join(app.getPath('userData'), 'config.json');

if (!fs.existsSync(configPath)) 
    fs.writeFileSync(configPath, JSON.stringify({api_key:''}));

let config = require(configPath);

const appdata = process.env.appdata
const homedir = app.getPath('home');

//Discord RPC was down, so I commented it out. I'll uncomment it when it's back up.
/*const RPC = require('discord-rpc');
const rpc = new RPC.Client({transport: 'ipc'})

rpc.on('ready', () => {
    console.log('Discord RPC Connected')
    rpc.setActivity({
        state: 'Opal Overlay',
        details: 'Using Opal Overlay',
        largeImageKey: 'opal_overlay512x512',
        largeImageText: 'Opal Overlay',
        startTimestamp: new Date(),
        instance: false,
        smallImageKey: 'opal_overlay512x512',
        smallImageText: 'Opal Overlay'
    }
    )
})
rpc.login({clientId: "1052622317290795079"})*/
        

let win;

function createWindow () {;
    win = new BrowserWindow({
        width: 500,
        height: 125,
        transparent: true,
        frame: false,
        webPreferences: {
            nodeIntegration: true,
            preload: path.join(__dirname, 'preload.js')
        }
    });
    
    win.setAlwaysOnTop(true);
    
    win.loadURL(url.format({
        pathname: path.join(__dirname, 'renderer', 'index.html'),
        protocol: 'file:',
        slashes: true
    }));
    ;
    win.on('closed', () => {
        win = null;
    });
    
    win.setPosition(screen.getPrimaryDisplay().workAreaSize.width - 700, 0)

    setTimeout(() => {
        win.webContents.send("conf",config);
    }, 500);
}


//app.on('ready', createWindow);
app.on('ready', () => {
    createWindow();
});
setTimeout(() => {
    win.webContents.send("conf",config);
}, 1500);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
})

app.on('activate', () => {
    if (win === null) {
        createWindow();
    }
})

ipcMain.on('resize', (event,data) => {
    //change the window's height
    win.setSize(500, data.height)
})

ipcMain.on('client', (event,data) => {
    let tail;
    switch (data.client) {
        case 'vanilla':
            tail = (appdata + '/.minecraft/logs/latest.log');
            break;
        case 'forge':
            tail = (appdata + '/.minecraft/logs/latest.log');
            break;
        case 'lunar':
            tail = (homedir + '/.lunarclient/offline/multiver/logs/latest.log');
            break;
        case 'badlion':
            tail = (appdata + '/.minecraft/logs/blclient/minecraft/latest.log');
            break;
        case 'feather':
            tail = (appdata + '/.minecraft/logs/latest.log');
            break;
        case 'laby':
            tail = (appdata + '/.minecraft/logs/fml-client-latest.log');
            break;
        default:
            tail = (appdata + '/.minecraft/logs/latest.log');
            break;
    }
    runTail(tail);
    })

const toRenderer = (data) => {
    win.webContents.send("renderer",data);
}


function runTail(path) {
    var tail = new Tail(path, {logger: console, useWatchFile: true, nLines: 1, fsWatchOptions: {interval: 100}});
    tail.on("line", function(data) {

        
        var players = []
        if (/^\[\d\d:\d\d:\d\d\] \[Client thread\/INFO\]: \[CHAT\] ONLINE: (.+)$/.test(data)) {
            players = data.match(/^\[\d\d:\d\d:\d\d\] \[Client thread\/INFO\]: \[CHAT\] ONLINE: (.+)$/)[1].split(", ");
        } else if (/^\[\d\d:\d\d:\d\d\] \[Client thread\/INFO\]: \[OptiFine\] Resource packs: (.+)$/.test(data)) {
            let packName = data.match(/^\[\d\d:\d\d:\d\d\] \[Client thread\/INFO\]: \[OptiFine\] Resource packs: (.+)$/)[1];

            packName = packName.replace(/§[0-9a-z]/g, '');
            packName = packName.replace(/┐¢[0-9a-z]/g, '');
            packName = packName.replace(/�[0-9a-z]/g, '');
            packName = packName.replace('.zip', '');
            //remove a starting ! if it exists
            if (packName.startsWith("! ")) {
                packName = packName.substring(2);
            }

            return toRenderer({
                type: "resourcepack",
                data: packName
            })

        } else if (/^\[\d\d:\d\d:\d\d\] \[Client thread\/INFO\]: \[CHAT\] Team #([0-9]+): ([a-zA-z0-9_]+)$/.test(data)) {

        }
        if (players.length >= 1) {
            let bwPlayers = []
            let forLoopRuns = players.length;
            
            config = JSON.parse(fs.readFileSync(configPath));
    
            const apiURL = 'https://api.hypixel.net/player?key=' + config.api_key + '&uuid=';
            
            for (const player of players) {
                fetch("https://api.mojang.com/users/profiles/minecraft/" + player).then(res=>res.json()).then(json => {
                    let nick = false;
                    if (json.errorMessage === "Couldn't find any profile with that name") nick = true;

                    let uuid;
                    if (!nick) uuid = json.id.replace(/-/g, '') || "NULL";
                    
                    fetch(apiURL + uuid).then(res => res.json()).then(hyp => {
                        console.log("recv hypixel data")
                        let data = {
                            bwStats: {}
                        }
                        data.nick = nick;
                        if (hyp.player === null) data.nick = true;
                        if (!nick) {
                            data.uuid = uuid;
                            data.name = player;
                            try {data.paidRank = hyp.player.newPackageRank || "NON";} catch (_){}
                            try {data.rank = hyp.player.rank || "NULL";} catch (_){}

                            try {if (hyp.player.monthlyPackageRank === 'SUPERSTAR') data.paidRank = 'MVP_PLUS_PLUS';} catch (_){}

                                
                            let bedwars = {}
                            try {bedwars = hyp.player.stats.Bedwars} catch (_){}
                            const tfinals = bedwars.final_kills_bedwars || "-";
                            const tbeds = bedwars.beds_broken_bedwars || "-";
                            const twins = bedwars.wins_bedwars || "-";
                            const tkills = bedwars.kills_bedwars || "-";
                            const tdeaths = bedwars.deaths_bedwars || "-";
                            const tlosses = bedwars.losses_bedwars || "-";
                            const tfinald = bedwars.final_deaths_bedwars || "-";
                            const tbedslost = bedwars.beds_lost_bedwars || "-";
                            
                            if (tfinals + tbeds + twins + tkills + tdeaths + tlosses + tfinald > 0) {
                                data.bwStats = {
                                    finalKills: tfinals,
                                    bedsBroken: tbeds,
                                    wins: twins,
                                    kills: tkills,
                                    deaths: tdeaths,
                                    losses: tlosses,
                                    finalDeaths: tfinald,
                                    bedsLost: tbedslost,
                                }
                            }
                            try {if (hyp.player.achievements.bedwars_level >= 0) data.bwStats.star = hyp.player.achievements.bedwars_level;}
                            catch (_){data.bwStats.star = 0;}
                        } else {
                            data.name = player;
                            data.rank = "NULL";
                            data.paidRank = "NON";
                        }
                        bwPlayers.push(data)
                        forLoopRuns--
                        if (forLoopRuns == 0) {
                            console.log(
                                `bwPlayers (len=${bwPlayers.length}):`,
                                bwPlayers
                            )
                            toRenderer({
                                type: 'bwPlayers',
                                data: bwPlayers
                            })
                        }
                    })
                })
            }
            
        }
        
    })
    tail.on("error", function(error) {
        console.log('ERROR: ', error);
    });
}

ipcMain.on('config', (event,data) => {
    config = data;
    fs.writeFile(configPath, JSON.stringify(data), (err) => {
        if (err) throw err;
    });
})

ipcMain.on('exit', (event,data) => {
    app.quit();
})