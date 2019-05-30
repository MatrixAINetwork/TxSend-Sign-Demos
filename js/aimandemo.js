
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

str2hex = function (str) {
  let charBuf = writeUTF(str, true);
  let re = '';
  for (let i = 0; i < charBuf.length; i++) {
    let x = (charBuf[i] & 0xFF).toString(16);
    if (x.length === 1) {
      x = '0' + x;
    }
    re += x;
  }
  return re;
}
writeUTF = function (str, isGetBytes) {
  let back = []
  let byteSize = 0
  for (let i = 0; i < str.length; i++) {
    let code = str.charCodeAt(i)
    if (code >= 0x00 && code <= 0x7f) {
      byteSize += 1
      back.push(code)
    } else if (code >= 0x80 && code <= 0x7ff) {
      byteSize += 2
      back.push((192 | (31 & (code >> 6))))
      back.push((128 | (63 & code)))
    } else if ((code >= 0x800 && code <= 0xd7ff) ||
      (code >= 0xe000 && code <= 0xffff)) {
      byteSize += 3
      back.push((224 | (15 & (code >> 12))))
      back.push((128 | (63 & (code >> 6))))
      back.push((128 | (63 & code)))
    }
  }
  for (let i = 0; i < back.length; i++) {
    back[i] &= 0xff
  }
  if (isGetBytes) {
    return back
  }
  if (byteSize <= 0xff) {
    return [0, byteSize].concat(back)
  } else {
    return [byteSize >> 8, byteSize & 0xff].concat(back)
  }
}

getTxParams = function(data,rawTx) {
  let txData = new Tx(data, true);
  rawTx.v = '0x' + txData.v.toString('hex');
  rawTx.r = '0x' + txData.r.toString('hex');
  rawTx.s = '0x' + txData.s.toString('hex');
};

//Create Account(private key or password + keystore)
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

//sendTx one to one 
function sendRawTransaction1(from, privateKey) {

  // default one to one, normal transatcion
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
  };

  aiman.man.getTransactionCount(from, function (err, result) {
    // console.log(result)
    if (err) {
      console.log(err.message);
    }
    var nonce = result;
    rawTx.nonce = aiman.toHex(nonce);
    // console.log('ssssssssss'+JSON.stringify(rawTx));
    const tx = new Tx(rawTx);

    tx.sign(privateKey);
    const serializedTx = tx.serialize();
    var data = "0x" + serializedTx.toString('hex');
   
    //reset rawtx
    getTxParams(data,rawTx); // set v,r,s
    rawTx.gas = aiman.toHex(rawTx.gas);
    rawTx.TxEnterType = 0;
    rawTx.IsEntrustTx = 0;
    rawTx.lockHeight = 0;
    rawTx.currency = 'MAN';
    rawTx.txType = 0;
    rawTx.extra_to = [];

    aiman.man.sendRawTransaction(rawTx, function (err, result) {
      if (!err) {
        console.log(result);
      } else {
        console.log(err.message);
      }
    });
  });
}

//sendTx Entrust, According to the number of times
function sendRawTransaction2(from, privateKey) {

  // default one to one, normal transatcion
  var rawTx = {
    to: 'MAN.2Uoz8g8jauMa2mtnwxrschj2qPJrE',
    value: '0x00',
    gasPrice: '0x430e23400',
    gas: 210000,
    data: "0x",
    nonce: 4503599627370496,
    TxEnterType: '',
    IsEntrustTx: '',
    CommitTime: 1547539401231,
    extra_to: [[0, 0, []]],
    chainId: 3
  };
  //extra_to 0,
  //EntrustSetType 0 block 1 time 2 times
  var entrust = [{
        EntrustAddres: 'MAN.6apcFYQbYZhwLZz3bb4Tjfkg4myJ',
        IsEntrustGas: true,
        EnstrustSetType: 2,
        EntrustCount: 20
        }];
  rawTx.data = '0x'+str2hex(JSON.stringify(entrust));
  rawTx.to = "MAN.Wkbujtxh7YBnkGV8HZvyPQK3cAPy";
  rawTx.gas = 210000;
  rawTx.extra_to= [[5, 0, []]];
  //Entrust end

  aiman.man.getTransactionCount(from, function (err, result) {
    // console.log(result)
    if (err) {
      console.log(err.message);
    }
    var nonce = result;
    rawTx.nonce = aiman.toHex(nonce);
    // console.log('ssssssssss'+JSON.stringify(rawTx));
    const tx = new Tx(rawTx);

    tx.sign(privateKey);
    const serializedTx = tx.serialize();
    var data = "0x" + serializedTx.toString('hex');

    getTxParams(data,rawTx); // set v,r,s
    rawTx.gas = aiman.toHex(rawTx.gas);
    rawTx.TxEnterType = 0;
    rawTx.IsEntrustTx = 0;
    rawTx.lockHeight = 0;
    rawTx.currency = 'MAN';
    rawTx.txType = 5;
    rawTx.extra_to = [];
    aiman.man.sendRawTransaction(rawTx, function (err, result) {
      if (!err) {
        console.log(result);
      } else {
        console.log(err.message);
      }
    });
  });
}

//sendTx Entrust, According to time
function sendRawTransaction3(from, privateKey) {

  // default one to one, normal transatcion
  var rawTx = {
    to: 'MAN.2Uoz8g8jauMa2mtnwxrschj2qPJrE',
    value: '0x00',
    gasPrice: '0x430e23400',
    gas: 210000,
    data: "0x",
    nonce: 4503599627370496,
    TxEnterType: '',
    IsEntrustTx: '',
    CommitTime: 1547539401231,
    extra_to: [[0, 0, []]],
    chainId: 3
  };
  //extra_to 0,
  //EntrustSetType 0 block 1 time 2 times
  var entrust = [{
        EntrustAddres: 'MAN.2Uoz8g8jauMa2mtnwxrschj2qPJrE',
        IsEntrustGas: true,
        EnstrustSetType: 1,
        StartTime: 1559145600,
        EndTime: 1559232000,
        }];
  rawTx.data = '0x'+str2hex(JSON.stringify(entrust));
  rawTx.to = "MAN.Wkbujtxh7YBnkGV8HZvyPQK3cAPy";
  rawTx.gas = 210000;
  rawTx.extra_to= [[5, 0, []]];
  //Entrust end

  aiman.man.getTransactionCount(from, function (err, result) {
    // console.log(result)
    if (err) {
      console.log(err.message);
    }
    var nonce = result;
    rawTx.nonce = aiman.toHex(nonce);
    // console.log('ssssssssss'+JSON.stringify(rawTx));
    const tx = new Tx(rawTx);

    tx.sign(privateKey);
    const serializedTx = tx.serialize();
    var data = "0x" + serializedTx.toString('hex');
    
    getTxParams(data,rawTx); // set v,r,s
    rawTx.gas = aiman.toHex(rawTx.gas);
    rawTx.TxEnterType = 0;
    rawTx.IsEntrustTx = 0;
    rawTx.lockHeight = 0;
    rawTx.currency = 'MAN';
    rawTx.txType = 5;
    rawTx.extra_to = [];
    aiman.man.sendRawTransaction(rawTx, function (err, result) {
      if (!err) {
        console.log(result);
      } else {
        console.log(err.message);
      }
    });
  });
}

//sendTx Entrust, According to block
function sendRawTransaction4(from, privateKey) {

  // default one to one, normal transatcion
  var rawTx = {
    to: 'MAN.2Uoz8g8jauMa2mtnwxrschj2qPJrE',
    value: '0x00',
    gasPrice: '0x430e23400',
    gas: 210000,
    data: "0x",
    nonce: 4503599627370496,
    TxEnterType: '',
    IsEntrustTx: '',
    CommitTime: 1547539401231,
    extra_to: [[0, 0, []]],
    chainId: 3
  };
  //extra_to 0,
  //EntrustSetType 0 block 1 time 2 times
  var entrust = [{
        EntrustAddres: 'MAN.6apcFYQbYZhwLZz3bb4Tjfkg4myJ',
        IsEntrustGas: true,
        EnstrustSetType: 0,
        StartHeight: 2222222,
        EndHeight: 2222225
        }];
  rawTx.data = '0x'+str2hex(JSON.stringify(entrust));
  rawTx.to = "MAN.Wkbujtxh7YBnkGV8HZvyPQK3cAPy";
  rawTx.gas = 210000;
  rawTx.extra_to= [[5, 0, []]];
  //Entrust end

  aiman.man.getTransactionCount(from, function (err, result) {
    // console.log(result)
    if (err) {
      console.log(err.message);
    }
    var nonce = result;
    rawTx.nonce = aiman.toHex(nonce);
    // console.log('ssssssssss'+JSON.stringify(rawTx));
    const tx = new Tx(rawTx);

    tx.sign(privateKey);
    const serializedTx = tx.serialize();
    var data = "0x" + serializedTx.toString('hex');
    
    getTxParams(data,rawTx); // set v,r,s
    rawTx.gas = aiman.toHex(rawTx.gas);
    rawTx.TxEnterType = 0;
    rawTx.IsEntrustTx = 0;
    rawTx.lockHeight = 0;
    rawTx.currency = 'MAN';
    rawTx.txType = 5;
    rawTx.extra_to = [];

    aiman.man.sendRawTransaction(rawTx, function (err, result) {
      if (!err) {
        console.log(result);
      } else {
        console.log(err.message);
      }
    });
  });
}

//sendTx entrust
function sendRawTransaction5(from, privateKey) {

  // default one to one, normal transatcion
  var rawTx = {
    to: 'MAN.2Uoz8g8jauMa2mtnwxrschj2qPJrE',
    value: '0x989680',
    gasPrice: '0x430e23400',
    gas: 210000,
    data: "0x",
    nonce: 4503599627370496,
    TxEnterType: '',
    IsEntrustTx: '',
    CommitTime: 1547539401231,
    extra_to: [[0, 0, []]],
    chainId: 3
  };
  // entrust
  rawTx.IsEntrustTx = '1';
  // end

  aiman.man.getTransactionCount(from, function (err, result) {
    // console.log(result)
    if (err) {
      console.log(err.message);
    }
    var nonce = result;
    rawTx.nonce = aiman.toHex(nonce);
    // console.log('ssssssssss'+JSON.stringify(rawTx));
    const tx = new Tx(rawTx);

    tx.sign(privateKey);
    const serializedTx = tx.serialize();
    var data = "0x" + serializedTx.toString('hex');
    
    getTxParams(data,rawTx); // set v,r,s
    rawTx.gas = aiman.toHex(rawTx.gas);
    rawTx.TxEnterType = 0;
    rawTx.lockHeight = 0;
    rawTx.IsEntrustTx = 1;
    rawTx.currency = 'MAN';
    rawTx.txType = 0;
    rawTx.extra_to = [];
    
    aiman.man.sendRawTransaction(rawTx, function (err, result) {
      if (!err) {
        console.log(result);
      } else {
        console.log(err.message);
      }
    });
  });
}

//sendTx one to many
function sendRawTransaction6(from, privateKey) {

  // default one to one, normal transatcion
  var rawTx = {
    to: 'MAN.2Uoz8g8jauMa2mtnwxrschj2qPJrE',
    value: '0x989680',
    gasPrice: '0x430e23400',
    gas: 210000,
    data: "",
    nonce: 4503599627370496,
    TxEnterType: '',
    IsEntrustTx: '',
    CommitTime: 1547539401231,
    extra_to: [[0, 0, []]],
    chainId: 3
  };
  //one to many
  var onetomany = [];
  onetomany.push(['MAN.jLTFhoCJCGChpidU2iC1Q5zCmVFL','0x989680','0x']);
  onetomany.push(['MAN.f4FWHEbWkX8sSd8yjZjYHeZWnadx','0x989680','0x']);
  onetomany.push(['MAN.gQAAHUeTBxvgbzf8tFgUtavDceJP','0x989680','0x']);
  rawTx.extra_to[0][2] = onetomany;
  //one to many end

  aiman.man.getTransactionCount(from, function (err, result) {
    // console.log(result)
    if (err) {
      console.log(err.message);
    }
    var nonce = result;
    rawTx.nonce = aiman.toHex(nonce);
    // console.log('ssssssssss'+JSON.stringify(rawTx));
    const tx = new Tx(rawTx);

    tx.sign(privateKey);
    const serializedTx = tx.serialize();
    var data = "0x" + serializedTx.toString('hex');
    
    getTxParams(data,rawTx); // set v,r,s
    rawTx.gas = aiman.toHex(rawTx.gas);
    rawTx.TxEnterType = 0;
    rawTx.IsEntrustTx = 0;
    rawTx.lockHeight = 0;
    rawTx.currency = 'MAN';
    rawTx.txType = 0;
    rawTx.extra_to = [];
    for (var i = 0, length = onetomany.length; i < length; i++) {
      rawTx.extra_to.push({
        to: onetomany[i][0],
        value: onetomany[i][1],
        input: onetomany[i][2]
      });
    }

    aiman.man.sendRawTransaction(rawTx, function (err, result) {
      if (!err) {
        console.log(result);
      } else {
        console.log(err.message);
      }
    });
  });
}

//sendTx revocable transaction
function sendRawTransaction7(from, privateKey) {

  // default one to one, normal transatcion
  var rawTx = {
    to: 'MAN.2Uoz8g8jauMa2mtnwxrschj2qPJrE',
    value: '0x989680',
    gasPrice: '0x430e23400',
    gas: 210000,
    data: "0x",
    nonce: 4503599627370496,
    TxEnterType: '',
    IsEntrustTx: '',
    CommitTime: 1547539401231,
    extra_to: [[0, 0, []]],
    chainId: 3
  };
  //revocable transaction
  rawTx.extra_to[0][0] = 3;
  rawTx.CommitTime = parseInt(new Date().getTime()/1000) + 600;// 10 min
  //end revocable

  aiman.man.getTransactionCount(from, function (err, result) {
    // console.log(result)
    if (err) {
      console.log(err.message);
    }
    var nonce = result;
    rawTx.nonce = aiman.toHex(nonce);
    // console.log('ssssssssss'+JSON.stringify(rawTx));
    const tx = new Tx(rawTx);

    tx.sign(privateKey);
    const serializedTx = tx.serialize();
    var data = "0x" + serializedTx.toString('hex');
    
    getTxParams(data,rawTx); // set v,r,s
    rawTx.gas = aiman.toHex(rawTx.gas);
    rawTx.TxEnterType = 0;
    rawTx.IsEntrustTx = 0;
    rawTx.lockHeight = 0;
    rawTx.currency = 'MAN';
    rawTx.txType = 3;
    rawTx.extra_to = [];
    
    aiman.man.sendRawTransaction(rawTx, function (err, result) {
      if (!err) {
        console.log(result);
      } else {
        console.log(err.message);
      }
    });
  });
}

//sendTx undo transaction
function sendRawTransaction8(from, privateKey) {

  // default one to one, normal transatcion
  var rawTx = {
    to: 'MAN.2Uoz8g8jauMa2mtnwxrschj2qPJrE',
    value: '0x989680',
    gasPrice: '0x430e23400',
    gas: 210000,
    data: "0x",
    nonce: 4503599627370496,
    TxEnterType: '',
    IsEntrustTx: '',
    CommitTime: 1547539401231,
    extra_to: [[0, 0, []]],
    chainId: 3
  };
  
  // undo transaction
  rawTx.extra_to[0][0] = 4;
  rawTx.to = 'MAN.Wkbujtxh7YBnkGV8HZvyPQK3cAPy'; 
  rawTx.value = '0x00';
  rawTx.data = "0x746dd5858305e95c2ad24ac22658786012963590e683258ab1b0b073a131adad";
  // undo transaction end

  aiman.man.getTransactionCount(from, function (err, result) {
    // console.log(result)
    if (err) {
      console.log(err.message);
    }
    var nonce = result;
    rawTx.nonce = aiman.toHex(nonce);
    // console.log('ssssssssss'+JSON.stringify(rawTx));
    const tx = new Tx(rawTx);

    tx.sign(privateKey);
    const serializedTx = tx.serialize();
    var data = "0x" + serializedTx.toString('hex');
    
    getTxParams(data,rawTx); // set v,r,s
    rawTx.gas = aiman.toHex(rawTx.gas);
    rawTx.TxEnterType = 0;
    rawTx.IsEntrustTx = 0;
    rawTx.lockHeight = 0;
    rawTx.currency = 'MAN';
    rawTx.txType = 4;
    rawTx.extra_to = [];
    
    aiman.man.sendRawTransaction(rawTx, function (err, result) {
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

//get gas price
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


//sendRawTransaction(from, privateKey);
sendRawTransaction8(from, privateKey);
// GetGasPrice();
// GetBalance("MAN.2Uoz8g8jauMa2mtnwxrschj2qPJrE");
// GetBlockByNumber(121);
// CreatKeystore("1111111");
// Util.creatKeystore("111111",function(result){
//   console.log(result);  
// });

// var ifvalid = Util.verifyMANAddress('MAN.2sLYZbWCNNL7QfcQdMnxhx962dLqQ');
// console.log(ifvalid);



