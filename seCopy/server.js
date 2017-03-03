//Creates an Express application. The express() 
//function is a top-level function exported by the
// express module.
var express=require('express');
var bodyParser = require('body-parser');
//path is used to simplify the file path
var path=require('path');
var app =express();
var expressValidator=require('express-validator');
var session = require('express-session');
var passport =require('passport');
var mongoose=require('mongoose');
var jwt=require('jsonwebtoken');
var JwtStrategy=require('passport-jwt').Strategy;
var ExtractJwt=require('passport-jwt').ExtractJwt;
var flash   = require('connect-flash');
var config  =require('./config/database');
var morgan       = require('morgan');
var Strategy=require('passport-local').Strategy;
var Student=require('./models/student');
var Client=require('./models/client');
var StudentWork=require('./models/studentWork');
var jwtE = require('express-jwt');
var mongoosePaginate = require('mongoose-paginate');

var cookieParser = require('cookie-parser')
var cookieSession = require('cookie-session');
var multer  = require('multer');
var storage=multer.diskStorage({
	destination : function(req,file,cb){
		cb(null,'./public/uploads/')
	},
	filename:function(req,file,cb){
		cb(null,Date.now()+file.originalname);
	}
});
var upload = multer({ storage:storage });
var s;
mongoose.connect(config.database);
var db=mongoose.connection;
console.log(mongoose.connection.readyState);

db.on('error', console.error.bind(console, 'connection error:'));

db.once('open', function() {
  console.log('gazma');

app.use(flash());

app.use(cookieParser('secret'));
app.use(cookieSession({
  name: 'session',
  keys: 'secret',
  maxAge: 24 * 60 * 60 * 1000 // 24 hours 
}));
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true
}))

var logger=function(req,res,next){
console.log('reload ....');
next();
}

app.use(logger);

// use the middleware function to parse the text as json and expose the resulting object on req.body (to handel json content)

app.use(bodyParser.json());
//use the middleware tht parses the text as URL encoded data  and expose the resulting object (containing the keys and values) on req.body
app.use(bodyParser.urlencoded({extended : false}));

//Express Vaildator Middleware
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
      var namespace = param.split('.')
      , root    = namespace.shift()
      , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));




//template engines ejs (embeded javascript)standard html with variables includes 
//set the middleware of ejs
app.set('view engine','ejs');
app.set('views',path.join(__dirname,'views'));


//Global Vars
//The function is executed every time the app receives a request
app.use(function(req,res,next){
	res.locals.errors=null;
	next();
	
});

//handel requests to the homepage"/"
// function is a call back function 
app.get("/",function(req,res){

	//the difference between send and send file is tht send prints anyting onto the screen 
	//to render a view
res.render('index',{title:'MET and BI '});

});

app.post('/upload',upload.any(),function(req,res){
	//res.send(req.files[0].encoding);
	console.log(req.files[0].encoding);
console.log(req.files)
	var id=s.id;
	var name=s.name;
	Student.findById(id,function(err,user){
		if(err)throw err;
		else{
			var profilephoto=user.work[0];
			var filename=req.files[0].filename
			user.work.push(filename);
			console.log('filename');
			console.log(filename);
			user.save();
			name=s.name;
			res.render('studentView',{name:name , profilephoto:profilephoto});
		}
			// for(var i=0;i<(user.work).length;i++){

			// }
		});
	console.log(id);
	
	

});

app.post('/student/summary',function(req,res){
	var id=s.id;
	var name=s.username;
	var query = Student.findById({_id: id});
	query.select('work ');
	
	query.exec(function (err, students) {
  if (err) throw err ;
  // athletes contains an ordered list of 5 athletes who play Tennis
  		res.render('summary',{students :students});
})

});

app.post('/students/summary',function(req,res){
	var query = Student.find({ });
	query.select('username work[0] work[1] profilePhoto');
	query.limit(10);
	query.exec(function (err, students) {
  if (err) throw err ;
  // athletes contains an ordered list of 5 athletes who play Tennis
  		res.render('summary',{students :students});
})

});

// app.post('/student/work',function(req,res){
// 	var id=s.id;
// 	var name=s.name;
// 	Studnt.findById(id,function(err,user){
// 		if(err)throw err;
// 		else{
// 			for()
// 		}
// 	});

// });
app.post("/student/add/reg",function(req,res){
			var name=req.body.name_USR
			var password=req.body.password_USR
	
Student.getStudentByName(name ,(err,user)=>{
	if(err)throw err;
	if(!user){
		//res.json({success:false ,msg:'User not found'});
		res.render('error');
		return console.log('Not Found');
	}else{
	Student.comparePassword(password,user.password,function(err,isMatch){
		if(err) throw err;
		if(isMatch){
			//jwt.sign(payload, secretOrPrivateKey, options, [callback])
			var token= jwt.sign(user,'secret',{
				expiresIn:604800
			});
			
			s=req.session
			s.id=user._id;
			s.name=user.username;
			res.render('uploadPorto',{name:name});
			console.log(s.id);

		}else{
			res.json({success:false,msg:'student not found'});
			//res.render('error');
		}
	});
}
});

});
app.post('/redirect',function(req,res){

	 res.render('index',{title:'MET and BI '});

});

app.post('/client/reg',function(req,res){
		var newstudent=new Client({
		username:req.body.reg_name,
		password:req.body.reg_password
	});
	
Client.addUser(newstudent,(err,user)=>{
	if(err){
		//res.json({success:false,msg:'Failed to register user'});
		res.render('error');
		
	}else{
		//res.json({sucess:true,mssg:'User register'});
		res.render('successReg');
			}
});
	});

app.post('/client/add',function(req,res){

	var name=req.body.cltname;
	var password=req.body.cltpassword;


Client.getClientByName(name,(err,user)=>{
	if(err)throw err;
	if(!user){
	
		res.render('error');
		return console.log('Not Found');
	}
	Client.comparePassword(password,user.password,function(err,isMatch){
		if(err) throw err;
		if(isMatch){
			
			var token= jwt.sign(user,'secret',{
				expiresIn:604800
			});

			// return res.json({
			// 	success:true,
			// 	token:'JWT'+token,
			// 		user:{
			// 			id:user._id,
			// 			username:user.username
			// 		}});

			return res.redirect('/students/summary');
		}else{
			
			res.render('error');
		}
	});

});

	console.log('Success');


});

app.post('/upload/profile',upload.any(),function(req,res){
	//res.send(req.files[0].encoding);
	console.log(req.files[0].encoding);
	console.log(req.files)
	var id=s.id;
	var name=s.name;
	Student.findById(id,function(err,user){
		if(err)throw err;
		else{
			
			var profilephoto=req.files[0].filename
			user.profilePhoto=profilephoto;
			console.log('profilephoto');
			console.log(profilephoto);
			user.save();
			name=s.name;
			//,{profilephoto:profilephoto}
			res.render('studentView',{name:name ,profilephoto : profilephoto});
		}
			// for(var i=0;i<(user.work).length;i++){

			// }
		});
	console.log(id);

});

app.post('/upload/reg',upload.any(),function(req,res){
	//res.send(req.files[0].encoding);
	console.log(req.files[0].encoding);
	console.log(req.files)
	var id=s.id;
	var name=s.name;
	Student.findById(id,function(err,user){
		if(err)throw err;
		else{
			
			var profilephoto=req.files[0].filename
			user.work.push(profilephoto);
			console.log('profilephoto');
			console.log(profilephoto);
			user.save();
			name=s.name;
			//,{profilephoto:profilephoto}
			res.render('studentView',{name:name ,profilephoto : profilephoto});
		}
			// for(var i=0;i<(user.work).length;i++){

			// }
		});
	console.log(id);

});

app.post('/student/reg',function(req,res){
		var newstudent=new Student({
		username:req.body.reg_name,
		password:req.body.reg_password
	});
	
Student.addUser(newstudent,(err,user)=>{
	if(err){
		res.render('error');
	}else{
		res.render('verify');
		}
});
	console.log(newstudent);
});



app.post('/student/add',function(req,res){
	//req.check('name_USR','Invalid username');
		var name=req.body.name_USR
			var password=req.body.password_USR
	
Student.getStudentByName(name ,(err,user)=>{
	if(err)throw err;
	if(!user){
		//res.json({success:false ,msg:'User not found'});
		res.render('error');
		return console.log('Not Found');
	}else{
	Student.comparePassword(password,user.password,function(err,isMatch){
		if(err) throw err;
		if(isMatch){
			//jwt.sign(payload, secretOrPrivateKey, options, [callback])
			var token= jwt.sign(user,'secret',{
				expiresIn:604800
			});
			
			s=req.session
			s.id=user._id;
			s.name=user.username;
			var profilephoto=user.work[0];
			var name=s.name;
			res.render('studentView',{name:name ,profilephoto:profilephoto});
			console.log(s.id);

		}else{
			res.json({success:false,msg:'student not found'});
			//res.render('error');
		}
	});
}
});

});

//use a middleware to hold all the static files of the app including the angular folder
app.use(express.static(__dirname +'/public/'));

// to check on the terminal side 
});

console.log('server is running on port 3000');
app.listen(3000);
