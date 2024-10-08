import { StatusCodes } from "http-status-codes";
import { AttendeeModel, UserModel } from "../models/User.js";
import { VisitModel } from "../models/Visit.js";
import mongoose from "mongoose";
import { sendWhatsAppMessage } from "../utils/whatsapp.js";
import { generateCloudinaryQRCode, maskEmail, maskPhone } from "../utils/workers.js";


export const participants = async (req, res) => {
    const { s } = req.query
    try {
        // If ID is provided, fetch the user with specified fields
        if (s) {
            const student = await UserModel.findById(new mongoose.Types.ObjectId(s), "");
            if (!student) return res.status(StatusCodes.NOT_FOUND).json({ success: false, message: "User not found", data: { id: id } });
            student.email = maskEmail(student.email);
            student.phone = maskPhone(phone.number);
            return res.status(StatusCodes.OK).json({ success: true, message: "Student data fetched successfully", data: student });
        }
        // If no ID, populate visits for the authenticated user
        await VisitModel.populate(req.user, { path: "visits" });
        await UserModel.populate(req.user, { path: "visits" });
        req.user.visits = req.user.visits.map((visit) => { return { ...visit, email: maskEmail(visit.email), phone: maskPhone(visit.phone) } })
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
        let visit = await VisitModel.findOne({ participants: { $all: [req.user._id, visitorId] } });
        if (visit) {
            visit.notes = visit.notes;
            visit.details = visit.details;
        } else visit = new VisitModel({ participants: [req.user._id, visitorId], notes, details });
        await visit.save();
        await UserModel.findByIdAndUpdate(new mongoose.Types.ObjectId(req.user._id), { $addToSet: { visitIds: visit._id } });
        await UserModel.findByIdAndUpdate(new mongoose.Types.ObjectId(visitorId), { $addToSet: { visitIds: visit._id } });
        return res.status(StatusCodes.OK).json({ success: true, message: "Visit processed successfully", data: visit });
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