var mongoose=require('mongoose');
var bcrypt = require('bcryptjs');

var clientSchema = mongoose.Schema({
   username: {type:String,required:true,unique:true}, 
   password:{type:String,required:true}
 }, {collection: 'client'});

  var client=module.exports=mongoose.model('client',clientSchema);

  module.exports.getClientById =function (id,callback){
client.findById(id,callback);
}

module.exports.getClientByName=function (name,callback){
	//find one function takes a query 
	var query={username:name}
client.findOne(query,callback);
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