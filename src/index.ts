import db from "./db";
import { readFileSync } from "node:fs";
import * as http from "node:http";
import { faker } from "@faker-js/faker";
import { Patient, Group } from "./Models";

http
  .createServer(async function (request, res) {
    console.info(
      `${request.method}: http://${request.headers.host}${request.url}`
    );

    const url = new URL(
      request.url as string,
      `http://${request.headers.host}`
    );

    const response = {
      json: (json: any) => {
        res.write(JSON.stringify(json));
        return res.end();
      },

      text: (text: string) => {
        res.write(text);
        return res.end();
      },

      html: (path: string) => {
        const buffer = readFileSync(`./public/${path}`);
        const fileContent = buffer.toString();

        return response.text(fileContent);
      },
    };
    //
    switch (url.pathname) {
      case "/":
        return response.html("index.html");
      case "/check":
        const testRecords = [];

        for await (const res of asyncInsert(3)) {
          testRecords.push(res);
        }

        const testGroups = [];

        for await (const res of asyncInsertGroup(3)) {
          testGroups.push(res);
        }

        // @ts-ignore
        await testRecords[0].addGroups(testGroups);

        return response.json({
          db: {
            connection: await checkDatabaseConnection(),
            queries: [
              // @ts-ignore
              await testRecords[0].getGroups(),
              await testDatabaseQuery(
                Patient.findOne({
                  where: {
                    document: {
                      id: testRecords[0].document.id,
                    },
                  },
                  include: "Groups",
                })
              ),
              await testDatabaseQuery(
                Group.findOne({
                  where: {
                    document: {
                      id: testGroups[0].document.id,
                    },
                  },
                  include: "Patients",
                })
              ),
            ],
          },
        });
      case "/sync":
        return response.json({
          sync: await db
            .sync({ force: true })
            .then(() => true)
            .catch(() => false),
        });
      case "/seed":
        const limit = parseInt(url.searchParams.get("limit") ?? "5000");
        const timer = new Timer();

        const results = [];

        for await (const res of asyncInsert(limit)) {
          results.push(res.id);
        }

        return response.json({ created: results, totalTime: timer.stop() });
      default:
        return response.text("Kosio");
    }
  })
  .listen(9020);

async function* asyncInsert(limit: number) {
  for (let i = 0; i < limit; i++) {
    yield new Promise<Promise<Patient>>((resolve, reject) => {
      const newPatient = randomFhirPatient();

      const patient = Patient.create({
        id: Math.random().toString(16).substring(2),
        document: newPatient,
      });

      resolve(patient);
    });
  }
}
async function* asyncInsertGroup(limit: number) {
  for (let i = 0; i < limit; i++) {
    yield new Promise<Promise<Group>>((resolve, reject) => {
      const newGroup = randomFhirGroup();
      const group = Group.create({
        id: Math.random().toString(16).substring(2),
        document: newGroup,
      });
      resolve(group);
    });
  }
}

async function testDatabaseQuery(query: Promise<Patient | Patient[] | null>) {
  const timer = new Timer();

  const result = await query;

  return { result, timer: timer.stop() };
}

async function checkDatabaseConnection() {
  try {
    await db.authenticate();
    console.log("Connection has been established successfully.");
    return true;
  } catch (err) {
    console.error("Unable to connect to the database:", err);
    return false;
  }
}

function randomFhirPatient() {
  const sex = faker.person.sexType();

  const firstName = faker.person.firstName(sex);
  const lastName = faker.person.firstName(sex);

  return {
    contacts: { patientContacts: [], groupContacts: [] },
    dialoggUser: null,
    id: faker.string.alphanumeric(22),
    identifier: [
      {
        system: "urn:oid:2.16.578.1.12.4.1.4.1",
        use: null,
        value: faker.string.numeric(11),
      },
    ],
    active: faker.datatype.boolean(),
    name: [
      {
        given: [firstName],
        family: lastName,
        text: `${firstName} ${lastName}`,
      },
    ],
    telecom: null,
    languages: null,
    gender: null,
    birthDate: faker.date.birthdate().toLocaleDateString("en-CA"),
    address: null,
    addressNote: null,
    keyCode: null,
    link: [],
    maritalStatus: null,
    shareSkyresponseAlarmWithPatientIds: [],
    notification: { inactiveDays: 1, inactiveDaysSetBy: "default" },
    note: faker.lorem.paragraphs(2000),
    lastActive: null,
    lastSupervisionTimestamp: null,
    lastSupervisionPerformedByUserId: null,
    carePlans: [],
    medicalDevices: [],
    isAlarmHandlingPlanActive: true,
    gateways: [],
    cameras: [],
    documents: [],
    referenceRange: [],
    photo: null,
    patientGroups: [
      {
        id: faker.string.uuid(),
        name: "Service",
        enableDistanceEstimation: false,
        enableOnSiteRegistration: false,
        hideTechnicalAlarmNotifications: false,
      },
    ],
    userReservations: [],
    tags: [],
    alarmRoutes: [],
    externalPatientIds: [
      {
        externalId: faker.string.numeric(11),
        externalHumanIdType: {
          id: "norwegian-id",
          validationRegexp: null,
          globalSearchAllowed: false,
        },
      },
    ],
    skyresponseDetails: {
      enabled: null,
      organizationId: null,
      hasSkyresponseExternalId: false,
      hasSkyresponseCredentials: false,
      alarmForwardingEnabled: null,
    },
    shareAlarmWith: [],
    hasSkyresponseSyncFailed: false,
    journalConfigForPatient: {
      remotePatientMonitoring: { enabled: false, taskCodesForJournaling: [] },
      remoteSupervision: { enabled: false },
    },
  };
}

function randomFhirGroup() {
  return {
    id: faker.string.alphanumeric(22),
    name: faker.person.fullName(),
  };
}

class Timer {
  private started;

  constructor() {
    this.started = Date.now();
  }

  stop() {
    return (Date.now() - this.started) / 1000;
  }
}
