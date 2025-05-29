import express from "express";
import config from "../config.js";
import bcrypt from "bcrypt";

const router = express.Router();
const db = config.mySqlDriver;

const sanitize = (obj) =>
  Object.fromEntries(
    Object.entries(obj).map(([k, v]) => [k, v === undefined ? null : v])
  );

router.post("/submit-detailed-form", async (req, res) => {
  try {
    const rawData = sanitize(req.body);

    const {
      // Common borrower details
      first_name,
      middle_name,
      last_name,
      contact_number,
      email,
      gender,
      nationality,
      address_region,
      address_province,
      address_city,
      address_barangay,
      zip_code,
      date_of_birth,
      birth_place,
      residence_type,
      valid_id,
      income_proof,
      employment_type,
      is_assigned_to_a_collector,

      // Employed-specific
      work_type,
      position,
      job_status,
      company_name,
      monthly_income_employed,
      employment_year,
      school_address,
      atm_card_number_employed,
      account_number_employed,

      // Nonemployed-specific
      income_source,
      business_type,
      business_name,
      business_address,
      monthly_income_nonemployed,
      pensioner,
      monthly_pension,
      atm_card_number_nonemployed,
      account_number_nonemployed,
    } = rawData;

    // Normalize based on employment type
    const monthly_income =
      employment_type === "Employed"
        ? monthly_income_employed
        : monthly_income_nonemployed;

    const atm_card_number =
      employment_type === "Employed"
        ? atm_card_number_employed
        : atm_card_number_nonemployed;

    const account_number =
      employment_type === "Employed"
        ? account_number_employed
        : account_number_nonemployed;

    // Validation
    if (employment_type === "Employed" && !valid_id) {
      return res.status(400).json({ message: "Valid ID is required" });
    }

    if (employment_type === "Nonemployed" && !income_proof) {
      return res.status(400).json({
        message: "Income Proof is required for nonemployed borrowers",
      });
    }

    // Step 1: Create user_account first (borrower_id is null for now)
    const rawPassword = Math.random().toString(36).slice(-8);
    // const hashedPassword = await bcrypt.hash(rawPassword, 10);

    const [userResult] = await db.execute(
      `INSERT INTO user_account (
        user_id,
        username,
        password,
        role_id,
        borrower_id,
        collector_id,
        admin_id,
        officer_id,
        is_verified
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [null, email, rawPassword, 4, null, null, null, null, 1]
    );

    const userId = userResult.insertId;

    // Step 2: Insert borrower_account with the generated user_id
    // Determine is_assigned_to_a_collector value
    let assignedToCollector = is_assigned_to_a_collector;
    const collectorId = rawData.collector_id || null;
    if (collectorId !== null) {
      assignedToCollector = "yes";
    }

    const [borrowerResult] = await db.execute(
      `INSERT INTO borrower_account (
      first_name,
      middle_name,
      last_name,
      contact_number,
      email,
      gender,
      nationality,
      address_region,
      address_province,
      address_city,
      address_barangay,
      zip_code,
      employment_type,
      date_of_birth,
      birth_place,
      residence_type,
      valid_id,
      user_id,
      is_assigned_to_a_collector
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,

      [
        first_name,
        middle_name,
        last_name,
        contact_number,
        email,
        gender,
        nationality,
        address_region,
        address_province,
        address_city,
        address_barangay,
        zip_code,
        employment_type,
        date_of_birth,
        birth_place,
        residence_type,
        valid_id,
        userId,
        assignedToCollector,
      ]
    );

    const borrowerId = borrowerResult.insertId;

    // Step 3: Update user_account with borrower_id
    await db.execute(
      `UPDATE user_account SET borrower_id = ? WHERE user_id = ?`,
      [borrowerId, userId]
    );

    // Step 4: Insert into employed or nonemployed details
    if (employment_type === "Employed") {
      await db.execute(
        `INSERT INTO employed_details 
        (borrower_id, work_type, position, job_status, company_name, monthly_income, employment_year, school_address, atm_card_number, account_number) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          borrowerId,
          work_type,
          position,
          job_status,
          company_name,
          monthly_income,
          employment_year,
          school_address,
          atm_card_number,
          account_number,
        ]
      );
    } else if (employment_type === "Nonemployed") {
      await db.execute(
        `INSERT INTO nonemployed_details 
        (borrower_id, income_source, income_proof, monthly_income, business_type, business_name, business_address, pensioner, monthly_pension, atm_card_number, account_number) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          borrowerId,
          income_source,
          income_proof,
          monthly_income,
          business_type,
          business_name,
          business_address,
          pensioner,
          monthly_pension,
          atm_card_number,
          account_number,
        ]
      );
    }

    if (collectorId !== null) {
      // Insert into collector_borrower
      await db.execute(
        `INSERT INTO collector_borrower (borrower_id, collector_id) VALUES (?, ?)`,
        [borrowerId, collectorId]
      );

      // Update collector_account to increment no_of_borrowers
      await db.execute(
        `UPDATE collector_account SET no_of_borrowers = no_of_borrowers + 1 WHERE collector_id = ?`,
        [collectorId]
      );
    }

    res.status(201).json({ message: "Form submitted successfully." });
  } catch (error) {
    console.error("Error submitting form:", error);
    res.status(500).json({ message: "Error submitting form", error });
  }
});

// Assign Borrower to Collector (POST)
router.post("/assign-borrower-to-collector", async (req, res) => {
  try {
    const { borrower_id, collector_id } = req.body;

    if (!borrower_id || !collector_id) {
      return res
        .status(400)
        .json({ message: "borrower_id and collector_id are required" });
    }

    // Insert into collector_borrower
    await db.execute(
      `INSERT INTO collector_borrower (borrower_id, collector_id) VALUES (?, ?)`,
      [borrower_id, collector_id]
    );

    // Update borrower_account to set is_assigned_to_a_collector = 'yes'
    await db.execute(
      `UPDATE borrower_account SET is_assigned_to_a_collector = 'yes' WHERE borrower_id = ?`,
      [borrower_id]
    );

    // Update collector_account to increment no_of_borrowers
    await db.execute(
      `UPDATE collector_account SET no_of_borrowers = no_of_borrowers + 1 WHERE collector_id = ?`,
      [collector_id]
    );

    res
      .status(200)
      .json({ message: "Borrower assigned to collector successfully." });
  } catch (error) {
    console.error("Error assigning borrower to collector:", error);
    res
      .status(500)
      .json({ message: "Error assigning borrower to collector", error });
  }
});

export default router;
