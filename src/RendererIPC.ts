import { ipcRenderer, IpcRendererEvent } from 'electron'

class RendererIPC {
	static invokeMainOnce(channel: string, ...args: any[]): Promise<any> {
		return new Promise(resolve => {
			ipcRenderer.once(`${channel}-reply`, (event: IpcRendererEvent, result: any) => {
				resolve(result)
			})
			ipcRenderer.send(channel, ...args)
		})
	}

	static async invokeMain(channel: string, ...args: any[]): Promise<any> {
		return await ipcRenderer.invoke(channel, ...args)
	}

	static handleMainOnce(channel: string, handler: (...args: any[]) => Promise<any>) {
		ipcRenderer.once(channel, async (event: IpcRendererEvent, ...args: any[]) => {
			const result = await handler(...args)
			ipcRenderer.send(`${channel}-reply`, result)
		})
	}

	static handleMain(channel: string, handler: (...args: any[]) => Promise<any>) {
		ipcRenderer.on(channel, async (event: IpcRendererEvent, ...args: any[]) => {
			const result = await handler(...args)
			ipcRenderer.send(`${channel}-reply`, result)
		})
	}

	static invokeRenderer(channel: string, ...args: any[]): Promise<any> {
		return new Promise(resolve => {
			ipcRenderer.once(`${channel}-reply`, (event: IpcRendererEvent, result: any) => {
				resolve(result)
			})
			ipcRenderer.send('relay-message', { channel, args })
		})
	}

	// 不常用，渲染层很难知道主进程窗口的 ID
	static invokeRendererByWinId(targetWindowId: number, channel: string, ...args: any[]): Promise<any> {
		return new Promise(resolve => {
			ipcRenderer.once(`${channel}-reply`, (event: IpcRendererEvent, result: any) => {
				resolve(result)
			})
			ipcRenderer.send('relay-message', { targetWindowId, channel, args })
		})
	}

	static handleRendererOnce(channel: string, handler: (...args: any[]) => Promise<any>) {
		ipcRenderer.once(channel, async (event: IpcRendererEvent, ...args: any[]) => {
			const result = await handler(...args)
			ipcRenderer.send('relay-reply', { originalChannel: channel, result })
		})
	}

	static handleRenderer(channel: string, handler: (...args: any[]) => Promise<any>) {
		ipcRenderer.on(channel, async (event: IpcRendererEvent, ...args: any[]) => {
			const result = await handler(...args)
			ipcRenderer.send('relay-reply', { originalChannel: channel, result })
		})
	}
}

export = RendererIPC
