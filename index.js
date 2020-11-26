import express from "express"
import fs from "fs"
import multer from "multer"
import { createWorker } from 'tesseract.js';
const worker = createWorker({
    logger: m => console.log(m),
});

const app = express()

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./uploads")
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});
const upload = multer({ storage: storage }).single("avatar")
app.set("view engine", "ejs")


app.get("/", (req, res) => {
    res.render("index.ejs")
})

app.post("/upload", (req, res) => {

    upload(req, res, err => {

        fs.readFile(`./uploads/${req.file.originalname}`, (err, data) => {
            if (err) return console.log(err);
            //     console.log("comes to recognize")
            //    worker.recognize(data,"eng",{tessjs_create_pdf:'1'})
            //     // .then(result=>{res.send(result.text)}) //send image to text
            //     .then(result=>{
            //         res.redirect('/download')
            //     })
            //     .finally(()=>worker.terminate() )
            (async () => {
                await worker.load();
                await worker.loadLanguage('eng');
                await worker.initialize('eng');
                await worker.recognize(data, { tessjs_create_pdf: '1' })
                    .then(result => { res.send(result.data.text) })
                await worker.terminate();
            })();
        })

    })
})
app.get('/download', (req, res) => {
    const file = `${__dirname}/OCR-PDF.pdf`
    res.download(file)
})
const PORT = 5000 || process.env.PORT;
app.listen(PORT, () => console.log(`server is running on port ${PORT}`))
