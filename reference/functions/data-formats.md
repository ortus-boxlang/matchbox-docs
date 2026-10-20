---
title: JSON, YAML, TOML and XML
summary: Serialization and parsing of JSON, YAML, TOML and XML.
description: Serialization and parsing of JSON, YAML, TOML and XML.
icon: phosphor-duotone:file-code
order: 12
---

# JSON, YAML, TOML and XML

Serialization and parsing of JSON, YAML, TOML and XML. 27 entries. This page is generated from the MatchBox source; see the [function reference index](index.md) for how to read the tables and what each gate means.

| Function | Forms | Gate | Notes |
| --- | --- | --- | --- |
| `dataNavigate` | `dataNavigate( ... )` | always |  |
| `deserializeJSON` | `deserializeJSON( ... )`, `string.fromJSON( ... )` | always | Parses a JSON string into structs, arrays and simple values. |
| `deserializeTOML` | `deserializeTOML( ... )` | always | Parses a TOML string into structs, arrays and simple values. |
| `deserializeYAML` | `deserializeYAML( ... )` | always | Parses a YAML string into structs, arrays and simple values. |
| `isJSON` | `isJSON( ... )` | always | Returns true when the string is valid JSON. |
| `isXML` | `isXML( ... )` | always | Returns true for an XML document or a string of well-formed XML. |
| `isXmlAttribute` | `isXmlAttribute( ... )` | always |  |
| `isXMLDoc` | `isXMLDoc( ... )` | always |  |
| `isXMLElem` | `isXMLElem( ... )` | always |  |
| `isXmlElement` | `isXmlElement( ... )` | always |  |
| `isXMLNode` | `isXMLNode( ... )` | always |  |
| `isXMLRoot` | `isXMLRoot( ... )` | always |  |
| `jsonDeserialize` | `jsonDeserialize( ... )` | always | Parses a JSON string. |
| `jsonPrettify` | `jsonPrettify( ... )` | always | Reformats a JSON string with indentation. |
| `jsonSerialize` | `jsonSerialize( ... )` | always | Converts a value to a JSON string. |
| `serializeJSON` | `serializeJSON( ... )`, `array.toJSON( ... )`, `boolean.toJSON( ... )`, `number.toJSON( ... )`, `string.toJSON( ... )`, `struct.toJSON( ... )` | always | Converts a value to a JSON string. |
| `toScript` | `toScript( ... )` | always |  |
| `xmlChildPos` | `xmlChildPos( ... )`, `xml.childPos( ... )` | always |  |
| `xmlElemNew` | `xmlElemNew( ... )` | always |  |
| `xmlFormat` | `xmlFormat( ... )`, `string.xmlFormat( ... )`, `xml.xmlFormat( ... )` | always | Escapes text for use in XML. |
| `xmlGetNodeType` | `xmlGetNodeType( ... )`, `array.getNodeType( ... )`, `array.xmlGetNodeType( ... )`, `xml.getNodeType( ... )` | always |  |
| `xmlNew` | `xmlNew( ... )` | always |  |
| `xmlParse` | `xmlParse( ... )` | always | Parses an XML string into an XML document. |
| `xmlSearch` | `xmlSearch( ... )`, `xml.search( ... )` | always |  |
| `xmlSize` | `xmlSize( ... )`, `xml.size( ... )` | always |  |
| `xmlTransform` | `xmlTransform( ... )`, `xml.transform( ... )` | always |  |
| `xmlValidate` | `xmlValidate( ... )` | always |  |
