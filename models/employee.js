var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var emp_schema = new Schema({
	fullName: {type:String},
	id: {type:String,unique:true},
	profile: {type:String},
	email:{type:String},
	password:{type:String}
});

var emp = module.exports = mongoose.model('employee',emp_schema);