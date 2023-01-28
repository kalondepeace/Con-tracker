import Web3 from 'web3'
import {
    newKitFromWeb3
} from '@celo/contractkit'
import BigNumber from "bignumber.js"
import marketplaceAbi from '../contract/marketplace.abi.json'
import erc20Abi from "../contract/erc20.abi.json"
var fetch = require('node-fetch');

const ERC20_DECIMALS = 18
const MPContractAddress = "0x4B82d6D4597A04486A8B609A7796921e3fC2173B"
const cUSDContractAddress = "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1"

let kit
let contract
let accounts


//connect to the celo network
const connectCeloWallet = async function() {
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




//approve the address to spend the specified amount
async function approve(_price) {
    const cUSDContract = new kit.web3.eth.Contract(erc20Abi, cUSDContractAddress)

    const result = await cUSDContract.methods
        .approve(MPContractAddress, _price)
        .send({
            from: kit.defaultAccount
        })
    return result
}




//when the window loads for the first time.
window.addEventListener('load', async () => {
    await connectCeloWallet()
    await check()
});



//check whether the user is registered or not..
async function check() {

    try {
        const eCheck = await contract.methods
            .Isreg()
            .call()
            if(eCheck){
                homepage()
                navOn()
                getProjects()
            }
            console.log("reistered:", eCheck)
        return eCheck;
    } catch (error) {
        console.log(error)
    }
}



//function to save a project
document
    .querySelector("#newContractBtn")
    .addEventListener("click", async (e) => {

        const response = await contract.methods
                    .getTokens()
                    .call()
                    

        if (document.getElementById("newContractName").value == "" || document.getElementById("newContractAddress").value == "" || document.getElementById("newType").value == "") {
            notification("Please fill out all the fields")

        }else if(response == 0){
            notification("⚠️You dont have enough points to continue.⚠️")
            document.getElementById("marketplace").innerHTML =""

             const contDiv = document.createElement("div")
            contDiv.className = "coming"
            contDiv.innerHTML = purchaseTokens()
            document.getElementById("marketplace").append(contDiv)
             
        } else {


            const params = [
                
                document.getElementById("newContractName").value,
                document.getElementById("newContractAddress").value,
                document.getElementById("newType").value
            ]

            notification(`saving ${params[0]}........... `)

            try {

                const res = await contract.methods
                    .storeProject(...params)
                    .send({
                        from: kit.defaultAccount
                    })
                notification(`You have successfully created ${params[1]}`)

            } catch (error) {
                notification("We are having trouble creating your project, please try again later")
            }
            notificationOff()
            await bunBalance()
            await getProjects()
        }
    })



//when the Register button is clicked
document
    .querySelector("#stunted")
    .addEventListener("click", async (e) => {

        notification("Registering account, please wait.......")
                try {

                    console.log("i work")

                    const result = await contract.methods
                        .registerAccount()
                        .send({
                            from: kit.defaultAccount
                        })


                    homepage()
                    notificationOff()
                    navOn()
                    notification("Account created successfully, you can now proceed.")

                } catch (error) {
                    notification("We are having trouble creating your account, please try again later")
                }
                notificationOff()
            
        })






//get all contracts from the sc
const getProjects = async function() {
    const proj = []
    const _contractsLength = await contract.methods.getNoProjects().call()

    for (let i = 0; i < _contractsLength; i++) {

        let r = await contract.methods.getContract(i).call()
        if (r[0] == kit.defaultAccount) {
            proj.push({
                index: i,
                owner: r[0],
                name: r[1],
                contractAddr: r[2],
                type: r[3]
            })
        }
    }
    displayResults(proj)
}


//display projects
async function displayResults(projects) {
    document.getElementById("marketplace").innerHTML = ""
    document.getElementById("tokenz").innerHTML = ""

    const div1 = document.createElement("div")
    div1.className = "col-2 overflow-auto"
    div1.style.height = "500px"
    div1.id = "ser"

    const div2 = document.createElement("div")
    div2.className = "col-10 overflow-auto"
    div2.id = "details-m"
    div2.style.height = "500px"
    document.getElementById("marketplace").append(div1, div2)


    projects.forEach((_project) => {
        const newDiv = document.createElement("div")
        newDiv.className = "row"
        newDiv.innerHTML = projectTemplate(_project)
        document.getElementById("ser").appendChild(newDiv)
    })
}


function projectTemplate(_project) {
    return `
      
  <div class="border border-white ">
    <h5 class="card-title contractAddr" role="button" id=${_project.index}  title=${_project.contractAddr} value=${_project.type}>${_project.name}</h5>
    <h6 class="card-subtitle mb-2 text-muted">${_project.type}</h6>
    <i class="bi bi-trash delContract align-right" name =${_project.name} role ="button" id=${_project.index}></i>
    <hr>
    </div>
  `
}



//buy tokens
  document
  .querySelector("#marketplace")
  .addEventListener("click", async (e) => {
  if (e.target.className.includes("subBtn")) {
        
      const _quantity = e.target.id

      const _pprice = e.target.getAttribute("amount")
        notification("Waiting for payment approval to buy points")
      const _price = new BigNumber(e.target.getAttribute("amount"))
      .shiftedBy(ERC20_DECIMALS)
      .toString()


         try {
            await approve(_price)
         } catch (error) {
             console.log(`⚠️ ${error}.`)
        }
        notification(`Waiting for payment of ${_pprice} cUSD for ${_quantity} points`)

        try {
          const result = await contract.methods
            .buyToken(_price,_quantity)
            .send({ from: kit.defaultAccount })

            homepage()
            getProjects()

          
         
        } catch (error) {
         console.log(error)
        }
        notificationOff()
     
      }
  })



    //transfer the tokens from one user to another

  document
  .querySelector("#transferTokens")
  .addEventListener("click", async () => {
    console.log("transfer")

    if(document.getElementById("newTokenAmount").value =="" || document.getElementById("newTokenRecipient").value == ""){

      notification("Fill all the fields")
    }else{

     const params = [
      document.getElementById("newTokenAmount").value,
      document.getElementById("newTokenRecipient").value,
    ]

    notification(`⌛ Transfering "${params[0]}"... to "${params[1]}"`)


     try {
      const result = await contract.methods
        .transferTokens(...params)
        .send({ from: kit.defaultAccount })

   
      }catch(e){
        notification("Points transfer failed.........")
      }
      notificationOff()
  }
  })





//getting contract details
document
    .querySelector("#marketplace")
    .addEventListener("click", async (e) => {
        if (e.target.className.includes("contractAddr")) {
            console.log("hhrheh")

            const index = e.target.id
            const _type = e.target.getAttribute("value")
            const _Addr = e.target.getAttribute("title")

            notification("loading,please wait.......")

            if (_type == "contract") {
                const _contract = await fetchContract(_Addr)

            } else {

                const fu = await fet(_Addr)
                await displayTokens(fu[1].result)
                await displayAddrData(fu[0].result)
            }
            notificationOff()
        }
    })



//getting details about the contract.
async function fetchContract(_Addr) {

    const contDiv = document.createElement("div")
    contDiv.className = "coming"
    contDiv.innerHTML = "The contract feature is coming soon......"
    document.getElementById("details-m").append(contDiv)
}


//displaying the token balances
async function displayTokens(Tkns) {
    document.getElementById("tokenz").innerHTML = ""

    Tkns.forEach(tkn => {
        const tknd = document.createElement("div")
        tknd.className = "row"
        tknd.innerHTML = tknTemplate(tkn)
        document.getElementById("tokenz").append(tknd)
    })
}

function tknTemplate(tkn) {
    return `
   <p>${new BigNumber(tkn.balance).shiftedBy(-ERC20_DECIMALS).toFixed(2)}${tkn.symbol}</p>&nbsp &nbsp &nbsp
  `
}


//deleting a contract details
document
    .querySelector("#marketplace")
    .addEventListener("click", async (e) => {
        if (e.target.className.includes("delContract")) {

            const index = e.target.id
            const _name = e.target.getAttribute("name")
            console.log("index:", index, _name)
            try {
                notification(`deleting contract ${_name},please wait...........`)
                const res = await contract.methods
                    .delContract(index)
                    .send({
                        from: kit.defaultAccount
                    })

            } catch (error) {
                notification("We are having trouble deleting the contract")
            }
            notification(`You have successfully deleted ${_name}`)

            
            getProjects()
            notificationOff()
        }
    })


//display address details
async function displayAddrData(txn, bal) {

    document.getElementById("details-m").innerHTML = ""
    document.getElementById("details-m").innerHTML = "<h3>Transaction History</h3>"
    const tclass = document.createElement("table")
    tclass.className = "table table-bordered table-hover"
    tclass.innerHTML += '<thead class="thead-dark"><tr><th scope="col">To</th><th scope="col">Amount</th><th scope="col">time</th><th scope="col">Gas</th></tr></thead>'
    txn.forEach(tx => {
        tclass.innerHTML += popTable(tx)
    })

    document.getElementById("details-m").append(tclass)
}


function popTable(tx) {
    return `
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
async function fet(_id) {

    try {
        const [_transfer, balance] = await Promise.all([
            fetch(`https://explorer.celo.org/alfajores/api?module=account&action=tokentx&address=${_id}`),
            fetch(`https://explorer.celo.org/alfajores/api?module=account&action=tokenlist&address=${_id}`)
        ]);
        const trans = await _transfer.json();
        const bal = await balance.json();
        return [trans, bal];
    } catch (err) {
        console.log(err)
    }
}



function purchaseTokens() {
    return `
    <div id="package">
      <div class="d-flex justify-content-center">

          <div class="card" style="width: 18rem;">
            <img class="card-img-top" src="https://i.ibb.co/Y3jXn93/bronze-package-360x470.png" alt="Card image cap">
            <div class="card-body">
            <span>2 points for 1cUSD</span>
            <hr>

              <a href="#" class="btn btn-primary subBtn" amount="1" role="submit" id="2">Purchase</a>
            </div>
          </div>

          <div class="card" style="width: 18rem;">
            <img class="card-img-top" src="https://i.ibb.co/7GhjLTL/gold-package-360x470.png" alt="Card image cap">
            <div class="card-body">
              <span>5 points for 2cUSD</span>
              <a href="#" class="btn btn-primary subBtn" amount="2" role="submit" id="5">Purchase</a>
            </div>
          </div>
          <div class="card" style="width: 18rem;">
            <img class="card-img-top" src="https://i.ibb.co/PGqXkvn/platinum-package-360x470.png" alt="Card image cap">
            <div class="card-body">
              <span>8 points for 3cUSD</span>
              
              <a href="#" class="btn btn-primary subBtn" amount="3" role="submit" id="8">Purchase</a>
            </div>
        </div>

      </div>
 </div>
 `
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

function navOn() {
    document.getElementById("navbarTarget").style.display = "block"
}

async function homepage() {
    document.getElementById("marketplace").innerHTML = ""
     await bunBalance()
}

async function bunBalance(){

    try{
        const response = await contract.methods
                    .getTokens()
                    .call()
                    
        document.getElementById("tokens").innerHTML =`${response} points`


    }catch(e){
        console.log(error)
    }
    getBalance()
}



//get balance form the smart contract
const getBalance = async function () {
  const totalBalance = await kit.getTotalBalance(kit.defaultAccount)
  const cUSDBalance = totalBalance.cUSD.shiftedBy(-ERC20_DECIMALS).toFixed(1)
  document.querySelector("#balance").textContent = `${cUSDBalance} cUSD`
}