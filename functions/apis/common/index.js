const express = require("express");
const cors = require("cors")({
    origin: true
});
const _ = require("lodash");
const db = require("../../utils/firestore");

const app = express();
app.use(cors);
app.use(express.json());

app.get("/status", async (req, res) => {

    let status = [];

    await db.collection('status').get()
        .then(snapshot => {
            snapshot.forEach(doc => {
                status.push({
                    ...doc.data(),
                    id: doc.id
                });
            });
            return res.status(200).json(status);
        }).catch(err => {
            console.log('Error getting documents', err);
        });
});

app.get("/hastes", async (req, res) => {

    let hastes = [];

    await db.collection('haste').get()
        .then(snapshot => {
            snapshot.forEach(doc => {
                hastes.push({
                    ...doc.data(),
                    id: doc.id
                });
            });
            return res.status(200).json(hastes);
        }).catch(err => {
            console.log('Error getting documents', err);
        });
});

module.exports = app;