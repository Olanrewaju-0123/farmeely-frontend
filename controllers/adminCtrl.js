const sequelize = require("../config/sequelize");
const { Users } = require("../models/userModel");
const { CreateGroups } = require("../models/createGroupModel");
const { joinGroups } = require("../models/joinGroupModel");
const { Livestocks } = require("../models/livestockModel");
const { Transactions } = require("../models/transactionModel");
const { Wallets } = require("../models/walletModel");
const { Op } = require("sequelize");

/**
 * Get dashboard statistics
 */
const getDashboardStats = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== "admin") {
      return res.status(403).json({
        status: "error",
        message: "Access denied. Admin privileges required.",
      });
    }

    // Get total users
    const totalUsers = await Users.count();

    // Get total groups
    const totalGroups = await CreateGroups.count();

    // Get active groups
    const activeGroups = await CreateGroups.count({
      where: { status: "active" },
    });

    // Get completed groups
    const completedGroups = await CreateGroups.count({
      where: { status: "completed" },
    });

    // Get total transactions
    const totalTransactions = await Transactions.count();

    // Get total transaction volume
    const totalVolume =
      (await Transactions.sum("amount", {
        where: { status: "success" },
      })) || 0;

    // Get total livestock
    const totalLivestock = await Livestocks.count();

    // Get recent users (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentUsers = await Users.count({
      where: {
        created_at: {
          [Op.gte]: thirtyDaysAgo,
        },
      },
    });

    // Get recent transactions (last 30 days)
    const recentTransactions = await Transactions.count({
      where: {
        created_at: {
          [Op.gte]: thirtyDaysAgo,
        },
      },
    });

    // Get recent transaction volume (last 30 days)
    const recentVolume =
      (await Transactions.sum("amount", {
        where: {
          status: "success",
          created_at: {
            [Op.gte]: thirtyDaysAgo,
          },
        },
      })) || 0;

    res.status(200).json({
      status: "success",
      message: "Dashboard statistics retrieved successfully",
      data: {
        users: {
          total: totalUsers,
          recent: recentUsers,
        },
        groups: {
          total: totalGroups,
          active: activeGroups,
          completed: completedGroups,
        },
        transactions: {
          total: totalTransactions,
          recent: recentTransactions,
          totalVolume: totalVolume,
          recentVolume: recentVolume,
        },
        livestock: {
          total: totalLivestock,
        },
      },
    });
  } catch (error) {
    console.error("Error in getDashboardStats:", error);
    res.status(500).json({
      status: "error",
      message: error.message || "Failed to retrieve dashboard statistics",
    });
  }
};

/**
 * Get all users with pagination
 */
const getAllUsers = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        status: "error",
        message: "Access denied. Admin privileges required.",
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search || "";

    const whereClause = search
      ? {
          [Op.or]: [
            { surname: { [Op.like]: `%${search}%` } },
            { othernames: { [Op.like]: `%${search}%` } },
            { email: { [Op.like]: `%${search}%` } },
          ],
        }
      : {};

    const { count, rows: users } = await Users.findAndCountAll({
      where: whereClause,
      attributes: { exclude: ["hash", "salt"] },
      limit,
      offset,
      order: [["created_at", "DESC"]],
    });

    res.status(200).json({
      status: "success",
      message: "Users retrieved successfully",
      data: {
        users,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(count / limit),
          totalItems: count,
          itemsPerPage: limit,
        },
      },
    });
  } catch (error) {
    console.error("Error in getAllUsers:", error);
    res.status(500).json({
      status: "error",
      message: error.message || "Failed to retrieve users",
    });
  }
};

/**
 * Get all groups with pagination
 */
const getAllGroups = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        status: "error",
        message: "Access denied. Admin privileges required.",
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const status = req.query.status || "";

    const whereClause = status ? { status } : {};

    const { count, rows: groups } = await CreateGroups.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Users,
          as: "creator",
          attributes: ["user_id", "surname", "othernames", "email"],
        },
        {
          model: Livestocks,
          as: "livestock",
          attributes: ["livestock_id", "name", "price"],
        },
      ],
      limit,
      offset,
      order: [["created_at", "DESC"]],
    });

    res.status(200).json({
      status: "success",
      message: "Groups retrieved successfully",
      data: {
        groups,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(count / limit),
          totalItems: count,
          itemsPerPage: limit,
        },
      },
    });
  } catch (error) {
    console.error("Error in getAllGroups:", error);
    res.status(500).json({
      status: "error",
      message: error.message || "Failed to retrieve groups",
    });
  }
};

/**
 * Get all transactions with pagination
 */
const getAllTransactions = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        status: "error",
        message: "Access denied. Admin privileges required.",
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const status = req.query.status || "";

    const whereClause = status ? { status } : {};

    const { count, rows: transactions } = await Transactions.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Users,
          as: "user",
          attributes: ["user_id", "surname", "othernames", "email"],
        },
      ],
      limit,
      offset,
      order: [["created_at", "DESC"]],
    });

    res.status(200).json({
      status: "success",
      message: "Transactions retrieved successfully",
      data: {
        transactions,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(count / limit),
          totalItems: count,
          itemsPerPage: limit,
        },
      },
    });
  } catch (error) {
    console.error("Error in getAllTransactions:", error);
    res.status(500).json({
      status: "error",
      message: error.message || "Failed to retrieve transactions",
    });
  }
};

/**
 * Get user details by ID
 */
const getUserById = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        status: "error",
        message: "Access denied. Admin privileges required.",
      });
    }

    const { userId } = req.params;

    const user = await Users.findOne({
      where: { user_id: userId },
      attributes: { exclude: ["hash", "salt"] },
      include: [
        {
          model: Wallets,
          as: "wallet",
          attributes: ["wallet_id", "balance"],
        },
      ],
    });

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    // Get user's groups
    const userGroups = await joinGroups.findAll({
      where: { user_id: userId },
      include: [
        {
          model: CreateGroups,
          as: "group",
          attributes: ["group_id", "groupName", "status", "slotPrice"],
        },
      ],
    });

    // Get user's transactions
    const userTransactions = await Transactions.findAll({
      where: { user_id: userId },
      order: [["created_at", "DESC"]],
      limit: 10,
    });

    res.status(200).json({
      status: "success",
      message: "User details retrieved successfully",
      data: {
        user,
        groups: userGroups,
        recentTransactions: userTransactions,
      },
    });
  } catch (error) {
    console.error("Error in getUserById:", error);
    res.status(500).json({
      status: "error",
      message: error.message || "Failed to retrieve user details",
    });
  }
};

/**
 * Update user status (activate/deactivate)
 */
const updateUserStatus = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        status: "error",
        message: "Access denied. Admin privileges required.",
      });
    }

    const { userId } = req.params;
    const { isActive } = req.body;

    const user = await Users.findOne({
      where: { user_id: userId },
    });

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    // Update user status (you might want to add an isActive field to the Users model)
    // For now, we'll update the email verification status as a proxy
    await user.update({
      is_email_verified: isActive,
    });

    res.status(200).json({
      status: "success",
      message: `User ${isActive ? "activated" : "deactivated"} successfully`,
    });
  } catch (error) {
    console.error("Error in updateUserStatus:", error);
    res.status(500).json({
      status: "error",
      message: error.message || "Failed to update user status",
    });
  }
};

/**
 * Get system analytics
 */
const getSystemAnalytics = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        status: "error",
        message: "Access denied. Admin privileges required.",
      });
    }

    // Get user growth over time (last 12 months)
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const userGrowth = await Users.findAll({
      attributes: [
        [
          sequelize.fn("DATE_FORMAT", sequelize.col("created_at"), "%Y-%m"),
          "month",
        ],
        [sequelize.fn("COUNT", sequelize.col("sn")), "count"],
      ],
      where: {
        created_at: {
          [Op.gte]: twelveMonthsAgo,
        },
      },
      group: [
        sequelize.fn("DATE_FORMAT", sequelize.col("created_at"), "%Y-%m"),
      ],
      order: [
        [
          sequelize.fn("DATE_FORMAT", sequelize.col("created_at"), "%Y-%m"),
          "ASC",
        ],
      ],
    });

    // Get transaction volume over time (last 12 months)
    const transactionVolume = await Transactions.findAll({
      attributes: [
        [
          sequelize.fn("DATE_FORMAT", sequelize.col("created_at"), "%Y-%m"),
          "month",
        ],
        [sequelize.fn("SUM", sequelize.col("amount")), "total"],
      ],
      where: {
        status: "success",
        created_at: {
          [Op.gte]: twelveMonthsAgo,
        },
      },
      group: [
        sequelize.fn("DATE_FORMAT", sequelize.col("created_at"), "%Y-%m"),
      ],
      order: [
        [
          sequelize.fn("DATE_FORMAT", sequelize.col("created_at"), "%Y-%m"),
          "ASC",
        ],
      ],
    });

    // Get group status distribution
    const groupStatusDistribution = await CreateGroups.findAll({
      attributes: [
        "status",
        [sequelize.fn("COUNT", sequelize.col("group_id")), "count"],
      ],
      group: ["status"],
    });

    res.status(200).json({
      status: "success",
      message: "System analytics retrieved successfully",
      data: {
        userGrowth,
        transactionVolume,
        groupStatusDistribution,
      },
    });
  } catch (error) {
    console.error("Error in getSystemAnalytics:", error);
    res.status(500).json({
      status: "error",
      message: error.message || "Failed to retrieve system analytics",
    });
  }
};

module.exports = {
  getDashboardStats,
  getAllUsers,
  getAllGroups,
  getAllTransactions,
  getUserById,
  updateUserStatus,
  getSystemAnalytics,
};
