const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    desc: { type: String, required: true },
    amount: { type: Number, required: true },
    cat: { type: String, required: true },
    date: { type: String, required: true },
    isoDate: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Expense', expenseSchema);