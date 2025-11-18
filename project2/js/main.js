window.onload = (e) => { document.querySelector("#search").onclick = searchButtonClicked };

let displayTerm = "";

function searchButtonClicked() {
    console.log("searchButtonClicked() called");

    const _URL = "https://api.disneyapi.dev/character?name=";

    let url = _URL;

    let term = document.querySelector("#searchterm").value;
    displayTerm = term;

    term = term.trim();

    term = encodeURIComponent(term);

    if (term.length < 1) return;

    url += term;

    let limit = document.querySelector("#limit").value;

    document.querySelector("#status").innerHTML = "<b>Searching for '" + displayTerm + "'</b>";

    console.log(url);

    getData(url);
}

function getData(url) {
    let xhr = new XMLHttpRequest();

    xhr.onload = dataLoaded;

    xhr.onerror = dataError;

    xhr.open("GET", url);

    xhr.send();
}

function dataLoaded(e) {
    let xhr = e.target;
    console.log(xhr.responseText);

    let obj = JSON.parse(xhr.responseText);

    //nothing to return
    if (!obj.data || obj.data.length == 0) {
        document.querySelector("#status").innerHTML = "<b>No results for '" + displayTerm + "'</b>";
        return;
    }

    let results = obj.data;

    // Limit results based on 1. filters and 2. results

    // let resultsFiltered = results.filter(obj => { return obj.year <= 1970 });

    // Limit the results shown
    let limitAmount;
    for (let i = 0; i < document.querySelector("#limit").options.length; i++) {
        if (document.querySelector("#limit").options[i].selected) {
            //set values to be shown equal to its value
            limitAmount = document.querySelector("#limit").options[i].value;
            break;
        }
    }
    // console.log("limit amount: " + limitAmount);


    // console.log("results.length: " + results.length);
    let bigString = "";

    if (limitAmount < results.length) {
        for (let i = 0; i < limitAmount; i++) {
            let result = results[i];

            let line = `<div class = 'result'>`;
            line += `<img src = '${result.imageUrl}' title = '${result.id}'/>`;
            line += `<span><p>${result.name}</p>`;
            line += `<a target = '_blank' href='${result.imageUrl}'>View Image</a></span>`;
            line += `</div>`;

            bigString += line;
        }

        document.querySelector("#status").innerHTML = "<p>Showing " + limitAmount + " results for '" + displayTerm + "'</i></p>";

    }
    else {
        for (let i = 0; i < results.length; i++) {
            let result = results[i];

            let line = `<div class = 'result'>`;
            line += `<img src = '${result.imageUrl}' title = '${result.id}'/>`;
            line += `<span><p>${result.name}</p>`;
            line += `<a target = '_blank' href='${result.imageUrl}'>View Image</a></span>`;
            line += `</div>`;

            bigString += line;
        }

        document.querySelector("#status").innerHTML = "<p>Showing " + results.length + " results for '" + displayTerm + "'</i></p>";

    }


    document.querySelector("#content").innerHTML = bigString;
}

function dataError(e) {
    console.log("An error occurred");
}