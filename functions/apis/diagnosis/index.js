const express = require("express");
const cors = require("cors")({
    origin: true
});
const _ = require("lodash");
const db = require("../../utils/firestore");
var moment = require('moment-timezone');
const excel = require('excel4node');
const app = express();
app.use(cors);
app.use(express.json());

app.put("/:id", async (req, res) => {

    try {

        let id = req.params.id;

        diagnostico = req.body;

        diagnostico.update = new Date();

        let diagnosisRef = await db.collection('diagnosis').doc(id);

        let merge = true;

        await diagnosisRef.get()
            .then(doc => {
                if (!doc.exists) {
                    merge = false;
                    return res.status(400).send('No such document!');
                }
                return null;
            });

        if (merge) {
            let alter = await diagnosisRef.set(
                diagnostico, {
                    merge: true
                }
            );
        }
        res.status(200).send({
            msg: "Diagnostico alterado com sucesso"
        });
    } catch (e) {
        res.status(500).send(e);
    }
});

app.get("/bi", async (req, res) => {

    let diagnosticos = [];
    let annotations = [];
    let touchpoints = [];
    let hastes = [];
    let status = [];
    let medicalUnits = [];
   
    try {
        const refAnnotations = await db.collection("annotation").get();
        refAnnotations.forEach(el => {
            annotations.push(el.data())
        })

        const refTouchpoints = await db.collection("touchpoints").get();
        refTouchpoints.forEach(el => {
            touchpoints.push(el.data())
        })

        await db.collection('status').get().then(snapshot => {
            snapshot.forEach(doc => {
                status.push({
                    ...doc.data(),
                    id: doc.id
                })
            })
        })

        await db.collection('haste').get().then(snapshot => {
            snapshot.forEach(doc => {
                hastes.push({
                    ...doc.data(),
                    id: doc.id
                })
            })
        })

        await db.collection('medicalUnit').get().then(snapshot => {
            snapshot.forEach(doc => {
                medicalUnits.push({
                    ...doc.data(),
                    id: doc.id
                })
            })
        })

        const refDiagnosis = await db.collection("diagnosisV2").get();
   
        refDiagnosis.forEach(el => {
        
        diagnosticos.push({
                ...el.data(),
                annotations: _.filter(annotations, (e) => {
                    return e.key === el.data().key;
                }),
                touchpoints: _.filter(touchpoints, (e) => {
                    return e.key === el.data().key;
                }),
                status: _.first(_.filter(status, (e) => {
                    return e.id === el.data().status
                })),
                haste: _.first(_.filter(hastes, (e) => {
                    return e.id === el.data().haste
                })),
                medicalUnit: _.first(_.filter(medicalUnits, (e) => {
                    return e.id === el.data().medicalUnit
                })),
                temperatureFmt: _.startCase(el.data().temperature),
                respiratoryChartFmt: !_.isEmpty(el.data().respiratoryChart) ? getRespiratoryChartFmt(el.data()) : d = {
                    "Tosse": false,
                    "Dificuldade_para_respirar": false,
                    "Coriza": false
                },
                chronicChartFmt: !_.isEmpty(el.data().chronicChar) ? getChronicChartFmt(el.data()) : d = {
                    "Diabetes": false,
                    "Gestantes": false,
                    "Doencas_pulmonares": false,
                    "Doenca_renais": false,
                    "HIV": false,
                    "Cancer": false,
                    "Asma_ou_afins": false,
                    "Doenca_cardiaca": false
                },
                locationFmt: el.data().location.lat === 0 ? _.first(_.filter(medicalUnits, (e) => {
                        return e.id === el.data().medicalUnit })).location : el.data().location
            })
        })

        return res.status(200).json(diagnosticos);
    } catch (e) {
        res.status(500).send(e);
    }
});

app.get("/xls", async (req, res) => {

    let diagnosticos = [];
    let annotations = [];
    let touchpoints = [];
    let status = [];
    let hastes = [];
    let medicalUnits = [];

    try {
        const refAnnotations = await db.collection("annotation").get();
        refAnnotations.forEach(el => {
            annotations.push(el.data())
        })

        const refTouchpoints = await db.collection("touchpoints").get();
        refTouchpoints.forEach(el => {
            touchpoints.push(el.data())
        })

        await db.collection('status').get().then(snapshot => {
            snapshot.forEach(doc => {
                status.push({
                    ...doc.data(),
                    id: doc.id
                })
            })
        })

        await db.collection('haste').get().then(snapshot => {
            snapshot.forEach(doc => {
                hastes.push({
                    ...doc.data(),
                    id: doc.id
                })
            })
        })

        await db.collection('medicalUnit').get().then(snapshot => {
            snapshot.forEach(doc => {
                medicalUnits.push({
                    ...doc.data(),
                    id: doc.id
                })
            })
        })

        const refDiagnosis = await db.collection("diagnosisV2").get();
        refDiagnosis.forEach(el => {
            diagnosticos.push({
                ...el.data(),
                annotations: _.filter(annotations, (e) => {
                    return e.key === el.data().key;
                }),
                touchpoints: _.filter(touchpoints, (e) => {
                    return e.key === el.data().key;
                }),
                status: _.first(_.filter(status, (e) => {
                    return e.id === el.data().status
                })),
                haste: _.first(_.filter(hastes, (e) => {
                    return e.id === el.data().haste
                })),
                medicalUnit: _.first(_.filter(medicalUnits, (e) => {
                    return e.id === el.data().medicalUnit
                }))
            })
        })


        var workbook = new excel.Workbook();

        // Add Worksheets to the workbook
        var worksheet = workbook.addWorksheet('registros');
        // Create a reusable style
        var styleHeader = workbook.createStyle({
            fill: {
                type: 'pattern',
                patternType: 'solid',
                bgColor: '#FFFF00',
                fgColor: '#FFFF00',
            }
        });

        var styleBody = workbook.createStyle({});

        worksheet.cell(1, 1).string('Nome').style(styleHeader);
        worksheet.cell(1, 2).string('Indetificador (CPF/CRACHÁ)').style(styleHeader);
        worksheet.cell(1, 3).string('Data').style(styleHeader);
        worksheet.cell(1, 4).string('Status').style(styleHeader);
        worksheet.cell(1, 5).string('Telefone').style(styleHeader);
        worksheet.cell(1, 6).string('Área').style(styleHeader);

        let line = 2;

        console.log(diagnosticos.length);

        diagnosticosSort = _.sortBy(diagnosticos, [(o) => o.createdAt._seconds]);

        await diagnosticosSort.forEach(async diagnosticos => {
            worksheet.cell(line, 1).string(diagnosticos.name).style(styleBody);
            worksheet.cell(line, 2).string(diagnosticos.key).style(styleBody);
            worksheet.cell(line, 3).string(moment.unix(diagnosticos.createdAt._seconds).tz("America/Sao_Paulo").format('DD/MM/YYYY hh-mm a')).style(styleBody);
            worksheet.cell(line, 4).string(diagnosticos.status.label).style(styleBody);
            worksheet.cell(line, 5).string(diagnosticos.phone).style(styleBody);
            worksheet.cell(line, 6).string(diagnosticos.medicalUnit.label).style(styleBody);
            line = line + 1;
        })

        let now = moment().format('YYYY-MM-DD');

        const nameFile = "relatorio_" + now + ".xlsx";

        workbook.writeToBuffer().then(function (buffer) {
            res.setHeader('Content-disposition', 'attachment; filename=' + nameFile);
            res.send(Buffer.from(buffer));
        });

    } catch (e) {
        res.status(500).send(e);
    }
});

app.get("/key/:id", async (req, res) => {

    let diagnosis = [];

    let key = Number(req.params.id);

    await db.collection('diagnosis').where('key', '==', key).get()
        .then(snapshot => {
            snapshot.forEach(doc => {
                diagnosis.push(doc.data());
            });
            return null;
        }).catch(err => {
            console.log('Error getting documents', err);
        });

    if (!diagnosis.length > 0) {
        return res.status(400).send("Diagnostico not found");
    }

    return res.status(200).json(diagnosis);
});

app.get("/badge/:id", async (req, res) => {

    let diagnosis = [];

    let key = req.params.id;

    await db.collection('diagnosis').where('key', '==', key).get()
        .then(snapshot => {
            snapshot.forEach(doc => {
                diagnosis.push(doc.data());
            });
            return null;
        }).catch(err => {
            console.log('Error getting documents', err);
        });

    return res.status(200).json(diagnosis);
});

app.get("/:id?", async (req, res) => {


    let key = req.params.id;


    let diagnosticos = [];
    let annotations = [];
    let touchpoints = [];
    let status = [];
    let hastes = [];
    let medicalUnits = [];

    try {
        const refAnnotations = await db.collection("annotation").get();
        refAnnotations.forEach(el => {
            annotations.push(el.data())
        })

        const refTouchpoints = await db.collection("touchpoints").get();
        refTouchpoints.forEach(el => {
            touchpoints.push(el.data())
        })


        await db.collection('status').get().then(snapshot => {
            snapshot.forEach(doc => {
                status.push({
                    ...doc.data(),
                    id: doc.id
                })
            })
        })

        await db.collection('haste').get().then(snapshot => {
            snapshot.forEach(doc => {
                hastes.push({
                    ...doc.data(),
                    id: doc.id
                })
            })
        })

        await db.collection('medicalUnit').get().then(snapshot => {
            snapshot.forEach(doc => {
                medicalUnits.push({
                    ...doc.data(),
                    id: doc.id
                })
            })
        })

        const refDiagnosis = key ?
            await db.collection('diagnosisV2').where('key', '==', key).get() :
            await db.collection("diagnosisV2").get();

        refDiagnosis.forEach(el => {
            diagnosticos.push({
                ...el.data(),
                annotations: _.filter(annotations, (e) => {
                    return e.key === el.data().key;
                }),
                touchpoints: _.filter(touchpoints, (e) => {
                    return e.key === el.data().key;
                }),
                status: _.first(_.filter(status, (e) => {
                    return e.id === el.data().status
                })),
                haste: _.first(_.filter(hastes, (e) => {
                    return e.id === el.data().haste
                })),
                medicalUnit: _.first(_.filter(medicalUnits, (e) => {
                    return e.id === el.data().medicalUnit
                }))
            })
        })

        return res.status(200).json(diagnosticos);
    } catch (e) {
        res.status(500).send(e);
    }
});

app.post("/touchpoints/", async (req, res) => {

    try {

        let touchpoints = req.body;

        touchpoints.forEach((t) => {
            db.collection("touchpoints").add({
                ...t,
                createdAt: new Date()
            })
        })
        res.status(200).send("Ok");

    } catch (e) {
        res.status(500).send(e);
    }
})

app.post("/annotation", async (req, res) => {

    try {

        let annotation = req.body;
        let now = new Date();
        annotation.createdAt = now;

        await db.collection("annotation").add(
            annotation
        ).then(ref => {
            return res.status(201).json({
                "id": ref.id,
                "msg": "Annotation salvo com sucesso"
            });
        })
    } catch (e) {
        res.status(500).send(e);
    }

});

app.post("/", async (req, res) => {

    let diagnostico = req.body;

    diagnostico.createdAt = new Date();

    if (diagnostico.cpf) {
        diagnostico.key = diagnostico.cpf;
    } else if (diagnostico.badge) {
        diagnostico.key = diagnostico.badge;
    }

    let haste = await getHaste(diagnostico);
    let status = await getStatus(diagnostico);
    let warning = await getWarning(status, haste);

    try {
        await db.collection("diagnosisV2").add({
            ...diagnostico,
            haste: haste,
            status: status
        }).then(ref => {
            return res.status(201).json({
                "key": ref.id,
                "msg": "Diagnostico salvo com sucesso",
                "warning": warning

            });
        })
    } catch (e) {
        res.status(500).send(e);
    }
});

getChronicChartFmt = (e) => {

    const RESPIRATORY_CHART = {
        0: "Tosse",
        1: "Dificuldade para respirar",
        2: "Coriza"
    }

    let d = {
        "Tosse": false,
        "Dificuldade_para_respirar": false,
        "Coriza": false
    }

    if (d) {
        let arr = _.map(e.respiratoryChart, number => {
            if (number === 0) {
                d.Tosse = true;
            } else if (number === 1) {
                d.Dificuldade_para_respirar = true;
            } else if (number === 2) {
                d.Coriza = true;
            }
        })

        return d;
    } else {
        return d;
    }

}

getRespiratoryChartFmt = (e) => {

    const CHRONIC_CHART = {
        0: "Diabetes",
        1: "Gestantes",
        2: "Doenças pulmonares",
        3: "Doença renais",
        4: "HIV",
        5: "Cancer",
        6: "Asma ou afins",
        7: "Doença cardíaca"
    }

    let d = {
        "Diabetes": false,
        "Gestantes": false,
        "Doencas_pulmonares": false,
        "Doenca_renais": false,
        "HIV": false,
        "Cancer": false,
        "Asma_ou_afins": false,
        "Doenca_cardiaca": false
    }

    if (e) {
        let arr = _.map(e.respiratoryChart, number => {
            if (number === 0) {
                d.Diabetes = true;
            } else if (number === 1) {
                d.Gestantes = true;
            } else if (number === 2) {
                d.Doencas_pulmonares = true;
            } else if (number === 3) {
                d.Doenca_renais = true;
            } else if (number === 4) {
                d.HIV = true;
            } else if (number === 5) {
                d.Cancer = true
            } else if (number === 6) {
                d.Asma_ou_afins = true
            } else if (number === 7) {
                d.Doenca_cardiaca = true;
            }
        })

        return d;
    } else {
        return d;
    }
}

/**
 * Calculate a haste based on a diagnostic
 * 
 * 
 * @param {JSON} diagnostic A diagnostic object
 * 
 * @return {String} A haste ID
 */
getHaste = async (diagnostic) => {

    //First check if MD change the haste mannually if so, get it:
    if (_.has(diagnostic, "haste")) {
        return diagnostic.haste;
    }

    let hastes = [];

    await db.collection('haste').get().then(snapshot => {
        snapshot.forEach(doc => {
            hastes.push({
                ...doc.data(),
                id: doc.id
            })
        })
    })

    let warningsQtd = 0;

    if (!_.isEmpty(diagnostic.respiratoryChart)) {
        warningsQtd = warningsQtd + diagnostic.respiratoryChart.length;
    }

    if (!_.isEmpty(diagnostic.chronicChart)) {
        warningsQtd = warningsQtd + diagnostic.chronicChart.length;
    }
    diagnostic.sixtyMore && warningsQtd++;
    diagnostic.hasTravel && warningsQtd++;
    diagnostic.contactSuspect && warningsQtd++;

    if (diagnostic.temperature === "igual_ou_acima_de_37.8" || diagnostic.temperature === "acima_de_39") {
        return _.first(_.filter(hastes, {
            key: 0
        })).id;
    } else if (warningsQtd >= 2) {
        return _.first(_.filter(hastes, {
            key: 1
        })).id;
    } else if (warningsQtd == 1) {
        return _.first(_.filter(hastes, {
            key: 2
        })).id;
    } else {
        return _.first(_.filter(hastes, {
            key: 2
        })).id;
    }

}

/**
 * Calculate a status based on a diagnostic
 * 
 * 
 * @param {JSON} diagnostic A diagnostic object
 * 
 * @return {String} A status ID
 */
getStatus = async (diagnostic) => {

    //First check if MD change the status mannually if so, get it:
    if (_.has(diagnostic, "status")) {
        return diagnostic.status;
    }

    let status = [];

    await db.collection('status').get().then(snapshot => {
        snapshot.forEach(doc => {
            status.push({
                ...doc.data(),
                id: doc.id
            })
        })
    })

    let warningsQtd = 0;

    if (!_.isEmpty(diagnostic.respiratoryChart)) {
        warningsQtd = warningsQtd + diagnostic.respiratoryChart.length;
    }

    if (!_.isEmpty(diagnostic.chronicChart)) {
        warningsQtd = warningsQtd + diagnostic.chronicChart.length;
    }
    diagnostic.sixtyMore && warningsQtd++;
    diagnostic.hasTravel && warningsQtd++;
    diagnostic.contactSuspect && warningsQtd++;


    if (
        (diagnostic.temperature === "igual_ou_acima_de_37.8" || diagnostic.temperature === "acima_de_39") ||
        (warningsQtd >= 1)
    ) {
        return _.first(_.filter(status, {
            key: 1
        })).id;
    } else {
        return _.first(_.filter(status, {
            key: 0
        })).id;
    }

}

/**
 * Calculate a warning based on a combination of status and haste
 * 
 * 
 * @param {String} statusId A Firebase status ID
 * @param {String} hasteId A Firebase haste ID
 * 
 * @return {String} A warning phrase
 */
getWarning = async (statusId, hasteId) => {

    let statusKey, hasteKey

    await db.collection('status').doc(statusId).get().then(doc => {
        statusKey = doc.data().key
    })

    await db.collection('haste').doc(hasteId).get().then(doc => {
        hasteKey = doc.data().key
    })

    if (hasteKey == 0) {
        return {
            baseMsg: "Suas informações foram enviadas para a equipe de medicina da Klabin, que vai avaliar seu quadro e entrar em contato o mais breve possível.",
            warning: "Enquanto aguarda o retorno da nossa equipe médica, pedimos que você permaneça na sua casa.Se você não for colaborador Klabin, procure atendimento em sua cidade.",
            hasteKey: 0
        }
    } else if (hasteKey == 1) {
        return {
            baseMsg: "Pedimos que antes de iniciar sua jornada de trabalho, procure apoio local e avise sobre o seu sintoma.",
            warning: "Caso você seja do Florestal MA, pedimos que permaneça em casa, enquanto aguarda o retorno da nossa equipe médica.Se você não for colaborador Klabin, procure atendimento em sua cidade.",
            hasteKey: 1
        }
    } else if (hasteKey == 2) {
        if (statusKey == 0) {
            return {
                baseMsg: "Suas informações foram enviadas para a equipe de medicina da Klabin.",
                warning: "Pedimos que volte a fazer a avaliação daqui a 3 dias ou caso perceba algum sintoma.",
                hasteKey: 2
            }
        } else if (statusKey == 1) {
            return {
                baseMsg: "Pedimos que antes de iniciar sua jornada de trabalho, procure apoio local e avise sobre o seu sintoma.",
                warning: "Caso você seja do Florestal MA, pedimos que permaneça em casa, enquanto aguarda o retorno da nossa equipe médica.Se você não for colaborador Klabin, procure atendimento em sua cidade.",
                hasteKey: 2
            }
        }
    }

}

module.exports = app;