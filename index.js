
const API = {
    BASE_URL: "https://www.randyconnolly.com/funwebdev/3rd/api/f1",
    QUERY: {
        ALL_RACES_INFO: "/races.php?season=",
        QUALIFYING: "/qualifying.php?race=",
        RACE_INFO: "/races.php?id=",
        RACE_RESULTS: "/results.php?race=",
        CIRCUIT_INFO: "/circuits.php?id=",
        DRIVER_INFO: "/drivers.php?id=",
        ALL_RACE_RESULTS: "/results.php?season=",
        ALL_QUALIFYING_RESULTS: "/qualifying.php?season=",
        CONSTRUCTOR_INFO: "/constructors.php?id="
    }
};

const ASCENDING_ORDER = "asc";

const DESCENDING_ORDER = "dsc";

const CSS_CLASSES = {
    TABLE_CELL: "px-2 py-2 text-center",
    TABLE_CELL_POPUP:
        "px-2 py-2 text-center underline cursor-pointer hover:text-cyan-300",
    CIRCUIT_POPUP: "underline cursor-pointer hover:text-cyan-300",
    ROW_HOVER: "hover:bg-slate-600",
    RESULTS_BUTTON:
        "rounded bg-slate-600 px-4 py-2 text-slate-50 outline-none hover:bg-slate-500",
    URL: "text-slate-400 hover:text-blue-300 underline text-base",
    ADD_TO_FAV_BUTTON:
        "add-favorite-button rounded bg-slate-700 px-4 py-2 text-sm hover:bg-slate-600",
    POPUP_HEADING: "titillium-web-semibold-italic text-2xl",
    SORTABLE_ROUND_HEADER:
        "px-2 py-2 text-center text-xs md:text-2xl sortable round",
    SORTABLE_NAME_HEADER:
        "px-2 py-2 text-center text-xs md:text-2xl sortable name",
    EMPTY_HEADER: "px-2 py-2"
};

document.addEventListener("DOMContentLoaded", () => {
    new Main();
});

/**
 * The entry point for the application.
 * Initializes and manages all other controllers for popups, race details, race results and qualifying.
 */
class Main {
    /**
     * The app basically starts from here.
     * The constructor sets up the  controllers and also the event listener
     * that wll be triggered when the user selects a season and also
     * when they click the home button
     *
     */
    constructor() {
        this.driverDetailsPopup = new DriverPopupController();
        this.constructorDetailsPopup = new ConstructorPopupController();
        this.circuitPopup = new CircuitPopup();

        this.raceDetailsView = new RaceInfoController(
            this.circuitPopup.handleCircuitPopup
        );

        this.raceResultsView = new RaceResultsController(
            this.driverDetailsPopup.handleDriverPopup,
            this.constructorDetailsPopup.handleConstructorPopup
        );

        this.raceQualifyingView = new RaceQualifyingController(
            this.driverDetailsPopup.handleDriverPopup,
            this.constructorDetailsPopup.handleConstructorPopup
        );

        this.seasonSelectView = new SeasonRacesController(
            this.handleRaceSelection.bind(this)
        );

        this.favoritePopup = new FavoritePopup(
            "favorite",
            "favorites-popup",
            "close-favorites-popup",
            "clear-favorites"
        );

        document.querySelector("#home").addEventListener("click", () => {
            document.querySelector("#season-select").classList.remove("hidden");
            document.querySelector("#race-details-view").classList.add("hidden");
            document.querySelector("#results-details-view").classList.add("hidden");
        });

        //Listener for fetching and displaying season data
        document
            .querySelector("#season-select")
            .addEventListener("change", this.loadDisplaySeasonData.bind(this));
    }

    /**
     * Fetches season data, including race results, qualifying results, and race information.
     *
     * @param {number} year - The year for which season data is fetched.
     * @returns {Promise<Array>} A promise resolving to an array containing race results,
     * qualifying results, and race information.
     */
    fetchSeasonData(year) {
        return Promise.all([
            Utility.fetchWithCache(
                `${API.BASE_URL}${API.QUERY.ALL_RACE_RESULTS}${year}`
            ),
            Utility.fetchWithCache(
                `${API.BASE_URL}${API.QUERY.ALL_QUALIFYING_RESULTS}${year}`
            ),
            Utility.fetchWithCache(
                `${API.BASE_URL}${API.QUERY.ALL_RACES_INFO}${year}`
            )
        ]);
    }

    /**
     * Displays a loading spinner while data is being fetched.
     */
    showLoadingState() {
        document.querySelector("#season-select").classList.add("hidden");
        document.querySelector("#spinner").classList.remove("hidden");
    }

    /**
     * Hides the loading spinner after the data has been fetched.
     */
    hideLoadingState() {
        document.querySelector("#spinner").classList.add("hidden");
    }

    /**
     * Updates the controllers with the fetched data - race results,
     * qualifying results, and race information.
     *
     * @param {Array} seasonRaceResults - Race results for the season
     * @param {Array} seasonQualifyingResults - Qualifying results for the season
     * @param {Array} seasonRacesInfo - Information about all races in the season
     */
    updateControllersData(
        seasonRaceResults,
        seasonQualifyingResults,
        seasonRacesInfo
    ) {
        this.raceDetailsView.allSeasonRacesInfo = seasonRacesInfo;
        this.raceQualifyingView.seasonQualifyingResults = seasonQualifyingResults;
        this.raceResultsView.seasonRaceResults = seasonRaceResults;

        this.circuitPopup.allSeasonRacesInfo = seasonRacesInfo;
        this.driverDetailsPopup.seasonRaceResults = seasonRaceResults;
        this.constructorDetailsPopup.seasonRaceResults = seasonRaceResults;

        this.seasonSelectView.data = seasonRacesInfo;
    }

    /**
     * Initializes the controllers with data for the selected season and display the races for the season
     *
     * @param {Event} event
     * */
    async loadDisplaySeasonData(event) {
        try {
            this.showLoadingState();
            const [seasonRaceResults, seasonQualifyingResults, seasonRacesInfo] =
                await this.fetchSeasonData(event.target.value);

            this.updateControllersData(
                seasonRaceResults,
                seasonQualifyingResults,
                seasonRacesInfo
            );
            this.hideLoadingState();
            this.seasonSelectView.populateSeasonRacesTable();
            this.favoritePopup.syncHeartsWithFavorites();
        } catch (error) {
            console.error("Failed to load data in loadDisplaySeasonData: " + error);
        }
    }

    /**
     * Handles race selection by  displaying race information,
     * qualifying results, and final results from the API.
     *
     * @param {Event} event - Click event from results button in race table. Must have a "data-race-id="..." " attribute
     *
     */
    handleRaceSelection(event) {
        const raceId = event.target.dataset.raceId;
        this.raceDetailsView.populateWithRaceInfo(raceId);
        this.raceQualifyingView.populateQualifyingResultsTable(raceId);
        this.raceResultsView.populateRaceResultsTable(raceId);
        document.querySelector("#results-details-view").classList.remove("hidden");

        this.favoritePopup.syncHeartsWithFavorites();
    }
}

/**
 * Base class for implementing sortable table controllers.
 * Provides core functionality for table sorting and display.
 * Some functions must be implemented by the child classes.
 *
 */
class BaseTableController {
    /**
     * Creates a new table controller instance.
     *
     * @param {string} tableId - The table element ID (without #)
     * @param {string} sortKey - Initial sort column key
     * @param {boolean} [userCanSortEnabled=true] - Whether user sorting is enabled
     */
    constructor(tableId, sortKey, userCanSortEnabled = true) {
        this.tableSelectorId = `#${tableId}`;
        this.tableSortInfo = {
            direction: ASCENDING_ORDER,
            key: sortKey
        };
        this.data = null;
        if (userCanSortEnabled) {
            Utility.installTableSortingEventListener(
                this.tableSelectorId,
                this.handleSortHeaderClick.bind(this)
            );
        }
    }

    /**
     * Synchronizes the presence of heart icons (♥) in the race and qualifying results table
     * with the current list of favorite drivers, constructors, and circuits.
     *
     * For each cell in the qualifying and race results tables, checks whether the
     * cell's content matches any favorite. Adds or removes a heart icon as needed.
     *
     */
    syncHeartsWithFavorites() {
        const favoriteDriversTable = document.getElementById("drivers-table");
        const favoriteConstructorsTable =
            document.getElementById("constructors-table");
        const favoriteCircuitsTable = document.getElementById("circuits-table");

        const favoriteDrivers = Array.from(
            favoriteDriversTable.querySelectorAll("td")
        ).map((cell) => cell.textContent.trim());

        const favoriteConstructors = Array.from(
            favoriteConstructorsTable.querySelectorAll("td")
        ).map((cell) => cell.textContent.trim());

        const favoriteCircuits = Array.from(
            favoriteCircuitsTable.querySelectorAll("td")
        ).map((cell) => cell.textContent.trim());

        const tables = [
            document.getElementById("qualifying-results-table"),
            document.getElementById("race-results-table")
        ];

        tables.forEach((table) => {
            if (!table) return;

            const cells = table.querySelectorAll("td");
            cells.forEach((cell) => {
                const hasHeart = cell.textContent.includes("♥");
                const cellText = cell.textContent.replace("♥", "").trim();

                const shouldHaveHeart =
                    favoriteDrivers.includes(cellText) ||
                    favoriteConstructors.includes(cellText) ||
                    favoriteCircuits.includes(cellText);

                if (shouldHaveHeart && !hasHeart) {
                    cell.textContent = `${cellText} ♥`;
                } else if (!shouldHaveHeart && hasHeart) {
                    cell.textContent = cellText;
                }
            });
        });
    }

    /**
     * Handles click events on sortable table headers.
     * Updates the sort direction and key, then refreshes the table
     * via a class method.
     *
     * @param {Event} event - The click event object. Must have a "dataset-sortable="..." attribute
     *
     */
    handleSortHeaderClick(event) {
        if (event.target.dataset.sortable === this.tableSortInfo.key) {
            this.tableSortInfo.direction =
                this.tableSortInfo.direction === ASCENDING_ORDER
                    ? DESCENDING_ORDER
                    : ASCENDING_ORDER;
        }
        this.tableSortInfo.key = event.target.dataset.sortable;
        this.populateTable();
        this.syncHeartsWithFavorites();
    }

    /**
     * Updates the table display with the sorted table data.
     * Also updates the sort direction indicators via another class method.
     */
    populateTable() {
        const tableBody = document.querySelector(this.tableSelectorId + " tbody");
        tableBody.innerHTML = "";

        const dataInSortedOrder = this.getSortedData();
        dataInSortedOrder.forEach((data) => {
            tableBody.appendChild(this.createRow(data));
        });
        Utility.updateTableSortIndicators(
            this.tableSortInfo.key,
            this.tableSortInfo.direction,
            this.tableSelectorId
        );
    }

    /**
     * Gets the data in sorted order. Must be implemented by the child classes.
     *
     * @returns {Array<Object>} - Sorted array of data objects
     */
    getSortedData() {}

    /**
     * Creates a single row for a table. Must be implemented by the child classes.
     * @param {Object} data - The data to be used for creating the row
     * @returns {HTMLTableRowElement} - The created row element
     */
    createRow(data) {}
}

/**
 * The FavoritePopup class extends the BaseTableController class to manage
 * a popup dialog for displaying and interacting with user favorites (drivers, constructors, and circuits).
 * It handles adding, displaying, saving, and clearing favorites using the browser's local storage.
 */
class FavoritePopup extends BaseTableController {
    /**
     * Initializes the FavoritePopup instance.
     * Sets up event listeners, references required DOM elements, and loads saved favorites from localStorage.
     *
     * @param {string} favoriteButtonId - ID of the button that opens the favorites popup.
     * @param {string} popupId - ID of the popup dialog element.
     * @param {string} closeButtonId - ID of the button that closes the popup.
     * @param {string} clearButtonId - ID of the button that clears all favorites.
     */
    constructor(favoriteButtonId, popupId, closeButtonId, clearButtonId) {
        super("favorites-table", "name", false);

        this.favoriteButton = document.getElementById(favoriteButtonId);
        this.popup = document.getElementById(popupId);
        this.closeButton = document.getElementById(closeButtonId);
        this.clearButton = document.getElementById(clearButtonId);

        this.driversTable = document.getElementById("drivers-table");
        this.constructorsTable = document.getElementById("constructors-table");
        this.circuitsTable = document.getElementById("circuits-table");

        if (
            !this.favoriteButton ||
            !this.popup ||
            !this.closeButton ||
            !this.clearButton
        ) {
            console.error("One or more elements not found. Check your IDs.");
            return;
        }

        this.addEventListeners();
        this.loadFavoritesFromStorage();
    }

    /**
     * Attaches event listeners for handling user interactions.
     * - Opens the popup when the favorite button is clicked.
     * - Closes the popup when the close button is clicked.
     * - Clears favorites when the clear button is clicked.
     * - Adds a favorite when the "add-favorite-button" is clicked.
     */
    addEventListeners() {
        this.favoriteButton.addEventListener("click", () => this.openPopup());
        this.closeButton.addEventListener("click", () => this.closePopup());
        this.clearButton.addEventListener("click", () => this.clearFavorites());
        document.addEventListener("click", (event) => {
            if (event.target.classList.contains("add-favorite-button")) {
                this.addFavorite(event);
            }
        });
    }

    /**
     * Opens the favorites popup.
     *
     * @returns {void}
     */
    openPopup() {
        this.popup.showModal();
    }

    /**
     * Closes the favorites popup.
     *
     * @returns {void}
     */
    closePopup() {
        this.popup.close();
    }

    /**
     * Adds a new favorite to the appropriate table (drivers, constructors, or circuits).
     * Ensures duplicates are not added and saves the updated list to localStorage.
     *
     * @param {Event} event - Click event from an "add-favorite-button" element.
     * @returns {void}
     */
    addFavorite(event) {
        const button = event.target;
        const type = button.getAttribute("data-type");
        const name = button.getAttribute("data-name");

        if (!type || !name) {
            console.error("Missing data attributes on the button.");
            return;
        }

        let table;
        switch (type) {
            case "driver":
                table = this.driversTable;
                break;
            case "constructor":
                table = this.constructorsTable;
                break;
            case "circuit":
                table = this.circuitsTable;
                break;
            default:
                console.error("Unknown favorite type:", type);
                return;
        }

        const existingRows = Array.from(table.rows);
        const itemExists = existingRows.some(
            (row) => row.cells[0].textContent === name
        );

        if (itemExists) {
            return;
        }

        const tableRow = document.createElement("tr");
        const tableCell = document.createElement("td");
        tableCell.textContent = name;
        tableCell.className =
            "px-2 py-2 text-center text-xs text-slate-300 md:px-8 md:text-base";

        tableRow.appendChild(tableCell);
        table.appendChild(tableRow);
        document.querySelector("#favorites-toast").classList.remove("hidden");

        setTimeout(() => {
            document.querySelector("#favorites-toast").classList.add("hidden");
        }, 2000);

        this.saveFavoritesToStorage();
        this.syncHeartsWithFavorites();
    }

    /**
     * Clears all favorites by removing items from the tables and localStorage.
     *
     * @returns {void}
     */
    clearFavorites() {
        this.driversTable.innerHTML = "";
        this.constructorsTable.innerHTML = "";
        this.circuitsTable.innerHTML = "";

        localStorage.removeItem("favorites");
        this.syncHeartsWithFavorites();
    }

    /**
     * Saves the current list of favorites to localStorage for persistence.
     *
     * @returns {void}
     */
    saveFavoritesToStorage() {
        const favorites = {
            drivers: Array.from(this.driversTable.querySelectorAll("td")).map(
                (cell) => cell.textContent.trim()
            ),
            constructors: Array.from(
                this.constructorsTable.querySelectorAll("td")
            ).map((cell) => cell.textContent.trim()),
            circuits: Array.from(this.circuitsTable.querySelectorAll("td")).map(
                (cell) => cell.textContent.trim()
            )
        };

        localStorage.setItem("favorites", JSON.stringify(favorites));
    }

    /**
     * Loads the favorites from localStorage and populates the respective tables.
     * Updates the hearts in related tables to match the loaded data.
     *
     * @returns {void}
     */
    loadFavoritesFromStorage() {
        const storedFavorites = JSON.parse(localStorage.getItem("favorites"));

        if (!storedFavorites) return;

        const { drivers, constructors, circuits } = storedFavorites;

        drivers.forEach((driver) => {
            const row = this.createRow(driver);
            this.driversTable.appendChild(row);
        });

        constructors.forEach((constructor) => {
            const row = this.createRow(constructor);
            this.constructorsTable.appendChild(row);
        });

        circuits.forEach((circuit) => {
            const row = this.createRow(circuit);
            this.circuitsTable.appendChild(row);
        });

        this.syncHeartsWithFavorites();
    }

    /**
     * Creates a table row with the given name for use in a favorites table.
     *
     * @param {string} name - The name of the favorite item to display in the row.
     * @returns {HTMLTableRowElement} The created table row element.
     */
    createRow(name) {
        const tableRow = document.createElement("tr");
        const tableCell = document.createElement("td");
        tableCell.textContent = name;
        tableCell.className =
            "px-2 py-2 text-center text-xs text-slate-300 md:px-8 md:text-base";
        tableRow.appendChild(tableCell);
        return tableRow;
    }
}

/**
 * Manages the circuit popup,displaying circuit information.
 */
class CircuitPopup {
    /**
     * Initializes the circuit popup controller.
     * Sets the event listener for closing the popup.
     */
    constructor() {
        this.allSeasonRacesInfo = null; //needs to be set in the Main class
        document
            .querySelector("#close-circuit-popup")
            .addEventListener("click", () => {
                document.querySelector("#circuit-popup").close();
            });
    }

    /**
     * Handles click events for the circuit popup.
     * Finds the circuit info based on the circuit id in the event object.
     *
     * @param {Event} event - The click event object. Must contain a data-circuit-id attribute
     */
    handleCircuitPopup = (event) => {
        const currentRaceCircuit = this.allSeasonRacesInfo.find(
            (race) => race.circuit.id === Number(event.target.dataset.circuitId)
        );
        this.displayCircuitInfo(currentRaceCircuit.circuit);
    };

    /**
     * Renders the circuit information(Name,Location)
     * @param {Object} circuitInfo - Object with the details of the driver
     */
    displayCircuitInfo(circuitInfo) {
        const circuitPopupInfoSection = document.querySelector(
            "#circuit-popup section"
        );
        circuitPopupInfoSection.innerHTML = "";

        circuitPopupInfoSection.appendChild(
            Utility.createElement("h2", CSS_CLASSES.POPUP_HEADING, circuitInfo.name)
        );

        circuitPopupInfoSection.appendChild(
            Utility.createElement(
                "p",
                null,
                `${circuitInfo.location}, ${circuitInfo.country}`
            )
        );

        const link = Utility.createElement(
            "a",
            CSS_CLASSES.URL,
            "Url: " + circuitInfo.url,
            { href: circuitInfo.url },
            { target: "_blank" }
        );

        circuitPopupInfoSection.appendChild(link);
        circuitPopupInfoSection.appendChild(
            Utility.createElement(
                "button",
                CSS_CLASSES.ADD_TO_FAV_BUTTON,
                "Add Favorites",
                {
                    "data-type": "circuit"
                },
                {
                    "data-name": circuitInfo.name
                }
            )
        );
        document.querySelector("#circuit-popup").showModal();
    }
}

/**
 * Manages the driver popup, including displaying driver information and
 * drivers results for the current selected season.
 */
class DriverPopupController extends BaseTableController {
    /**
     * Initializes the driver popup controller.
     * Sets initial properties and also adds an event listener for closing the popup.
     */
    constructor() {
        super("driver-popup-table", "round", false);
        this.seasonRaceResults = null; // set in the Main class
        document
            .querySelector("#close-driver-popup")
            .addEventListener("click", () => {
                document.querySelector("#driver-popup").close();
            });
    }

    /**
     * Sorts the race data by round in ascending order.
     *
     * @returns {Array<Object>} The sorted race data.
     */
    getSortedData() {
        return this.data.sort((a, b) => {
            return a.race.round - b.race.round;
        });
    }

    /**
     * Creates a single row for a driver results table.
     *
     * @param {Object} data - The race entry data. Contains the driver result for a single race
     * @returns {HTMLTableRowElement} - Table row element with race result information
     */
    createRow(data) {
        const row = Utility.createElement("tr", CSS_CLASSES.ROW_HOVER, null);
        row.appendChild(
            Utility.createElement("td", CSS_CLASSES.TABLE_CELL, data.race.round)
        );
        row.appendChild(
            Utility.createElement("td", CSS_CLASSES.TABLE_CELL, data.race.name)
        );
        row.appendChild(
            Utility.createElement("td", CSS_CLASSES.TABLE_CELL, data.position)
        );
        row.appendChild(
            Utility.createElement("td", CSS_CLASSES.TABLE_CELL, data.points)
        );
        return row;
    }

    /**
     * Calculates the age based on the date of birth
     * @param {string} dateOfBirth - The date of birth in the format -(Year-Month-Date)
     * @returns {number} - The age in years
     * @reference: https://medium.com/@selbekk/math-with-dates-in-javascript-2b0ddcee63f
     */
    getAge(dateOfBirth) {
        const currentDate = new Date();
        const birthDay = new Date(dateOfBirth);
        return Math.floor((currentDate - birthDay) / 31556952000);
    }

    /**
     * Renders the driver information(Name,dob etc.) on the left half of the popup
     * @param {Object} driverDetails - Object with the details of the driver
     */
    displayDriverInfo(driverDetails) {
        const driverPopupInfoSection = document.querySelector(
            "#driver-popup section"
        );
        driverPopupInfoSection.innerHTML = "";

        driverPopupInfoSection.appendChild(
            Utility.createElement(
                "h2",
                CSS_CLASSES.POPUP_HEADING,
                driverDetails.forename + " " + driverDetails.surname
            )
        );

        driverPopupInfoSection.appendChild(
            Utility.createElement("p", null, "Date Of Birth: " + driverDetails.dob)
        );

        driverPopupInfoSection.appendChild(
            Utility.createElement("p", null, "Age: " + this.getAge(driverDetails.dob))
        );

        driverPopupInfoSection.appendChild(
            Utility.createElement(
                "p",
                null,
                "Nationality: " + driverDetails.nationality
            )
        );

        const link = Utility.createElement(
            "a",
            CSS_CLASSES.URL,
            "Url: " + driverDetails.url,
            { href: driverDetails.url },
            { target: "_blank" }
        );
        driverPopupInfoSection.appendChild(link);

        const placeHolder_img = Utility.createElement(
            "img",
            "h-14 w-14 rounded-full object-cover",
            null,
            { src: "./images/driver.jpeg" }
        );

        driverPopupInfoSection.appendChild(placeHolder_img);

        driverPopupInfoSection.appendChild(
            Utility.createElement(
                "button",
                CSS_CLASSES.ADD_TO_FAV_BUTTON,
                "Add Favorites",
                {
                    "data-type": "driver"
                },
                {
                    "data-name": driverDetails.forename + " " + driverDetails.surname
                }
            )
        );
        document.querySelector("#driver-popup").showModal();
    }

    /**
     * Handles click events for the driver popup.
     * Triggered from the click event on the driver name in either the results or qualifying table.
     * Fetches detailed driver information and filters race results(set my the main class)
     * for the selected driver. Updates the table display and driver information section.
     *
     * @param {Event} event - The click event object. Must contain a data-driver-id attribute
     * @throws {Error} If driver data fetch fails
     */
    handleDriverPopup = async (event) => {
        try {
            const driverId = event.target.dataset.driverId;
            const driverInfo = await Utility.fetchWithCache(
                `${API.BASE_URL}${API.QUERY.DRIVER_INFO}${driverId}`
            );
            this.data = this.seasonRaceResults.filter((race) => {
                return race.driver.id === Number(driverId);
            });
            super.populateTable();
            this.displayDriverInfo(driverInfo);
        } catch (error) {
            console.error(
                `Error loading driver Info, driver Id -: ${event.target.dataset.driverId}`,
                error
            );
        }
    };
}

/**
 * Manages the constructor popup, including displaying constructor information and
 * constructor results for the current selected season.
 */
class ConstructorPopupController extends BaseTableController {
    /**
     * Initializes the constructor popup controller.
     * Sets up the event listener for closing the popup.
     */
    constructor() {
        super("constructor-popup-table", "round", false);
        this.seasonRaceResults = null;
        document
            .querySelector("#close-constructor-popup")
            .addEventListener("click", () => {
                document.querySelector("#constructor-popup").close();
            });
    }
    /**
     * Sorts the race data by round in ascending order.
     *
     * @returns {Array<Object>}- The sorted race data.
     */
    getSortedData() {
        return this.data.sort((a, b) => {
            return a.race.round - b.race.round;
        });
    }
    /**
     * Creates a single row for a constructor results table.
     *
     * @param {Object} data - The race entry data. Contains the result for a single race
     * @returns {HTMLTableRowElement} - Table row element with race result information
     */
    createRow(data) {
        const row = Utility.createElement("tr", CSS_CLASSES.ROW_HOVER, null);
        row.appendChild(
            Utility.createElement("td", CSS_CLASSES.TABLE_CELL, data.race.round)
        );
        row.appendChild(
            Utility.createElement("td", CSS_CLASSES.TABLE_CELL, data.race.name)
        );
        const driver = Utility.createElement(
            "td",
            CSS_CLASSES.TABLE_CELL,
            data.driver.forename + " " + data.driver.surname
        );
        row.appendChild(driver);
        row.appendChild(
            Utility.createElement("td", CSS_CLASSES.TABLE_CELL, data.position)
        );
        return row;
    }

    /**
     * Renders the constructor information(Name,nationality etc.) on the left half of the popup
     * @param {Object} constructorDetails - Object with the details of the constructor
     */
    populateConstructorInfo(constructorDetails) {
        const constructorPopupInfoSection = document.querySelector(
            "#constructor-popup section"
        );
        constructorPopupInfoSection.innerHTML = "";

        constructorPopupInfoSection.appendChild(
            Utility.createElement(
                "h2",
                CSS_CLASSES.POPUP_HEADING,
                constructorDetails.name
            )
        );
        constructorPopupInfoSection.appendChild(
            Utility.createElement(
                "p",
                null,
                "Nationality: " + constructorDetails.nationality
            )
        );

        const link = Utility.createElement(
            "a",
            CSS_CLASSES.URL,
            "Url: " + constructorDetails.url,
            { href: constructorDetails.url },
            { target: "_blank" }
        );
        constructorPopupInfoSection.appendChild(link);

        constructorPopupInfoSection.appendChild(
            Utility.createElement(
                "button",
                CSS_CLASSES.ADD_TO_FAV_BUTTON,
                "Add Favorites",
                {
                    "data-type": "constructor"
                },
                {
                    "data-name": constructorDetails.name
                }
            )
        );
        document.querySelector("#constructor-popup").showModal();
    }

    /**
     * Handles click events for the constructor popup.
     * Triggered from the click event on the constructor name in either the results or qualifying table.
     * Fetches detailed constructor information and filters race results(set by the main class)
     * for the selected constructor. Updates the table display and driver information section.
     *
     * @param {Event} event - The click event object. Must contain a data-constructor-id attribute
     * @throws {Error} If driver data fetch fails
     */
    handleConstructorPopup = async (event) => {
        try {
            const constructorId = event.target.dataset.constructorId;
            const constructorInfo = await Utility.fetchWithCache(
                `${API.BASE_URL}${API.QUERY.CONSTRUCTOR_INFO}${constructorId}`
            );
            this.data = this.seasonRaceResults.filter((race) => {
                return race.constructor.id === Number(constructorId);
            });
            this.populateConstructorInfo(constructorInfo);
            super.populateTable();
        } catch (error) {
            console.error(
                `Error loading constructor Info, Constructor Id -: ${event.target.dataset.constructorId}`,
                error
            );
        }
    };
}

/**
 * Manages the race/circuit info panel.
 */
class RaceInfoController {
    /**
     * Initializes the controller.
     */
    constructor(circuitPopup) {
        this.circuitpopupHandler = circuitPopup;
        this.allSeasonRacesInfo = null; // set in the Main controller
    }
    /**
     * Finds the race selected by the user and renders its information using a helper method.
     * @param {string} raceID - The id associated with the race selected by the user.
     */
    populateWithRaceInfo = (raceID) => {
        const currentRaceInfo = this.allSeasonRacesInfo.find(
            (race) => race.id === Number(raceID)
        );
        this.renderRaceInformation(currentRaceInfo);
    };

    /**
     * Updates the race info panel part of the Ui with the information from currentRaceInfo.
     * @param {Object} currentRaceInfo - object with the information about the current selected race.
     */
    renderRaceInformation(currentRaceInfo) {
        const raceHeading = document.querySelector("#results-details-view h2");
        raceHeading.textContent =
            "Results for the " + currentRaceInfo.year + " " + currentRaceInfo.name;

        const article = document.querySelector("#race-info");
        article.innerHTML = "";

        const circuit = Utility.createElement(
            "p",
            CSS_CLASSES.CIRCUIT_POPUP,
            "Circuit: " + currentRaceInfo.circuit.name,
            { "data-circuit-id": currentRaceInfo.circuit.id }
        );
        circuit.addEventListener("click", this.circuitpopupHandler);
        article.appendChild(circuit);

        article.appendChild(
            Utility.createElement("p", null, "Round " + currentRaceInfo.round)
        );
        article.appendChild(
            Utility.createElement("p", null, "Date " + currentRaceInfo.date)
        );

        const link = Utility.createElement(
            "a",
            CSS_CLASSES.URL,
            "Url: " + currentRaceInfo.url,
            { href: currentRaceInfo.url },
            { target: "_blank" }
        );
        article.appendChild(link);
    }
}

/**
 * Manages the race results table, including sorting, rendering rows, and displaying race results.
 * Uses functions and properties of the parent class as well, ex- data, tableSortInfo, etc
 */
class RaceResultsController extends BaseTableController {
    /**
     * Initializes the controller. this.seasonRaceResults is/needs initialized the Main class.
     * The popup handlers are installed in create rows method for each driver and constructor in the table,
     * i.e: these functions will be run when the user clicks on either the constructor or driver in the table.
     *
     * @param {Function} driverPopupHandler - Event handler function for displaying driver details
     * @param {Function} constructorPopupHandler - Event handler function for displaying constructor details
     */
    constructor(driverPopupHandler, constructorPopupHandler) {
        super("race-results-table", "position");
        this.driverPopupHandler = driverPopupHandler;
        this.consructorPopupHandler = constructorPopupHandler;
        this.seasonRaceResults = null;
    }

    /**
     * Returns the season race resultsdata sorted based on the sort key and order.
     * @returns {Array<Object>} - Season data sorted.
     */
    getSortedData() {
        const { direction, key } = this.tableSortInfo;
        switch (key) {
            case "driver":
                return Utility.sortAnArrayOfObjectsBasedOnNestedDriverName(
                    this.data,
                    direction
                );
            case "constructor":
                return Utility.sortAnArrayOfObjectsBasedOnNestedConstructorName(
                    this.data,
                    direction
                );
            default:
                return Utility.sortAnArrayOfObjectsByNumber(this.data, key, direction);
        }
    }

    /**
     * Creates a table row element based on the single race result .
     * Also adds a click event listener to the driver and constructor. The handler for these events
     * were passed into the class's constructor by the Main.
     *
     * @param {Object} data - A single race result for the current selected season
     * @returns {HTMLTableRowElement} The created row element containing race result
     */
    createRow(data) {
        const row = Utility.createElement("tr", CSS_CLASSES.ROW_HOVER, null);
        row.appendChild(
            Utility.createElement("td", CSS_CLASSES.TABLE_CELL, data.position)
        );
        const driver = Utility.createElement(
            "td",
            CSS_CLASSES.TABLE_CELL_POPUP,
            data.driver.forename + " " + data.driver.surname,
            { "data-driver-id": data.driver.id }
        );
        driver.addEventListener("click", this.driverPopupHandler);
        row.appendChild(driver);
        const constructor = Utility.createElement(
            "td",
            CSS_CLASSES.TABLE_CELL_POPUP,
            data.constructor.name,
            { "data-constructor-id": data.constructor.id }
        );
        constructor.addEventListener("click", this.consructorPopupHandler);
        row.appendChild(constructor);
        row.appendChild(
            Utility.createElement("td", CSS_CLASSES.TABLE_CELL, data.laps)
        );
        row.appendChild(
            Utility.createElement("td", CSS_CLASSES.TABLE_CELL, data.points)
        );
        return row;
    }
    /**
     * Renders the race results table with the race results for a given raceId.
     * @param {string} raceID - The ID of the selected race
     */
    populateRaceResultsTable(raceID) {
        this.data = this.seasonRaceResults.filter((result) => {
            return result.race.id === Number(raceID);
        });
        super.populateTable(); //this will also sort the table by position
        this.populatePodiumFinishers(this.data);
    }

    /**
     * Updates the names of podium finishers display with the driver names for the current selected race
     * @param {Array<Object>} raceResults - Array of race result objects
     */
    populatePodiumFinishers(raceResults) {
        const pElements = document.querySelectorAll(
            "#podium-finish-cards article p"
        );

        pElements.forEach((pElement, index) => {
            pElement.textContent =
                raceResults[index].driver.forename +
                " " +
                raceResults[index].driver.surname;
        });
    }
}

/**
 * Manages the qualifying results table, including sorting, rendering rows, and displaying race results.
 * Uses functions and properties of the parent class as wel, ex- data, tableSortInfo, etc
 */
class RaceQualifyingController extends BaseTableController {
    /**
     * Initializes the controller. this.seasonQualifyingResults is/needs initialized the Main class.
     * The popup handlers are installed in create rows method for each driver and constructor in the table,
     * i.e: these functions will be run when the user clicks on either the constructor or driver in the table.
     *
     * @param {Function} driverPopupHandler - Event handler function for displaying driver details
     * @param {Function} constructorPopupHandler - Event handler function for displaying constructor details
     */
    constructor(driverPopupHandler, constructorPopupHandler) {
        super("qualifying-results-table", "position");
        this.driverPopupHandler = driverPopupHandler;
        this.consructorPopupHandler = constructorPopupHandler;
        this.seasonQualifyingResults = null;
    }

    /**
     * Renders the qualifying table with the qualifying results for a given raceId.
     * @param {string} raceID - The Id of the selected race
     */
    populateQualifyingResultsTable(raceID) {
        //seasonQualifyingResults was initialized in main
        this.data = this.seasonQualifyingResults.filter((result) => {
            return result.race.id === Number(raceID);
        });
        super.populateTable();
    }
    /**
     * Returns the qualifying results data sorted based on the sort key and order.
     * @returns {Array<Object>} - Season data sorted.
     */
    getSortedData() {
        const { direction, key } = this.tableSortInfo;
        switch (key) {
            case "position":
                return Utility.sortAnArrayOfObjectsByNumber(this.data, key, direction);
            case "driver":
                return Utility.sortAnArrayOfObjectsBasedOnNestedDriverName(
                    this.data,
                    direction
                );
            case "constructor":
                return Utility.sortAnArrayOfObjectsBasedOnNestedConstructorName(
                    this.data,
                    direction
                );
            default: //sort based on qualifying time
                return Utility.sortAnArrayOfObjectsBasedOnQualifyingTime(
                    this.data,
                    key,
                    direction
                );
        }
    }

    /**
     * Creates a table row element based on the single qualifying result .
     * Also adds a click event listener to the driver and constructor. The handler for these events
     * were passed into the class's constructor by the Main.
     *
     * @param {Object} data - A single qualifying result for the current selected season
     * @returns {HTMLTableRowElement} The created row element containing qualifying result
     */
    createRow(data) {
        const row = Utility.createElement("tr", CSS_CLASSES.ROW_HOVER, null);

        row.appendChild(
            Utility.createElement("td", CSS_CLASSES.TABLE_CELL, data.position)
        );
        const driver = Utility.createElement(
            "td",
            CSS_CLASSES.TABLE_CELL_POPUP,
            data.driver.forename + " " + data.driver.surname,
            { "data-driver-id": data.driver.id }
        );

        driver.addEventListener("click", this.driverPopupHandler);
        row.appendChild(driver);

        const constructor = Utility.createElement(
            "td",
            CSS_CLASSES.TABLE_CELL_POPUP,
            data.constructor.name,
            { "data-constructor-id": data.constructor.id }
        );
        constructor.addEventListener("click", this.consructorPopupHandler);
        row.appendChild(constructor);

        row.appendChild(
            Utility.createElement("td", CSS_CLASSES.TABLE_CELL, data.q1)
        );
        row.appendChild(
            Utility.createElement("td", CSS_CLASSES.TABLE_CELL, data.q2)
        );
        row.appendChild(
            Utility.createElement("td", CSS_CLASSES.TABLE_CELL, data.q3)
        );
        return row;
    }
}

/**
 * This class manages the season races table,
 */
class SeasonRacesController extends BaseTableController {
    /**
     * Initializes the controller
     * @param raceSelectionHandler - the handler to be run when the user presses the result button in the table.
     *                               Installed in the creatRow method in this class
     */
    constructor(raceSelectionHandler) {
        super("season-data-table", "round");
        this.handelRaceSelection = raceSelectionHandler; //this handler is in the main class
    }
    /**
     * Returns the season data sorted based on the sort key and order.
     *
     * @returns {Array<Object>} - Season data sorted.
     */
    getSortedData() {
        const { direction, key } = this.tableSortInfo;
        return key === "name"
            ? Utility.sortAnArrayOfObjectsByString(this.data, key, direction)
            : Utility.sortAnArrayOfObjectsByNumber(this.data, key, direction); // sort based on round which is a number
    }

    /**
     *
     * Updates the  season year heading above the table
     */
    updateSeasonYear() {
        document.querySelector("#race-details-view h2").textContent =
            `${this.data[0].year} Races`;
    }

    /**
     * Creates a table row element for a race.
     * Also adds an event listener to the results button, which was provided by the Main class in the constructor.
     *
     * @param {Object} race - The race data object with information about the race
     * @returns {HTMLTableRowElement} The created row element containing race data and results button
     */
    createRow(race) {
        const row = Utility.createElement("tr", CSS_CLASSES.ROW_HOVER, null);
        row.appendChild(
            Utility.createElement("td", CSS_CLASSES.TABLE_CELL, race.round)
        );
        row.appendChild(
            Utility.createElement("td", CSS_CLASSES.TABLE_CELL, race.name)
        );

        // Create and append the button with race id for future fetch uses
        const buttonContainer = Utility.createElement(
            "td",
            CSS_CLASSES.TABLE_CELL,
            null
        );
        const button = Utility.createElement(
            "button",
            CSS_CLASSES.RESULTS_BUTTON,
            "Results",
            { "data-race-id": race.id },
            { "data-round-number": race.round },
            { "data-year": race.year }
        );
        button.addEventListener("click", this.handelRaceSelection);
        buttonContainer.appendChild(button);
        row.appendChild(buttonContainer);

        return row;
    }

    /**
     * Renders the table with all the races in the season. It also toggles the season selection
     * off while toggling the race view on.
     */
    populateSeasonRacesTable = () => {
        super.populateTable();
        this.updateSeasonYear();
        document.querySelector("#race-details-view").classList.remove("hidden");
    };
}

class Utility {
    /**
     * Sorts an array of objects based on a numeric property value.
     * This function creates a shallow copy of the original object array.
     * It sorts the copy and returns it.
     *
     * @param {Array<Object>} sortObject - The array of objects to sort
     * @param {string} sortValue - The name of the numeric property to sort by
     * @param {string} sortOrder - The sort direction ("asc" for ascending, descending if anything else)
     *
     * @returns {Array<Object>} A sorted array of objects
     * @Ref: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort
     */
    static sortAnArrayOfObjectsByNumber(sortObject, sortValue, sortOrder) {
        if (sortOrder === ASCENDING_ORDER) {
            return sortObject.slice().sort((a, b) => a[sortValue] - b[sortValue]);
        } else {
            return sortObject.slice().sort((a, b) => b[sortValue] - a[sortValue]);
        }
    }

    /**
     * Sorts an array of objects based on a string property value.
     * This function creates a shallow copy of the original object array.
     * It sorts the copy and returns it.
     *
     * @param {Array<Object>} sortObject - The array of objects to sort
     * @param {string} sortValue - The name of the string property to sort by
     * @param {string} sortOrder - The sort direction ("asc" for ascending, descending if anything else)
     *
     * @returns {Array<Object>} A sorted array of objects
     * @Ref: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort
     */
    static sortAnArrayOfObjectsByString(sortObject, sortValue, sortOrder) {
        return sortObject.slice().sort((a, b) => {
            // Remove hearts before comparing
            const aValue = String(a[sortValue]).replace("♥", "").trim();
            const bValue = String(b[sortValue]).replace("♥", "").trim();

            if (sortOrder === ASCENDING_ORDER) {
                return aValue.toUpperCase().localeCompare(bValue.toUpperCase());
            } else {
                return bValue.toUpperCase().localeCompare(aValue.toUpperCase());
            }
        });
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
     * @Ref: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort
     */
    static sortAnArrayOfObjectsBasedOnNestedDriverName(sortObject, sortOrder) {
        const sortedArray = structuredClone(sortObject); //creates a deep copy

        if (sortOrder === ASCENDING_ORDER) {
            return sortedArray.sort((a, b) => {
                const aFullName = a.driver.forename + " " + a.driver.surname;
                const bFullName = b.driver.forename + " " + b.driver.surname;
                return aFullName.toUpperCase().localeCompare(bFullName.toUpperCase());
            });
        } else {
            return sortedArray.sort((a, b) => {
                const aFullName = a.driver.forename + " " + a.driver.surname;
                const bFullName = b.driver.forename + " " + b.driver.surname;
                return bFullName.toUpperCase().localeCompare(aFullName.toUpperCase());
            });
        }
    }

    /**
     * Sorts an array of objects based on the constructor's name
     * Creates a deep copy of the original array before sorting to prevent mutation.
     * This function is specifically for handling objects with a constructor property which has a field name (e.g., circuit.constructor.name)
     *
     * @param {Array<Object>} sortObject - The array of objects to sort. The object must have a constructor property with a name field
     * @param {string} sortOrder - The sort direction ("asc" for ascending, descending if anything else)
     *
     * @returns {Array<Object>} A sorted array of objects
     * @Ref: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort
     */
    static sortAnArrayOfObjectsBasedOnNestedConstructorName(
        sortObject,
        sortOrder
    ) {
        let sortedArray;
        if (sortOrder === ASCENDING_ORDER) {
            sortedArray = sortObject.slice().sort((a, b) => {
                return a.constructor.name
                    .toUpperCase()
                    .localeCompare(b.constructor.name.toUpperCase());
            });
        } else {
            sortedArray = sortObject.slice().sort((a, b) => {
                return b.constructor.name
                    .toUpperCase()
                    .localeCompare(a.constructor.name.toUpperCase());
            });
        }
        return sortedArray;
    }

    /**
     * Sorts an array of objects based on qualifying time in (Minutes:Seconds) format
     *
     * @param {Array<Object>} sortObject - The array of objects to sort. The object must have the property
     *                                     in the above specified format
     * @param {string} sortKey - Key containing the qualifying time string (e.g., 'q1', 'q2') to compare in the object.
     * @param {string} sortOrder - The sort direction ("asc" for ascending, descending if anything else)
     *
     * @returns {Array<Object>} A sorted array of objects
     */
    static sortAnArrayOfObjectsBasedOnQualifyingTime(
        sortObject,
        sortKey,
        sortOrder
    ) {
        return sortObject.slice().sort((a, b) => {
            const aTimeParts = a[sortKey].split(":");
            const aTime = Number(aTimeParts[0]) * 60 + Number(aTimeParts[1]);
            const bTimeParts = b[sortKey].split(":");
            const bTime = Number(bTimeParts[0]) * 60 + Number(bTimeParts[1]);
            return sortOrder === ASCENDING_ORDER ? aTime - bTime : bTime - aTime;
        });
    }

    /**
     * Updates the sort direction indicators in a table's headers by removing any existing
     * arrow indicators and adding the appropriate direction arrow to the currently sorted column.
     *
     * @param {string} sortValue - The  column to br sorted by
     * @param {string} sortOrder - The sort direction (either ASCENDING_ORDER or DESCENDING_ORDER)
     * @param {string} tableID - The CSS selector for the target table(its id)
     *
     * @returns {void}
     * @Refercne : Had to ask chat Gp2 how to use the regex to do the search and replace,
     *          the prompt: how to use a regex to select the arrow and remove it in js
     */
    static updateTableSortIndicators(sortValue, sortOrder, tableID) {
        const tableHeaders = document.querySelectorAll(`${tableID} th`);

        tableHeaders.forEach((header) => {
            // Only remove sorting arrows (↑↓), preserve other characters
            header.textContent = header.textContent.replace(/[↑↓]/g, "").trim();
        });

        const sortHeading = document.querySelector(
            `${tableID} th[data-sortable="${sortValue}"]`
        );
        if (sortHeading) {
            sortHeading.textContent += sortOrder === ASCENDING_ORDER ? "↑" : "↓";
        }
    }

    /**
     * Fetches data from API or from the localStorage cache.
     * If the data is not in the local cache,
     * it fetches it and then stores it in the cache.
     * This function should be called in the try catch setup.
     *
     * @param {string} url - URL to fetch data from
     * @returns {Promise<any>} Parsed JSON response
     * @throws {Error} If fetch fails
     */
    static async fetchWithCache(url) {
        let data = localStorage.getItem(url);

        if (data) {
            return JSON.parse(data);
        }

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Error during fetch from URL: ${url}`);
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
     * @returns {HTMLElement} - The created HTML element with the specified properties
     */
    static createElement(elemName, className, textContent, ...attributes) {
        const element = document.createElement(elemName);
        if (textContent) {
            element.textContent = textContent;
        }
        if (className) {
            element.className = className;
        }

        for (let attr of attributes) {
            const attributeName = Object.keys(attr)[0]; // We don't know the attribute name beforehand
            element.setAttribute(attributeName, attr[attributeName]);
        }
        return element;
    }

    /**
     * Attaches the table header click handler to each header element
     * that has a "data-sortable" attribute (e,g.<div class ="..." data-sortable="round>...</div>).
     * When clicked, the specified handler function is executed.
     *
     * @param {String} tableBodyCSSID - The CSS ID of the table body (e.g., "#myTable").
     * @param {Function} handler - The function to execute when the sortable table header is clicked.
     */
    static installTableSortingEventListener(tableBodyCSSID, handler) {
        const thList = document.querySelectorAll(`${tableBodyCSSID} th`);

        thList.forEach((th) => {
            if (th.hasAttribute("data-sortable")) {
                th.addEventListener("click", handler);
            }
        });
    }
}
