import connection from "../config/connectDB.js";

const getWithdrawalConditions = async (req, res) => {
  try {
    const [rows] = await connection.execute("SELECT * FROM withdrawal_conditions ORDER BY order_index ASC");
    return res.status(200).json({ status: true, data: rows });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

const addWithdrawalCondition = async (req, res) => {
  const { type, value, order_index, description } = req.body;
  try {
    await connection.execute(
      "INSERT INTO withdrawal_conditions (type, value, order_index, description) VALUES (?, ?, ?, ?)",
      [type, value, order_index || 0, description || ""],
    );
    return res.status(200).json({ status: true, message: "Condition added successfully" });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

const updateWithdrawalCondition = async (req, res) => {
  const { id, type, value, order_index, description, status } = req.body;
  try {
    await connection.execute(
      "UPDATE withdrawal_conditions SET type = ?, value = ?, order_index = ?, description = ?, status = ? WHERE id = ?",
      [type, value, order_index, description, status, id],
    );
    return res.status(200).json({ status: true, message: "Condition updated successfully" });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

const deleteWithdrawalCondition = async (req, res) => {
  const { id } = req.body;
  try {
    await connection.execute("DELETE FROM withdrawal_conditions WHERE id = ?", [id]);
    return res.status(200).json({ status: true, message: "Condition deleted successfully" });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

const withdrawalConditionsPage = async (req, res) => {
  return res.render("manage/withdrawalConditions.ejs");
};

export default {
  getWithdrawalConditions,
  addWithdrawalCondition,
  updateWithdrawalCondition,
  deleteWithdrawalCondition,
  withdrawalConditionsPage,
};
