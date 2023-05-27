async function getIPLLiveMatches(){
    return await fetch("https://api.cricapi.com/v1/currentMatches?apikey=ca825d13-889c-4783-9fcb-e6e8281289d4&offset=0")
        .then(data => data.json())
        .then(data => {
            if(data.status != "success") return {
                code: 4,
                data: []
            };

            const matches = data.data;
            const iplMatches = matches.filter(match => match.series_id == "c75f8952-74d4-416f-b7b4-7da4b4e3ae6e");

            if(iplMatches.length === 0){
                return {
                    code: 0,
                    data: []
                }
            }

            return {
                code: 2,
                data: iplMatches[0]
            }
        })
}

async function updateIPLData(){
    const response = await getIPLLiveMatches();

    const container = document.getElementById("container");

    if(response.code === 4){
        container.innerText = "Failed to load data :(";
    }else if(response.code === 0){
        container.innerText = "No IPL matches currently.";
    }else{
        const liveData = response.data;

        const teamInfo = liveData.teamInfo;
        const team1 = teamInfo ? teamInfo[0] : null;
        const team2 = teamInfo && teamInfo.length >= 2 ? teamInfo[1] : null;
        const team1ImgSrc = team1.img;
        const team2ImgSrc = team2.img;

        if(team1 && team2){
            const teamA = document.getElementById("teamA");
            const teamB = document.getElementById("teamB");
            teamA.innerText = team1.shortname;
            teamB.innerText = team2.shortname;

            const imgA = document.createElement("img");
            imgA.src = team1ImgSrc;
            imgA.classList.add("logo");

            const imgB = document.createElement("img");
            imgB.src = team2ImgSrc;
            imgB.classList.add("logo");

            teamA.parentNode.insertBefore(imgA, teamA);
            teamB.parentNode.insertBefore(imgB, teamB.nextSibling);
        }

        const matchStarted = liveData.matchStarted;
        const matchEnded = liveData.matchEnded;

        const statusContainerElement = document.getElementById("statusContainer");
        const statusElement = document.getElementById("status");

        statusElement.innerText = liveData.status;

        if(matchStarted && !matchEnded){
            const statusDetails = document.createElement("p");
            statusDetails.classList.add("live")
            statusDetails.innerText = "LIVE";
            statusContainerElement.parentNode.insertBefore(statusDetails, statusContainerElement);
        }

        const score = liveData.score;

        const scoreA = score ? score[0] : null;
        const scoreB = score && score.length >1 ? score[1] : null;

        const scoreContainer = document.getElementById("scoreContainer");
        if(scoreA){
            const scoreAElement = document.createElement("div");
            scoreAElement.classList.add("score");
            const team = getTeamFromInning(scoreA.inning);
            
            const total = scoreA.r;
            const wickets = scoreA.w;
            const overs = scoreA.o;

            scoreAElement.innerHTML = `<div>${team}</div><div>${total}/${wickets} (${overs})</div>`;
            scoreContainer.appendChild(scoreAElement);
        }
        if(scoreB){
            const scoreBElement = document.createElement("div");
            scoreBElement.classList.add("score");
            const team = getTeamFromInning(scoreB.inning);
            
            const total = scoreB.r;
            const wickets = scoreB.w;
            const overs = scoreB.o;

            scoreBElement.innerHTML = `<div>${team}</div><div>${total}/${wickets} (${overs})</div>`;
            scoreContainer.appendChild(scoreBElement);
        }
    }
}

const getTeamFromInning = (inning) => {
    return inning.substring(0, inning.lastIndexOf(" Inning"));
}

updateIPLData();