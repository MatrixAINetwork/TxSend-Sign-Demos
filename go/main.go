/*
Package vehicle_btc main.go

@Leno Lee <yongli@matrix.io>
@copyright All rights reserved
*/
package main

import (
	"crypto/ecdsa"
	"fmt"
	"github.com/MatrixAINetwork/go-AIMan/AIMan"
	"github.com/MatrixAINetwork/go-AIMan/Accounts"
	"github.com/MatrixAINetwork/go-AIMan/dto"
	"github.com/MatrixAINetwork/go-AIMan/manager"
	"github.com/MatrixAINetwork/go-AIMan/providers"
	"github.com/MatrixAINetwork/go-AIMan/transactions"
	"github.com/MatrixAINetwork/go-AIMan/waiting"
	"github.com/MatrixAINetwork/go-matrix/base58"
	"github.com/MatrixAINetwork/go-matrix/core/types"
	"github.com/MatrixAINetwork/go-matrix/crypto"
	"math/big"
	"time"

	"github.com/MatrixAINetwork/go-matrix/accounts/keystore"
	"path/filepath"
)

var (
	KeystorePath = "keystore"
	Tom_Manager  = &manager.Manager{
		AIMan.NewAIMan(providers.NewHTTPProvider("api85.matrix.io", 100, false)),
		Accounts.NewKeystoreManager(KeystorePath, 1),
	}

	Jerry_Manager = &manager.Manager{
		AIMan.NewAIMan(providers.NewHTTPProvider("testnet.matrix.io", 100, true)),
		Accounts.NewKeystoreManager(KeystorePath, 3),
	}

	Local_Manager = &manager.Manager{
		AIMan.NewAIMan(providers.NewHTTPProvider("192.168.3.13:8341", 100000, false)),
		Accounts.NewKeystoreManager(KeystorePath, 20),
	}
)

//This is a demo about how to send transactions
func SendTx(from string, to string, money int64, usegas int, gasprice int64) (connection *manager.Manager, txID string) {

	connection = Jerry_Manager
	cid := *connection.ChainID
	fmt.Println(cid)
	types.NewEIP155Signer(connection.ChainID)

	amount := big.NewInt(money)
	gas := uint64(usegas)
	price := big.NewInt(gasprice)
	err := connection.Unlock(from, "xxx")
	if err != nil {
		return
	}

	//getnonce
	nonce, err := connection.Man.GetTransactionCount(from, "latest")
	if err != nil {
		fmt.Println("GetTransactionCount:",err)
		return
	}

	//build transaction object
	trans := transactions.NewTransaction(nonce.Uint64(), to, amount, gas, price,
		[]byte{}, 0, 0, 0)

	//sign on the built transaction object
	raw, err := connection.SignTx(trans, from)
	if err != nil {
		fmt.Println("SignTx:",err)
		return
	}

	//send signed transaction object
	txID, err = connection.Man.SendRawTransaction(raw)
	if err != nil {
		fmt.Println("SendRawTransaction:",err)
		return
	}
	fmt.Println(txID)
	//fmt.Println("use",big.NewInt(0).Mul(trans.GasPrice.ToInt(),big.NewInt(trans.Gas)))
	var receipt *dto.TransactionReceipt
	wait2 := waiting.NewMultiWaiting(
		waiting.NewWaitTime(time.Second*60),
		waiting.NewWaitTxReceipt(connection, txID),
		//waiting.NewWaitBlockHeight(connection,blockNumber.Uint64()+3),
	)
	if index := wait2.Waiting(); index != 1 {
		//t.Error("timeout")
		//t.FailNow()
		fmt.Println("error")
	}
	receipt, err = connection.Man.GetTransactionReceipt(txID)
	if receipt.Status == false {
		fmt.Println("recipt_status == false")
	}
	fmt.Println(receipt)

	return
}

//send string-format transaction
func SendStringTx(from string, to string, money int64, usegas int, gasprice int64) (connection *manager.Manager, txID string) {

	connection = Jerry_Manager
	cid := *connection.ChainID
	fmt.Println(cid)
	types.NewEIP155Signer(connection.ChainID)

	amount := big.NewInt(money)
	gas := uint64(usegas)
	price := big.NewInt(gasprice)
	err := connection.Unlock(from, "xxx")
	if err != nil {
		return
	}

	//getnonce
	nonce, err := connection.Man.GetTransactionCount(from, "latest")
	if err != nil {
		fmt.Println("GetTransactionCount:",err)
		return
	}

	//build transaction object
	trans := transactions.NewTransaction(nonce.Uint64(), to, amount, gas, price,
		[]byte{}, 0, 0, 0)

	//sign on the built transaction object
	raw, err := connection.SignTx(trans, from)
	if err != nil {
		fmt.Println("SignTx:",err)
		return
	}


	//transfer signed tx struct to string
	strdata,err := transactions.SendTxArgs1ToString(raw)
	if err != nil{
		return
	}

	//send signed transaction object
	txID, err = connection.Man.SendStringRawTransaction(strdata)
	if err != nil {
		fmt.Println("SendRawTransaction:",err)
		return
	}
	fmt.Println(txID)
	//fmt.Println("use",big.NewInt(0).Mul(trans.GasPrice.ToInt(),big.NewInt(trans.Gas)))
	var receipt *dto.TransactionReceipt
	wait2 := waiting.NewMultiWaiting(
		waiting.NewWaitTime(time.Second*60),
		waiting.NewWaitTxReceipt(connection, txID),
		//waiting.NewWaitBlockHeight(connection,blockNumber.Uint64()+3),
	)
	if index := wait2.Waiting(); index != 1 {
		//t.Error("timeout")
		//t.FailNow()
		fmt.Println("error")
	}
	receipt, err = connection.Man.GetTransactionReceipt(txID)
	if receipt.Status == false {
		fmt.Println("recipt_status == false")
	}
	fmt.Println(receipt)

	return
}

//send Transaction (sign via private key)
func SendTxByPrivateKey(from string, to string, money int64, usegas int, gasprice int64,PrivateKey *ecdsa.PrivateKey) (connection *manager.Manager, txID string) {

	connection = Jerry_Manager

	amount := big.NewInt(money)
	gas := uint64(usegas)
	price := big.NewInt(gasprice)
	err := connection.Unlock(from, "xxx")
	if err != nil {
		return
	}

	//getnonce
	nonce, err := connection.Man.GetTransactionCount(from, "latest")
	if err != nil {
		fmt.Println("GetTransactionCount:",err)
		return
	}

	//build transaction object
	trans := transactions.NewTransaction(nonce.Uint64(), to, amount, gas, price,
		[]byte{}, 0, 0, 0)

	trans,err=connection.Man.SignTxByPrivate(trans,from,PrivateKey,connection.ChainID)
	//send signed transaction object
	txID, err = connection.Man.SendRawTransaction(trans)
	if err != nil {
		fmt.Println("SendRawTransaction:",err)
		return
	}
	fmt.Println(txID)
	//fmt.Println("use",big.NewInt(0).Mul(trans.GasPrice.ToInt(),big.NewInt(trans.Gas)))
	var receipt *dto.TransactionReceipt
	wait2 := waiting.NewMultiWaiting(
		waiting.NewWaitTime(time.Second*60),
		waiting.NewWaitTxReceipt(connection, txID),
		//waiting.NewWaitBlockHeight(connection,blockNumber.Uint64()+3),
	)
	if index := wait2.Waiting(); index != 1 {
		//t.Error("timeout")
		//t.FailNow()
		fmt.Println("error")
	}
	receipt, err = connection.Man.GetTransactionReceipt(txID)
	if receipt.Status == false {
		fmt.Println("recipt_status == false")
	}
	fmt.Println(receipt)

	return
}

//create Account (create private key file under local folder)
func CreatKeystore() {
	// Create an encrypted keystore with standard crypto parameters
	ks := keystore.NewKeyStore(filepath.Join("", "keystore"), keystore.StandardScryptN, keystore.StandardScryptP)

	// Create a new account with the specified encryption passphrase
	newAcc, err := ks.NewAccount("Creation password")
	if err != nil {

	}
	manAddress := newAcc.ManAddress()
	fmt.Println(manAddress)
}

//create Account
func GenManAddress()  {
	privateKey, err := crypto.HexToECDSA("b71c71a67e1177ad4e901695e1b4b9ee17ae16c6668d313eac2f96dbcda3f291")
	if err != nil {
		return
	}
	//
	publicKey := privateKey.Public()
	publicKeyECDSA, ok := publicKey.(*ecdsa.PublicKey)
	if !ok {
		return
	}
	from := crypto.PubkeyToAddress(*publicKeyECDSA)
	fromMan := base58.Base58EncodeToString("MAN", from)
	fmt.Println(fromMan)
}

//get account balance
func GetBalance(addr string) *big.Int {
	connection := Jerry_Manager
	balance,err:=connection.Man.GetBalance(addr, "latest")
	if err!=nil {
	}
	fmt.Println(addr,":",balance[0].Balance.ToInt())
	return balance[0].Balance.ToInt()
}

//get gasprice
func GetGasPrice() *big.Int  {
	connection := Jerry_Manager
	gasprice,_:=connection.Man.GetGasPrice()
	fmt.Println(gasprice)
	return gasprice
}

//get block number
func GetBlockByNumber()  {
	connection := Tom_Manager

	block,err:=connection.Man.GetBlockByNumber(big.NewInt(116095),false)
	if err!=nil {
		fmt.Println("err:",err)
	}

	for _,txs := range block.Transactions {
		for _,tx := range txs{
			fmt.Println(tx)
		}
	}
}
func GetTransactionReceipt(txID string) (connection *manager.Manager) {

	receipt, err := connection.Man.GetTransactionReceipt(txID)
	if err != nil{
		fmt.Println(err)
	}
	if receipt.Status == false {
		fmt.Println("recipt_status == false")
	}
	fmt.Println(receipt)

	return
}
func main() {
	//app, port := vehicle()
	//app.Run(iris.Addr("localhost:"+port), iris.WithoutServerError(iris.ErrServerClosed))

	from := "MAN.CrsnQSJJfGxpb2taGhChLuyZwZJo"
	to := "MAN.3qQQqfzBdwBjpauj6ght4G8E6o1yQ"
	//check the validity of MAN address
	isok := Accounts.CheckIsManAddress(from)
	if !isok{
		return
	}
	SendStringTx(from, to, 1, 21000, 18e9)
	SendTx(from, to, 1, 21000, 18e9)
	GetBalance(from)
	CreatKeystore()
	GenManAddress()
	GetBlockByNumber()
	GetGasPrice()
}