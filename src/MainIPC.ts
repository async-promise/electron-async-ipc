import { EventEmitter } from 'events'

import { ipcMain, BrowserWindow, webContents } from 'electron'

class MainIPC {
	static instance: MainIPC
	private eventEmitter: EventEmitter = new EventEmitter()

	constructor() {
		if (!MainIPC.instance) {
			this.eventEmitter = new EventEmitter()
			MainIPC.instance = this
		}
		return MainIPC.instance
	}

	async invokeMain(channel: string, ...args: any[]) {
		return new Promise(resolve => {
			this.eventEmitter.once(`${channel}-reply`, result => {
				resolve(result)
			})
			this.eventEmitter.emit(channel, ...args)
		})
	}

	handleMainOnce(channel: string, handler: (...args: any[]) => Promise<any>) {
		this.eventEmitter.once(channel, async (...args) => {
			const result = await handler(...args)
			this.eventEmitter.emit(`${channel}-reply`, result)
		})
	}

	handleMain(channel: string, handler: (...args: any[]) => Promise<any>) {
		this.eventEmitter.on(channel, async (...args) => {
			const result = await handler(...args)
			this.eventEmitter.emit(`${channel}-reply`, result)
		})
	}

	invokeRenderer(webContents: Electron.WebContents, channel: string, ...args: any[]): Promise<any> {
		return new Promise(resolve => {
			const sendMessage = () => {
				ipcMain.once(`${channel}-reply`, (event, result) => {
					resolve(result)
				})
				webContents.send(channel, ...args)
			}

			// 等待渲染进程加载完成后再推送，否则会导致渲染进程收不到消息
			if (webContents.isLoading()) {
				webContents.once('did-finish-load', () => {
					setTimeout(() => sendMessage())
				})
			} else {
				sendMessage()
			}
		})
	}

	invokeAllRenderer(channel: string, ...args: any[]): Promise<any> {
		return new Promise(resolve => {
			webContents.getAllWebContents().forEach(webContent => {
				const sendMessage = () => {
					ipcMain.once(`${channel}-reply`, (event, result) => {
						resolve(result)
					})
					webContent.send(channel, ...args)
				}

				// 等待渲染进程加载完成后再推送，否则会导致渲染进程收不到消息
				if (webContent.isLoading()) {
					webContent.once('did-finish-load', () => {
						setTimeout(() => sendMessage())
					})
				} else {
					sendMessage()
				}
			})
		})
	}

	handleRendererOnce(channel: string, handler: (...args: any[]) => Promise<any>) {
		ipcMain.once(channel, async (event, ...args: any[]) => {
			const result = await handler(...args)
			event.sender.send(`${channel}-reply`, result)
		})
	}

	handleRenderer(channel: string, handler: (...args: any[]) => Promise<any>) {
		ipcMain.handle(channel, async (event, ...args: any[]) => {
			return await handler(...args)
		})
	}

	relayMessage() {
		ipcMain.on('relay-message', (event, { targetWindowId, channel, args }) => {
			if (targetWindowId) {
				const targetWindow = BrowserWindow.fromId(targetWindowId)
				if (targetWindow) {
					targetWindow.webContents.send(channel, ...args)
				}
			} else {
				BrowserWindow.getAllWindows().forEach(window => {
					window.webContents.send(channel, ...args)
				})
			}
		})

		ipcMain.on('relay-reply', (event, { originalChannel, result }) => {
			// 所有渲染进程都会接收 ${originalChannel}-reply 事件，要求仅需要的渲染进程处理该事件的回复。
			// 这样可以避免需要指定窗口 ID 回复消息，并确保消息能够正确传递和接收
			BrowserWindow.getAllWindows().forEach(window => {
				window.webContents.send(`${originalChannel}-reply`, result)
			})
		})
	}
}

const mainIPC = new MainIPC()
mainIPC.relayMessage()

export = mainIPC
