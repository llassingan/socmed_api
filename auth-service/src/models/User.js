const mongoose = require('mongoose');
const argon2 = require('argon2');

const UserSchema = new mongoose.Schema({
    username:{
        type:String,
        required:true,
        unique:true,
        trim: true
    },
    email:{
        type:String,
        required:true,
        unique:true,
        trim: true,
        lowercase: true
    },
    firstname:{
        type:String,
        required:true,
        trim: true
    },
    lastname:{
        type:String,
        required:true,
        trim: true
    },
    password:{
        type:String,
        required:true,
        trim: true,
        select: false // to exclude password from query results
    },
    role:{
        type:String,
        enum: ['user', 'admin'],
        default:'user'
    },
    createdAt:{
        type:Date,
        default:Date.now
    }
    
}, {timestamps: true})


// hash the passowrd
UserSchema.pre('save', async function(next){
    if(!this.isModified('password')){
        return next();
    }
    try{
        const hashedPassword = await argon2.hash(this.password);
        this.password = hashedPassword;
        return next();
    }catch(err){
        return next(err);
    }
})



UserSchema.methods.comparePassword = async function(password){ 
    try{
        return await argon2.verify(this.password, password);
    }catch(err){
        throw new Error(err);
    }
}

// create index by username
UserSchema.index({username: 'text'})

module.exports = mongoose.model('User', UserSchema);