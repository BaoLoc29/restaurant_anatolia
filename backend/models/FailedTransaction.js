import mongoose from 'mongoose';

const failedTransactionSchema = new mongoose.Schema({
    name: String,
    email: String,
    phone: String,
    date: String,
    time: String,
    guests: Number,
    notes: String,
    deposit: Boolean,
    depositAmount: Number,
    status: String,
    createdAt: { type: Date, default: Date.now },

});

const FailedTransaction = mongoose.model('FailedTransaction', failedTransactionSchema);

export { FailedTransaction };