const functions = require("firebase-functions");
const diagnosis = require("./apis/diagnosis");
const medicalUnit = require("./apis/medicalUnit");
const common = require("./apis/common");


exports.diagnosis = functions.runWith({
    memory: '2GB'
}).https.onRequest(diagnosis);
exports.medicalUnit = functions.runWith({
    memory: '2GB'
}).https.onRequest(medicalUnit);
exports.common = functions.runWith({
    memory: '2GB'
}).https.onRequest(common);