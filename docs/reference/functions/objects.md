---
title: Native Object Methods
summary: Methods of the objects that built-in functions and the runtimes return.
description: Methods of the objects that built-in functions and the runtimes return.
icon: phosphor-duotone:cube
order: 21
---

Some built-in functions return native objects (a query, a file handle, a watcher, ...). These objects have their own methods, listed here by object. Method names are matched without regard to case. Web server, Lambda and TUI objects are only available in those runtimes or builds; the gate is shown for each object.

## Cache

Gate: always. 1 method.

`getName`

## CacheName

Gate: always. 1 method.

`getName`

## Executor

Gate: always. 2 methods.

`name`, `submit`

## File

Gate: `bif-io`. 4 methods.

Created by fileOpen.

`close`, `readLine`, `toString`, `writeLine`

## LambdaContext

Gate: `matchbox-lambda-runner`. 11 methods.

`getAwsRequestId`, `getClientContext`, `getFunctionName`, `getFunctionVersion`, `getIdentity`, `getInvokedFunctionArn`, `getLogger`, `getLogGroupName`, `getLogStreamName`, `getMemoryLimitInMb`, `getRemainingTimeInMillis`

## LambdaLogger

Gate: `matchbox-lambda-runner`. 1 method.

`log`

## Middleware

Gate: `server`. 1 method.

`buildStaticFiles`

## NextMiddleware

Gate: `server`. 1 method.

`run`

## Query

Gate: `bif-datasource`. 34 methods.

Created by queryNew. The properties recordCount and columnCount are available.

`addColumn`, `addRow`, `append`, `clear`, `columnArray`, `columnCount`, `columnData`, `columnExists`, `columnList`, `currentRow`, `deleteColumn`, `deleteRow`, `getCell`, `getColumnList`, `getColumnMeta`, `getColumnNames`, `getResult`, `getRow`, `getRowAsStruct`, `insertAt`, `keyExists`, `len`, `length`, `prepend`, `recordCount`, `reverse`, `rowSwap`, `setCell`, `setRow`, `size`, `slice`, `sortColumn`, `toArrayOfStructs`, `toSet`

## RequestContext

Gate: `server`. 40 methods.

`clearSession`, `getCollection`, `getCookie`, `getCurrentRoute`, `getExcept`, `getHttpContent`, `getHttpCookie`, `getHttpHeader`, `getHttpMethod`, `getOnly`, `getPath`, `getPrivateCollection`, `getPrivateValue`, `getRequestMethod`, `getRouteParams`, `getSession`, `getSessionValue`, `getUrl`, `getValue`, `invalidateSession`, `isAjax`, `isJson`, `paramPrivateValue`, `paramSessionValue`, `paramValue`, `privateValueExists`, `renderData`, `renderHtml`, `renderJson`, `renderTemplate`, `renderText`, `sessionExists`, `setCookie`, `setHttpCookie`, `setHttpHeader`, `setHttpStatus`, `setSessionValue`, `setValue`, `setView`, `valueExists`

## RouteGroup

Gate: `server`. 9 methods.

`buildWebhook`, `delete`, `get`, `group`, `patch`, `post`, `put`, `use`, `webhook`

## ServerApp

Gate: `server`. 11 methods.

`buildWebhook`, `delete`, `enableWebsockets`, `get`, `group`, `listen`, `patch`, `post`, `put`, `use`, `webhook`

## Soap

Gate: always. 2 methods.

Created by soap. getOperations always returns add, subtract, multiply and divide.

`getOperations`, `getStatistics`

## StringBuilder

Gate: always. 18 methods.

Created by stringBuilderNew. The append method returns the builder, so calls can be chained.

`append`, `clear`, `contains`, `containsNoCase`, `delete`, `endsWith`, `find`, `findNoCase`, `insert`, `left`, `mid`, `prepend`, `replace`, `reverse`, `right`, `startsWith`, `toString`, `trim`

## tui.App

Gate: `bif-tui`. 3 methods.

`is_quit`, `run`, `stop`

## tui.Block

Gate: `bif-tui`. 5 methods.

`border`, `build`, `setWidget`, `title`, `zindex`

## tui.Button

Gate: `bif-tui`. 4 methods.

`build`, `label`, `onClick`, `zindex`

## tui.HBox

Gate: `bif-tui`. 3 methods.

`add`, `build`, `zindex`

## tui.Input

Gate: `bif-tui`. 5 methods.

`build`, `placeholder`, `prompt`, `value`, `zindex`

## tui.List

Gate: `bif-tui`. 6 methods.

`addItem`, `build`, `clear`, `selected`, `style`, `zindex`

## tui.ProgressBar

Gate: `bif-tui`. 4 methods.

`build`, `completed`, `total`, `zindex`

## tui.Table

Gate: `bif-tui`. 1 method.

`build`

## tui.Text

Gate: `bif-tui`. 6 methods.

`align`, `bold`, `build`, `color`, `text`, `zindex`

## tui.TUI

Gate: `bif-tui`. 14 methods.

`begin_frame`, `clear`, `clear_widgets`, `end_frame`, `init`, `is_dirty`, `poll_event`, `print`, `render_widget`, `render_widget_z`, `set_dirty`, `set_mouse`, `shutdown`, `size`

## tui.VBox

Gate: `bif-tui`. 3 methods.

`add`, `build`, `zindex`

## Watcher

Gate: always. 9 methods.

`getName`, `getStateAsString`, `isRunning`, `isStopped`, `poll`, `restart`, `shutdown`, `start`, `stop`

## WatcherEvent

Gate: always. 4 methods.

`getKind`, `getPath`, `getRelativePath`, `getWatchRoot`

## WatcherName

Gate: always. 1 method.

`getName`

## web

Gate: `server`. 1 method.

`server`

## WebhookBuilder

Gate: `server`. 8 methods.

`path`, `prefix`, `replayHeader`, `replayTtlSeconds`, `secret`, `signatureHeader`, `timestampHeader`, `toleranceSeconds`

## WebSocketChannel

Gate: `server`. 13 methods.

`broadcastBytes`, `broadcastJson`, `broadcastMessage`, `broadcastText`, `close`, `getHttpHeader`, `getId`, `getPath`, `getUrl`, `sendbytes`, `sendjson`, `sendmessage`, `sendtext`
