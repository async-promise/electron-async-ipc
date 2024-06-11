import RendererIPC from './dist/RendererIPC';

declare const AsyncIPC: RendererIPC & {
  default: RendererIPC;
};
export = AsyncIPC;
