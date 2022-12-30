const {app, BrowserWindow, screen, ipcMain, dialog} = require('electron');
const path = require('path');
const url = require('url');
const Tail = require('tail').Tail;
const fetch = require('node-fetch');
const exec = require('child_process').exec;
const fs = require('fs');
const configPath = path.join(app.getPath('userData'), 'config.json');

if (!fs.existsSync(configPath)) 
    fs.writeFileSync(configPath, JSON.stringify({api_key:''}));

const vbsCWD = app.isPackaged ? path.join(process.resourcesPath, 'app.asar.unpacked', 'src') : path.join(__dirname, 'SRC');

let config = require(configPath);
if (!config.autowho) config.autowho = true;
var enableAutowho = config.autowho || true;

const appdata = process.env.appdata
const homedir = app.getPath('home');

const version = app.getVersion();

const startDate = new Date();
const RPC = require('discord-rpc');
const rpc = new RPC.Client({transport: 'ipc'})

rpc.on('ready', () => {
    console.log('Discord RPC Connected')
    rpc.setActivity({
        state: 'Playing Minecraft',
        details: 'Using Opal Overlay',
        largeImageKey: 'opal_overlay512x512',
        largeImageText: 'Opal Overlay',
        startTimestamp: startDate,
        smallImageKey: 'bed',
        instance: false,
        buttons: [
            {
                label: "Download Opal Overlay",
                url: "https://github.com/AnotherPillow/opal-overlay/releases/latest",
            }
        ]
    })
})
rpc.login({clientId: "1052622317290795079"})
        

let win;

function createWindow () {;
    win = new BrowserWindow({
        width: 500,
        height: 125,
        transparent: true,
        frame: false,
        webPreferences: {
            nodeIntegration: true,
            preload: path.join(__dirname, 'src', 'preload.js')
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
        win.webContents.send("conf",{
            config: config,
            version: version
        });
    }, 600);
}

//app.on('ready', createWindow);
app.on('ready', () => {
    createWindow();
});
setTimeout(() => {
    win.webContents.send("conf",{
        config: config,
        version: version
    });
}, 1600);

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
    var IGN = findIGN(path);
    
    var tail = new Tail(path, {logger: console, useWatchFile: true, nLines: 1, fsWatchOptions: {interval: 100, }, encoding: 'utf8'});
    tail.on("line", function(data) {

        //console.log(data)

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

            updateRPCDescription('Playing Bedwars', `Using ${packName}`);

            return toRenderer({
                type: "resourcepack",
                data: packName
            })

        } else if (/^\[\d\d:\d\d:\d\d\] \[Client thread\/INFO\]: \[CHAT\] Team #([0-9]+): ([a-zA-z0-9_]+)$/.test(data)) {
            //Skywars /who (WIP)
        } else if (/^\[\d\d:\d\d:\d\d\] \[Client thread\/INFO\]: \[CHAT\] ([A-Za-z0-9_]+) has joined \(\d+\/\d+\)!$/.test(data)
        && data.includes(IGN)) {
            if (enableAutowho) {
                console.log(BrowserWindow.getFocusedWindow())
                exec('wscript who.vbs', {cwd: vbsCWD}, (err, stdout, stderr) => {
                    if (err !== null) dialog.showErrorBox("Error",
                        "An error occurred while trying to run autowho. Please run /who manually.");
                });
            }
        }
        if (players.length >= 1) {
            updateRPCDescription('Playing Bedwars', 'Using Opal Overlay');
            let bwPlayers = []
            let forLoopRuns = players.length;
            
            config = JSON.parse(fs.readFileSync(configPath));
    
            const apiURL = 'https://api.hypixel.net/player?key=' + config.api_key + '&uuid=';
            
            for (const player of players) {
                try {
                    let r;
                    fetch("https://api.mojang.com/users/profiles/minecraft/" + player).then(res=>r=res).then(res=>res.json()).then(json=>{
                        let nick = false;
                        
                        if (json.errorMessage === "Couldn't find any profile with that name" || r.status === 204) nick = true;

                        let uuid;
                        if (json.id && !nick) uuid = json.id;
                        else {
                            nick=true;
                            uuid = "NULL";
                        }

                        fetch(apiURL + uuid).then(res => res.json()).then(hyp => {
                            console.log("recv hypixel data")
                            let data = {
                                bwStats: {}
                            }
                            data.nick = nick;
                            if (hyp.player === null || nick === true) data.nick = true;
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
                                /*console.log(
                                    `bwPlayers (len=${bwPlayers.length}):`,
                                    bwPlayers
                                )*/
                                toRenderer({
                                    type: 'bwPlayers',
                                    data: bwPlayers
                                })
                            }
                        })
                    })
                } catch (_) {
                    bwPlayers.push({
                            nick: true,
                            name: player,
                            bwStats: {
                                star:0,
                            },
                            rank: "NULL",
                            paidRank:"NON",
                        })
                    forLoopRuns--
                    if (forLoopRuns == 0) {
                        toRenderer({
                            type: 'bwPlayers',
                            data: bwPlayers
                        })
                    }
                }
            }
            
        }
        
    })
    tail.on("error", function(error) {
        console.log('ERROR: ', error);
    });
}

ipcMain.on('config', (event,data) => {
    enableAutowho = config.autowho;
    config = {...config, ...data};
    console.log(config)

    fs.writeFile(configPath, JSON.stringify(config), (err) => {
        if (err) throw err;
    });
})

ipcMain.on('exit', (event,data) => {
    app.quit();
})

const updateRPCDescription = (state,desc) => {
    rpc.setActivity({
        state: state,
        details: desc,
        largeImageKey: 'opal_overlay512x512',
        largeImageText: 'Opal Overlay',
        startTimestamp: startDate,
        instance: false,
        smallImageKey: 'bed',
    })
}
const findIGN = (path) => {
    var logContents = fs.readFileSync(path, 'utf8');
    if (path.includes('lunarclient')) {
            //Lunar Client initially logs you in as a cracked account with an IGN of "Player" and some numbers
        for (line of logContents.split('\n')) {
            const x= line.match(/(?<=\[\d\d:\d\d:\d\d\] \[Client thread\/INFO\]: \[LC\] Setting user: ).+/g);
            if (x) return x[0];
        }
    } else {
        for (line of logContents.split('\n')) {
            const x = logContents.match(/(?<=\[\d\d:\d\d:\d\d\] \[Client thread\/INFO\]: Setting user: ).+/g);
            if (x) return x[0];
        }
    }
}
