function handleClient(path=false, gen) {
    const client = document.getElementById('client').value;
    
    if (!path) {
        path = {
            path: null,
            client: client
        }
    }
    api.send('client', path);
}

setInterval(() => {
    api.toRenderer().then((data) => {
        switch (data.type) {
            case 'bwPlayers':
                generateBedwarsUserTable(data.data);
                break;
            case 'resourcepack':
                handleResourcePack(data.data);
                break;
            default:
                break;
        }
    })
}, 1000)

const generateBedwarsUserTable = (users) => {
    /*
        users = [
            {
                name: 'username',
                bwStats: {
                    finalKills: 0,
                    bedsBroken: 0,
                    wins: 0,
                    kills: 0,
                    deaths: 0,
                    losses: 0,
                    finalDeaths: 0,
                    star: 0,
                    bedsLost: 0,
                }
                paidRank: 'rank',
            }
        ]
    */
    const table = document.getElementById('user-table');
    table.innerHTML = '';

    const header = document.createElement('tr');
    header.innerHTML = '<th>Icon</th><th>Name</th><th>FKDR</th><th>BBLR</th><th>WLR</th><th>TAG</th>';
    
    table.appendChild(header);

    //sort users by stars
    users.sort((a, b) => {
        return b.bwStats.star - a.bwStats.star;
    })
    if (users.length > 1) {
        api.send("resize", {height : 100 + (users.length * 35)})
    }
    
    console.log(users)
    for (const user of users) {
        const row = document.createElement('tr');
        const FKDR = (user.bwStats.finalKills/user.bwStats.finalDeaths).toFixed(2) || 0;
        const BBLR = (user.bwStats.bedsBroken/user.bwStats.bedsLost).toFixed(2) || 0;
        const WLR = (user.bwStats.wins/user.bwStats.losses).toFixed(2) || 0;
        if (user.nick === false) row.innerHTML = 
            (   
                `<td><img src="https://crafatar.com/avatars/${user.uuid}?size=16&overlay"/></td>`+
                `<td>${getBedwarsStarColour(user.bwStats.star || 0)} <span style="color: ${getNameColour(user)}">${user.name}</span>&nbsp</td>`+
                //set class based on if the ratio is less than or greather than 1

                `<td class="${FKDR >= 2 ? 'red' : ''}">${FKDR === 'NaN' ? '?' : FKDR}&nbsp</td>`+

                //`<td>${user.bwStats.bedsBroken}</td>`+
                `<td>${BBLR === 'NaN' ? '?' : BBLR}&nbsp</td>`+
                `<td>${WLR === 'NaN' ? '?' : WLR}&nbsp</td>`+
                `<td> - </td>`
            )
        else if (user.nick === true) row.innerHTML =
            (
                `<td><img src="https://crafatar.com/avatars/d3c47f6fae3a45c1ad7ce2c762b03ae6?size=16&overlay"/></td>`+
                `<td><span style="color: #AAAAAA">[NICK]</span> <span style="color: ${getNameColour(user)}">${user.name}</span>&nbsp</td>`+
                `<td> - &nbsp</td>`+
                `<td> - &nbsp</td>`+
                `<td> - &nbsp</td>`+
                `<td>NICK</td>`
            )
                
        table.appendChild(row);
    }
}

const getBedwarsStarColour = (star) => {
    
    if (star < 100) return `<span style="color: #AAAAAA;">[${star}✫]</span>`;
    else if (star < 200) return `<span style="color: #FFFFFF">[${star}✫]</span>`;
    else if (star < 300) return `<span style="color: #FFAA00">[${star}✫]</span>`;
    else if (star < 400) return `<span style="color: #55FFFF">[${star}✫]</span>`;
    else if (star < 500) return `<span style="color: #00AA00">[${star}✫]</span>`;
    else if (star < 600) return `<span style="color: #00AAAA">[${star}✫]</span>`;
    else if (star < 700) return `<span style="color: #AA0000">[${star}✫]</span>`;
    else if (star < 800) return `<span style="color: #FF55FF">[${star}✫]</span>`;
    else if (star < 900) return `<span style="color: #5555FF">[${star}✫]</span>`;
    else if (star < 1000) return `<span style="color: #AA00AA">[${star}✫]</span>`;
    else if (star < 1100) return `<span style="color: #FF5555">[<span style="color: #FFAA00">1</span><span style="color: #FFFF55">${Math.floor((star%1000)/100)}</span><span style="color: #55FF55">${Math.floor((star%100)/10)}</span><span style="color: #55FFFF">${star%10}</span><span style="color: #FF55FF">✫</span><span style="color: #AA00AA">]</span>`;
    else if (star < 1200) return `<span style="color: #AAAAAA">[</span><span style="color: #FFFFFF">1${star%1000}</span><span style="color: #AAAAAA">✪</span><span style="color: #AAAAAA">]</span>`;
    else if (star < 1300) return `<span style="color: #AAAAAA">[</span><span style="color: #FFFF55">1${star%1000}</span><span style="color: #FFAA00">✪</span><span style="color: #AAAAAA">]</span>`;
    else if (star < 1400) return `<span style="color: #AAAAAA">[</span><span style="color: #55FFFF">1${star%1000}</span><span style="color: #00AAAA">✪</span><span style="color: #AAAAAA">]</span>`;
    else if (star < 1500) return `<span style="color: #AAAAAA">[</span><span style="color: #55FF55">1${star%1000}</span><span style="color: #00AA00">✪</span><span style="color: #AAAAAA">]</span>`;
    else if (star < 1600) return `<span style="color: #AAAAAA">[</span><span style="color: #00AAAA">1${star%1000}</span><span style="color: #5555FF">✪</span><span style="color: #AAAAAA">]</span>`;
    else if (star < 1700) return `<span style="color: #AAAAAA">[</span><span style="color: #FF5555">1${star%1000}</span><span style="color: #AA0000">✪</span><span style="color: #AAAAAA">]</span>`;
    else if (star < 1800) return `<span style="color: #AAAAAA">[</span><span style="color: #FF55FF">1${star%1000}</span><span style="color: #AA00AA">✪</span><span style="color: #AAAAAA">]</span>`;
    else if (star < 1900) return `<span style="color: #AAAAAA">[</span><span style="color: #5555FF">1${star%1000}</span><span style="color: #0000AA">✪</span><span style="color: #AAAAAA">]</span>`;
    else if (star < 2000) return `<span style="color: #AAAAAA">[</span><span style="color: #AA00AA">1${star%1000}</span><span style="color: #555555">✪</span><span style="color: #AAAAAA">]</span>`;
    else if (star < 2100) return `<span style="color: #555555">[</span><span style="color: #AAAAAA">2</span><span style="color: #FFFFFF">0${Math.floor((star%100)/10)}</span><span style="color: #AAAAAA">${star%10}✪</span><span style="color: #555555">]</span>`
    else if (star < 2200) return `<span style="color: #FFFFFF">[2</span><span style="color: #FFFF55">1${Math.floor((star-2100)/10)}</span><span style="color: #FFAA00">${star%10}⚝]</span>`;
    else if (star < 2300) return `<span style="color: #FFAA00">[2</span><span style="color: #FFFFFF">2${Math.floor((star-2200)/10)}</span><span style="color: #55FFFF">${star%10}</span><span style="color: #00AAAA">⚝]</span>`;
    else if (star < 2400) return `<span style="color: #AA00AA">[2</span><span style="color: #FF55FF">3${Math.floor((star-2300)/10)}</span><span style="color: #FFAA00">${star%10}</span><span style="color: #FFFF55">⚝]</span>`;
    else if (star < 2500) return `<span style="color: #55FFFF">[2</span><span style="color: #FFFFFF">4${Math.floor((star-2400)/10)}</span><span style="color: #AAAAAA">${star%10}⚝</span><span style="color: #555555">]</span>`;
    else if (star < 2600) return `<span style="color: #FFFFFF">[2</span><span style="color: #55FF55">5${Math.floor((star-2500)/10)}</span><span style="color: #00AA00">${star%10}⚝]</span>`;
    else if (star < 2700) return `<span style="color: #AA0000">[2</span><span style="color: #FF5555">6${Math.floor((star-2600)/10)}</span><span style="color: #FF55FF">${star%10}⚝</span><span style="color: #AA00AA">]</span>`;
    else if (star < 2800) return `<span style="color: #FFFF55">[2</span><span style="color: #FFFFFF">7${Math.floor((star-2700)/10)}</span><span style="color: #555555">${star%10}⚝]</span>`;
    else if (star < 2900) return `<span style="color: #55FF55">[2</span><span style="color: #00AA00">8${Math.floor((star-2800)/10)}</span><span style="color: #FFAA00">${star%10}⚝</span><span style="color: #FF5555">]</span>`;
    else if (star < 3000) return `<span style="color: #55FFFF">[2</span><span style="color: #00AAAA">9${Math.floor((star-2900)/10)}</span><span style="color: #5555FF">${star%10}⚝</span><span style="color: #0000AA">]</span>`;
    else return `<span style="color: #FFFF55">[3</span><span style="color: #FFAA00">${Math.floor((star-3000)/10)}</span><span style="color: #FF5555">${star%10}⚝</span><span style="color: #AA0000">]</span>`;   
}

const getNameColour = (user) => {
    if (user.nick) return '#AAAAAA'
    const rank = user.paidRank;
    if (user.rank !== "NULL") {
        switch (rank) {
            case 'YOUTUEBR':
                return '#FF5555';
            case 'ADMIN':
                return '#FF5555';
        }
    }
    switch (rank) {
        case 'MVP_PLUS':
            return '#55FFFF';
        case 'MVP':
            return '#55FFFF';
        case 'VIP_PLUS':
            return '#55FF55';
        case 'VIP':
            return '#55FF55';
        case 'MVP_PLUS_PLUS':
            return '#FFAA00';
        case 'NON':
            return '#AAAAAA';
    }
}

const handleResourcePack = (name) => {
    document.getElementById('packDiv').style.display = 'block';
    document.getElementById('packName').innerHTML = name
}

const handleOpacity = (opacity) => {
    const body = document.querySelector('body');
    body.style.backgroundColor = `rgba(73, 73, 73, ${opacity/100})`;
}
const checkForConfig = () => {
    api.getConfig().then((config) => {
        if (config.api_key === "" || config.api_key === undefined || config.api_key === null) {
            document.querySelector('#apikey').style.display = 'block';  
        }
    })
}

const handleAPIKey = (key) => {
    api.send('config', {api_key: key})
    document.querySelector('#apikey').style.display = 'none';
}