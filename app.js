const express = require("express");
const path = require("path");

const sqlite3 = require("sqlite3");
const { open } = require("sqlite");

const app = express();
app.use(express.json());

const dbpath = path.join(__dirname, "covid19India.db");
let db = null;

const intializerDBandSERVER = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    });
    app.listen(3003, () => {
      console.log("Sever is ready http://localhost/:3000");
    });
  } catch (e) {
    console.log(`Error Message ${e.message}`);
    process.exit(1);
  }
};

intializerDBandSERVER();

const convertStateDbObjectToResponseObject = (dbObject) => {
  return {
    stateId: dbObject.state_id,
    stateName: dbObject.state_name,
    population: dbObject.population,
  };
};

const convertDistrictDbObjectToResponseObject = (dbObject) => {
  return {
    districtId: dbObject.district_id,
    districtName: dbObject.district_name,
    stateId: dbObject.state_id,
    cases: dbObject.cases,
    cured: dbObject.cured,
    active: dbObject.active,
    deaths: dbObject.deaths,
  };
};

app.get("/states/", async (request, response) => {
  const getallQuery = `
    SELECT 
    *
    FROM
    state;
    `;
  const dbresponse = await db.all(getallQuery);
  response.send(
    dbresponse.map((eachChar) => {
      convertStateDbObjectToResponseObject(eachChar);
    })
  );
});

app.get("/states/:stateId/", async (request, response) => {
  const { stateId } = request.params;
  const getQuery = `
    SELECT 
    *
    FROM
    state
    WHERE
    state_id = ${stateId};
    `;
  const dbresponseget = await db.get(getQuery);
  response.send(convertStateDbObjectToResponseObject(dbresponseget));
});

app.post("/districts/", async (request, response) => {
  const { districtName, stateId, cases, cured, active, deaths } = request.body;
  const postQuery = `
      INSERT INTO
         district(district_name,state_id,cases,cured,active,deaths)
      VALUES
          ('${districtName}',${stateId},${cases},${cured},${active},${deaths})
      `;
  const postresponse = await db.run(postQuery);
  response.send("District Successfully Added");
});

app.get("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const getQuerydistrict = `
    SELECT 
    *
    FROM
    district
    WHERE
    district_id = ${districtId};
    `;
  const dbresponsegetdistrict = await db.get(getQuerydistrict);
  response.send(convertDistrictDbObjectToResponseObject(dbresponsegetdistrict));
});

app.delete("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const deleteQuerydistrict = `
    SELECT 
    *
    FROM
    district
    WHERE
    district_id = ${districtId};
    `;
  const dbresponsedeletedistrict = await db.run(deleteQuerydistrict);
  response.send("District Removed");
});

app.put("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const { districtName, stateId, cases, cured, active, deaths } = request.body;
  const updatedistrictQuesry = `
  UPDATE 
  district
  SET
  district_name ='${districtName}',
  state_id = '${stateId}',
  cases = '${cases}',
  cured = '${cured}',
  active = '${active}',
  deaths = '${deaths}'
  WHERE
  district_id=${districtId};`;
  const Updatedistrict = db.run(updatedistrictQuesry);
  response.send("District Details Updated");
});

app.get("/states/:stateId/stats/", async (request, response) => {
  const { stateId } = request.params;
  const getDirectorystatsQuery = `
    SELECT
      SUM(cases),
      SUM(cured),
      SUM(active),
      SUM(deaths),
    FROM
      district
    WHERE
      state_id=${stateId};`;
  const stats = await db.get(getDirectorystatsQuery);
  console.log(stats);
  response.send({
    totalCases: stats["SUM(cases)"],
    totalCured: stats["SUM(cured"],
    totalActive: stats["SUM(active)"],
    totalDeaths: stats["SUM(deaths"],
  });
});

app.get("/districts/:districtId/details/", async (request, response) => {
  const { districtId } = request.params;
  const getDistrictIdQuery = `
SELECT 
state_id 
FROM 
district
WHERE 
district_id = ${districtId};`;
  const getDistrictIdQueryResponse = await database.get(getDistrictIdQuery);

  const getStateNameQuery = `
SELECT
state_name AS stateName 
FROM state
WHERE state_id = ${getDistrictIdQueryResponse.state_id};`;
  const getStateNameQueryResponse = await database.get(getStateNameQuery);
  response.send(`stateName: '${getStateNameQueryResponse}'`);
});

module.exports = app;
