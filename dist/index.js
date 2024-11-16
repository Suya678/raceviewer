const API = {
    BASE_URL: "https://www.randyconnolly.com/funwebdev/3rd/api/f1",
    QUERY: {
        RACES: "/races.php?season=",
        QUALIFYING: "/qualifying.php?race=",
        RACE_INFO: "/races.php?id=",
        RACE_RESULTS: "/results.php?race=",
        CIRCUIT_INFO: "/circuits.php?id=",
        DRIVER_INFO: "/drivers.php?id="
    },
};


const ASCENDING_ORDER = "asc";

const DESCENDING_ORDER = "dsc";

const CSS_CLASSES = {
    TABLE_CELL: "px-2 py-2 text-center",
    TABLE_CELL_POPUP: "px-2 py-2 text-center underline cursor-pointer hover:text-cyan-300",
    CIRCUIT_POPUP: "underline cursor-pointer hover:text-cyan-300",
    ROW_HOVER: "hover:bg-slate-600",
    RESULTS_BUTTON:
        "rounded bg-slate-600 px-4 py-2 text-slate-50 outline-none hover:bg-slate-500",
    URL: "text-slate-400 hover:text-blue-300 underline text-base",
    ADD_TO_FAV_BUTTON: "rounded bg-slate-700 px-4 py-2 text-sm hover:bg-slate-600",
    POPUP_HEADING: "titillium-web-semibold-italic text-2xl",
    SORTABLE_ROUND_HEADER: "px-2 py-2 text-center text-xs md:text-2xl sortable round",
    SORTABLE_NAME_HEADER: "px-2 py-2 text-center text-xs md:text-2xl sortable name",
    EMPTY_HEADER: "px-2 py-2"
};



class Utility {

    /**
     * Sorts an array of objects based on a numeric property value.
     * Creates a deep copy of the original array before sorting to prevent mutation.
     * The deep copy is then sorted and returned.
     *
     * @param {Array<Object>} sortObject - The array of objects to sort
     * @param {string} sortValue - The name of the numeric property to sort by
     * @param {string} sortOrder - The sort direction ("asc" for ascending, descending if anything else)
     *
     * @returns {Array<Object>} A sorted array of objects
     */
    static sortAnArrayOfObjectsByNumber(sortObject, sortValue, sortOrder){
        const sortedArray = structuredClone(sortObject); //creates a deep copy

        if(sortOrder === ASCENDING_ORDER) {
            return sortedArray.sort((a,b) => a[sortValue] - b[sortValue]);
        }else{
            return sortedArray.sort((a,b) => b[sortValue] - a[sortValue]);
        }
    }


    /**
     * Sorts an array of objects based on a string property value.
     * Creates a deep copy of the original array before sorting to prevent mutation.
     * The deep copy is then sorted and returned.
     *
     * @param {Array<Object>} sortObject - The array of objects to sort
     * @param {string} sortValue - The name of the numeric property to sort by
     * @param {string} sortOrder - The sort direction ("asc" for ascending, descending if anything else)
     *
     * @returns {Array<Object>} A sorted array of objects
     */
    static sortAnArrayOfObjectsByString(sortObject, sortValue, sortOrder){
        const sortedArray = structuredClone(sortObject); //creates a deep copy

        if(sortOrder === ASCENDING_ORDER) {
            return sortedArray.sort((a,b) => a[sortValue].toUpperCase().localeCompare(b[sortValue].toUpperCase()) );
        }else{
            return sortedArray.sort((a,b) => b[sortValue].toUpperCase().localeCompare(a[sortValue].toUpperCase()) );
        }
    }


    /**
     * Updates the sort direction indicators in a table's headers by removing any existing
     * arrow indicators and adding the appropriate direction arrow to the currently sorted column.
     * Reference: Had to ask chat Gp2 how to use the regex to do the search and replace,
     * the prompt: how to use a regex to select and arrow and remove it in js
     *
     * @param {string} sortValue - The class name of the column being sorted
     * @param {string} sortOrder - The sort direction (either ASCENDING_ORDER or DESCENDING_ORDER)
     * @param {string} tableID - The CSS selector for the target table(its id)
     *
     * @returns {void}
     */
     static updateTableSortIndicators(sortValue, sortOrder, tableID){
        const tableHeaders = document.querySelectorAll(`${tableID} th`);

        tableHeaders.forEach(header => {
            header.textContent = header.textContent.replace(/([↑↓])/, "");
        });

        const sortHeading = document.querySelector(`${tableID} th.${sortValue}`);

        if(sortOrder === ASCENDING_ORDER) {
            sortHeading.textContent += "↑";
        } else {
            sortHeading.textContent += "↓";

        }

    }

    /**
     * Fetches data from API or from the localStorage cache.
     * If the data is not in the local cache,
     * it fetches it and then stores it in the cache.
     * This function should be called in the try catch setup.
     *
     * @param {string} url - API URL with query
     * @returns {Promise<any>} Parsed JSON response
     * @throws {Error} If fetch fails or JSON parsing fails
     */
    static async fetchWithCache(url) {
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

    /**
     * Creates an HTML element with specified properties.
     *
     * @param {string} elemName - The HTML tag name of the element to create
     * @param {string|null} className - CSS class name(s) to apply to the element. Pass null if not needed
     * @param {string|null} textContent - Text content to set for the element. Pass null if not needed
     * @param {...Object} attributes - Variable number of key value pair objects. Each object should contain a single key-value pair
     *                                representing an attribute name and its value (e.g., {"id": 'myId'}, {"value" : "someNumber"})
     *
     * @returns {HTMLTableElement} - The created HTML element with the specified properties
     */
     static createElement(elemName, className, textContent, ...attributes) {
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


}







function displayDriverPopup(driverData){

    const driverPopupInfoSection = document.querySelector("#driver-popup section");
    driverPopupInfoSection.innerHTML = "";


    driverPopupInfoSection.appendChild(Utility.createElement("h2",
        CSS_CLASSES.POPUP_HEADING,driverData.forename + " " + driverData.surname));


    driverPopupInfoSection.appendChild(Utility.createElement("p",
        null, "Date Of Birth: " + driverData.dob));

    driverPopupInfoSection.appendChild(Utility.createElement("p",
        null, driverData.nationality));

    const link = Utility.createElement(
        "a",
        CSS_CLASSES.URL,
        "Url: " + driverData.url,
        { href: driverData.url },
        { target: "_blank" },
    );
    driverPopupInfoSection.appendChild(link);

    driverPopupInfoSection.appendChild(Utility.createElement("button",
        CSS_CLASSES.ADD_TO_FAV_BUTTON,"Add Favorites"));
    document.querySelector("#driver-popup").showModal();


}




async function handleDriverPopup(event){


    try {
        const driverAPIQuery = API.BASE_URL + API.QUERY.DRIVER_INFO + event.target.dataset.driverId;
        const driverData = await Utility.fetchWithCache(driverAPIQuery);
        displayDriverPopup(driverData);
    } catch (error) {
        console.error("Error loading season data:", error);
    }


}






//Need to document
function displayCircuitPopup(circuitData) {

    const circuitPopup = document.querySelector("#circuit-popup section");
    circuitPopup.innerHTML = "";
    circuitPopup.appendChild(Utility.createElement("h2",
        CSS_CLASSES.POPUP_HEADING,"Circuit Details"));

    circuitPopup.appendChild(Utility.createElement("p",
        null,circuitData.name));

    circuitPopup.appendChild(Utility.createElement("p",
        null, circuitData.location + ", " + circuitData.country));

    const link = Utility.createElement(
        "a",
        CSS_CLASSES.URL,
        "Url: " + circuitData.url,
        { href: circuitData.url },
        { target: "_blank" },
    );
    circuitPopup.appendChild(link);

    circuitPopup.appendChild(Utility.createElement("button",
        CSS_CLASSES.ADD_TO_FAV_BUTTON,"Add Favorites"));

    document.querySelector("#circuit-popup").showModal();

}
async function handleCircuitPopup(event) {

    try {
        const circuitAPIQuery = API.BASE_URL + API.QUERY.CIRCUIT_INFO + event.target.dataset.circuitId;
        const circuitData = await Utility.fetchWithCache(circuitAPIQuery);
        displayCircuitPopup(circuitData);
    } catch (error) {
        console.error("Error loading season data:", error);
    }
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
        const row = Utility.createElement("tr", CSS_CLASSES.ROW_HOVER, null);

        row.appendChild(Utility.createElement("td", CSS_CLASSES.TABLE_CELL, data.position));

        const driver =  Utility.createElement(
            "td",
            CSS_CLASSES.TABLE_CELL_POPUP,
            data.driver.forename + " " + data.driver.surname,
            {"data-driver-id": data.driver.id}
        );

        driver.addEventListener("click", handleDriverPopup);

        row.appendChild( driver);


        row.appendChild(
            Utility.createElement("td", CSS_CLASSES.TABLE_CELL_POPUP, data.constructor.name),
        );

        row.appendChild(Utility.createElement("td", CSS_CLASSES.TABLE_CELL, data.laps));

        row.appendChild(Utility.createElement("td", CSS_CLASSES.TABLE_CELL, data.points));

        tableBody.appendChild(row);
    });

    displayPodiumFinishers(raceResults);
}


//Need to document and maybe refactor
function displayQualifyingResults(qualifyingData) {
    const tableBody = document.querySelector("#qualifying-results-table tbody");
    tableBody.innerHTML = "";

    qualifyingData.forEach((data) => {
        const row = Utility.createElement("tr", CSS_CLASSES.ROW_HOVER, null);

        row.appendChild(Utility.createElement("td", CSS_CLASSES.TABLE_CELL, data.position));

        const driver =  Utility.createElement(
            "td",
            CSS_CLASSES.TABLE_CELL_POPUP,
            data.driver.forename + " " + data.driver.surname,
            {"data-driver-id": data.driver.id}
        );

        driver.addEventListener("click", handleDriverPopup);

        row.appendChild( driver);


        row.appendChild(
            Utility.createElement("td", CSS_CLASSES.TABLE_CELL_POPUP, data.constructor.name),
        );

        row.appendChild(Utility.createElement("td", CSS_CLASSES.TABLE_CELL, data.q1));

        row.appendChild(Utility.createElement("td", CSS_CLASSES.TABLE_CELL, data.q2));

        row.appendChild(Utility.createElement("td", CSS_CLASSES.TABLE_CELL, data.q3));

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

    const circuit = Utility.createElement("p", CSS_CLASSES.CIRCUIT_POPUP, "Circuit: " + raceInfo.circuit.name, {"data-circuit-id": raceInfo.circuit.id});
    circuit.addEventListener("click", handleCircuitPopup);
    article.appendChild(circuit);

    article.appendChild(Utility.createElement("p", null, "Round " + roundNumber));
    article.appendChild(Utility.createElement("p", null, "Date " + raceInfo.date));

    const link = Utility.createElement(
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
            Utility.fetchWithCache(raceInfoAPIQuery),
            Utility.fetchWithCache(raceQualifyingAPIQuery),
            Utility.fetchWithCache(raceResultsAPIQuery),
        ]);

        displayRaceInfo(raceInfo[0], event.target.dataset.roundNumber); // This api endpoint results an array with only one object
        displayQualifyingResults(raceQualifyingResults);
        displayRaceResults(raceResults);

        document.querySelector("#results-details-view").classList.remove("hidden");
    } catch (error) {
        console.log("Error loading race data:", error);
    }
}




class RaceDetailsController {

}


class RaceInfoController {

}


class RaceResultsController {}
class RaceQualifyingController {}


class SeasonSelectController {
    // ID attribute of the season data table element
    static #SeasonDataTableID = '#season-data-table';

    // Holds the fetched season Data
    static #seasonData = {};

    // Contains the current sorting order of the season data table
    static #tableSortInfo = {
        sortOrder: ASCENDING_ORDER,
        sortKey: "round",
    };


    /**
     * Returns the season data sorted based on the sort key and order.
     *
     * @returns {Array} - Season data sorted.
     */
    static #getSortedSeasonData() {
        const {sortOrder, sortKey} = SeasonSelectController.#tableSortInfo;
        return sortKey === "name" ? Utility.sortAnArrayOfObjectsByString(SeasonSelectController.#seasonData, sortKey, sortOrder)
            : Utility.sortAnArrayOfObjectsByNumber(SeasonSelectController.#seasonData, sortKey, sortOrder);
    }


    /**
     * Updates the displayed season year heading above the table
     *
     * @param {string} year - The year to display.
     * @returns {void}
     */
    static #updateSeasonYear(year) {
        document.querySelector("#race-details-view h2").textContent =
            `${year} Races`;
    }


    /**
     * Displays the season data in the season data table.
     * Clears existing table content, populates with sorted race data,
     * updates the season year heading, sort order, and toggles table visibility.
     *
     * @returns {void}
     */
    static #displaySeasonData() {
        const tableBody = document.querySelector(SeasonSelectController.#SeasonDataTableID + " tbody");
        tableBody.innerHTML = "";

        const sortedData = SeasonSelectController.#getSortedSeasonData();
        sortedData.forEach((race) => {
            tableBody.appendChild(SeasonSelectController.#createRow(race));
        });

        SeasonSelectController.#updateSeasonYear(sortedData[0].year);

        Utility.updateTableSortIndicators(SeasonSelectController.#tableSortInfo.sortKey,
            SeasonSelectController.#tableSortInfo.sortOrder, SeasonSelectController.#SeasonDataTableID);

        document.querySelector("#season-select").classList.add("hidden");
        document.querySelector("#race-details-view").classList.remove("hidden");
    }


    /**
     * Creates a table row element for a race.
     * Adds a event listener to the results button linked to the Race Selection class.
     *
     * @param {Object} race - The race data object
     * @returns {HTMLTableRowElement} The created row element containing race data and results button
     */
    static #createRow(race) {
        const row = Utility.createElement("tr", CSS_CLASSES.ROW_HOVER, null);

        row.appendChild(Utility.createElement("td", CSS_CLASSES.TABLE_CELL, race.round));
        row.appendChild(Utility.createElement("td", CSS_CLASSES.TABLE_CELL, race.name));

        // Create and append the button with race id for future fetch uses
        const buttonContainer = Utility.createElement("td", CSS_CLASSES.TABLE_CELL, null);
        const button = Utility.createElement("button", CSS_CLASSES.RESULTS_BUTTON, "Results",
            {"data-race-id": race.id},
            {"data-round-number": race.round},
        );
        button.addEventListener("click", handleRaceSelection);
        buttonContainer.appendChild(button);
        row.appendChild(buttonContainer);

        return row;
    }


    /**
     * Handles season selection change event, fetches and displays season data.
     *
     * @param {Event} event - Change event triggered when user selects a season
     * @returns {Promise<void>}
     */
    static async handleSeasonSelection(event) {
        try {
            const seasonAPIQuery = API.BASE_URL + API.QUERY.RACES + event.target.value;
            SeasonSelectController.#seasonData = await Utility.fetchWithCache(seasonAPIQuery);
            SeasonSelectController.#displaySeasonData();
            SeasonSelectController.#installTableSortingEventListener();
        } catch (error) {
            console.error("Error loading season data:", error);
        }
    }


    /**
     * Attaches the table header click handler to each header element
     * that has a sortable class.
     *
     * @returns {void}
     */
    static #installTableSortingEventListener() {
        const thList = document.querySelectorAll(SeasonSelectController.#SeasonDataTableID + " th");
        thList.forEach((th) => {
            if (th.classList.contains("sortable")) {
                th.addEventListener("click", SeasonSelectController.#handleTableHeaderClick);
            }
        });
    }


    /**
     * Handles click events on table headers.
     * Updates sort order and key based on which header was clicked,
     * Refreshes the table display in the new sort configuration.
     *
     * @param {Event} event - The click event object
     * @returns {void}
     */
    static #handleTableHeaderClick(event) {
        if(event.target.classList.contains("round")) {
            if(SeasonSelectController.#tableSortInfo.sortKey === "round" && SeasonSelectController.#tableSortInfo.sortOrder === ASCENDING_ORDER ) {
                SeasonSelectController.#tableSortInfo.sortOrder = DESCENDING_ORDER;
            } else {
                SeasonSelectController.#tableSortInfo.sortOrder = ASCENDING_ORDER;
                SeasonSelectController.#tableSortInfo.sortKey = "round";
            }
        } else{
            if(SeasonSelectController.#tableSortInfo.sortKey === "name" && SeasonSelectController.#tableSortInfo.sortOrder === ASCENDING_ORDER ) {
                SeasonSelectController.#tableSortInfo.sortOrder = DESCENDING_ORDER;
            } else {
                SeasonSelectController.#tableSortInfo.sortOrder = ASCENDING_ORDER;
                SeasonSelectController.#tableSortInfo.sortKey = "name";
            }
        }

        SeasonSelectController.#displaySeasonData();
        SeasonSelectController.#installTableSortingEventListener();

    }
    /**
     * Creates the table header row with sortable columns.
     *
     * @returns {HTMLTableRowElement} The created header row containing round, name, and an empty column
     */
    static #createTableHeader() {
        const row = Utility.createElement("tr", null, null);
        const roundHeader = Utility.createElement("th", CSS_CLASSES.SORTABLE_ROUND_HEADER, "Round");
        const nameHeader = Utility.createElement("th", CSS_CLASSES.SORTABLE_NAME_HEADER, "Name");
        const emptyHeader = Utility.createElement("th", CSS_CLASSES.EMPTY_HEADER, null);

        row.appendChild(roundHeader);
        row.appendChild(nameHeader);
        row.appendChild(emptyHeader);
        return row;
    }
}




document.addEventListener("DOMContentLoaded", () => {
    document
        .querySelector("#season-select")
        .addEventListener("change", SeasonSelectController.handleSeasonSelection);


    document
        .querySelector("#close-driver-popup")
        .addEventListener("click",() => {
            document.querySelector("#driver-popup").close();

        });

    document
        .querySelector("#close-circuit-popup")
        .addEventListener("click",() => {
            document.querySelector("#circuit-popup").close();
        });

    document
        .querySelector("#close_constructor_popup")
        .addEventListener("click",() => {
            document.querySelector("#constructor-popup").close();

        });

  //document
    //   .querySelector("#driver-popup")
      // .showModal();
});
