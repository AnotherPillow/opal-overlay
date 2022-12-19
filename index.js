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
    var logContents = fs.readFileSync(path, 'utf8');
    var IGN;
    if (path.includes('lunarclient')) {
        for (line of logContents.split('\n')) {
            const x= line.match(/(?<=\[\d\d:\d\d:\d\d\] \[Client thread\/INFO\]: \[LC\] Setting user: ).+/g);
            if (x) {
                IGN = x[0];
                break;
            }
        }
    } else {
        for (line of logContents.split('\n')) {
            const x = logContents.match(/(?<=\[\d\d:\d\d:\d\d\] \[Client thread\/INFO\]: Setting user: ).+/g);
            if (x) {
                IGN = x[0];
                break;
            }
        }
    }

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

            updateRPCDescription('Playing Bedwars', `Using ${packName}`);

            return toRenderer({
                type: "resourcepack",
                data: packName
            })

        } else if (/^\[\d\d:\d\d:\d\d\] \[Client thread\/INFO\]: \[CHAT\] Team #([0-9]+): ([a-zA-z0-9_]+)$/.test(data)) {
            
        } else if (/^\[\d\d:\d\d:\d\d\] \[Client thread\/INFO\]: \[CHAT\] .+ (was .+ by|by|with) .+$/.test(data)) {
            var action = ''
            var message = data.match(/^\[\d\d:\d\d:\d\d\] \[Client thread\/INFO\]: \[CHAT\] (.+)$/)[1];

            if (!message) return;

            if (message.toUpperCase().startsWith('BED DESTRUCTION') || /[A-Z]+ BED/.test(message.toUpperCase())) {
                action = 'bed_break'
            } else if (message.toUpperCase().includes('FINAL KILL')) {
                action = 'final_kill'
            } else if (message.toUpperCase().includes("'S GOLEM") || message.toUpperCase().includes("DREAM DEFENDER")) {
                action = 'golem_kill'
            } else {
                action = 'kill'
            }

            
            if (message.includes(".") || message.includes("!")) {
                message = message.replace(".", "");
                message = message.replace("!", "");
            }
            
            const components = message.split(' ');
            
            let victim;
            if (action === 'bed_break') victim = components[3] + " " + components[4];
            else victim = components[0];

            let killer;
            if ((action === 'kill' && !message.includes("#")) || action === 'bed_break')
                killer = components[components.length - 1];
            else if ((action === 'final_kill' && message.includes("#")))
                killer = components[components.length - 5].replace("'s", "");
            else if (action === 'golem_kill')
                killer = components[components.length - 2].replace("'s", "");
            else if (action === 'final_kill')
                killer = components[components.length - 3]; 
            else
                killer = components[components.length - 1];

            

            /*console.log(
                `Killer: ${killer} - ${action}\n`,
                `Victim: ${victim} - ${action}`
            )*/
            let content = {
                killer: killer,
                victim: victim,
                type: action
            }
            if (action === 'final_kill' && victim === IGN) {
                content['self_type'] = 'final_death'
            } else if (action === 'final_kill' && killer === IGN) {
                content['self_type'] = 'final_kill'
            } else if (action === 'kill' && killer === IGN) {
                content['self_type'] = 'kill'
            } else if (action === 'kill' && victim === IGN) {
                content['self_type'] = 'death'
            } else if (action === 'bed_break' && killer === IGN) {
                content['self_type'] = 'bed_break'
            } else if (action === 'bed_break' && victim === "Your Bed") {
                content['self_type'] = 'bed_lose'
            } else {
                content['self_type'] = undefined
            }

            /*
            death
            kill
            final_death
            final_kill
            bed_break
            bed_lose
            undefined
             */

            console.log(content)

            if (content.self_type === undefined) return;
            console.log("hnnnngh")
            toRenderer({
                type: "stats",
                data: content
            });

        }
        if (players.length >= 1) {
            updateRPCDescription('Playing Bedwars', 'Using Opal Overlay');
            let bwPlayers = []
            let forLoopRuns = players.length;
            
            config = JSON.parse(fs.readFileSync(configPath));
    
            const apiURL = 'https://api.hypixel.net/player?key=' + config.api_key + '&uuid=';
            
            for (const player of players) {
                let r;
                fetch("https://api.mojang.com/users/profiles/minecraft/" + player).then(res=>r=res).then(res=>res.json()).then(json => {
                    let nick = false;
                    if (json.errorMessage === "Couldn't find any profile with that name"|| r.status === 204) nick = true;

                    let uuid;

                    if (!json.id) json.id = undefined
                    if (!nick && json.id !== undefined) uuid = json.id.replace(/-/g, '') || "NULL";
                    else uuid = "NULL";
                    
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