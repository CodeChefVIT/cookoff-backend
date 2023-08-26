const mongoose = require('mongoose')
const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },
        email: {
            type: String, 
            required: true
        },
        regNo: {
            type: String,
            required: true
        },
        refreshToken: {
            type: String
        },
        userRole: {
            type: String,
            enum: ['user','admin'],
            default: 'user'
        },
        isActive: {
            type: Boolean,
            default: true
        },
        roundQualified: {
            type: Number,
            default: 0
        },
        password: {
            type: String,
            required: true
        }
    },
    {
        timestamps: true
    }
);
const User = mongoose.model('User',userSchema)
module.exports=User;