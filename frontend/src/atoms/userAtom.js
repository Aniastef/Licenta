import { atom } from 'recoil';
import { recoilPersist } from 'recoil-persist';

const { persistAtom } = recoilPersist({
  key: 'art-corner',
  storage: localStorage,
});

const userAtom = atom({
  key: 'userAtom',
  default: null,
  effects_UNSTABLE: [persistAtom],
});

export default userAtom;
