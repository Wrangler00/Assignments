const express = require('express');
const router = express.Router();
const dbHandler = require('../dbHandler/dbHandler.js');
const chatHandler = require('../app.js');
const auth = require('../auth/auth.js');
var HolidayAPI = require('node-holidayapi');
var hapi = new HolidayAPI(auth.holidayApiKey).v1;

function countPublicHolidays(d0,d1){

	var date1 = new Date(d0);
	var date2 = new Date(d1);
	var count = 0;

	var year = date1.getYear();

	var parameters = {
	  country: 'IN',
	  year:    year,
	};

	return new Promise((resolve,reject)=>{
		hapi.holidays(parameters,(err, data)=>{
		  if(err)	{
		  	console.error(err);
		  	reject(err);
		  }
		  var holidays = data.holidays;
		  for (var key in holidays) {
		    if (holidays.hasOwnProperty(key)) {
		        var tempDate = new Date(key);
		        if(tempDate>=date1 && tempDate<=date2)
		        	count++;
		    }
		  }

		  resolve(count);
		});
	});
}


function countWeekendDays( d0, d1 )
{
	d0 = new Date(d0);
	d1 = new Date(d1);
  	var ndays = 1 + Math.round((d1.getTime()-d0.getTime())/(24*3600*1000));
  	var nsaturdays = Math.floor( (d0.getDay()+ndays) / 7 );
  	return Promise.resolve(2*nsaturdays + (d0.getDay()==0) - (d1.getDay()==6));
}

function countAllDays(d0 , d1){
	var oneDay = 24*60*60*1000;
	var firstDate = new Date(d0);
	var secondDate = new Date(d1);

	return Math.round(Math.abs((firstDate.getTime() - secondDate.getTime())/(oneDay)));
}

function restricted(req,res,next){
	if(req.session.user)	return next();
	res.redirect('/login');
}

router.get('/',restricted,(req,res)=>{
	res.redirect('/saveLeave');
});

router.get('/login',(req,res)=>{
	res.render('login.html');
});

router.post('/login',(req,res)=>{
	console.log(req.body);
	
	dbHandler.authorizeEmployee(req.body).then(result=>{
		console.log(result);
		if(result.length>0){
			console.log("login successfully");
			console.log(result);
			
			req.session.user = true;
			req.session.empId = req.body.empId;
			req.session.profile = result[0].profile; 

			res.redirect('/viewLeave');
		}else{
			res.redirect('/login');
		}
	}).catch(err=>{
		console.error(err);
		res.send(err);
	});
});

router.get('/register',(req,res)=>{
	res.render('register.html');
});

router.post('/register',(req,res)=>{
	console.log(req.body);
	
	dbHandler.saveEmployee(req.body).then(result=>{
		res.redirect('/login');
	}).catch(err=>{
		console.error(err);
		res.redirect('/login');
	});
});

router.get('/saveLeave',restricted,(req,res)=>{
	res.render('leave.html');
});

router.post('/saveLeave',restricted,(req,res)=>{
	console.log(req.body);

	var payload = req.body;
	var startDate = payload.startDate;
	var endDate = payload.endDate;
	
	Promise.all([countWeekendDays(startDate,endDate),countPublicHolidays(startDate,endDate)]).then((data)=>{
		var holidays = data[0]+data[1];
		payload.totalWorkDays = countAllDays(startDate,endDate)-holidays;
		payload.empId = req.session.empId
		return dbHandler.saveLeave(payload);
	}).then(result=>{
		res.redirect('/viewLeave');
	}).catch(err=>{
		console.error(err);
		res.redirect('/viewLeave');
	});
});

router.get('/viewLeave',restricted,(req,res)=>{
	var empId = req.session.empId;
	var profile = req.session.profile;

	dbHandler.getLeave(empId,profile).then(result=>{
		console.log(result);
		var returnJson = {leaves:result};
		if(profile == "manager")
			returnJson.profile = true;
		res.render('viewLeave.html',returnJson);
	}).catch(err=>{
		console.error(err);
		res.render('viewLeave.html');
	});
});

router.get('/updateStatus',restricted,(req,res)=>{
	var query = req.query;
	console.log(query);
	dbHandler.updateStatus(query.leveID,query.status).then(result=>{
		res.redirect('/viewLeave');
	}).catch(err=>{
		console.error(err);
		res.redirect('/viewLeave');
	});
});

router.get('/logout',(req,res)=>{
	req.session.user = false;
	res.redirect('/login');
});

module.exports = router;