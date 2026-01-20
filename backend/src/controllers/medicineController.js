const Medicine = require('../models/Medicine');

// @desc    Get all medicines for logged in user
// @route   GET /api/medicines
// @access  Private
const getMedicines = async (req, res) => {
    const medicines = await Medicine.find({ userId: req.user._id });
    res.json(medicines);
};

// @desc    Create a medicine
// @route   POST /api/medicines
// @access  Private
const createMedicine = async (req, res) => {
    const { name, dosage, times, instructions } = req.body;

    if (!name || !dosage || !times || times.length === 0) {
        return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const medicine = new Medicine({
        userId: req.user._id,
        name,
        dosage,
        times,
        instructions,
    });

    const createdMedicine = await medicine.save();
    res.status(201).json(createdMedicine);
};

// @desc    Update a medicine
// @route   PUT /api/medicines/:id
// @access  Private
const updateMedicine = async (req, res) => {
    const medicine = await Medicine.findById(req.params.id);

    if (!medicine) {
        return res.status(404).json({ message: 'Medicine not found' });
    }

    if (medicine.userId.toString() !== req.user._id.toString()) {
        return res.status(401).json({ message: 'Not authorized' });
    }

    const { name, dosage, times, instructions } = req.body;

    medicine.name = name || medicine.name;
    medicine.dosage = dosage || medicine.dosage;
    medicine.times = times || medicine.times;
    medicine.instructions = instructions || medicine.instructions;

    const updatedMedicine = await medicine.save();
    res.json(updatedMedicine);
};

// @desc    Delete a medicine
// @route   DELETE /api/medicines/:id
// @access  Private
const deleteMedicine = async (req, res) => {
    const medicine = await Medicine.findById(req.params.id);

    if (!medicine) {
        return res.status(404).json({ message: 'Medicine not found' });
    }

    if (medicine.userId.toString() !== req.user._id.toString()) {
        return res.status(401).json({ message: 'Not authorized' });
    }

    await medicine.deleteOne(); // updated from remove() which is deprecated in newer mongoose
    res.json({ message: 'Medicine removed' });
};

module.exports = {
    getMedicines,
    createMedicine,
    updateMedicine,
    deleteMedicine,
};
