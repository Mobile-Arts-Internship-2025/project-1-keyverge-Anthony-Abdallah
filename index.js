const titles = document.querySelectorAll('.big-title');

let positions = ['pos0', 'pos1', 'pos2'];

function applyPositions() {
  titles.forEach((title, i) => {
    title.classList.remove('pos0', 'pos1', 'pos2');
    title.classList.add(positions[i]);
  });
}

function cyclePositions() {
  positions.push(positions.shift());
  applyPositions();
}

applyPositions();

setInterval(cyclePositions, 2000);


$(".pause-play").click(function() {
    const video =  $(".video-nav > video")[0];
    if(video.paused){
        video.play();
    } else {
        video.pause();
    }
});

const myDiv = $(
  "<div class='d-flex justify-content-between w-100'><div class=' d-flex flex-column justify-content-center' id='read-aloud'><p class='michroma-regular'>Read Aloud</p></div><div class=' d-flex flex-column justify-content-center' id='increase-size'><p class='michroma-regular'>Increase Size</p></div><div class='d-flex flex-column justify-content-center' id='decrease-size'><p class='michroma-regular'>Decrease Size</p></div></div>"
).hide();

let expandedOptions = false;

$(".options").click(function () {
  if (!expandedOptions) {
    expandedOptions = true;
    myDiv.insertBefore(".settings");
    myDiv.fadeIn(500);
    $(".options").animate(
      {
        width: "30vw",
        "border-radius": "1.2rem",
      },
      500
    );
  } else {
    myDiv.fadeOut(500);
    myDiv.remove();
    $(".options").animate(
      {
        width: "15rem",
        "border-radius": "10%",
      },
      200,
      "linear"
    );

    $(".options").animate(
      {
        width: "5rem",
        "border-radius": "50%",
      },
      200,
      "linear"
    );
    expandedOptions = false;
  }
});

$(document).on("click", "#read-aloud", function () {
  speechSynthesis.cancel(); // Stop current speech

  const text = $("body").text().trim();
  if (text.length === 0) {
    alert("No text to read!");
    return;
  }

  const utterance = new SpeechSynthesisUtterance(text);
  speechSynthesis.speak(utterance);
});


$(document).on("click", "#increase-size", function() {
  let fontSize = parseFloat($(":root").css("font-size")); 
  $(":root").css("font-size", (fontSize * 1.1) + "px"); 
});


$(document).on("click", "#decrease-size", function() {
  let fontSize = parseFloat($(":root").css("font-size")); 
  $(":root").css("font-size", (fontSize * 0.9) + "px"); 
});

$(document).on("click", ".play-testimonial2", function () {
  const video = $("#testimonial2 > video")[0];
  $(".play-testimonial2").hide();
  video.play();
  video.onended = function() {
    $(".play-testimonial2").show();
  }
});

var rentProperties, saleProperties, currentProps;

async function fetchData() {
  const url = "https://mohammad-elfar-testing.s3.eu-central-1.amazonaws.com/properties.json";

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Fetch failed: ${response.status}`);
    }

    const json = await response.json();
    const data = json.properties;

    rentProperties = data.filter((property) => property.is_for_rent);
    saleProperties = data.filter((property) => property.is_for_sale);

    currentProps = updateView();

    const featuredProperties = data.filter((property) => property.is_featured);

    // ❗ Remove old slides
    $(".top-props").empty();

    // Create and append new slides
    const featuredSlides = await Promise.all(
      featuredProperties.map((property) => createSlide(property))
    );
    $(".top-props").append(featuredSlides);


    // ❗ Update Swiper after modifying slides
    if (typeof swiper !== "undefined") {
      swiper.update();
    }

  } catch (error) {
    console.error("Error fetching or processing data:", error);
  }
}

function updateView(data) {
  $(".view-listings").empty();

  if(data === undefined){
    const currentView = $(".active").html();
    if (currentView === "Buy") {
      let saleCards = saleProperties.map((property) =>
        createListing(property)
      );
      saleCards.forEach((card) => $(".view-listings").append(card));

      console.log("returning " + saleProperties);
      return saleProperties;
    } else if (currentView === "Rent") {
      let rentCards = rentProperties.map((property) =>
        createListing(property)
      );
      rentCards.forEach((card) => $(".view-listings").append(card));

      console.log(rentProperties);
      return rentProperties;
    }
  } else {
    let cards = data.map((property) => createListing(property));
    cards.forEach((card => $(".view-listings").append(card)));
    return data;
  }
  
}

$(document).ready(() => {
  fetchData();

  $(".tabs").click(() => {
    currentProps = updateView();
  });

  $(document).on("click", "#sort-panel #apply", () => {
    const sortLogic = $("#focused-choice").html();
    console.log("here " + currentProps);
    if (sortLogic === "Price (low to high)") {
      updateView([...currentProps].sort((a, b) => a.price - b.price));
    } 
      else if (sortLogic === "Price (high to low)") {
        updateView([...currentProps].sort((a,b) => b.price - a.price));
    } else if (sortLogic === "Newest listings first") {
        updateView([...currentProps].sort((a,b) => a.id - b.id));
    } else if (sortLogic === "Oldest listings first") {
        updateView([...currentProps].sort((a,b) => b.id - a.id));
    } else {
      alert("Select a valid sorting choice.");
    }
  });

  $(document).on("click", "#filter-panel #apply", () => {
    
    const selectedPrice = $('input[name="price"]:checked').val();
    const selectedBedrooms = $('input[name="bedrooms"]:checked').val();
    const areaRange = $("#area-range").val();

    updateView([...currentProps].filter((prop) => {
      return validatePrice(prop, selectedPrice) && validateBedrooms(prop, selectedBedrooms) && validateArea(prop, areaRange); 
    }));
  });
  
  //var searchedProps = currentProps;

  $('#search').on('input', function() {
    const value = $(this).val();
    if(value === ""){
      updateView();
    }

    updateView([...currentProps].filter(prop => 
      prop.country.toLowerCase().includes(value) || prop.city.toLowerCase().includes(value)));
  
  });


  $(document).on("click", ".img-details", function(){
    const id = $(this).attr("id");
    localStorage.setItem('selectedPropertyId', id);
    localStorage.setItem('currentProps', JSON.stringify(currentProps));
    window.location.href = "property-details.html";
  });


});

function validatePrice(property, number){
  if(number == 1){
    return (property.price <= 150000);
  } 

  if(number == 2){
    return (150000 < property.price && property.price <= 200000);
  }

  if(number == 3){
    return (property.price > 200000);
  }

  return true;
}

function validateBedrooms(property, number){
  if(number == 1){
    return (property.bedrooms <= 2);
  }

  if(number == 2){
    return (2 < property.bedrooms && property.bedrooms <= 4);
  }

  if(number == 3){
    return (property.bedrooms > 4);
  }

  return true;
}

function validateArea(property, area){
  return parseInt(property.space.substring(0, property.space.indexOf(" "))) <= area;
}

function createListing(property){
  return (
  `<div class="col-lg-4">
                <div class="img-details" id="${property.id}">
                    <div class="prop-container">
                        <img src="${property.photos[0].url}" alt="${property.city} property">
                    </div>
    
                    <div class="prop-details d-flex justify-content-between w-100">
                        <div class="d-flex w-100 justify-content-center">
                            <div class="d-flex flex-column justify-content-center">
                                <img src="./project-1-keyverge-Anthony-Abdallah/size.svg" alt="">
                            </div>
                            <p>${property.space.substring(0, property.space.indexOf(" "))}m<sup>2</sup></p>
                        </div>
    
                        <div class="vr"></div>
    
                        <div class="d-flex w-100 justify-content-center">
                            <div class="d-flex flex-column justify-content-center">
                                <img src="./project-1-keyverge-Anthony-Abdallah/shower.svg" alt="">
                            </div>
                            <p>${property.bathrooms}</p>
                        </div>
    
                        <div class="vr"></div>
    
                        <div class="d-flex w-100 justify-content-center">
                            <div class="d-flex flex-column justify-content-center">
                                <img src="./project-1-keyverge-Anthony-Abdallah/bedroom.svg" alt="">
                            </div>
                            <p>${property.bedrooms}</p>
                        </div>
    
                        <div class="vr"></div>
    
                        <div class="d-flex w-100 justify-content-center">
                            <div class="d-flex flex-column justify-content-center">
                                <img src="./project-1-keyverge-Anthony-Abdallah/parking.svg" alt="">
                            </div>
                            <p>${property.parking_count}</p>
                        </div>
    
                    </div>
                </div>
    
    
                <h2 class="location">
                    ${property.city}, ${property.country}
                </h2>
    
                <h3 class="price">
                      $ ${property.price.toLocaleString()}
                </h3>
            </div>`);
}



async function getCountryCodeAndFlag(countryName) {
  try {
    // Fetch country data by name
    const response = await fetch(`https://restcountries.com/v3.1/name/${encodeURIComponent(countryName)}`);
    if (!response.ok) throw new Error("Country not found");

    const data = await response.json();

    // Extract 2-letter country code (ISO 3166-1 alpha-2)
    const code = data[0].cca2.toLowerCase();

    // Build SVG flag URL from code (using flagcdn.com)
    const flagUrl = `https://flagcdn.com/w320/${code}.png`; // Using PNG for better browser support, change to `${code}.svg` if you want SVG

    return flagUrl;

  } catch (error) {
      console.error(error);
    return null;
  }
}


async function createSlide(property){
  const imgUrl = await getCountryCodeAndFlag(property.country);

  return `<div class="swiper-slide" style="height: 65vh; background-image: url(${property.photos[0].url}); background-size: cover;">
                    <div class="d-flex justify-content-center">
                        <div class="properties-info d-flex flex-column justify-content-between">
                            <div class="characteristics d-flex">
                                <div class="d-flex ms-auto">
                                    <div class="d-flex white-box">
                                        <div class="d-flex flex-column justify-content-center">
                                            <img id="size" src="./project-1-keyverge-Anthony-Abdallah/size.svg" alt="size icon">
                                        </div>
                                        <p>${property.space.substring(0, property.space.indexOf(" "))}m<sup>2</sup></p>
                                    </div>
                                    <div class="d-flex white-box">
                                        <div class="d-flex flex-column justify-content-center">
                                            <img id="shower" src="./project-1-keyverge-Anthony-Abdallah/shower.svg"
                                                alt="bathroom icon">
        
                                        </div>
                                        <p>${property.bathrooms}</p>
                                    </div>
                                    <div class="d-flex white-box">
                                        <div class="d-flex flex-column justify-content-center">
                                            <img id="bedroom" src="./project-1-keyverge-Anthony-Abdallah/bedroom.svg"
                                                alt="bedroom icon">
        
                                        </div>
                                        <p>${property.bedrooms}</p>
                                    </div>
                                </div>
                            </div>
        
                            <div class="bottom-properties">
                                <div class="d-flex justify-content-start" id="hex-spain">
                                    <img src="${imgUrl}" alt="${property.country}" style="width: 100%;">
                                </div>
        
                                <div class="location-price d-flex justify-content-between">
                                    <div class="d-flex">
                                        <div class="d-flex flex-column justify-content-center">
                                            <h2 class="michroma-regular" id="location"> ${property.country}, ${property.city}</h2>
                                        </div>
        
                                        <div class="d-flex flex-column justify-content-center">
                                            <img id="location-arrow"
                                                src="./project-1-keyverge-Anthony-Abdallah/arrow-explore.svg"
                                                alt="explore arrow">
                                        </div>
        
                                    </div>
        
                                    <div class="d-flex flex-column justify-content-center">
                                        <h2 class="michroma-regular" id="price">$${property.price.toLocaleString()}</h2>
                                    </div>
        
        
                                </div>
                            </div>
        
        
                        </div>
                    </div>
        
                </div>`
}


$("#sort").click(() => {
  if ($(".right-panel").length === 0) {
    const panel = $(`
      <div class='right-panel container' id='sort-panel' style='position:fixed; top:0; right:-30vw; height:100%; width:30vw; background:white; box-shadow:-4px 0 12px rgba(0,0,0,0.2); z-index:2000;'>
        <div class='row'>
          <div class='col-9 d-flex flex-column justify-content-center'>
            <h2>Sort by</h2>
          </div>
          <img id='cancel' class='col-2' height='40' width='40' src='./project-1-keyverge-Anthony-Abdallah/cancel.svg'/>
        </div>
        <div class='row d-flex flex-column justify-content-between' style='height: 80%'>
          <div>
            <h3 class='col-12 choice my-5'>Price (low to high)</h3>
            <h3 class='col-12 choice my-5'>Price (high to low)</h3>
            <h3 class='col-12 choice my-5'>Newest listings first</h3>
            <h3 class='col-12 choice my-5'>Oldest listings first</h3>
          </div>

          <button id='apply'>APPLY</button>
        </div>
      </div>
    `);

    $("body").append(panel);
    panel.animate({ right: 0 }, 300); // Animate into view
  }
});

$("#filter").click(() => {
  if ($(".right-panel").length === 0) {
    const panel = $(`
      <div class='right-panel container' id='filter-panel' style='position:fixed; top:0; right:-30vw; height:100%; width:30vw; background:white; box-shadow:-4px 0 12px rgba(0,0,0,0.2); z-index:2000;'>
        <div class='row'>
          <div class='col-9 d-flex flex-column justify-content-center'>
            <h2>Filter by</h2>
          </div>
          <img id='cancel' class='col-2' height='40' width='40' src='./project-1-keyverge-Anthony-Abdallah/cancel.svg'/>
        </div>
        <div class='row d-flex flex-column justify-content-between' style='height: 80%'>
          <div class="row" style="height: 60%">
            <h2 id='gold-title'>Price Range</h2>
            <div class="my-5 w-100 form-group">
              <label><input type="radio" name="price" value="1">Up to $ 150,000</label><br>
              <label><input type="radio" name="price" value="2">$ 150,000 - $200,000</label><br>
              <label><input type="radio" name="price" value="3">Above $ 200,000</label>
            </div>

            <h2 id='gold-title'># of Bedrooms</h2>
            <div class="my-5 w-100 form-group">
              <label><input type="radio" name="bedrooms" value="1">Up to 2</label><br>
              <label><input type="radio" name="bedrooms" value="2">Between 2 and 4</label><br>
              <label><input type="radio" name="bedrooms" value="3">Above 4</label>
            </div>

            <h2 id='gold-title'>Area Size</h2>
            <input class="my-5 w-100" type="range" id="area-range" min="0" max="500" step="10" value="0">
            <div class='d-flex justify-content-between'>
              <h2>0m<sup>2</sup>
              <h2>500m<sup>2</sup>
            </div>    

          </div>
          

          <button class="m-2" id='apply'>APPLY</button>
        </div>
      </div>
    `);

    $("body").append(panel);
    panel.animate({ right: 0 }, 300); // Animate into view
  }
});

$(document).on("click", "#cancel", () => {
  $(".right-panel").animate({right: "-30vw"}, 300);
  $(".right-panel").remove();
});

$(document).on("click", ".choice", function() {
  $(".choice").removeAttr("id");
  $(this).attr("id", "focused-choice");
});

