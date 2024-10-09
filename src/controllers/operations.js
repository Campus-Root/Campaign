import { StatusCodes } from "http-status-codes";
import { AttendeeModel, UserModel } from "../models/User.js";
import { VisitModel } from "../models/Visit.js";
import mongoose from "mongoose";
import { sendWhatsAppMessage } from "../utils/whatsapp.js";
import { generateCloudinaryQRCode, maskEmail, maskPhone } from "../utils/workers.js";


export const participants = async (req, res) => {
    const { s } = req.query
    try {
        if (s) {
            const student = await UserModel.findById(new mongoose.Types.ObjectId(s), "-logs -visits -qrCodeUrl");
            if (!student) return res.status(StatusCodes.NOT_FOUND).json({ success: false, message: "User not found", data: { id: s } });
            student.email = maskEmail(student.email);
            student.mobileNumber = maskPhone(student.mobileNumber);
            student.whatsappNumber = maskPhone(student.whatsappNumber);
            let visit = await VisitModel.findOne({ participants: { $all: [req.user._id, student._id] } });
            return res.status(StatusCodes.OK).json({ success: true, message: "Student data fetched successfully", data: student, AlreadyVisitedDetails: visit || null });
        }
        else if (req.user.userType === "Admin") {
            const users = await UserModel.find({ _id: { $ne: req.user._id } }, "-logs -qrCodeUrl").sort({ createdAt: -1 });
            let Admin = JSON.parse(JSON.stringify(req.user))
            users.forEach(ele => {
                Admin.visits.push({ participants: [{ ...JSON.parse(JSON.stringify(ele)) }], notes: "null", details: [{ "data": "null" }, { "label": "null", "data": "null" },] })
            });
            return res.status(StatusCodes.OK).json({ success: true, message: "User visits fetched successfully", data: Admin });
        }
        await VisitModel.populate(req.user, { path: "visits" });
        await UserModel.populate(req.user, { path: "visits.participants", select: "-logs -visits" });
        for (const visit of req.user.visits) {
            for (const person of visit.participants) {
                person.email = maskEmail(person.email);
                person.mobileNumber = maskPhone(person.mobileNumber);
                person.whatsappNumber = maskPhone(person.whatsappNumber);
            }
        }
        return res.status(StatusCodes.OK).json({ success: true, message: "User visits fetched successfully", data: req.user });

    } catch (error) {
        // Catch any errors and return an appropriate response
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: "Something went wrong",
            error: error.message,
        });
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
    res.status(StatusCodes.OK).send('Webhook received successfully');
}