const http = require('http');
const https = require('https');

const PORT = process.env.PORT || 10000;
const BETPAWA_HOST = 'www.betpawa.co.zm';

// TIER 1 DATABASE
const ACTIVATORS = ['ARS', 'SUN', 'CHE', 'NOT', 'WOL', 'MUN', 'LIV', 'BRE', 'MCI', 'BOU', 'NEW', 'TOT', 'WHU', 'AST', 'FCB', 'DOR', 'LEV', 'RBL', 'STU', 'INT', 'NAP', 'JUV', 'MIL', 'ROM', 'RMA', 'BAR', 'ATM', 'GIR', 'PSG', 'MAR', 'LYO', 'SPO', 'BEN', 'POR', 'PSV', 'AJA', 'FEY'];
const CONCEDERS = ['EVE', 'BUR', 'STP', 'HEI', 'GEN', 'VER', 'CEL', 'ESP', 'MET', 'ANG', 'AVS', 'NAC', 'PEC', 'VOL'];

let hotTeams = new Set();
const agents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1'
];

async function fetchSafe(path, retries = 3) {
    const jitter = Math.floor(Math.random() * 1200) + 1000; 
    await new Promise(r => setTimeout(r, jitter));
    return new Promise((resolve) => {
        const options = {
            hostname: BETPAWA_HOST,
            path: path,
            timeout: 8000,
            headers: { 
                'X-Pawa-Brand': 'betpawa-zambia', 
                'User-Agent': agents[Math.floor(Math.random() * agents.length)],
                'Accept': 'application/json'
            }
        };
        const req = https.get(options, (res) => {
            let data = '';
            res.on('data', c => data += c);
            res.on('end', () => { try { resolve(JSON.parse(data)); } catch(e) { resolve(null); } });
        });
        req.on('error', async () => {
            if (retries > 0) {
                await new Promise(r => setTimeout(r, 2000));
                resolve(await fetchSafe(path, retries - 1));
            } else { resolve(null); }
        });
        req.on('timeout', () => { req.destroy(); resolve(null); });
    });
}

const server = http.createServer(async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    if (req.url === '/') {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(`
            <!DOCTYPE html>
            <html>
            <head>
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    :root { --gold: #ffd700; --green: #00c851; --bg: #050510; --card: #0f0f1f; --hot: #ff4500; }
                    body { background: var(--bg); color: #e8e8f0; font-family: sans-serif; margin: 0; padding: 10px; }
                    .header { background: #1a1a3a; border-radius: 12px; padding: 15px; margin-bottom: 15px; border: 1px solid var(--gold); display: flex; justify-content: space-between; align-items: center; }
                    .heartbeat { font-size: 10px; color: var(--green); display: flex; align-items: center; font-weight: bold; }
                    .pulse { width: 8px; height: 8px; background: var(--green); border-radius: 50%; margin-right: 6px; animation: p 1.5s infinite; }
                    @keyframes p { 0% { opacity: 1; } 50% { opacity: 0.3; } 100% { opacity: 1; } }
                    .clock { font-family: monospace; font-size: 24px; color: var(--gold); font-weight: bold; border: 1px solid #333; padding: 2px 8px; border-radius: 5px; }
                    .card { background: var(--card); border: 1px solid #2a2a3a; border-radius: 12px; margin-bottom: 15px; padding: 15px; border-left: 5px solid var(--green); position: relative; }
                    .hot-ribbon { position: absolute; top: 0; right: 0; background: var(--hot); color: white; padding: 2px 10px; font-size: 10px; font-weight: bold; }
                    .strat-tag { font-size: 10px; font-weight: bold; color: var(--green); margin-bottom: 5px; display: block; }
                    .team-row { display: flex; justify-content: space-between; align-items: center; margin: 10px 0; }
                    .team-name { font-size: 18px; font-weight: bold; color: var(--gold); }
                    .ind { font-size: 10px; background: #222; padding: 2px 6px; border-radius: 4px; color: #fff; }
                    .evidence { font-size: 11px; color: #888; background: rgba(255,255,255,0.03); padding: 8px; border-radius: 6px; margin-top: 10px; border: 1px dashed #444; }
                    .target { margin-top: 12px; padding: 12px; background: var(--green); color: black; font-weight: 900; border-radius: 8px; text-align: center; }
                </style>
            </head>
            <body>
                <div class="header">
                    <div>
                        <div style="font-weight: 900; color: var(--gold); font-size: 18px;">⚡ TIER 1 MASTER</div>
                        <div class="heartbeat"><div class="pulse"></div> ACTIVE & SECURE</div>
                    </div>
                    <div class="clock" id="timer">00:00</div>
                </div>
                <div id="display"></div>
                <audio id="alert" src="https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3"></audio>
                <script>
                    let kTime = 0;
                    async function sync() {
                        try {
                            const r = await fetch('/api/get-data');
                            const d = await r.json();
                            if(d.kickoff) kTime = d.kickoff;
                            if(d.matches && d.matches.length > 0) {
                                document.getElementById('alert').play().catch(()=>{});
                                let h = '';
                                d.matches.forEach(m => {
                                    h += '<div class="card">' +
                                        (m.isHot ? '<div class="hot-ribbon">🔥 HOT STREAK</div>' : '') +
                                        '<span class="strat-tag">' + m.strategy + '</span>' +
                                        '<div class="team-row"><span class="team-name">' + m.home + '</span><span class="ind">' + m.homeInd + '</span></div>' +
                                        '<div class="team-row"><span class="team-name">' + m.away + '</span><span class="ind">' + m.awayInd + '</span></div>' +
                                        '<div class="evidence">📝 ' + m.evidence + '</div>' +
                                        '<div class="target">🎯 BTTS & OVER 2.5</div>' +
                                    '</div>';
                                });
                                document.getElementById('display').innerHTML = h;
                            } else {
                                document.getElementById('display').innerHTML = '<p style="text-align:center; color:#555; margin-top:50px;">SCANNING FOR SIGNALS...</p>';
                            }
                        } catch(e) {}
                    }
                    setInterval(() => {
                        if(!kTime) return;
                        const diff = kTime - Date.now();
                        if(diff <= 0) { document.getElementById('timer').innerText = "LIVE"; return; }
                        const m = Math.floor(diff/60000); const s = Math.floor((diff%60000)/1000);
                        document.getElementById('timer').innerText = (m<10?"0":"")+m+":"+(s<10?"0":"")+s;
                    }, 1000);
                    sync(); setInterval(sync, 30000);
                </script>
            </body>
            </html>
        `);
    } else if (req.url === '/api/get-data') {
        try {
            const seasons = await fetchSafe('/api/sportsbook/virtual/v1/seasons/list/actual');
            const current = seasons.items[0];
            const round = current.rounds.find(r => new Date(r.tradingTime.start) > new Date());
            const history = await fetchSafe('/api/sportsbook/virtual/v2/events/list/by-season/' + current.id + '?page=past');
            
            if(history && history.items) {
                history.items.slice(0, 15).forEach(m => {
                    if((m.homeScore + m.awayScore) >= 3) { hotTeams.add(m.homeTeamCode); hotTeams.add(m.awayTeamCode); }
                    else { hotTeams.delete(m.homeTeamCode); hotTeams.delete(m.awayTeamCode); }
                });
            }

            const events = await fetchSafe('/api/sportsbook/virtual/v2/events/list/by-round/' + round.id + '?page=upcoming');
            const results = [];
            (events.items || []).forEach(m => {
                const hC = m.homeTeamCode; const aC = m.awayTeamCode;
                const odds = m.mainOutcomeOdds || [0,0,0];
                const hH = (history.items || []).filter(i => i.homeTeamCode === hC || i.awayTeamCode === hC).slice(0, 3);
                const aH = (history.items || []).filter(i => i.homeTeamCode === aC || i.awayTeamCode === aC).slice(0, 3);
                const hS = hH.filter(i => (i.homeTeamCode === hC ? i.homeScore : i.awayScore) > 0).length;
                const aS = aH.filter(i => (i.homeTeamCode === aC ? i.homeScore : i.awayScore) > 0).length;

                let s = ""; let hI = ""; let aI = ""; let ev = "";
                if (ACTIVATORS.includes(hC) && ACTIVATORS.includes(aC) && hS >= 2 && aS >= 2) {
                    s = "NAIRALAND RATING"; hI = "Giant"; aI = "Giant"; ev = "Dual-Activator scoring form.";
                } else if (ACTIVATORS.includes(hC) && CONCEDERS.includes(aC)) {
                    s = "MISMATCH"; hI = "Activator"; aI = "Conceder"; ev = "Top Scorer vs Bottom Defense.";
                } else if (odds[0] >= 1.60 && odds[0] <= 1.85 && odds[1] >= 3.4) {
                    s = "ODDS PATTERN"; hI = "Favorite"; aI = "Dog"; ev = "1.60-1.85 bracket identified.";
                }

                if (s) results.push({ home: m.homeTeamName, away: m.awayTeamName, strategy: s, homeInd: hI, awayInd: aI, evidence: ev, isHot: (hotTeams.has(hC) || hotTeams.has(aC)) });
            });
            res.writeHead(200, {'Content-Type': 'application/json'});
            res.end(JSON.stringify({ matches: results, kickoff: new Date(round.tradingTime.start).getTime() }));
        } catch(e) { res.end(JSON.stringify({error: true})); }
    }
});
server.listen(PORT, '0.0.0.0');