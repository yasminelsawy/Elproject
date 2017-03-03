var mongoose=require('mongoose');

var Student=require('./student');





var studentWorkSchema=mongoose.Schema({Username:{type:String,
										ref: [{type: mongoose.Schema.Types.ObjectId, ref: 'Student'}],	
										requried:true},
										Work:{type:String ,required:true}
										}, {collection: 'studentWork'});

 var studentWork=module.exports=mongoose.model('studentWork',studentWorkSchema);
