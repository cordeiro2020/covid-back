const express = require("express");
const cors = require("cors")({
    origin: true
});
const _ = require("lodash");
const db = require("../../utils/firestore");

const app = express();
app.use(cors);
app.use(express.json());

app.get("/", async (req, res) => {

    let medicalUnit = [];

    await db.collection('medicalUnit').get()
        .then(snapshot => {
            snapshot.forEach(doc => {
                medicalUnit.push({
                    ...doc.data(),
                    id: doc.id
                });
            });
            return res.status(200).json(medicalUnit);
        }).catch(err => {
            console.log('Error getting documents', err);
        });
});

app.get("/:id", async (req, res) => {

    let id = req.params.id;

    try {
        let medicalUnitRef = await db.collection('medicalUnit').doc(id);
        let getDoc = medicalUnitRef.get()
            .then(doc => {
                if (!doc.exists) {
                    return res.status(400).send('No such document!');
                } else {
                    return res.status(200).json(doc.data());
                }
            })
            .catch(err => {
                console.log('Error getting document', err);
            });
    } catch (e) {
        res.status(500).send(e);
    }
});

module.exports = app;