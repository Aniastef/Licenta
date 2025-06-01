// __mocks__/recoil.js
// Mock userAtom for testing purposes
export const useRecoilValue = (atom) => {
  if (atom.key === 'userAtom') {
    return { _id: 'mockUserId123', firstName: 'Test', lastName: 'User' }; // Return a mock user
  }
  return null;
};

// You might need to mock other Recoil exports if your components use them
export const atom = jest.fn();
export const selector = jest.fn();