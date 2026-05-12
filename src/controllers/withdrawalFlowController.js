import connection from "../config/connectDB.js";

const getFlow = async (req, res) => {
    try {
        const [rows] = await connection.query("SELECT * FROM withdrawal_flow WHERE status = 1 ORDER BY id DESC LIMIT 1");
        return res.status(200).json({ status: true, data: rows[0] || null });
    } catch (error) {
        return res.status(500).json({ status: false, message: error.message });
    }
};

const saveFlow = async (req, res) => {
    const { flow_json } = req.body;
    try {
        await connection.query("UPDATE withdrawal_flow SET status = 0"); // Deactivate old flows
        await connection.query("INSERT INTO withdrawal_flow (flow_json, status) VALUES (?, 1)", [flow_json]);
        return res.status(200).json({ status: true, message: "Flow saved successfully" });
    } catch (error) {
        return res.status(500).json({ status: false, message: error.message });
    }
};

const flowPage = async (req, res) => {
    return res.render("manage/withdrawFlow.ejs");
};

export default {
    getFlow,
    saveFlow,
    flowPage
};
