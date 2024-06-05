# electron-async-ipc

[![NPM version](https://badge.fury.io/js/electron-log.svg)](https://badge.fury.io/js/electron-log)

✨ Asynchronous electron ipc invocation mechanism .

## 🌿 Installation

Install with [npm](https://npmjs.org/package/electron-log):

```shell
npm i electron-async-ipc --save
```

    
## 🌿 Usage

### Main process

```js
import 'electron-async-ipc/main'
```

### Renderer process

If a bundler is used, you can just import the module:


```typescript
import RendererIPC from 'electron-async-ipc/renderer'
```

## 🌿 Example

> #### 1. The main process can send a message to the main process and receive a callback as shown in the following example

```js
// MainA:
const res = await MainIPC.invokeMain(`${channel}`, ...args)

// MainB:
MainIPC.handleMain(`${channel}`, async (...args) => {
	return res
})
```

> #### 2. The main process can send a message to the rendering process and receive a callback as shown in the following example

```js
// MainA:
const res = await MainIPC.invokeRenderer(`${webContents}`, `${channel}`, ...args)
const res = await MainIPC.invokeAllRenderer(`${channel}`, ...args)

// RendererB:
RendererIPC.handleMain(`${channel}`, async (...args) => {
	return res
})
```

> #### 3. The rendering process can send a message to the rendering process and receive a callback as shown in the following example

```js
// RendererA:
const res = await RendererIPC.invokeRenderer(`${channel}`, ...args)

// RendererB:
RendererIPC.handleRenderer(`${channel}`, async (...args) => {
	return res
})
```

> #### 4. The rendering process can send a message to the main process and receive a callback as shown in the following example

```js
// RendererA:
const res = await RendererIPC.invokeMain(`${channel}`, ...args)

// MainB:
MainIPC.handleRenderer(`${channel}`, async (...args) => {
	return res
})
```
