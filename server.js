const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse'); // Utiliser pdf-parse pour extraire le texte du PDF
const { Document, Packer, Paragraph } = require('docx');

const app = express();
const upload = multer({ dest: 'uploads/' });

// Convertir PDF en Word
app.post('/convert/pdf-to-word', upload.single('file'), async (req, res) => {
    try {
        const pdfPath = req.file.path;
        const dataBuffer = fs.readFileSync(pdfPath);
        
        // Extraire le texte du PDF avec pdf-parse
        const pdfData = await pdfParse(dataBuffer);
        const text = pdfData.text;

        const doc = new Document();
        doc.addSection({
            children: [
                new Paragraph(text),
            ],
        });

        const wordPath = `uploads/${req.file.filename}.docx`;
        const buffer = await Packer.toBuffer(doc);
        fs.writeFileSync(wordPath, buffer);

        res.download(wordPath, 'converted.docx', () => {
            fs.unlinkSync(pdfPath);
            fs.unlinkSync(wordPath);
        });
    } catch (error) {
        console.error(error); // Affichez l'erreur pour plus de détails
        res.status(500).send({ error: 'Conversion échouée' });
    }
});

// Convertir Word en PDF
app.post('/convert/word-to-pdf', upload.single('file'), async (req, res) => {
    try {
        const wordPath = req.file.path;

        // Logique de conversion Word en PDF à définir ici
        // Par exemple, utilisez une librairie comme `mammoth` pour obtenir le HTML
        // et ensuite une librairie comme `puppeteer` pour convertir en PDF.

        const pdfPath = `uploads/${req.file.filename}.pdf`;
        // Convertir le fichier Word en PDF ici

        res.download(pdfPath, 'converted.pdf', () => {
            fs.unlinkSync(wordPath);
            fs.unlinkSync(pdfPath);
        });
    } catch (error) {
        console.error(error); // Affichez l'erreur pour plus de détails
        res.status(500).send({ error: 'Conversion échouée' });
    }
});

const PORT = 5550;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
