import fs from "fs";
import path from "path";
import puppeteer from "puppeteer";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import ejs from "ejs";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const convertImageToBase64 = (input) => {
  try {
    if (Buffer.isBuffer(input)) {
      return `data:image/png;base64,${input.toString("base64")}`;
    }
    const absolutePath = path.resolve(__dirname, input);
    if (!fs.existsSync(absolutePath)) {
      console.warn("Image not found:", absolutePath);
      return "";
    }
    const imageBuffer = fs.readFileSync(absolutePath, { encoding: "base64" });
    return `data:image/png;base64,${imageBuffer}`;
  } catch (err) {
    console.error("Image conversion error:", err.message);
    return "";
  }
};

const sendEmail = async (purchases) => {
  try {
    const { email, name } = purchases[0];
    console.log("Preparing to send to:", email);

    // Load all templates
    const header = fs.readFileSync(path.join(__dirname, "../view/partials/header.html"), "utf-8");
    const contentTemplate = fs.readFileSync(path.join(__dirname, "../view/partials/content.html"), "utf-8");
    const footer = fs.readFileSync(path.join(__dirname, "../view/partials/footer.html"), "utf-8");

    // Base64 encode images
    const logoBase64 = convertImageToBase64("../view/image/PNG/mithzylogo.png");
    const signatureBase64 = convertImageToBase64("../view/image/PNG/signature.png");

    // Group products
    const grouped = {};
    for (const item of purchases) {
      const key = `${item.p_name}_${item.p_company}_${item.p_price}`;
      if (!grouped[key]) {
        grouped[key] = {
          name: item.p_name,
          company: item.p_company,
          price: parseFloat(item.p_price),
          quantity: 1,
          image: convertImageToBase64(item.image),
        };
      } else {
        grouped[key].quantity += 1;
      }
    }

    const purchaseList = Object.values(grouped).map((item, i) => ({
      index: i + 1,
      name: item.name,
      company: item.company,
      image: item.image,
      price: item.price.toFixed(2),
      quantity: item.quantity,
      netAmount: (item.price * item.quantity).toFixed(2),
    }));

    const totalAmount = purchaseList.reduce((sum, item) => sum + parseFloat(item.netAmount), 0);

    // Render the EJS content template
    const renderedContent = await ejs.render(contentTemplate, {
      name,
      total: `\u20B9${totalAmount.toFixed(2)}`,
      purchases: purchaseList,
    });

    // Merge header + content + footer
    let fullHtml = header + renderedContent + footer;
    fullHtml = fullHtml
      .replace(/{{logo}}/g, logoBase64)
      .replace(/{{signature}}/g, signatureBase64);

    // Generate PDF
    const timestamp = Date.now();
    const pdfPath = path.join(__dirname, `purchase_${timestamp}.pdf`);

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setContent(fullHtml, { waitUntil: "load" });
    await page.pdf({
      path: pdfPath,
      format: "A4",
      printBackground: true,
      margin: {
        top: "0px",
        bottom: "0px",
        left: "0px",
        right: "0px",
      },
    });
    await browser.close();

    // Send email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "shakthivelswami@gmail.com",
        pass: "nzud zhpj swrk qmzs",
      },
    });

    const mailOptions = {
      from: "shakthivelswami@gmail.com",
      to: email,
      subject: "Your Mithzy Purchase Receipt",
      text: `Hi ${name},\n\nPlease find your purchase receipt attached.`,
      attachments: [{ filename: "Purchase_Receipt.pdf", path: pdfPath }],
    };

    await transporter.sendMail(mailOptions);
    console.log("✅ Email sent successfully!");

    fs.unlinkSync(pdfPath);

    return { success: true, message: "Email sent successfully." };
  } catch (error) {
    console.error("❌ Error:", error.message);
    return {
      success: false,
      message: "Email processing failed",
      error: error.message,
    };
  }
};

export default sendEmail;
