const { Schema, model, default: mongoose } = require("mongoose");

const submission_schema = new Schema({
    regNo: { type: String, required: true },
    language_id: { type: Number, required: true },
    code: { type: String, required: true },
    max_score: { type: Number, required: true },
    question_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Questions",
        required: true,
    },
    score: { type: Number },
    lastResults: [[{ type: Boolean }]],
    allPassesAt: { type: Date },
    runtime: {type: Number, required: true},
    testcases_passed : {type:Number},
}, { timestamps: true });

const submission_db = model("Submissions", submission_schema);

module.exports = submission_db;
