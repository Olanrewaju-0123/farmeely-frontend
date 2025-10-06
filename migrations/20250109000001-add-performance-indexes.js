"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Add indexes for better query performance

    // Users table indexes
    try {
      await queryInterface.addIndex("Users", ["email"], {
        name: "idx_users_email",
        unique: true,
      });
    } catch (error) {
      console.log(
        "Index idx_users_email already exists or error:",
        error.message
      );
    }

    try {
      await queryInterface.addIndex("Users", ["user_id"], {
        name: "idx_users_user_id",
        unique: true,
      });
    } catch (error) {
      console.log(
        "Index idx_users_user_id already exists or error:",
        error.message
      );
    }

    try {
      await queryInterface.addIndex("Users", ["is_email_verified"], {
        name: "idx_users_email_verified",
      });
    } catch (error) {
      console.log(
        "Index idx_users_email_verified already exists or error:",
        error.message
      );
    }

    // CreateGroups table indexes
    await queryInterface.addIndex("createGroups", ["status"], {
      name: "idx_groups_status",
    });

    await queryInterface.addIndex("createGroups", ["created_by"], {
      name: "idx_groups_created_by",
    });

    await queryInterface.addIndex("createGroups", ["group_id"], {
      name: "idx_groups_group_id",
      unique: true,
    });

    await queryInterface.addIndex("createGroups", ["livestock_id"], {
      name: "idx_groups_livestock_id",
    });

    // JoinGroups table indexes
    await queryInterface.addIndex("JoinGroups", ["user_id"], {
      name: "idx_join_groups_user_id",
    });

    await queryInterface.addIndex("JoinGroups", ["group_id"], {
      name: "idx_join_groups_group_id",
    });

    await queryInterface.addIndex("JoinGroups", ["status"], {
      name: "idx_join_groups_status",
    });

    // Transactions table indexes
    await queryInterface.addIndex("Transactions", ["user_id"], {
      name: "idx_transactions_user_id",
    });

    await queryInterface.addIndex("Transactions", ["payment_reference"], {
      name: "idx_transactions_payment_ref",
      unique: true,
    });

    await queryInterface.addIndex("Transactions", ["status"], {
      name: "idx_transactions_status",
    });

    await queryInterface.addIndex("Transactions", ["created_at"], {
      name: "idx_transactions_created_at",
    });

    // Wallets table indexes
    await queryInterface.addIndex("Wallets", ["user_id"], {
      name: "idx_wallets_user_id",
      unique: true,
    });

    await queryInterface.addIndex("Wallets", ["wallet_id"], {
      name: "idx_wallets_wallet_id",
      unique: true,
    });

    // Livestock table indexes
    await queryInterface.addIndex("Livestock", ["available"], {
      name: "idx_livestock_available",
    });

    await queryInterface.addIndex("Livestock", ["livestock_id"], {
      name: "idx_livestock_livestock_id",
      unique: true,
    });

    // OTP tables indexes
    await queryInterface.addIndex("Otps", ["email"], {
      name: "idx_otps_email",
    });

    await queryInterface.addIndex("Otps", ["expires_at"], {
      name: "idx_otps_expires_at",
    });

    await queryInterface.addIndex("ResetOtps", ["email"], {
      name: "idx_reset_otps_email",
    });

    // PendingPayments table indexes
    await queryInterface.addIndex("PendingPayments", ["user_id"], {
      name: "idx_pending_payments_user_id",
    });

    await queryInterface.addIndex("PendingPayments", ["paymentReference"], {
      name: "idx_pending_payments_ref",
      unique: true,
    });

    await queryInterface.addIndex("PendingPayments", ["status"], {
      name: "idx_pending_payments_status",
    });
  },

  async down(queryInterface, Sequelize) {
    // Remove all indexes
    const indexes = [
      "idx_users_email",
      "idx_users_user_id",
      "idx_users_email_verified",
      "idx_groups_status",
      "idx_groups_created_by",
      "idx_groups_group_id",
      "idx_groups_livestock_id",
      "idx_join_groups_user_id",
      "idx_join_groups_group_id",
      "idx_join_groups_status",
      "idx_transactions_user_id",
      "idx_transactions_payment_ref",
      "idx_transactions_status",
      "idx_transactions_created_at",
      "idx_wallets_user_id",
      "idx_wallets_wallet_id",
      "idx_livestock_available",
      "idx_livestock_livestock_id",
      "idx_otps_email",
      "idx_otps_expires_at",
      "idx_reset_otps_email",
      "idx_pending_payments_user_id",
      "idx_pending_payments_ref",
      "idx_pending_payments_status",
    ];

    for (const index of indexes) {
      try {
        await queryInterface.removeIndex("Users", index);
      } catch (e) {
        // Index might not exist, continue
      }
    }
  },
};
