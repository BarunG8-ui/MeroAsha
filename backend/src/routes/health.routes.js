const express = require("express");

const router = express.Router();

router.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "MeroAsha API is running",
    service: "MeroAsha Hospital Management System"
  });
});

module.exports = router;