$(document).ready(() => {
  if ($(".hero").length) {
    // Detect details page by .hero existence
    const id = localStorage.getItem("selectedPropertyId");
    const currentProps = JSON.parse(localStorage.getItem("currentProps"));
    console.log(currentProps);
    var clickedProp;
    console.log(id);
    if (id && typeof currentProps !== "undefined") {
      clickedProp = currentProps.find((prop) => prop.id == id);
      if (clickedProp) {
        $(".hero").attr(
          "style",
          `background-image: url('${clickedProp.photos[0].url}')`
        );
      }
    }
  }


  $(".property-title").html(`${clickedProp.city}, ${clickedProp.country}`);
  $(".property-price").html(`$ ${(clickedProp.price).toLocaleString()}`);
  $("#sqm").html(`${clickedProp.space.substring(0, clickedProp.space.indexOf(" "))}m<sup>2</sup>`);
  $("#bdr").html(`${clickedProp.bedrooms}`);
  $("#shwr").html(`${clickedProp.bathrooms}`);
  $("#pkng").html(`${clickedProp.parking_count}`)

  $(".description").html(`${clickedProp.description}`)

  for(var i = 0; i < 6; i++){
    $(`#img-${i + 1}`).attr("src", `${clickedProp.photos[i % 5].url}`);
    console.log("changing img " + (i + 1) + 'now');
  }

});
