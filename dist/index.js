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















//will be deleted
class Popups {


    static displayDriverInfo(driverData){

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

    static async  handleDriverPopup(event){

        try {
            const driverAPIQuery = API.BASE_URL + API.QUERY.DRIVER_INFO + event.target.dataset.driverId;
            console.log(driverAPIQuery);
            const driverData = await Utility.fetchWithCache(driverAPIQuery);
            console.log(driverData);

            Popups.displayDriverInfo(driverData);
        } catch (error) {
            console.error("Error loading season data:", error);
        }


    }


    static displayDriverTable(){



    }

    static displayCircuitPopup(circuitData) {

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



}






//Need to document


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
     * @param {string} sortValue - The name of the string property to sort by
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
     * Sorts an array of objects based on a driver's full name (forename + surname).
     * Creates a deep copy of the original array before sorting to prevent mutation.
     * This function is specifically for handling objects with a driver property that as forename and surname fields (e.g., circuit.driver.forname, circuit.driver.surname)
     *
     * @param {Array<Object>} sortObject - The array of objects to sort. The object must have a driver property with forname and surname fields
     * @param {string} sortOrder - The sort direction ("asc" for ascending, descending if anything else)
     *
     * @returns {Array<Object>} A sorted array of objects
     */
    static sortAnArrayOfObjectsBasedOnNestedDriverName(sortObject, sortOrder){
        const sortedArray = structuredClone(sortObject); //creates a deep copy

        if(sortOrder === ASCENDING_ORDER) {
            return sortedArray.sort((a,b) => {
                const aFullName = a.driver.forename + " " + a.driver.surname;
                const bFullName = b.driver.forename + " " + b.driver.surname;
                return aFullName.toUpperCase().localeCompare(bFullName.toUpperCase());
            });
        } else {
            return sortedArray.sort((a,b) => {
                const aFullName = a.driver.forename + " " + a.driver.surname;
                const bFullName = b.driver.forename + " " + b.driver.surname;
                return bFullName.toUpperCase().localeCompare(aFullName.toUpperCase());
            });
        }
    }

    /**
     * Sorts an array of objects based on the constructor's name
     * Creates a deep copy of the original array before sorting to prevent mutation.
     * This function is specifically for handling objects with a constructor property which has a field (e.g., circuit.constructor.name)
     *
     * @param {Array<Object>} sortObject - The array of objects to sort. The object must have a constructor property with a name field
     * @param {string} sortOrder - The sort direction ("asc" for ascending, descending if anything else)
     *
     * @returns {Array<Object>} A sorted array of objects
     */
    static sortAnArrayOfObjectsBasedOnNestedConstructorName(sortObject, sortOrder) {
        const sortedArray = structuredClone(sortObject); //creates a deep copy

        if (sortOrder === ASCENDING_ORDER) {
            return sortedArray.sort((a, b) => {
                return a.constructor.name.toUpperCase().localeCompare(b.constructor.name.toUpperCase());
            });
        } else {
            return sortedArray.sort((a, b) => {

                return b.constructor.name.toUpperCase().localeCompare(a.constructor.name.toUpperCase());
            });
        }
    }


    /**
     * Sorts an array of objects based on qualifying time in (Minutes:Seconds) format
     *
     * @param {Array<Object>} sortObject - The array of objects to sort. The object must shave the ortLey property in the above specified format
     * @param {string} sortKey - Key containing the qualifying time string (e.g., 'q1', 'q2') to compare in the object. This property must be in the object
     * @param {string} sortOrder - The sort direction ("asc" for ascending, descending if anything else)
     *
     * @returns {Array<Object>} A sorted array of objects
     */
    static sortAnArrayOfObjectsBasedOnQualifyingTime(sortObject, sortKey, sortOrder) {
        const sortedArray = structuredClone(sortObject); //creates a deep copy

            return sortedArray.sort((a, b) => {
                const aTimeParts = a[sortKey].split(":");
                const aTime =  Number(aTimeParts[0]) * 60 +  Number(aTimeParts[1]);
                const bTimeParts = b[sortKey].split(":");
                const bTime =  Number(bTimeParts[0]) * 60 +  Number(bTimeParts[1]);
                return sortOrder === ASCENDING_ORDER ? aTime - bTime : bTime - aTime;
            });

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
            header.textContent = header.textContent.replace(/[↑↓]/, "");
        });

        const sortHeading = document.querySelector(`${tableID} th[data-sortable="${sortValue}"]`);
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

    /**
     * Attaches the table header click handler to each header element
     * that has a sortable class.
     *
     * @returns {void}
     */
    static installTableSortingEventListener(tableBodyCSSID, handler) {
        const thList = document.querySelectorAll(`${tableBodyCSSID} th`);
        console.log(`${tableBodyCSSID} th`);

        thList.forEach((th) => {

            if (th.hasAttribute("data-sortable")) {
                console.log(th);

                th.addEventListener("click", handler);
            }
        });
    }

}


class BaseTableController {

    constructor(tableId, sortKey) {
        this.tableId = `#${tableId}`;
        this.tableSortInfo = {
            sortOrder: ASCENDING_ORDER,
            sortKey: sortKey
        };
        this.data = [];

        Utility.installTableSortingEventListener(this.tableId, this.handleTableHeaderClick.bind(this));

    }


    handleTableHeaderClick(event) {
        if (event.target.dataset.sortable === this.tableSortInfo.sortKey) {
            this.tableSortInfo.sortOrder = this.tableSortInfo.sortOrder === ASCENDING_ORDER ?
                DESCENDING_ORDER : ASCENDING_ORDER;
        }
        this.tableSortInfo.sortKey = event.target.dataset.sortable;
        this.displayResults();
    }

    displayResults() {

        const tableBody = document.querySelector(this.tableId + " tbody");
        tableBody.innerHTML = "";
        const sortedData = this.getSortedData();
        sortedData.forEach((data) => {
            tableBody.appendChild(this.createRow(data));
        });
        Utility.updateTableSortIndicators(this.tableSortInfo.sortKey,
            this.tableSortInfo.sortOrder,
            this.tableId
        );
    }

    getSortedData() {}
    createRow() {}
}

class DriverPopup extends BaseTableController {
    constructor() {
        super("driver-popup-table", "round");
    }

    getSortedData() {
        return this.data;
    }

    createRow(data) {
        const row = Utility.createElement("tr", CSS_CLASSES.ROW_HOVER, null);
        row.appendChild(Utility.createElement("td", CSS_CLASSES.TABLE_CELL, data.round));

        row.appendChild(Utility.createElement("td", CSS_CLASSES.TABLE_CELL, data.name));
        row.appendChild(Utility.createElement("td", CSS_CLASSES.TABLE_CELL, data.positionOrder));
        row.appendChild(Utility.createElement("td", CSS_CLASSES.TABLE_CELL, data.Dummy));
        return row;
    }


    displayDriverInfo(driverData){

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

    async handleDriverPopup(event){

        try {
            const driverAPIQuery = API.BASE_URL + API.QUERY.DRIVER_INFO + event.target.dataset.driverId;
            console.log(driverAPIQuery);
            this.data = await Utility.fetchWithCache(driverAPIQuery);
            console.log(this.data);
            console.log(this);

            this.displayResults();
        } catch (error) {
            console.error("Error loading season data:", error);
        }


    }



}


class RaceInfoController {

    static #currentRaceInfo;

    static async fetchAndDisplayRaceInfo(raceID) {
        try {
            const raceInfoAPIQuery = API.BASE_URL + API.QUERY.RACE_INFO + raceID;
            this.#currentRaceInfo = (await Utility.fetchWithCache(raceInfoAPIQuery))[0];
            this.#displayRaceInfo()
        } catch (error) {
            console.error("Error fetching or displaying race info:", error);
        }

    }

    static async #handleCircuitPopup() {
        try {
            const circuitAPIQuery = API.BASE_URL + API.QUERY.CIRCUIT_INFO + RaceInfoController.#currentRaceInfo.circuit.id; //Cant use this here as the event is the caller not a member method
            const circuitData = await Utility.fetchWithCache(circuitAPIQuery);
            Popups.displayCircuitPopup(circuitData);
        } catch (error) {
                console.error("Error loading and displaying circuit popup:", error);
        }

    }

    static #displayRaceInfo() {
        const raceInfo = this.#currentRaceInfo;
        const raceHeading = document.querySelector("#results-details-view h2");
        raceHeading.textContent =
            "Results for the " + raceInfo.year + " " + raceInfo.name;

        const article = document.querySelector("#race-info");
        article.innerHTML = "";

        const circuit = Utility.createElement("p", CSS_CLASSES.CIRCUIT_POPUP, "Circuit: " + raceInfo.circuit.name, {"data-circuit-id": raceInfo.circuit.id});
        circuit.addEventListener("click", this.#handleCircuitPopup);
        article.appendChild(circuit);

        article.appendChild(Utility.createElement("p", null, "Round " + raceInfo.round));
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


}


class RaceResultsController extends BaseTableController {

    constructor() {
        super("race-results-table", "position");
    }


    getSortedData() {
        const { sortOrder, sortKey } = this.tableSortInfo;
        switch (sortKey) {
            case "driver":
                return Utility.sortAnArrayOfObjectsBasedOnNestedDriverName(this.data, sortOrder);
            case "constructor":
                return Utility.sortAnArrayOfObjectsBasedOnNestedConstructorName(this.data, sortOrder);
            default:
                return Utility.sortAnArrayOfObjectsByNumber(this.data, sortKey, sortOrder);
        }
    }


    createRow(data) {
        const row = Utility.createElement("tr", CSS_CLASSES.ROW_HOVER, null);
        row.appendChild(Utility.createElement("td", CSS_CLASSES.TABLE_CELL, data.position));
        const driver = Utility.createElement(
            "td",
            CSS_CLASSES.TABLE_CELL_POPUP,
            data.driver.forename + " " + data.driver.surname,
            {"data-driver-id": data.driver.id}
        );
        driver.addEventListener("click", Popups.handleDriverPopup);
        row.appendChild(driver);
        row.appendChild(Utility.createElement("td", CSS_CLASSES.TABLE_CELL, data.constructor.name));
        row.appendChild(Utility.createElement("td", CSS_CLASSES.TABLE_CELL, data.laps));
        row.appendChild(Utility.createElement("td", CSS_CLASSES.TABLE_CELL, data.points));
        return row;
    }


     async fetchAndDisplayRaceResults(raceID) {
        try {
            const raceResultsPIQuery = API.BASE_URL + API.QUERY.RACE_RESULTS + raceID;
            this.data = await Utility.fetchWithCache(raceResultsPIQuery);
            super.displayResults();
            this.displayPodiumFinishers(this.data);
        } catch (error) {
            console.error("Error fetching or displaying raceresults:", error);
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
      displayPodiumFinishers(raceResults) {
        const pElements = document.querySelectorAll("#podium-finish-cards article p");

        pElements.forEach((pElement, index) => {
            pElement.textContent =
                raceResults[index].driver.forename +
                " " +
                raceResults[index].driver.surname;
        });
    }


}


class RaceQualifyingController extends BaseTableController{
    constructor() {
        super("qualifying-results-table", "position");
        this.driverPopopHandler = new DriverPopup();
    }


    async fetchAndDisplayQualifyingResults(raceID) {
        try {
            const raceInfoAPIQuery = API.BASE_URL + API.QUERY.QUALIFYING + raceID;
            this.data = await Utility.fetchWithCache(raceInfoAPIQuery);
            super.displayResults();
        } catch (error) {
            console.error("Error fetching or displaying race qualifying results:", error);
        }

    }

    getSortedData() {
        const {sortOrder, sortKey} = this.tableSortInfo;
        switch (sortKey) {
            case "position":
                return Utility.sortAnArrayOfObjectsByNumber(this.data, sortKey, sortOrder);
            case "driver":
                return Utility.sortAnArrayOfObjectsBasedOnNestedDriverName(this.data, sortOrder);
            case "constructor":
                return Utility.sortAnArrayOfObjectsBasedOnNestedConstructorName(this.data, sortOrder);
            default:
                return Utility.sortAnArrayOfObjectsBasedOnQualifyingTime(this.data, sortKey, sortOrder);
        }

    }
    createRow(data) {
        const row = Utility.createElement("tr", CSS_CLASSES.ROW_HOVER, null);

        row.appendChild(Utility.createElement("td", CSS_CLASSES.TABLE_CELL, data.position));
        const driver =  Utility.createElement(
            "td",
            CSS_CLASSES.TABLE_CELL_POPUP,
            data.driver.forename + " " + data.driver.surname,
            {"data-driver-id": data.driver.id}
        );
        driver.addEventListener("click", this.driverPopopHandler.handleDriverPopup.bind(this));

        row.appendChild(driver);
        row.appendChild(Utility.createElement("td", CSS_CLASSES.TABLE_CELL_POPUP, data.constructor.name));
        row.appendChild(Utility.createElement("td", CSS_CLASSES.TABLE_CELL, data.q1));
        row.appendChild(Utility.createElement("td", CSS_CLASSES.TABLE_CELL, data.q2));
        row.appendChild(Utility.createElement("td", CSS_CLASSES.TABLE_CELL, data.q3));
        return row;


    }

}


class RaceSelectionController {
    constructor() {
        this.raceResults =  new RaceResultsController();
        this.raceQualify =  new RaceQualifyingController();

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
      handleRaceSelection = async(event) =>{
        try {
            const raceId = event.target.dataset.raceId;
            await RaceInfoController.fetchAndDisplayRaceInfo(raceId);
            await this.raceQualify.fetchAndDisplayQualifyingResults(raceId);
            await this.raceResults.fetchAndDisplayRaceResults(raceId);
            document.querySelector("#results-details-view").classList.remove("hidden");
        } catch (error) {
            console.log("Error loading race data:", error);
        }
    }

}

class SeasonSelectController extends BaseTableController{
    constructor() {
        super("season-data-table", "round");
        document
            .querySelector("#season-select")
            .addEventListener("change", this.fetchAndDisplaySeasonRaces);
        this.raceSelect = new RaceSelectionController();

    }


    /**
     * Returns the season data sorted based on the sort key and order.
     *
     * @returns {Array} - Season data sorted.
     */
     getSortedData() {
        const {sortOrder, sortKey} = this.tableSortInfo;
        return sortKey === "name" ? Utility.sortAnArrayOfObjectsByString(this.data, sortKey, sortOrder)
            : Utility.sortAnArrayOfObjectsByNumber(this.data, sortKey, sortOrder); // sort based on round which is a number
    }


    /**
     * Updates the displayed season year heading above the table
     * @returns {void}
     */
     updateSeasonYear() {
        document.querySelector("#race-details-view h2").textContent = `${this.data[0].year} Races`;
    }


    /**
     * Creates a table row element for a race.
     * Adds a event listener to the results button linked to the Race Selection class.
     *
     * @param {Object} race - The race data object
     * @returns {HTMLTableElement} The created row element containing race data and results button
     */
     createRow(race) {
        const row = Utility.createElement("tr", CSS_CLASSES.ROW_HOVER, null);
        row.appendChild(Utility.createElement("td", CSS_CLASSES.TABLE_CELL, race.round));
        row.appendChild(Utility.createElement("td", CSS_CLASSES.TABLE_CELL, race.name));

        // Create and append the button with race id for future fetch uses
        const buttonContainer = Utility.createElement("td", CSS_CLASSES.TABLE_CELL, null);
        const button = Utility.createElement("button", CSS_CLASSES.RESULTS_BUTTON, "Results",
            {"data-race-id": race.id},
            {"data-round-number": race.round},
        );
        button.addEventListener("click", this.raceSelect.handleRaceSelection);
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
     fetchAndDisplaySeasonRaces = async (event) => {
        try {
            const seasonAPIQuery = API.BASE_URL + API.QUERY.RACES + event.target.value;
            this.data = await Utility.fetchWithCache(seasonAPIQuery);
            this.displayResults();
            this.updateSeasonYear();
            document.querySelector("#season-select").classList.add("hidden");
            document.querySelector("#race-details-view").classList.remove("hidden");
        } catch (error) {
            console.error("Error loading season data:", error);
        }
    }




}

document.addEventListener("DOMContentLoaded", () => {
    new SeasonSelectController();


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
