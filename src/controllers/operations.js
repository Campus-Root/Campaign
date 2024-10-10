import { StatusCodes } from "http-status-codes";
import { AttendeeModel, UserModel } from "../models/User.js";
import { VisitModel } from "../models/Visit.js";
import mongoose from "mongoose";
import { sendWhatsAppMessage } from "../utils/whatsapp.js";
import { generateCloudinaryQRCode, maskEmail, maskPhone } from "../utils/workers.js";
import { sendMail } from "../utils/sendEmail.js";


export const participants = async (req, res) => {
    let { s, page = 1, perPage = 20 } = req.query, skip = (page - 1) * perPage
    let { filterData } = req.body
    let totalPages = 0, totalDocs, filter = {}
    try {
        if (s) {
            const student = await UserModel.findById(new mongoose.Types.ObjectId(s), "-logs -visits -qrCodeUrl -email -mobileNumber -whatsappNumber");
            if (!student) return res.status(StatusCodes.NOT_FOUND).json({ success: false, message: "User not found", data: { id: s } });
            let visit = await VisitModel.findOne({ participants: { $all: [req.user._id, student._id] } });
            return res.status(StatusCodes.OK).json({ success: true, message: "Student data fetched successfully", data: student, AlreadyVisitedDetails: visit || null });
        }
        else if (req.user.userType === "Admin") {
            filterData.forEach(ele => {
                if (ele.type === "name") filter.name = { $regex: name, $options: "i" };
                if (ele.type === "user") filter.userType = ele.data
            })
            filter._id = { $ne: req.user._id }
            const users = await UserModel.find(filter, "-logs -visits").sort({ updatedAt: -1 }).skip(skip).limit(perPage);
            totalDocs = await UserModel.countDocuments(filter)
            totalPages = Math.ceil(totalDocs / perPage);
            let visits = users.map(ele => { return { participants: [{ ...JSON.parse(JSON.stringify(ele)) }], notes: "null", details: [{ "label": "null", "data": "null" }, { "label": "null", "data": "null" }] } });
            return res.status(StatusCodes.OK).json({ success: true, message: "User visits fetched successfully", data: { _id: req.user._id, name: req.user.name, email: req.user.email, role: req.user.role, userType: req.user.userType, institutionName: req.user.institutionName, boothNumber: req.user.boothNumber, visits: visits, currentPage: page, totalPages: totalPages, totalItems: totalDocs } });
        }
        filter.participants = { $in: [req.user._id] }
        for (const ele of filterData) {
            if (ele.type === "name") {
                const usrs = await AttendeeModel.find(
                    { name: { $regex: ele.data[0], $options: "i" } },
                    "_id"
                );

                // Combine name filter with the participants condition
                const userIds = usrs.map((ele) => ele._id);
                filter.$and = [
                    { participants: { $in: [req.user._id] } },
                    { participants: { $in: userIds } }
                ];
            } else if (ele.type === "label") {
                // Add dynamic filter for label type
                filter[`details.${ele.label}`] = ele.data[0];
            }
        }

        let visits = await VisitModel.find(filter).sort({ updatedAt: -1 }).skip(skip).limit(perPage);
        totalDocs = await VisitModel.countDocuments(filter)
        totalPages = Math.ceil(totalDocs / perPage);
        await UserModel.populate(visits, { path: "participants", select: "-logs -visits -qrCodeUrl" });
        return res.status(StatusCodes.OK).json({ success: true, message: "User visits fetched successfully", data: { _id: req.user._id, name: req.user.name, email: req.user.email, userType: req.user.userType, role: req.user.role, institutionName: req.user.institutionName, boothNumber: req.user.boothNumber, visits: visits, currentPage: page, totalPages: totalPages, totalItems: totalDocs } });
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: "Something went wrong", error: error.message });
    }
};
export const visit = async (req, res) => {
    const { visitorId, notes, details } = req.body
    try {
        const user = await UserModel.findById(new mongoose.Types.ObjectId(visitorId), "-logs -visits -qrCodeUrl");
        if (!user) return res.status(StatusCodes.NOT_FOUND).json({ success: false, message: "User not found", data: { visitorId, notes, details } });
        user.email = maskEmail(user.email);
        user.mobileNumber = maskPhone(user.mobileNumber);
        user.whatsappNumber = maskPhone(user.whatsappNumber);
        let visit = await VisitModel.findOne({ participants: { $all: [req.user._id, visitorId] } });
        if (visit) {
            visit.notes = notes;
            visit.details = details;
            await visit.save();
            return res.status(StatusCodes.OK).json({ success: true, message: "Visit processed successfully", data: { visit: visit, user: user } });
        }
        visit = await VisitModel.create({ participants: [req.user._id, visitorId], notes, details });
        await UserModel.findByIdAndUpdate(new mongoose.Types.ObjectId(req.user._id), { $addToSet: { visits: visit._id } });
        await UserModel.findByIdAndUpdate(new mongoose.Types.ObjectId(visitorId), { $addToSet: { visits: visit._id } });
        return res.status(StatusCodes.OK).json({ success: true, message: "Visit processed successfully", data: { visit: visit, user: user } });
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: "Something went wrong", error: error.message });
    }
}

export const zohoFormsWebhook = async (req, res, next) => {
    const user = await AttendeeModel.create({
        name: `${req.body.firstName} ${req.body.lastName}`,
        email: req.body.email,
        about: req.body.about,
        city: req.body.city,
        whatsappNumber: req.body.whatsappNumber,
        mobileNumber: req.body.mobileNumber,
        ticketNumber: req.body.uniqueID,
        college: req.body.college,
        degree: req.body.degree,
        gradepercentage: req.body.gradepercentage,
        graduation: req.body.graduation,
        year: req.body.year,
        educationBudget: req.body.educationBudget,
        country: req.body.country,
        course: req.body.course,
        educationloan: req.body.educationloan,
        aptitude: req.body.aptitude,
        gre: req.body.gre,
        gmat: req.body.gmat,
        sat: req.body.sat,
        act: req.body.act,
        language: req.body.language,
        toefl: req.body.toefl,
        pte: req.body.pte,
        ielts: req.body.ielts,
        duolingo: req.body.duolingo,
        leadSource: req.body.leadSource,
        addedTime: req.body.addedTime
    })
    user.qrCodeUrl = await generateCloudinaryQRCode(`${process.env.URL}?s=${user._id}&p=true&t=${user.ticketNumber}`)
    await user.save()
    let waResp
    if (user.whatsappNumber) waResp = await sendWhatsAppMessage(user.name, user.whatsappNumber, user.qrCodeUrl);
    if (!waResp.id) waResp = await sendWhatsAppMessage(user.name, user.mobileNumber, user.qrCodeUrl);
    await sendMail({
        to: user.email, // list of receivers
        subject: "Thank You for Attending – Mahabubnagar Study Abroad Education Fair 2024!", // Subject line
        html: ` <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mahabubnagar Study Abroad Education Fair 2024</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            border: 1px solid #ddd;
            border-radius: 5px;
            background-color: #f9f9f9;
        }
        h2 {
            color: #333;
        }
        .highlight {
            font-weight: bold;
        }

        .emoji {
            font-size: 1.2em;
        }

        .qr-section {
            margin-top: 20px;
            text-align: center;
        }

        .qr-section img {
            max-width: 200px;
            margin-top: 10px;
        }

        .contact {
            margin-top: 20px;
        }

        .footer {
            margin-top: 30px;
            font-size: 0.9em;
            color: #555;
        }
    </style>
</head>

<body>
    <div class="container">
        <p>Hi <span class="highlight">${user.name}</span>,</p>

        <p>Thank you for attending the <strong>Mahabubnagar Study Abroad Education Fair 2024!</strong> <span
                class="emoji">🎓✨</span></p>
        <div class="qr-section">
            <p>Show the QR code below to exhibitors to let them know who you are:</p>
            <img src="${user.qrCodeUrl}"
                alt="Your QR Code">
        </div>
        <h2>✅ Here’s what’s happening:</h2>

        <ul>
            <li>Meet top university delegates from the USA, UK, Canada, Australia, Ireland, New Zealand and European Countries.</li>
            <li>Explore <strong>₹20 lakh</strong> in scholarships and exclusive loan options.</li>
            <li>Get expert one-on-one counseling for your study abroad plans.</li>
        </ul>
        <br>
        <p><strong>📅 Event Date:</strong> 11th October 2024<br>
            <strong>📍 Venue:</strong> Sudarshan Convention, Mahabubnagar<br>
            📞 <strong>For more info, contact us at : </strong>9154898944
        </p>


        <!-- <div class="contact">
            
        </div> -->

        <div class="footer">
            <p>We’re excited to see you!<br>
                Best,<br>
                One Window Team</p>
        </div>
    </div>
</body>
</html>`
    })
   return res.status(StatusCodes.OK).send('Webhook received successfully');
}