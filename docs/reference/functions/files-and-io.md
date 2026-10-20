---
title: Files and I/O
summary: File, directory and path functions, plus ZIP and archive functions.
description: File, directory and path functions, plus ZIP and archive functions.
icon: phosphor-duotone:folder-open
order: 11
---

# Files and I/O

File, directory and path functions, plus ZIP and archive functions. 44 entries. This page is generated from the MatchBox source; see the [function reference index](index.md) for how to read the tables and what each gate means.

| Function | Forms | Gate | Notes |
| --- | --- | --- | --- |
| `compress` | `compress( ... )` | `bif-zip` |  |
| `contractPath` | `contractPath( ... )` | `bif-io` |  |
| `createTempDirectory` | `createTempDirectory( ... )` | `bif-io` |  |
| `createTempFile` | `createTempFile( ... )` | `bif-io` |  |
| `directoryCopy` | `directoryCopy( ... )` | `bif-io` |  |
| `directoryCreate` | `directoryCreate( ... )` | `bif-io` |  |
| `directoryDelete` | `directoryDelete( ... )` | `bif-io` |  |
| `directoryExists` | `directoryExists( ... )` | `bif-io` | Returns true when the directory exists. |
| `directoryList` | `directoryList( ... )` | `bif-io` |  |
| `directoryMove` | `directoryMove( ... )` | `bif-io` |  |
| `directoryRename` | `directoryRename( ... )` | `bif-io` |  |
| `expandPath` | `expandPath( ... )` | `bif-io` |  |
| `extract` | `extract( ... )` | `bif-zip` |  |
| `fileAppend` | `fileAppend( ... )` | `bif-io` |  |
| `fileClose` | `fileClose( ... )` | `bif-io` |  |
| `fileCopy` | `fileCopy( ... )` | `bif-io` |  |
| `fileCreateSymlink` | `fileCreateSymlink( ... )` | `bif-io` |  |
| `fileDelete` | `fileDelete( ... )` | `bif-io` |  |
| `fileExists` | `fileExists( ... )` | `bif-io` | Returns true when the file exists. |
| `fileGetMimeType` | `fileGetMimeType( ... )` | `bif-io` |  |
| `fileInfo` | `fileInfo( ... )` | `bif-io` |  |
| `fileIsEOF` | `fileIsEOF( ... )` | `bif-io` | Always fails in this version with the error "fileIsEOF() is not yet implemented: file handle infrastructure required". |
| `fileMove` | `fileMove( ... )` | `bif-io` |  |
| `fileOpen` | `fileOpen( ... )` | `bif-io` |  |
| `filePublishExclusive` | `filePublishExclusive( ... )` | `bif-io` |  |
| `fileRead` | `fileRead( ... )` | `bif-io` |  |
| `fileReadLine` | `fileReadLine( ... )` | `bif-io` |  |
| `fileSeek` | `fileSeek( ... )` | `bif-io` | Always fails in this version with the error "fileSeek() is not yet implemented: file handle infrastructure required". |
| `fileSetAccessMode` | `fileSetAccessMode( ... )` | `bif-io` |  |
| `fileSetAttribute` | `fileSetAttribute( ... )` | `bif-io` |  |
| `fileSetExecutable` | `fileSetExecutable( ... )` | `bif-io` |  |
| `fileSetLastModified` | `fileSetLastModified( ... )` | `bif-io` |  |
| `fileWrite` | `fileWrite( ... )` | `bif-io` |  |
| `fileWriteExclusive` | `fileWriteExclusive( ... )` | `bif-io` |  |
| `fileWriteLine` | `fileWriteLine( ... )` | `bif-io` |  |
| `getCanonicalPath` | `getCanonicalPath( ... )` | `bif-io` |  |
| `getDirectoryFromPath` | `getDirectoryFromPath( ... )` | `bif-io` |  |
| `getFileFromPath` | `getFileFromPath( ... )` | always |  |
| `getFileInfo` | `getFileInfo( ... )` | `bif-io` |  |
| `getTempDirectory` | `getTempDirectory( ... )` | `bif-io` |  |
| `getTempFile` | `getTempFile( ... )` | `bif-io` |  |
| `isZipFile` | `isZipFile( ... )` | `bif-zip` |  |
| `loadProperties` | `loadProperties( ... )` | always |  |
| `propertyFile` | `propertyFile( ... )` | `bif-io` |  |
