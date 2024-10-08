import { StatusCodes } from "http-status-codes";
import { UserModel } from "../models/User.js";
import { VisitModel } from "../models/Visit.js";


export const participants = async (req, res) => {
    const { id } = req.params;
    try {
        // If ID is provided, fetch the user with specified fields
        if (id) {
            const student = await UserModel.findById(id, "-email -phone");
            if (!student) return res.status(StatusCodes.NOT_FOUND).json({ success: false, message: "User not found", data: { id: id } });
            student.email = maskEmail(student.email);
            if (student.phone) student.phone.number = maskPhone(student.phone.number);
            return res.status(StatusCodes.OK).json({ success: true, message: "Student data fetched successfully", data: student });
        }

        // If no ID, populate visits for the authenticated user
        await VisitModel.populate(req.user, { path: "visits" });
        await UserModel.populate(req.user, { path: "visits" });
        req.user.visits = req.user.visits.map((visit) => {
            return { ...visit, email: maskEmail(visit.email), phone: { number: maskPhone(visit.phone.number), countryCode: visit.phone.countryCode } }
        })
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
        await UserModel.findByIdAndUpdate(req.user._id, { $addToSet: { visitIds: visit._id } });
        await UserModel.findByIdAndUpdate(visitorId, { $addToSet: { visitIds: visit._id } });
        return res.status(StatusCodes.OK).json({ success: true, message: "Visit processed successfully", data: visit });
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: "Something went wrong", error: error.message });
    }

}
