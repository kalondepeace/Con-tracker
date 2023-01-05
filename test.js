var fetchUrl = require("fetch").fetchUrl;


async function testjs(){
	const response = await fetchUrl('https://explorer.celo.org/alfajores/api?module=account&action=tokentx&address=0x1a4b2984405a134Ec66D57fC204126411910F0D2',function(error,meta,body){

	const results = JSON.parse(body.toString());
	
	
		console.log("here is the result",results)
	
	


})
	
}
testjs().catch(error =>{
	console.log("here error:",error)

})

