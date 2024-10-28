const fs = require("fs");
const path = require("path");
const handlebars = require("handlebars");
const pdf = require("html-pdf");

const generatePDF = (templateName, data) => {
  return new Promise((resolve, reject) => {
    const templatePath = path.join(
      __dirname,
      "..",
      "templates",
      `${templateName}.hbs`
    );
    const template = fs.readFileSync(templatePath, "utf-8");
    const compiledTemplate = handlebars.compile(template);
    const html = compiledTemplate(data);

    const options = { format: "A4" };

    pdf.create(html, options).toBuffer((err, buffer) => {
      if (err) {
        reject(err);
      } else {
        resolve(buffer);
      }
    });
  });
};

module.exports = generatePDF;
