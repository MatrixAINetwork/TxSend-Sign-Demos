
### Account Address Generation Rules of MATRIX chain

+ Create a random private key (32 bytes)
+ ECDSA-secp256k1 (Elliptic Curve Digital Signature Algorithm) is used to map the private key to public key (64 bytes)
+ The last 20 bytes of the public key will be taken as basic address
+ The basic address will be Base58 encoded and then a pre-fix of ‘MAN.’ will be added
+ CRC8 check will be done on combined data and the check bit will be put at the end of the address to generate the MATRIX account


The MATRIX address looks like this:

    MAN.2uTgkPiGX9ziKuAKyeeWBt8duiBRH 


