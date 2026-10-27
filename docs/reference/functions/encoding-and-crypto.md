---
title: Encoding and Crypto
summary: Hashing, encryption, Base64, binary encoding and character sets.
description: Hashing, encryption, Base64, binary encoding and character sets.
icon: phosphor-duotone:lock-key
order: 13
---

Hashing, encryption, Base64, binary encoding and character sets. 18 entries. This page is generated from the MatchBox source; see the [function reference index](index.md) for how to read the tables and what each gate means.

| Function | Forms | Gate | Notes |
| --- | --- | --- | --- |
| `binaryDecode` | `binaryDecode( ... )` | always | Decodes text such as hex into binary data. |
| `binaryEncode` | `binaryEncode( ... )` | always | Encodes binary data as text, for example "hex". |
| `bytesGet` | `bytesGet( ... )` | always |  |
| `bytesLen` | `bytesLen( ... )` | always |  |
| `bytesNew` | `bytesNew( ... )` | always |  |
| `bytesSet` | `bytesSet( ... )` | always |  |
| `charsetDecode` | `charsetDecode( ... )`, `string.charsetDecode( ... )` | always |  |
| `charsetEncode` | `charsetEncode( ... )` | always |  |
| `decrypt` | `decrypt( ... )` | `bif-crypto` | Decrypts a value produced by encrypt. |
| `encrypt` | `encrypt( ... )` | `bif-crypto` | Encrypts a string: encrypt( value, key, algorithm, encoding ). |
| `generatePBKDFKey` | `generatePBKDFKey( ... )` | `bif-crypto` |  |
| `generateSecretKey` | `generateSecretKey( ... )` | `bif-crypto` | Generates a key for the given algorithm, for example "AES". |
| `hash` | `hash( ... )`, `string.hash( ... )` | `bif-crypto` | Returns the hash as hex text; MD5 unless an algorithm is given. |
| `hash40` | `hash40( ... )` | `bif-crypto` | Returns the SHA-1 hash of a string as hex. |
| `hmac` | `hmac( ... )`, `string.hmac( ... )` | `bif-crypto` | Returns the HMAC of a message: hmac( message, key, algorithm ). |
| `toBase64` | `toBase64( ... )` | always | Encodes a string or binary as Base64. |
| `toBinary` | `toBinary( ... )` | always | Decodes a Base64 string to binary. |
| `urlEncodedFormat` | `urlEncodedFormat( ... )`, `string.urlEncodedFormat( ... )` | always | Percent-encodes a string for use in a URL. |
