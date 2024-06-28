$(document).ready(function () {
  // $("#provideFN").hide();
  // $("#provideEn").hide();
  // $("#provideCmp").hide();
  const storedValue = sessionStorage.getItem("isPreviouslyLoaded");
  if (storedValue) {
    const selectElement = document.getElementById("dropOptions");
    selectElement.value = 2;
  } else {
    sessionStorage.setItem("isPreviouslyLoaded", true);
  }
  // Définition de l'endpoint SPARQL
  var endpoint = "http://localhost:3030/food/query";
  var endpointU = "http://localhost:3030/food/update";
  /************** all foods in ascending order */
  var queryFoodASC = `
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX table: <http://www.semanticweb.org/furel/ontologies/2024/2/food#>
    SELECT DISTINCT ?nameOfFood ?imageUrl ?description ?uri WHERE {
      ?food rdf:type table:FoodDish;
           table:nameOfFood ?nameOfFood;
           table:uri ?uri;
           table:foodDescription ?description.
        ?food table:foodUrlImage ?imageUrl .
    } ORDER BY ASC(?nameOfFood)
        `;
  /************** all foods in descending order */
  var queryFoodDESC = `
   PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
   PREFIX table: <http://www.semanticweb.org/furel/ontologies/2024/2/food#>
   SELECT DISTINCT ?nameOfFood ?imageUrl ?description ?uri WHERE {
     ?food rdf:type table:FoodDish;
          table:nameOfFood ?nameOfFood;
          table:uri ?uri;
          table:foodDescription ?description.
          ?food table:foodUrlImage ?imageUrl .
   } ORDER BY DESC(?nameOfFood)
       `;

  var queryCSI = `
    PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
    PREFIX owl: <http://www.w3.org/2002/07/owl#>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX table: <http://www.semanticweb.org/furel/ontologies/2024/2/food#>
    SELECT DISTINCT ?class ?subclass ?instance 
    WHERE {
      { # Find all classes
        ?class rdf:type owl:Class .
        FILTER(?class != ?subclass)
        OPTIONAL {
          ?class rdfs:label ?className .  # Prefer rdfs:label for human-readable class names
        }
      } UNION { # Find all subclasses
        ?subclass rdfs:subClassOf ?class .
      } UNION { # Find all instances of classes
        ?instance rdf:type  ?class , owl:NamedIndividual.
        FILTER(?class != ?instance)
      }
    }
  `;

  // to get list of subclass of engredient
  var querySOE = `
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX table: <http://www.semanticweb.org/furel/ontologies/2024/2/food#>

    SELECT DISTINCT ?subClass WHERE {
      ?subClass rdfs:subClassOf table:FoodIngredient .
    }
  `;
  // to get list of subclass of component
  var querySOC = `
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX table: <http://www.semanticweb.org/furel/ontologies/2024/2/food#>

    SELECT DISTINCT ?subClass WHERE {
      ?subClass rdfs:subClassOf table:FoodComponent .
    }
  `;
  // get food details
  var queryFoodDetails = `
    PREFIX infer: <http://jena.hpl.hp.com/2003/GenericRuleReasoner>
    PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
    PREFIX owl: <http://www.w3.org/2002/07/owl#>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX table: <http://www.semanticweb.org/furel/ontologies/2024/2/food#>

    SELECT DISTINCT ?componentN ?engredientN
      WHERE {
        { # Find all classes
          ?food rdf:type table:FoodDish ;
                table:uri "${$("#food_uri").val()}"
          FILTER(?food != ?component)
        } UNION {
        ?food table:uri "${$("#food_uri").val()}" .
          ?food table:hasFoodComponent ?component .
      OPTIONAL {?component table:nameOfComponent ?componentN .}
        } UNION {
      ?food table:uri "${$("#food_uri").val()}" .
                  ?food table:hasFoodEngredient ?engredient .
      OPTIONAL {?engredient table:nameOfFood ?engredientN .}
        }
      }
  `

  // engredients
  getSubClasses(querySOE);
  // components
  getSubClassesC(querySOC);



  /* global function to get food */
  function getFoods(query) {
    $.ajax({
      url: endpoint,
      data: {
        query: query,
        format: "json",
      },
      success: function (data) {
        // Affichage des résultats
        var results = data.results.bindings;
        console.log("all foods ==> ", results);
        $(".result").html("");
        if (results.length == 0) {
          $(".result").append(`
        <div class="d-flex justify-content-center">
          <span><i>No data found !</i></span>
        </div>
      `);
        }

        for (var i = 0; i < results.length; i++) {
          var nameOfFood = results[i]?.nameOfFood.value;
          var imageUrl = results[i]?.imageUrl.value;
          var description = results[i]?.description.value;
          // var uri = results[i]?.uri.value;

          $(".result").append(`
                <div class="list-group">
                  <a
                  href="#"
                  class="list-group-item list-group-item-action flex-column align-items-start justify-content-center shadow p-3 mb-1 bg-white rounded"
                  >
                    <div class="d-flex w-100 justify-content-between">
                      <div>
                        <h4 class="mb-1">${nameOfFood}</h4>
                        <p class="mb-1" style="width: 90%;">${description}</p>
                      </div>
                      <div style="width: 100px;">
                        <img
                          width="100px"
                          height="100px"
                          style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;"
                          src="${imageUrl}"
                          class="rounded mx-auto d-block"
                          alt="${nameOfFood}"
                        />
                      </div>
                    </div>
                  </a>
                </div>
                `);
        }
      },
      error: function (err) {
        $(".result").append(`
            <div class="d-flex justify-content-center">
              <span><i>No data found !</i></span>
            </div>
          `);
      },
    });
  }

  /* get subclasses engredients */
  function getSubClasses(query) {
    $.ajax({
      url: endpoint,
      data: {
        query: query,
        format: "json",
      },
      success: function (data) {
        // Affichage des résultats
        var results = data.results.bindings;
        $(".selectEn").html("");
        for (var i = 0; i < results.length; i++) {
          var sc = results[i]?.subClass.value;
          var newValue = sc
            .trim()
            .replace(
              "http://www.semanticweb.org/furel/ontologies/2024/2/food#",
              ""
            );
          $("#selectEn").append(`
          <option value="${newValue}">${newValue}</option>
          `);
        }
      },
      error: function (err) {
        $(".result").append(`
            <div class="d-flex justify-content-center">
              <span><i>No data found !</i></span>
            </div>
          `);
      },
    });
  }
  /* get subclasses components */
  function getSubClassesC(query) {
    $.ajax({
      url: endpoint,
      data: {
        query: query,
        format: "json",
      },
      success: function (data) {
        // Affichage des résultats
        var results = data.results.bindings;
        $(".selectCmp").html("");
        for (var i = 0; i < results.length; i++) {
          var sc = results[i]?.subClass.value;
          var newValue = sc
            .trim()
            .replace(
              "http://www.semanticweb.org/furel/ontologies/2024/2/food#",
              ""
            );
          $("#selectCmp").append(`
            <option value="${newValue}">${newValue}</option>
            `);
        }
      },
      error: function (err) {
        $(".result").append(`
              <div class="d-flex justify-content-center">
                <span><i>No data found !</i></span>
              </div>
            `);
      },
    });
  }

  /* get classes, subclasses, ect */
  function getClasses(query) {
    $.ajax({
      url: endpoint,
      data: {
        query: query,
        format: "json",
      },
      success: function (data) {
        // Affichage des résultats
        var results = data.results.bindings;
        var newResults = results?.filter(
          (r) =>
            r?.class?.value != "http://www.w3.org/2002/07/owl#NamedIndividual"
        );
        // console.log("getClasses ==> ", results);
        // console.log("newResults ==> ", newResults);
        $(".result").html("");

        if (newResults.length == 0) {
          $(".result").append(`
          <div class="d-flex justify-content-center">
            <span><i>No data found !</i></span>
          </div>
        `);
        }

        const tableHtml = `
          <table class="table table-striped table-hover">
            <thead>
              <tr>
                <th scope="col">#</th>
                <th scope="col">Class</th>
                <th scope="col">SubClass (if any)</th>
                <th scope="col">Instance (if any)</th>
              </tr>
            </thead>
            <tbody>
            </tbody>
          </table>
        `;

        $(".result").append(tableHtml); // Add the table structure

        const tbody = $(".result tbody");
        for (var i = 0; i < newResults.length; i++) {
          var classe = newResults[i]?.class.value;
          var subClass =
            newResults[i]?.subclass == undefined
              ? ""
              : newResults[i]?.subclass?.value;
          var instance =
            newResults[i]?.instance == undefined
              ? ""
              : newResults[i]?.instance?.value;
          const tableRow = `
            <tr>
              <th scope="row">${i + 1}</th>
              <td>${classe}</td>
              <td>${subClass}</td>
              <td>${instance}</td>
            </tr>
          `;

          tbody.append(tableRow);
        }
      },
      error: function (err) {
        $(".result").append(`
              <div class="d-flex justify-content-center">
                <span><i>No data found !</i></span>
              </div>
            `);
      },
    });
  }

  $("#dropOptions").change(function () {
    var selectedOption = $(this).val();
    // console.log("selectedOption", selectedOption);
    if (selectedOption == "") {
      getFoods(queryFoodASC);
    }
    /* Excecute request to fecth all clases, subclasses and instances */
    if (selectedOption == 1) {
      getClasses(queryCSI);
    }
    /* Excecute request to fecth all foods in ascending */
    if (selectedOption == 2) {
      getFoods(queryFoodASC);
    }

    /* Excecute request to fecth all foods in descending */
    if (selectedOption == 3) {
      getFoods(queryFoodDESC);
    }
  });
  getFoods(queryFoodASC);

  /* Search function */
  $("#inputSeacrh").on("keyup", function () {
    var value = $(this).val().toLowerCase();
    $(".result a").filter(function () {
      $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1);
    });
  });

  // End point
  // Initialize counters and arrays for variables

  /*** check number of variables in the query */
  function countAndExtractVariables(sparqlQuery) {
    let variableCount = 0;
    const variableNames = [];
    // Split the query into lines
    const queryLines = sparqlQuery.split("\n");

    // Iterate through each line
    for (const line of queryLines) {
      // Check if the line contains a variable declaration
      if (line.trim().startsWith("SELECT")) {
        for (var i = 0; i < line.trim().split(" ").length; i++) {
          if (line.trim().split(" ")[i].startsWith("?")) {
            var variableName = line.trim().split(" ")[i]?.replace("?", "");

            // Extract the variable name

            // Increment the variable counter
            variableCount++;

            // Add the variable name to the array
            variableNames.push(variableName);
          }
        }
      }
    }

    // Return an object with variable count and names
    return {
      variableCount: variableCount,
      variableNames: variableNames,
    };
  }

  $("#submitQuery").on("click", function () {
    var query = document.getElementById("query");

    $.ajax({
      url: endpoint,
      data: {
        query: query.value,
        format: "json",
      },
      success: function (data) {
        const variablesInfo = countAndExtractVariables(query.value);
        // console.log("variablesInfo", variablesInfo.variableCount);
        getSpaqlResult(data, variablesInfo);
      },
      error: function (err) {
        $(".resultSparql").append(`
            <div class="d-flex justify-content-center">
              <span><i>No data found !</i></span>
            </div>
          `);
      },
    });
    // console.log("Number of variables:", variablesInfo.variableCount); // Output: Number of variables: 3
    // console.log("Variable names:", variablesInfo.variableNames);
  });

  // Result of endpoint
  function getSpaqlResult(data, variablesInfo) {
    // Affichage des résultats
    var results = data.results.bindings;
    // console.log("data ==> ", results)
    // console.log("variablesInfo ==> ", variablesInfo.variableNames)
    // console.log("getClasses ==> ", results);
    // console.log("newResults ==> ", newResults);
    $(".resultSparql").html("");

    if (results.length == 0) {
      $(".resultSparql").append(`
        <div class="d-flex justify-content-center">
          <span><i>No data found !</i></span>
        </div>
      `);
    } else {
      const tableHtml = `
          <table class="table table-striped table-hover">
            <thead>
              <tr>
                <th scope="col">#</th>
              </tr>
            </thead>
            <tbody>
            </tbody>
          </table>
        `;

      $(".resultSparql").append(tableHtml); // Add the table structure

      const tr = $(".resultSparql tr");
      for (var i = 0; i < variablesInfo.variableCount; i++) {
        const trContent = `
        <th scope="col">${variablesInfo?.variableNames[i]}</th>
        `;
        tr.append(trContent);
      }

      const tbody = $(".resultSparql tbody");
      for (var i = 0; i < results.length; i++) {
        var food = results[i]?.name?.value;
        var engredient = results[i]?.engredientN?.value;
        var component = results[i]?.componentN?.value;
        console.log("engredient", engredient)
        const tableRow = `
            <tr>
              <th scope="row">${i + 1}</th>
              <td>${food}</td>
              <td>${component ?? ''}</td>
              <td>${engredient ?? ''}</td>
            </tr>
          `;

        tbody.append(tableRow);
      }
    }
  }

  /** New food section */
  // get subclass of engredient querySOE
  var engredientListToSave = [];
  var componentListToSave = [];
  function putElement(list, index) {
    if (list.length != 0) {
      if (index == 1) {
        for (var i = 0; i < list.length; i++) {
          $("#ingredients").append(`
          <li class="col">${list[i]?.name}</li>
        `);
        }
      } else {
        for (var i = 0; i < list.length; i++) {
          $("#components").append(`
          <li class="col">${list[i]?.name}</li>
        `);
        }
      }
    }
  }
  // btn save engredient
  $("#saveEng").on("click", function () {
    if (engredientListToSave.length == 0) {
      $("#provideEn").append("");
    }
    var engredientList = [];
    var engName = $("#engredientName");
    if (engName.val() != "") {
      engredientList.push({
        name: engName.val(),
        type:
          $("#selectEn").val() == "" || $("#selectEn").val() == "other"
            ? "FoodIngredient"
            : $("#selectEn").val(),
      });

      engredientListToSave.push({
        name: engName.val(),
        type:
          $("#selectEn").val() == "" || $("#selectEn").val() == "other"
            ? "FoodIngredient"
            : $("#selectEn").val(),
      });

      engName.val("");
      putElement(engredientList, 1);
    }

    // console.log("engredientListToSave ==", engredientListToSave)
  });

  // btn save component
  $("#saveCmp").on("click", function () {
    if (componentListToSave.length != 0) {
      $("#provideCmp").append("");
    }
    var componentList = [];
    var cmpName = $("#componentName");

    if (cmpName.val() != "") {
      componentList.push({
        name: cmpName.val(),
        type:
          $("#selectCmp").val() == "" || $("#selectCmp").val() == "other"
            ? "FoodComponent"
            : $("#selectCmp").val(),
      });

      componentListToSave.push({
        name: cmpName.val(),
        type:
          $("#selectCmp").val() == "" || $("#selectCmp").val() == "other"
            ? "FoodComponent"
            : $("#selectCmp").val(),
      });

      cmpName.val("");
      putElement(componentList, 2);
    }
  });

  // saveData
  $("#saveData").on("click", function () {
    var foodName = $("#foodName").val();
    var foodDescription = $("#foodDescription").val();
    if (foodName == "") {
      $("#provideFN").append("Please provide the name of food !");
      return;
    }
    if (engredientListToSave.length == 0) {
      $("#provideEn").append("Please provide at least one ingredient !");
      return;
    }
    if (componentListToSave.length == 0) {
      $("#provideCmp").append("Please provide at last one component !");
      $("#provideFN").hide();
      $("#provideEn").hide();
      return;
    }
    // foodName = foodName.slice(0, 3)
    // console.log("foodName ==> ", foodName)
    var newFoodName = foodName.trim();
    newFoodName = newFoodName.replace(/ /g, "_");
    var foodSparql = `
    PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
    PREFIX owl: <http://www.w3.org/2002/07/owl#>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX table: <http://www.semanticweb.org/furel/ontologies/2024/2/food#>

    INSERT DATA {
      table:${newFoodName}  rdf:type  table:FoodDish , owl:NamedIndividual;
        table:uri "http://www.semanticweb.org/furel/ontologies/2024/2/food#${newFoodName}";
        table:nameOfFood	"${foodName}";
        table:foodDescription "${foodDescription}";
        table:foodUrlImage "https://github.com/jiofidelus/tsotsa/blob/main/TSOTSAImg_dataset/Rwanda/${foodName}.jpeg?raw=true";
        table:isFrom table:Rwanda .
        table:Rwanda rdf:type  table:FoodPlace , owl:NamedIndividual;	
	      table:nameOfPlace  "Rwanda" .
    `;

    // Build SPARQL INSERT for ingredients and components using loops and template literals (assuming engredientListToSave and componentListToSave are arrays of objects with name and type properties)
    let ingredientSparql = "";
    let componentSparql = "";

    for (const ingredient of engredientListToSave) {
      var ingredientI = ingredient.name.trim();
      ingredientI = ingredientI.replace(/ /g, "_");
      ingredientSparql += `
        table:${ingredientI} rdf:type table:${ingredient.type} , owl:NamedIndividual; table:nameOfFood "${ingredient.name}" .
        table:${newFoodName} table:hasFoodEngredient table:${ingredientI} .
      `;
    }

    for (const component of componentListToSave) {
      var componentI = component.name.trim();
      componentI = componentI.replace(/ /g, "_");
      componentSparql += `
        table:${componentI} rdf:type table:${component.type} , owl:NamedIndividual; table:nameOfComponent "${component.name}" .
        table:${newFoodName} table:hasFoodComponent table:${componentI} .
      `;
    }

    // Combine all SPARQL parts
    let fullSparql = `${foodSparql} ${ingredientSparql} ${componentSparql} }`;

    console.log("query \n", fullSparql);

    // Verification de l'exitence du plat
    var query = `
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX table: <http://www.semanticweb.org/furel/ontologies/2024/2/food#>
    ASK WHERE {
      ?food rdf:type table:FoodDish;
          table:uri "http://www.semanticweb.org/furel/ontologies/2024/2/food#${newFoodName}" .
    }
    `;

    $.ajax({
      url: endpoint,
      data: {
        query: query,
        format: "json",
      },
      success: function (data) {
        if (!data.boolean) {
          console.log("data.boolean exist");
          $.ajax({
            url: endpointU,
            type: "POST",
            data: {
              update: fullSparql,
              format: "json",
            },
            success: function (data) {
              getFoods(queryFoodASC);
              fullSparql = "";
              console.log("Success", fullSparql);
            },
            error: function (err) {
              console.log("Erro", err);
            },
          });
        } else {
          alert(
            "The name of food has been already used ! Please use other name."
          );
          fullSparql = "";
        }
      },
      error: function (err) {
        fullSparql = "";
        console.log("error verifying");
      },
    });
    // console.log("engredientListToSave ", engredientListToSave);
    // console.log("query \n", fullSparql);
  });
});
