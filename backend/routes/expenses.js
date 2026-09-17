const express = require('express');
const router = express.Router();
const Expense = require('../models/Expense');
const authMiddleware = require('../middleware/auth');

// Protect all routes below with authentication
router.use(authMiddleware);

// 1. GET ALL EXPENSES FOR CURRENT USER
router.get('/', async (req, res) => {
    try {
        const expenses = await Expense.find({ userId: req.user.id }).sort({ createdAt: -1 });
        res.json(expenses);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching expenses', error: err.message });
    }
});

// 2. ADD A NEW EXPENSE
router.post('/', async (req, res) => {
    try {
        const { desc, amount, cat, date, isoDate } = req.body;

        if (!desc || !amount || !cat || !date || !isoDate) {
            return res.status(400).json({ message: 'Please provide all required expense fields' });
        }

        const newExpense = new Expense({
            userId: req.user.id,
            desc,
            amount: Number(amount),
            cat,
            date,
            isoDate
        });

        const savedExpense = await newExpense.save();
        res.status(201).json(savedExpense);
    } catch (err) {
        res.status(500).json({ message: 'Error saving expense', error: err.message });
    }
});

// 3. DELETE AN EXPENSE BY ID
router.delete('/:id', async (req, res) => {
    try {
        const expense = await Expense.findById(req.params.id);

        if (!expense) {
            return res.status(404).json({ message: 'Expense not found' });
        }

        // Verify the user owns this expense
        if (expense.userId.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to delete this expense' });
        }

        await Expense.findByIdAndDelete(req.params.id);
        res.json({ message: 'Expense deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting expense', error: err.message });
    }
});

module.exports = router;