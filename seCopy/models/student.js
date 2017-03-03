var mongoose=require('mongoose');
var bcrypt = require('bcryptjs');
var mongoosePaginate = require('mongoose-paginate');

 var studentSchema = mongoose.Schema({
   username:{type:String,required:true,unique:true}, 
   password:{type:String,required:true},
   id:{type:Number ,required:false},
   profilePhoto:{type:String},
   work:[{type :String}]
 }, {collection: 'student'});
 // NOTE: methods must be added to the schema before compiling it with mongoose.model()

studentSchema.plugin(mongoosePaginate);

 var student=module.exports=mongoose.model('student',studentSchema);

 module.exports.getStudentByName=function (name,callback){
	//find one function takes a query 
	var query={username:name}
student.findOne(query,callback);
}


module.exports.getStudentById=function (id,callback){
student.findById(id,callback);
}

module.exports.addUser=function(newUser,callback){
	bcrypt.genSalt(10,(err,salt)=>{
		bcrypt.hash(newUser.password,salt,(err,hash)=>{
			if(err) throw err;
			newUser.password=hash;
			newUser.save(callback);
		});
	});
}
module.exports.comparePassword=function(enteredPassword,userPassword,callback){
bcrypt.compare(enteredPassword,userPassword,(err,isMatch)=>{
	if(err) throw err;
	callback(null,isMatch);
});

}