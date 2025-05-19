// controllers/reportController.js
import Report from "../models/reportModel.js";

export const createReport = async (req, res) => {
  try {
    const { reportedUserId, reason, details } = req.body;
    const newReport = new Report({
      reporter: req.user._id,
      reportedUser: reportedUserId,
      reason,
      details,
      date: new Date(),
    });

    await newReport.save();
    res.status(201).json({ message: "Report created" });
  } catch (err) {
    console.error("Report error:", err);
    res.status(500).json({ error: "Could not create report" });
  }
};

export const getReports = async (req, res) => {
  try {
    const reports = await Report.find()
      .populate("reporter", "firstName lastName email")
      .populate("reportedUser", "firstName lastName email");
    res.status(200).json(reports);
  } catch (err) {
    res.status(500).json({ error: "Could not fetch reports" });
  }
};

export const deleteReport = async (req, res) => {
  try {
    await Report.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Report deleted" });
  } catch (err) {
    res.status(500).json({ error: "Could not delete report" });
  }
};

export const resolveReport = async (req, res) => {
  try {
    const updated = await Report.findByIdAndUpdate(
      req.params.id,
      { resolved: true },
      { new: true }
    );
    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ error: "Could not mark as resolved" });
  }
};
