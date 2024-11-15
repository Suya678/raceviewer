const API = {
    BASE_URL: "https://www.randyconnolly.com/funwebdev/3rd/api/f1",
    QUERY: {
        RACES: "/races.php?season=",
        QUALIFYING: "/qualifying.php?race=",
        RACE_INFO: "/races.php?id=",
        RACE_RESULTS: "/results.php?race=",
    },
};

const CSS_CLASSES = {
    TABLE_CELL: "px-2 py-2 text-center",
    ROW_HOVER: "hover:bg-slate-600",
    RESULTS_BUTTON:
        "rounded bg-slate-600 px-4 py-2 text-slate-50 outline-none hover:bg-slate-500",
    URL: "text-slate-400 hover:text-blue-300 underline text-base",
};

/**
 * Fetches data from API or from  localStorage cache.
 * If the data is not in the local cache,
 * it fetches it and then stores it in the cache.
 *
 * @param {string} url - API URL with query
 * @returns {Promise<any>} Parsed JSON response
 * @throws {Error} If fetch fails or JSON parsing fails
 */
async function fetchWithCache(url) {
    let data = localStorage.getItem(url);

    if (data) {
        return JSON.parse(data);
    }

    const response = await fetch(url);
    if (!response.ok) {
        throw new Error("Error during fetch from URL:" + url);
    }

    data = await response.json();
    localStorage.setItem(url, JSON.stringify(data));
    return data;
}

//Need to document and maybe refactor
function createElement(elemName, className, textContent, ...attributes) {
    const element = document.createElement(elemName);
    if (textContent) {
        element.textContent = textContent;
    }
    if (className) {
        element.className = className;
    }
    if (attributes.length > 0) {
        attributes.forEach((attribute) => {
            const attributeName = Object.keys(attribute)[0];
            element.setAttribute(attributeName, attribute[attributeName]);
        });
    }

    return element;
}

/**
 * Updates the names of podium finishers display with the driver names for the current selected race
 *
 * @param {Array<Object>} raceResults - Array of race result objects
 * @param {Object} raceResults[].driver - Driver information object
 * @param {string} raceResults[].driver.forename - Driver's first name
 * @param {string} raceResults[].driver.surname - Driver's last name
 * @throws {Error} If there are fewer than 3 results or missing driver data
 *
 * @returns {void} - This function does not return a value.
 */
function displayPodiumFinishers(raceResults) {
    const pElements = document.querySelectorAll("#podium-finish-cards article p");

    pElements.forEach((pElement, index) => {
        pElement.textContent =
            raceResults[index].driver.forename +
            " " +
            raceResults[index].driver.surname;
    });
}
//Need to document and maybe refactor
function displayRaceResults(raceResults) {
    const tableBody = document.querySelector("#race-results-table tbody");
    tableBody.innerHTML = "";

    raceResults.forEach((data) => {
        const row = createElement("tr", CSS_CLASSES.ROW_HOVER, null);

        row.appendChild(createElement("td", CSS_CLASSES.TABLE_CELL, data.position));

        row.appendChild(
            createElement(
                "td",
                CSS_CLASSES.TABLE_CELL,
                data.driver.forename + " " + data.driver.surname,
            ),
        );

        row.appendChild(
            createElement("td", CSS_CLASSES.TABLE_CELL, data.constructor.name),
        );

        row.appendChild(createElement("td", CSS_CLASSES.TABLE_CELL, data.laps));

        row.appendChild(createElement("td", CSS_CLASSES.TABLE_CELL, data.points));

        tableBody.appendChild(row);
    });

    displayPodiumFinishers(raceResults);
}


//Need to document and maybe refactor
function displayQualifyingResults(qualifyingData) {
    const tableBody = document.querySelector("#qualifying-results-table tbody");
    tableBody.innerHTML = "";

    qualifyingData.forEach((data) => {
        const row = createElement("tr", CSS_CLASSES.ROW_HOVER, null);

        row.appendChild(createElement("td", CSS_CLASSES.TABLE_CELL, data.position));

        row.appendChild(
            createElement(
                "td",
                CSS_CLASSES.TABLE_CELL,
                data.driver.forename + " " + data.driver.surname,
            ),
        );

        row.appendChild(
            createElement("td", CSS_CLASSES.TABLE_CELL, data.constructor.name),
        );

        row.appendChild(createElement("td", CSS_CLASSES.TABLE_CELL, data.q1));

        row.appendChild(createElement("td", CSS_CLASSES.TABLE_CELL, data.q2));

        row.appendChild(createElement("td", CSS_CLASSES.TABLE_CELL, data.q3));

        tableBody.appendChild(row);
    });
}

//Need to document and maybe refactor
function displayRaceInfo(raceInfo, roundNumber) {
    const raceHeading = document.querySelector("#results-details-view h2");
    raceHeading.textContent =
        "Results for the " + raceInfo.year + " " + raceInfo.name;

    const article = document.querySelector("#race-info");
    article.innerHTML = "";

    article.appendChild(
        createElement("p", null, "Circuit: " + raceInfo.circuit.name),
    );
    article.appendChild(createElement("p", null, "Round " + roundNumber));
    article.appendChild(createElement("p", null, "Date " + raceInfo.date));

    const link = createElement(
        "a",
        CSS_CLASSES.URL,
        "Url: " + raceInfo.url,
        { href: raceInfo.url },
        { target: "_blank" },
    );
    article.appendChild(link);
}

/**
 * Handles race selection by fetching and displaying race information,
 * qualifying results, and final results from the API.
 *
 * @param {Event} event - Click event from results button in race table
 * @param {Event} event.target - the element that triggered the event
 * @param {string} event.target.dataset.raceId - The ID of the selected race.
 * @param {string} event.target.dataset.roundNumber - The round number of the selected race.
 *
 * @returns {Promise<void>}
 */
async function handleRaceSelection(event) {
    try {
        const raceId = event.target.dataset.raceId;
        const raceResultsAPIQuery = API.BASE_URL + API.QUERY.RACE_RESULTS + raceId;
        const raceInfoAPIQuery = API.BASE_URL + API.QUERY.RACE_INFO + raceId;
        const raceQualifyingAPIQuery = API.BASE_URL + API.QUERY.QUALIFYING + raceId;

        const [raceInfo, raceQualifyingResults, raceResults] = await Promise.all([
            fetchWithCache(raceInfoAPIQuery),
            fetchWithCache(raceQualifyingAPIQuery),
            fetchWithCache(raceResultsAPIQuery),
        ]);

        displayRaceInfo(raceInfo[0], event.target.dataset.roundNumber); // This api endpoint results an array with only one object
        displayQualifyingResults(raceQualifyingResults);
        displayRaceResults(raceResults);

        document.querySelector("#results-details-view").classList.remove("hidden");
    } catch (error) {
        console.log("Error loading race data:", error);
    }
}

/// FOr the left column results tabe
// //Need to document and maybe refactor
function displaySeasonData(seasonData) {
    const tableBody = document.querySelector("#season-data-table tbody");
    tableBody.innerHTML = "";

    seasonData.forEach((race) => {
        //create the row
        const row = createElement("tr", CSS_CLASSES.ROW_HOVER, null);

        //create and append the round number
        row.appendChild(createElement("td", CSS_CLASSES.TABLE_CELL, race.round));

        //create and append the race name
        row.appendChild(createElement("td", CSS_CLASSES.TABLE_CELL, race.name));

        // Create and append the button with id for future fetch uses
        const buttonContainer = createElement("td", CSS_CLASSES.TABLE_CELL, null);
        const button = createElement(
            "button",
            CSS_CLASSES.RESULTS_BUTTON,
            "Results",
            { "data-race-id": race.id },
            { "data-round-number": race.round },
        );

        buttonContainer.appendChild(button);

        button.addEventListener("click", handleRaceSelection);
        row.appendChild(buttonContainer);

        tableBody.appendChild(row);
    });

    document.querySelector("#race-details-view h2").textContent =
        `${seasonData[0].year} Races`;
    document.querySelector("#season-select").classList.toggle("hidden");
    document.querySelector("#race-details-view").classList.toggle("hidden");
}

/**
 * Handles season selection change event, fetches and displays season data.
 *
 * @param {Event} event - Change event from season select element
 * @returns {Promise<void>}
 */
async function handleSeasonSelection(event) {
    try {
        const seasonAPIQuery = API.BASE_URL + API.QUERY.RACES + event.target.value;
        const seasonData = await fetchWithCache(seasonAPIQuery);
        displaySeasonData(seasonData);
    } catch (error) {
        console.error("Error loading season data:", error);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    document
        .querySelector("#season-select")
        .addEventListener("change", handleSeasonSelection);
});
