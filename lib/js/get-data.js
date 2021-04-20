//adapted from the cerner smart on fhir guide. updated to utalize client.js v2 library and FHIR R4

// helper function to process fhir resource to get the patient name.
function getPatientName(pt) {
  if (pt.name) {
    var names = pt.name.map(function(name) {
      return name.given.join(" ") + " " + name.family;
    });
    return names.join(" / ")
  } else {
    return "anonymous";
  }
}

// display the patient name gender and dob in the index page
function displayPatient(pt) {
  document.getElementById('patient_name').innerHTML = getPatientName(pt);
  document.getElementById('gender').innerHTML = pt.gender;
  document.getElementById('dob').innerHTML = pt.birthDate;
}

//function to display list of medications
function displayMedication(meds) {
  med_list.innerHTML += "<li> " + meds + "</li>";
}

function displayRisk(r){
  console.log(risk)
  document.getElementById('risk').innerHTML = r.toString();
}

//helper function to get quanity and unit from an observation resoruce.
function getQuantityValueAndUnit(ob) {
  if (typeof ob != 'undefined' &&
    typeof ob.valueQuantity != 'undefined' &&
    typeof ob.valueQuantity.value != 'undefined' &&
    typeof ob.valueQuantity.unit != 'undefined') {
    return Number(parseFloat((ob.valueQuantity.value)).toFixed(2)) + ' ' + ob.valueQuantity.unit;
  } else {
    return undefined;
  }
}

// helper function to get both systolic and diastolic bp
function getBloodPressureValue(BPObservations, typeOfPressure) {
  var formattedBPObservations = [];
  BPObservations.forEach(function(observation) {
    var BP = observation.component.find(function(component) {
      return component.code.coding.find(function(coding) {
        return coding.code == typeOfPressure;
      });
    });
    if (BP) {
      observation.valueQuantity = BP.valueQuantity;
      formattedBPObservations.push(observation);
    }
  });

  return getQuantityValueAndUnit(formattedBPObservations[0]);
}

function getBPValue(BPObservations, typeOfPressure) {
  var formattedBPObservations = [];
  BPObservations.forEach(function(observation) {
    var BP = observation.component.find(function(component) {
      return component.code.coding.find(function(coding) {
        return coding.code == typeOfPressure;
      });
    });
    if (BP) {
      observation.valueQuantity = BP.valueQuantity;
      formattedBPObservations.push(observation);
    }
  });
  if(formattedBPObservations.length > 0){
    return formattedBPObservations[0]['valueQuantity']['value']
  }
  return undefined
}

// create a patient object to initalize the patient
function defaultPatient() {
  return {
    height: {
      value: ''
    },
    weight: {
      value: ''
    },
    sys: {
      value: ''
    },
    dia: {
      value: ''
    },
    ldl: {
      value: ''
    },
    hdl: {
      value: ''
    },
    smoker:{
      value: false
    },
    diabetes:{
      value: false
    },
    note: 'No Annotation',
  };
}

//helper function to display the annotation on the index page
function displayAnnotation(annotation) {
  note.innerHTML = annotation;
}

//function to display the observation values you will need to update this
function displayObservation(obs) {
  hdl.innerHTML = obs.hdl;
  ldl.innerHTML = obs.ldl;
  sys.innerHTML = obs.sys;
  dia.innerHTML = obs.dia;
  height.innerHTML = obs.height;
  weight.innerHTML = obs.weight;
}

function calculateRisk(patient, sys, dia){
  var points = 0;
  var gender = document.getElementById('gender').innerHTML;
  var dob = document.getElementById('dob').innerHTML;
  var age = calculateAge(dob);
  var risk = 0;

  if(gender == 'male'){
    if(age <= 34) points = points - 1;
    else if(age <= 39) points = points;
    else if(age <= 44) points = points + 1;
    else if(age <= 49) points = points + 2;
    else if(age <= 54) points = points + 3;
    else if(age <= 59) points = points + 4;
    else if(age <= 64) points = points + 5;
    else if(age <= 69) points = points + 6;
    else points = points + 7;

    if(patient.ldl == undefined){}
    else if(patient.ldl < 100) points = points - 3;
    else if(patient.ldl <= 159){}
    else if(patient.ldl <= 190) points = points + 1;
    else points = points + 2;

    if(patient.hdl == undefined){}
    else if(patient.hdl < 35) points = points + 2;
    else if(patient.hdl <= 44) points = points + 1;
    else if(patient.hdl <= 59){}
    else points = points - 2;

    if(sys == undefined | dia == undefined){
      if(sys == undefined & dia == undefined){}
      else if(sys == undefined){
        if(dia <= 84){}
        else if(dia <= 89) points = points + 1;
        else if(dia <= 99) points = points + 2;
        else points = points + 3;
      }
      else if(dia == undefined){
        if(sys <= 129){}
        else if(dia <= 139) points = points + 1;
        else if(dia <= 159) points = points + 2;
        else points = points + 3;
      }
    }
    else if(sys <= 129 & dia <= 84){}
    else if(sys <= 139 & dia <= 89) points = points + 1;
    else if(sys <= 159 & dia <= 99) points = points + 2;
    else {points = points + 3;}

    if(patient.diabetes){
      points = points + 2;
    }
    if(patient.smoker){
      points = points + 2;
    }

    switch(points){
      case -3:
        risk = 1;
        break;
      case -2:
      case -1:
        risk = 2;
        break;
      case 0:
        risk = 3;
        break;
      case 1:
      case 2:
        risk = 4;
        break;
      case 3:
        risk = 6;
        break;
      case 4:
        risk = 7;
        break;
      case 5:
        risk = 9;
        break;
      case 6:
        risk = 11;
        break;
      case 7:
        risk = 14;
        break;
      case 8:
        risk = 18;
        break;
      case 9:
        risk = 22;
        break;
      case 10:
        risk = 27;
        break;
      case 11:
        risk = 33;
        break;
      case 12:
        risk = 40;
        break;
      case 13:
        risk = 47;
        break;
      default:
        risk = 56;
        break;
    }
  }
  else if(gender == 'female'){
    if(age <= 34) points = points - 9;
    else if(age <= 39) points = points - 4;
    else if(age <= 44) points = points;
    else if(age <= 49) points = points + 3;
    else if(age <= 54) points = points + 6;
    else if(age <= 59) points = points + 7;
    else points = points + 8;

    if(patient.ldl == undefined){}
    else if(patient.ldl < 100) points = points - 2;
    else if(patient.ldl <= 159){}
    else if(patient.ldl <= 190) points = points + 2;
    else points = points + 2;

    if(patient.hdl == undefined){}
    else if(patient.hdl < 35) points = points + 5;
    else if(patient.hdl <= 44) points = points + 2;
    else if(patient.hdl <= 49) points = points + 1;
    else if(patient.hdl <= 59){}
    else points = points - 2;

    if(sys == undefined | dia == undefined){
      if(sys == undefined & patient.dia == undefined){}
      else if(sys == undefined){
        if(dia < 80) points = points - 3;
        else if(dia <= 89){}
        else if(dia <= 99) points = points + 2;
        else points = points + 3;
      }
      else if(dia == undefined){
        if(sys < 120) points = points - 3;
        else if(dia <= 139){}
        else if(dia <= 159) points = points + 2;
        else points = points + 3;
      }
    }
    else if(sys < 120 & dia < 80) points = points - 3;
    else if(sys <= 139 & dia <= 89){}
    else if(sys <= 159 & dia <= 99) points = points + 2;
    else points = points + 3;

    if(patient.diabetes){
      points = points + 4;
    }
    if(patient.smoker){
      points = points + 2;
    }

    switch(points){
      case -2:
        risk = 1;
        break;
      case -1:
      case 0:
      case 1:
        risk = 2;
        break;
      case 2:
      case 3:
        risk = 3;
        break;
      case 4:
        risk = 4;
        break;
      case 5:
        risk = 5;
        break;
      case 6:
        risk = 6;
        break;
      case 7:
        risk = 7;
        break;
      case 8:
        risk = 8;
        break;
      case 9:
        risk = 9;
        break;
      case 10:
        risk = 11;
        break;
      case 11:
        risk = 13;
        break;
      case 12:
        risk = 15;
        break;
      case 13:
        risk = 17;
        break;
      case 14:
        risk = 20;
        break;
      case 15:
        risk = 24;
        break;
      case 16:
        risk = 27;
        break;
      default:
        risk = 32;
        break;
    }
  }

  return risk
}

function calculateAge(birthDate){
  var today = new Date()
  var birth = birthDate.split("-")
  var year = parseInt(birth[0])
  var month = parseInt(birth[1])
  var day = parseInt(birth[2])
  if(month >= (today.getMonth()+1) && day >= today.getDate()){
    var age = today.getFullYear() - year - 1
  }
  else{
    var age = today.getFullYear() - year
  }
  globalAge = age
  return age
}

//once fhir client is authorized then the following functions can be executed
FHIR.oauth2.ready().then(function(client) {

  // get patient object and then display its demographics info in the banner
  client.request(`Patient/${client.patient.id}`).then(
    function(patient) {
      displayPatient(patient);
      console.log(patient);
    }
  );

  // get observation resoruce values
  // you will need to update the below to retrive the weight and height values
  var query = new URLSearchParams();

  query.set("patient", client.patient.id);
  query.set("_count", 100);
  query.set("_sort", "-date");
  query.set("code", [
    'http://loinc.org|8462-4',
    'http://loinc.org|8480-6',
    'http://loinc.org|2085-9',
    'http://loinc.org|2089-1',
    'http://loinc.org|55284-4',
    'http://loinc.org|3141-9',
    'http://loinc.org|8302-2',
    'http://loinc.org|29463-7',
    'http://loinc.org|72166-2',
    'http://loinc.org|33248-6',
  ].join(","));

  client.request("Observation?" + query, {
    pageLimit: 0,
    flat: true
  }).then(
    function(ob) {

      // group all of the observation resoruces by type into their own
      var byCodes = client.byCodes(ob, 'code');
      var systolicbp = getBloodPressureValue(byCodes('55284-4'), '8480-6');
      var diastolicbp = getBloodPressureValue(byCodes('55284-4'), '8462-4');
      var sys = getBPValue(byCodes('55284-4'), '8480-6');
      var dia = getBPValue(byCodes('55284-4'), '8462-4');
      var hdl = byCodes('2085-9');
      var ldl = byCodes('2089-1');
      var height = byCodes('8302-2');
      var weight = byCodes('29463-7');
      var smoke = byCodes('72166-2');
      var diabetes = byCodes('33248-6');

      // create patient object
      var p = defaultPatient();

      // set patient value parameters to the data pulled from the observation resoruce
      if (typeof systolicbp != 'undefined') {
        p.sys = systolicbp;
      } else {
        p.sys = 'undefined'
      }

      if (typeof diastolicbp != 'undefined') {
        p.dia = diastolicbp;
      } else {
        p.dia = 'undefined'
      }

      p.hdl = getQuantityValueAndUnit(hdl[0]);
      p.ldl = getQuantityValueAndUnit(ldl[0]);
      p.height = getQuantityValueAndUnit(height[0]);
      p.weight = getQuantityValueAndUnit(weight[0]);
      console.log(smoke)
      if(smoke.length === 0){
        p.smoker = false;
      }
      else if(smoke[0]['valueCodeableConcept']['text'] != undefined){
        if(smoke[0]['valueCodeableConcept']['text'] == 'Never smoker' || smoke[0]['valueCodeableConcept']['text'] == 'Unknown if ever smoked'){
          p.smoker = false;
        }
        else{
          p.smoker = true;
        }
      }
      else{
        p.smoker = true;
      }
      if(diabetes.length === 0){
        p.diabetes = false;
      }
      else{
        p.diabetes = true;
      }
      risk = calculateRisk(p, sys, dia)
      displayRisk(risk)
      displayObservation(p)

    });
  

  //update function to take in text input from the app and add the note for the latest weight observation annotation
  //you should include text and the author can be set to anything of your choice. keep in mind that this data will
  // be posted to a public sandbox
  function addWeightAnnotation() {
    var annotation = document.getElementById('annotation').value;
    var date = new Date(Date.now());
    var dateString = date.toJSON();
    console.log(dateString)
    
    var data = {
      "resourceType": "Observation",
      "id": "147858b3-d1a6-420e-8e5e-e8da4c8a9cde12",
      "meta": {
        "versionId": "51",
        "lastUpdated": date,
        "tag": [
          {
            "system": "https://smarthealthit.org/tags",
            "code": "synthea-5-2019"
          }
        ]
      },
      "status": "final",
      "category": [
        {
          "coding": [
            {
              "system": "http://terminology.hl7.org/CodeSystem/observation-category",
              "code": "vital-signs",
              "display": "vital-signs"
            }
          ]
        }
      ],
      "code": {
        "coding": [
          {
            "system": "http://loinc.org",
            "code": "29463-7",
            "display": "Body Weight"
          }
        ],
        "text": "Body Weight"
      },
      "subject": {
        "reference": `Patient/${client.patient.id}`
      },
      "encounter": {
        "reference": "Encounter/4c32f3cf-1a2f-49ce-9a24-1efe633dc819"
      },
      "effectiveDateTime": "1971-10-17T15:20:06-04:00",
      "issued": "1971-10-17T15:20:06.629-04:00",
      "valueQuantity": {
        "value": 82.95673507990877,
        "unit": "kg",
        "system": "http://unitsofmeasure.org",
        "code": "kg"
      },
      "note":[{
        "authorString": "test author cong9",
        "time": dateString,
        "text": annotation,
      }]
    }
    client.create(data).then((value) => {
      console.log(value)
      displayAnnotation(value.note[0].text)
    })
  }
  //event listner when the add button is clicked to call the function that will add the note to the weight observation
  document.getElementById('add').addEventListener('click', addWeightAnnotation);


}).catch(console.error);
