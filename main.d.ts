import MainIPC from './dist/MainIPC';

declare const AsyncIPC: MainIPC & {
  default: MainIPC;
};
export = AsyncIPC;
