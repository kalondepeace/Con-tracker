
import Web3 from 'web3'
import { newKitFromWeb3 } from '@celo/contractkit'
import BigNumber from "bignumber.js"
import marketplaceAbi from '../contract/marketplace.abi.json'
import erc20Abi from "../contract/erc20.abi.json"
var fetch = require('node-fetch');

const ERC20_DECIMALS = 18
const MPContractAddress = "0x9451ACb3DbBEEc2fd23F6917AEA55A601B9832A0"

let kit
let contract
let accounts
let gEmail


//connect to the celo network
const connectCeloWallet = async function () {
  if (window.celo) {
    try {
      notification("⚠️Please enable the Dapp")
      await window.celo.enable()
    
      const web3 = new Web3(window.celo)
      kit = newKitFromWeb3(web3)

      accounts = await kit.web3.eth.getAccounts()
      kit.defaultAccount = accounts[0]

      contract = new kit.web3.eth.Contract(marketplaceAbi, MPContractAddress)
      notificationOff()
      
    } catch (error) {
     notification(`⚠️ ${error}.`)
    }
  } else {
    notification("⚠️ Please install the CeloExtensionWallet.")
  }
}




//when the window loads for the first time.
window.addEventListener('load', async () => {
  await connectCeloWallet()
});


//check whether the email is registered or not..
async function check(email){
        const _email = email;
        try{
        const eCheck = await contract.methods
              .Isreg(_email)
              .call()
              return eCheck;

         }catch(error){
              console.log(error)
     }       
}


//function to save a project
document
  .querySelector("#newContractBtn")
  .addEventListener("click", async (e) => {

        if(document.getElementById("newContractName").value=="" || document.getElementById("newContractAddress").value=="" || document.getElementById("newType").value==""){
          notification("Please fill out all the fields")
        }else{

        const params = [
           gEmail,
           document.getElementById("newContractName").value,
             document.getElementById("newContractAddress").value,
            document.getElementById("newType").value
            ]

        notification(`saving......... ${params[1]}`)

          try{
              const res = await contract.methods
              .storeProject(...params)
              .send({ from: kit.defaultAccount })
              notification(`You have successfully created ${params[1]}`)

          }catch(error){
            notification("We are having trouble creating your project, please try again later")
          }
         getProjects(gEmail)
       }
  })



//when get started button is clicked
document
  .querySelector("#stunted")
  .addEventListener("click", async (e) => {
   
          if(document.getElementById("email").value==""){
            notification("Please fill in your email address....")

          }else{
        const _email = document.getElementById("email").value

        const Isre = await check(_email)
        notification("checking account.....")

          if(Isre){

            //fetch all the contracts registered with the email.
             document.getElementById("tokenz").innerHTML =""
             document.getElementById("balance").innerHTML = _email
             gEmail=_email

             getProjects(_email)
             notificationOff()
             document.getElementById("marketplace").innerHTML =""
             navOn()

          }else{

            try{
            notification("Creating an account.......")
              const result = await contract.methods
              .registerAccount(_email)
              .send({ from: kit.defaultAccount })

               gEmail= _email
              homepage(_email)
              notificationOff()
              navOn()
              notification("Account created successfully, you can now proceed.")
            
            }catch(error){
               notification("We are having trouble creating your account, please try again later")
            }
          }
        }
})



//get all contracts from the sc
  const getProjects = async function(_email) {
          const proj=[]
          const _contractsLength = await contract.methods.getNoProjects().call()

          for (let i = 0; i < _contractsLength; i++) {

            let r = await contract.methods.getContract(i).call() 
                if(r[0] == _email){
                    proj.push({index: i, owner: r[0], name: r[1], contractAddr: r[2], type: r[3]})
                }
          }
          displayResults(proj)     
}


//display projects
async function displayResults(projects){
        document.getElementById("marketplace").innerHTML =""
        document.getElementById("tokenz").innerHTML =""

        const div1 = document.createElement("div")
        div1.className= "col-2 overflow-auto"
        div1.style.height="500px"
        div1.id="ser"

        const div2 = document.createElement("div")
        div2.className= "col-10 overflow-auto"
        div2.id="details-m"
        div2.style.height ="500px"
        document.getElementById("marketplace").append(div1,div2)


       projects.forEach((_project) => {
        const newDiv = document.createElement("div")
        newDiv.className = "row"
        newDiv.innerHTML = projectTemplate(_project)
        document.getElementById("ser").appendChild(newDiv) 
  })
}


function projectTemplate(_project){
  return`
      
  <div class="border border-white">
    <h5 class="card-title contractAddr" role="button" id=${_project.index}  title=${_project.contractAddr} value=${_project.type}>${_project.name}</h5>
    <h6 class="card-subtitle mb-2 text-muted">${_project.type}</h6>
    <i class="bi bi-trash delContract align-right" name =${_project.name} role ="button" id=${_project.index}></i>
    <hr>
    </div>
  `
}


//getting contract details
document
  .querySelector("#marketplace")
  .addEventListener("click", async (e) => {
  if (e.target.className.includes("contractAddr")) {
        
        const index = e.target.id
        const _type = e.target.getAttribute("value")
        const _Addr = e.target.getAttribute("title")

       notification("loading,please wait.......")

        if(_type=="contract"){
        const _contract = await fetchContract(_Addr)
          
        } else{
          
          const fu = await fet(_Addr)
          await displayTokens(fu[1].result)
          await displayAddrData(fu[0].result)
        }
        notificationOff()
      }
  })



//getting details about the contract.
async function fetchContract(_Addr){

  const contDiv = document.createElement("div")
  contDiv.className="coming"
  contDiv.innerHTML="The contract feature is coming soon......"
  document.getElementById("details-m").append(contDiv)
}


//displaying the token balances
async function displayTokens(Tkns){
  document.getElementById("tokenz").innerHTML =""

        Tkns.forEach(tkn=>{
        const tknd = document.createElement("div")
        tknd.className="row"
        tknd.innerHTML=tknTemplate(tkn)
        document.getElementById("tokenz").append(tknd)
  })
}

function tknTemplate(tkn){
  return`
   <p>${new BigNumber(tkn.balance).shiftedBy(-ERC20_DECIMALS).toString()}${tkn.symbol}</p>&nbsp &nbsp &nbsp
  `
}


//deleting a contract details
document
  .querySelector("#marketplace")
  .addEventListener("click", async (e) => {
  if (e.target.className.includes("delContract")) {

      const index = e.target.id
      const _name = e.target.getAttribute("name")
      try{
        notification(`deleting contract ${_name},please wait...........`)
          const res = await contract.methods
          .delContract(index)
          .send({ from: kit.defaultAccount })

      }catch(error){
         notification("We are having trouble deleting the contract")
      }
         notification(`You have successfully deleted ${index}`)
         
         notificationOff()
         getProjects(gEmail)
  }
})


//display address details
 async function displayAddrData(txn,bal){

          document.getElementById("details-m").innerHTML = ""
          const tclass = document.createElement("table")
          tclass.className="table table-bordered table-hover"
          tclass.innerHTML+='<thead class="thead-dark"><tr><th scope="col">To</th><th scope="col">Amount</th><th scope="col">time</th><th scope="col">Gas</th></tr></thead>'
          txn.forEach(tx=>{
            tclass.innerHTML +=popTable(tx)
          })

         document.getElementById("details-m").append(tclass)
 }


 function popTable(tx){
  return`
    <tbody>
      <tr>
        <th scope="row">${tx.to}</th>
        <td>${new BigNumber(tx.value).shiftedBy(-ERC20_DECIMALS).toString()} ${tx.tokenSymbol}</td>
        <td>${getDate(tx.timeStamp)}</td>
        <td>${tx.gasUsed}</td>
      </tr>
   </tbody>
  `
 }


//fetch data from the testnet api.
async function fet(_id){

       try{
      const[_transfer, balance] = await Promise.all([
        fetch(`https://explorer.celo.org/alfajores/api?module=account&action=tokentx&address=${_id}`),
        fetch(`https://explorer.celo.org/alfajores/api?module=account&action=tokenlist&address=${_id}`)
        ]);
      const trans = await _transfer.json();
      const bal = await balance.json();
      return[trans,bal];
    }catch(err){
  console.log(err)
}
}



//function to turn notifications on and off
function notification(_text) {
      document.querySelector(".alert").style.display = "block"
      document.querySelector("#notification").textContent = _text
}

function notificationOff() {
      document.querySelector(".alert").style.display = "none"
}

function getDate(x) {
   const myDate = new Date(x * 1000);
   const fn = myDate.toLocaleString()
   return fn;
}

function navOn(){
       document.getElementById("navbarTarget").style.display = "block"
}

function homepage(){
       document.getElementById("marketplace").innerHTML = ""
       document.getElementById("balance").innerHTML = gEmail
}






















































