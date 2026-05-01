import mongoose, { Schema } from 'mongoose';

const salaryRecordSchema = new Schema({
    employee: { type: Schema.Types.ObjectId, ref: 'Employee', required: true },
    month: { type: Number, required: true }, // e.g. 1 for January
    year: { type: Number, required: true }, // e.g. 2024
    baseSalary: { type: Number, required: true, default: 0 },
    totalWorkedHours: { type: Number, default: 0 },
    requiredHours: { type: Number, required: true, default: 160 },
    
    // Deductions
    shortageHours: { type: Number, default: 0 },
    deductionAmount: { type: Number, default: 0 },
    
    // Overtime
    overtimeHours: { type: Number, default: 0 },
    overtimePay: { type: Number, default: 0 },
    
    // Bonuses
    bonusesAmount: { type: Number, default: 0 },
    bonusesDetails: [{ reason: String, amount: Number }],
    
    // Final Calculation
    netSalary: { type: Number, required: true },
    status: { type: String, enum: ['pending', 'paid'], default: 'pending' },
    paidAt: { type: Date }
}, { timestamps: true });

export default mongoose.model('SalaryRecord', salaryRecordSchema);
