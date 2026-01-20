const express = require('express');
const router = express.Router();
const {
    getMedicines,
    createMedicine,
    updateMedicine,
    deleteMedicine,
} = require('../controllers/medicineController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(protect, getMedicines).post(protect, createMedicine);
router.route('/:id').put(protect, updateMedicine).delete(protect, deleteMedicine);

module.exports = router;
