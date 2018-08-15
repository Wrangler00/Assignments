const mysql = require('mysql');
const auth = require('../auth/auth.js');
var con = mysql.createConnection({
  host: auth.host,
  user: auth.user,
  password: auth.password,
  database: auth.database
});

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");

  var empSql = "CREATE TABLE IF NOT EXISTS `employee` (fullName VARCHAR(255), empId VARCHAR(255), email VARCHAR(255), profile VARCHAR(255), password VARCHAR(255))";
  var leaveSql = "CREATE TABLE IF NOT EXISTS `leve` (leveID VARCHAR(255),empId VARCHAR(255), reason VARCHAR(255), startDate DATE, endDate DATE, totalDays INT, status VARCHAR(255))";
  con.query(empSql, function (err, result) {
    if (err) throw err;
    console.log("Employee Table created");
  });

  con.query(leaveSql, function (err, result) {
    if (err) throw err;
    console.log("Leave Table created");
  });
});

module.exports.saveEmployee = data=>{
	return new Promise((resolve,reject)=>{
		var fullName = data.fullname;
		var empId = data.empId;
		var email = data.email;
		var profile = data.profile;
		var password = data.password;
		var query = "INSERT INTO `employee` (fullName,empId,email,profile,password) VALUES ('"+fullName+"','"+empId+"','"+email+"','"+profile+"','"+password+"')";
		con.connect(err=>{con.query(query,(err,result)=>{if(err) return reject(err);return resolve()})});
	});
}

module.exports.authorizeEmployee = data=>{
	return new Promise((resolve,reject)=>{
		var empId = data.empId;
		var password = data.password;
		var query = "SELECT * FROM `employee` WHERE empId = ? AND password = ?";
		con.connect(err=>{con.query(query,[empId,password],(err,result)=>{if(err) return reject(err);return resolve(result)})});
	});
}

module.exports.saveLeave = data=>{
	return new Promise((resolve,reject)=>{
		var leveId = Math.random().toString(36).substring(7);
		var empId = data.empId;
		var startDate = data.startDate;
		var endDate = data.endDate;
		var reason = data.reason;
		var status = "pending";
		var totalWorkDays = data.totalWorkDays;

		var query = "INSERT INTO `leve` (leveID,empId,reason,startDate,endDate,totalDays,status) VALUES ('"+leveId+"','"+empId+"','"+reason+"','"+startDate+"','"+endDate+"','"+totalWorkDays+"','"+status+"')";
		con.connect(err=>{con.query(query,(err,result)=>{if(err) return reject(err);return resolve()})});
	});
}

module.exports.getLeave = (empId,profile)=>{
	return new Promise((resolve,reject)=>{
		if(profile == "employee"){
			var query = "SELECT * FROM `leve` WHERE empId = ?";
			con.connect(err=>{con.query(query,[empId],(err,result)=>{if(err) return reject(err);return resolve(result)})});
		}else{
			var query = "SELECT * FROM `leve`";
			con.connect(err=>{con.query(query,(err,result)=>{if(err) return reject(err);return resolve(result)})});
		}
	});
}

module.exports.updateStatus = (leveId,status)=>{
	return new Promise((resolve,reject)=>{
		var uptStatus;
		if(status == "accept")	uptStatus = "yes";
		else uptStatus = "no";

		var query = "UPDATE `leve` SET status = '"+uptStatus+"' WHERE leveId = '"+leveId+"'";
		con.connect(err=>{con.query(query,(err,result)=>{if(err) return reject(err);return resolve()})});
	});
}
