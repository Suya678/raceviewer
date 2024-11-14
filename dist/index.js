
const API  = {
    BASE_URL: "https://www.randyconnolly.com/funwebdev/3rd/api/f1",
    QUERY: {
        RACES: "/races.php?season=",
        QUALIFYING: "/qualifying.php?race=",
        RACE_INFO: "/races.php?id="
    }
};

const CSS_CLASSES = {
    TABLE_CELL: "px-2 py-2 text-center",
    ROW_HOVER: "hover:bg-slate-700",
    RESULTS_BUTTON: "relative right-1 top-1 rounded bg-slate-600 px-4 py-2 text-slate-50 outline-none hover:bg-slate-500",
    URL: "text-slate-400 hover:text-blue-300 underline  text-base"
};






//ref:https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys
function createElement(elemName, className, textContent, ...attributes) {
    const element = document.createElement(elemName);
    if(textContent) {
        element.textContent = textContent;
    }
    if(className) {
        element.className = className;
    }
    if(attributes.length > 0) {
        attributes.forEach((attribute) => {
            const attributeName =  Object.keys(attribute)[0];
            element.setAttribute(attributeName, attribute[attributeName]);
        });
    }

    return element;

}

function displayQualifyingResults(qualifyingData) {
    const tableBody = document.querySelector("#qualifying-results-table tbody");
    tableBody.innerHTML = "";


    qualifyingData.forEach((data) => {
        console.log(data);
        const row = createElement("tr", CSS_CLASSES.ROW_HOVER, null);

        row.appendChild(createElement("td", CSS_CLASSES.TABLE_CELL,
            data.position));

        row.appendChild(createElement("td", CSS_CLASSES.TABLE_CELL,
            data.driver.forename + " " + data.driver.surname));

        row.appendChild(createElement("td", CSS_CLASSES.TABLE_CELL,
            data.constructor.name));

        row.appendChild(createElement("td", CSS_CLASSES.TABLE_CELL,
                    data.q1));

        row.appendChild(createElement("td", CSS_CLASSES.TABLE_CELL,
            data.q2));

        row.appendChild(createElement("td", CSS_CLASSES.TABLE_CELL,
                       data.q3));


        tableBody.appendChild(row);
    });


}

function displayRaceInfo(raceInfo, roundNumber) {
    const  raceHeading= document.querySelector("#results-details-view h2");
    raceHeading.textContent = "Results for the " +   raceInfo.year +  raceInfo.name;

    const article = document.querySelector("#results-details-view article");
    article.innerHTML = "";

    article.appendChild(createElement("p",null, "Circuit: "+ raceInfo.circuit.name));
    article.appendChild(createElement("p",null, "Round "+ roundNumber));
    article.appendChild(createElement("p",null, "Date "+ raceInfo.date));


    const link = createElement("a", CSS_CLASSES.URL,  "Url: " + raceInfo.url,
        {"href": raceInfo.url},
                    {"target": "_blank"});
    article.appendChild(link);
    console.log(article);


}

async function getRaceInfo(raceID) {
    const response = await fetch(API.BASE_URL + API.QUERY.RACE_INFO + raceID );

    if (!response.ok) {
        throw new Error(`HTTP Response Error, Failed to fetch race id (${raceID}) race data :`);
    }
    return (await response.json())[0];

}
async function getQualifyingResults(raceID) {
    const response = await fetch(API.BASE_URL + API.QUERY.QUALIFYING + raceID );
    if (!response.ok) {
        throw new Error(`HTTP Response Error, Failed to fetch race id (${raceID}) Qualifying data :`);
    }
    return (await response.json());

}


async function handleRaceSelection(event) {

    try{
        const raceInfo = await getRaceInfo(event.target.dataset.raceId);
        const raceQualifyingResults = await getQualifyingResults(event.target.dataset.raceId);
         displayRaceInfo(raceInfo, event.target.dataset.roundNumber);
        displayQualifyingResults(raceQualifyingResults);
        const resultsView = document.querySelector("#results-details-view");
        if (resultsView.classList.contains("hidden")) {
            resultsView.classList.remove("hidden");
        }
    } catch(error) {
        console.log('Error loading race data:', error);

    }
}


function displaySeasonData(seasonData) {
    const tableBody = document.querySelector("#season-data-table tbody");
    tableBody.innerHTML = "";

    seasonData.forEach((race, index) => {
        //create the row
       const row = createElement("tr",CSS_CLASSES.ROW_HOVER, null);

       //create and append the round number
       row.appendChild(createElement("td",CSS_CLASSES.TABLE_CELL, index + 1));

       //create and append the race name
       row.appendChild(createElement("td",CSS_CLASSES.TABLE_CELL, race.name));

       // Create and append the button with id for future fetch uses
       const buttonContainer = createElement("td", CSS_CLASSES.TABLE_CELL, null);
       const button = createElement("button", CSS_CLASSES.RESULTS_BUTTON, "Results",
           {"data-race-id": race.id},
           {"data-round-number": index + 1});

       buttonContainer.appendChild(button);

        button.addEventListener("click", handleRaceSelection);
        row.appendChild(buttonContainer);

        tableBody.appendChild(row);

    });


    document.querySelector("#race-details-view h2").textContent = `${seasonData[0].year} Races`;
    document.querySelector("#season-select").classList.toggle("hidden");
    document.querySelector("#race-details-view").classList.toggle("hidden");
}

async function getSeasonData(season) {
    let data = localStorage.getItem(season);
    if(data) {
        return  await JSON.parse(data);
    }
    const response = await fetch(API.BASE_URL + API.QUERY.RACES + season);
    if(!response.ok) {
        throw new Error(`HTTP Response Error, Failed to fetch race season (${season})  data :`);
    }
    data = await response.json();
    localStorage.setItem(season, JSON.stringify(data));
    return data;

}

async function handleSeasonSelection(event) {
    try {
        const seasonData = await getSeasonData(event.target.value);
        displaySeasonData(seasonData);
    } catch (error) {
        console.log('Error loading season data:', error);
    }



}




document.addEventListener('DOMContentLoaded', () => {
    document.querySelector("#season-select").addEventListener("change", handleSeasonSelection);

});