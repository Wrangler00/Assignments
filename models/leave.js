var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var leave_schema = new Schema({
	empId: {type:String,unique:true},
	reason: String,
	startDate: Date,
	endDate: Date,
	status: String
});

var leave = module.exports = mongoose.model('leave',leave_schema);