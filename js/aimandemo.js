
let AIMan = require('aiman');
let Tx = require('matrixjs-tx');
let Util = require('matrixjs-util');

var keythereum = require("keythereum");
var polycrc = require('polycrc')
const bs58 = require('bs58')


var privateKey = new Buffer('9f14efd0b59ec1112ea9a1f659c4ecb35243fd05ef5be175d96e2fed8a2344df', 'hex')
let from = "MAN.Wkbujtxh7YBnkGV8HZvyPQK3cAPy";

let aiman = new AIMan(new AIMan.providers.HttpProvider("https://testnet.matrix.io"));

genManAddress = function (address) {
  let crc8 = polycrc.crc(8, 0x07, 0x00, 0x00, false)
  const bytes = Buffer.from(address, 'hex')
  const manAddress = bs58.encode(bytes)
  let arr = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P',
    'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i',
    'j', 'k', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'
  ];
  return ('MAN.' + manAddress) + arr[crc8('MAN.' + manAddress) % 58]
}

//Create Account(private key or password+keystore)
function CreatKeystore(password){
  var dk;// = keythereum.create();
  while (true) {
      dk = keythereum.create();
      if (dk.privateKey[0] === 0) {
        break;
      }
  }
  //private key
  console.log(dk.privateKey);
  //password + keystore
  var keyObject = keythereum.dump(password, dk.privateKey, dk.salt, dk.iv);
  keyObject.address = genManAddress(keyObject.address);
  console.log(keyObject.address);
  keythereum.exportToFile(keyObject, "./",function (result) {
    console.log(result);
});
}


//sendTx
function sendRawTransaction(from, privateKey) {

  var rawTx = {
    to: 'MAN.2Uoz8g8jauMa2mtnwxrschj2qPJrE',
    value: '0x989680',
    gasPrice: '0x430e23400',
    gas: 21000,
    data: "0x",
    nonce: 4503599627370496,
    TxEnterType: '',
    IsEntrustTx: '',
    CommitTime: 1547539401231,
    extra_to: [[0, 0, []]],
    chainId: 3
  }
  //extra_to 0,
  //EnstrustSetType 0 
  var entrust = [{
    EntrustAddres: 'MAN.2Uoz8g8jauMa2mtnwxrschj2qPJrE',
    IsEntrustGas: true,
    IsEntrustSign: false,
    StartHeight: 1222,
    EndHeight: 122222,
    EnstrustSetType: 0,
    useStartTime: '',
    useEndTime: '',
    EntrustCount: 0
    },{
      EntrustAddres: 'MAN.2Uoz8g8jauMa2mtnwxrschj2qPJrE',
      IsEntrustGas: true,
      IsEntrustSign: false,
      StartHeight: 122223,
      EndHeight: 122229,
      EnstrustSetType: 0,
      useStartTime: '',
      useEndTime: '',
      EntrustCount: 0
      }];
      rawTx.data = JSON.stringify(entrust);
      rawTx.to = "MAN.Wkbujtxh7YBnkGV8HZvyPQK3cAPy";
      rawTx.gas = 210000;
      rawTx.extra_to= [[5, 0, []]];
  //Enstrust end
  aiman.man.getTransactionCount(from, function (err, result) {
    // console.log(result)
    if (err) {
      console.log(err.message);
    }
    var nonce = result;
    rawTx.nonce = aiman.toHex(nonce);
    const tx = new Tx(rawTx);
    tx.sign(privateKey);
    const serializedTx = tx.serialize();
    var data = "0x" + serializedTx.toString('hex');
    let newTxData = tx.getTxParams(data);
    aiman.man.sendRawTransaction(newTxData, function (err, result) {
      if (!err) {
        console.log(result);
      } else {
        console.log(err.message);
      }
    });
  });
}

//verifyMANAddress
function verifyMANAddress(address){
    return (/^[A-Z]{2,8}\.[0-9a-zA-Z]{21,29}$/.test(address));
}

//gas price
function GetGasPrice() {
  let gasPrice = aiman.man.gasPrice;
  console.log(gasPrice.toString());
}

//get block info
function GetBlockByNumber(blocknum) {
  let blockinfo = aiman.man.getBlock(blocknum,false);
  console.log(blockinfo);
}

//get balance
function GetBalance(addr) {
  let balance = aiman.man.getBalance(addr);
  console.log(balance[0].balance.toString());
}


sendRawTransaction(from, privateKey);
// GetGasPrice();
// GetBalance("MAN.2Uoz8g8jauMa2mtnwxrschj2qPJrE");
// GetBlockByNumber(121);
// CreatKeystore("1111111");
// Util.creatKeystore("111111",function(result){
//   console.log(result);  
// });

// var ifvalid = Util.verifyMANAddress('MAN.2sLYZbWCNNL7QfcQdMnxhx962dLqQ');
// console.log(ifvalid);



