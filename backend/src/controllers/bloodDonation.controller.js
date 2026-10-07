const BloodDonation = require("../models/BloodDonation");
const BloodInventory = require("../models/BloodInventory");

const generateDonationId = () => {
  return `DON-${Math.floor(100000 + Math.random() * 900000)}`;
};

const createBloodDonation = async (req, res, next) => {
  try {
    const {
      donorName,
      donorPhone,
      donorBloodGroup,
      componentType,
      unitsDonated,
      expiryDate,
      screeningStatus,
      donationStatus,
      remarks,
    } = req.body;

    if (
      !donorName ||
      !donorPhone ||
      !donorBloodGroup ||
      !componentType ||
      !unitsDonated ||
      !expiryDate
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Donor name, phone, blood group, component type, units and expiry date are required",
      });
    }

    const donation = await BloodDonation.create({
      donationId: generateDonationId(),
      donorName,
      donorPhone,
      donorBloodGroup,
      componentType,
      unitsDonated,
      expiryDate,
      screeningStatus: screeningStatus || "PENDING",
      donationStatus: donationStatus || "REGISTERED",
      collectedBy: req.user.userId,
      remarks: remarks || "",
    });

    res.status(201).json({
      success: true,
      message: "Blood donation registered successfully",
      donation,
    });
  } catch (error) {
    next(error);
  }
};

const getBloodDonations = async (req, res, next) => {
  try {
    const donations = await BloodDonation.find()
      .populate("collectedBy", "name email role")
      .sort({ donationDate: -1 });

    res.status(200).json({
      success: true,
      count: donations.length,
      donations,
    });
  } catch (error) {
    next(error);
  }
};

const getBloodDonationById = async (req, res, next) => {
  try {
    const donation = await BloodDonation.findById(req.params.id)
      .populate("collectedBy", "name email role");

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: "Blood donation not found",
      });
    }

    res.status(200).json({
      success: true,
      donation,
    });
  } catch (error) {
    next(error);
  }
};

const updateBloodDonationStatus = async (req, res, next) => {
  try {
    const {
      screeningStatus,
      donationStatus,
    } = req.body;

    const donation = await BloodDonation.findById(req.params.id);

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: "Blood donation not found",
      });
    }

    if (screeningStatus) {
      donation.screeningStatus = screeningStatus;
    }

    if (donationStatus) {
      donation.donationStatus = donationStatus;
    }

    await donation.save();

    res.status(200).json({
      success: true,
      message: "Blood donation status updated successfully",
      donation,
    });
  } catch (error) {
    next(error);
  }
};

const acceptBloodDonation = async (req, res, next) => {
  try {
    const donation = await BloodDonation.findById(req.params.id);

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: "Blood donation not found",
      });
    }

    if (donation.screeningStatus !== "PASSED") {
      return res.status(400).json({
        success: false,
        message:
          "Donation must pass screening before it can be accepted",
      });
    }

    if (donation.donationStatus === "ACCEPTED") {
      return res.status(400).json({
        success: false,
        message: "This donation has already been accepted",
      });
    }

    donation.donationStatus = "ACCEPTED";
    await donation.save();

    let inventory = await BloodInventory.findOne({
      bloodGroup: donation.donorBloodGroup,
      componentType: donation.componentType,
      expiryDate: donation.expiryDate,
      active: true,
    });

    if (inventory) {
      inventory.unitsAvailable += donation.unitsDonated;

      inventory.status =
        inventory.unitsAvailable <= inventory.minimumRequiredUnits
          ? "LOW_STOCK"
          : "AVAILABLE";

      inventory.lastUpdatedBy = req.user.userId;

      await inventory.save();
    } else {
      inventory = await BloodInventory.create({
        bloodGroup: donation.donorBloodGroup,
        componentType: donation.componentType,
        unitsAvailable: donation.unitsDonated,
        minimumRequiredUnits: 5,
        expiryDate: donation.expiryDate,
        storageLocation: "Blood Bank",
        status:
          donation.unitsDonated <= 5
            ? "LOW_STOCK"
            : "AVAILABLE",
        lastUpdatedBy: req.user.userId,
        active: true,
      });
    }

    res.status(200).json({
      success: true,
      message:
        "Blood donation accepted and inventory updated successfully",
      donation,
      inventory,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBloodDonation,
  getBloodDonations,
  getBloodDonationById,
  updateBloodDonationStatus,
  acceptBloodDonation,
};