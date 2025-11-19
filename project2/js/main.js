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

    // console.log(url);

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

    // Sort Z-A if option chosen, otherwise keep sorted
    if (document.querySelector("#sortLimit").options[1].selected) {
        results = results.reverse();
    }

    //if filter is selected, set which it will be
    let filterChosen;
        
    // Identify which filter has been chosen
    if (!document.querySelector("#filterLimit").options[0].selected) {
        for (let i = 0; i < document.querySelector("#filterLimit").options.length; i++) {
            if (document.querySelector("#filterLimit").options[i].selected) {
                filterChosen = document.querySelector("#filterLimit").options[i].value;
                break;
            }
        }
        
        // Loop through array and if the property != null/empty, add 
        console.log("filter chosen: " + filterChosen);
        console.log(Object.getOwnPropertyDescriptor(results[0], filterChosen).value);
        let descriptor = Object.getOwnPropertyDescriptor(results[0], filterChosen).value;
        results = results.filter(obj => { return (Object.getOwnPropertyDescriptor(obj, filterChosen).value.length > 0)});
    }


    // Limit the results shown
    let limitAmount;
    for (let i = 0; i < document.querySelector("#limit").options.length; i++) {
        if (document.querySelector("#limit").options[i].selected) {
            //set values to be shown equal to its value
            limitAmount = document.querySelector("#limit").options[i].value;
            break;
        }
    }

    // Display results 
    let bigString = "";

    // If limit is less than amount of results, only show the limit
    if (limitAmount < results.length) {
        for (let i = 0; i < limitAmount; i++) {
            let result = results[i];

            let line = `<div class = 'result'>`;
            line += `<img src = '${result.imageUrl}' title = '${result.name}'/>`;
            line += `<span><p>${result.name}</p>`;
            line += `<p>Films: ${result.films}</p>`;
            line += `<p>Short Films: ${result.shortFilms}</p>`;
            line += `<p>TV Shows: ${result.tvShows}</p>`;
            line += `<p>Video Games: ${result.videoGames}</p>`;
            line += `<p>Park Attractions: ${result.parkAttractions}</p>`;
            line += `<a target = '_blank' href='${result.imageUrl}'>View Image</a></span>`;
            line += `</div>`;

            bigString += line;
        }

        document.querySelector("#status").innerHTML = "<p>Showing " + limitAmount + " results for '" + displayTerm + "'</i></p>";
    }
    else {
        // Limit is greater than amount of results, just show all results
        for (let i = 0; i < results.length; i++) {
            let result = results[i];

            let line = `<div class = 'result'>`;
            line += `<img src = '${result.imageUrl}' title = '${result.name}'/>`;
            line += `<span><p>${result.name}</p>`;
            line += `<p>Films: ${result.films}</p>`;
            line += `<p>Short Films: ${result.shortFilms}</p>`;
            line += `<p>TV Shows: ${result.tvShows}</p>`;
            line += `<p>Video Games: ${result.videoGames}</p>`;
            line += `<p>Park Attractions: ${result.parkAttractions}</p>`;
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