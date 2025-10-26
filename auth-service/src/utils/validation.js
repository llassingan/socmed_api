const joi =  require('joi');

const validateRegistration = (data) => {
    const schema = joi.object({
        username: joi.string().alphanum().min(3).max(30).required(),
        email: joi.string().email().required(),
        firstname: joi.string().min(1).max(50).required(),
        lastname: joi.string().min(1).max(50).required(),
        password: joi.string().min(6).max(128).required(),
        role: joi.string().valid('user', 'admin').default('user')
    });
    return schema.validate(data);
}


const validateLogin = (data) => {
    const schema = joi.object({
        username: joi.string().alphanum().min(3).max(30).required(),
        password: joi.string().min(6).max(128).required(),
    });
    return schema.validate(data);
}

module.exports = {
    validateRegistration,
    validateLogin
}